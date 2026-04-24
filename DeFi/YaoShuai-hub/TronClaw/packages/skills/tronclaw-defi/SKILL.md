---
name: tronclaw-defi
description: >
  Use this skill for TRON DeFi operations: query yield rates on SunSwap and
  JustLend, get AI-powered yield optimization strategies, or execute token swaps.
  TRIGGER: "收益", "DeFi", "yield", "APY", "swap", "兑换", "优化", "JustLend", "SunSwap"
version: 1.0.0
---

# TronClaw DeFi Skill

Call TronClaw Gateway REST API for DeFi operations on TRON.

## Setup

```javascript
const GATEWAY = process.env.TRONCLAW_GATEWAY ?? 'http://localhost:3000'

async function tron(path, method = 'GET', body = null) {
  const res = await fetch(`${GATEWAY}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return (await res.json()).data
}
```

## Query DeFi Yields

```javascript
// protocol: sunswap | justlend | all
const pools = await tron('/api/v1/defi/yields?protocol=all')
// Returns: [{ protocol, name, token0, token1?, apy, tvl, riskLevel: "low"|"medium"|"high" }]

// Example output:
// [
//   { protocol: "justlend", name: "USDT Supply", apy: "8.5", tvl: "450000000", riskLevel: "low" },
//   { protocol: "sunswap",  name: "TRX/BTT LP",  apy: "35.2", tvl: "12000000", riskLevel: "high" },
// ]
```

## AI Yield Optimizer

```javascript
const strategy = await tron('/api/v1/defi/optimize', 'POST', {
  portfolio: [
    { token: 'USDT', amount: '1000' },
    { token: 'TRX',  amount: '500'  },
  ],
  riskPreference: 'low'   // low | medium | high
})
// Returns: {
//   strategy: "Supply to USDD Supply on JustLend for 12.3% APY",
//   expectedApy: "12.3",
//   riskLevel: "low",
//   steps: [
//     { action: "swap",   protocol: "SunSwap", description: "Swap 500 TRX → USDD" },
//     { action: "supply", protocol: "JustLend", description: "Supply 1000 USDD" },
//   ],
//   estimatedGas: "20"
// }
```

## Swap Tokens (SunSwap)

```javascript
const swap = await tron('/api/v1/defi/swap', 'POST', {
  fromToken: 'TRX',
  toToken: 'USDT',
  amount: '100',
  slippage: 0.5      // percent, default 0.5
})
// Returns: { txHash, fromToken, toToken, fromAmount, toAmount, priceImpact, fee }
```

## Supply to JustLend

```javascript
const lend = await tron('/api/v1/defi/lend', 'POST', {
  token: 'USDT',
  amount: '500'
})
// Returns: { txHash, apy: "8.5" }
```

## Demo Scenario

> User: "帮我把1000 USDT找个低风险的最优收益策略"
> → Call /api/v1/defi/optimize with portfolio=[{token:"USDT",amount:"1000"}], riskPreference="low"
> → Present strategy with APY and steps to user
