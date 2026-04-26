---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区


# 你的名字

1. 自我介绍
  姚帅，前沿交叉学科研究院23级博士生，对DeFi感兴趣
2. 你认为你会完成这次共学小组吗？
  当然
3. 你感兴趣的小组
  DeFi
4. 你的联系方式（Wechat or Telegram）
  Wechat：13095680918
5. 质押的交易哈希
  0x0e29fcc4d7dccf18284f711c24421f11a18d87b30dacaa67406cba1c4b6ff169
## Notes

<!-- Content_START -->

### 2025.11.21
#### Part 1
- [x] 1.创建MetaMask钱包
- [x] 2.创建并部署合约，<img width="2880" height="1584" alt="image" src="https://github.com/user-attachments/assets/0e9419e0-cf74-4002-beed-f130d796a4c4" />
- [x] 3.运行hello，查看结果
  - [x] Transaction: <img width="2424" height="1144" alt="image" src="https://github.com/user-attachments/assets/31624060-f516-4e37-b3ec-365c35089490" />
  - [x] Events: <img width="2352" height="1236" alt="image" src="https://github.com/user-attachments/assets/b44a3c9f-19fb-423c-a077-4de55b0d1199" />

### 2025.11.30
#### Part 2
- [x] 成功记录: <img width="2880" height="1584" alt="image" src="https://github.com/user-attachments/assets/78014bb4-c853-4dc7-bf98-0b253d32bfe6" />

### 2025.12.07
学习B站肖臻老师的区块链课程ETH部分

### 2025.12.14
- [x] 安装go:<img width="842" height="178" alt="image" src="https://github.com/user-attachments/assets/49c82262-9165-4f9a-aa20-a8391b180d46" />

### 2025.12.15
- [x] week3 Part III <img width="1232" height="956" alt="image" src="https://github.com/user-attachments/assets/2ca74fc7-a590-4f80-b50b-69f40c21cf1e" />
### 2025.12.28
- [X] week4 Part I
  - [x] <img width="1660" height="454" alt="image" src="https://github.com/user-attachments/assets/4ed4f177-6b13-4a2e-83b9-f881bfb3d673" />
  - [x] try log_filter_big.go <img width="1884" height="1056" alt="image" src="https://github.com/user-attachments/assets/f409d760-09aa-41df-86ae-41a186bb178d" />
### 2026.1.4
- [x] week4 Part II <img width="962" height="662" alt="image" src="https://github.com/user-attachments/assets/0fb10374-8789-4010-93a1-d0d17501864b" /> 
<img width="884" height="996" alt="image" src="https://github.com/user-attachments/assets/a295aa95-6b41-4df2-bc83-2c70de560124" />

### 2026.1.10
- [x] week6 阅读Uniswap V2源码

### 2026.2.1
- [x] 完成思考题

---

# Uniswap V2 核心机制深度解析

## 一、 Pair 合约（底层逻辑）

### 1. `swap` 函数工作原理

* **输出金额计算：** Uniswap V2 的 `swap` 函数本身**并不计算**输出金额，它只负责执行交易和验证结果。计算逻辑通常在 Router 层的 `getAmountOut` 中完成。
* **恒定乘积公式 ：** 该公式确保了池子在任何价格下都能提供流动性。当资产  减少时，资产  必须成比例增加以维持  值（扣除手续费后  会略微增加），这种机制自动调节价格，无需外部报价单。
* **`_update` 函数的作用：** 1.  更新 `reserve0` 和 `reserve1`（记录池内余额）。
2.  计算并累加**价格累积值**，为链上预言机（TWAP）提供原始数据。
* **滑点保护：** 在 `Pair` 合约层级，滑点保护是通过最后的 `K` 值校验（乐观转账后的余额检查）来被动实现的。真正的用户侧滑点限制是在 `Router` 合约中通过预计算完成的。

### 2. 流动性管理

* **`mint` 函数（LP Token 计算）：** * **首次提供流动性：** 铸造 （即扣除最小流动性以防止由于精度导致的攻击）。
* **后续提供：** 按比例取最小值 。


* **`burn` 函数（返还代币）：** 根据用户销毁的 LP Token 占总供应量的比例，按当前池子余额等比例返还两种代币。
* **首次添加使用  的原因：** 这种几何平均数的算法确保了 LP Token 的价值增长与池子总价值的增长成线性关系，且不受两种代币初始比例（价格）的影响。

### 3. 价格预言机

* **价格累积值：** `price0CumulativeLast` 记录了 `price0 * time_elapsed` 的累加和。
* **计算 TWAP：** 通过在两个时间点读取累积值，计算差值并除以时间差：


这种方式极大提高了操纵价格的成本（需要操纵多个区块）。

---

## 二、 Router 合约（外围交互）

### 1. 交易流程与原子性

* **Router 的职责：** 1.  **安全计算：** 计算最优路径和输出金额。
2.  **转账协调：** 将用户的代币拉取（`transferFrom`）到 Pair 合约，并触发 Pair 的 `swap`。
* **Pair 选择：** 通过 `factory.getPair(tokenA, tokenB)` 定位具体的池子地址。
* **原子性保证：** 整个交易封装在一个以太坊交易中。如果其中任何一个步骤（如 `amountOut < amountOutMin`）触发 `revert`，所有状态变更（包括扣除的代币）都会回滚。

### 2. 路径选择（Pathing）

* **路径定义：** `path` 是一个代币地址数组，例如 `[ETH, USDT, USDC]`。
* **多跳交易（Multi-hop）：** 当 A 和 C 之间没有直接交易对，或者直接交易对深度不足时，Router 会通过中间代币 B（如 ETH/USDC）进行连续交易。
* **处理机制：** Router 会遍历路径，在每一对 Pair 之间执行 `swap`，前一个 Pair 的输出作为下一个 Pair 的输入。

### 3. 滑点保护实务

* **`amountOutMin`：** 这是用户愿意接受的最小代币产出量。如果最终计算出的产出低于此值，交易将失败。
* **滑点容忍度计算：** * **公式：** `expectedAmount * (1 - tolerance)`。
* **合理范围：** 通常为 0.1% 到 1%。在极端市场波动或低流动性池中，可能需要更高（如 5%-10%）才能保证成交，但这会面临更大的被夹（Sandwich Attack）风险。


---

## 三、 套利与 MEV 思考方向

1. **原子套利：** 利用 Router 的原子性，可以在同一个交易中从 A 池买入并在 B 池卖出，若最终余额未增加，交易直接 `revert`，从而实现零风险套利（仅损失 Gas）。
2. **滑点与三明治攻击：** 关注 `amountOutMin` 的设置。如果该值设置过低，MEV 机器人可以通过抢跑和垫后交易，挤压用户的成交价格从而获利。
3. **同步性：** 研究 `sync` 函数和池子余额的实时变动，是高频套利策略的基础。

### 2026.4.26

## 1. 交易分析与套利路径

仔细梳理该笔 tx (`0x9edea0b66aece76f0bc7e185f9ce5cac81ce41bdd1ec4d3cf1907274bc8aa730`) 的 Token 转移 Event Logs 可以确定以下核心信息：

*   **起始/结束 Token**: WETH (Wrapped Ether)
*   **套利循环路径**: `WETH → EMP → pEMP → pfWETH → WETH`
*   **具体步骤与协议操作分析**:
    1.  **WETH → EMP**: (Uniswap V3, 池子:`0xe092769bc...`) MEV Bot 调用池子的 flash swap 方法借出 EMP 资产。由于 V3 的机制，在交易发生并转出 EMP 之后将进入回调函数 `uniswapV3SwapCallback` 中完成所有套利用的交互，最后由该回调把垫付的 WETH 连本带息还给资金池。
    2.  **EMP → pEMP**: (Peapods Finance, Pod 合约:`0x4343a06b...`) 调用 Peapods 合约的 `bond(address token, uint256 amount)`，将我们持有的底层原生代币 EMP 包装存入，以 1:1 的额度或凭证机制获得 pEMP。
    3.  **pEMP → pfWETH**: (Uniswap V2, 池子:`0x9ff32269...`) 将 pEMP 通过 V2 `swap()` 方法换为 pfWETH (因为市场上针对这种包装币在这个池中出现了汇率偏差溢价)。
    4.  **pfWETH → WETH**: (Peapods Finance, Pod 合约:`0x395da89...`) 再次调用了 Peapods 另一主合约的 `debond` 赎回提款。传入 pfWETH 将其销毁，换回其底层资产本金 WETH。由于第三步换得的 pfWETH 数量相较于它的底层价值已经高于了原始投入的第一步负债 WETH，所以在归还给 UniV3 池后剩下的差价成为了纯收益。

---

## 2. 合约复刻与 Re-simulate 代码 (Foundry)

按照任务要求，定义描述每跳（Hop）结构的 `Path` 以及通过 `uniswapV3SwapCallback` 实现实际的闪电贷调用逻辑：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IUniswapV3Pool {
    function swap(address recipient, bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96, bytes calldata data) external returns (int256 amount0, int256 amount1);
    function token0() external view returns (address);
    function token1() external view returns (address);
}

interface IUniswapV2Pair {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function token0() external view returns (address);
    function token1() external view returns (address);
}

interface IPeapods {
    function bond(address token, uint256 amount) external;
    function debond(uint256 amount, address[] memory token, uint8[] memory percentage) external;
}

// 采用协议枚举，便于分发调度
enum ProtocolType {
    UniswapV3,
    PeapodsBond,
    UniswapV2,
    PeapodsDebond
}

// 结构化描述每一跳信息
struct Path {
    address edge;      // 针对该 hop 发起调用的目标（池子/合约）地址
    address tokenIn;   // 该步骤输入的代币
    address tokenOut;  // 该步骤期望输出的代币
    ProtocolType protocolType; 
}

contract ArbBot {
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    function executeExactInput(Path[] memory paths, uint256 amountIn) external returns (uint256 profit) {
        uint256 initB = IERC20(paths[0].tokenIn).balanceOf(address(this));
        
        // ============ HOP 1: UniswapV3 (Flash Swap) ============
        // V3 对回调附带传递整条 paths 调用链数据。
        // EMP是 token0, WETH是 token1。由于 token1 -> token0，zeroForOne 为 false
        bytes memory data = abi.encode(paths);
        
        IUniswapV3Pool(paths[0].edge).swap(
            address(this),
            false,
            int256(amountIn),   // 正数代表精确输入 exact input
            1461446703485210103287273052203988822378723970342 - 1, // Max sqrt price
            data
        );

        // Flash swap 结束后，本金（或直接使用的金额）已被退还，差额就是总毛利
        uint256 finalB = IERC20(paths[0].tokenIn).balanceOf(address(this));
        return finalB - initB;
    }

    function uniswapV3SwapCallback(int256 amount0Delta, int256 amount1Delta, bytes calldata data) external {
        // 解析传递给后三跳的数据字典
        Path[] memory paths = abi.decode(data, (Path[]));

        // 遍历处理跳板 [1 ~ 3]
        for (uint i = 1; i < paths.length; i++) {
            Path memory p = paths[i];
            uint256 bal = IERC20(p.tokenIn).balanceOf(address(this));

            if (p.protocolType == ProtocolType.PeapodsBond) {
                // HOP 2: Peapods 封装 bond
                IERC20(p.tokenIn).approve(p.edge, bal);
                IPeapods(p.edge).bond(p.tokenIn, bal);

            } else if (p.protocolType == ProtocolType.UniswapV2) {
                // HOP 3: Uni V2 Swap
                IERC20(p.tokenIn).transfer(p.edge, bal);
                (uint112 r0, uint112 r1, ) = IUniswapV2Pair(p.edge).getReserves();
                address t0 = IUniswapV2Pair(p.edge).token0();
                uint256 amountInWithFee = bal * 997;
                uint256 amountOut;

                if (p.tokenIn == t0) {
                    amountOut = (amountInWithFee * r1) / (r0 * 1000 + amountInWithFee);
                    IUniswapV2Pair(p.edge).swap(0, amountOut, address(this), "");
                } else {
                    amountOut = (amountInWithFee * r0) / (r1 * 1000 + amountInWithFee);
                    IUniswapV2Pair(p.edge).swap(amountOut, 0, address(this), "");
                }

            } else if (p.protocolType == ProtocolType.PeapodsDebond) {
                // HOP 4: Peapods 解装 redeem/debond
                IERC20(p.tokenIn).approve(p.edge, bal);
                address[] memory tokens = new address[](1);
                tokens[0] = p.tokenOut;
                uint8[] memory percents = new uint8[](1);
                percents[0] = 100;
                IPeapods(p.edge).debond(bal, tokens, percents);
            }
        }

        // ============ FINAL归还 WETH 本息 ============
        // V3 池由于是提供 WETH (token1), 因此借走的是 amount0Delta，而需要用 amount1Delta 归还是大于 0 的。
        uint256 amountToPay = amount1Delta > 0 ? uint256(amount1Delta) : uint256(-amount1Delta);
        IERC20(WETH).transfer(msg.sender, amountToPay);
    }
}

contract ArbTest is Test {
    uint256 forkId;
    ArbBot bot;

    function setUp() public {
        forkId = vm.createFork(
            vm.envString("RPC_URL"), // 从环境或 Alchemy 加载
            bytes32(0x9edea0b66aece76f0bc7e185f9ce5cac81ce41bdd1ec4d3cf1907274bc8aa730)
        );
        bot = new ArbBot();
        vm.makePersistent(address(bot));
    }

    function test_arb() public {
        vm.selectFork(forkId);
        vm.warp(block.timestamp + 12); 

        // 源 TX Ground Truth
        uint256 startAmount = 562611020353505727;  
        // 跳过使用自己的余额, 发放 token (因为V3 swap由于 exact input 需要消耗调用方部分余额，如果是无抵押闪电连环贷直接调用即可，这里为了对齐验证输入数)
        deal(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, address(bot), startAmount);

        // 构造交易路径字典
        Path[] memory paths = new Path[](4);
        paths[0] = Path(0xe092769bc1fa5262d4f48353f90890dcc339Bf80, 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, 0x3bB4445D30AC020a84c1b5A8A2C6248ebC9779D0, ProtocolType.UniswapV3);
        paths[1] = Path(0x4343A06b930cf7cA0459153c62cc5A47582099e1, 0x3bB4445D30AC020a84c1b5A8A2C6248ebC9779D0, 0x4343A06b930cf7cA0459153c62cc5A47582099e1, ProtocolType.PeapodsBond);
        paths[2] = Path(0x9fF3226906Eb460E11d88F4780C84457a2F96c3E, 0x4343A06b930cf7cA0459153c62cc5A47582099e1, 0x395dA89BDb9431621A75df4E2E3b993Acc2CaB3D, ProtocolType.UniswapV2);
        paths[3] = Path(0x395dA89BDb9431621A75df4E2E3b993Acc2CaB3D, 0x395dA89BDb9431621A75df4E2E3b993Acc2CaB3D, 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, ProtocolType.PeapodsDebond);

        uint256 grossProfit = bot.executeExactInput(paths, startAmount);

        // 验证产出毛利，通过 WETH 金额变化（AmountOut - AmountIn）严格等于要求值：7029283395661219 (或对齐金额 569640303749166946 )
        assertEq(startAmount + grossProfit, 569640303749166946);
    }
}
```

---

## 3. Challenge: 统计 MEV Bot 的月收益 (Go 代码实践)

### 任务解答说明

利用该分析脚本在服务器跑出的本笔 `0x9edea0b66ae...` 数据为：
*   **套利毛利 (Gross Revenue):** 7029283395661219 wei 
*   **Gas 成本与打点费用 (Total Gas/Bribe Paid):** 465431278568012 wei 
*   **当笔净利润 (Net Profit):** 6563852117093207 wei
*   **当笔利润率 (Margin):** 93.38%

据此可以拓展，查找在 EigenPhi 等平台上追踪到的该 Bot (`0x00000000000...` 或相应合约拥有者地址)，如获取某月全月（例：2023年10月或该合约建立高峰期）的 tx hash 列表循环拉取分析净利润。

### 核心 Go 代码

```go
package main

import (
	"context"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
)

// CalcResult 定义提取利润和收支开销的业务模型
type CalcResult struct {
	GrossRevenue *big.Int
	NetProfit    *big.Int
	GasFee       *big.Int
	Margin       float64
}

// 步骤 1. 单笔交易分析方法 (根据要求)
func CalculateTxRevenue(rpc string, txHash string, amountIn, amountOut *big.Int) (*CalcResult, error) {
	client, err := ethclient.Dial(rpc)
	if err != nil {
		return nil, err
	}
	hash := common.HexToHash(txHash)

	// 取出执行发出的回执
	receipt, err := client.TransactionReceipt(context.Background(), hash)
	if err != nil {
		return nil, err
	}

	// 1. Gross Revenue = 出账 - 进账
	grossRevenue := new(big.Int).Sub(amountOut, amountIn)

	// 2. Gas 及矿工贿赂费 (对于一般的 EIP1559 交易：gasUsed * effectiveGasPrice)
	gasFee := new(big.Int).Mul(new(big.Int).SetUint64(receipt.GasUsed), receipt.EffectiveGasPrice)

	// 3. 计算净利润（包含了隐性的 Priority Bribe 所以直接扣除总 gas_fee）
	netProfit := new(big.Int).Sub(grossRevenue, gasFee)

	// 4. Margin
	netF, _ := new(big.Float).SetInt(netProfit).Float64()
	groF, _ := new(big.Float).SetInt(grossRevenue).Float64()
	
	margin := 0.0
	if groF > 0 {
		margin = netF / groF
	}

	return &CalcResult{
		GrossRevenue: grossRevenue,
		NetProfit:    netProfit,
		GasFee:       gasFee,
		Margin:       margin,
	}, nil
}

// 步骤 2. 执行与活跃月份整合的主循环示例
func main() {
	rpcURL := "https://ethereum-rpc.publicnode.com" // 测试中实际可跑通的公用结点
	
	// 单笔测试：
	amtIn, _ := new(big.Int).SetString("562611020353505727", 10)
	amtOut, _ := new(big.Int).SetString("569640303749166946", 10)
	res, _ := CalculateTxRevenue(rpcURL, "0x9edea0b66aece76f0bc7e185f9ce5cac81ce41bdd1ec4d3cf1907274bc8aa730", amtIn, amtOut)

	fmt.Printf("单笔毛利: %v
开支消耗: %v
净利润绝对值: %v
Margin: %.2f%%
", res.GrossRevenue, res.GasFee, res.NetProfit, res.Margin*100)

	// ===========================
	// 获取活跃月份的所有 Net Profit 总额伪代码应用：
	// ===========================
	fmt.Println("--- 开始计算活跃月历史利润 ---")
	// 假设我们通过 Etherscan API 获取了该地址某个月（例2023年4月）的所有 txData:
	// txList := fetchMonthlyTransactions(contractAddress, "2023-04")
	monthlyTotalNetProfit := big.NewInt(0)
	
	/*
	for _, tx := range txList {
		// 在这里根据 Logs Parse 找到动态流出的 In/Out Amount，再套用函数：
		// currentRes, _ := CalculateTxRevenue(rpcURL, tx.Hash, tx.In, tx.Out)
		// 只有利润为正的时候累加
		// if currentRes.NetProfit.Sign() > 0 {
		//    monthlyTotalNetProfit.Add(monthlyTotalNetProfit, currentRes.NetProfit)
	    // }
	}
	*/
	fmt.Printf("模拟统计当月总利润累计值: %v wei
", monthlyTotalNetProfit)
}

<!-- Content_END -->
