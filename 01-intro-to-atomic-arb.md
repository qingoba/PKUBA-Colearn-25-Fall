## Intro to Atomic Arb

### 你能学到什么

1. 如何看懂一个真实的 atomic arbitrage 交易，理解每一步的合约调用
2. 如何与不同类型的 DeFi 协议交互——不只是 Uniswap，还包括小众的 earning protocol
3. 类似于 Peapods 的 earning protocol 如何通过 token wrapping 生息
4. 交易 re-simulation 技术——在本地 fork 链上状态并重放交易
5. 编写一个能与多个 DeFi 协议交互的套利合约
6. Uniswap V3 的 swap 机制（你已经学过 V2，V3 的核心区别是引入了 concentrated liquidity）
7. Uniswap flash swap 的原理与使用

### 任务要求

给定一笔真实的 atomic arbitrage tx，你需要：
1. 分析并理解整笔交易的套利路径
2. 编写合约复刻该套利路径
3. 在本地 re-simulate，得到**一模一样**的套利 profit

你要复刻的 tx：[0x9edea0b66aece76f0bc7e185f9ce5cac81ce41bdd1ec4d3cf1907274bc8aa730](https://etherscan.io/tx/0x9edea0b66aece76f0bc7e185f9ce5cac81ce41bdd1ec4d3cf1907274bc8aa730)

> 该交易发生在 block `23042800`，由一个 MEV bot 执行，涉及多个 DeFi 协议的组合调用。

---

### 你要解决的问题

#### Step 1：理解 Atomic Arbitrage 的概念

**什么是 atomic arbitrage？**

"Atomic" 意味着整个套利操作在**一笔交易内**完成——要么全部成功，要么全部回滚（revert），不会出现"买了但没卖出去"的情况。这是 DeFi 可组合性（composability）带来的独特优势：你可以在一笔 tx 里调用任意多个合约，它们共享同一个 execution context。

**为什么会存在套利机会？**

不同的 DEX 对同一个 token pair 的定价可能不同。比如 token A 在 pool X 的价格是 1.05 ETH，在 pool Y 的价格是 1.00 ETH，那你就可以在 pool Y 买入、pool X 卖出，赚取差价。这种价差通常是由大额 swap 造成的价格冲击（price impact）引起的，并且只在很短的时间窗口内存在。

**Block Builder、Bribe 与净利润**

套利机会稍纵即逝，bot 需要保证自己的 tx **在正确的位置被打包**。以太坊在 PBS（Proposer-Builder Separation）架构下，专门的 block builder 负责构建区块、排列 tx 顺序。MEV bot 通常通过以下方式与 builder 合作：

- **公开 mempool + priority fee（gas bribe）**：直接提高 gas price，让 builder 优先打包自己的 tx。简单但竞争激烈，bot 之间会互相抬价（priority gas auction）
- **私有通道（如 MEV-Boost / builder private orderflow）**：将 tx 直接发给 builder，不经过公开 mempool，同时附上 bribe（额外支付给 builder 的 ETH）。好处是 tx 不会被其他 bot 抢跑（frontrun）

**净利润的计算：**

```
net profit = amountOut - amountIn - gas fee - bribe
```

- `amountOut - amountIn`：套利的毛利润（gross profit）
- `gas fee = gasUsed × gasPrice`：执行 tx 消耗的 gas 成本
- `bribe`：额外支付给 builder 的费用（如果走私有通道）

只有 net profit > 0，这笔套利才值得执行。在竞争激烈的场景下，多个 bot 同时发现同一个机会，最终由出价最高（bribe 最大）的 bot 胜出——这也是为什么 MEV 利润大部分最终流向了 builder 和 validator，而不是 bot 本身。

**学习资源：**
- [MEV101 视频](https://www.youtube.com/watch?v=QcfWrRmhXls)：MEV 的基础概念入门
- [EigenPhi](https://eigenphi.io/)：MEV 交易分析工具，可以直观看到套利路径

---

#### Step 2：看懂这笔交易

这一步的目标是**搞清楚这笔 tx 里到底发生了什么**——token 如何在各个合约之间流转，最终形成一条套利路径。

分析一笔 tx 有多个维度，建议从简单到复杂逐层深入：

---

**第一层：Event Log（最直观的入口）**

每个 ERC-20 的 `transfer` 都会 emit 一个 `Transfer` event，记录了 from、to、amount。从这些 event 里你可以完整还原 token 的流转顺序，不需要任何高级工具。

操作：在 [Etherscan](https://etherscan.io/tx/0x9edea0b66aece76f0bc7e185f9ce5cac81ce41bdd1ec4d3cf1907274bc8aa730) 上切换到 **"Logs"** tab，或者直接看 tx 页面的 **"ERC-20 Tokens Transferred"** 摘要区域。

注意观察：
- 每一笔 transfer 的 from/to 是谁？是 MEV bot、pool、还是某个 vault 合约？
- 哪些 transfer 是从 zero address 转出（`mint`）或转入 zero address（`burn`）？**这是 token wrapping 的信号**——有新 token 被铸造出来，说明某个 vault 合约收到了你的 token 并发行了新的 wrapped token

---

**第二层：Tx Graph（可视化资金流向）**

如果觉得逐条梳理 event log 比较繁琐，可以借助可视化工具直接看资金流图。

| 工具 | 特点 |
|------|------|
| [EigenPhi](https://eigenphi.io/) | MEV 专用，自动识别套利路径并标注 profit |
| [Blocksec Phalcon](https://phalcon.blocksec.com/) | 资金流向图清晰，标注合约名称 |
| [Sentio](https://app.sentio.xyz/) | tx graph + balance changes，信息最全 |

在这些工具里你能直观看到 token 在各地址之间的流动方向，比手动看 log 快很多。

---

**第三层（进阶）：Call Trace**

Call trace 是 tx 执行过程中完整的合约调用树——每一个内部调用、每一个参数都可见。这比 event log 信息量大得多，但也更难读懂。

当你通过前两层已经理解了套利路径的大致逻辑之后，再用 call trace 来确认每一步具体调用了哪个合约的哪个函数、传了什么参数——这对后面写合约非常重要。

推荐工具：[Sentio](https://app.sentio.xyz/) 的 **Call Trace** tab，或 [Tenderly](https://dashboard.tenderly.co/) 的 debugger。

> **提示：** 读 call trace 时，关注每一个 `CALL` 的目标地址和 function selector（前 4 bytes）。遇到看不懂的合约，去 Etherscan 上搜地址，看它是什么协议的什么合约。

---

#### Step 3：列出套利路径

现在你需要把 Step 2 中观察到的信息整理成一条清晰的**套利路径**。

**建模方式：**
- **节点**：token（如 WETH、EMP、pEMP 等）
- **边**：协议操作（如 Uniswap V3 swap、Peapods bond 等）
- 最终路径会形成一个**环**——从某个 token 出发，经过若干步操作，最终回到同一个 token，且数量增加

**你需要回答的问题：**
1. 起始和结束 token 是什么？（提示：观察 MEV bot 的 balance changes，最终净增加的是哪个 token）
2. 路径中涉及了几个不同的协议？分别是什么？
3. 哪些 token 是其他 token 的"wrapped version"？它们之间是什么关系？

**路径框架（填空）：**

```
[起始 token] →[协议 1: ???]→ [token B] →[协议 2: ???]→ [token C] →[协议 3: ???]→ [token D] →[协议 4: ???]→ [起始 token]
```

> **提示：** 路径中不全是 DEX swap，有些操作是 token wrapping/unwrapping，最终回到 WETH。

> **进阶提示：** 在 Etherscan 上查看这笔 tx 的 "ERC-20 Tokens Transferred" 部分，尝试按顺序梳理这些 transfer，区分哪些是 swap（交换），哪些是 mint/burn（wrapping/unwrapping），把路径中出现的所有 token 都找出来。

---

#### Step 4：深入了解 Peapods 协议

在梳理路径时你会发现，除了 Uniswap，这笔交易还涉及了 **Peapods Finance**——一个相对小众的 earning protocol。

> **声明：** Peapods 只是这笔 arb tx 碰巧用到的一个协议，我们选择这笔 tx 纯粹是因为它的套利路径基础、涉及的技术点全面，与 Peapods 本身没有任何关联。Peapods 并非主流 DeFi 协议，本任务对它的介绍**不构成任何投资建议**。这里的重点是学习如何读懂并与一个陌生协议交互——这个能力可以迁移到任何 DeFi 协议上。

**什么是 earning protocol？**

Earning protocol 的核心机制是 **token wrapping**：你把 base token（如 EMP）存入一个 vault 合约，获得对应的 wrapped token（如 pEMP）。这个 wrapped token 可以在之后赎回为更多的 base token——差价就是利息。类似的协议还有 Yearn（yToken）、ERC-4626 Vault 等。

**你需要掌握的接口（把 Peapods 当作黑盒来使用）：**

对于本任务，你只需要知道如何调用它，不需要深究内部实现：

- **Pod**：Peapods 中的 vault 合约，接收 base token，发放 pod token（pTKN）
- **`bond(address token, uint256 amount)`**：将 base token 存入 pod，获得 pod token
- **`debond(uint256 amount, address[] memory token, uint8[] memory percentage)`**：将 pod token 赎回为 base token

你需要在 Etherscan 上找到这笔 tx 中涉及的 Peapods 合约，弄清楚：
- `bond()` / `debond()` 的完整参数签名是什么？
- 调用前需要 `approve` 吗？

> **提示：** Peapods 的合约使用了 **Beacon Proxy** 模式。在 Etherscan 上你看到的可能是 proxy 合约，真正的逻辑在 implementation 合约中。点击 **"Read as Proxy"** / **"Write as Proxy"** 可以看到完整的函数列表。

**学习资源：**
- [Peapods 官方文档](https://docs.peapods.finance/)
- Etherscan → 合约地址 → "Contract" tab → "Write as Proxy"

---

**进阶：Peapods 如何为 depositor 产生收益？**

如果你对 earning protocol 的内在机制感兴趣，可以进一步思考：vault 里的 base token 是怎么增值的？

Peapods 的收益来源于 wrapping/unwrapping 时收取的手续费——每次有人 bond 或 debond，都会有一部分 token 留在 vault 里，而 pod token 的总发行量不变，所以每个 pod token 能赎回的 base token 数量就会随时间增加。

这正是这笔套利存在机会的根本原因：pEMP/EMP 的兑换比率与市场上 Uniswap 里的实际价格出现了偏差，bot 就可以从中套利。思考一下：**为什么会出现这个价差？是谁的操作导致了这个机会？**

---

#### Step 5：学习 Re-simulation 技术

Re-simulation 是指在本地**重放链上某个时刻的状态**，并在此基础上执行你自己的交易。这是 MEV 开发的核心技能之一。

**核心概念：Fork Testing**

[Foundry Book](https://book.getfoundry.sh/) 是 Foundry 的官方文档，遇到不熟悉的 cheatcode 或命令都可以在这里查。

Foundry 提供了强大的 fork 测试功能：它会通过 RPC 从远程节点拉取指定 tx 执行前的链上状态（账户余额、合约代码、storage 等），在本地构建一个"快照"，然后你可以在这个快照上执行任意交易。

**关键要点：**

1. **按 tx hash fork，而不是 block number。** Foundry 支持直接传入 tx hash 来创建 fork——它会自动将链上状态定位到该 tx **执行之前**的那一刻，不需要你手动推算 block number。

2. **RPC URL 从环境变量读取，不要硬编码。** 将 Alchemy 的 RPC URL 写入 `.env` 文件，在测试中用 `vm.envString("RPC_URL")` 读取。

3. **必须使用 Archive Node。** 普通的 full node 只保存最近 128 个 block 的完整 state。要访问历史 block 的 state，你需要 archive node。推荐使用 [Alchemy](https://www.alchemy.com/)（免费额度足够）

4. **正确的 fork 测试结构：** 在 `setUp()` 里创建 fork，在每个 test 函数里用 `vm.selectFork()` 切换，并用 `vm.warp()` 将时间推进一个 block，模拟在下一个 block 执行：

```solidity
contract ArbTest is Test {
    uint256 forkId;
    ArbBot bot;

    function setUp() public {
        // 按 tx hash fork，自动定位到该 tx 执行前的状态
        forkId = vm.createFork(
            vm.envString("RPC_URL"),
            bytes32(0x9edea0b66aece76f0bc7e185f9ce5cac81ce41bdd1ec4d3cf1907274bc8aa730)
        );
        bot = new ArbBot();
        vm.makePersistent(address(bot)); // 使 bot 合约在所有 fork 中持久存在
    }

    function test_arb() public {
        vm.selectFork(forkId);
        vm.warp(block.timestamp + 12); // 推进一个 block 的时间

        deal(WETH, address(bot), startAmount); // 设置初始 token 余额
        uint256 profit = bot.executeArb(/* 参数 */);
        console.log("profit", profit);
    }
}
```

5. **关于初始资金：** 真实的 MEV bot 通常使用 flash swap / flash loan 来获取初始资金（即先借后还，无需自有资金）。但在 simulation 中，你可以用 `deal` cheatcode 直接给你的合约设置初始 token 余额，跳过 flash swap 的步骤——这样更简单，且不影响套利路径的验证。

**运行测试：**

```bash
forge test --match-test test_arb -vvvv
```

> **替代方案：** 如果你熟悉 Go，也可以用 geth client 调用 `eth_simulateV1` 或 `debug_traceCall` 在 Go 中完成 re-simulation。但 Foundry 方案更适合新手入门。

---

#### Step 6：编写套利合约

现在你需要写一个 Solidity 合约，能够**依次与套利路径中涉及的所有协议交互**。

**输入约定：用 struct 描述每一跳**

套利路径的每一步（每一跳）可以用一个 struct 来描述，整条路径是一个 struct 数组。思考一下：**一跳需要哪些信息才能被合约执行？** 至少需要知道输入/输出 token 是什么、由哪个合约来执行这一跳、以及这一跳是哪种协议类型（合约需要根据协议类型来决定调用哪个接口）。你来定义这个 struct。

> **提示：** 对于 Peapods，负责执行这一跳的合约地址和 `tokenIn`/`tokenOut` 中的某一个是同一个地址——想想为什么，这能帮你理解 Peapods 的 token 设计。

**合约的基本结构：**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct Path { /* 自己定义 */ }

contract ArbBot {
    function executeExactInput(
        Path[] memory paths,
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        // 依次执行每一跳
        // 根据 path.protocolType（或你定义的字段名）dispatch 到对应协议的调用逻辑
    }
}
```

**每一步你需要弄清楚的事情：**

对于每一跳，你都需要知道：
1. 如何判断 `edge` 对应的是哪种协议？（可以根据 interface 来 dispatch）
2. 具体调用什么函数？参数怎么构造？
3. 需要提前做 token `approve` 吗？（大多数协议在转走你的 token 前需要 approval）
4. 返回值如何传给下一跳的 `amountIn`？

**关于 Uniswap V3（你可能不太熟悉）：**

你已经学过 Uniswap V2，V3 的核心区别是引入了 **concentrated liquidity**。对于 swap，V3 pool 直接调用：

```solidity
// MEV bot 直接调 pool，不走 Router
IUniswapV3Pool(path.edge).swap(
    recipient,
    zeroForOne,        // true = token0 换 token1，false 反之
    amountSpecified,   // 正数 = exact input
    sqrtPriceLimitX96, // simulation 中可设为边界值
    data               // callback data，传给 uniswapV3SwapCallback
);
```

注意：V3 使用 **callback 模式**——pool 执行 swap 后会回调你的合约 `uniswapV3SwapCallback()`，你在 callback 里把 token 转给 pool。你的合约必须实现这个 callback。

**关于 Uniswap V2（你比较熟悉）：**

先把 token 转到 pair 合约，再调用 `swap(uint amount0Out, uint amount1Out, address to, bytes data)`。

> **小贴士：** 不要一次性把整条路径写完再测。建议**逐步调试**——先让第一跳跑通，验证 amountOut 与链上一致，再加第二跳，以此类推。

---

#### Step 7：Re-simulate 并验证结果

**验证标准：**
- 输入与原 tx 相同的起始 token 和 amount
- 依次经过相同的 pool / 合约
- 最终输出的 token amount 与原 tx **完全一致**（wei 级别精确）

**运行和调试：**

```bash
forge test --match-test test_arb -vvvv
```

测试结构与 Step 5 一致，在 `test_arb()` 里验证 profit：

```solidity
function test_arb() public {
    vm.selectFork(forkId);
    vm.warp(block.timestamp + 12);

    // amountIn 从原 tx 中读取
    uint256 amountIn = /* ??? */;
    deal(WETH, address(bot), amountIn);

    // 构造 Path[]（参考 Step 6，地址从 call trace 中提取）
    Path[] memory paths = new Path[](/* ??? */);
    // paths[0] = Path({ ... });
    // ...

    uint256 amountOut = bot.executeExactInput(paths, amountIn);
    console.log("amountOut", amountOut);
    // amountOut 应与原 tx 的输出完全一致
    assertEq(amountOut, /* ??? */);
}
```

**如果 profit 对不上怎么办？**
- **对比 trace：** 用 `forge test -vvvv` 的输出与 Sentio 上的 call trace 逐步对比，找到第一个 amount 不一致的地方
- **检查 rounding：** Solidity 的整数除法会向下取整，不同协议的 rounding 方式可能不同
- **检查 approve：** 确认每一步调用前都做了正确的 token approval

---

### 参考答案

> **强烈建议你先独立完成 Step 1–3，再来看这部分。** 自己从 event logs 和 tx graph 中提取套利路径是本任务最核心的训练。

<details>
<summary>点击展开：完整套利路径</summary>

**套利路径：**

```
WETH → EMP → pEMP → pfWETH → WETH
```

| 步骤 | token 变化 | 协议 | 操作 | 合约地址 |
|------|-----------|------|------|----------|
| 1 | WETH → EMP | Uniswap V3 | flash swap（bot 先收到 EMP，在 callback 中还 WETH） | `0xe092769bc1fa5262d4f48353f90890dcc339bf80` |
| 2 | EMP → pEMP | Peapods | bond | `0x4343a06b930cf7ca0459153c62cc5a47582099e1` |
| 3 | pEMP → pfWETH | Uniswap V2 | swap | `0x9ff3226906eb460e11d88f4780c84457a2f96c3e` |
| 4 | pfWETH → WETH | Peapods | redeem | `0x395da89bdb9431621a75df4e2e3b993acc2cab3d` |

> **Flash swap 说明：** 真实 bot 无需自有资金。Uniswap V3 的 `swap()` 本质上就是 flash swap——pool 先把 EMP 发给 bot，bot 执行步骤 2-4 完成套利，最后在 `uniswapV3SwapCallback()` 中把 WETH 还给 pool，净赚差价。我们在 simulation 中用 `deal()` 跳过这一步，直接给合约设置初始 WETH 余额，效果等价。


**Ground truth（re-simulate 的验证目标）：**

| | wei |
|---|---|
| amountIn | `562611020353505727` |
| amountOut | `569640303749166946` |
| gross profit | `7029283395661219` |

</details>

---

### Challenge：统计这个 MEV bot 的月收益

**任务：**

1. 用 Go 写一个函数，输入一个 tx hash，输出该笔交易的：
   - **Gross revenue**：套利毛收入（`amountOut - amountIn`）
   - **Net profit**：净利润（`gross revenue - gas fee - bribe`）
   - **Margin**：利润率（`net profit / gross revenue`）

2. 找到这个 bot 还在活跃的某个月，统计它当月所有 arb tx 的总净利润。

**一些提示：**

- 这个 bot 的合约地址可以从上面那笔 tx 中读取（`to` 字段）
- 用 [EigenPhi](https://eigenphi.io/) 搜索该 bot 地址，可以看到它所有历史 arb tx 的列表及统计数据，从中选定一个活跃月份
- Gas fee = `gasUsed × effectiveGasPrice`，两者都在 tx receipt 里
- Bribe（priority fee）= `effectiveGasPrice - baseFeePerGas`，`baseFeePerGas` 在 block header 里
- 不同 bot 的利润结构差异很大——这个函数是针对这个特定 bot 设计的，不一定能直接套用到其他 bot 上
- 该 bot 目前已停止运行，选一个它仍在活跃的月份来统计
