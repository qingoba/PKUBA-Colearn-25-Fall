# TronClaw — AI Agent TRON Chain Gateway

## Project Overview

TronClaw is a **platform-level TRON chain capability gateway** for the TRON x Bank of AI Hackathon (March 16-31, 2026). Any AI Agent can plug in and instantly gain TRON-native capabilities: payment, DeFi, on-chain data, and automation.

**Core concept**: Instead of building a single AI Agent, TronClaw enables ALL agents to access TRON via a unified gateway — a new economic model for AI x Web3.

## Hackathon Context

- **Deadline**: March 31, 2026
- **Prize pool**: 1,000 USDT (1st: 500, 2nd: 300, 3rd: 200)
- **Judging criteria**: Innovation, Technical Implementation, Product Usability, Demo Completeness
- **Deliverables**: GitHub repo + deployed demo + 5-min video + Google Form submission
- **Winning strategy**: Full Bank of AI integration (all 4 infra components) + platform-level positioning

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS + shadcn/ui + Recharts + Zustand |
| Backend Gateway | Node.js + Express + TypeScript |
| Blockchain | TronWeb SDK + @t402/tron (x402 Payment Protocol) |
| Identity | 8004 On-chain Identity (Bank of AI) |
| Agent Protocol | @modelcontextprotocol/sdk (MCP standard) |
| Realtime | WebSocket (ws) |
| Database | SQLite (better-sqlite3) |
| Validation | Zod |
| Deployment | Vercel (frontend) + Railway/Fly.io (backend) |

## Architecture

```
External AI Agents
    │  (OpenClaw Plugin / MCP Protocol / REST API)
    ▼
TronClaw Gateway (Node.js + Express + TypeScript)
    ├── Agent Connector Layer (MCP / REST / Plugin)
    ├── Core Engine
    │   ├── Payment Module   — x402 Protocol (USDT/USDD send/receive/micropay)
    │   ├── DeFi Module      — SunSwap swap + JustLend lending + yield optimization
    │   ├── Data Module      — Address analysis, whale tracking, token info, tx history
    │   ├── Automation Module — Price alerts, auto-trade, scheduled transfers, batch ops
    │   ├── Identity Module  — 8004 agent registration, reputation, verification
    │   └── Wallet Manager   — Key management, multi-wallet, signing
    ▼
External Infrastructure
    TRON Network (TronWeb) | Bank of AI (x402/8004/MCP/Skills) | TronGrid API | SunSwap/JustLend
```

## Project Structure (Target)

```
TronClaw/
├── packages/
│   ├── gateway/           # Backend Gateway service
│   │   └── src/
│   │       ├── server.ts, index.ts
│   │       ├── mcp/       # MCP Tool Provider
│   │       ├── modules/   # payment/, defi/, data/, automation/, identity/
│   │       ├── tron/      # TronWeb client, wallet, contracts
│   │       ├── api/       # REST API routes
│   │       └── ws/        # WebSocket realtime
│   ├── frontend/          # React frontend
│   │   └── src/
│   │       ├── pages/     # Landing, Chat, Dashboard, Agents, Explorer
│   │       ├── components/# ChatMessage, TransactionFeed, BalanceCard, DeFiChart, WhaleAlert
│   │       ├── hooks/, stores/, lib/
│   ├── shared/            # Shared types and constants
│   └── openclaw-plugin/   # OpenClaw plugin package
├── doc/                   # Hackathon brief
├── PROJECT_PLAN.md        # Full project plan and sprint schedule
├── .github/workflows/     # Claude Code Action CI
└── .claude/skills/        # UI/UX Pro Max design skill
```

## Bank of AI Integration Checklist

| Infrastructure | SDK/API | Module | Priority |
|---------------|---------|--------|----------|
| x402 Payment Protocol | `@t402/tron`, `@t402/express` | Payment | P0 - Core |
| 8004 On-chain Identity | Bank of AI API | Identity | P1 - Nice to have |
| MCP Server | `@modelcontextprotocol/sdk` | MCP Tool Provider | P0 - Core |
| Skills Modules | Bank of AI Skills API | DeFi + Payment | P0 - Core |

## Sprint Plan (4 Days)

- **Day 1 (3/27)**: Project init (monorepo) + TronWeb + x402 Payment Module + MCP framework
- **Day 2 (3/28)**: DeFi Module (SunSwap/JustLend) + Data Module (TronGrid) + Automation + Identity
- **Day 3 (3/29)**: Frontend (Landing + Chat UI + Dashboard) + WebSocket + E2E integration
- **Day 4 (3/30-31)**: Deploy (Vercel + Railway) + README + OpenClaw plugin + 5-min demo video

## MVP (Minimum Viable)

Must have:
1. Payment Module (x402) — core Bank of AI integration
2. Chat UI — natural language agent interaction
3. Dashboard — realtime transaction feed
4. MCP Tool Provider — universal agent access
5. On-chain Data queries — basic data capability

Nice to have: DeFi auto-strategy, Automation triggers, full 8004 Identity, OpenClaw plugin packaging

## Development Guidelines

- **Monorepo**: pnpm workspace with `packages/gateway`, `packages/frontend`, `packages/shared`
- **Language**: TypeScript strict mode throughout
- **Immutability**: Always return new objects, never mutate
- **Error handling**: Comprehensive at every level, user-friendly in UI, detailed in logs
- **File size**: Target 200-400 lines, max 800
- **Testing**: Minimum 80% coverage, TDD approach
- **API pattern**: Consistent envelope `{ success, data, error, metadata }`
- **Demo-first**: Every feature must be demonstrable in the Chat UI or Dashboard

## Key Commands

```bash
# Development
pnpm install              # Install all dependencies
pnpm dev                  # Start all packages in dev mode
pnpm --filter gateway dev # Start gateway only
pnpm --filter frontend dev# Start frontend only

# Testing
pnpm test                 # Run all tests
pnpm test:coverage        # With coverage report

# Build & Deploy
pnpm build                # Build all packages
```

## Environment Variables

```bash
# Required
TRON_PRIVATE_KEY=         # TRON wallet private key (testnet)
TRON_NETWORK=nile         # nile (testnet) or mainnet
TRONGRID_API_KEY=         # TronGrid API key

# Bank of AI
X402_PAYMENT_ADDRESS=     # x402 payment receiving address
BANK_OF_AI_API_KEY=       # Bank of AI API access

# Optional
PORT=3000                 # Gateway port
FRONTEND_URL=             # Frontend URL for CORS
DATABASE_PATH=./data.db   # SQLite database path
```

## Risk Mitigations

- x402 testnet instability → Prepare mock mode, switchable at demo time
- Time pressure → Cut non-core features, focus Payment + Chat UI + Dashboard
- Incomplete Bank of AI docs → Build primarily on @t402/tron SDK
- Complex DeFi contracts → Direct TronWeb calls, avoid over-abstraction
