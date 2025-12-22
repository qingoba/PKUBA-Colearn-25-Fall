---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区


# Yawn

1. 对web3感兴趣想继续深入学习，想通过本次学习对区块链有更深入的了解。
2. 会
3. Defi
4. f2315937939
5. 交易哈希：0x4478387dc07e142e9a8fb62b91e0f73933a0ea0745a2466da1d35a57f2041a8a

## Notes

<!-- Content_START -->

### 2025.07.11

笔记内容

### 2025.07.12

### 2025.12.4

1.下载go

![image-20251204125513243](C:\Users\yawn\AppData\Roaming\Typora\typora-user-images\image-20251204125513243.png)

2.了解了以太坊运行机制

3.运行第一个go程序

![image-20251204131052163](C:\Users\yawn\AppData\Roaming\Typora\typora-user-images\image-20251204131052163.png)

 4.安装 go-ethereum 库

![image-20251204133143857](C:\Users\yawn\AppData\Roaming\Typora\typora-user-images\image-20251204133143857.png)

### 2025.12.5

打印结果：

Current block: 9771744
Block #123456 hash: 0x2056507046b07a5d7ed4f124a7febce2aec7295b464746523787b8c2acc627dc
Parent hash: 0x93bff867b68a2822ee7b6e0a4166cfdf5fc4782d60458fae1185de9b2ecdba16
Tx count: 0
2025/12/05 11:20:27 not found
exit status 1

#发现有一些问题，没有查询到质押交易的数量`tx count`

上一节中查询到的数据会包含大量字段。本部分任务要求理解其中关键字段的含义。

关于 Block 建议理解的字段包括：

- number
  - 区块号，即区块在区块链中的高度。创世区块的number为0，后续每个新区块递增1。
- hash
  - 区块哈希值，是通过对区块头进行哈希运算（例如SHA-256）得到的唯一标识符。它代表了整个区块的摘要。
- parentHash
  - 父区块的哈希值。每个区块（除创世区块外）都包含其父区块的哈希，从而形成链式结构。
- timestamp
  - 区块时间戳，记录该区块被创建的时间（通常由矿工设置，单位为秒或**毫秒**）。
- gasUsed / gasLimit
  - **gasLimit**：区块的燃料限制，区块中所有交易消耗的燃料（Gas）总量不能超过这个值。
  - **gasUsed**：区块中所有交易实际消耗的燃料总量。
- transactions
  - 交易值

Follow-Up：

- 为何 parentHash 能形成区块链？
- gasLimit 如何影响合约执行

***

关于 Transcation 建议理解的字段包括：

- nonce 一个由交易发送者发出的交易序列号，用于确保交易顺序和防止重放攻击。
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
### 2025.12.14

1. 了解了以太坊核心的数据结构
   - block
   - transaction
   - receipt
2. 了解EVM log三个核心内容、Event Signature
### 2025.12.21

跑通：通过合约地址和 Event Signature 过滤日志的完整实

1. **代理配置：** 配置 HTTP 代理以访问 Infura RPC 服务
2. **RPC 连接：** 使用自定义 HTTP 客户端连接到以太坊节点
3. **事件签名计算：** 计算 `Transfer(address,address,uint256)` 事件的签名哈希（Topic 0）
4. **日志过滤：** 使用 `FilterLogs` 方法查询指定合约地址和事件签名的历史日志

<!-- Content_END -->
