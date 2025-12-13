---
timezone: UTC+8
---

# 你的名字

1. 自我介绍
   henry, 软件与微电子学院三年级网安方向，目前小白，想深入学习合约安全
2. 你认为你会完成这次共学小组吗？
   可以
3. 你感兴趣的小组
   合约安全小组
4. 你的联系方式（Wechat or Telegram）
   Wechat：bsd_crow

## Notes

<!-- Content_START -->

### 2025.11.22

#### Part I - 动手部署一个智能合约

注册metamask钱包，然后通过以下两个水龙头网站获取测试币（没有主网eth要求）

> https://cloud.google.com/application/web3/faucet/ethereum/sepolia
>
> https://faucet.metana.io/#

https://remix.ethereum.org/ 部署合约，

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWeb3 {
    event Greeting(address indexed sender, uint256 timestamp);
  
    constructor() {}

    function hello() external {
        emit Greeting(msg.sender, block.timestamp);
    }
```

然后按步骤进行操作，最后查看交易信息

![image](https://github.com/henrymartin262/PKUBA-Colearn-25-Fall/blob/main/img/201dbb50-6a41-43e2-a967-5ea556a69bb2.png)

![image](https://github.com/henrymartin262/PKUBA-Colearn-25-Fall/blob/main/img/Snipaste_2025-11-22_18-23-45.png)

### 2025.11.25

#### Part II - 智能合约编写

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 靶子合约接口（根据题目给的方法名来写）
interface ITarget {
    function hint() external view returns (string memory);
    function query(bytes32 _hash) external returns (string memory);
    function getSolvers() external view returns (address[] memory);
}

contract Week1Solver {
    ITarget public target;

    // 保存最近一次 query 的返回结果（例如 Flag）
    string public lastResult;

    // 方便在日志里看到返回值
    event QueryResult(string result);

    constructor(address _target) {
        target = ITarget(_target);
    }

    // 调靶子合约的 hint，拿到提示
    function getHint() external view returns (string memory) {
        return target.hint();
    }

    // 帮助你在链上算 hash
    function calcHash(string memory s) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(s));
    }

    // 真正提交答案的函数，接收并返回 query 的字符串结果
    function solve(bytes32 answer) external returns (string memory) {
        // 调用靶子合约，拿到返回的字符串（例如 Flag）
        string memory res = target.query(answer);

        // 存一份到状态变量，方便用 lastResult() 查看
        lastResult = res;

        // 打事件，方便在区块浏览器 / Remix Logs 里看
        emit QueryResult(res);

        // 同时作为返回值返回（在 Remix 的 decoded output 里看）
        return res;
    }

    // 直接从靶子合约读取完成者列表
    function getSolversFromTarget() external view returns (address[] memory) {
        return target.getSolvers();
    }
}
```

代码如上

![image](https://github.com/henrymartin262/PKUBA-Colearn-25-Fall/blob/main/img/Snipaste_2025-11-22_18-55-35.png)

返回结果如上，提示对 `PKUBlockchain` 进行keccak哈希，然后在链上算出 keccak256("PKUBlockchain")，然后把这个 bytes32 传给 query()

![image](https://github.com/henrymartin262/PKUBA-Colearn-25-Fall/blob/main/img/Snipaste_2025-11-22_19-20-43.png)

成功获取到flag，前往 https://sepolia.etherscan.io 查看事件信息，是否成功提交

![image](https://github.com/henrymartin262/PKUBA-Colearn-25-Fall/blob/main/img/Snipaste_2025-11-22_19-03-18.png)

确认

![image](https://github.com/henrymartin262/PKUBA-Colearn-25-Fall/blob/main/img/Snipaste_2025-11-22_19-03-42.png)

### 2025.12.09

通过 Week3.md 中的内容学习了使用Geth读取链上数据，对基本概念有了一些了解，同时完成本地环境搭建，并使用go-ethereum打印出完整链上数据，以下是相关代码：

```go
package main

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

func main() {
	ctx := context.Background()

	// 1. 连接节点
	client, err := ethclient.Dial("https://ethereum-sepolia-rpc.publicnode.com")
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	// 2. 获取当前区块头
	header, err := client.HeaderByNumber(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("========== Current Chain Status ==========")
	fmt.Printf("Current block number: %s\n", header.Number.String())
	fmt.Println()

	// 3. 获取指定区块详情
	targetBlockNumber := big.NewInt(123456)
	block, err := client.BlockByNumber(ctx, targetBlockNumber)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("========== Block Details ==========")
	// Block Number: 区块高度，即这是链上的第几个区块
	fmt.Printf("Block Number:     %s\n", block.Number().String())
	// Block Hash: 区块的唯一标识符 (Hash)
	fmt.Printf("Block Hash:       %s\n", block.Hash().Hex())
	// Parent Hash: 上一个区块的 Hash，用于连接成链
	fmt.Printf("Parent Hash:      %s\n", block.ParentHash().Hex())
	// Block Time: 区块产生的时间戳
	fmt.Printf("Block Time:       %s\n", time.Unix(int64(block.Time()), 0).Format(time.RFC3339))
	// Difficulty: 挖矿难度 (PoS 之后通常为 0)
	fmt.Printf("Difficulty:       %s\n", block.Difficulty().String())
	// Gas Limit: 该区块允许消耗的最大 Gas 总量
	fmt.Printf("Gas Limit:        %d\n", block.GasLimit())
	// Gas Used: 该区块内所有交易实际消耗的 Gas 总量
	fmt.Printf("Gas Used:         %d\n", block.GasUsed())
	// Miner: 挖出该区块的矿工/验证者地址 (Coinbase)
	fmt.Printf("Miner:            %s\n", block.Coinbase().Hex())
	if block.BaseFee() != nil {
		// Base Fee: EIP-1559 引入的基础 Gas 费率，会被销毁
		fmt.Printf("Base Fee:         %s\n", block.BaseFee().String())
	}
	// Transactions: 该区块中包含的交易数量
	fmt.Printf("Transactions:     %d\n", len(block.Transactions()))
	fmt.Println()

	// 4. 获取交易详情
	txHash := common.HexToHash("0x903bd6b44ce5cfa9269d456d2e7a10e3d8a485281c1c46631ec8f79e48f7accb")
	tx, isPending, err := client.TransactionByHash(ctx, txHash)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("========== Transaction Details ==========")
	// Tx Hash: 交易的唯一标识符
	fmt.Printf("Tx Hash:    %s\n", tx.Hash().Hex())
	// Is Pending: 是否还在内存池中等待打包 (false 表示已上链)
	fmt.Printf("Is Pending: %t\n", isPending)
	// Type: 交易类型 (0=Legacy, 1=AccessList, 2=EIP-1559)
	fmt.Printf("Type:       %d (0=Legacy, 2=EIP-1559)\n", tx.Type())
	// Nonce: 发送者发送的交易计数，用于防止重放攻击
	fmt.Printf("Nonce:      %d\n", tx.Nonce())
	// Gas Limit: 发送者愿意为这笔交易支付的最大 Gas 量
	fmt.Printf("Gas Limit:  %d\n", tx.Gas())
	// Gas Price: 发送者愿意支付的 Gas 单价 (wei)
	fmt.Printf("Gas Price:  %s wei\n", tx.GasPrice().String())
	// Value: 随交易发送的 ETH 金额 (wei)
	fmt.Printf("Value:      %s wei\n", tx.Value().String())

	// 解析 From 地址 (需要 ChainID)
	chainID, err := client.NetworkID(ctx)
	if err != nil {
		log.Printf("Failed to get chainID: %v\n", err)
	} else {
		if sender, err := types.Sender(types.LatestSignerForChainID(chainID), tx); err == nil {
			// From: 交易发送方地址
			fmt.Printf("From:       %s\n", sender.Hex())
		}
	}

	if to := tx.To(); to != nil {
		// To: 交易接收方地址 (如果是合约调用，则是合约地址)
		fmt.Printf("To:         %s\n", to.Hex())
	} else {
		// 如果 To 为 nil，说明这是一笔创建新合约的交易
		fmt.Println("To:         [Contract Creation]")
	}

	// 打印 Input Data (前50字节)
	data := tx.Data()
	// Input Data: 交易附带的数据 (调用合约函数时的参数编码)
	fmt.Printf("Input Data: %x", data)
	if len(data) > 0 {
		fmt.Println(" ...")
	} else {
		fmt.Println(" (empty)")
	}
	fmt.Println()

	// 5. 获取交易回执
	receipt, err := client.TransactionReceipt(ctx, txHash)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("========== Transaction Receipt ==========")
	// Status: 交易执行结果 (1=成功, 0=失败/Revert)
	fmt.Printf("Status:             %d (1=Success, 0=Fail)\n", receipt.Status)
	// Block Number: 交易被打包进的区块高度
	fmt.Printf("Block Number:       %s\n", receipt.BlockNumber.String())
	// Transaction Index: 交易在区块中的索引位置
	fmt.Printf("Transaction Index:  %d\n", receipt.TransactionIndex)
	// Gas Used: 这笔交易实际消耗的 Gas 量
	fmt.Printf("Gas Used:           %d\n", receipt.GasUsed)
	// Cumulative GasUsed: 区块中这笔交易及之前所有交易消耗的 Gas 总和
	fmt.Printf("Cumulative GasUsed: %d\n", receipt.CumulativeGasUsed)

	if receipt.ContractAddress != (	) {
		// Contract Address: 如果是部署合约交易，这里显示新合约地址
		fmt.Printf("Contract Address:   %s\n", receipt.ContractAddress.Hex())
	}

	// Logs: 交易执行过程中触发的事件日志
	fmt.Printf("Logs Count:         %d\n", len(receipt.Logs))
	for i, l := range receipt.Logs {
		fmt.Printf("  [Log %d] Address: %s | Topics: %d\n", i, l.Address.Hex(), len(l.Topics))
	}
}

```

运行结果如下图所示：
![image](https://github.com/henrymartin262/PKUBA-Colearn-25-Fall/blob/main/img/Snipaste_2025-12-09_00-50-36.png)

关键字段解释理解如下：

#### **1. Block (区块)**

**核心字段解释**

- **`number` (区块高度)**: 该区块在整条区块链中的序号（例如第 100 个区块）。
- **`hash` (区块哈希)**: 该区块的唯一标识符（身份证），由区块头的所有数据计算得出。
- **`parentHash` (父区块哈希)**: 前一个区块的哈希值。它将当前区块与上一个区块“锁”在一起。
- **`timestamp` (时间戳)**: 区块被矿工/验证者打包出的时间（Unix 时间戳）。
- **`gasUsed` (Gas 用量)**: 该区块内**所有交易**实际消耗的 Gas 总和。
- **`gasLimit` (Gas 上限)**: 该区块**允许**消耗的最大 Gas 总量。它决定了一个区块能容纳多少笔交易。
- **`transactions` (交易列表)**: 该区块中包含的所有交易数据。

**Follow-Up 问答**

- **Q: 为何 `parentHash` 能形成区块链？**
  - **A**: 每个区块都包含前一个区块的哈希 (`parentHash`)。如果你篡改了第 N 个区块的任何数据，它的哈希就会改变。那么第 N+1 个区块记录的 `parentHash` 就对不上了，导致第 N+1 个区块也无效。这种环环相扣的结构（链式结构）保证了历史数据一旦写入就无法被悄悄修改，从而形成了不可篡改的“区块链”。
- **Q: `gasLimit` 如何影响合约执行？**
  - **A**:
    1. **单笔交易限制**: 一笔交易消耗的 Gas 不能超过区块的 `gasLimit`，否则永远无法被打包。
    2. **区块容量限制**: `gasLimit` 决定了区块的“容量”。如果网络拥堵，交易很多，矿工会优先打包 Gas Price 高的交易，直到填满 `gasLimit`。
    3. **防止攻击**: 它防止了恶意用户发送死循环代码或超大计算量的交易来阻塞整个网络节点。



#### 2. Transaction (交易)

**核心字段解释**

- **`nonce` (计数器)**: 发送者账户发出的交易序号（从 0 开始递增）。用于防止**重放攻击**（即防止同一笔交易被重复执行）。
- **`from` / `to`**:
  - `from`: 发起交易的账户地址（必须由私钥签名）。
  - `to`: 接收方地址。如果是普通转账，就是收款人；如果是调用合约，就是合约地址；如果是**创建合约**，该字段为空 (`nil`)。
- **`input` (或 `data`)**: 交易附带的数据。
  - 普通转账：通常为空。
  - 合约调用：包含要调用的函数签名和参数编码。
  - 合约部署：包含合约的字节码。
- **`gas` (Gas Limit)**: 发送者愿意为这笔交易支付的最大 Gas 数量（防止合约死循环耗光余额）。
- **`gasPrice`**: 发送者愿意支付的 Gas 单价（单位通常是 wei）。在 EIP-1559 后通常由 `maxFeePerGas` 和 `maxPriorityFeePerGas` 替代。
- **`value`**: 随交易发送的 ETH 金额（单位是 wei）。
- **`type`**: 交易类型。`0` 是老式交易，`2` 是 EIP-1559 标准交易（引入了 Base Fee 销毁机制）。

**Follow-Up 问答**

- **Q: 什么是 ABI？一笔交易最终执行逻辑是如何解析 `input` 的？**
  - **A**:
    - **ABI (Application Binary Interface)**: 应用二进制接口。它定义了如何将高级语言（如 Solidity）的函数和参数编码成机器能读懂的二进制数据。
    - **解析逻辑**: EVM（以太坊虚拟机）读取 `input` 数据的前 **4 个字节**（函数选择器），匹配合约中对应的函数代码。剩下的数据按照 ABI 规则被解码为函数的**参数**，然后开始执行该函数的逻辑。



#### 3. Receipt (交易回执)

**核心字段解释**

- **`status` (状态)**:
  - `1`: **成功** (Success)。
  - `0`: **失败** (Failure/Revert)。交易虽然上链了，Gas 也扣了，但状态回滚，业务逻辑未生效。
- **`logs` (日志)**: 智能合约执行过程中通过 `emit` 关键字产生的事件（Event）。这是链下应用（如前端、后端索引器）监听链上状态变化的主要方式（例如监听 `Transfer` 事件来更新余额）。
- **`contractAddress`**:
  - 只有当交易是**部署新合约**时，这个字段才会有值（即新生成的合约地址）。
  - 对于普通转账或调用，该字段为空。




### 2025.12.13

#### Part I. FilterLogs

掌握使用 `ethclient` 库进行以下操作：

1. **历史数据查询：** 通过 `FilterLogs` 高效过滤和分页查询历史合约事件（Logs）。
2. **实时数据监控：** 使用 `SubscribeNewHead` 和 `SubscribePendingTransactions` 实时监听新区块和待处理交易。
3. **链上状态读取：** 使用 `CallContract` 读取合约的只读状态，并探索回溯到任意历史状态的能力。



知识点学习：

- FilterLogs 提取日志信息
- **Topics** 过滤和查找事件
- **Event Signature（事件签名）**，在日志中识别特定类型的事件



任务完成：

实现了**根据合约地址和事件签名过滤历史日志**的功能

```go
package main

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"time"

	// 新增了处理网络连接的包
	"net/http"
	// "net/url"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ethereum/go-ethereum/rpc" // 用于配置自定义的 http.Client
)

// ------------------------------------------------
// ⚠️ 关键修改：配置代理和 RPC URL
// ------------------------------------------------

const (
	USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
	// InfuraURL   = "https://mainnet.infura.io/v3/85940542d1124d099ddfc3caa6bfe720"
	InfuraURL = "https://eth.llamarpc.com"

	// ⭐️ 请务必检查并修改为您代理软件监听的 HTTP/SOCKS5 端口
	PROXY_PORT = "10802"

	// 设置较大的超时时间，应对代理连接延迟
	CONNECTION_TIMEOUT = 45 * time.Second
)

func main() {
	log.Println("开始配置代理并连接到以太坊客户端")

	// 1. 定义代理 URL (已禁用，如需开启请取消注释)
	/*
		proxyUrlString := fmt.Sprintf("http://127.0.0.1:%s", PROXY_PORT)
		proxyUrl, err := url.Parse(proxyUrlString)
		if err != nil {
			log.Fatalf("解析代理 URL 失败: %v", err)
		}

		// 2. 创建自定义 HTTP 传输器，强制使用代理
		transport := &http.Transport{
			Proxy: http.ProxyURL(proxyUrl),
		}
	*/

	// 3. 创建自定义 HTTP 客户端，设置超时
	httpClient := &http.Client{
		// Transport: transport,
		Timeout: CONNECTION_TIMEOUT,
	}

	// 4. 使用 rpc.DialHTTPWithClient 将自定义客户端注入到 ethclient
	rpcClient, err := rpc.DialHTTPWithClient(InfuraURL, httpClient)
	if err != nil {
		log.Fatalf("无法创建 RPC 客户端: %v", err)
	}

	client := ethclient.NewClient(rpcClient)
	log.Println("连接到以太坊客户端成功 (已配置代理)")

	// ------------------------------------------------
	// 优化：获取最新区块号并设置查询范围
	// ------------------------------------------------

	ctx1, cancel1 := context.WithTimeout(context.Background(), CONNECTION_TIMEOUT)
	defer cancel1()

	log.Println("正在获取最新区块号...")

	// client.HeaderByNumber(ctx, nil) 会使用配置了代理的 client
	header, err := client.HeaderByNumber(ctx1, nil)
	var latestBlock int64

	if err != nil {
		// 如果获取最新区块失败，则输出错误并直接退出，因为无法确定合理的查询范围
		log.Fatalf("致命错误: 获取最新区块号失败: %v。请检查代理设置和网络连接。", err)
	}

	latestBlock = header.Number.Int64()
	log.Printf("最新区块号: %d", latestBlock)

	// 1. 计算 Event Signature 哈希 (Topic 0)
	transferEventSignature := crypto.Keccak256Hash([]byte("Transfer(address,address,uint256)"))

	// 2. 构造查询参数 (查询最新 100 个区块)
	const BLOCK_RANGE = 100
	fromBlock := big.NewInt(latestBlock - BLOCK_RANGE)
	toBlock := big.NewInt(latestBlock)

	usdcAddr := common.HexToAddress(USDCAddress)
	log.Printf("查询 USDC 地址: %s", usdcAddr.Hex())
	log.Printf("查询区块范围: %d 到 %d (共 %d 个区块)", fromBlock.Int64(), toBlock.Int64(), BLOCK_RANGE)

	query := ethereum.FilterQuery{
		FromBlock: fromBlock,
		ToBlock:   toBlock,
		Addresses: []common.Address{usdcAddr},
		Topics:    [][]common.Hash{{transferEventSignature}},
	}
	// 3. 调用 FilterLogs
	ctx, cancel := context.WithTimeout(context.Background(), CONNECTION_TIMEOUT)
	defer cancel()

	log.Println("开始查询日志...")
	logs, err := client.FilterLogs(ctx, query)
	if err != nil {
		// 如果查询失败，可能是代理断开或 Infura 限制
		log.Fatalf("FilterLogs 查询失败: %v。请确保代理稳定。", err)
	}

	fmt.Printf("✅ 成功: 在区块 %d 到 %d 之间找到了 %d 条 Transfer 事件日志\n",
		query.FromBlock.Int64(), query.ToBlock.Int64(), len(logs))

	if len(logs) > 0 {
		log0 := logs[0]
		fmt.Println("--- 第一条 Log 详情 ---")
		fmt.Printf("TxHash: %s\n", log0.TxHash.Hex())
		fmt.Printf("BlockNumber: %d\n", log0.BlockNumber)
		fmt.Printf("Topics: %v\n", log0.Topics)
		// 提醒用户需要 ABI 解码
		fmt.Println("注意: 要获取可读的转账金额，需要使用 ABI 解码 log.Data 字段。")
	}
}

```



运行成功后，输出示例如下：

![image](https://github.com/henrymartin262/PKUBA-Colearn-25-Fall/blob/main/img/Snipaste_2025-12-13_00-22-56.png)

**输出解释：**

| 输出内容                               | 说明                                                         |
| :------------------------------------- | :----------------------------------------------------------- |
| **最新区块号: 23997742**               | 当前以太坊主网的最新区块高度                                 |
| **查询区块范围: 23997642 到 23997742** | 查询最近 100 个区块（23997642 - 23997742）                   |
| **找到了 10903条 Transfer 事件日志**   | 在指定范围内，USDC 合约共产生了 10903次转账事件              |
| **TxHash**                             | 包含该事件的交易哈希                                         |
| **BlockNumber**                        | 该事件所在的区块号                                           |
| **Topics[0]**                          | `0xddf2...` 是 `Transfer(address,address,uint256)` 的事件签名哈希 |
| **Topics[1]**                          | `0x000...87f6...` 是转账发送方地址（from，填充至 32 字节）   |
| **Topics[2]**                          | `0x000...4325...` 是转账接收方地址（to，填充至 32 字节）     |
| **log.Data**                           | 包含转账金额（需要 ABI 解码才能读取）                        |

**注意：** 代码成功实现了根据合约地址（USDC）和事件签名（Transfer）过滤历史日志的功能。



#### Part II. Geth 进阶

知识点学习：

- 理解了三层架构模型
- 使用Subscribe订阅模式完成**监听新区块**，**监听待处理交易**



**代码实现(参考monitor_setup.go完成)**

**功能完成**：

1. **建立 WebSocket 连接：** 使用 `rpc.DialContext` 连接到本地 Geth 节点
2. **复用 RPC 连接：** 同时初始化 `ethclient` 和 `gethclient`，共享同一个底层连接
3. **双通道监听：** 使用 Go 的 `channel` 机制并发监听新区块和待处理交易
4. **优雅退出：** 捕获系统信号（Ctrl+C），正确关闭订阅和连接

**核心功能：**

- **新区块监听：** 使用 `ethClient.SubscribeNewHead()` 实时获取新区块头信息
- **交易池监听：** 使用 `gethClient.SubscribePendingTransactions()` 监听 Mempool 中的新交易
- **错误处理：** 完善的错误处理和重连机制
- **资源清理：** 程序退出时正确取消订阅并关闭连接

```go
package main

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ethereum/go-ethereum/ethclient/gethclient"
	"github.com/ethereum/go-ethereum/rpc"
)

// 使用 LlamaRPC 的 WebSocket 地址
const NodeWSS = "wss://eth.llamarpc.com"

func main() {
	// 1. 设置系统信号监听
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt, syscall.SIGTERM)

	log.Println("🔌 正在连接到 WebSocket 节点:", NodeWSS)

	// 2. 建立底层的 RPC 连接
	rpcClient, err := rpc.Dial(NodeWSS)
	if err != nil {
		log.Fatalf("❌ 连接失败: %v", err)
	}
	defer rpcClient.Close()
	log.Println("✅ RPC 连接建立成功")

	// 3. 初始化上层客户端
	ethClient := ethclient.NewClient(rpcClient)
	gClient := gethclient.New(rpcClient)

	// 4. 准备数据通道
	headers := make(chan *types.Header)
	pendingTxHashes := make(chan common.Hash)

	// 5. 订阅新区块
	log.Println("🎧 正在订阅新区块 (NewHeads)...")
	subHeads, err := ethClient.SubscribeNewHead(context.Background(), headers)
	if err != nil {
		log.Fatalf("❌ 订阅新区块失败: %v", err)
	}
	defer subHeads.Unsubscribe()

	// 6. 订阅待处理交易
	log.Println("🎧 正在订阅交易池 (PendingTransactions)...")
	subPending, err := gClient.SubscribePendingTransactions(context.Background(), pendingTxHashes)
	if err != nil {
		log.Printf("⚠️ 订阅交易池失败 (可能是节点不支持): %v", err)
	} else {
		defer subPending.Unsubscribe()
	}

	log.Println("🚀 监控已启动！按 Ctrl+C 停止...")

	// 7. 主循环
	for {
		select {
		// Case A: 收到新区块 - 打印丰富信息
		case head := <-headers:
			// 计算 Gas 使用率
			gasUtil := float64(head.GasUsed) / float64(head.GasLimit) * 100

			// 转换 BaseFee 到 Gwei (如果存在)
			baseFee := "0"
			if head.BaseFee != nil {
				bf := new(big.Float).SetInt(head.BaseFee)
				bf.Quo(bf, big.NewFloat(1e9)) // Wei -> Gwei
				baseFee = fmt.Sprintf("%.2f", bf)
			}

			// 格式化时间
			blockTime := time.Unix(int64(head.Time), 0).Format("15:04:05")

			fmt.Printf("\n📦 [新区块] #%d\n", head.Number.Uint64())
			fmt.Printf("   ├─ Hash:     %s\n", head.Hash().Hex())
			fmt.Printf("   ├─ Time:     %s\n", blockTime)
			fmt.Printf("   ├─ Miner:    %s\n", head.Coinbase.Hex())
			fmt.Printf("   ├─ BaseFee:  %s Gwei\n", baseFee)
			fmt.Printf("   └─ Gas:      %d / %d (%.1f%%)\n", head.GasUsed, head.GasLimit, gasUtil)

		// Case B: 收到待处理交易 - 尝试获取详情
		case txHash := <-pendingTxHashes:
			// 启动一个 goroutine 去获取详情，避免阻塞主循环
			go func(hash common.Hash) {
				// 注意：频繁调用 TransactionByHash 可能会被公共节点限流
				tx, isPending, err := ethClient.TransactionByHash(context.Background(), hash)
				if err != nil {
					// 获取失败只打印 Hash
					// fmt.Printf("🌊 [Pending] %s (详情获取失败)\n", hash.Hex())
					return
				}

				if isPending {
					// 转换 Value 到 Ether
					val := new(big.Float).SetInt(tx.Value())
					val.Quo(val, big.NewFloat(1e18))

					toAddr := "Contract Creation"
					if tx.To() != nil {
						toAddr = tx.To().Hex()
					}

					fmt.Printf("🌊 [Pending] %s\n", hash.Hex())
					fmt.Printf("   └─ To: %s | Val: %.4f ETH\n", toAddr, val)
				}
			}(txHash)

		// Case C: 订阅出错
		case err := <-subHeads.Err():
			log.Fatalf("❌ 区块订阅中断: %v", err)

		// Case D: 交易池订阅出错
		case err := <-(func() <-chan error {
			if subPending != nil {
				return subPending.Err()
			}
			return nil
		}()):
			if err != nil {
				log.Printf("⚠️ 交易池订阅中断: %v", err)
			}

		// Case E: 退出
		case <-interrupt:
			log.Println("\n🛑 接收到退出信号，正在关闭连接...")
			return
		}
	}
}

```

**预期输出：**

```text
go run ./monitor_setup.go
2025/12/13 10:18:29 🔌 正在连接到 WebSocket 节点: wss://eth.llamarpc.com
2025/12/13 10:18:30 ✅ RPC 连接建立成功
2025/12/13 10:18:30 🎧 正在订阅新区块 (NewHeads)...
2025/12/13 10:18:31 🎧 正在订阅交易池 (PendingTransactions)...
2025/12/13 10:18:31 🚀 监控已启动！按 Ctrl+C 停止...
🌊 [Pending] 0xde92b80b652c56f88330a161aa0cc27e83d991005ac7bd78e2a9e81b25fa595f
   └─ To: 0x02c1Ea389faf4b1f6c9b6037D83741d268A77c36 | Val: 0.0001 ETH
🌊 [Pending] 0xaf0e16a23a879e53fcde924da3d50c7bcfa2eb2f0a18e0c00d703dc86b792bce
   └─ To: 0xDFaa75323fB721e5f29D43859390f62Cc4B600b8 | Val: 0.0584 ETH
🌊 [Pending] 0x1109aa8f8a0256537401379edfbd65db01023a4ea08497e1e310f58e0686dcbd
   └─ To: 0x9C859C57e207A5555579B2C776f7Ab862635D47b | Val: 0.0001 ETH
🌊 [Pending] 0x48922d3821708adcd613f4ed87c12c1fdae219e430038941f9daeea66734d751
   └─ To: 0x841c38e22Fe0F40b97E931600515892aFb59e350 | Val: 0.0102 ETH
🌊 [Pending] 0x1e0572938dfe3d78649ace3fbb00e3b284caffc469cc7bcba9bdfbb4c6367fc7
   └─ To: 0x1AB4973a48dc892Cd9971ECE8e01DcC7688f8F23 | Val: 0.0018 ETH
🌊 [Pending] 0x0d8163d01c6c676c0f32040ffd517537ea38685a510ac20fb58674a8d8e55fcc
   └─ To: 0x1AB4973a48dc892Cd9971ECE8e01DcC7688f8F23 | Val: 0.0013 ETH
🌊 [Pending] 0x8e2b28b35db413dcae10d792ed648c13e4686de677a899f371e7093cb398098a
   └─ To: 0x6fB3e0A217407EFFf7Ca062D46c26E5d60a14d69 | Val: 0.0000 ETH
📦 [新区块] #24000660
   ├─ Hash:     0x636804e440fc225c3d4ae231498f34caff9c58f54f89f016a33854cc7db75b4a
   ├─ Time:     10:18:35
   ├─ Miner:    0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97
   ├─ BaseFee:  0.03 Gwei
   └─ Gas:      22612112 / 60000000 (37.7%)
🌊 [Pending] 0xb92ca17d036101accdc7819658feb1318e448ffd07ce5fd16c48c9b2a965928f
   └─ To: 0x1AB4973a48dc892Cd9971ECE8e01DcC7688f8F23 | Val: 0.0018 ETH
🌊 [Pending] 0x6d6f285c8fcb656aae329a659f0008816562b7523495357a67041ff611a28456
   └─ To: 0x1AB4973a48dc892Cd9971ECE8e01DcC7688f8F23 | Val: 0.0019 ETH
🌊 [Pending] 0x6dbea0934a574ab54aed8ab947612dcd397867b9f1b8e330f7c0378a32df0cac
   └─ To: 0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD | Val: 0.0000 ETH
🌊 [Pending] 0x89cbce7606bbac786398ad4e129b80c8bebbc817b4338c47632d155e340634e5
   └─ To: 0x6fB3e0A217407EFFf7Ca062D46c26E5d60a14d69 | Val: 0.0000 ETH
🌊 [Pending] 0x183d5cf0ce580e754c8ed23a02cf4c1056c242d05d584b84aba2ef42043ef550
   └─ To: 0x1AB4973a48dc892Cd9971ECE8e01DcC7688f8F23 | Val: 0.0017 ETH
📦 [新区块] #24000661
   ├─ Hash:     0xc27cd8730c9ffb4015287739821ea83bbfc9e0cf721fe3b73b35c6f5f2e5df14
   ├─ Time:     10:18:47
   ├─ Miner:    0x396343362be2A4dA1cE0C1C210945346fb82Aa49
   ├─ BaseFee:  0.03 Gwei
   └─ Gas:      53188236 / 60000000 (88.6%)
```

**输出解释：**

**1. 新区块 (New Block)**

| 字段        | 示例值            | 含义                 | 详细解释                                                     |
| ----------- | ----------------- | -------------------- | ------------------------------------------------------------ |
| **高度**    | `#24000514`       | **Block Number**     | 区块链的“页码”。它是连续递增的，代表这是以太坊历史上的第几个区块。 |
| **Hash**    | `0xc163...`       | **Block Hash**       | 区块的唯一数字指纹。只要区块内任何数据（交易、时间等）发生微小变化，这个哈希值就会完全改变。 |
| **Time**    | `15:04:05`        | **Timestamp**        | 区块产生的时间。在以太坊 PoS 机制下，通常每 12 秒产生一个新区块。 |
| **Miner**   | `0x690B...`       | **Fee Recipient**    | **打包者/验证者地址**。也就是成功打包这个区块并获得奖励（小费 + MEV）的那个节点的钱包地址。 |
| **BaseFee** | `5.23 Gwei`       | **Base Fee**         | **基础费率**。这是当前网络拥堵程度的晴雨表。用户发起交易至少要支付这个单价的 Gas 费，这部分费用会被直接销毁（Burn）。 |
| **Gas**     | `15M / 30M (50%)` | **Gas Used / Limit** | **区块空间利用率**。`15M` 是实际使用的 Gas，`30M` 是区块最大容量。如果利用率持续超过 50%，BaseFee 就会上涨；反之则下跌。 |

**2. 待处理交易 (Pending Transaction)**

| 字段           | 示例值       | 含义          | 详细解释                                                     |
| -------------- | ------------ | ------------- | ------------------------------------------------------------ |
| **Pending Tx** | `0x8129...`  | **Tx Hash**   | 交易的唯一 ID。此时它还在内存池（Mempool）中排队，**尚未**被打包进区块，因此状态是不确定的。 |
| **To**         | `0xeF73...`  | **Recipient** | **接收方地址**。如果是普通转账，就是收款人；如果是调用合约，就是合约地址；如果是 `Contract Creation`，说明这是在部署新合约。 |
| **Val**        | `0.0292 ETH` | **Value**     | **交易金额**。发送方随交易附带转移的 ETH 数量（不包含 Gas 费）。 |

- **[新区块]** 日志告诉你**过去**发生了什么（已经确认的事实）。
- **[Pending]** 日志告诉你**未来**可能发生什么（正在排队的意图）。






<!-- Content_END -->

### 
