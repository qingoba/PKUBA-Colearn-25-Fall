---
name: tronclaw-data
description: >
  Use this skill to analyze TRON on-chain data: query address info and holdings,
  get transaction history, track whale (large) transfers, or look up token details.
  TRIGGER: "链上数据", "地址分析", "交易记录", "鲸鱼", "whale", "on-chain", "address", "token info"
version: 1.0.0
---

# TronClaw On-chain Data Skill

Call TronClaw Gateway REST API to query TRON blockchain data via TronGrid.

## Setup

```javascript
const GATEWAY = process.env.TRONCLAW_GATEWAY ?? 'http://localhost:3000'

async function tron(path) {
  const res = await fetch(`${GATEWAY}${path}`)
  return (await res.json()).data
}
```

## Analyze Address

```javascript
const info = await tron(`/api/v1/data/address/${address}`)
// Returns: {
//   address,
//   trxBalance: "3577.193000",
//   tokenHoldings: [{ symbol, name, balance, decimals, contractAddress }],
//   txCount: 1542,
//   firstTxDate: "2022-03-15",
//   tags: ["whale", "defi_user"]
// }
```

## Transaction History

```javascript
const txs = await tron(`/api/v1/data/transactions/${address}?limit=20`)
// Returns: [{ hash, from, to, value, tokenSymbol, timestamp, confirmed }]
```

## Whale Tracker

```javascript
// Track large transfers in last N hours
const whales = await tron('/api/v1/data/whales?token=USDT&hours=24')
// Also: token=USDD, token=TRX
// Returns: [{ hash, from, to, amount, tokenSymbol, timestamp, usdValue }]

// Custom threshold:
const whales = await tron('/api/v1/data/whales?token=USDT&minAmount=500000&hours=12')
```

## Token Info

```javascript
const token = await tron(`/api/v1/data/token/${contractAddress}`)
// Returns: { name, symbol, decimals, totalSupply, holders, price, marketCap }

// Known addresses:
// USDT mainnet:  TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
// USDD mainnet:  TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn
```

## Demo Scenario

> User: "最近24小时有哪些大额USDT转账？"
> → Call /api/v1/data/whales?token=USDT&hours=24
> → Format and present whale transfers to user
>
> User: "分析地址 TXYZop... 的持仓情况"
> → Call /api/v1/data/address/TXYZop...
> → Show TRX balance, token holdings, activity summary
