# TRON Whale Insight Agent

TRON Whale Insight Agent is an AI-powered on-chain intelligence application for the TRON ecosystem. It monitors whale transfers, analyzes address behavior, supports natural-language blockchain queries, and demonstrates a premium-report flow built on an x402-compatible payment abstraction.

The project combines real TRON on-chain data retrieval, address profiling, whale detection, agent-style tool orchestration, and payment-gated premium intelligence. It is designed as a TRON AI On-chain Data Agent with a Bank-of-AI-ready MCP-style execution architecture.

---

## 1. Overview

This project turns raw TRON blockchain activity into structured, readable intelligence.

It provides three main product experiences:

- **Whale Dashboard** for recent whale transfer monitoring
- **Address Intelligence** for deep address profiling and risk signal inspection
- **AI Query** for natural-language analysis with tool execution trace

In addition, it supports a **premium address report** flow:
- free basic analysis
- payment-gated deep report
- x402-compatible payment abstraction
- premium tool orchestration pathway for future Bank of AI integration

---

## 2. Problem

TRON on-chain data is public, but raw blockchain events are difficult to interpret quickly.

Users often want answers to questions like:

- What are the largest whale transfers on TRON recently?
- Is a certain address showing suspicious or concentrated activity?
- Which counterparties dominate an address’s transaction behavior?
- Can natural-language questions be converted into structured blockchain insights?
- How can premium blockchain intelligence be monetized in an agent-friendly way?

Traditional dashboards mostly provide lookup and visualization. They usually do not provide:
- agent-style query execution
- structured tool traces
- AI-generated interpretation
- payment-gated premium intelligence

---

## 3. Solution

TRON Whale Insight Agent transforms TRON on-chain events into structured intelligence through four layers:

1. **Data Layer**  
   Real TRON data retrieval through a TRON adapter backed by TronGrid

2. **Analysis Layer**  
   Whale detection, address profiling, counterparty analysis, risk signal extraction, and report generation

3. **Agent / Tool Layer**  
   Query classification, tool planning, tool execution, tool trace generation, MCP-style architecture

4. **Product Layer**  
   Whale Dashboard, Address Intelligence, AI Query, Premium Address Report

This design allows the system to support both:
- direct user interaction through the frontend
- tool-based execution flow aligned with future Bank of AI MCP integration

---

## 4. Core Features

### Whale Dashboard
- monitor recent whale transfers on TRON
- filter by time window and token
- inspect sender, receiver, amount, timestamp, and whale level
- generate dashboard insight summary

### Address Intelligence
- analyze a TRON address using real transfer history
- compute inflow, outflow, max transfer, active days, and stablecoin ratio
- inspect labels and risk signals
- browse counterparties and recent transfers
- generate AI-readable address insight

### AI Query
- ask natural-language questions about TRON whale activity
- classify query intent into whale / address / summary / premium flows
- execute tools through a structured tool executor
- expose tool execution trace for transparency

### Premium Address Report
- unlock deep address intelligence through a payment-gated flow
- generate executive summary, deep metrics, counterparty concentration, and premium risk summary
- support x402-compatible payment abstraction
- demonstrate how premium intelligence can be monetized for agents and users

---

## 5. System Architecture

### Backend
- **FastAPI** for APIs
- TRON adapter for real blockchain data access
- whale detector
- address profiler
- insight agent
- premium report service
- payment gateway abstraction
- bank_ai tool registry / executor / MCP-ready client abstraction

### Frontend
- **Next.js** frontend
- Whale Dashboard
- Address Intelligence page
- AI Query page
- premium report unlock flow

### Execution Flow

User query is handled as:

`User Query -> Query Classifier -> Tool Plan -> Tool Executor -> Local / MCP-ready Tool Provider -> Tool Trace -> Final Answer`

Premium report flow is handled as:

`User Action -> Payment Gate -> Payment Required / Simulated Payment -> Premium Tool -> Premium Report`

---

## 6. Bank of AI Integration Design

This project adopts a **Bank-of-AI-ready MCP-style execution architecture**.

Instead of directly hardcoding blockchain queries inside the AI layer, the system uses:

- a **tool registry**
- a **tool executor**
- structured **tool calls**
- structured **tool traces**
- an **MCP client abstraction**
- local fallback tools during development

### Current Tool Set
- `get_recent_whale_transfers`
- `analyze_tron_address`
- `summarize_recent_tron_activity`
- `get_premium_address_report`

### Current Execution Model
During development, tools are executed through local implementations backed by the project’s own TRON analysis services.

### MCP-Ready Upgrade Path
The system already includes:
- provider-aware tool execution
- local fallback
- MCP client abstraction
- provider trace in query results

This means the same query flow can later be routed to a real Bank of AI MCP provider without changing upper-layer query planning logic.

---

## 7. x402-Compatible Premium Flow

The project includes an **x402-compatible premium intelligence flow**.

### Current Demo Behavior
- free address analysis is available to all users
- premium address report is payment-gated
- if payment is missing, the system returns a `402 Payment Required`-style state
- payment is currently simulated through a development payment gate abstraction
- after simulated payment, the premium report is unlocked

### Why This Matters
This demonstrates how AI agents and users can:
- consume free blockchain intelligence
- unlock deeper paid reports
- integrate payment into agent workflows
- evolve toward real payment settlement in future versions

The current implementation is intentionally designed as:
- **payment abstraction first**
- **settlement mechanism pluggable**
- **MCP and premium tools already aligned**

---

## 8. API Endpoints

### Free APIs

#### `GET /api/whales`
Return recent whale transfers on TRON.

#### `GET /api/address/{address}`
Return address profile, risk signals, counterparties, transfers, and AI insight.

#### `POST /api/query`
Accept a natural-language question and return:
- `query_type`
- `tool_trace`
- structured `answer`

### Premium API

#### `POST /api/premium/address-report`
Return a premium deep report for a TRON address.

If payment is missing, the API returns a payment-required response.

---

## 9. Frontend Pages

### `/`
**Whale Dashboard**
- whale table
- summary cards
- dashboard insight
- clickable address links

### `/address`
**Address Intelligence**
- profile metrics
- labels and risk signals
- counterparties
- transfers
- AI insight
- premium report unlock flow

### `/query`
**AI Query**
- natural-language question input
- structured query result rendering
- tool execution trace
- premium query unlock flow

---

## 10. Demo

### Live Demo
Access the public demo here:

https://tron-whale-insight-agent-1.onrender.com

### Demo Features
The demo provides three main functions for exploring TRON whale activity:

- **Whale Dashboard** – monitor recent large TRON stablecoin transfers and whale events  
- **Address Intelligence** – inspect activity patterns for a specific TRON address  
- **AI Query** – ask natural-language questions about whale behavior and receive summarized insights  

### How to Use the Demo
1. Open the live demo link.  
2. On the **Whale Dashboard**, select a time window (e.g., `24h`) and click **Refresh** to load whale events.  
3. Review the summary cards and transfer table showing detected whale transactions.  
4. Use **Address Intelligence** to analyze a specific wallet address.  
5. Use **AI Query** to ask questions such as:
   - “What were the largest whale transfers in the last 24 hours?”
   - “Which token had the most whale activity?”

Results may vary depending on recent on-chain activity and the selected analysis window.

## 11. Project Structure

```text
backend/
├── api/
│   ├── address.py
│   ├── premium.py
│   ├── query.py
│   ├── report.py
│   └── whales.py
├── models/
├── services/
│   ├── address_profiler.py
│   ├── insight_agent.py
│   ├── query_service.py
│   ├── report_generator.py
│   ├── tron_adapter.py
│   ├── whale_detector.py
│   ├── bank_ai/
│   │   ├── mcp_client.py
│   │   ├── schemas.py
│   │   ├── tool_executor.py
│   │   ├── tool_registry.py
│   │   └── tools.py
│   ├── payments/
│   │   ├── mock_gateway.py
│   │   └── payment_gateway.py
│   └── premium/
│       ├── premium_report_service.py
│       └── report_formatter.py
└── app.py

frontend/
├── components/
├── lib/
└── pages/
