# 🦀 TronClaw — AI Agent × TRON Capability Gateway

> **"Any AI Agent, Instant TRON Superpowers."**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://tron-claw-frontend.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-purple?logo=render)](https://tronclaw.onrender.com)
[![TRON](https://img.shields.io/badge/TRON-Nile%20Testnet-red)](https://nile.trongrid.io)
[![Bank of AI](https://img.shields.io/badge/Bank%20of%20AI-Full%20Integration-green)](https://bankofai.io)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

TronClaw is a **platform-level TRON capability gateway** built for the [TRON × Bank of AI Hackathon 2026](doc/TRON_BankOfAI_Hackathon.md).

Instead of building a single AI agent, TronClaw enables **any** AI Agent to instantly access TRON's on-chain capabilities — payments, DeFi, data analysis, and automation — through a unified gateway with three connection methods.

> ⚠️ **Demo Notice**: TronClaw is currently in **demo stage** running on the **Nile Testnet**. Some features (DeFi yields, swap rates, whale data) use mock/simulated data for stability. When deployed to TRON Mainnet, all features will operate with real on-chain data for a significantly better experience.

---

## 🌟 What TronClaw Does

```
External AI Agents (OpenClaw / Claude Desktop / Any MCP Agent)
          │
          │  OpenClaw Plugin │ MCP Protocol │ REST API
          ▼
   🦀 TronClaw Gateway  (https://tronclaw.onrender.com)
          │
          ├── 💳 SealPay      — x402 Agent Service Marketplace
          ├── 📈 TronSage     — DeFi Intelligent Advisor
          ├── 🔍 ChainEye     — On-chain Data Analytics
          ├── ⚡ AutoHarvest  — Automation & Auto-trading
          └── 🪪 Identity     — 8004 On-chain Agent Identity
          │
          ▼
   TRON Network + Bank of AI Infrastructure
```

---

## 🏦 Bank of AI Integration

TronClaw integrates **all four** Bank of AI infrastructure components:

### 1. x402 Payment Protocol
- AI agents automatically collect USDT/USDD payments for services
- Every service invocation in SealPay marketplace triggers an x402 payment
- Payment requests generate unique pay IDs with status tracking
- Endpoint: `POST /api/v1/payment/send` with x402 headers

### 2. 8004 On-chain Identity Protocol
- Agents must register an on-chain identity before using TronClaw AI Chat
- Identity registration stores agent metadata on TRON with a trust score
- Reputation system tracks successful transactions (starts at 100, grows over time)
- Endpoint: `POST /api/v1/identity/register`

### 3. MCP Server (Model Context Protocol)
- TronClaw exposes **17 tools** via standard MCP protocol
- Any MCP-compatible agent (Claude Desktop, Cursor, etc.) can connect
- Tools cover all modules: payment, DeFi, data, automation, identity, market
- Entry: `packages/gateway/dist/mcp-entry.js`

### 4. Skills Modules
- OpenClaw plugin provides 8 skills for direct integration
- Covers: balance check, payment, DeFi optimization, whale tracking, identity
- Install via: `clawhub install tronclaw`
- Located: `packages/openclaw-plugin/`

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://tron-claw-frontend.vercel.app |
| **Backend API** | https://tronclaw.onrender.com |
| **Health Check** | https://tronclaw.onrender.com/health |

### Demo Walkthrough

1. **Open Platform** → Navigate to Overview dashboard
2. **Connect Wallet** → Connect TronLink (Nile Testnet)
3. **SealPay** (`/market`) → Browse AI services, invoke one with x402 payment
4. **TronSage** (`/defi`) → View DeFi yields, execute AI-optimized strategy
5. **ChainEye** (`/data`) → Search any TRON address, watch real-time whale alerts
6. **AutoHarvest** (`/auto`) → Create price-triggered auto-trade task
7. **AI Chat** (`/chat`) → Register 8004 Agent Identity → chat with TronClaw AI

---

## 🏗️ Technical Architecture

```
packages/
├── gateway/              # Node.js + Express + TypeScript backend
│   └── src/
│       ├── api/          # REST routes (payment/defi/data/auto/identity/market/chat)
│       ├── mcp/          # MCP Tool Provider (17 tools)
│       ├── modules/      # Business logic per module
│       ├── tron/         # TronWeb 6.x client + wallet + contracts
│       ├── db/           # SQLite (tasks, identities, services, tx log)
│       └── ws/           # WebSocket real-time broadcast
├── frontend/             # React 18 + Vite + TailwindCSS
│   └── src/
│       ├── pages/        # Overview | Market | DeFi | Data | Auto | Chat | Landing
│       ├── components/   # WalletButton | Layout | AgentConnect
│       └── stores/       # Zustand (wallet, lang)
├── shared/               # Shared TypeScript types & token constants
└── openclaw-plugin/      # OpenClaw Skills integration
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js 20 + Express + TypeScript |
| **Blockchain** | TronWeb 6.x + @t402/tron (x402) |
| **AI / LLM** | Bank of AI API (Gemini Flash Lite) + tool use loop |
| **MCP** | @modelcontextprotocol/sdk |
| **Frontend** | React 18 + Vite + TailwindCSS + Framer Motion |
| **Charts** | Recharts |
| **State** | Zustand + localStorage |
| **Database** | SQLite (better-sqlite3) |
| **Realtime** | WebSocket (ws) → wss:// in production |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## 📋 API Reference

### Payment (`/api/v1/payment`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/balance` | GET | Check TRX/USDT/USDD balance |
| `/send` | POST | Send payment via x402 protocol |
| `/request` | POST | Create payment request (returns payId) |
| `/status/:payId` | GET | Check payment status |

### On-chain Data (`/api/v1/data`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/overview` | GET | TRON network overview (price, TVL, TPS) |
| `/address/:address` | GET | Full address analysis |
| `/transactions/:address` | GET | Transaction history |
| `/whales` | GET | Real-time whale transfer tracker |
| `/token/:address` | GET | Token information |

### DeFi (`/api/v1/defi`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/overview` | GET | DeFi landscape (TVL, APY, pools) |
| `/yields` | GET | Yield rates by protocol |
| `/portfolio/:address` | GET | User DeFi portfolio |
| `/swap` | POST | Token swap via SunSwap |
| `/routes` | GET | Swap route optimization |

### Automation (`/api/v1/automation`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/create` | POST | Create automation task |
| `/trade` | POST | Price-triggered auto trade |
| `/schedule` | POST | Scheduled transfer |
| `/whale-follow` | POST | Whale copy-trade task |
| `/stats` | GET | Global automation statistics |

### SealPay Market (`/api/v1/market`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/services` | GET | List all AI services |
| `/invoke` | POST | Invoke service (x402 auto-payment) |
| `/register` | POST | Register new service |
| `/history` | GET | Invocation history |
| `/stats` | GET | Market statistics |

### Identity 8004 (`/api/v1/identity`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/register` | POST | Register agent on-chain identity |
| `/reputation/:agentId` | GET | Get agent trust score |
| `/verify/:agentId` | GET | Verify agent identity |

### AI Chat (`/api/v1/chat`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/message` | POST | Natural language → tool execution |

---

## 🧩 MCP Tools (17 Tools)

Connect TronClaw as an MCP server to get 17 tools:

```json
{
  "mcpServers": {
    "tronclaw": {
      "command": "node",
      "args": ["packages/gateway/dist/mcp-entry.js"]
    }
  }
}
```

**Payment**: `tron_check_balance` · `tron_send_payment` · `tron_create_payment_request` · `tron_payment_status`

**Data**: `tron_analyze_address` · `tron_tx_history` · `tron_whale_tracker` · `tron_network_overview`

**DeFi**: `tron_defi_yields` · `tron_swap` · `tron_yield_optimize` · `tron_defi_overview`

**Automation**: `tron_auto_trade` · `tron_schedule_transfer` · `tron_batch_transfer`

**Identity**: `tron_register_agent_identity` · `tron_agent_reputation`

---

## 🚀 Local Development

### Prerequisites
- Node.js >= 20
- pnpm >= 9
- TronLink browser extension (Nile Testnet)
- TronGrid API key ([free at trongrid.io](https://www.trongrid.io/))

### Setup

```bash
git clone https://github.com/YaoShuai-hub/TronClaw.git
cd TronClaw
pnpm install

# Configure environment
cp packages/gateway/.env.example packages/gateway/.env
# Edit .env: fill TRON_PRIVATE_KEY, TRONGRID_API_KEY, GEMINI_API_KEY

# Start both frontend and backend
pnpm dev
```

- Frontend: http://localhost:5173
- Gateway API: http://localhost:3000

### Mock Mode (no wallet needed)

```bash
# In packages/gateway/.env
MOCK_TRON=true
TRON_PRIVATE_KEY=any_placeholder_value
```

### Key Environment Variables

```env
TRON_NETWORK=nile                    # nile (testnet) | mainnet
TRON_PRIVATE_KEY=your_private_key    # TRON wallet private key
TRONGRID_API_KEY=your_api_key        # TronGrid API key
BANK_OF_AI_API_KEY=sk-xxx            # Bank of AI API key
GEMINI_API_KEY=your_gemini_key       # Gemini API key (for AI chat)
LLM_PROVIDER=gemini                  # gemini | anthropic | openai
MOCK_TRON=false                      # true = use mock data
PORT=3000
```

---

## 🗺️ Roadmap to Mainnet

When deployed to TRON Mainnet, the following improvements will be available:

- **Real DeFi yields**: Live APY data from SunSwap and JustLend contracts
- **Real swap execution**: Actual TRC20 token swaps with on-chain confirmation
- **Real whale tracking**: Live large transfer monitoring from TronGrid
- **Real x402 payments**: Actual USDT/USDD deductions per service invocation
- **Real 8004 identity**: True on-chain agent registration with TRON transaction hash

---

## 📄 License

MIT — Built for TRON × Bank of AI Hackathon 2026
