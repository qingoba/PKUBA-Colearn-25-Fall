---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区


# 欧岱松

1. 自我介绍
大家好，我是25级汇丰金融科技欧岱松，希望能通过这次贡献快速入门链上数据分析，部署相应的监控机器人
2. 你认为你会完成这次共学小组吗？
会的。
3. 你感兴趣的小组
On-chain Data
4. 你的微信号
ods871031393
5. 质押的交易哈希
0x3c8bf2a435cfc77b516fda7d28124acad150d9018e06cde843af3719328936e6
## Notes

<!-- Content_START -->

### 2025.11.17-

目前完成了PartI部分，成功完成了能够在区块链浏览器上查询到合约部署，第二部分还在探索中

![合约部署成功截图](https://private-user-images.githubusercontent.com/108411119/517843569-a34a64c0-1dc4-46d6-ac9e-63ced80ddb7a.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjM5MDI3MTQsIm5iZiI6MTc2MzkwMjQxNCwicGF0aCI6Ii8xMDg0MTExMTkvNTE3ODQzNTY5LWEzNGE2NGMwLTFkYzQtNDZkNi1hYzllLTYzY2VkODBkZGI3YS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUxMTIzJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MTEyM1QxMjUzMzRaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT05ZjQ2MTJjNjU1NjAzYmUxNWQ5Njc5NTA4N2VkODIwYmJjMGU5YmIzMzFhYjA3OTY3MDYzOWQ0ZTY0NTJlZWJhJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.TKu61nO9A1A3F_23bkRzw_R7KSQpG0DvMb6GA1HiPKA)

![区块链浏览器查询截图](https://private-user-images.githubusercontent.com/108411119/517843590-4f6a4010-f1e7-4fb4-9369-c3a7fa774f17.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjM5MDI3NDMsIm5iZiI6MTc2MzkwMjQ0MywicGF0aCI6Ii8xMDg0MTExMTkvNTE3ODQzNTkwLTRmNmE0MDEwLWYxZTctNGZiNC05MzY5LWMzYTdmYTc3NGYxNy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUxMTIzJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MTEyM1QxMjU0MDNaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1hY2QwZjI5OTQzMmEwNDI2NTgxMWVlNDBlMjFmYjUxNmEzM2M0MGJiODg2OWEwYmIyYTVjYTllZDgxNzYzNmY2JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.PgTj_wv5AHmD_n2tYGUozclgw9OOBpBDWVdawlFUqss)



### 2025.11.24-11.30

#### Part II 智能合约挑战记录
- **任务目标**：通过与靶子合约 `0x5DAB5b8600EaBB7450fCD084D9A377F280031297`（Sepolia）交互提交正确答案，触发 `FlagReceived` 事件并拿到 `FLAG{PKU_Blockchain_Colearn_Week1_Success}`。
- **执行环境**：Remix + MetaMask (Sepolia 网络，测试币来自 faucet)，合约代码基于仓库 `Part2-Challenge/Solver.sol` 并在 Remix 中将 `TARGET` 修改为上述靶子地址。
- **关键思路**：必须由合约调用 `query()`，所以先部署 ChallengeSolver，再用它请求提示、计算答案并代表我提交交易。
- **产出记录**：Answer 为 `keccak256("PKUBlockhain") = 0xe2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd22414215`，最终链上凭证 tx `0x74971ef58e1439ff1b8659af7dbc8a81ffd25d09ee8a94d29372878bdef1a575`。

#### Solver 合约关键逻辑
- `Part2-Challenge/Solver.sol` 里先定义 `ITargetContract` 接口，把靶子合约的 `hint/query/getSolvers` 规范化，随后在 `ChallengeSolver` 中通过 `address public constant TARGET = 0x4a6C0c0dc8bD8276b65956c9978ef941C3550A1B;` 固定交互对象，这样每次部署后无需手动填地址。
- `getHint()` 直接调用 `ITargetContract(TARGET).hint()`，将返回字符串保存进 `lastHint`，并通过 `event HintReceived(string hint)` 记录日志，方便在链上回放提示内容。
- `submitAnswer(bytes32 _answer)` 通过 `target.query(_answer)` 把哈希提交给靶子合约，并将 flag 写入状态变量 `flag`；为了后续复查，函数还依次触发 `AnswerSubmitted` 与 `FlagReceived` 事件。
- `calculateHash(string memory input)` 只是 `keccak256(abi.encodePacked(input))` 的轻量封装，用来在链上计算 `PKUBlockhain` 的哈希，避免本地拼写差错。
- 额外的 `tryCommonAnswers()`、`autoSolve()`、`toString()` 等工具函数，也为之后遇到不同提示的同学预留了脚本化解题路线。

#### 操作步骤
1. **部署 Solver**：在 Remix 里导入 `ChallengeSolver`，确认构造函数只设置 `owner`，`TARGET` 常量指向 0x5DAB5b...；使用 `Injected Provider - MetaMask` 在 Sepolia 上完成部署。
2. **获取提示**：调用 `getHint()`，链上返回需要提交 `keccak256("PKUBlockhain")`（注意单词少了一个 “c”）。函数同时把提示写入 `lastHint`，方便在 Remix 的 storage 面板复查。
3. **计算答案**：为了避免手算出错，直接调用合约里的 `calculateHash("PKUBlockhain")` 得到 `0xe2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd22414215`，并用 Remix 的返回值填入下一步。这个结果也可以通过 `cast keccak` 或 `ethers.utils.keccak256` 交叉验证。
4. **提交 query**：执行 `submitAnswer(bytes32)`，参数填入上一步的哈希；交易执行后在 Remix 事件日志里能看到 `AnswerSubmitted` 与 `FlagReceived`，而 `flag` 状态变量里也保存了完整 Flag。
5. **验证结果**：在靶子合约 `getSolvers()` 中出现了我的 Solver 地址，同时在 Etherscan / Blockscout 上能查到相同 tx log，证明 ChallengeCompleted 事件已链上留痕。

#### 坑点与排查
- 直接用 EOA 在区块链浏览器调用 `query()` 会因为 `msg.sender` 不是合约而被 revert，必须通过自建 Solver 代理调用；我先在 Remix 控制台模拟了一次失败调用确认报错原因。
- Remix 有时无法显示 view 函数返回的中文提示，我通过事件 `HintReceived` 把提示字符串写进日志，再在交易详情里查看，规避 IDE 编码渲染问题。
- `hint()` 中的目标字符串拼写为 `PKUBlockhain`（缺 “c”），最初按常规拼写计算出了错误哈希；借助 `calculateHash` 对比两次输出后定位到了拼写差异。

#### PKU Blockchain CoLearn Week1 通关证明

**选手地址**  
`0x83263612eCc2cf4e862E38A3E3c9edd1342600c7`

**挑战合约地址（Sepolia）**  
`0x5DAB5b8600EaBB7450fCD084D9A377F280031297`

##### 最终成功交易（通关凭证）

**交易哈希**  
`0x74971ef58e1439ff1b8659af7dbc8a81ffd25d09ee8a94d29372878bdef1a575`

**区块高度**  
9701188

**查看链接**  
- Etherscan: https://sepolia.etherscan.io/tx/0x74971ef58e1439ff1b8659af7dbc8a81ffd25d09ee8a94d29372878bdef1a575  
- Blockscout: https://eth-sepolia.blockscout.com/tx/0x74971ef58e1439ff1b8659af7dbc8a81ffd25d09ee8a94d29372878bdef1a575

##### 关键日志（铁证）

```json
[
  {
    "from": "0x5DAB5b8600EaBB7450fCD084D9A377F280031297",
    "topic": "0xa4af99c2337f236a02d81d66ee523743d5888fa0d14e1cbe3319c976383c47db",
    "event": "AnswerSubmitted",
    "args": {
      "0": "0xe2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd22414215"
    }
  },
  {
    "from": "0x5DAB5b8600EaBB7450fCD084D9A377F280031297",
    "topic": "0x43d29ddb0ec6130b6b00bfb0fb6fdc288946a2d80923af3c893206d4a11497a0",
    "event": "FlagReceived",
    "args": {
      "0": "FLAG{PKU_Blockchain_Colearn_Week1_Success}"
    }
  }
]
```
Flag（已成功获取）
FLAG{PKU_Blockchain_Colearn_Week1_Success}
我已成功通过 PKU Blockchain CoLearn Week1 挑战
提交 keccak256("PKUBlockhain")被判为正确
链上永久凭证：
https://sepolia.etherscan.io/tx/0x74971ef58e1439ff1b8659af7dbc8a81ffd25d09ee8a94d29372878bdef1a575



### 2025.12.01-12.06

#### Part I geth 安装（mac）

一开始使用brew安装但是网络超时，后面使用go安装后，在将go的安装目录下的geth移到/user即可。

#### Part II 使用 Geth 读取链上数据

这周的任务是学会用 Go 语言的 Geth 客户端从链上读取数据。之前只是在 Etherscan 上查看交易，这次要自己写代码去获取区块、交易、回执的详细信息。

##### 环境搭建

用的是 Go + go-ethereum 库，连接 Sepolia 测试网。

遇到的第一个坑：直接用一个 RPC 经常超时，后来写了个多节点自动切换的逻辑，会依次尝试 4 个不同的 RPC 节点，哪个能连上用哪个。这样稳定多了。

```go
// 我用的几个 RPC 节点
rpcUrls := []string{
    "https://ethereum-sepolia-rpc.publicnode.com",
    "https://rpc2.sepolia.org",
    "https://sepolia.gateway.tenderly.co",
    "https://rpc.sepolia.org",
}
```

##### 实现的功能

**main.go**：完整版，查询区块、交易、回执的所有字段

实现了这些：
- 查询最新区块信息（高度、哈希、时间戳、Gas 使用情况）
- 查询特定区块的完整数据（试了 Block #123456）
- 解析一笔交易的详细信息（包括 EIP-1559 的字段）
- 获取交易回执，看 Events 日志

##### 关键概念笔记

**Block（区块）**

运行代码后看到的区块数据，主要关注这几个字段：
- **Number**：区块高度，像是区块的序号
- **Hash**：这个区块的唯一标识，任何内容改变哈希就完全不同
- **ParentHash**：上一个区块的哈希，这就是"区块链"名字的由来

  💡 理解了一个重要的点：如果有人想篡改历史区块，比如改 Block #100 的某笔交易，那 Block #100 的 Hash 就变了，Block #101 的 ParentHash 就对不上了，必须把后面所有区块都重新算一遍。这就是为什么区块链越长越安全。

- **GasUsed / GasLimit**：
  - GasUsed 是这个区块里所有交易消耗的 Gas 总和
  - GasLimit 是区块最多能包含多少 Gas
  - 看了下我查询的区块，GasUsed 才占 GasLimit 的 23%，说明网络挺空闲的

**Transaction（交易）**

重点看了示例交易 `0x903bd6b44ce5cfa9269d456d2e7a10e3d8a485281c1c46631ec8f79e48f7accb`：

- **Nonce = 5**：这是这个地址发出的第 6 笔交易（从 0 开始）
  - 作用是防止重放攻击
  - 必须按顺序执行，Nonce 乱了交易就卡住了

- **Value = 0**：没有转 ETH，说明这是纯合约调用

- **Data**：36 字节的调用数据
  - 前 4 字节是函数选择器（函数签名的哈希）
  - 后面是参数（按 ABI 编码）
  - 💡 这解释了为什么调用合约需要 ABI——ABI 就是"翻译手册"，告诉你怎么编码/解码这些数据

- **Type = 2**：EIP-1559 交易
  - 有 MaxFeePerGas 和 MaxPriorityFeePerGas 两个字段
  - 比老的 Legacy 交易（Type 0）更省钱，因为不会过度支付 Gas

**Receipt（回执）**

交易执行后会生成回执：
- **Status = 1**：成功（0 就是失败）
  - ⚠️ 注意：即使失败，Gas 也会被扣掉！

- **GasUsed**：实际消耗的 Gas（我看的这笔用了 81,742）

- **Logs（Events）**：这个很有意思
  - 合约执行时触发的事件
  - 有 Topics 和 Data 两部分
  - Topics[0] 是事件签名，Topics[1-3] 是 indexed 参数（可以搜索）
  - Data 是非 indexed 参数（更便宜但不能搜索）

##### 遇到的问题和解决

1. **RPC 连接不稳定**
   - 解决：写了个循环自动尝试多个节点，并且连上后立即测试一下能不能查询

2. **Go 依赖下载失败**
   - 解决：设置国内代理 `export GOPROXY=https://goproxy.cn,direct`


##### 心得

**1. 以太坊的基础知识**

学习了 StateRoot、TxHash、ReceiptHash 的基本内容：
- State Tree：所有账户的状态（余额、Nonce、代码、存储）
- Transaction Tree：这个区块的所有交易
- Receipt Tree：所有交易的执行结果

每棵树都是 Merkle Patricia Tree，只存根哈希在区块头。轻节点只需要这三个哈希，就能通过 Merkle Proof 验证任何数据。

**2. Gas 的作用**

现在理解了它是整个系统的"计量单位"：
- 防止无限循环（Gas 用完自动停止）
- 防止资源滥用（复杂操作更贵）
- 激励矿工（Gas Fee 给矿工）
- 调节拥堵（高 Gas Price 优先处理）

**3. Events vs Storage**

写合约时什么该存 Storage，什么该用 Events？
- Events 便宜（~375 Gas），但合约读不到，只能链下监听
- Storage 贵（~20,000 Gas），但合约可以随时读
- 所以：业务数据存 Storage，通知/审计用 Events


##### 未来计划

现在能读取链上数据了，接下来可以：
- 写个脚本持续监听某个合约的 Events
- 分析 Gas 价格走势
- 研究 MEV（矿工可提取价值）
- 学习 Layer 2 怎么减少 Gas 成本


### 2025.12.14

#### Part I Geth 进阶学习

上周学会了基本的链上数据读取，这周进入高级玩法——怎么高效地批量查询历史数据，以及怎么实时监听链上事件。

核心是理解 EVM Log 的结构。每条日志包含触发它的合约地址、最多 4 个 Topics 索引字段、以及非索引的 Data 数据。其中 Topic[0] 是事件签名的 Keccak256 哈希，比如 `Transfer(address,address,uint256)` 算出来就是 `0xddf252ad...`，这就是为什么能高效过滤特定事件——节点用 Bloom Filter 预先索引了这些 Topics。构造查询时通过 FilterQuery 指定区块范围、合约地址和事件签名：

```go
query := ethereum.FilterQuery{
    FromBlock: big.NewInt(startBlock),
    ToBlock:   big.NewInt(endBlock),
    Addresses: []common.Address{contractAddr},
    Topics:    [][]common.Hash{{eventSigHash}},
}
logs, _ := client.FilterLogs(ctx, query)
```

实际查询大范围区块时会遇到超时和限流问题。解决方案是做分页查询（把大范围拆成每次 1000 个区块的小块）、错误重试（网络抖动时自动重试）、以及速率限制（控制 RPS 避免被封）。写了个 RateLimiter 来控制请求频率，原理是记录上次请求时间，间隔不够就 sleep 等待：

```go
func (rl *RateLimiter) Wait() {
    elapsed := time.Since(rl.lastRequestTime)
    if elapsed < rl.interval {
        time.Sleep(rl.interval - elapsed)
    }
    rl.lastRequestTime = time.Now()
}
```

这周理清了不同客户端的层级关系。RPC Client 是最底层的通信层，负责发 JSON 请求；EthClient 封装了标准的以太坊 API，所有节点都支持；GethClient 则是 Geth 专有的 API，只有连 Geth 节点才能用。实际开发中优先用 EthClient，只有需要 Mempool 监听等高级功能才用 GethClient。

Geth 适合验证和实时监控，但不适合复杂的历史查询。比如想查"Uniswap 过去一年的交易量"，用 Geth 要扫全表，效率很低。The Graph 就是解决这个问题的——它把链上数据同步下来建好索引存进数据库，用 GraphQL 查询非常方便。分页时要注意用 Cursor-based 而不是 Skip-based，前者用 `where: { id_gt: "lastID" }` 直接定位是 O(log N)，后者用 `skip: 1000` 要扫描前 1000 条是 O(N)，数据量大时性能差距明显。


### 2025.12.19

#### Week4 Etherscan API 实践

今天完成了 Week4 Part2 的代码调试和运行。主要任务是用 Go 调用 Etherscan API 统计 7-11 月收到 Token 的所有地址。遇到的关键问题是 Etherscan 免费版 API 对同一查询条件最多只返回 10,000 条数据，这不是分页的问题——即使分 100 页查询，API 也只给前 10,000 条。添加了检测逻辑避免无意义的重复请求：

```go
maxResults := 10000 // Etherscan 免费版 API 最大返回条数限制

for {
    txList, err := getTokenTxPage(client, address, startBlock, endBlock, page, offset)
    allTx = append(allTx, txList...)

    // 检查是否达到 API 限制
    if len(allTx) >= maxResults {
        log.Printf("⚠️ 已达到 Etherscan 免费版 API 限制 (10,000 条)，停止查询")
        break
    }
}
```


对比了三种链上数据获取方式的使用场景。Geth/Infura 通过 FilterLogs 查询原始日志数据，需要分页处理大范围区块：

```go
// Geth FilterLogs 查询（每次查 1000 个区块）
query := ethereum.FilterQuery{
    FromBlock: big.NewInt(startBlock),
    ToBlock:   big.NewInt(endBlock),
    Addresses: []common.Address{contractAddr},
    Topics:    [][]common.Hash{{eventSigHash}},
}
logs, _ := client.FilterLogs(ctx, query)
```

The Graph 使用 GraphQL 查询预处理的索引数据，支持嵌套查询和精确字段选择：

```go
// The Graph GraphQL 查询（一次获取 500 条）
query := `{
    pools(first: 500, orderBy: id, orderDirection: asc) {
        id
        feeTier
        token0 { symbol }
        token1 { symbol }
    }
}`
```

The Graph 分页时用 Cursor-based（`where: {id_gt: "lastID"}`）比 Skip-based 效率高，因为数据库索引可以直接定位而不需要扫描前面的记录。三者结合使用才能应对不同的数据分析需求：Geth 适合实时监控和验证，The Graph 适合历史数据分析，Etherscan API 最方便但有免费版限制。

```go
// RateLimiter 动态计算等待时间
func (rl *RateLimiter) Wait() {
    elapsed := time.Since(rl.lastRequestTime)
    if elapsed < rl.interval {
        time.Sleep(rl.interval - elapsed)  // 只等待剩余时间
    }
    rl.lastRequestTime = time.Now()
}
```


<!-- Content_END -->