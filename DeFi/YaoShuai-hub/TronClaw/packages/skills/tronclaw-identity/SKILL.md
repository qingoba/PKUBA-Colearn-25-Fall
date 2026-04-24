---
name: tronclaw-identity
description: >
  Use this skill for TRON on-chain AI Agent identity operations via the 8004
  protocol: register an agent identity on-chain, query trust score and reputation,
  or verify an agent's identity.
  TRIGGER: "身份", "注册agent", "信誉", "trust score", "8004", "identity", "reputation", "verify agent"
version: 1.0.0
---

# TronClaw Identity Skill (8004 Protocol)

Call TronClaw Gateway REST API for on-chain AI Agent identity management.

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

## Register Agent Identity (8004)

```javascript
const identity = await tron('/api/v1/identity/register', 'POST', {
  agentName: 'MyTronAgent',
  capabilities: ['payment', 'defi', 'data', 'automation'],
  ownerAddress: 'TOwnerWalletAddress...'
})
// Returns: {
//   agentId: "agent_xxxxxxxxxxxxxxxx",
//   agentName: "MyTronAgent",
//   ownerAddress: "T...",
//   capabilities: ["payment", "defi", ...],
//   trustScore: 100,
//   totalTransactions: 0,
//   successRate: 1.0,
//   registeredAt: 1234567890,
//   identityTxHash: "mock_identity_agent_xxx"
// }
```

## Query Reputation & Trust Score

```javascript
const rep = await tron(`/api/v1/identity/reputation/${agentId}`)
// Returns: {
//   agentId, agentName, ownerAddress,
//   trustScore: 95,           // 0-100, higher = more trusted
//   totalTransactions: 128,
//   successRate: 0.98,        // 0-1
//   capabilities: [...]
// }
```

## Verify Agent

```javascript
const result = await tron(`/api/v1/identity/verify/${agentId}`)
// Returns: {
//   verified: true,            // true if registered & trustScore >= 50
//   identity: { agentId, agentName, trustScore, ... }
// }
```

## Demo Scenario

> User: "帮我给这个AI Agent注册一个TRON链上身份"
> → Call /api/v1/identity/register with agentName, capabilities, ownerAddress
> → Return agentId and trustScore to user
>
> User: "查询agent_69415c52d3fc47ff 的信誉评分"
> → Call /api/v1/identity/reputation/agent_69415c52d3fc47ff
> → Show trustScore, totalTransactions, successRate
