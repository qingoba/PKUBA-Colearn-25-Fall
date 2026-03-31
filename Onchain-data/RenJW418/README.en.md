# ⬡ TronSage — AI-Powered TRON On-chain Agent

> **🏆 TRON × Bank of AI Hackathon 2025 Submission**  
> Build period: March 16, 2025 - March 31, 2025

[![TRON](https://img.shields.io/badge/Network-TRON%20Mainnet-red?style=flat-square)](https://tron.network)
[![Bank of AI](https://img.shields.io/badge/Powered%20by-Bank%20of%20AI-cyan?style=flat-square)](https://bankofai.io)
[![x402](https://img.shields.io/badge/Protocol-x402%20Payment-purple?style=flat-square)](https://bankofai.io)
[![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black?style=flat-square)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[中文文档（默认）](./README.md) | **English README**

---

## Project Overview

TronSage is an AI-powered on-chain agent platform for the TRON ecosystem, integrating:
- Large on-chain capital flow monitoring
- Paid AI market analysis
- DeFi yield opportunity screening
- Multi-agent collaboration and execution
- Prediction anchoring on-chain

The platform monetizes AI services through Bank of AI's x402 protocol, supporting dual-token payments in USDT and USDD (TRC20).

---

## Core Capabilities

| Module | Description |
|--------|-------------|
| Whale Tracker | Monitors large TRON transfers and detects unusual fund flows |
| AI Analyst | Accepts natural language queries and returns structured market analysis |
| Portfolio Analyzer | Gives TRX/TRC20 asset breakdown from a wallet address |
| DeFi Opportunity Radar | Compares APY, TVL, and risk tiers |
| Multi-Agent Orchestration | Coordinates specialized sub-agents and settles tasks |
| Prediction Market | Generates daily predictions and supports outcome backfill |
| Alert System | Rule-based subscriptions and push notifications |
| 8004 Identity System | Agent reputation, service history, and activity records |

---

## Bank of AI Integration

### 1. x402 Payment Protocol (USDT + USDD)

Dual-token payments are supported:
- USDT (TRC20, 6 decimals)
- USDD (TRC20, 18 decimals)

Standard payment flow:
1. Frontend requests payment params: `GET /api/payment/request?token=USDT|USDD`
2. User pays 0.1 USDT or 0.1 USDD to the agent address
3. User submits transaction hash: `POST /api/payment/request`
4. Server validates on-chain via TronScan, then unlocks AI services

Implementation:
- Payment creation and verification: `src/lib/bankofai.ts`
- Payment API route: `src/app/api/payment/request/route.ts`
- Payment modal UI: `src/components/PaymentModal.tsx`

### 2. 8004 On-chain Identity Protocol

Agent identity includes:
- Unique Agent ID
- Reputation score and tier
- Service history and activity log
- Payment and task behavior records

Implementation:
- Identity logic: `src/lib/bankofai.ts`
- Identity API route: `src/app/api/identity/route.ts`
- Identity card UI: `src/components/AgentIdentity.tsx`

### 3. MCP Capability Exposure

Provides extensible on-chain tooling interfaces, including wallet data, DeFi data, and event querying.

### 4. Skills Modules

Built-in reusable skills (for example, portfolio analysis and swap quoting) are available for AI orchestration.

---

## Multi-Agent Economic Model

Endpoint: `POST /api/multi-agent`

TronSage orchestrates 3 sub-agents for collaborative task execution:
- Price Oracle Agent
- Whale Behavior Analysis Agent
- Risk Assessment Agent

When `AGENT_TRON_PRIVATE_KEY` is configured, real on-chain TRC20 settlement is executed. If not configured, the system runs in demo-safe simulated settlement mode.

---

## Prediction Anchoring On-chain

Endpoint: `POST /api/prediction`

The system generates a daily prediction digest and attempts to anchor it into TRON memo data, creating verifiable timestamp evidence. Then `PUT /api/prediction` can backfill actual outcomes and evaluate prediction accuracy.

---

## Technical Stack

- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Backend: Next.js API Routes
- Blockchain: TronWeb (server-side), TronScan API, TronGrid API
- AI: Kimi (Moonshot) via OpenAI-compatible interface
- Payments: Bank of AI x402 (USDT/USDD)
- Identity: Bank of AI 8004
- Deployment: Vercel

---

## Quick Start

### Requirements
- Node.js 18+
- npm or yarn

### Install and Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open: `http://localhost:3000`

### Build

```bash
npm run build
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KIMI_API_KEY` | Yes | API key for AI analysis |
| `AGENT_TRON_ADDRESS` | Yes | TRON address receiving USDT/USDD payments |
| `AGENT_TRON_PRIVATE_KEY` | No | Real multi-agent on-chain transfers and memo anchoring |
| `TRONGRID_API_KEY` | No | Higher blockchain API rate limits |
| `TELEGRAM_BOT_TOKEN` | No | Telegram bot token |
| `TELEGRAM_WEBHOOK_SECRET` | No | Telegram webhook signature secret |

---

## Project Structure

```text
tron-sage/
├── src/
│   ├── app/api/
│   │   ├── analyze/route.ts
│   │   ├── payment/request/route.ts
│   │   ├── multi-agent/route.ts
│   │   ├── prediction/route.ts
│   │   ├── alerts/route.ts
│   │   ├── identity/route.ts
│   │   ├── whale-tracker/route.ts
│   │   └── ...
│   ├── components/
│   ├── lib/
│   └── types/
├── README.md
├── README.en.md
└── .env.example
```

---

## Security Notes

- Private keys are never exposed to the frontend
- Payment verification is based on on-chain transaction queries
- Address and tx-hash format checks are enforced
- `.env.local` must never be committed

---

## Acknowledgments

- [Bank of AI](https://bankofai.io)
- [TRON](https://tron.network)
- [TronScan](https://tronscan.org)
- [Moonshot AI](https://kimi.moonshot.cn)

---

Built for the TRON × Bank of AI Hackathon.