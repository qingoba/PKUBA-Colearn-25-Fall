1. 自我介绍: 大家好，我叫 lionel rivers，25级力工学院研1，热开开发，拥抱 web3

2. 你认为你会完成这次共学小组吗？ 必须的，一定会完成

3. 你感兴趣的小组：DeFi 合约组

4. 你的联系方式（Wechat or Telegram）
    wx：313834500
    tg：@lionelrivers

Notes


Part I - 动手部署一个智能合约

<img width="2140" height="944" alt="part-01" src="https://github.com/user-attachments/assets/85885291-9104-45dd-8fb3-41eee865f86e" />

<img width="1498" height="1398" alt="part1-03" src="https://github.com/user-attachments/assets/39dd756f-12be-4829-9549-3a5f1af75c44" />

<img width="2250" height="1446" alt="part1-06" src="https://github.com/user-attachments/assets/bcf272a6-34f4-483e-b2d6-4a31d5e87de4" />



Part II - 智能合约编写

<img width="2554" height="1696" alt="part2-01" src="https://github.com/user-attachments/assets/069d7fb1-3626-4022-8c7b-f8b34bb99489" />



12月7日

# 一、目标

1. **学会使用 go-ethereum（Geth Go 客户端）连接公共 RPC。**

2. **熟悉以太坊基础数据结构：**
   - 区块（Block）
   - 交易（Transaction）
   - 回执（Receipt）

3. **完成 Follow-up 思考题。**

⸻


## 二、环境准备

### 1\. Go 环境

检查当前 Go 版本：

```bash
go version
# 输出示例: go version go1.25.5 darwin/arm64
```

### 2\. Go 项目初始化

创建项目目录并初始化 Module：

```bash
mkdir week3-geth
cd week3-geth
go mod init week3-geth
```

### 3\. 安装依赖

设置国内代理（可选）并下载 `go-ethereum` 库：

```bash
export GOPROXY=https://goproxy.cn,direct
go get github.com/ethereum/go-ethereum
```


⸻


## 三、核心代码（main.go）

请新建一个名为 `main.go` 的文件，并写入以下代码：

```go
package main

import (
    "context"
    "fmt"
    "log"
    "math/big"

    "github.com/ethereum/go-ethereum/common"
    "github.com/ethereum/go-ethereum/ethclient"
)

func main() {
    ctx := context.Background()

    // 连接公共 RPC (这里使用的是 Sepolia 测试网的公共节点)
    client, err := ethclient.Dial("https://ethereum-sepolia-rpc.publicnode.com")
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // 1. 查询最新区块高度
    // 传入 nil 表示查询最新区块
    header, err := client.HeaderByNumber(ctx, nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Current block: %s\n", header.Number.String())

    // 2. 查询指定区块
    // 示例：查询高度为 123456 的区块
    targetBlock := big.NewInt(123456)
    block, err := client.BlockByNumber(ctx, targetBlock)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Block #%s hash: %s\n", block.Number().String(), block.Hash().Hex())
    fmt.Printf("Parent hash: %s\n", block.ParentHash().Hex())
    fmt.Printf("Tx count: %d\n", len(block.Transactions()))

    // 3. 查询交易与回执
    // 示例交易 Hash
    txHash := common.HexToHash("0x903bd6b44ce5cfa9269d456d2e7a10e3d8a485281c1c46631ec8f79e48f7accb")
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

    // 4. 获取交易回执 (Receipt)
    // 用于检查交易是否成功 (Status = 1) 以及查看日志
    receipt, err := client.TransactionReceipt(ctx, txHash)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Receipt status: %d\n", receipt.Status)
    fmt.Printf("Logs: %d entries\n", len(receipt.Logs))
}
```

-----



## 四、完成 Follow-up 思考题

### 1. Block（区块）关键字段

* **`number`**：区块编号。从 0（创世块）开始递增，是时间序列和历史数据查询的核心索引。
* **`hash`**：对区块内容做哈希得到的“数字指纹”，任何字段变化都会改变 hash。
* **`parentHash`**：父区块的 hash，使得所有区块首尾相接，形成一条区块链。
* **`timestamp`**：出块时间（Unix 时间戳），便于回溯交易发生的大致时间。
* **`gasUsed`**：该区块内所有交易实际消耗的 Gas 总量。
* **`gasLimit`**：该区块允许消耗的 Gas 上限，决定了该区块最多能打包多少、复杂度多高的交易。
* **`transactions`**：区块中包含的所有交易列表。

#### ❓ 问题 1：为什么 parentHash 能形成区块链？
每个区块都把父区块的 hash 写进区块头。如果篡改了历史某个区块的内容（比如修改余额），该区块 hash 会改变，导致后续所有区块的 `parentHash` 都不再匹配。要让整条链“看起来合法”，攻击者必须重算从被篡改区块开始的所有后续区块，这在算力上几乎不可能，从而保证了链的不可篡改性。

#### ❓ 问题 2：gasLimit 如何影响合约执行？
* 每笔交易会设置一个 gas 上限，同时整个区块有 `gasLimit`。
* 当区块内所有交易的 `gasUsed` 总和接近 `gasLimit` 时，矿工就不能再打包更多交易。
* 
* 若合约执行过程中消耗的 Gas 超过交易设定的 gas 上限，执行会被中止，状态回滚，但已经消耗的 Gas 不退还。
* **结论**：`gasLimit` 是对区块总计算资源的限制，防止单块过重拖垮网络。

---

### 2. Transaction（交易）关键字段

* **`nonce`**：同一地址的交易序号，从 0 递增。用于防止重放攻击，保证交易按顺序执行。
* **`from` / `to`**：交易发起方 / 接收方地址；当 `to == nil` 时表示合约创建交易。
* **`value`**：转账金额（单位 wei），合约调用时也可以附带 ETH。
* **`input`**：合约调用数据（call data），包括函数选择器（前 4 字节）和编码后的参数。
* **`gas` / `gasPrice`**：交易愿意消耗的最大 Gas 量及每单位 Gas 价格；在 EIP-1559 下变成 `maxFeePerGas` / `maxPriorityFeePerGas`。
* **`type`**：交易类型，常见 0（Legacy）和 2（EIP-1559）。

#### ❓ 问题：什么是 ABI？input 如何被解析？
**ABI (Application Binary Interface)** 是合约对外的“接口说明书”，定义了函数名、参数类型、事件等。

1.  **编码过程**（交易发送前）：
    * 外部调用者使用 ABI 将“函数 + 参数”编码成 `input`。
    * 先取函数签名（如 `transfer(address,uint256)`）做哈希，取前 4 字节作为**函数选择器**。
    * 然后按类型编码参数（每个参数 32 字节）依次拼接。
2.  **解码与执行**（合约执行时）：
    * EVM 读取 `input`。
    * 先根据前 4 字节找到对应函数。
    * 再按 ABI 规则解码后续参数。
    * 执行函数逻辑，消耗 Gas，写入状态或触发事件。

---

### 3. Receipt（交易收据）关键字段

* **`status`**：交易执行结果。`1` 表示成功，`0` 表示执行失败。
* **`logs`**：合约执行过程中 emit 的事件日志列表，是前端/后端监听链上事件的主要数据源。
* **`contractAddress`**：只在合约部署交易中有效，表示新合约的地址；普通交易该字段为空。

> **总结**：通过查询 Receipt，我们可以判断一笔交易是否成功、消耗了多少 Gas，以及合约触发了哪些事件。

---

### 💡 扩展：Merkle Tree 与轻节点验证

* **结构**：区块内所有交易会被组织成一棵 。
* **存储**：根哈希 **Merkle Root** 被写入区块头。
* **验证流程**（轻节点只保存区块头）：
    1.  当轻节点需要验证某笔交易是否在某个区块中时，向全节点请求该交易的 **Merkle Proof**（从叶子结点到根的兄弟哈希路径）。
    2.  在本地通过逐层哈希重建 Merkle Root。
    3.  **结果对比**：若计算出的 Root 与区块头中的 Root 一致，则证明该交易确实被包含在区块中。

---
