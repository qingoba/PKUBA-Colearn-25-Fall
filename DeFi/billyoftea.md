---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区

# 徐昂

1. 自我介绍
   北大汇丰数量与金融科技专业研一，以前的研究方向集中在量化金融和AI Agent方向，对web3了解不深，希望通过这个项目学习web3相关知识。
2. 你认为你会完成这次共学小组吗？
    我会努力的
3. 你感兴趣的小组
    DeFi 合约组 > 链上数据组 > 合约安全组
4. 你的联系方式（Wechat or Telegram）
    Wechat: ShutUUpe
5. 质押的交易哈希
    0xfe44b16851f8cffcd705ed4d6f86239a3a3cff92d6579bb8726bc90d9c4d31c0
## Notes

<!-- Content_START -->

### 2025.11.21

#### 智能合约的前置问题

##### Q1: 什么是智能合约？

智能合约（Smart Contract）是一种基于区块链技术的自动化执行协议，其核心是将传统合同中的条款、条件与逻辑，通过代码的形式编写并存储在区块链上，当预设的触发条件满足时，合约会自动执行相应操作，且过程不可篡改、无需第三方中介干预。**"代码即合同"**

###### 智能合约的工作原理：从部署到执行的 4 个步骤

智能合约的生命周期可拆解为 "编写→部署→触发→执行" 4 个核心环节，以以太坊（最主流的智能合约平台）为例：

**步骤 1：编写合约代码**

开发者使用区块链平台支持的编程语言（如以太坊的 Solidity、Solana 的 Rust，也就是 Solidity 是 ETH 的编程语言），将合同条款转化为代码逻辑（例如 "若用户 A 完成任务 X，则向 A 发放代币 Y"）。

注意：代码的安全性至关重要 —— 若存在漏洞（如 "重入攻击" 漏洞），可能导致资产被窃取（典型案例：2016 年以太坊 "DAO 事件"，因智能合约漏洞损失约 5000 万美元）。

**步骤 2：部署到区块链**

开发者将编写好的合约代码，通过 "交易" 的形式发送到区块链网络，支付一定的 Gas 费（区块链网络的运算手续费）后，合约会被全网节点验证并存储在区块链上，同时生成一个唯一的 "合约地址"（类似银行账号，可用于调用合约）。

**步骤 3：触发合约条件**

当外部行为满足合约预设的条件时，合约被触发。触发方式通常有两种：

- **主动触发**：用户通过钱包（如 MetaMask）向合约地址发送 "调用请求"（例如 "申请提取奖励"）
- **被动触发**：依赖 "预言机"（Oracle）获取链外数据（如 "某日比特币价格达到 5 万美元"），当数据满足条件时自动触发（区块链本身无法直接获取链外数据，需预言机作为 "数据桥梁"）

**步骤 4：全网验证并执行合约**

触发后，区块链网络中的节点会根据合约代码逻辑，独立验证条件是否满足、执行步骤是否合规；若多数节点验证通过，合约会自动执行预设操作（如转账、修改账户余额、生成 NFT 等），执行结果会被记录在新的区块中，永久存储且不可篡改。

##### Q2: 介绍 Solidity 编程语言及其特点

Solidity 是一门面向以太坊智能合约的高级编程语言，由以太坊核心团队主导设计（2014 年启动），语法借鉴 JavaScript/Java，专门为区块链智能合约场景量身定制。它的核心定位是：将现实中的合同逻辑、业务规则转化为区块链可自动执行、不可篡改的代码，是目前以太坊生态最主流、开发者最多、工具链最成熟的智能合约语言。

###### HelloWeb3 示例合约

```solidity
// SPDX-License-Identifier: MIT  // 开源许可证标识，MIT 是最宽松的开源协议之一
pragma solidity ^0.8.0;  // 指定 Solidity 编译器版本，^0.8.0 表示兼容 0.8.0 及以上、0.9.0 以下的版本

// 定义一个名为 HelloWeb3 的智能合约
contract HelloWeb3 {
    // 定义一个事件，用于记录问候行为
    // indexed 关键字允许该参数被索引，方便后续查询
    // sender: 调用者的地址，timestamp: 调用时的区块时间戳
    event Greeting(address indexed sender, uint256 timestamp);
    
    // 构造函数，合约部署时执行一次（此处为空实现）
    constructor() {}

    // hello 函数：对外公开的函数（external 表示只能从合约外部调用）
    // 功能：触发 Greeting 事件，记录调用者地址和当前区块时间
    function hello() external {
        // msg.sender: 全局变量，表示当前调用合约的账户地址
        // block.timestamp: 全局变量，表示当前区块的时间戳（Unix 时间）
        emit Greeting(msg.sender, block.timestamp);
    }
}
```

###### 如何理解 Solidity 代码

1. **合约结构**
   - 合约以 `contract` 关键字开头，后面跟着合约名称（如 `HelloWeb3`）
   - 合约内部包含状态变量（存储数据）、事件（触发外部监听）、函数（执行操作）等

2. **状态变量**
   - 状态变量是合约内部的持久化数据存储，其值会在合约执行过程中被修改
   - 例如 `uint256 timestamp;` 定义了一个公共的无符号整数类型状态变量 `timestamp`，用于记录合约部署时的时间戳

3. **事件**
   - 事件是合约与外部世界进行通信的一种机制，当合约内部状态发生变化时，会触发相应的事件
   - 例如 `event Greeting(address indexed sender, uint256 timestamp);` 定义了一个事件 `Greeting`，当 `hello` 函数被调用时，会触发该事件并记录调用者地址和当前时间戳

4. **函数**
   - 函数是合约内部的可执行代码块，用于实现特定的功能
   - 例如 `function hello() external { emit Greeting(msg.sender, block.timestamp); }` 定义了一个外部可调用的函数 `hello`，当调用时会触发 `Greeting` 事件

##### Q3: 介绍 Remix、MetaMask 以及二者之间的交互

**Remix**

是一个在线合约编译平台，主要用于编译 Solidity 语言编写的智能合约。它提供了一个直观的用户界面，开发者可以在其中编写、编译和调试智能合约，并将编译好的合约部署到区块链上，支持将合约部署到如 Ganache 搭建的私有链，或是以太坊等公链上。

**MetaMask**

是一款非托管式加密货币钱包，以浏览器扩展程序的形式存在，也有移动应用版本。它允许用户安全地管理加密资产，支持超过 100 条区块链，包括以太坊、币安智能链等。MetaMask 弥合了传统网页浏览与区块链交互之间的鸿沟，用户可以通过它签署交易、与去中心化应用（DApp）进行交互等，在去中心化金融（DeFi）和 NFT 领域应用广泛。

**二者之间的交互**

Remix 可与 MetaMask 配合使用，实现智能合约的部署与调用。在 Remix 中编写好智能合约并编译成功后，可在部署选项中选择 "injected provider - metamask"，将 Remix 与 MetaMask 连接。连接后，Remix 会获取 MetaMask 中的账户信息和余额等数据，用户点击部署按钮，MetaMask 会弹出确认窗口，用户确认后即可将合约部署到指定的区块链上，后续还可通过 MetaMask 进行合约相关的交易操作，如调用合约函数等，交易产生的费用会从 MetaMask 钱包中的余额扣除。

##### Q4: 介绍 Remix 控制台输出

当我们在 Remix 中成功执行智能合约的函数后，控制台会返回详细的交易信息。以下是对 HelloWeb3 合约 `hello()` 函数执行结果的详细解读：

###### 基本交易信息

```
status: 1 Transaction mined and execution succeed
```
- **含义**：交易状态码为 1，表示交易已被矿工打包并成功执行
- **其他状态**：0 表示交易失败或被回滚

```
transaction hash: 0x5be020a909fc2a978faee8caee5fcd46326e290b5ce930f285cec8b8fa7694db
```
- **含义**：交易哈希，是这笔交易的唯一标识符（类似身份证号）
- **用途**：可以在区块链浏览器（如 Etherscan）中查询交易详情

```
block hash: 0x8c7f0433883969b16c137dc4009b670d1a8719f2eef6b55def74677045e8875d
block number: 9673929
```
- **block hash**：包含此交易的区块哈希值
- **block number**：区块编号，表示这是区块链上第 9,673,929 个区块

###### 交易参与方

```
from: 0x250879Fb2a52B7415BB1E2421b4d63445397bb17
to: HelloWeb3.hello() 0x48B0eAa04C2eC8A28F4ed2BA02646f2715DA03Fc
```
- **from**：交易发起者的钱包地址（调用合约的用户）
- **to**：合约地址和调用的函数名，`0x48B0e...` 是 HelloWeb3 合约的部署地址

###### Gas 费用

```
transaction cost: 22755 gas
```
- **含义**：本次交易消耗了 22,755 单位的 Gas
- **计算**：实际费用 = Gas 数量 × Gas 价格（由网络拥堵程度决定）

###### 输入输出

```
decoded input: {}
decoded output: -
```
- **input**：`hello()` 函数不需要参数，所以输入为空
- **output**：函数没有返回值（只触发事件），所以输出为空

###### 事件日志（Logs）

这是最重要的部分，记录了合约触发的事件：

```json
logs: [
    {
        "from": "0x48B0eAa04C2eC8A28F4ed2BA02646f2715DA03Fc",  // 事件来源：合约地址
        "topic": "0xd3c5e74ab50b58334f02e7b17dde164cce30984a5d60289c73a1c72e44898518",  // 事件签名哈希
        "event": "Greeting",  // 事件名称
        "args": {
            "0": "0x250879Fb2a52B7415BB1E2421b4d63445397bb17",  // 第一个参数：调用者地址（sender）
            "1": "1763708520"  // 第二个参数：时间戳（对应 2025-11-20 某个时间）
        }
    }
]
```

**解读**：
- 合约成功触发了 `Greeting` 事件
- 记录了调用者地址 `0x250879Fb...`
- 记录了调用时的 Unix 时间戳 `1763708520`（可转换为人类可读时间）

###### 原始日志（Raw Logs）

```json
raw logs: [
  {
    "_type": "log",
    "address": "0x48B0eAa04C2eC8A28F4ed2BA02646f2715DA03Fc",  // 合约地址
    "blockHash": "0x8c7f0433883969b16c137dc4009b670d1a8719f2eef6b55def74677045e8875d",
    "blockNumber": 9673929,
    "data": "0x0000000000000000000000000000000000000000000000000000000069200e68",  // 时间戳的十六进制编码
    "index": 33,  // 该日志在区块中的索引位置
    "topics": [
      "0xd3c5e74ab50b58334f02e7b17dde164cce30984a5d60289c73a1c72e44898518",  // topic[0]: 事件签名（Keccak-256 哈希）
      "0x000000000000000000000000250879fb2a52b7415bb1e2421b4d63445397bb17"   // topic[1]: indexed 参数（sender 地址）
    ],
    "transactionHash": "0x5be020a909fc2a978faee8caee5fcd46326e290b5ce930f285cec8b8fa7694db",
    "transactionIndex": 9  // 该交易在区块中的索引位置
  }
]
```

**关键概念**：
- **data**：存储非 indexed 参数（timestamp），用十六进制编码
- **topics**：存储事件签名和 indexed 参数，便于高效检索
  - `topics[0]` 始终是事件签名的 Keccak-256 哈希
  - `topics[1]` 是第一个 indexed 参数（sender 地址）
  
**为什么需要 indexed？**
- 带 `indexed` 的参数会被放入 topics 数组，支持高效过滤查询
- 例如可以快速查询 "某个地址发起的所有 Greeting 事件"
- 每个事件最多支持 3 个 indexed 参数（加上 topics[0] 共 4 个 topics）

##### Q5: 什么是区块链浏览器？介绍 Etherscan

###### 区块链浏览器简介

区块链浏览器是一种软件应用程序，可让用户提取、可视化和查看区块链网络指标，是查询区块链公开数据的在线工具。它就像是区块链和加密货币的 "浏览器" 与 "搜索引擎"。

**工作原理**

区块链浏览器直接连接到区块链节点，检索原始数据并将其整理成用户易于浏览的格式。它会对区块链数据进行索引，以加快查询速度，然后通过 Web 界面将相关区块链数据，如区块号、交易 ID 和地址等，以可读和可理解的方式呈现给用户。同时，它与区块链网络实时同步，确保信息准确且最新。

**主要功能**

- **交易查找**：用户可通过唯一交易 ID 搜索交易，查看发送方和接收方地址、转账金额、交易费用和确认号码等
- **区块信息查询**：能查看特定区块的详细信息，如区块高度、包含的交易、矿工和时间戳等
- **地址摘要查看**：输入区块链地址，可查看其当前余额、过去的交易记录等相关统计数据
- **网络统计**：展示区块链的整体状态，包括当前哈希率、难度级别和一段时间内的交易量等

###### Etherscan 介绍

Etherscan 是专门为以太坊网络构建的区块链浏览器，是以太坊公共账本的搜索引擎。它允许用户搜索、查看和验证在以太坊上进行的每笔交易、钱包地址、合约和代币移动。

**功能特性**

- **交易验证**：用户可输入交易 ID，查看交易何时确认、使用了多少燃气以及交易是否成功等信息，在交易失败或待处理时可用于验证和排查
- **智能合约探索**：开发者经常使用 Etherscan 来验证和发布智能合约，用户也可查看智能合约代码，了解其运行状态
- **代币跟踪**：可查看代币的流通供应量、最近的转账和合约互动等信息，还能显示官方合约地址，帮助用户避免山寨代币或诈骗
- **燃气费跟踪**：用户可通过 Etherscan 查看燃气费相关信息，以决定最佳交易时机

###### 解读 Etherscan 区块链浏览器的交易详情

将交易哈希输入 Etherscan，可以查看更详细和直观的链上交易信息。以下是对我们 HelloWeb3 合约交易的 Etherscan 完整输出解读：

**交易概览（Overview）**

```
Transaction Action: Call Hello Function by 0x250879Fb...45397bb17 on 0x48B0eAa0...715DA03Fc
[ This is a Sepolia Testnet transaction only ]
```
- **交易动作**：调用者 `0x250879Fb...` 在合约 `0x48B0eAa0...` 上执行了 `Hello` 函数
- **测试网标识**：Sepolia 是以太坊的测试网络，用于开发和测试，不涉及真实资产
  - 其他测试网：Goerli、Rinkeby（已弃用）、Ropsten（已弃用）
  - 主网：Ethereum Mainnet（涉及真实 ETH 和资产）

**核心交易信息**

**Transaction Hash（交易哈希）**
```
0x5be020a909fc2a978faee8caee5fcd46326e290b5ce930f285cec8b8fa7694db
```
- 交易的唯一身份标识，可在任何区块链浏览器中查询
- 由交易内容的加密哈希生成，具有唯一性和不可篡改性
- 通过这个哈希可以追踪交易的完整生命周期

**Status（状态）**
```
Success
```
- **Success**：交易成功执行，合约函数正常运行
- 其他可能状态：
  - `Failed`：交易失败（如 Gas 不足、合约执行错误、require 条件不满足）
  - `Pending`：交易待确认（尚未被打包进区块）
  - `Dropped`：交易被丢弃（Gas Price 太低或被新交易替代）

**Block（区块信息）**
```
9673929
443 Block Confirmations
```
- **区块号**：9673929，表示交易被打包在第 9,673,929 个区块中
- **确认数**：443，表示在此区块之后又有 443 个新区块被挖出
  - 确认数越多，交易越安全（回滚的可能性越低）
  - 以太坊共识：
    - 1 确认：交易已上链，但可能被重组
    - 12+ 确认：交易基本安全
    - 64+ 确认：交易最终确定（finalized）
    - 443 确认：交易已完全不可逆

**Timestamp（时间戳）**
```
1 hr ago (Nov-21-2025 07:02:00 AM UTC)
```
- 交易被打包进区块的准确时间
- UTC 标准时间，北京时间需要 +8 小时（即 15:02:00）
- 以太坊平均出块时间约 12 秒（合并后）

**交易参与方**

**From（发送方）**
```
0x250879Fb2a52B7415BB1E2421b4d63445397bb17
```
- 交易发起者的钱包地址
- 也是支付 Gas 费用的账户
- 在我们的合约中，这个地址会被记录为 `msg.sender`

**To（接收方）**
```
0x48B0eAa04C2eC8A28F4ed2BA02646f2715DA03Fc
```
- HelloWeb3 智能合约的部署地址
- 点击该地址可查看合约的完整信息（代码、余额、交互历史等）

**价值与费用**

**Value（转账金额）**
```
0 ETH
```
- 本次交易未转移任何 ETH（仅调用合约函数）
- 如果是转账交易或需要向合约发送 ETH 的函数（标记为 `payable`），这里会显示具体金额

**Transaction Fee（交易费用）**
```
0.000034132500250305 ETH
```
- **实际支付的 Gas 费**：约 0.000034 ETH
- 这笔费用支付给验证者（矿工），用于激励他们打包交易
- 该费用从发送方账户中扣除，且不可退还

**Gas Price（Gas 单价）**
```
1.500000011 Gwei (0.000000001500000011 ETH)
```
- **Gas Price**：用户愿意为每单位 Gas 支付的价格
- **单位换算**：
  - 1 ETH = 1,000,000,000 Gwei (10^9)
  - 1 Gwei = 1,000,000,000 Wei (10^9)
  - 1 ETH = 10^18 Wei
- Gas Price 越高，交易被优先打包的可能性越大

**Gas 详细信息（EIP-1559 机制）**

**Gas Limit & Usage by Txn（Gas 限制与实际使用）**
```
23,091 | 22,755 (98.54%)
```
- **Gas Limit**：23,091 - 用户设定的 Gas 上限（交易最多可消耗的 Gas）
  - 如果实际消耗超过 Limit，交易会失败并回滚
  - 未使用的 Gas 会退还给用户
- **Gas Used**：22,755 - 实际执行消耗的 Gas
- **使用率**：98.54% - 表示 Gas Limit 设置比较精准
  - 过高：浪费（虽然会退还，但会占用区块空间）
  - 过低：交易可能失败

**Gas Fees（Gas 费用详解 - EIP-1559）**
```
Base: 0.000000011 Gwei | Max: 1.500000015 Gwei | Max Priority: 1.5 Gwei
```

以太坊在 2021 年 8 月通过 EIP-1559 升级，引入了新的 Gas 费用机制：

- **Base Fee（基础费用）**：0.000000011 Gwei
  - 由网络拥堵程度自动调整（算法确定，非用户设定）
  - 网络拥堵时上升，空闲时下降
  - **Base Fee 会被销毁（burn）**，不归矿工所有
  
- **Max Fee（最大费用）**：1.500000015 Gwei
  - 用户愿意支付的每单位 Gas 的最高价格
  - 公式：`Max Fee = Base Fee + Max Priority Fee`
  - 实际支付 = min(Max Fee, Base Fee + Priority Fee)
  
- **Max Priority Fee（最大小费）**：1.5 Gwei
  - 支付给验证者的小费，用于激励优先打包
  - 也称为 "Tip" 或 "Miner Tip"
  - Priority Fee 越高，交易越快被打包

**实际 Gas Price 计算**：
```
实际 Gas Price = Base Fee + Priority Fee
                = 0.000000011 + 1.5 
                = 1.500000011 Gwei ✓
```

**Burnt & Txn Savings Fees（销毁与节省）**
```
🔥 Burnt: 0.000000000000250305 ETH ($0.00)
💸 Txn Savings: 0.00000000000009102 ETH ($0.00)
```

- **Burnt（销毁的 ETH）**：
  - 计算：`Base Fee × Gas Used = 0.000000011 × 22,755 = 0.000000250305 ETH`
  - 这部分 ETH 永久从流通中移除，发送到 0x0 地址
  - **EIP-1559 的通缩机制**：网络活跃时，销毁量可能超过新发行量
  
- **Txn Savings（交易节省）**：
  - 计算：`(Max Fee - Actual Fee) × Gas Used`
  - 用户设定的最大费用与实际支付的差额
  - 未使用的部分自动退还给用户

**完整费用计算验证**：
```
Transaction Fee = Gas Used × Actual Gas Price
                = 22,755 × 1.500000011 Gwei
                = 34,132.500250305 Gwei
                = 0.000034132500250305 ETH ✓

其中：
- 销毁部分 = 22,755 × 0.000000011 = 0.000000250305 ETH (给网络)
- 小费部分 = 22,755 × 1.5 = 34,132.5 Gwei (给验证者)
```

**其他交易属性（Other Attributes）**

**Txn Type（交易类型）**
```
2 (EIP-1559)
```
- **Type 2**：EIP-1559 交易类型，支持动态 Gas 费用机制
- 其他类型：
  - **Type 0**：Legacy Transaction（传统交易，2021 年前）
  - **Type 1**：EIP-2930（访问列表交易）
  - **Type 2**：EIP-1559（当前主流，支持 Base Fee + Priority Fee）

**Nonce（交易序号）**
```
3
```
- **含义**：这是该账户发送的第 4 笔交易（从 0 开始计数）
- **作用**：
  - 防止重放攻击（同一笔交易不能被重复执行）
  - 确保交易按顺序执行（Nonce 必须连续）
  - 如果 Nonce 为 3，意味着该账户之前已发送了 Nonce 0, 1, 2 的交易
- **重要性**：
  - Nonce 不连续的交易会卡在 Pending 状态
  - 可以通过发送相同 Nonce 但更高 Gas Price 的交易来"加速"或"取消"原交易

**Position In Block（区块内位置）**
```
9
```
- 该交易在区块 9673929 中的位置索引（第 10 笔交易，从 0 开始计数）
- 验证者通常按 Gas Price 从高到低排序交易
- 位置靠前的交易通常支付了更高的 Priority Fee

**输入数据（Input Data）**

**Function（函数信息）**
```
hello() ***
```
- 调用的函数名称：`hello()`
- `***` 表示这是一个已识别的函数（Etherscan 已解析合约 ABI）

**MethodID（方法标识符）**
```
0x19ff1d21
```
- **含义**：函数签名的前 4 字节哈希值
- **计算方式**：
  ```
  keccak256("hello()") = 0x19ff1d21c7d234e4bd3a81f2319461c4fc7f42d39f7de96336b96f7f0e2a9c3a
  取前 4 字节 => 0x19ff1d21
  ```
- **作用**：
  - EVM 通过 MethodID 识别要调用哪个函数
  - 即使函数名相同，参数不同也会产生不同的 MethodID
  - 例如：`hello()` 和 `hello(uint256)` 的 MethodID 不同

**Input Data 完整结构**（如果有参数）：
```
0x19ff1d21  +  <参数1的32字节编码>  +  <参数2的32字节编码>  + ...
  ↑                     ↑                        ↑
MethodID           第一个参数                 第二个参数
```
- 我们的 `hello()` 函数无参数，所以 Input Data 只有 MethodID

**交易的本质（More Details）**

```
A transaction is a cryptographically signed instruction that changes the blockchain state.
```

**深入理解交易**：

1. **密码学签名（Cryptographically Signed）**
   - 交易使用发送方的私钥签名
   - 任何人都可以用公钥验证签名的真实性
   - 签名确保：
     - 交易确实来自声称的地址
     - 交易内容未被篡改
   
2. **状态改变（Changes the Blockchain State）**
   - 区块链本质是一个"状态机"
   - 每笔交易都会改变链上状态：
     - 账户余额变化
     - 合约存储变量更新
     - 事件日志记录
     - Nonce 递增
   
3. **交易的不可逆性**
   - 一旦被打包进区块并获得足够确认，交易无法撤销
   - 即使交易失败，Gas 费用也不会退还（因为验证者已经消耗了算力）

4. **交易的原子性**
   - 交易要么完全执行成功，要么完全失败回滚
   - 不存在"部分成功"的情况
   - 如果函数调用链中任何一步失败，整个交易回滚

**Etherscan 额外功能**

**Logs（日志）标签页**
- 可以查看交易触发的所有事件（Events）
- 对于我们的合约，会显示 `Greeting` 事件的详细参数

**State（状态）标签页**
- 显示合约状态变量的变化（如果有的话）
- 我们的合约没有状态变量，所以这里为空

**与 Remix 控制台的对比**

| 信息项 | Remix 控制台 | Etherscan |
|--------|-------------|-----------|
| 详细程度 | 开发者视角，包含技术细节 | 用户友好，信息更直观 |
| Gas 信息 | 只显示 Gas Used | 完整显示 Gas Limit/Used/Price/Fee |
| EIP-1559 | 不显示 Base Fee/Priority Fee | 详细展示费用拆分和销毁情况 |
| 确认状态 | 无 | 实时显示区块确认数 |
| 时间信息 | Unix 时间戳 | 人类可读时间 + 相对时间 |
| 事件日志 | 原始 JSON 格式 | 可视化表格展示 |
| 交易属性 | 基本信息 | Nonce、Position、Type 等详细属性 |
| Input Data | 原始十六进制 | 自动解析函数名和 MethodID |

**Etherscan 的核心价值**

1. **透明性与可验证性**
   - 任何人都可以查看和验证链上交易，无需信任中介
   - 开源的区块链数据，支持社区审计和监督

2. **开发调试工具**
   - 追踪交易失败原因（通过 Status 和 Error Message）
   - 分析 Gas 消耗，优化合约代码
   - 验证合约部署是否成功

3. **安全验证**
   - 检查合约代码是否与声称的一致（通过 Verified Contract）
   - 识别钓鱼网站和假代币（通过官方合约地址对比）
   - 监控可疑交易和异常活动

4. **用户体验增强**
   - 普通用户可以直观了解交易状态
   - 通过地址查看完整交易历史
   - 实时监控 Gas 价格，选择最佳交易时机

5. **数据分析与研究**
   - 链上数据分析（交易量、活跃地址、Gas 趋势等）
   - DeFi 协议监控（TVL、交易对、流动性等）
   - NFT 市场数据（地板价、交易历史等）

**关键概念总结**

| 概念 | 解释 | 本次交易示例 |
|------|------|-------------|
| Transaction Hash | 交易的唯一标识符 | 0x5be020a9... |
| Gas Limit | 交易愿意消耗的最大 Gas | 23,091 |
| Gas Used | 实际消耗的 Gas | 22,755 (98.54%) |
| Base Fee | 网络基础费用（会被销毁） | 0.000000011 Gwei |
| Priority Fee | 支付给验证者的小费 | 1.5 Gwei |
| Burnt Fee | 被销毁的 ETH | 0.000000250305 ETH |
| Nonce | 账户交易序号 | 3（第4笔交易） |
| MethodID | 函数签名哈希（前4字节） | 0x19ff1d21 |
| Block Confirmations | 区块确认数（安全性指标） | 443（已完全确认） |

通过 Etherscan，我们可以完整追踪一笔交易从发起到确认的全过程，理解以太坊网络的运行机制，这对于 Web3 开发者和用户都是必不可少的工具。

---

### 2025.11.27

#### 真正的人生中第一个合约编写

##### 任务目标

通过编写智能合约与靶子合约交互，获取 Flag 并触发 `ChallengeCompleted` 事件。

##### 靶子合约信息

- **合约地址**：`0x4a6C0c0dc8bD8276b65956c9978ef941C3550A1B`
- **所在网络**：Ethereum Sepolia
  - Chain Info: https://chainlist.org/chain/11155111
  - 浏览器: https://sepolia.etherscan.io/
  
**可用方法**：
- `hint()` - 获取解题提示
- `query(bytes32 _hash)` - 提交答案获取 Flag，该方法只能通过合约调用
- `getSolvers()` - 查看所有完成者地址

##### 参考步骤

1. 编写并部署一个智能合约来调用靶子合约的 `hint()` 方法获取解题提示
2. 根据解题提示计算答案
3. 调用靶子合约的 `query()` 方法提交答案，若答案正确，则能够看到返回的 Flag 或者 ChallengeCompleted 事件

##### 注意事项

- 靶子合约要求调用者必须是合约地址，不能直接用钱包调用
- 可以多次尝试，每次成功都会触发事件

##### 代码实现（第一版 - 错误示例）

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 1. 定义靶子合约的接口，这样我们可以调用它
interface ITarget {
    function hint() external view returns (string memory);
    function query(bytes32 _hash) external returns (bool); // 假设返回bool，具体视合约而定
}

contract Solver {
    // 靶子合约地址
    address constant targetAddr = 0x4a6C0c0dc8bD8276b65956c9978ef941C3550A1B;
    ITarget target = ITarget(targetAddr);

    // 获取提示
    function getHint() public view returns (string memory) {
        return target.hint();
    }

    // 辅助工具：计算字符串的 Keccak256 哈希 (通常CTF的答案是Hint的哈希)
    function calculateHash(string memory _input) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_input));
    }

    // 提交答案
    function solve(bytes32 _answer) public {
        target.query(_answer);
    }
}
```

##### 运行结果

**获取提示**

```
from: 0x250879Fb2a52B7415BB1E2421b4d63445397bb17
to: Solver.getHint() 0x266320B75e7555Ae035F4af6833Cf4044E984C66
decoded output: {
    "0": "string: keccak PKUBlockchain"
}
```

**提交答案时遇到错误**

之后把 `PKUBlockchain` Hash 后，调用 solve 函数时出现错误：

```
Gas estimation errored with the following message (see below). The transaction execution will likely fail. Do you want to force sending?

missing revert data (action="estimateGas", data=null, reason=null, transaction={ "data": "0x183b468ae2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd22414215", "from": "0x250879Fb2a52B7415BB1E2421b4d63445397bb17", "to": "0xA5f08e1cf24bBbdC498d06F4b6a902A0E1A42606" }, invocation=null, revert=null, code=CALL_EXCEPTION, version=6.14.0)
```

**交易失败记录**

```
status: 0 Transaction mined but execution failed
transaction hash: 0xaadde36154852463b051141e96c01e96c91b7c65aba9cc1159659a26bbb4b8d4
block hash: 0xde7f43d8ed8402bf96f11170417b67e20183e440df60ea767507f02903590999
block number: 9674532
from: 0x250879Fb2a52B7415BB1E2421b4d63445397bb17
to: Solver.solve(bytes32) 0xA5f08e1cf24bBbdC498d06F4b6a902A0E1A42606
transaction cost: 80236 gas
decoded input: {
    "bytes32 _answer": "0xe2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd22414215"
}
```

##### 问题分析

**错误原因：接口定义的返回值类型不匹配**

- 靶子合约 (TargetContract) 的 `query` 函数定义是：
  ```solidity
  function query(bytes32 _hash) external returns (string memory)  // 注意：返回 string
  ```

- 我们之前的攻击合约里的接口写的是：
  ```solidity
  function query(bytes32 _hash) external returns (bool);  // 注意：错误地写成了 bool
  ```

##### 代码实现（修正版）

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 1. 修正接口：必须定义返回 string，否则会报错
interface ITarget {
    function query(bytes32 _hash) external returns (string memory);
}

contract Solver {
    // 靶子合约地址
    address constant targetAddr = 0x4a6C0c0dc8bD8276b65956c9978ef941C3550A1B;
    ITarget target = ITarget(targetAddr);

    // 定义一个事件，用来把拿到的 Flag 打印在日志里
    event LogFlag(string flag);

    // 获取提示
    function getHint() public view returns (string memory) {
        return target.hint();
    }

    // 计算哈希工具
    function calculateHash(string memory _input) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_input));
    }

    // 攻击函数
    function solve(bytes32 _answer) public {
        // 调用靶子，接收返回的 Flag 字符串
        string memory flag = target.query(_answer);
        
        // 把 Flag 记录到日志里，方便查看
        emit LogFlag(flag);
    }
}
```

##### 关键学习点

**要注意返回值类型的匹配**：
- 要么正确定义返回类型（如 `string memory`）
- 要么就不限定返回类型，让编译器自动处理
- 接口定义必须与目标合约完全一致，否则会导致调用失败




### 2025.12.2

#### Go 语言与区块链基础

##### Q1: Go 语言及其在区块链应用中的地位？

Go 兼顾了 C/C++ 的性能、Python/Java 的开发效率。区块链技术的核心需求是高性能、高并发、去中心化、安全性，而 Go 语言的特性与这些需求高度契合，使其成为区块链领域的 "首选开发语言" 之一。

##### Q2: 什么是 Geth？

Geth 是一种以太坊客户端，遵循以太坊协议的软件实现，安装后才算加入以太坊网络。

- **节点角色**：加入了以太坊网络后，自己的机器也算是网络中的一个节点。
- **默认行为**：默认情况下启动 Geth，是变成了全节点，会同步整个以太坊网络的所有区块和交易记录。也可以只变成轻节点和归档节点。

##### Q3: 什么是 RPC？

RPC（Remote Procedure Call，远程过程调用）。RPC 是通信协议，API 遵循 RPC 协议，来提供一系列的应用服务：

- 查询账户余额、交易、区块等信息
- 调用合约的只读方法（`eth_call`）
- 广播一笔签名好的交易（`eth_sendRawTransaction`）

**Geth 启动命令示例**

```bash
geth --sepolia --http --http.api eth,net,web3
```

- 这条命令会启动一个连到 Sepolia 测试网的节点，并在本地开一个 HTTP RPC 接口，供你或其他程序来查询链上数据。
- 这个接口是你本地 Geth 节点对外提供的 "数据查询入口"；查询 Sepolia 测试网数据不必须通过它，但通过它查询更自主；你启动的是 "以太坊 Sepolia 测试网的公共全节点"，而非私有节点。

**关于私有 RPC**

"私有 RPC"，本质是 "搭建完全独立的私有以太坊网络，再为这个私有网络的节点开放 RPC 接口" —— 这个 RPC 只服务于你的私有链，不连接主网 / 测试网，数据和访问权完全由你掌控。

如果要创建私有 RPC 接口：
1. 先建「私有以太坊网络」：用自定义创世块（规则手册）启动，只有你指定的节点能加入；
2. 再开「私有 RPC 接口」：给这个私有节点开放 HTTP RPC，仅本地（或你授权的 IP）能访问；
3. 最终效果：通过 `http://localhost:8545`（或自定义端口），只能查询 / 操作你的私有链数据，外人无法访问。

##### Q4: Go 语法基础

**初始化项目**

```bash
go mod init week3-geth
```
这是 Go 里的「项目模块初始化命令」，和 Python 的 `pip init`（或手动建 `requirements.txt`）功能类似，但设计更严谨，尤其适配 Web3 项目的依赖管理需求。

**Hello World 示例**

```go
package main

import "fmt"

func main() {
    fmt.Println("hello go")
}
```

- `package main`：声明这是可独立运行的程序（类似 Python 把代码放 `main.py` 作为入口）
- `import "fmt"`：导入标准库的打印工具（类似 Python `import print`，但 Python 直接内置 print 不用导）
- `func main() { ... }`：程序入口函数（类似 Python `if __name__ == "__main__":` 代码块，启动后自动执行）
- `fmt.Println("hello go")`：打印字符串（完全等价 Python `print("hello go")`）

整体：和 Python 写 `print("hello go")` 并运行一样，就是输出字符串，核心是 Go 强制要「入口包 + 入口函数」的规范。

##### Q5: 使用 Go 连接以太坊（代码示例）

```go
// 声明当前文件属于main包（Go程序入口包，必须为main才能独立运行）
package main

// 批量导入依赖包（标准库+以太坊Web3相关库）
import (
	"context"   // 标准库：用于请求上下文（控制超时、取消，Web3查链/发交易必备）
	"fmt"        // 标准库：格式化打印输出
	"log"        // 标准库：日志打印（含错误退出功能）
	"math/big"   // 标准库：处理大整数（Web3区块号、金额等超大数据需用）

	// 以太坊官方Web3库：common（通用工具）、ethclient（节点客户端）
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
)

// 程序入口函数（类似Python的if __name__ == "__main__": 代码块）
func main() {
	// 创建默认上下文（无超时/取消条件，Web3方法需传入上下文参数）
	ctx := context.Background()

	// 连接Sepolia测试网RPC节点，返回客户端实例和错误信息
	// 类比Python：w3 = Web3(Web3.HTTPProvider("rpc_url"))
	client, err := ethclient.Dial("https://ethereum-sepolia-rpc.publicnode.com")
	// 错误处理：若连接失败，打印错误并退出程序（Go强制显式处理错误）
	if err != nil {
		log.Fatal(err)
	}
	// 延迟执行：程序结束前关闭节点连接（避免资源泄露，类似Python with语句自动关闭）
	defer client.Close()

	// 通过客户端查询最新区块头信息（第二个参数nil表示查询最新区块）
	header, err := client.HeaderByNumber(ctx, nil)
	// 错误处理：查询失败则打印错误并退出
	if err != nil {
		log.Fatal(err)
	}
	// 打印最新区块号（header.Number是big.Int类型，需转字符串避免打印异常）
	fmt.Printf("Current block: %s\n", header.Number.String())

	// 创建指定区块号（123456）的大整数实例（Web3区块号需用big.Int存储）
	targetBlock := big.NewInt(123456)
	// 查询指定区块的完整信息
	block, err := client.BlockByNumber(ctx, targetBlock)
	// 错误处理：查询失败则打印错误并退出
	if err != nil {
		log.Fatal(err)
	}
	// 打印指定区块的区块号、哈希、父哈希、交易数量
	fmt.Printf("Block #%s hash: %s\n", block.Number().String(), block.Hash().Hex())
	fmt.Printf("Parent hash: %s\n", block.ParentHash().Hex())
	fmt.Printf("Tx count: %d\n", len(block.Transactions()))

	// 定义要查询的交易哈希，通过common.HexToHash转成Go的Hash类型（Web3哈希专用类型）
	txHash := common.HexToHash("0x903bd6b44ce5cfa9269d456d2e7a10e3d8a485281c1c46631ec8f79e48f7accb")

	// 通过交易哈希查询交易详情：返回交易实例、是否pending、错误
	tx, isPending, err := client.TransactionByHash(ctx, txHash)
	// 错误处理：查询失败则打印错误并退出
	if err != nil {
		log.Fatal(err)
	}
	// 打印交易是否处于pending状态
	fmt.Printf("Tx pending: %t\n", isPending)
	// 获取交易接收地址（to为指针，nil表示合约创建交易）
	if to := tx.To(); to != nil {
		// 若接收地址存在，打印地址的16进制格式
		fmt.Printf("To: %s\n", to.Hex())
	} else {
		// 若为nil，说明是合约部署交易
		fmt.Println("To: contract creation")
	}
	// 打印交易金额（以wei为单位，转字符串避免大整数打印异常）
	fmt.Printf("Value (wei): %s\n", tx.Value().String())

	// 通过交易哈希查询交易收据（包含交易状态、日志等信息）
	receipt, err := client.TransactionReceipt(ctx, txHash)
	// 错误处理：查询失败则打印错误并退出
	if err != nil {
		log.Fatal(err)
	}
	// 打印交易状态（0=失败，1=成功）、日志条目数量
	fmt.Printf("Receipt status: %d\n", receipt.Status)
	fmt.Printf("Logs: %d entries\n", len(receipt.Logs))
}
```

##### Q6: 区块链核心数据结构解析

###### 一、Block（区块）关键字段（Web3 场景含义）

一个区块含有很多个交易。

| 字段 | Web3 场景核心含义 |
|------|-------------------|
| **number** | 区块的唯一顺序标识（创世区块为 0，后续递增），是查询历史链上数据的核心索引，代表区块在链上的位置。 |
| **hash** | 由区块所有内容（交易、时间戳、parentHash 等）通过哈希算法生成的唯一 32 字节 16 进制值，是区块的「数字指纹」，任何内容篡改都会导致 hash 变化，保证区块不可篡改。 |
| **parentHash** | 当前区块的上一个（父）区块的 hash，是区块链「链式结构」的核心：每个区块都锚定前一个区块，形成不可篡改的链式账本。 |
| **timestamp** | 区块被矿工打包的 Unix 时间戳（秒级），记录区块生成的时间，用于追溯交易发生的时间范围。 |
| **gasUsed** | 该区块内所有交易实际消耗的 Gas 总量，反映区块内交易的总计算量，是衡量区块「负载」的指标。 |
| **gasLimit** | 单个区块允许消耗的最大 Gas 总量（全网节点共识调整），是区块的「计算资源上限」，限制区块内交易的数量和复杂度，避免网络因超大计算量交易拥堵。 |
| **transactions** | 区块内包含的所有交易列表（转账、合约交互、合约部署等），是区块的核心内容，链上所有价值转移和合约执行都记录在此。 |

**Follow-Up 解答**

1. **为何 parentHash 能形成区块链？**
   每个区块的 parentHash 都指向其前一个区块的 hash，意味着：
   - **链式关联**：所有区块按「创世区块→第 1 块→第 2 块→…→最新块」的顺序形成不可逆的链；
   - **防篡改**：若篡改某一历史区块的内容（如修改交易金额），该区块的 hash 会立即改变，而后续所有区块的 parentHash 都指向该区块的旧 hash，导致后续整条链的合法性失效，全网节点会拒绝该篡改链；
   - 最终形成「牵一发而动全身」的不可篡改链式结构，这是区块链的核心特性。

2. **gasLimit 如何影响合约执行？**
   Gas 是以太坊网络的计算资源单位，合约执行的每一步（如算术运算、存储读写）都消耗固定 Gas：
   - 区块 gasLimit 是「单区块所有交易 Gas 消耗的总和上限」：若一笔合约交易的 Gas 需求超过区块剩余 gasLimit，会被拒绝打包；
   - 若合约执行中消耗的 Gas 超过「交易自身设定的 Gas 上限」或「区块剩余 gasLimit」，EVM 会立即中断合约执行，所有状态（如转账、余额修改）回滚，且已消耗的 Gas 不退还（防止恶意合约无限循环占用网络资源）；
   - 高 gasLimit 区块可容纳更多 / 更复杂的合约交易，但也会增加区块验证时间，全网会动态平衡 gasLimit 以兼顾效率和安全性。

###### 二、Transaction（交易）关键字段（Web3 场景含义）

| 字段 | Web3 场景核心含义 |
|------|-------------------|
| **nonce** | 交易发送地址的「交易序号」（从 0 开始递增，每个地址独立计数），核心作用是防止交易重放攻击：同一地址的交易必须按 nonce 顺序执行，重复 / 乱序 nonce 的交易会被节点拒绝。 |
| **from / to** | **from**：交易发起地址（私钥签名者）；**to**：交易接收地址（普通转账 = 接收 ETH 地址，合约交互 = 目标合约地址，为空 = 合约部署交易）。 |
| **input (call data)** | 16 进制字符串格式的「合约调用指令集」：普通转账为空，合约交互时包含「函数选择器（前 4 字节）+ 编码后的参数」，是外部触发合约执行的核心数据。 |
| **gas / gasPrice** | **gas**：交易发起者设定的「本次交易允许消耗的最大 Gas 量」；**gasPrice**：legacy 交易中「每单位 Gas 的手续费单价（wei）」，Gas * gasPrice = 总手续费，单价越高越易被矿工优先打包。 |
| **value** | 交易中转账的 ETH 金额（以 wei 为单位，1 ETH = 10^18 wei）：普通转账 = 实际转账金额，合约交互 = 打给合约的 ETH 金额（合约可通过代码接收 / 处理）。 |
| **type** | 交易类型：0=legacy（旧版交易，用 gasPrice 定手续费）；2=EIP-1559（新版交易，用 maxFeePerGas（最高手续费）+ maxPriorityFeePerGas（矿工小费）替代 gasPrice，手续费更灵活）。 |

**Follow-Up 解答**

1. **什么是 ABI？**
   ABI（Application Binary Interface）是以太坊合约与外部（钱包、DApp、节点）交互的「标准化协议」，本质是合约的「接口说明书」：
   - **定义内容**：合约的函数名 / 参数类型 / 返回值类型、事件名 / 参数类型、错误码等；
   - **核心作用**：作为「人类可读逻辑」和「机器可执行二进制数据」的转换桥梁，没有 ABI 无法解析合约的 input 数据，也无法调用合约函数。

2. **一笔交易最终执行逻辑是如何解析 input 的？**
   以调用合约 transfer 函数为例，EVM 解析 input 的核心流程：
   - **编码阶段**：外部通过 ABI 将「函数名 + 参数」编码为 input 数据（前 4 字节 = 函数选择器，是函数签名的哈希前 4 字节，用于识别函数；后续字节 = 参数的标准化编码，如地址 / 数字转 32 字节）；
   - **执行阶段**：交易打包后，EVM 读取 input 数据，先取前 4 字节函数选择器，匹配合约代码中对应的函数；
   - **解码阶段**：按 ABI 定义的参数类型，解码 input 后续字节的参数；
   - **执行阶段**：EVM 执行该函数的字节码逻辑（如修改余额、转账），消耗对应 Gas；
   - **结果阶段**：执行完成后返回结果（或写入事件日志），若 Gas 不足则中断并回滚状态。

###### 三、Receipt（交易收据）关键字段（Web3 场景含义）

| 字段 | Web3 场景核心含义 |
|------|-------------------|
| **status** | 交易执行状态：0 = 失败（如 Gas 不足、合约逻辑报错），1 = 成功；是判断交易是否生效的核心指标，仅交易被打包后才有 receipt，pending 交易无 receipt。 |
| **logs** | 交易触发的合约事件日志列表（由合约内 emit 语句生成），包含事件名、参数、合约地址等，是链下监听合约状态（如转账到账、NFT 铸造）的核心数据。 |
| **contractAddress** | 仅「合约部署交易」有值，是新部署合约在链上的唯一地址（由部署者地址 + nonce 计算生成）；非合约部署交易该字段为空。 |

**总结**

- **Block** 的核心是「不可篡改的链式结构」，parentHash 锚定历史、gasLimit 控制网络负载；
- **Transaction** 的 input 是合约交互的核心，需通过 ABI 编码 / 解码才能被 EVM 执行；
- **Receipt** 是交易执行后的「凭证」，status 判成败、logs 取事件、contractAddress 仅合约部署有效。

### 2025.12.12

#### 使用 Go 查询和订阅以太坊日志数据

本节将专注于 Receipt 中的 Logs，这是获取合约事件数据的关键。我们将学习如何使用 Geth 的 Go 客户端进行日志过滤和高通量数据查询。

##### Q1: 什么是 EVM 日志（Log）？

EVM 日志（Log）是智能合约与链下世界通信的桥梁，是合约执行期间产生的只读数据记录，主要用于前端交互、数据索引和状态监控。

**日志的核心字段**：
- **Address**：触发该日志的合约地址
- **Topics**：用于索引的字段数组
- **Data**：非索引的负载数据

##### Q2: 什么是 Topics？

Topics 是日志中最关键的部分，决定了如何过滤和查找事件。

###### Topic 0（事件签名哈希）

- **必填项**（匿名事件除外），用于标识事件类型
- **计算公式**：$Topic_0 = Keccak\text{-}256(\text{"EventName(type1,type2,...)"})$
- **注意**：签名字符串中不能包含参数名称，且参数类型间不能有空格

###### Event Signature（事件签名）

事件签名是事件的唯一标识符，用于在日志中识别特定类型的事件：

- **定义**：事件签名字符串格式为 `EventName(type1,type2,...)`，其中只包含事件名称和参数类型，不包含参数名称
- **计算**：对签名字符串进行 Keccak-256 哈希，得到 32 字节的哈希值，存储在 Topic 0 中
- **作用**：通过匹配 Topic 0，可以快速过滤出特定类型的事件（如所有 Transfer 事件）

**示例**：

```solidity
// 事件定义
event Transfer(address indexed from, address indexed to, uint256 value);

// 事件签名
Transfer(address,address,uint256)

// Topic 0
Keccak256("Transfer(address,address,uint256)")
```

##### Q3: ERC-20 Transfer 事件的 Log 结构

以标准的 ERC-20 Transfer 事件为例：

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
```

**执行场景**：用户 A 向用户 B 转账 100 代币，合约执行 `emit Transfer(A, B, 100);`

**生成的 Log 结构**：

| 字段 | 值 | 说明 |
|------|-----|------|
| **Topic 0** | `Keccak256("Transfer(address,address,uint256)")` | 事件签名哈希 |
| **Topic 1** | `0x000...用户A地址` (32 字节) | 第一个 indexed 参数 (from) |
| **Topic 2** | `0x000...用户B地址` (32 字节) | 第二个 indexed 参数 (to) |
| **Data** | `100` (十六进制) | 未标记 indexed 的参数 (value) |

> **注意**：Data 字段存储更便宜，但无法直接通过以太坊节点 API 进行条件过滤。

##### Q4: indexed 参数与 Data 的 Gas 成本对比

| 存储方式 | 数据实际字节数 | Gas 计算方式 | 总 Gas 成本 |
|----------|---------------|-------------|-------------|
| 作为 indexed 参数（Topic） | 1 字节 | 375（固定基础） + 32×8（固定 32 字节）= 631 Gas | 631 Gas |
| 作为非 indexed 参数（Data） | 1 字节 | 1×1（实际字节数 ×1 Gas / 字节）= 1 Gas | 1 Gas |

##### Q5: Log 的存储特征与应用

###### Gas 经济学

- **Storage**：永久存储在状态树中，所有合约可见，读写昂贵。全网节点同步维护，每一次读写都会导致全网所有节点更新自己的状态副本，消耗大量网络和储存资源
- **Log**：存储在交易收据中，合约无法读取，Gas 费用远低于 Storage。不上状态树，虽然也会永久上链，和区块一起存储，但不属于合约状态，不会占用状态树的存储资源

###### 应用场景

- **前端响应**：MetaMask 等钱包监听 Log 更新余额
- **数据索引**：The Graph/Dune 通过 Topic 过滤构建历史数据库
- **链下触发器**：中心化交易所收到 Log 后自动入账

##### Q6: 什么是 eth_call？

`eth_call` 是以太坊客户端（如 Geth）用于进行"只读查询"的核心 JSON-RPC 方法。

**功能**：模拟执行合约的函数调用（主要是读取状态的函数），获取链上数据

**特点**：
- 不发送交易，不消耗 Gas
- 不改变区块链状态
- 可以查询历史区块状态（通过指定 block number 参数）

**应用**：
- 预先验证交易是否会成功
- 读取合约的只读状态
- 对任意历史状态进行"时间旅行"式查询

> **注意**：`FilterLogs` 底层通过 `eth_getLogs` RPC 方法实现，而 `CallContract` 则使用 `eth_call` 方法。

##### Q7: Go 语言包（Package）的作用域规则

在同一个包（package）中不能重复声明相同名称的包级别变量/常量。

**关键规则**：
- 同一个包（`package main`）= 所有声明 `package main` 的 Go 文件
- 你的 `monitor_setup.go`、`graph_query.go`、`log_filter.go` 等文件都是 `package main`，它们在编译时会被视为同一个包，所以不能有重复的包级别声明
- **文件夹位置不重要，重要的是 package 名称**
- 即使在同一个文件夹，如果 package 名称不同，也可以有相同的变量名
- 即使在不同文件夹，如果 package 名称相同，也不能重复声明

##### 实战：查询 USDC Transfer 事件日志

**运行结果示例**：

```
(base) PS C:\Users\Lenovo\Desktop\pkuba\w4> go run log_filter.go
2025/12/13 11:50:02 开始配置代理并连接到以太坊客户端
2025/12/13 11:50:02 连接到以太坊客户端成功 (已配置代理)
2025/12/13 11:50:02 正在获取最新区块号...
2025/12/13 11:50:03 最新区块号: 24001111
2025/12/13 11:50:03 查询 USDC 地址: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
2025/12/13 11:50:03 查询区块范围: 24001101 到 24001111 (共 10 个区块)
2025/12/13 11:50:03 开始查询日志...
✅ 成功: 在区块 24001101 到 24001111 之间找到了 443 条 Transfer 事件日志
--- 第一条 Log 详情 ---
TxHash: 0xa5e951f70868e6fa1f796b1ade2a539643f5e5a0729a5c67c7911f61a10ee075
BlockNumber: 24001101
Topics: [0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef 
         0x000000000000000000000000000000000004444c5dc75cb358380d2e3de08a90 
         0x0000000000000000000000000000000aa232009084bd71a5797d089aa4edfad4]
注意: 要获取可读的转账金额，需要使用 ABI 解码 log.Data 字段。
```

##### 高通量日志查询：分页、重试与限速

###### 一、分页查询（Pagination）

在 `paginatedQueryLogsWithRateLimit` 函数中实现：

```go
func paginatedQueryLogsWithRateLimit(...) ([]types.Log, error) {
    var allLogs []types.Log
    currentFrom := new(big.Int).Set(fromBlock)  // 当前页起始区块
    
    for currentFrom.Cmp(toBlock) <= 0 {  // 循环直到查询完所有区块
        // ✅ 步骤 1: 计算当前页的结束区块号
        currentTo := new(big.Int).Set(currentFrom)
        currentTo.Add(currentTo, big.NewInt(int64(MaxBlockRange)))  // +1000
        if currentTo.Cmp(toBlock) > 0 {  // 确保不超过总结束区块
            currentTo.Set(toBlock)
        }
        // 现在 currentFrom 到 currentTo 就是当前页，范围最大 1000 个区块
        
        // ✅ 步骤 2: 构造查询条件
        query := ethereum.FilterQuery{
            FromBlock: currentFrom,
            ToBlock:   currentTo,
            Addresses: addresses,
            Topics:    topics,
        }
        
        // ✅ 步骤 3: 调用 client.FilterLogs() 查询当前页
        logs, err := queryLogsWithRetry(client, ctx, query)
        if err != nil {
            return nil, err
        }
        
        // ✅ 步骤 4: 合并结果
        allLogs = append(allLogs, logs...)
        
        // ✅ 步骤 5: 更新起始区块为下一页
        currentFrom = new(big.Int).Add(currentTo, big.NewInt(1))
    }
    
    return allLogs, nil
}
```

**工作流程示例**（假设查询 23991254 到 24001254，共 10000 个区块）：
- 第 1 页：23991254 - 23992253 (1000 个区块)
- 第 2 页：23992254 - 23993253 (1000 个区块)
- ...
- 第 10 页：24000254 - 24001254 (1001 个区块)

###### 二、错误重试（Retry Mechanism）

在 `queryLogsWithRetry` 函数中实现：

```go
func queryLogsWithRetry(
    client *ethclient.Client,
    ctx context.Context,
    query ethereum.FilterQuery,
) ([]types.Log, error) {
    var logs []types.Log
    var err error
    
    // ✅ 步骤 1: 实现重试循环（最多 MaxRetries = 3 次）
    for i := 0; i < MaxRetries; i++ {
        // ✅ 步骤 2: 调用 client.FilterLogs() 查询
        logs, err = client.FilterLogs(ctx, query)
        
        // ✅ 步骤 3: 如果成功，立即返回
        if err == nil {
            return logs, nil
        }
        
        // ✅ 步骤 4: 失败时等待 RetryDelay (2秒) 后重试
        if i < MaxRetries-1 {  // 还没达到最大重试次数
            log.Printf("查询失败 (尝试 %d/%d): %v，%v 后重试...", 
                      i+1, MaxRetries, err, RetryDelay)
            time.Sleep(RetryDelay)  // 等待 2 秒
        }
    }
    
    // ✅ 步骤 5: 达到最大重试次数后返回错误
    return logs, fmt.Errorf("重试 %d 次后仍失败: %w", MaxRetries, err)
}
```

**工作流程示例**：

```
第 1 次尝试 → 失败 (429 Too Many Requests) → 等待 2 秒
第 2 次尝试 → 失败 → 等待 2 秒
第 3 次尝试 → 成功 ✅ 返回结果
```

###### 三、RPS 限制（Rate Limiting）

在 `RateLimiter` 结构体中实现：

```go
type RateLimiter struct {
    lastRequestTime time.Time      // 记录上次请求的时间戳
    interval        time.Duration  // 请求间隔 = 1秒 / 10 = 100ms
}

func (rl *RateLimiter) Wait() {
    // ✅ 步骤 1: 计算距离上次请求的时间间隔
    elapsed := time.Since(rl.lastRequestTime)
    // 例如：如果 lastRequestTime 是 50ms 前，elapsed = 50ms
    
    // ✅ 步骤 2: 如果间隔小于 interval (100ms)，则等待剩余时间
    if elapsed < rl.interval {
        waitTime := rl.interval - elapsed  // 100ms - 50ms = 50ms
        time.Sleep(waitTime)  // 等待 50ms
    }
    // 现在距离上次请求已经过了至少 100ms
    
    // ✅ 步骤 3: 更新 lastRequestTime 为当前时间
    rl.lastRequestTime = time.Now()
}
```

**工作流程示例**（RPSLimit = 10，即每秒最多 10 个请求）：

```
时间轴:
0ms:   第 1 次请求 → Wait() → 无需等待 → 更新 lastRequestTime
50ms:  第 2 次请求 → Wait() → 需要等待 50ms → 在 100ms 时发送
200ms: 第 3 次请求 → Wait() → 无需等待（已过 100ms）
```

###### 四、三者协同工作

在 `paginatedQueryLogsWithRateLimit` 中，三者组合使用：

```go
for currentFrom.Cmp(toBlock) <= 0 {
    // 计算当前页区块范围
    currentTo := ...
    
    // 🎯 先使用 RPS 限制器控制请求频率
    rateLimiter.Wait()  // 确保每 100ms 才发一次请求
    
    // 🎯 再使用重试机制查询（遇到错误自动重试）
    logs, err := queryLogsWithRetry(client, ctx, query)
    
    // 🎯 合并结果，继续下一页
    allLogs = append(allLogs, logs...)
    currentFrom = new(big.Int).Add(currentTo, big.NewInt(1))
}
```

**完整流程示例**：

```
页 1: Wait (0ms) → 查询 → 成功 → 合并
页 2: Wait (100ms) → 查询 → 失败 → 等待 2s → 重试 → 成功 → 合并
页 3: Wait (100ms) → 查询 → 成功 → 合并
...
页 10: Wait (100ms) → 查询 → 成功 → 返回所有结果
```

**总结**：
- ✅ **分页**：避免单次查询区块过多
- ✅ **重试**：应对网络不稳定
- ✅ **限速**：避免触发 API 的 RPS 限制



#### The Graph & GraphQL
回顾: 在 Part II 中，我们直接与 Geth 节点 对话，学会了监听实时的区块和交易。

痛点： Geth 很强，但也很“笨”。如果你问 Geth：“请告诉我 Uniswap 上过去一年 ETH/USDC 的所有交易量总和”，Geth 会崩溃。因为它只是一个链表，没有根据业务逻辑建立索引。
解决： 我们需要一个 中间件，它能像“爬虫”一样通过 RPC 抓取链上数据，清洗、整理并存入数据库，供我们快速查询。这就是 The Graph。
The Graph Explorer 可以进行交互式体验。Subgraph（子图）是 The Graph 中定义并索引特定区块链数据的核心单元，相当于为 DApp / 协议定制的 “数据索引器 + 开放 API”，开发者可通过它精准提取链上数据，用户在 The Graph Explorer 中搜索使用的正是这些预定义的 Subgraph。例子中用的Uniswap 是以太坊生态的去中心化交易所（DEX）龙头

### 2025.12.20

#### Etherscan 数据分析与 API 实战

#### Q1: 为什么在 Geth 之外还需要 Etherscan？

Geth 调用的底层 RPC 接口直接反映链上状态，但其数据结构是为**执行和共识**设计的，而非为**多维查询**设计。

**RPC 的痛点：**

- **索引缺失**：若需查询“哪些地址调用过某合约”，RPC 需从起始区块逐个扫描交易（`tx.to`），耗时极长。
- **内部转账不可见**：合约内部触发的 ETH 转移（Internal Transfers）不直接存在于区块的基本结构中，RPC 无法直接获取列表。

Etherscan 的定位：

Etherscan 相当于一个索引化后的中心化数据库。它同步整条链的数据，提前解析交易、收据和执行轨迹（Trace），并为用户构建了可以直接查询的索引表。

### Q2: Etherscan HTTP API 基础

Etherscan 通过标准的 HTTP API 提供服务，开发者只需在 URL 中携带 `apikey` 即可进行数据请求。

**HTTP API 核心概念：**

- **请求方法**：常用 `GET`（查询）和 `POST`（提交）。
- **状态码**：如 `200`（成功）、`404`（资源不存在）、`500`（服务器错误）。
- **结果判断**：返回 JSON 中的 `status: "1"` 表示成功，`message` 字段会解释错误原因（如限频提示）。

**API 查询示例 (PowerShell/Terminal)：**

Bash

`curl "https://api.etherscan.io/v2/api?\
chainid=1&\
module=account&\
action=txlist&\
address=0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc&\
startblock=23974499&\
sort=asc&\
page=1&\
offset=100&\
apikey=YOUR_API_KEY"`

#### Q3: 案例分析：Uniswap V2 流动性池的“假性不活跃”

在查询 USDC-ETH 池（`0xb4e16d01...`）的 `txlist`（普通交易列表）时，常会发现交易记录寥寥无几。这并非池子不活跃，而是由 **Uniswap 的架构设计**决定的：

1. **Router 机制**：大多数用户通过 `Router` 合约进行交易。用户交易的 `to` 是 Router，Router 再在合约内部调用 `Pair`。这属于**内部调用**，不会出现在 `Pair` 的 `txlist`（外部交易列表）中。
2. **聚合器干扰**：1inch 等聚合器会层层嵌套调用，进一步隐藏了直接针对 `Pair` 的外部交易。
3. **WETH 包装**：池子处理的是 ERC-20 代币（WETH/USDC），其转账记录在 `tokentx` 列表中，而非 native ETH 的交易列表。

> 结论：分析 DEX 活跃度必须结合 Event Logs 和 Internal Transactions 接口。
> 

#### Q4: 内部交易查询 (txlistinternal)

`txlistinternal` 专门查询合约执行过程中发生的 **Native ETH 转移**（通过 EVM 的 `CALL`、`CREATE`、`SELFDESTRUCT` 操作触发）。

实战案例：WithdrawDAO 退款合约

2016 年 The DAO 事件后，官方部署了 WithdrawDAO 合约供受害者取回 ETH。该合约通过内部调用分发资金，这些记录在 txlist 中不可见，必须查询 internal 列表。

**查询代码示例：**

PowerShell

`(curl "https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlistinternal&address=0xBf4eD7b27F1d666546E30D74d50d173d20bca754&startblock=23655563&sort=desc&apikey=YOUR_API_KEY").Content`

**返回结果解读：**

| **字段** | **含义** | **示例值** |
| --- | --- | --- |
| **from** | ETH 发出方（合约地址） | `0xbf4ed7b2...` |
| **to** | ETH 接收方（用户地址） | `0xf821e87c...` |
| **value** | 转移金额 (Wei) | `10000543249556738` |
| **type** | 操作类型 | `call` |
| **traceId** | 在该笔交易执行轨迹中的位置 | `0_1` |

#### 关键概念对比：外部交易 vs 内部交易


| **特性** | **普通交易 (txlist)** | **内部交易 (txlistinternal)** |
| --- | --- | --- |
| **触发者** | 由外部账户 (EOA) 签名发起 | 由智能合约逻辑执行触发 |
| **本质** | 改变链状态的顶层指令 | 合约间的子调用或 ETH 转移 |
| **链上记录** | 直接存储在区块的 Transactions 根中 | 需通过执行轨迹 (Trace) 解析提取 |
| **典型场景** | 用户授权、直接转账、调用 Router | 提现合约发钱、Router 内部调池、聚合器分片 |





<!-- Content_END -->
