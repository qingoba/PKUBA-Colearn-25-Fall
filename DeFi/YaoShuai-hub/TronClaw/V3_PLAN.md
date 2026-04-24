# TronClaw V3 — 四大赛道深度落地计划

> TronClaw = 四个赛道整合为一个平台，每个模块高完成度

---

## 核心定位调整

**之前**：TronClaw 是"AI Agent TRON 能力网关"——偏基础设施
**现在**：TronClaw 是"TRON 链上 AI Agent 一站式平台"——四大子产品覆盖全部赛道

```
TronClaw 平台
├── 💳 SealPay    — AI Agent 服务市场 + x402 自动支付
├── 📈 TronSage   — AI DeFi 智能顾问 + 自动策略执行
├── 🔍 ChainEye   — AI 链上数据分析 + 鲸鱼追踪 + 报告生成
└── ⚡ AutoHarvest — AI 自动化猎手 + 空投/任务/自动交易
```

前端导航调整为：**首页 / 市场(SealPay) / DeFi(TronSage) / 数据(ChainEye) / 自动化(AutoHarvest) / Chat**

---

## 模块一：💳 SealPay — AI Agent 服务市场

### 核心功能
1. **Agent 服务发布**：Agent 注册自己能提供的服务（写作/翻译/分析/交易信号等）
2. **服务目录浏览**：用户浏览所有可用 Agent 服务，按分类/评分/价格排序
3. **x402 自动付费**：调用 Agent 服务时自动扣费 USDT/USDD
4. **服务历史 & 评价**：每次调用记录在链上，用户可评分
5. **Agent 身份（8004）**：每个 Agent 有链上身份、信誉分、服务历史

### Bank of AI 集成
- ✅ x402 Payment Protocol — 服务按次自动付费
- ✅ 8004 On-chain Identity — Agent 身份 + 信誉
- ✅ MCP Server — Agent 间调用
- ✅ Skills Modules — Payment / Balance Check

### 前端页面：`/market`
- 服务卡片网格（名称/描述/价格/评分/调用次数）
- 点击服务 → 弹出详情 + 调用按钮（自动扣费）
- 侧边：Agent 信誉卡片（8004 身份信息）
- 顶部统计：总服务数 / 总交易额 / 活跃 Agent 数

### 后端 API
```
POST /api/v1/market/register    — Agent 注册服务
GET  /api/v1/market/services    — 浏览服务列表
POST /api/v1/market/invoke      — 调用服务（含 x402 付费）
GET  /api/v1/market/history     — 调用历史
POST /api/v1/market/rate        — 服务评分
```

### Demo 预置服务
| 服务名 | Agent | 价格 | 描述 |
|--------|-------|------|------|
| AI Writing | TronClaw Writer | 0.1 USDT/次 | AI 生成文章 |
| Trading Signal | TronClaw Analyst | 0.5 USDT/次 | TRX 交易信号 |
| Smart Contract Audit | TronClaw Auditor | 1.0 USDT/次 | 合约安全分析 |
| Translation | TronClaw Translator | 0.05 USDT/次 | 中英互译 |

---

## 模块二：📈 TronSage — AI DeFi 智能顾问

### 核心功能
1. **DeFi 全景仪表盘**：TRON 生态所有 DeFi 协议实时数据
2. **收益率排行**：JustLend / SunSwap / Sun.io 池子按 APY 排序
3. **AI 策略推荐**：根据用户持仓 + 风险偏好推荐最优策略
4. **一键执行**：用户确认后自动执行 Swap / Supply / Stake
5. **组合追踪**：追踪已执行策略的收益变化

### Bank of AI 集成
- ✅ MCP Server — 读取 TRON DeFi 数据
- ✅ Skills Modules — Swap / Lending / Asset Management
- ✅ x402 Payment — 高级 AI 分析按次收费

### 前端页面：`/defi`
- 顶部：总资产 / 总收益 / 当前 APY
- DeFi 协议卡片（JustLend / SunSwap / Sun.io）各自展示 TVL + 利率
- 收益排行表（可排序、可筛选风险等级）
- AI 策略推荐卡（描述 + 步骤 + 预期 APY + 执行按钮）
- Swap 面板（左右代币选择 + 金额输入 + 兑换率预览）

### 后端 API
```
GET  /api/v1/defi/overview      — DeFi 全景（TVL/协议数/总用户）
GET  /api/v1/defi/yields        — 收益率排行（已有，需增强真实数据）
GET  /api/v1/defi/protocols     — 各协议详情
POST /api/v1/defi/optimize      — AI 策略推荐（已有，需增强）
POST /api/v1/defi/swap          — 执行兑换（已有）
POST /api/v1/defi/supply        — 执行存款
GET  /api/v1/defi/portfolio     — 我的 DeFi 组合
```

---

## 模块三：🔍 ChainEye — AI 链上数据分析

### 核心功能
1. **自然语言查询**："最近有哪些大户在买 TRX？" → AI 分析 + 图表
2. **地址画像**：任意地址的完整分析（余额/持仓/交易模式/活跃度/标签）
3. **鲸鱼监控**：实时追踪大额转账，WebSocket 推送
4. **交易解析**：任意 tx hash 的详细解读（做了什么操作、涉及哪些合约）
5. **AI 报告生成**：深度分析报告（x402 付费功能）

### Bank of AI 集成
- ✅ MCP Server — 查询链上数据
- ✅ x402 Payment — 深度报告按次收费
- ✅ 8004 Identity — Agent 信誉积累

### 前端页面：`/data`
- 搜索栏（地址 / tx hash / 代币名 — 智能识别类型）
- 地址画像卡（余额饼图 + 持仓列表 + 活跃度时间线）
- 鲸鱼监控面板（实时滚动 + 金额热力条）
- 交易历史时间线（带发送/接收图标 + TronScan 链接）
- AI 对话框（自然语言提问 → 数据分析结果）
- 所有地址/hash 可点击跳转 TronScan

### 后端 API
```
GET  /api/v1/data/address/:addr     — 地址画像（已有，需增强）
GET  /api/v1/data/transactions/:addr — 交易历史（已有）
GET  /api/v1/data/whales             — 鲸鱼监控（已有）
GET  /api/v1/data/tx/:hash           — 交易详情解析（新增）
POST /api/v1/data/report             — AI 深度报告（新增，x402 付费）
GET  /api/v1/data/token/:addr        — 代币信息（已有）
GET  /api/v1/data/overview           — 全网概览（新增：总地址/总交易/24h 数据）
```

---

## 模块四：⚡ AutoHarvest — AI 自动化猎手

### 核心功能
1. **条件交易**：价格触发自动买入/卖出
2. **定时转账**：每天/每周自动给指定地址转账
3. **鲸鱼跟单**：监控大户操作，自动跟随执行
4. **批量操作**：批量空投发送 / 批量代币转账
5. **任务仪表盘**：所有自动化任务的状态、历史、成功率

### Bank of AI 集成
- ✅ MCP Server — 监控链上活动、执行交易
- ✅ Skills Modules — Swap / Mint
- ✅ x402 Payment — Agent 服务订阅收费

### 前端页面：`/auto`
- 任务创建面板（选类型 → 设条件 → 设操作 → 激活）
- 活跃任务列表（状态/触发次数/最后触发时间/开关）
- 任务历史时间线（成功/失败 + tx hash 链接）
- 统计卡片（活跃任务数 / 总触发次数 / 总节省 Gas）

### 后端 API
```
POST /api/v1/auto/create            — 创建任务（通用）
POST /api/v1/auto/trade             — 条件交易（已有）
POST /api/v1/auto/schedule          — 定时转账（新增）
POST /api/v1/auto/whale-follow      — 鲸鱼跟单（新增）
POST /api/v1/auto/batch-transfer    — 批量转账（已有）
GET  /api/v1/auto/tasks             — 任务列表（已有）
PATCH /api/v1/auto/tasks/:id        — 暂停/恢复任务（新增）
DELETE /api/v1/auto/tasks/:id       — 取消任务（已有）
GET  /api/v1/auto/tasks/:id/history — 任务历史（新增）
GET  /api/v1/auto/stats             — 全局统计（新增）
```

---

## 前端导航结构调整

```
现在的侧边栏：
├── Chat
├── Dashboard
├── Agents
└── Explorer

改为：
├── 🏠 Overview（总览仪表盘，合并原 Dashboard）
├── 💳 Market（SealPay 服务市场）
├── 📈 DeFi（TronSage DeFi 顾问）
├── 🔍 Data（ChainEye 数据分析）
├── ⚡ Auto（AutoHarvest 自动化）
└── 💬 Chat（AI 对话，调用所有模块）
```

---

## 开发优先级

### P0 — 核心骨架（先做）
1. 前端导航重构（6个页面）
2. Market 页面 + API（Agent 服务卡片 + 调用 + x402 付费）
3. DeFi 页面增强（Swap 面板 + 策略推荐卡 + 协议卡片）
4. Data 页面增强（地址画像 + 鲸鱼实时面板 + 交易时间线）
5. Auto 页面增强（任务创建 + 任务列表 + 历史时间线）

### P1 — 数据真实化
6. DeFi 收益从 SunSwap/JustLend API 实时获取
7. 全网概览数据（TronGrid）
8. 鲸鱼追踪增加 TronScan 链接 + 实时 WebSocket

### P2 — 体验打磨
9. Overview 页整合四模块核心指标
10. Chat 增强：识别用户意图 → 路由到对应模块
11. 所有 hash/地址全局 TronScan 链接
