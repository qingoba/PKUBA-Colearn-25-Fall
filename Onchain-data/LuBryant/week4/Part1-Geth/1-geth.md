
## Part I: Geth

### 上周回顾:

#### I. Geth：以太坊的 Go 语言客户端

**Geth**（Go-Ethereum）是用 Go 语言编写的以太坊协议的官方客户端。

* **性质：** Geth 是最主流的**执行客户端**，负责处理交易和维护区块链状态。
* **功能：** 它运行一个以太坊**节点**（如全节点），同步数据，并提供 **JSON-RPC API** 接口，允许外部程序（如您用 Go 编写的分析工具）连接并查询链上信息。
    
---

#### II.  以太坊核心数据结构

以太坊区块链的三大核心数据结构：

| 数据结构 | 作用 | 关键点 |
| :--- | :--- | :--- |
| **Block (区块)** | 存储一组已验证的交易。 | **`ParentHash`** 将区块首尾相连，形成不可篡改的链。 |
| **Transaction (交易)** | 用户提交的操作指令（转账、合约调用）。 | **`Input`** 字段包含合约调用的指令和参数，由 **ABI** 解析。 |
| **Receipt (回执)** | 交易执行后的结果证明。 | **`Status`** (成功/失败) 和 **`Logs`** (合约发出的事件数据) 是最重要的信息。 |

---

**🔥 下一步：** 我们将专注于 **Receipt 中的 `Logs`**，这是获取合约事件数据的关键。我们将学习如何使用 Geth 的 Go 客户端进行**日志过滤**和**高通量数据查询**。

### 内容:

本部分的核心是掌握如何使用 **Go 语言客户端（go-ethereum/ethclient)** 高效、稳定地查询和订阅以太坊数据。

🎯 目标: 掌握使用 `ethclient` 库进行以下操作：

1. **历史数据查询：** 通过 `FilterLogs` 高效过滤和分页查询历史合约事件（Logs）。

2. **实时数据监控：** 使用 `SubscribeNewHead` 和 `SubscribePendingTransactions` 实时监听新区块和待处理交易。

3. **链上状态读取：** 使用 `CallContract` 读取合约的只读状态，并探索回溯到任意历史状态的能力。

### I. FilterLogs

#### 背景知识

EVM 日志（Log）是智能合约与链下世界通信的桥梁，是合约执行期间产生的只读数据记录，主要用于前端交互、数据索引和状态监控。

##### 1. Log 核心结构

一个 EVM Log 包含三个核心部分：

| 字段 | 说明 | 关键特性 |
| :--- | :--- | :--- |
| **Address** | 触发该日志的合约地址 | 标识事件的来源 |
| **Topics** | 用于索引的字段数组 | 最多 4 个，每个 32 字节，用于 Bloom Filter 快速查找 |
| **Data** | 非索引的负载数据 | 包含无法直接搜索的具体数值（如转账金额、复杂结构体） |

##### 2. Topics 详解

**Topics** 是日志中最关键的部分，决定了如何过滤和查找事件。

- **Topic 0 (事件签名):**
  - 必填项（匿名事件除外），用于标识事件类型
  - 计算公式: $Topic_0 = Keccak\text{-}256(\text{"EventName(type1,type2,...)"})$
  - 注意: 签名字符串中不能包含参数名称，且参数类型间不能有空格

- **Topic 1-3 (索引参数):**
  - 对应 Solidity 中被标记为 `indexed` 的参数
  - 用于快速筛选（例如："查询所有 A 转出的记录"）

##### 什么是 Event Signature？

**Event Signature（事件签名）** 是事件的唯一标识符，用于在日志中识别特定类型的事件。

- **定义：** 事件签名字符串格式为 `EventName(type1,type2,...)`，其中只包含事件名称和参数类型，不包含参数名称
- **计算：** 对签名字符串进行 Keccak-256 哈希，得到 32 字节的哈希值，存储在 Topic 0 中
- **作用：** 通过匹配 Topic 0，可以快速过滤出特定类型的事件（如所有 `Transfer` 事件）

**示例：**
- 事件定义: `event Transfer(address indexed from, address indexed to, uint256 value);`
- 事件签名: `Transfer(address,address,uint256)`
- Topic 0: `Keccak256("Transfer(address,address,uint256)")`

##### 3. 示例：ERC-20 Transfer 事件

以标准的 ERC-20 `Transfer` 事件为例：

```solidity
// 注意 indexed 关键字
event Transfer(address indexed from, address indexed to, uint256 value);
```

**执行场景：** 用户 A 向用户 B 转账 100 代币，合约执行 `emit Transfer(A, B, 100);`

**生成的 Log 结构：**

| 字段 | 值 | 说明 |
| :--- | :--- | :--- |
| **Topic 0** | `Keccak256("Transfer(address,address,uint256)")` | 事件签名哈希 |
| **Topic 1** | `0x000...用户A地址` (32 字节) | 第一个 `indexed` 参数 (from) |
| **Topic 2** | `0x000...用户B地址` (32 字节) | 第二个 `indexed` 参数 (to) |
| **Data** | `100` (十六进制) | 未标记 `indexed` 的参数 (value) |

**特点：** Data 字段存储更便宜，但无法直接通过以太坊节点 API 进行条件过滤。

##### 4. Log 的存储特性与应用

- **Gas 经济学：**
  - **Storage:** 永久存储在状态树中，所有合约可见，读写昂贵
  - **Log:** 存储在交易收据中，合约无法读取，Gas 费用远低于 Storage

- **应用场景：**
  - **前端响应:** MetaMask 等钱包监听 Log 更新余额
  - **数据索引:** The Graph/Dune 通过 Topic 过滤构建历史数据库
  - **链下触发器:** 中心化交易所收到 Log 后自动入账

##### 底层的 eth_call 是什么？

**`eth_call`** 是以太坊客户端（如 Geth）用于进行"只读查询"的核心 JSON-RPC 方法。

- **功能：** 模拟执行合约的函数调用（主要是读取状态的函数），获取链上数据
- **特点：**
  - **不发送交易**，不消耗 Gas
  - **不改变**区块链状态
  - 可以查询**历史区块状态**（通过指定 block number 参数）
- **应用：** 
  - 预先验证交易是否会成功
  - 读取合约的只读状态
  - 对任意历史状态进行"时间旅行"式查询

**注意：** `FilterLogs` 底层通过 `eth_getLogs` RPC 方法实现，而 `CallContract` 则使用 `eth_call` 方法。

#### 基础实现

通过合约地址和 Event Signature 过滤日志的完整实现代码请参考：[log_filter.go](./log_filter.go)

该代码实现了以下核心功能：

1. **代理配置：** 配置 HTTP 代理以访问 Infura RPC 服务
2. **RPC 连接：** 使用自定义 HTTP 客户端连接到以太坊节点
3. **事件签名计算：** 计算 `Transfer(address,address,uint256)` 事件的签名哈希（Topic 0）
4. **日志过滤：** 使用 `FilterLogs` 方法查询指定合约地址和事件签名的历史日志

#### 使用说明

**前置条件：**

1. **获取 Infura API Key：**
   - 访问 [MetaMask Developer](https://developer.metamask.io/) 注册账号
   - 创建新项目，选择 Ethereum 网络
   - 复制 API Key（格式：`https://mainnet.infura.io/v3/YOUR_API_KEY`）
   - 在代码文件 [log_filter.go](./log_filter.go) 中替换 `InfuraURL` 常量

2. **配置代理（中国大陆用户）：**
   - 代码中已配置代理支持，请根据实际情况修改 `PROXY_PORT` 常量
   - 常见代理端口：
     - Clash: 7890 (HTTP), 7891 (SOCKS5)
     - V2Ray: 10808 (HTTP), 10809 (SOCKS5)
     - Shadowsocks: 1080 (SOCKS5)
   - 为保证可以顺利连接, 请尽量打开**全局代理**模式

**环境配置：**

- 初始化依赖：运行 `go mod tidy` 自动安装所需包
- 如遇 Go 包安装问题（Windows），设置代理：`$env:GOPROXY="https://goproxy.cn,direct"`
- 运行代码：`go run log_filter.go`

**代码实现说明：**

参考 [log_filter.go](./log_filter.go) 中的实现，该代码实现了**根据合约地址和事件签名过滤历史日志**的功能：

1. **地址过滤：** 通过 `Addresses: []common.Address{usdcAddr}` 指定查询 USDC 合约地址
2. **事件签名过滤：** 通过 `Topics: [][]common.Hash{{transferEventSignature}}` 指定 `Transfer` 事件的签名（Topic 0）
3. **区块范围：** 查询最新 100 个区块内的日志
4. **查询方法：** 使用 `client.FilterLogs(ctx, query)` 执行过滤查询

#### 输出示例与解释

运行成功后，输出示例如下：

```text
2025/12/10 19:15:16 开始配置代理并连接到以太坊客户端
2025/12/10 19:15:16 连接到以太坊客户端成功 (已配置代理)
2025/12/10 19:15:16 正在获取最新区块号...
2025/12/10 19:15:18 最新区块号: 23981946
2025/12/10 19:15:18 查询 USDC 地址: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
2025/12/10 19:15:18 查询区块范围: 23981846 到 23981946 (共 100 个区块)
2025/12/10 19:15:18 开始查询日志...
✅ 成功: 在区块 23981846 到 23981946 之间找到了 6645 条 Transfer 事件日志
--- 第一条 Log 详情 ---
TxHash: 0x3e12511e30a45f3b6d422d8f98c9f9a4f437c22dff51118fe244d796bcc2d21e
BlockNumber: 23981846
Topics: [0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef 0x00000000000000000000000087f643460e3d26efc839f61c2997753a30e2c72e 0x000000000000000000000000432505f4c6409d64ba53ea34b09365e9c9b446a4]
注意: 要获取可读的转账金额，需要使用 ABI 解码 log.Data 字段。
```

**输出解释：**

| 输出内容 | 说明 |
| :--- | :--- |
| **最新区块号: 23981946** | 当前以太坊主网的最新区块高度 |
| **查询区块范围: 23981846 到 23981946** | 查询最近 100 个区块（23981846-23981946） |
| **找到了 6645 条 Transfer 事件日志** | 在指定范围内，USDC 合约共产生了 6645 次转账事件 |
| **TxHash** | 包含该事件的交易哈希 |
| **BlockNumber** | 该事件所在的区块号 |
| **Topics[0]** | `0xddf2...` 是 `Transfer(address,address,uint256)` 的事件签名哈希 |
| **Topics[1]** | `0x000...87f6...` 是转账发送方地址（from，填充至 32 字节） |
| **Topics[2]** | `0x000...4325...` 是转账接收方地址（to，填充至 32 字节） |
| **log.Data** | 包含转账金额（需要 ABI 解码才能读取） |

**注意：** 代码成功实现了根据合约地址（USDC）和事件签名（Transfer）过滤历史日志的功能。

### Challenge⚔️: 高通量数据的高效查询和处理

在实际应用中，查询大量历史日志（如 Uniswap V2 的 Swap 事件）会面临以下挑战：

1. **数据量巨大：** 单次查询可能返回数万条日志，导致超时或内存溢出
2. **API 限制：** RPC 服务商（如 Infura）有 RPS（每秒请求数）限制
3. **网络错误：** 需要处理连接超时、临时网络故障等异常情况

**挑战目标：** 实现一个健壮的高通量日志查询系统，支持分页查询、错误重试和 RPS 限制。

#### 代码框架

完整的代码框架和实现请参考：[log_filter_big.go](./log_filter_big.go)

该代码框架提供了以下功能模块：

1. **分页查询：** `paginatedQueryLogs()` - 将大范围区块分割成多个小范围，逐页查询并合并结果
2. **错误重试：** `queryLogsWithRetry()` - 查询失败时自动重试，最多重试 MaxRetries 次
3. **速率限制：** `RateLimiter` - 控制请求频率，避免触发 API 的 RPS 限制
4. **完整查询：** `queryHighVolumeLogs()` - 结合分页、重试和速率限制的完整查询函数

代码中包含标记为 `// TODO: your code here` 的部分，需要您完成实现。

#### 实现提示

参考 [log_filter_big.go](./log_filter_big.go) 中的代码框架，需要完成以下部分：

1. **分页查询：** 将大范围区块分割成多个 `MaxBlockRange` 大小的小范围，逐页查询
   - 计算当前页的结束区块号（不能超过总结束区块）
   - 调用 `client.FilterLogs()` 查询当前页
   - 合并结果并更新起始区块

2. **错误重试：** 使用固定延迟，在查询失败时自动重试
   - 实现重试循环（最多 MaxRetries 次）
   - 失败时等待 RetryDelay 后重试
   - 达到最大重试次数后返回错误

3. **RPS 限制：** 使用时间戳记录上次请求时间，确保请求间隔不小于 `RequestInterval`
   - 计算距离上次请求的时间间隔
   - 如果间隔小于 interval，则等待剩余时间
   - 更新 lastRequestTime

#### 测试建议

- 先用小范围区块（如 100 个区块）测试基本功能
- 逐步增大查询范围，观察分页和速率限制的效果
- 模拟网络错误（如断开代理），验证重试机制是否生效

---