

# Part II: Geth 进阶

**回顾:**
在 Part I 中，我们掌握了 **历史数据的考古**：

  * 使用 `FilterLogs` 配合 `Topic` 和 `Event Signature` 精准定位历史事件。
  * 理解了 `Block`、`Transaction` 和 `Receipt` (Logs) 的关系。
  * 解决了高通量查询（Pagination）和 API 限制的问题。

**🔥 下一步：** 区块链不仅仅是静态的历史数据库，它是一条奔流不息的河。
本部分我们将学习 **实时数据的监控 (Live Monitoring)**。这将是你编写 MEV Bot、链上监控报警系统（如大额转账监控）或实时数据看板的基础。

-----

## 内容: 实时订阅与客户端架构

🎯 **目标:**

1.  **架构认知：** 彻底理清 `rpc.Client`, `ethclient`, `gethclient` 的区别与联系。
2.  **区块监听：** 使用 `SubscribeNewHead` 第一时间获取新区块生成信号。
3.  **交易池监听：** 使用 `SubscribePendingTransactions` 监听未打包交易（Mempool），这是 MEV 的战场。

-----

### I. Geth 客户端架构 (The Client Hierarchy)

在使用 Go 开发以太坊应用时，你经常会看到几种不同的 Client 初始化方式。如果不理解它们的层级关系，看源码时会非常晕。

#### 1. 三层架构模型

这三层客户端的关系类似于**计算机系统的分层架构**：

| 客户端层级 | 包路径 (`go-ethereum`) | 作用与特点 | 类比说明 |
| :--- | :--- | :--- | :--- |
| **RPC Client**<br>(底层) | `rpc` | **基础通信层**。负责建立 TCP/HTTP/WebSocket 连接，发送原始 JSON 请求并接收响应。它不关心业务逻辑，只管传输数据包。 | **硬件层**<br>就像计算机的硬件（CPU、内存、网卡），只负责底层的物理通信，不关心传输的是什么内容。 |
| **EthClient**<br>(标准层) | `ethclient` | **通用标准层**。封装了以太坊通用的 JSON-RPC 方法（如 `eth_getBalance`, `eth_call`）。它是大多数开发者的首选。它底层持有一个 `rpc.Client`。 | **操作系统层**<br>就像操作系统提供的标准 API（如 Windows API、MacOS syscall），定义了通用的接口规范，所有以太坊节点都遵循这些标准。 |
| **GethClient**<br>(特化层) | `eth/gethclient` | **Geth 专用层**。封装了 Geth 节点特有的、非通用标准的 API（通常涉及节点管理、TxPool 深度操作等）。它底层也持有一个 `rpc.Client`。 | **应用层**<br>就像特定操作系统上的专用软件（如 macOS 的特定应用），只能与 Geth 节点配合使用，其他客户端（如 Nethermind、Erigon）可能不支持这些接口。 |

**关键理解：**

- **兼容性关系：** 就像你不能在 macOS 上直接运行 Windows 的 `.exe` 文件，`GethClient` 的方法只能在 Geth 节点上使用，不能用于其他客户端。
- **依赖关系：** `EthClient` 和 `GethClient` 都依赖 `RPC Client`，就像应用程序依赖操作系统，操作系统依赖硬件。
- **选择原则：** 优先使用 `EthClient`（通用性强），只有在需要 Geth 特有功能时才使用 `GethClient`。

#### 2\. 为什么需要区分？

  * **通用性 vs 功能性**：如果你只需要查询余额、发送交易，用 `ethclient` 足够了。但如果你需要订阅更底层的**待处理交易详情**，或者访问 Geth 特有的 `txpool` 命名空间，你需要 `gethclient`。

-----

### II. Subscribe (订阅模式)

**背景知识：**

  * **协议要求：** 订阅功能必须使用 **WebSocket (WSS)** 或 **IPC** 连接。HTTP 是无状态的，无法维持长连接推送数据。
  * **编程模式：** Go 语言中主要通过 `channel` (通道) 来接收推送数据。

#### 1\. 监听新区块 (`Client.SubscribeNewHead`)

这是所有监控程序的“心跳”。每当网络中产生一个新区块，你的程序会立即收到通知。

  * **方法来源：** `ethclient`
  * **应用场景：**
      * 更新本地数据库的区块高度。
      * 触发新的合约状态检查（如 Chainlink Oracle 更新）。

#### 2. 监听待处理交易 (`gethClient.SubscribePendingTransactions`)

这是 **MEV (最大可提取价值)** 和 **PVP (链上博弈)** 的核心。

**方法来源：** `ethclient` 也有此方法，但 `gethclient` 提供了更贴合 Geth 节点特性的封装（在某些版本中返回的数据结构略有不同，或者支持特定的过滤）。通常我们指监听 Mempool 中的 Transaction Hash。

**数据流：**

1. **用户发送交易** → 交易被广播到以太坊网络
2. **节点接收并验证** → 交易进入节点的 **Mempool (交易池)**
3. **节点推送 Hash 给订阅者** → 你的程序通过 WebSocket 实时收到交易 Hash
4. **矿工/Validator 打包** → 交易被选入区块并确认

**为什么交易会进入 Mempool？**

- **Mempool（Memory Pool）** 是每个以太坊节点维护的**待处理交易池**。
- 当用户通过钱包或 DApp 发送交易时，交易首先被广播到网络中的节点。
- 节点收到交易后会进行初步验证（签名、nonce、Gas 价格等），如果通过验证，就会将交易放入 Mempool 等待被打包。
- Mempool 中的交易处于 **Pending（待处理）** 状态，还没有被确认。

**为什么节点会推送 Hash 给订阅者？**

- **实时性需求：** 许多应用（如 MEV Bot、套利机器人）需要在交易被打包前就获取信息，以便快速响应。
- **订阅机制：** 通过 WebSocket 订阅，节点会在新交易进入 Mempool 时主动推送，而不是让客户端不断轮询。
- **效率优势：** 推送模式比轮询更高效，减少了不必要的网络请求，同时能保证实时性。

**注意：** 订阅通常只返回 **TxHash**。如果你想知道交易内容（比如是不是在买入某个 Token），你拿到 Hash 后需要立即调用 `TransactionByHash` 去查询详情。 

-----

### III. 实战代码 (Code Practice)

#### 环境准备

**前置条件：启动本地 Geth 节点**

使用本地节点可以避免网络代理问题，速度最快且功能最完整。

1. **安装 Geth：**
   - 访问 [Geth 官网](https://geth.ethereum.org/) 下载并安装
   - 或使用包管理器：
     ```bash
     # macOS
     brew install ethereum
     
     # Linux (Ubuntu/Debian)
     sudo apt-get install ethereum
     ```

2. **启动 Geth 节点并启用 WebSocket：**
   ```bash
   # 连接到主网并启用 WebSocket
   geth --mainnet --ws --ws.addr 0.0.0.0 --ws.port 8546 --ws.api eth,net,web3
   
   # 或者连接到 Sepolia 测试网（同步更快）
   geth --sepolia --ws --ws.addr 0.0.0.0 --ws.port 8546 --ws.api eth,net,web3
   ```
   
   **参数说明：**
   - `--ws`: 启用 WebSocket 服务器
   - `--ws.addr 0.0.0.0`: 监听所有网络接口（也可以使用 127.0.0.1 仅本地访问）
   - `--ws.port 8546`: WebSocket 端口（默认 8546）
   - `--ws.api eth,net,web3`: 启用的 API 命名空间

3. **等待节点同步：**
   - 首次启动需要同步区块链数据，这可能需要较长时间
   - 可以使用 `--syncmode light` 启动轻节点模式（同步更快但功能受限）
   - 或者使用 `--syncmode snap` 使用快照同步（推荐，速度较快）

**环境配置：**

- 初始化依赖：运行 `go mod tidy` 自动安装所需包
- 如遇 Go 包安装问题（Windows），设置代理：`$env:GOPROXY="https://goproxy.cn,direct"`
- 确保本地 Geth 节点正在运行
- 运行代码：`go run monitor_setup.go`

#### 代码实现

完整的实现代码请参考：[monitor_setup.go](./monitor_setup.go)

该代码展示了如何：

1. **建立 WebSocket 连接：** 使用 `rpc.DialContext` 连接到本地 Geth 节点
2. **复用 RPC 连接：** 同时初始化 `ethclient` 和 `gethclient`，共享同一个底层连接
3. **双通道监听：** 使用 Go 的 `channel` 机制并发监听新区块和待处理交易
4. **优雅退出：** 捕获系统信号（Ctrl+C），正确关闭订阅和连接


**核心功能：**

- **新区块监听：** 使用 `ethClient.SubscribeNewHead()` 实时获取新区块头信息
- **交易池监听：** 使用 `gethClient.SubscribePendingTransactions()` 监听 Mempool 中的新交易
- **错误处理：** 完善的错误处理和重连机制
- **资源清理：** 程序退出时正确取消订阅并关闭连接

#### 运行与输出解释

**运行步骤：**

1. **修改配置：** 在 [monitor_setup.go](./monitor_setup.go) 中替换 `NodeWSS` 为你的 WebSocket 地址
2. **配置代理：** 根据你的代理软件修改 `PROXY_PORT` 常量（如不需要代理可设为空字符串）
3. **运行代码：** `go run monitor_setup.go`
4. **观察输出：** 程序会实时显示新区块和待处理交易
5. **退出程序：** 按 `Ctrl+C` 优雅退出

**预期输出：**

```text
2025/12/10 20:00:00 开始连接到本地 WebSocket 节点
✅ 成功建立 RPC WebSocket 连接
🎧 开始监听新区块 (NewHeads)...
🎧 开始监听交易池 (Pending Transactions)...

📡 监控已启动，按 Ctrl+C 退出...

🌊 [Pending Tx] 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
🌊 [Pending Tx] 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
... (大量的交易 Hash 涌入) ...

📦 [New Block] Height: 19283001 | Hash: 0x789... | Time: 1709123456
🌊 [Pending Tx] 0x456def789abc123456def789abc123456def789abc123456def789abc123456
...
```

**输出解释：**

| 输出内容 | 说明 |
| :--- | :--- |
| **✅ 成功建立 RPC WebSocket 连接** | WebSocket 连接已建立，可以开始订阅 |
| **🎧 开始监听新区块** | 已订阅新区块事件，等待区块生成 |
| **🎧 开始监听交易池** | 已订阅待处理交易事件，等待新交易进入 Mempool |
| **🌊 [Pending Tx]** | 新交易进入 Mempool，显示交易 Hash |
| **📦 [New Block]** | 新区块已生成，显示区块高度、哈希和时间戳 |

**注意事项：**

- **交易量巨大：** Mempool 中的交易数量非常大，每秒可能有数百甚至数千笔交易，输出会非常频繁
- **节点同步：** 确保本地 Geth 节点已完全同步，否则可能无法获取最新的区块和交易
- **资源消耗：** 运行全节点需要较大的磁盘空间（主网约 1TB+）和内存，建议使用 SSD
- **轻节点模式：** 如果资源有限，可以使用 `--syncmode light` 启动轻节点，但功能可能受限

