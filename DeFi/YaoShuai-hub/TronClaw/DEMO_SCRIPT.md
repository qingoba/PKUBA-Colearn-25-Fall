# TronClaw Demo 视频脚本（5分钟）

> 黑客松提交演示视频，展示 TronClaw 平台级 AI Agent × TRON 能力网关

---

## 准备工作（录制前）

```bash
# 确认两个服务运行
curl http://localhost:3000/api/v1/data/overview   # 返回 TRX 价格
# 前端访问 http://21.214.81.196:5173

# TronLink 钱包确认：
# ✓ 切换到 Nile 测试网
# ✓ 账户有 TRX（需要 gas）
```

---

## 第1分钟：介绍 + Landing Page（0:00 - 1:00）

**展示 Landing Page**，旁白：

> "大家好，我来介绍 TronClaw —— 一个 TRON 链上的 AI Agent 能力网关。
>
> 传统方式下，每个 AI Agent 都要自己对接 TRON，重复造轮子。TronClaw 解决了这个问题——任何 AI Agent 接入 TronClaw，就能立即获得支付、DeFi、链上数据、自动化四大 TRON 原生能力。
>
> 我们全量集成了 Bank of AI 四大基础设施：**x402 支付协议、8004 链上身份、MCP Server、Skills Modules（minimax-m2.5）**。"

**操作**：缓慢滚动 Landing Page，展示四大产品卡片

---

## 第2分钟：AI Agent 对话（1:00 - 2:30）

**点击进入 Chat 页面**，旁白：

> "首先展示 TronClaw AI Agent 的核心能力。Agent 由 **Bank of AI minimax-m2.5** 驱动，这是真实的 Bank of AI API 调用。"

**操作1**：连接 TronLink 钱包，点击 **「Register New Agent」** 注册 8004 链上身份

> "可以看到 8004 On-chain Identity 注册成功，返回了真实的链上 TxHash，在 nile.tronscan.org 可以验证。这证明 AI Agent 已经具备链上可信身份。"

**操作2**：在 Chat 输入框输入：
```
帮我查一下我的钱包余额
```
等待 AI 调用工具返回真实余额

**操作3**：输入：
```
帮我把1000 USDT放到DeFi做低风险质押
```
等待响应，展示：
- AI 自动调用3个工具（tron_defi_yields → tron_yield_optimize → tron_defi_supply）
- 底部出现精美的 **DeFi 报告卡片**（协议、APY、月收益、txHash）

> "Agent 自动分析了所有 DeFi 池子，选择最优低风险策略，完成质押——全程无需手动操作。"

---

## 第3分钟：ChainEye 链上数据（2:30 - 3:30）

**点击 Data 页面**，旁白：

> "TronClaw 的 ChainEye 模块提供实时链上数据分析。"

**操作1**：展示右侧鲸鱼监控面板，右上角有 **● LIVE** 脉冲绿点

> "这里实时显示 TRON 主网巨鲸的大额 USDT 转账，来自 Binance、OKX、Huobi 等交易所，金额超过百万美元。点击 hash 可以在 nile.tronscan.org 验证。"

**操作2**：在搜索框输入地址：
```
TVF2Mp9QY7FEGTnr3DBpFLobA6jguHyMvi
```
点击 Analyze，展示：
- 地址画像（TRX 余额、Top 10 持仓，USDT 1.99亿）
- 最近100笔交易记录（TRX + TRC20 混合，内部可滚动）

> "系统识别了该地址的 USDT、BTT、WIN 等主流币种持仓，并展示了最近100笔链上真实交易。"

---

## 第4分钟：DeFi + Swap + SealPay（3:30 - 4:30）

**点击 DeFi 页面**，旁白：

> "TronSage 是 TronClaw 的 DeFi 智能顾问模块。"

**操作1**：展示 APY 图表和 All Pools 列表，指出实时数据

**操作2**：在 Quick Swap 面板选择 TRX → USDT，输入 **100**

> "系统自动对比3条 SunSwap 路由，100 TRX 可换约 31.8 USDT。"

**操作3**：点击 Swap 按钮，**TronLink 弹出合约调用确认窗口**，展示 USDT 合约地址 + 31.8 USDT 金额

> "TronLink 弹出真实的 TRON 合约调用——这是真实的链上操作，金额与汇率完全匹配。"

点击 Confirm，展示成功结果和 TronScan 链接

**切到 SealPay 页面**，快速展示：

> "SealPay 是 AI Agent 服务市场，集成 x402 支付协议，支持 AI 服务自动收费。"

点击任意服务的 Invoke → 确认付款 → 展示成功和 x402 txHash

---

## 第5分钟：Agents + MCP + 总结（4:30 - 5:00）

**切到 Agents 页面**，展示已注册的 Agent 列表，说明：

> "8004 链上身份系统——每个 AI Agent 有唯一链上身份、信誉评分和服务历史。这里的 txHash 都是真实的 TRON 链上交易。"

**快速切到 Auto 页面**：

> "AutoHarvest 支持价格触发自动交易、定时转账、鲸鱼跟单三种自动化策略。"

**结尾回到 Landing Page**：

> "TronClaw 完整集成了 Bank of AI 全部4大基础设施：
> - **x402 Payment**：使用 @t402/tron SDK，真实支付验证
> - **8004 Identity**：真实链上交易记录 Agent 身份
> - **MCP Server**：@modelcontextprotocol/sdk，17个工具，兼容 Claude Desktop
> - **Skills Modules**：Bank of AI minimax-m2.5 驱动 Chat，真实 API 调用
>
> 任何 AI Agent，只需接入 TronClaw，即刻获得 TRON 链上超能力。谢谢！"

---

## 重点强调事项（给镜头停留时间）

| 亮点 | 为什么重要 |
|------|-----------|
| Chat 工具调用折叠卡片（`⚡ 3 tool calls`） | 展示 AI 真正在调用链上工具 |
| DeFi 报告卡片（APY + 月收益 + txHash） | 视觉冲击力强，Bank of AI Skills 集成证明 |
| 鲸鱼面板百万级转账 + 主网地址可点 | 真实数据，非 mock |
| Swap 的 TronLink 弹窗 + 正确金额 | 真实链上合约调用 |
| 8004 注册返回的 64位 txHash | 可在 nile.tronscan.org 查验 |
| Chat 页面 "powered by Bank of AI minimax-m2.5" | 直接证明 Bank of AI 集成 |

---

## Bank of AI 集成证明点

| 基础设施 | 展示方式 |
|---------|---------|
| x402 Payment | SealPay invoke 显示 `x402_demo_xxx` txHash |
| 8004 Identity | Chat 页面注册 → 真实 TRON txHash → TronScan 可查 |
| MCP Server | README 展示 `npx tronclaw-mcp` 接入 Claude Desktop |
| Skills (Bank of AI) | Chat 回复显示 "powered by Bank of AI (minimax-m2.5)" |
