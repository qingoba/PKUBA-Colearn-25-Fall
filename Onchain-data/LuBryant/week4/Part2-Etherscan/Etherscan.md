# Etherscan

## RPC 面临的问题

在 Part I 中，我们一直通过 Geth 库和以太坊节点打交道。不管是 `FilterLogs`、`Subscribe`，还是 `CallContract`，实际调用的都是最原始的 RPC 接口。这些接口很底层，也很真实，它们直接反映了“链上的状态是什么”。

但当你开始尝试做一些**偏分析**、**偏统计**的事情时，很快就会发现，光靠 RPC 去实现链上数据统计, 会非常的复杂。举一个很常见的需求：「查询哪些地址曾经调用过某一个合约」. 这个问题本身并不复杂，但如果只用 RPC，你会发现没有任何一个接口能直接做这件事。你只能从某个区块高度开始，把所有区块、所有交易一笔一笔扫下来，然后判断 `tx.to` 是不是你关心的合约。这不仅写起来很麻烦，而且非常慢。

另外一个很常见的需求是：「有哪些交易向某个地址转过 ETH」。*很多 ETH 的转移并不是直接发生在交易的 `value` 字段里，而是发生在合约内部的调用过程中。这类“内部转账”并不存在于区块或交易的基本结构中，RPC 层是查不到一个“internal transfers 列表”的*。

这些问题的共同点在于：**区块链本身并不是为“查询”设计的，而是为“执行”和“共识”设计的。**RPC 能提供的是执行层接口, 用于查询链上的“状态”；而你现在想做的，是数据分析。这样就自然诞生出了 Etherscan

## Etherscan

你可以把 Etherscan 简单理解成：有人帮你把整条链的数据同步下来，然后**提前替你做了大量整理和索引的工作**。它做的事情大致是这样的：从创世区块开始，持续同步新区块；解析交易、收据和执行过程；基于这些结果，构建各种可以直接查询的数据表，比如“某地址相关的所有交易”“某合约的所有调用”“某地址发生的 ETH 内部转账”等等。

当你调用 Etherscan API 的时候，你其实不是去查询区块链状态，而是在查询一个整理好的数据库。也正因为如此，Etherscan 能非常轻松地回答 RPC 很难回答的问题，比如我们刚才提到的两个例子。可以直接查询与合约相关的所有交易，而不需要自己去扫区块；也可以直接查询某个地址相关的 internal transaction。

当然，这种便利也有一个显而易见的前提：**Etherscan 是一个中心化系统。**这些数据不是共识的一部分，而是 Etherscan 根据自己的解析逻辑算出来的结果。这一点在后面的小节里我们还会专门再回到。

## Etherscan API

要使用 Etherscan API，需要在其网站注册账号并申请 API，API 有免费的额度。

注册并登陆到 [https://etherscan.io/](https://etherscan.io/)：

![截屏2025-12-10 20.04.27.png](Etherscan/%E6%88%AA%E5%B1%8F2025-12-10_20.04.27.png)

创建一个 API Key

![截屏2025-12-10 20.06.58.png](Etherscan/%E6%88%AA%E5%B1%8F2025-12-10_20.06.58.png)

Etherscan 使用的是 HTTP API。每次请求时，只需要在参数中带上 `apikey` 字段即可

## `txlist`

假设你想查询哪些 EOA 地址曾经与 Uniswap V2 的一个流动性池合约互动过（比如 USDC-ETH 池的地址：0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc）。这些互动包括提供流动性或交换代币，你可以用 “txlist” 接口直接拉取所有以这个池作为“to”的交易列表，然后从中提取唯一的“from” 地址。如果使用 RPC 实现，会非常麻烦，而 Etherscan 就可以直接使用 `txlist` 接口。

由于 Etherscan 提供的是 HTTP 接口，我们可以无需写代码，直接使用命令行工具 `curl` ，在终端中输入如下命令：

```bash
curl "https://api.etherscan.io/v2/api?\
chainid=1&\
module=account&\
action=txlist&\
address=0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc&\
startblock=23974499&\
sort=asc&\
page=1&\
offset=100&\
apikey=YF2WA7IQCDKSCE11J2H94D6G7NEYZSU4ZX"
```

其中：

- `chainid=1`：表示查询以太坊主网
- `module=account`：当前查询的是和账户相关的数据
- `action=txlist`：查询普通交易列表
- `address=...`：要查询的地址
- `startblock` / `endblock`：查询的区块范围
- `sort=asc`：按区块高度从低到高排序
- `apikey`：你的 Etherscan API Key
- 该接口的详细参数：阅读 [https://docs.etherscan.io/api-reference/endpoint/txlist](https://docs.etherscan.io/api-reference/endpoint/txlist)

如果请求成功，会得到一段 JSON 返回，大致是这样的结构：

```json
{
  "status": "1",
  "message": "OK",
  "result": [
      {
          "blockNumber": "23974499",
          "blockHash": "0xbaabc8efcc9fded2cffbf86adedde0bed6afe12ece63c9610e7c1a257b298427",
          "timeStamp": "1765274591",
          "hash": "0x7303729a35c16b76fdca36ca3fca9808f13e48dd84fcf74bc1fb2fd1610d9587",
          "nonce": "183",
          "transactionIndex": "172",
          "from": "0xa415e5ddf7f3411cd80d1199f2eb01d1f4978f6f",
          "to": "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
          "value": "0",
          "gas": "26829",
          "gasPrice": "243484710",
          "input": "0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "methodId": "0x095ea7b3",
          "functionName": "approve(address _spender, uint256 _value)",
          "contractAddress": "",
          "cumulativeGasUsed": "17501803",
          "txreceipt_status": "1",
          "gasUsed": "26486",
          "confirmations": "15417",
          "isError": "0"
      },
      {
          "blockNumber": "23974551",
          "blockHash": "0x4ab1aca5b3572a06de6a49ec25eef1e23be9ec6ad00c6ac8f7ff5bd7d0dcd3f6",
          "timeStamp": "1765275215",
          "hash": "0x6683bee64d79b637507bcb6804fae714a272ffc650b0a96ba5b1fdf7e5a467cd",
          "nonce": "355",
          "transactionIndex": "58",
          "from": "0x059b254553bb97ca61a99c2bbdbefb594aa94365",
          "to": "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
          "value": "0",
          "gas": "69666",
          "gasPrice": "1255362667",
          "input": "0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d00000000000000000000000000000000000000000000000000000003d41e1781",
          "methodId": "0x095ea7b3",
          "functionName": "approve(address _spender, uint256 _value)",
          "contractAddress": "",
          "cumulativeGasUsed": "5581061",
          "txreceipt_status": "1",
          "gasUsed": "46062",
          "confirmations": "15365",
          "isError": "0"
      },
      ...
   ]
}
```

这里返回的 “result” 是一个交易数组，每笔交易都包含了详细的信息，比如区块号、时间戳、交易哈希、发送方、接收方、转账金额（以 wei 为单位）、gas 消耗等。注意，如果有错误，“status”会变成“0”，并在“message”中解释原因，比如“NOTOK”或具体的限额提示。从结果中，你可以过滤“to”等于池地址且“isError=0”的记录，提取“from”作为互动的 EOA。返回的 result 数组，和你在网站中看到的数据h[ttps://etherscan.io/address/0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc](https://etherscan.io/address/0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc) ，应该是一致的。

![截屏2025-12-11 22.41.33.png](Etherscan/%E6%88%AA%E5%B1%8F2025-12-11_22.41.33.png)

但是你发现，作为如此常用的一个流动性池，交易记录却非常少。这不是因为这个池子不活跃，而是因为 Uniswap 的机制设计和使用方式。Uniswap V2 是一个去中心化交易所（DEX），允许用户在没有中心化订单簿的情况下交换 ERC-20 代币。ERC-20 是以太坊上最常见的代币标准，定义了代币合约的基本接口，比如 transfer（转账）、balanceOf（查询余额）和 approve（授权他人使用代币）。在 Uniswap 中，每个交易对（例如 USDC-ETH）都对应一个独立的 Pair 合约，这个合约本身就是一个资金池，持有两种代币的储备并负责处理 swap 和 addLiquidity 等操作。理论上，用户与该合约的每一次交互都属于普通外部交易，因此应该出现在池地址的 txlist 中。然而，查询结果之所以有时显得很少，原因并不是池不活跃，而是因为实际交互路径往往比想象中间接得多。

在 Uniswap V2 的设计中，大多数用户并不会直接调用 Pair 合约。相反，他们通常通过 Uniswap Router 合约完成 swap 或添加流动性。用户提交的交易是发往 Router 的，Router 再在合约内部调用 Pair。对链上来说，Router → Pair 属于内部调用，Etherscan 的 txlist 只显示顶层外部交易，因此这些内部调用不会出现在 Pair 的“Transactions”列表中。结果就是：尽管池子参与了大量 swap，但 txlist 却只显示极少数直接与 Pair 交互的交易，例如开发者手动调用 Pair 或老式脚本绕过 Router 时的交互。除了官方 Router，链上还有大量聚合器（如 1inch、Matcha、Paraswap 等），它们的调用路径更复杂：用户先调用聚合器智能合约，聚合器再调用 Router 或直接调用多个 Pair。所有这些层层嵌套的内部调用也同样不会记录在 Pair 的 txlist 里，使得表面上看池似乎“不太活跃”。

此外，ETH 在 Uniswap 体系中通常以 WETH 的形式参与交易，因为 Pair 合约只能处理 ERC-20 代币。这意味着实际的价值流动大多不是 native ETH 转账，而是 WETH 或其他 ERC-20 的 transfer，这些会出现在 Etherscan 的“ERC20 Token Txns”页面，而不是普通交易列表。综上，当你预期看到大量池子交互却只在 txlist 中看到寥寥数笔时，这往往不是数据缺失，而是因为查询对象只捕捉了外层交易，而 Uniswap 的架构（Router、聚合器、ERC-20 包装机制）显著减少了直接写在 Pair 合约上的“顶层”交易记录。这也是为什么在分析 DEX 行为时，往往需要更精细的链上数据工具来追踪内部调用与事件日志，比如 `txlistinternal` 接口。

## `txlistinternal`

现在，我们看看接口：“txlistinternal”。这也是“module=account”下的一个 action，但它专门查询“内部交易”，也就是合约执行过程中发生的 ETH 转移。这些转移不直接出现在交易的顶层结构中，而是隐藏在执行痕迹（trace）里。Etherscan 帮你解析了这些，所以你能直接拿到。

什么是 internal transaction？简单说，它是合约执行中涉及 native ETH 转移的子调用，比如通过 EVM 的 CALL opcode 发送 ETH（value > 0），或 CREATE（创建合约）、SELFDESTRUCT（合约自毁）这样的操作。这些是从交易的执行路径中解析出来的，在 Etherscan 的另一个 tab 下（**Internal Transactions）**。

为什么这个接口重要？回想我们开头的例子：如果你想知道“有哪些交易向某个地址转过 ETH”，但这些转账可能是从合约内部发出的，比如一个 DEX 的路由合约在 swap 后把 ETH 转给你，要查询这个使用 RPC 是非常困难的，而 Etherscan 就提供了很好的接口。

要理解 internal transaction 的实际应用，我们来看一个经典的历史事件：The DAO 事件。2016 年，The DAO 是一个早期的去中心化自治组织（DAO），它通过智能合约筹集了大量 ETH（当时价值超过 1.5 亿美元），允许参与者投票投资项目。但由于合约代码漏洞，黑客利用递归调用攻击（reentrancy attack）窃取了约 360 万 ETH。这导致以太坊社区分裂，最终通过硬分叉（hard fork）创建了 Ethereum（ETH）和 Ethereum Classic（ETC）。为了让受害者取回资金，以太坊团队部署了一个退款合约：WithdrawDAO（地址：0xbf4ed7b27f1d666546e30d74d50d173d20bca754）。WithdrawDAO 的退款机制很简单：它持有被盗的 ETH，用户（原 DAO 持有者）可以调用 withdraw 函数，合约通过内部调用发送 ETH 到调用者的地址。这个发送就是带 value 的 CALL 操作，形成 internal transaction。用户不直接转账到合约，而是触发合约内部分发 ETH。即使到现在，这个合约仍活跃，用户偶尔还会提取剩余资金。

假设我们想查询最近退款的地址——也就是找出哪些 EOA 最近从 WithdrawDAO 收到 internal ETH ，即[https://etherscan.io/address/0xbf4ed7b27f1d666546e30d74d50d173d20bca754#internaltx](https://etherscan.io/address/0xbf4ed7b27f1d666546e30d74d50d173d20bca754#internaltx)。我们可以用同样的方式调用 `txlistinternal` 接口。

```bash
curl "https://api.etherscan.io/v2/api?\
chainid=1&\
module=account&\
action=txlistinternal&\
address=0xBf4eD7b27F1d666546E30D74d50d173d20bca754&\
startblock=23655563&\
sort=desc&\
apikey=YF2WA7IQCDKSCE11J2H94D6G7NEYZSU4ZX"
```

可以得到类似的结果：

```json
{
    "status": "1",
    "message": "OK",
    "result": [
        {
            "blockNumber": "23977587",
            "timeStamp": "1765312067",
            "hash": "0x8a0276533e453db86b0d1845b29f0dd60b164c922e3a72ec91edb12b239b9865",
            "from": "0xbf4ed7b27f1d666546e30d74d50d173d20bca754",
            "to": "0x30213bca208f1d284156d820575c14d412fed780",
            "value": "91666666666666666",
            "contractAddress": "",
            "input": "",
            "type": "call",
            "gas": "2300",
            "gasUsed": "0",
            "traceId": "0_1",
            "isError": "0",
            "errCode": ""
        },
        {
            "blockNumber": "23839011",
            "timeStamp": "1763626655",
            "hash": "0xf4ab4582e39b9db0cef9d561692e37cad5dd9563b5ec0644640cb22bde0aee78",
            "from": "0xbf4ed7b27f1d666546e30d74d50d173d20bca754",
            "to": "0x009d960a7eb81292ad5459ce916c540acebdece0",
            "value": "40000000000000000000",
            "contractAddress": "",
            "input": "",
            "type": "call",
            "gas": "2300",
            "gasUsed": "0",
            "traceId": "0_1",
            "isError": "0",
            "errCode": ""
        }
    ]
}
```

其中每个条目代表一次退款，“from” 是 WithdrawDAO，“to” 是接收者 EOA，“value” 是转出的 ETH 量（wei 单位，转成 ETH 需除以 10^18），“type=call” 表示这是 ETH 发送调用，“isError=0” 意味着成功。

## Follow Up

参考 API 文档 https://docs.etherscan.io/api-reference/endpoint/tokentx。获取合约 0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc

+ 在 12 月 1 日的所有 ERC20 交易，如果单次请求返回的数据过大，考虑使用 page 和 offset 参数来分页处理。
+ 在 7 月 ～ 11 月，四个月的所有 ECR20 交易，统计收到 Token 的所有地址，因为数据量会很大，手动写 `curl` 请求已经不现实。考虑使用编程语言调用 HTTP 接口，推荐使用 Go 语言，和 Part I 保持一致。

