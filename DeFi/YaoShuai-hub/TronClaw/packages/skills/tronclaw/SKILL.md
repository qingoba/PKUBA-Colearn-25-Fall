---
name: tronclaw
description: >
  Master skill for TronClaw — the TRON blockchain AI Agent gateway.
  Loads all TronClaw sub-skills. Use this when you need any TRON capability:
  payments, DeFi, on-chain data, automation, or agent identity.
  Sub-skills: tronclaw-payment, tronclaw-defi, tronclaw-data, tronclaw-automation, tronclaw-identity
version: 1.0.0
---

# TronClaw — TRON Blockchain Capability Gateway

> Any AI Agent + TronClaw = Instant TRON Superpowers

## Available Sub-Skills

Load only what you need (reduces context):

| Sub-skill | When to use |
|-----------|-------------|
| `tronclaw-payment` | Balance check, send USDT/USDD, x402 payment requests |
| `tronclaw-defi` | DeFi yields, swap, AI yield optimizer |
| `tronclaw-data` | Address analysis, tx history, whale tracker |
| `tronclaw-automation` | Auto trade, batch transfer, price alerts |
| `tronclaw-identity` | 8004 agent registration, trust score, verify |

## Quick Setup

```javascript
const GATEWAY = process.env.TRONCLAW_GATEWAY ?? 'http://localhost:3000'

async function tron(path, method = 'GET', body = null) {
  const res = await fetch(`${GATEWAY}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}
```

## Health Check

```javascript
const health = await tron('/health')
// → { status: "ok", network: "nile"|"mainnet", mock: false }
```

## Network Info

- **Nile testnet**: Use for development, free test tokens at https://nileex.io
- **Mainnet**: Set `TRON_NETWORK=mainnet` in gateway .env
- **Wallet**: `TFp3Ls4mHdzysbX1qxbwXdMzS8mkvhCMx6` (demo)

## All Endpoints at a Glance

```
GET  /health
GET  /api/v1/payment/balance?address=T...&token=USDT
POST /api/v1/payment/send          { to, amount, token, memo? }
POST /api/v1/payment/request       { amount, token, description }
GET  /api/v1/payment/status/:payId

GET  /api/v1/data/address/:address
GET  /api/v1/data/transactions/:address?limit=20
GET  /api/v1/data/whales?token=USDT&hours=24
GET  /api/v1/data/token/:contractAddress

GET  /api/v1/defi/yields?protocol=all
POST /api/v1/defi/optimize         { portfolio, riskPreference }
POST /api/v1/defi/swap             { fromToken, toToken, amount, slippage? }
POST /api/v1/defi/lend             { token, amount }

POST /api/v1/automation/trade      { tokenPair, triggerPrice, action, amount }
POST /api/v1/automation/batch-transfer  { transfers: [{to, amount, token}] }
GET  /api/v1/automation/tasks
DEL  /api/v1/automation/tasks/:taskId

POST /api/v1/identity/register     { agentName, capabilities, ownerAddress }
GET  /api/v1/identity/reputation/:agentId
GET  /api/v1/identity/verify/:agentId

POST /api/v1/chat/message          { message, walletAddress?, history? }
WS   ws://localhost:3000/ws        → realtime events
```

## Bank of AI Infrastructure

- **x402 Payment Protocol** → `/api/v1/payment/*`
- **8004 On-chain Identity** → `/api/v1/identity/*`
- **MCP Server** → `packages/gateway/src/mcp/server.ts`
- **Skills Modules** → `/api/v1/defi/*`
