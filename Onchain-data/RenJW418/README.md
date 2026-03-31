# ⬡ TronSage — AI 驱动的 TRON 链上智能体

> **🏆 TRON × Bank of AI Hackathon 2025 参赛项目**  
> 开发周期：2025 年 3 月 16 日 - 3 月 31 日

[![TRON](https://img.shields.io/badge/网络-TRON%20主网-red?style=flat-square)](https://tron.network)
[![Bank of AI](https://img.shields.io/badge/驱动-Bank%20of%20AI-cyan?style=flat-square)](https://bankofai.io)
[![x402](https://img.shields.io/badge/协议-x402%20支付-purple?style=flat-square)](https://bankofai.io)
[![Next.js](https://img.shields.io/badge/框架-Next.js%2014-black?style=flat-square)](https://nextjs.org)
[![License](https://img.shields.io/badge/开源协议-MIT-green?style=flat-square)](LICENSE)

**中文文档（默认）** | [English README](./README.en.md)

---

## 项目简介

TronSage 是一个面向 TRON 生态的 AI 链上智能体平台，集成了：
- 链上大额资金流监控
- 付费 AI 市场分析
- DeFi 收益机会筛选
- 多智能体协同决策
- 预测上链存证

平台通过 Bank of AI 的 x402 协议实现智能体商业化服务，支持 USDT 与 USDD（TRC20）双代币支付。

---

## 核心能力

| 模块 | 功能说明 |
|------|----------|
| 实时鲸鱼追踪 | 监控 TRON 链上大额转账，识别异常资金流 |
| AI 分析助手 | 自然语言提问，返回结构化市场分析 |
| 投资组合分析 | 输入地址即得 TRX/TRC20 资产构成 |
| DeFi 机会雷达 | 对比 APY、TVL、风险等级 |
| 多智能体编排 | 协调多个子智能体并进行任务结算 |
| 预测市场 | 日度预测生成与结果回填 |
| 告警系统 | 按规则订阅告警，触发后推送 |
| 8004 身份系统 | 智能体信誉、服务历史、活动记录 |

---

## Bank of AI 集成说明

### 1. x402 支付协议（USDT + USDD）

已支持双代币支付：
- USDT（TRC20，6 位精度）
- USDD（TRC20，18 位精度）

标准支付流程：
1. 前端请求支付参数：`GET /api/payment/request?token=USDT|USDD`
2. 用户向智能体地址支付 0.1 USDT 或 0.1 USDD
3. 提交交易哈希：`POST /api/payment/request`
4. 服务端调用 TronScan 进行链上校验后放行 AI 服务

相关实现：
- 支付创建与校验：`src/lib/bankofai.ts`
- 支付接口：`src/app/api/payment/request/route.ts`
- 支付弹窗：`src/components/PaymentModal.tsx`

### 2. 8004 链上身份协议

智能体身份信息包含：
- 唯一 Agent ID
- 信誉分与等级
- 服务历史与活动记录
- 支付与任务行为沉淀

相关实现：
- 身份逻辑：`src/lib/bankofai.ts`
- 身份接口：`src/app/api/identity/route.ts`
- 身份卡片：`src/components/AgentIdentity.tsx`

### 3. MCP 能力暴露

提供可扩展的链上能力接口，支持钱包、DeFi、事件查询等工具链路。

### 4. Skills 能力模块

内置可复用技能模块（如资产分析、Swap 报价）供 AI 编排调用。

---

## 多智能体经济模型

接口：`POST /api/multi-agent`

TronSage 会编排 3 个子智能体协同完成任务：
- 价格预言机 Agent
- 鲸鱼行为分析 Agent
- 风险评估 Agent

当配置 `AGENT_TRON_PRIVATE_KEY` 后，可执行真实链上 TRC20 转账结算；未配置时进入可演示的模拟结算模式。

---

## 预测上链存证

接口：`POST /api/prediction`

系统会为日度预测生成摘要并尝试写入链上 memo，形成可验证的时间戳证据；后续可通过 `PUT /api/prediction` 回填真实结果并评估准确率。

---

## 技术架构

- 前端：Next.js 14（App Router）+ TypeScript + Tailwind CSS
- 后端：Next.js API Routes
- 区块链：TronWeb（服务端）、TronScan API、TronGrid API
- AI：Kimi（Moonshot）兼容 OpenAI 接口
- 支付：Bank of AI x402（USDT/USDD）
- 身份：Bank of AI 8004
- 部署：Vercel

---

## 快速启动

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装与运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

浏览器打开：`http://localhost:3000`

### 构建

```bash
npm run build
```

---

## 环境变量

| 变量名 | 是否必填 | 说明 |
|--------|----------|------|
| `KIMI_API_KEY` | 是 | AI 分析能力密钥 |
| `AGENT_TRON_ADDRESS` | 是 | 接收 USDT/USDD 支付的 TRON 地址 |
| `AGENT_TRON_PRIVATE_KEY` | 否 | 多智能体真实链上转账与 memo 存证 |
| `TRONGRID_API_KEY` | 否 | 提升链上接口速率限制 |
| `TELEGRAM_BOT_TOKEN` | 否 | Telegram Bot Token |
| `TELEGRAM_WEBHOOK_SECRET` | 否 | Telegram Webhook 签名密钥 |

---

## 项目结构

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

## 安全说明

- 前端不暴露私钥
- 支付校验依赖链上交易查询，避免本地伪造
- 地址与交易哈希均做格式校验
- `.env.local` 不应提交到仓库

---

## 致谢

- [Bank of AI](https://bankofai.io)
- [TRON](https://tron.network)
- [TronScan](https://tronscan.org)
- [Moonshot AI](https://kimi.moonshot.cn)

---

为 TRON × Bank of AI Hackathon 构建。