---
name: tronclaw-payment
description: >
  Use this skill when you need to perform TRON blockchain payment operations:
  check USDT/USDD/TRX balances, send payments via x402 protocol, create payment
  request URLs for collecting fees, or check payment status.
  TRIGGER: "查余额", "转账", "收款", "balance", "send payment", "x402", "USDT", "USDD"
version: 1.0.0
---

# TronClaw Payment Skill

Call TronClaw Gateway REST API for all payment operations.

## Setup

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

## Check Balance

```javascript
// tokens: TRX | USDT | USDD
const balance = await tron(`/api/v1/payment/balance?address=${address}&token=USDT`)
// Returns: { address, token, balance: "999.000000", usdValue: "999.00", network }
```

## Send Payment (x402 Protocol)

```javascript
const tx = await tron('/api/v1/payment/send', 'POST', {
  to: 'TRecipientAddress',   // TRON base58 address
  amount: '1.5',              // string, e.g. "1.5"
  token: 'USDT',             // USDT | USDD
  memo: 'optional memo'      // optional
})
// Returns: { txHash, from, to, amount, token, status: "pending"|"confirmed", timestamp }
```

## Create Payment Request (x402 collect)

```javascript
// Agent creates a URL that users pay to
const req = await tron('/api/v1/payment/request', 'POST', {
  amount: '0.5',
  token: 'USDT',
  description: 'AI Writing Service fee'
})
// Returns: { payId, paymentUrl, recipientAddress, expiresAt (30min), status: "pending" }
```

## Check Payment Status

```javascript
const status = await tron(`/api/v1/payment/status/${payId}`)
// Returns: { payId, status: "pending"|"paid"|"expired", amount, token }
```

## Response Format

All calls return `{ success, data, error }`. Access via `json.data`.

## Demo Scenario

> User: "帮我创建一个收取 0.5 USDT 的收款链接，用于 AI 写作服务"
> → Call tron_create_payment_request
> → Return paymentUrl to user
