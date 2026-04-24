# TronClaw v2 改进计划

> 基于 v1 骨架，做三大方向的深度打磨

---

## 改进方向一：钱包连接（Web3 真实体验）

### 当前问题
- 内置硬编码 walletAddress
- 用户无法使用自己的钱包
- 不像一个真正的 Web3 产品

### 改进方案
- 集成 `@tronweb3/tronwallet-adapters`（官方 TRON 钱包适配器）
- 支持钱包列表：
  - 🔵 **TronLink** — TRON 生态第一钱包
  - 🟠 **TokenPocket** — 多链钱包
  - 🔴 **BitGet Wallet** — BitGet 官方
  - ⚪ **OKX Wallet** — OKX Web3
  - 🟣 **WalletConnect** — 通用协议
- 首次进入显示「Connect Wallet」弹窗
- 连接后：
  - 获取真实地址和 TronWeb 实例
  - 所有操作使用用户自己的钱包签名
  - Dashboard 显示真实余额
  - 顶部导航栏显示连接状态和缩写地址

### 新增文件
```
packages/frontend/src/contexts/WalletContext.tsx   — 钱包状态 Provider
packages/frontend/src/components/WalletModal.tsx   — 钱包选择弹窗
packages/frontend/src/components/WalletButton.tsx  — 连接/断开按钮
packages/frontend/src/hooks/useWallet.ts           — 钱包 hook
```

### 安装依赖
```bash
pnpm --filter @tronclaw/frontend add @tronweb3/tronwallet-adapters @tronweb3/tronwallet-adapter-react-hooks @tronweb3/tronwallet-adapter-react-ui
```

---

## 改进方向二：前端 UI 升级（Web3 前沿科技感）

### 当前问题
- 简陋的纯色卡片
- 没有动画效果
- 图标丑（emoji 螃蟹 🦀）
- 配色不够 Web3

### 设计语言参考（OpenClaw 风格）
- **深色主题**：#0A0F1C（近黑）→ #131A2E（卡片）
- **主色渐变**：从 TRON 红 #FF060A → 品牌绿 #4ADE80 的渐变
- **光效**：卡片悬浮时带 glow（发光边框）
- **背景**：网格线 + 渐变光斑（类似星空/科技感）
- **字体**：Inter + JetBrains Mono
- **动画**：
  - 页面进入淡入 + 上滑
  - 数字变化 countUp 动画
  - 卡片 hover 发光边框
  - 交易流 slide-in 动画
  - 背景粒子/网格缓慢移动

### TronClaw Logo 设计
- SVG 图标：卡通化螃蟹钳子（claw）
- 主色：TRON 红 + 科技绿渐变
- 放大右侧钳子，形成类似「闪电抓取」的视觉
- 辅助：钳子内嵌区块链节点图案

### 页面改进
1. **Landing Page**
   - 全屏 hero + 粒子/网格动画背景
   - 巨大渐变标题文字
   - 实时链上数据 ticker（TRX 价格、USDT 流通量等）
   - 四大功能卡片带 icon + 渐变边框 glow
   - Bank of AI 集成专区（4 个基础设施带官方 logo）
   - 架构图动画版

2. **Dashboard**
   - 顶部：已连接钱包地址 + 网络状态
   - 余额卡片带 countUp 动画 + 渐变背景
   - Agent Activity Feed 带实时 slide-in 动画
   - DeFi 图表用渐变色填充
   - 交易时间线组件

3. **Chat UI**
   - 移除硬编码 address，使用连接的钱包
   - 工具调用卡片增加交易 hash 链接（可点击跳转 TronScan）
   - 消息气泡渐变边框
   - 打字机效果（逐字显示 AI 回复）

4. **Agents 页面**
   - Agent 卡片带信誉条（进度条 + 颜色）
   - 能力标签使用彩色图标
   - 注册表单使用连接的钱包地址

5. **Explorer 页面**
   - 查询结果美化（代币 logo、地址链接到 TronScan）
   - 交易历史增加方向图标（发送/接收）

---

## 改进方向三：TRON 特色功能落地（评委关注点）

### 当前问题
- 很多功能只有 mock 数据
- Bank of AI 集成只是占位
- 没有展示真实的 TRON 链上交互

### 真实功能落地

#### A. 支付（x402 — 必须真实可用）
- [x] 余额查询（真实 TronGrid）
- [ ] 真实 TRC20 转账（用户钱包签名）
- [ ] 创建收款请求 → 生成支付二维码
- [ ] 支付状态轮询 → 确认后 UI 更新

#### B. DeFi（SunSwap + JustLend）
- [ ] 收益率从 SunSwap/JustLend API 实时获取
- [ ] Swap 报价查询（显示兑换比例 + 手续费）
- [ ] 模拟 Swap UI（选择代币对、输入金额、预览结果）

#### C. 链上数据（TronGrid 真实数据）
- [x] 地址分析（真实）
- [ ] 鲸鱼追踪增加 TronScan 链接
- [ ] 代币信息增加价格走势小图
- [ ] 最近交易增加交易类型标记（转账/合约调用/创建）

#### D. 自动化
- [ ] 自动交易任务列表 UI 增加倒计时/触发状态
- [ ] 任务可暂停/取消/重启
- [ ] 任务触发时前端推送通知

#### E. Agent 身份（8004）
- [ ] 注册时使用钱包签名
- [ ] 信誉分渐变进度条
- [ ] Agent 列表增加最近活动

#### F. 全局 TRON 元素
- [ ] 导航栏显示当前 TRX 价格
- [ ] 网络选择器（Nile / Shasta / Mainnet）
- [ ] 所有地址可点击 → 打开 TronScan
- [ ] 所有交易 hash 可点击 → 打开 TronScan

---

## 改进方向四：代理配置（Gemini 地区兼容）

- [ ] 后端支持 HTTPS_PROXY 环境变量
- [ ] chat.ts 在 Gemini 调用中使用 proxy agent
- [ ] .env.example 增加 HTTPS_PROXY 注释说明

---

## 开发顺序

1. **Logo + 配色 + 全局样式** — CSS 变量、渐变、动画
2. **钱包连接** — WalletProvider + Modal + Button
3. **Landing Page 重做** — Hero + 功能卡片 + Bank of AI 专区
4. **Dashboard 升级** — 真实余额 + Agent Feed 动画 + 图表美化
5. **Chat UI 升级** — 钱包集成 + TronScan 链接 + 打字机效果
6. **TRON 特色功能** — 真实转账/DeFi/鲸鱼 + TronScan 联动
7. **Agents + Explorer 升级**
8. **代理配置** — Gemini proxy 支持
9. **最终测试 + commit + push**
