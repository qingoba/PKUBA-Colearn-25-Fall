# TronClaw — AI Agent × TRON 链上能力网关

> **"Any AI Agent, Instant TRON Superpowers."**

---

## 一、黑客松比赛分析

### 1.1 评审标准权重解读

| 维度 | 说明 | 冠军策略 |
|------|------|----------|
| 🌟 创新性 | AI + Web3 的创新程度，新的 Agent 应用或经济模式 | **不是做一个 Agent，而是做一个让所有 Agent 都能接入 TRON 的平台** — 这本身就是新的经济模式 |
| ⚙️ 技术实现 | 是否正确使用 TRON 及 Bank of AI 基础设施 | **全量集成**：x402 + 8004 Identity + MCP Server + Skills Modules，四个基础设施全部用上 |
| 🖥️ 产品可用性 | 产品是否可运行、易于体验 | **前端 Dashboard + 实时 Demo**，评委可以直接在网页上操作 AI Agent 完成链上任务 |
| 🎬 Demo 完整度 | 演示是否清晰、功能是否完整 | **4 个完整场景演示**：Payment / DeFi / On-chain Data / Automation，覆盖所有赛道方向 |

### 1.2 冠军制胜关键

1. **差异化定位**：其他参赛者大概率选择做 **单一 Agent**（如一个 DeFi Assistant）。我们做 **平台级基础设施**，让任意外部 Agent（OpenClaw 等）接入即获得 TRON 能力，格局更高。
2. **全量集成 Bank of AI**：其他团队可能只用 1-2 个基础设施，我们 4 个全用，技术实现分直接拉满。
3. **可视化 Demo**：前端 Dashboard 让评委一眼看到 Agent 的链上活动，不需要看命令行。
4. **真实可运行**：部署到线上，评委能直接体验。

### 1.3 时间分析

- 截止 March 31，剩余约 **4 天**
- 需要：可运行 Demo + 前端 + GitHub 开源 + README + 5 分钟视频
- 策略：**最小可行产品优先**，聚焦核心路径，不铺太广

---

## 二、TronClaw 产品定位

### 2.1 一句话描述

**TronClaw 是基于 OpenClaw 架构的 TRON 链上能力网关，任何 AI Agent 接入后即可获得支付、DeFi、链上数据分析、自动化执行四大 TRON 原生能力。**

### 2.2 核心理念

```
传统方式：每个 AI Agent 自己对接 TRON → 重复造轮子、门槛高
TronClaw：Agent → TronClaw Gateway → TRON 链上能力
                                    → Bank of AI 基础设施
                                    → DeFi / Payment / Data / Automation
```

### 2.3 名称含义

- **Tron** = TRON 链生态
- **Claw** = 致敬 OpenClaw，表示继承其 Agent 框架能力
- 寓意：AI Agent 伸出 "爪子" 抓取 TRON 链上的一切能力

---

## 三、系统架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                     TronClaw Frontend (React)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐  │
│  │ Chat UI  │ │ Dashboard│ │ DeFi     │ │ Agent Marketplace │  │
│  │ (Agent   │ │ (链上活动│ │ Monitor  │ │ (接入的Agent列表) │  │
│  │  交互)   │ │  实时流) │ │ (收益图) │ │                   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ WebSocket / REST API
┌────────────────────────────▼────────────────────────────────────┐
│                   TronClaw Gateway (Node.js)                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Agent Connector Layer                       │    │
│  │  • OpenClaw Plugin Interface                            │    │
│  │  • MCP Tool Provider (标准 MCP 协议)                    │    │
│  │  • REST API (通用 Agent 接入)                           │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                             │                                    │
│  ┌─────────────────────────▼───────────────────────────────┐    │
│  │              TronClaw Core Engine                        │    │
│  │                                                          │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐          │    │
│  │  │  Payment   │ │   DeFi     │ │  On-chain  │          │    │
│  │  │  Module    │ │   Module   │ │  Data      │          │    │
│  │  │            │ │            │ │  Module    │          │    │
│  │  │ • x402协议 │ │ • SunSwap  │ │ • 余额查询 │          │    │
│  │  │ • USDT收付 │ │ • JustLend │ │ • 交易追踪 │          │    │
│  │  │ • USDD收付 │ │ • 收益分析 │ │ • 鲸鱼监控 │          │    │
│  │  │ • 微支付   │ │ • 策略执行 │ │ • DeFi仪表 │          │    │
│  │  └────────────┘ └────────────┘ └────────────┘          │    │
│  │                                                          │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐          │    │
│  │  │ Automation │ │  Identity  │ │  Wallet    │          │    │
│  │  │  Module    │ │  Module    │ │  Manager   │          │    │
│  │  │            │ │            │ │            │          │    │
│  │  │ • 自动交易 │ │ • 8004协议 │ │ • 密钥管理 │          │    │
│  │  │ • 自动领空 │ │ • 信誉评分 │ │ • 多钱包   │          │    │
│  │  │ • 定时任务 │ │ • 身份验证 │ │ • 签名     │          │    │
│  │  └────────────┘ └────────────┘ └────────────┘          │    │
│  └──────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                   External Infrastructure                        │
│                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ TRON       │ │ Bank of AI │ │ TronGrid   │ │ SunSwap /  │  │
│  │ Network    │ │ x402/8004  │ │ API        │ │ JustLend   │  │
│  │ (TronWeb)  │ │ MCP/Skills │ │            │ │            │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 三种接入方式

| 接入方式 | 目标用户 | 协议 | 示例 |
|----------|----------|------|------|
| **OpenClaw Plugin** | OpenClaw 用户 | OpenClaw Skill/Plugin 接口 | `clawhub install tronclaw` |
| **MCP Tool Provider** | 任何 MCP 兼容 Agent（Claude Desktop 等） | MCP 标准协议 | 配置 MCP Server 地址即可 |
| **REST API** | 任何 Agent / 应用 | HTTP REST | `POST /api/v1/payment/send` |

### 3.3 技术栈

| 层级 | 技术 | 理由 |
|------|------|------|
| **前端** | React + Vite + TailwindCSS + shadcn/ui | 快速开发，现代 UI |
| **后端 Gateway** | Node.js + Express + TypeScript | OpenClaw 生态一致，TronWeb 原生支持 |
| **区块链交互** | TronWeb SDK + @t402/tron | TRON 官方 SDK |
| **支付协议** | x402 Protocol（@t402/tron） | Bank of AI 核心基础设施 |
| **身份系统** | 8004 On-chain Identity | Bank of AI 基础设施 |
| **MCP 协议** | @modelcontextprotocol/sdk | 标准 MCP 实现 |
| **实时通信** | WebSocket (ws) | Dashboard 实时更新 |
| **数据库** | SQLite (轻量) | 本地存储 Agent 记录、交易历史 |
| **部署** | Vercel (前端) + Railway/Fly.io (后端) | 快速部署，免费额度 |

---

## 四、核心功能模块详细设计

### 4.1 Payment Module（支付模块）

**集成 Bank of AI：x402 Protocol + Skills Modules (Payment/Balance)**

```typescript
// TronClaw 暴露给 Agent 的 Payment Tools
const paymentTools = {
  // 1. 查询余额
  "tron_check_balance": {
    params: { address: string, token?: "TRX" | "USDT" | "USDD" },
    returns: { balance: string, usd_value: string }
  },

  // 2. 发送支付（x402 协议）
  "tron_send_payment": {
    params: { to: string, amount: string, token: "USDT" | "USDD", memo?: string },
    returns: { tx_hash: string, status: string }
  },

  // 3. 创建收款请求（x402）
  "tron_create_payment_request": {
    params: { amount: string, token: "USDT" | "USDD", description: string },
    returns: { payment_url: string, pay_id: string, qr_code: string }
  },

  // 4. 查询支付状态
  "tron_payment_status": {
    params: { pay_id: string },
    returns: { status: "pending" | "confirmed" | "failed", tx_hash?: string }
  }
}
```

**Demo 场景**：AI Writing Assistant 写完文章后，通过 x402 协议自动向用户收取 0.5 USDT。

### 4.2 DeFi Module（DeFi 模块）

**集成 Bank of AI：MCP Server + Skills Modules (Swap/Lending/Asset Management)**

```typescript
const defiTools = {
  // 1. 查询 DeFi 收益率
  "tron_defi_yields": {
    params: { protocol?: "sunswap" | "justlend" | "all" },
    returns: { pools: Array<{ name, apy, tvl, risk_level }> }
  },

  // 2. 代币兑换（SunSwap）
  "tron_swap": {
    params: { from_token: string, to_token: string, amount: string, slippage?: number },
    returns: { tx_hash: string, received_amount: string, price_impact: string }
  },

  // 3. 借贷操作（JustLend）
  "tron_lend_supply": {
    params: { token: string, amount: string },
    returns: { tx_hash: string, apy: string }
  },

  // 4. AI 收益优化建议
  "tron_yield_optimize": {
    params: { portfolio: Array<{ token, amount }>, risk_preference: "low" | "medium" | "high" },
    returns: { strategy: string, expected_apy: string, steps: Array<Action> }
  }
}
```

**Demo 场景**：用户说 "帮我把闲置的 USDT 找个最优收益"，Agent 分析 JustLend/SunSwap 收益率后自动执行最优策略。

### 4.3 On-chain Data Module（链上数据模块）

**集成 Bank of AI：MCP Server**

```typescript
const dataTools = {
  // 1. 地址分析
  "tron_analyze_address": {
    params: { address: string },
    returns: { balance, tx_count, token_holdings, first_tx_date, tags }
  },

  // 2. 鲸鱼追踪
  "tron_whale_tracker": {
    params: { token?: string, min_amount?: string, time_range?: string },
    returns: { transfers: Array<{ from, to, amount, token, time, tx_hash }> }
  },

  // 3. 代币信息
  "tron_token_info": {
    params: { token_address: string },
    returns: { name, symbol, total_supply, holders, price, market_cap }
  },

  // 4. 交易历史
  "tron_tx_history": {
    params: { address: string, limit?: number },
    returns: { transactions: Array<{ hash, from, to, value, token, timestamp }> }
  }
}
```

**Demo 场景**：用户问 "最近 24 小时有哪些大额 USDT 转账？"，Agent 实时查询并以可视化图表展示。

### 4.4 Automation Module（自动化模块）

**集成 Bank of AI：MCP Server + Skills Modules**

```typescript
const automationTools = {
  // 1. 创建自动化任务
  "tron_create_automation": {
    params: {
      type: "price_alert" | "auto_swap" | "scheduled_transfer" | "whale_alert",
      conditions: object,
      actions: Array<Action>
    },
    returns: { task_id: string, status: "active" }
  },

  // 2. 自动交易（条件触发）
  "tron_auto_trade": {
    params: { token_pair: string, trigger_price: string, action: "buy" | "sell", amount: string },
    returns: { task_id: string }
  },

  // 3. 批量转账
  "tron_batch_transfer": {
    params: { transfers: Array<{ to, amount, token }> },
    returns: { tx_hashes: string[], total_cost: string }
  }
}
```

**Demo 场景**：用户说 "当 TRX 跌到 0.1 USDT 时自动买入 100 个"，Agent 设置监控并自动执行。

### 4.5 Identity Module（身份模块）

**集成 Bank of AI：8004 On-chain Identity**

```typescript
const identityTools = {
  // 1. 注册 Agent 身份
  "tron_register_agent_identity": {
    params: { agent_name: string, capabilities: string[], owner_address: string },
    returns: { agent_id: string, identity_tx: string }
  },

  // 2. 查询 Agent 信誉
  "tron_agent_reputation": {
    params: { agent_id: string },
    returns: { trust_score: number, total_transactions: number, success_rate: number }
  },

  // 3. 验证 Agent 身份
  "tron_verify_agent": {
    params: { agent_id: string },
    returns: { verified: boolean, identity_data: object }
  }
}
```

---

## 五、前端 Dashboard 设计

### 5.1 页面结构

```
TronClaw Frontend
├── / (Landing Page) — 产品介绍 + Quick Start
├── /chat — Agent 交互界面（自然语言对话）
├── /dashboard — 链上活动仪表盘
│   ├── 实时交易流（WebSocket）
│   ├── 余额概览
│   ├── DeFi 收益监控
│   └── 自动化任务状态
├── /agents — 已接入 Agent 列表
├── /explorer — 链上数据浏览器
└── /docs — API 文档 + 接入指南
```

### 5.2 关键页面

**Chat UI（核心展示页）**
- 类 ChatGPT 对话框，但侧边栏显示链上活动
- 用户输入自然语言 → Agent 调用 TronClaw Tools → 链上操作
- 实时显示交易确认、余额变化
- 示例对话流展示所有能力

**Dashboard**
- 实时交易流（模拟区块链浏览器风格）
- Agent 活动热力图
- DeFi 收益率排行
- 鲸鱼警报通知

---

## 六、MVP 开发计划（4 天冲刺）

### Day 1（3/27）：基础架构 + Payment

| 时段 | 任务 | 产出 |
|------|------|------|
| 上午 | 项目初始化：monorepo 结构、TypeScript 配置 | `packages/gateway`, `packages/frontend`, `packages/shared` |
| 下午 | TronWeb 集成 + x402 支付模块 | Payment Module 完成（余额查询、发送、收款） |
| 晚上 | MCP Tool Provider 基础框架 | Agent 可通过 MCP 协议调用 Payment Tools |

### Day 2（3/28）：DeFi + Data + Automation

| 时段 | 任务 | 产出 |
|------|------|------|
| 上午 | DeFi Module（SunSwap/JustLend 对接） | Swap + 收益查询功能 |
| 下午 | On-chain Data Module（TronGrid API） | 地址分析、鲸鱼追踪、交易历史 |
| 晚上 | Automation Module 基础 + Identity Module | 条件触发任务 + 8004 身份注册 |

### Day 3（3/29）：前端 + 联调

| 时段 | 任务 | 产出 |
|------|------|------|
| 上午 | 前端 Landing Page + Chat UI | 核心交互页面 |
| 下午 | Dashboard + 实时数据流 | WebSocket 实时更新 |
| 晚上 | 全链路联调（Agent → Gateway → TRON） | 4 个场景端到端跑通 |

### Day 4（3/30-31）：部署 + Demo 视频

| 时段 | 任务 | 产出 |
|------|------|------|
| 上午 | 部署上线（Vercel + Railway） | 公开可访问的 URL |
| 下午 | README 完善 + OpenClaw Plugin 打包 | GitHub 仓库完善 |
| 晚上 | 录制 5 分钟 Demo 视频 | 视频 + 提交表单 |

---

## 七、项目目录结构

```
TronClaw/
├── packages/
│   ├── gateway/                # 后端 Gateway 服务
│   │   ├── src/
│   │   │   ├── index.ts            # 入口
│   │   │   ├── server.ts           # Express 服务器
│   │   │   ├── mcp/                # MCP Tool Provider
│   │   │   │   ├── server.ts       # MCP Server 实现
│   │   │   │   └── tools/          # MCP Tool 定义
│   │   │   ├── modules/            # 核心功能模块
│   │   │   │   ├── payment/        # x402 支付
│   │   │   │   ├── defi/           # DeFi 操作
│   │   │   │   ├── data/           # 链上数据
│   │   │   │   ├── automation/     # 自动化
│   │   │   │   └── identity/       # 8004 身份
│   │   │   ├── tron/               # TronWeb 封装
│   │   │   │   ├── client.ts       # TronWeb 实例
│   │   │   │   ├── wallet.ts       # 钱包管理
│   │   │   │   └── contracts.ts    # 合约交互
│   │   │   ├── api/                # REST API 路由
│   │   │   └── ws/                 # WebSocket 实时推送
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── frontend/               # React 前端
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Landing.tsx
│   │   │   │   ├── Chat.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Agents.tsx
│   │   │   │   └── Explorer.tsx
│   │   │   ├── components/
│   │   │   │   ├── ChatMessage.tsx
│   │   │   │   ├── TransactionFeed.tsx
│   │   │   │   ├── BalanceCard.tsx
│   │   │   │   ├── DeFiChart.tsx
│   │   │   │   └── WhaleAlert.tsx
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   └── lib/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── shared/                 # 共享类型定义
│   │   ├── types/
│   │   └── constants/
│   │
│   └── openclaw-plugin/        # OpenClaw 插件包
│       ├── SKILL.md
│       ├── plugin.ts
│       └── package.json
│
├── README.md
├── package.json                # Workspace root
├── pnpm-workspace.yaml
└── .env.example
```

---

## 八、Bank of AI 全量集成清单

| 基础设施 | 集成方式 | 对应模块 | 状态 |
|----------|----------|----------|------|
| ✅ x402 Payment Protocol | `@t402/tron` SDK | Payment Module | 核心 |
| ✅ 8004 On-chain Identity | Bank of AI API | Identity Module | 核心 |
| ✅ MCP Server | `@modelcontextprotocol/sdk` | MCP Tool Provider | 核心 |
| ✅ Skills Modules | Bank of AI Skills API | DeFi + Payment 模块 | 核心 |

**四个基础设施全部集成，这是拿满技术实现分的关键。**

---

## 九、Demo 演示脚本（5 分钟视频）

### 第 1 分钟：Introduction（0:00 - 1:00）
- TronClaw 是什么：一句话概述
- 问题：每个 AI Agent 对接 TRON 都要重复造轮子
- 解决方案：TronClaw 作为能力网关，即插即用
- 架构图快速展示

### 第 2 分钟：Payment Demo（1:00 - 2:00）
- 在 Chat UI 中演示：
  - "查询我的 USDT 余额" → 调用 tron_check_balance
  - "给 TXxx... 地址转 1 USDT" → 调用 tron_send_payment（x402）
  - Dashboard 实时显示交易状态

### 第 3 分钟：DeFi + Data Demo（2:00 - 3:30）
- "当前 TRON DeFi 最高收益的池子是哪个？" → tron_defi_yields
- "帮我把 10 USDT 换成 TRX" → tron_swap（SunSwap）
- "追踪最近大额 USDT 转账" → tron_whale_tracker
- Dashboard 图表实时更新

### 第 4 分钟：Automation + Identity（3:30 - 4:30）
- "当 TRX 跌到 0.08 时自动买入" → tron_auto_trade
- 展示 Agent 的 8004 链上身份和信誉评分
- 展示 Agent Marketplace 页面

### 第 5 分钟：Integration Demo（4:30 - 5:00）
- 展示 3 种接入方式：OpenClaw Plugin / MCP / REST API
- 展示 OpenClaw 中安装 TronClaw 插件的过程
- 结尾：Call to Action

---

## 十、风险与应对

| 风险 | 概率 | 应对 |
|------|------|------|
| x402 TRON 测试网不稳定 | 中 | 准备 mock 模式，Demo 时切换 |
| 4 天时间不够 | 高 | 砍非核心功能，聚焦 Payment + Chat UI + Dashboard |
| Bank of AI API 文档不全 | 中 | 已有 @t402/tron SDK，重点基于 SDK 开发 |
| DeFi 合约交互复杂 | 中 | SunSwap/JustLend 用 TronWeb 直接调用，不过度封装 |

### 最小可行版本（如果时间极紧）

**必须有**：
1. ✅ Payment Module（x402 集成） — 体现核心基础设施
2. ✅ Chat UI（Agent 自然语言交互） — 体现产品可用性
3. ✅ Dashboard（实时交易流） — 体现产品完整度
4. ✅ MCP Tool Provider — 体现通用 Agent 接入能力
5. ✅ On-chain Data 基础查询 — 体现数据能力

**Nice to have**：
- DeFi 策略自动执行
- Automation 条件触发
- 8004 Identity 完整集成
- OpenClaw Plugin 打包发布

---

## 十一、关键依赖包

```json
{
  "dependencies": {
    "tronweb": "^6.x",
    "@t402/tron": "latest",
    "@t402/express": "latest",
    "@modelcontextprotocol/sdk": "latest",
    "express": "^4.18",
    "ws": "^8.x",
    "better-sqlite3": "^11.x",
    "react": "^18",
    "react-router-dom": "^6",
    "tailwindcss": "^3",
    "@radix-ui/react-*": "latest",
    "recharts": "^2.x",
    "zustand": "^4.x",
    "zod": "^3.x"
  }
}
```

---

## 十二、评审得分预估

| 维度 | 预估得分 | 理由 |
|------|----------|------|
| 🌟 创新性 | **9/10** | 平台级产品而非单一 Agent，"Agent 能力网关" 概念新颖 |
| ⚙️ 技术实现 | **10/10** | 四个 Bank of AI 基础设施全量集成 |
| 🖥️ 产品可用性 | **8/10** | 前端可交互，部署上线可访问 |
| 🎬 Demo 完整度 | **9/10** | 4 个场景完整演示，架构清晰 |

**总结：TronClaw 的定位是"AI Agent 的 TRON 能力层"，既体现技术深度（全量集成），又体现创新高度（平台 vs 单品），是最有可能拿冠军的路线。**
