---
name: tronclaw-automation
description: >
  Use this skill to automate TRON on-chain tasks: create price-triggered auto
  trades, batch transfer to multiple addresses, list and cancel automation tasks.
  TRIGGER: "自动", "定时", "条件触发", "批量转账", "auto trade", "automation", "price alert", "auto buy/sell"
version: 1.0.0
---

# TronClaw Automation Skill

Call TronClaw Gateway REST API to set up and manage automated on-chain tasks.

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

## Auto Trade (Price-Triggered)

```javascript
const task = await tron('/api/v1/automation/trade', 'POST', {
  tokenPair: 'TRX/USDT',    // format: BASE/QUOTE
  triggerPrice: '0.08',      // trigger when price hits this
  action: 'buy',             // buy | sell
  amount: '500'              // amount of base token
})
// Returns: {
//   taskId: "uuid",
//   type: "auto_swap",
//   status: "active",
//   conditions: { tokenPair, triggerPrice, action },
//   createdAt: 1234567890
// }
```

## Batch Transfer

```javascript
// Send to multiple addresses in one call
const result = await tron('/api/v1/automation/batch-transfer', 'POST', {
  transfers: [
    { to: 'TAddress1...', amount: '10',  token: 'USDT' },
    { to: 'TAddress2...', amount: '5',   token: 'USDT' },
    { to: 'TAddress3...', amount: '100', token: 'TRX'  },
  ]
})
// Returns: { txHashes: ["hash1", "hash2", "hash3"], totalCost: "~20 TRX energy" }
```

## List Tasks

```javascript
const tasks = await tron('/api/v1/automation/tasks')
// Filter by status:
const active = await tron('/api/v1/automation/tasks?status=active')
// Returns: [{ taskId, type, status, conditions, triggerCount, createdAt }]
// status: active | paused | triggered | completed | cancelled
```

## Cancel Task

```javascript
// DELETE /api/v1/automation/tasks/:taskId
const res = await fetch(`${GATEWAY}/api/v1/automation/tasks/${taskId}`, { method: 'DELETE' })
// Returns: { taskId, status: "cancelled" }
```

## Create General Automation

```javascript
const task = await tron('/api/v1/automation/create', 'POST', {
  type: 'whale_alert',        // price_alert | auto_swap | scheduled_transfer | whale_alert
  conditions: { token: 'USDT', minAmount: '1000000' },
  actions: [{ type: 'notify', params: { message: 'Whale detected!' } }]
})
```

## Demo Scenario

> User: "当TRX跌到0.08 USDT时自动买入500个TRX"
> → Call /api/v1/automation/trade with tokenPair="TRX/USDT", triggerPrice="0.08", action="buy", amount="500"
> → Confirm task created with taskId and status: active
