# 使用 Geth 读取链上数据

本周目标：

- 学会用 Geth 的 Go 客户端从 RPC 节点读取链上信息
- 理解区块链底层数据结构（block、transaction、receipt）

这些是做 DApp、链上分析、合约调试等的基础。

# Part I - Geth 简介

## 背景：以太坊网络的运作方式

可以先把以太坊理解成一个由全球许多计算机共同维护的公共账本，没有中心服务器。要让这个系统正常运作，主要涉及三个概念：**以太坊客户端、节点、RPC**。

### 1. 以太坊客户端：协议的具体实现

以太坊客户端是一类遵循以太坊协议的软件实现，比如 Geth、Nethermind、Erigon 等。它们负责：

- 按协议格式解析区块和交易
- 验证新区块是否合法
- 维护本地区块链状态（账户余额、合约存储等）
- 和其他节点进行 P2P 通信、同步数据

只有安装并运行这些客户端软件，电脑才能真正“加入”以太坊网络。

> 使用情景：  
> 你在电脑上安装并运行 Geth，实际上就是在运行一个以太坊客户端实例，它会开始从网络上同步区块，把本地变成一个以太坊节点。

### 2. 节点：运行客户端的软件实例

“节点”指的是**运行了以太坊客户端程序的机器**。从功能和数据完整性角度，一般分为：

- **全节点（full node）**：保存当前完整状态和必要的历史数据，可以独立验证新区块和交易；
- **轻节点（light node）**：只保存少量数据和区块头，需要向其他节点请求详细信息；
- **归档节点（archive node）**：不仅保存当前状态，还保存所有历史状态，方便做历史查询和分析，但资源消耗很大。

节点之间通过 P2P 网络互连，互相转发新区块、交易，并进行验证，以保证网络整体的一致性和安全性。

> 使用情景： 你在钱包里发起一笔转账交易.
> 交易从钱包发出之后，会先发送给一个或多个节点，这些节点再向网络扩散。最终，有矿工/验证人节点把它打包进区块，你的交易才真正“上链”。

### 3. RPC：给外部程序用的访问接口

RPC（Remote Procedure Call，远程过程调用）是节点向外暴露的一组标准接口，用来**让其他程序查询或提交数据**，常见是 HTTP RPC 或 WebSocket RPC。

通过 RPC，你可以：

- 查询账户余额、交易、区块等信息
- 调用合约的只读方法（`eth_call`）
- 广播一笔签名好的交易（`eth_sendRawTransaction`）

RPC 的好处是：你不需要在自己的程序里实现底层网络协议，只要按 JSON-RPC 的格式发 HTTP 请求即可。

> 使用情景：  
> 你写了一个区块浏览器网站，前端/后端服务不会直接跑一个全节点，而是通过 RPC 问某个节点：“给我某个区块的详细信息”、“给我这个账户的最近交易”。

---

## Geth：最主流的以太坊客户端之一

Geth（Go Ethereum）是用 Go 语言实现的以太坊客户端，也是目前使用最广泛的实现之一。它主要包含两部分：

### 1. 命令行程序 `geth`

安装 Geth 后，你会得到一个名为 `geth` 的命令行工具。运行它可以：

- 启动一个以太坊节点（全节点 / 轻节点等）
- 同步主网、测试网（如 Sepolia）的数据
- 管理本地账户（创建、导出、签名）
- 对外提供 HTTP / WebSocket RPC 接口

例如：

```bash
geth --sepolia --http --http.api eth,net,web3
```

这条命令会启动一个连到 Sepolia 测试网的节点，并在本地开一个 HTTP RPC 接口，供你或其他程序来查询链上数据。

> 使用情景：  
> 如果你要自己搭一个“私有的 RPC 节点”做数据分析，可以在一台云服务器上跑 `geth`，开 HTTP RPC，然后你的分析脚本就可以连这台服务器，而不是用公共 RPC。

#### 公共 RPC 节点 vs 私有 RPC 节点

从 Geth / 客户端库的视角看，区别就是你 `Dial` 的 URL 不同，但在权限和成本上差异很大：

- **公共 RPC**
  - 例子：Infura、Alchemy、公共的 Sepolia RPC 等；
  - 优点：不用自己同步链、配置简单，适合课程作业、demo、小工具；
  - 限制：有调用频率/配额限制，有些高成本接口可能被关掉，节点配置不可控。

- **私有 RPC**
  - 自己或团队运行的 Geth / 其他客户端节点，对外开 RPC；
  - 优点：可完全控制节点类型和配置、无第三方限流、访问模式不暴露给服务商；
  - 成本：要自己承担同步、存储和运维，适合长期运行的服务端、交易所、大规模数据分析等。

> 使用情景：  
> - 本课程 / 一般练习：直接连公共的 Sepolia RPC 即可，比如：`https://ethereum-sepolia-rpc.publicnode.com`。  
> - 需要扫主网大量历史数据、或做交易所钱包服务时，更倾向于自己起一个 Geth 节点，跑私有 RPC。

### 2. Go 客户端库（`go-ethereum`）

除了命令行工具，Geth 还提供了一套 Go 客户端库，方便在 Go 代码里和以太坊交互。常用的是 `ethclient` 包：

```go
import (
    "context"

    "github.com/ethereum/go-ethereum/ethclient"
)

func main() {
    // 连接公共 RPC（默认用法）
    client, err := ethclient.Dial("https://ethereum-sepolia-rpc.publicnode.com")
    // 也可以换成你自己的私有 RPC 节点
    // client, err := ethclient.Dial("http://your-server-ip:8545")

    if err != nil {
        panic(err)
    }
    defer client.Close()

    // 后面可以用 client 查询区块、交易、余额等
}
```

在本周任务中，我们不自己运行 Geth 节点，而是侧重使用 **Go 客户端库 + 公共 Sepolia RPC** 来读取链上数据，并理解 block / transaction / receipt 的结构。

# Part II - Go 语言环境准备

*本周需要用 Go 编写与节点交互的简单程序。本节只介绍完成本课所需的**最小知识**。*

Go（Golang）是 Google 开发的一门静态强类型语言，语法相对简洁，内置并发支持。Geth 本身就是用 Go 写的，因此官方提供的以太坊客户端库也是用 Go 实现的。你只需要会：

- 安装 Go 并能在命令行运行 `go`；
- 新建一个最简单的 Go 项目；
- 知道如何 `import` 其他库，并调用它们提供的函数。

关于 Go 的语法，可以参考：

+ A Tour of Go https://go.dev/tour/list
+ 中文版 https://tour.go-zh.org/list

## 1. 安装 Go

官方下载：https://go.dev/dl/

按系统提示安装完成后，在命令行（PowerShell / cmd）检查：

```bash
go version
```

如果能看到版本号（例如 `go version go1.22.3 windows/amd64`），说明安装成功。

> 小提示：  
> 后续所有 `go xxx` 命令都是在命令行里执行，而不是在 Go 源码文件里写。

## 2. 新建项目

在你准备存放本周代码的目录下，新建一个文件夹并初始化 Go 模块：

```bash
mkdir week3-geth
cd week3-geth
go mod init week3-geth
```

`go mod init` 会创建一个 `go.mod` 文件，记录当前项目的模块名和依赖信息，后面 `go get` 的第三方库都会写进这里。

创建 `main.go`：

```go
package main

import "fmt"

func main() {
    fmt.Println("hello go")
}
```

运行：

```bash
go run main.go
```

如果能在命令行看到输出 `hello go`，说明你的 Go 环境和项目结构是正常的。

> 你可以把后面所有示例代码都放在这个 `main.go` 里，逐步替换和扩展。

## 3. 安装 go-ethereum 库

本课所有与以太坊交互的能力，都来自官方的 `go-ethereum` 库。我们用 `go get` 把它加入当前项目依赖：

```bash
go get github.com/ethereum/go-ethereum
```

执行完成后，你会在 `go.mod` / `go.sum` 里看到相应记录；在代码里就可以这样引用：

```go
import "github.com/ethereum/go-ethereum/ethclient"
```

> 中国大陆访问 go-ethereum 依赖失败，可设置 Go 代理：
> - **Windows (PowerShell)：**
>   ```powershell
>   $env:GOPROXY="https://goproxy.cn,direct" # 临时代理, 在同一终端会话生效
>   ```
> - **Linux/macOS (bash/zsh)：**
>   ```bash
>   export GOPROXY=https://goproxy.cn,direct # 临时代理, 在同一终端会话生效
>   ```
>   设置后重新执行 `go get` 命令即可。

本课用到的 Go 知识基本只有：

- `package main` / `func main()` 入口函数；
- `import` 引入标准库和第三方库；
- 基本的函数调用、错误处理（`if err != nil { ... }`）；
- 使用 `go-ethereum` 提供的类型和方法（例如 `ethclient.Dial`、`HeaderByNumber` 等）。

其余语法如果暂时不熟悉，可以边查边用，不影响完成本周任务。

# Part III - 使用 go-ethereum 读取链上数据


引入客户端：

```go
import "github.com/ethereum/go-ethereum/ethclient"
```

连接到 Sepolia RPC

```go
client, err := ethclient.Dial("https://ethereum-sepolia-rpc.publicnode.com")
if err != nil {
    panic(err)
}
```

获取当前区块高度

```go
header, err := client.HeaderByNumber(context.Background(), nil)
fmt.Println("current block:", header.Number.String())
```

查询区块

```go
blockNumber := big.NewInt(123456)
block, _ := client.BlockByNumber(context.Background(), blockNumber)

fmt.Println("hash:", block.Hash().Hex())
fmt.Println("parent:", block.ParentHash().Hex())
fmt.Println("tx count:", len(block.Transactions()))
```

查询交易与回执

```go
txHash := common.HexToHash("0x你的交易哈希")
tx, _, _ := client.TransactionByHash(context.Background(), txHash)

fmt.Println("to:", tx.To())
fmt.Println("value:", tx.Value().String())
```

Receipt：

```go
receipt, _ := client.TransactionReceipt(context.Background(), txHash)

fmt.Println("status:", receipt.Status)
fmt.Println("logs:", receipt.Logs)
```

合并到一起的一个样例，该样例仅打印了部分字段，建议同学们修改代码，打印出完整的结构: 
```go
package main

import (
    "context"
    "fmt"
    "log"
    "math/big" 
    // go 标准库

    "github.com/ethereum/go-ethereum/common"
    "github.com/ethereum/go-ethereum/ethclient" // 如果提示缺少依赖, 按照给出的报错信息安装即可
)

func main() {
    ctx := context.Background()

    client, err := ethclient.Dial("https://ethereum-sepolia-rpc.publicnode.com")
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    header, err := client.HeaderByNumber(ctx, nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Current block: %s\n", header.Number.String())

    targetBlock := big.NewInt(123456)
    block, err := client.BlockByNumber(ctx, targetBlock)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Block #%s hash: %s\n", block.Number().String(), block.Hash().Hex())
    fmt.Printf("Parent hash: %s\n", block.ParentHash().Hex())
    fmt.Printf("Tx count: %d\n", len(block.Transactions()))
//==========================
	txHash := common.HexToHash("0x903bd6b44ce5cfa9269d456d2e7a10e3d8a485281c1c46631ec8f79e48f7accb") //测试用交易hash, 你可以替换成任何你想查询的交易hash
//=========================
    tx, isPending, err := client.TransactionByHash(ctx, txHash)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Tx pending: %t\n", isPending)
    if to := tx.To(); to != nil {
        fmt.Printf("To: %s\n", to.Hex())
    } else {
        fmt.Println("To: contract creation")
    }
    fmt.Printf("Value (wei): %s\n", tx.Value().String())

    receipt, err := client.TransactionReceipt(ctx, txHash)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Receipt status: %d\n", receipt.Status)
    fmt.Printf("Logs: %d entries\n", len(receipt.Logs))
}
```

```bash
Current block: 9750075
Block #123456 hash: 0x2056507046b07a5d7ed4f124a7febce2aec7295b464746523787b8c2acc627dc
Parent hash: 0x93bff867b68a2822ee7b6e0a4166cfdf5fc4782d60458fae1185de9b2ecdba16
Tx count: 0
Tx pending: false
To: 0x9Bd28675069f200961B50F13C476aDa5e7067C31
Value (wei): 0
Receipt status: 1
Logs: 2 entries
# 如果一切正常, 你将会得到类似于上面的输出结果
# 你可以修改代码打印任何你想查询的数据和数据结构
```

# Follow Up - 理解 block, transaction, receipt 的结构

上一节中查询到的数据会包含大量字段。本部分任务要求理解其中关键字段的含义。

关于 Block 建议理解的字段包括：

- number
- hash
- parentHash
- timestamp
- gasUsed / gasLimit
- transactions

Follow-Up：

- 为何 parentHash 能形成区块链？
- gasLimit 如何影响合约执行

***

关于 Transcation 建议理解的字段包括：

- nonce
- from / to
- input (call data)
- gas / gasPrice
- value
- type (legacy, EIP-1559)

Follow-Up：

- 什么是 ABI ？一笔交易最终执行逻辑是如何解析 input 的

***

关于 Receipt 建议理解的字段包括:

- status
- logs
- contractAddress

***

可供参考的资料包括但不限于，也可以自行检索：

+ https://www.bilibili.com/video/BV1Vt411X7JF
+ 以太坊文档里关于 Blocks 的介绍：https://ethereum.org/developers/docs/blocks/
+ https://ethereum.org/developers/docs/transactions/
+ https://www.geeksforgeeks.org/computer-networks/ethereum-block-structure/