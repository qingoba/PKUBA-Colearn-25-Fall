# TronClaw 部署指南

> 在新机器上完整部署 TronClaw 前后端

---

## 环境要求

| 组件 | 版本要求 |
|------|---------|
| Node.js | >= 18.0 |
| pnpm | >= 8.0 |
| Git | 任意版本 |

---

## 第一步：克隆代码

```bash
git clone https://github.com/YaoShuai-hub/TronClaw.git
cd TronClaw
```

---

## 第二步：安装依赖

```bash
pnpm install
```

---

## 第三步：配置环境变量

```bash
cp packages/gateway/.env.example packages/gateway/.env
```

编辑 `packages/gateway/.env`，填入以下内容：

```bash
# ── TRON 网络 ──────────────────────────────────────
TRON_NETWORK=nile                          # nile (测试网) 或 mainnet
TRON_PRIVATE_KEY=你的TRON钱包私钥           # Nile 测试网私钥
TRONGRID_API_KEY=你的TronGrid_API_Key       # https://www.trongrid.io/ 免费申请

# ── Bank of AI ─────────────────────────────────────
BANK_OF_AI_API_KEY=sk-aifmrtrcgn41q5h9ksfulgtroujuooun
BANK_OF_AI_API_URL=https://api.bankofai.io/v1

# ── LLM 配置 ───────────────────────────────────────
LLM_PROVIDER=gemini                        # 优先使用 Bank of AI，此项作备用
GEMINI_API_KEY=你的Gemini_API_Key           # 可选，Bank of AI 优先

# ── 服务配置 ────────────────────────────────────────
PORT=3000
MOCK_TRON=false                            # false = 真实链上数据
FRONTEND_URL=http://localhost:5173         # 前端地址（用于 CORS）
DATABASE_PATH=./data.db                    # SQLite 数据库路径
```

> **获取 Nile 测试网私钥**：
> 1. 安装 TronLink 浏览器插件
> 2. 切换到 Nile 测试网
> 3. 导出私钥（Settings → Export Private Key）
> 4. 在 https://nileex.io/join/getJoinPage 领取测试币

---

## 第四步：启动后端 Gateway

```bash
# 方式1：直接启动（开发模式，支持热重载）
cd packages/gateway
PORT=3000 node_modules/.bin/tsx src/index.ts

# 方式2：从项目根目录启动
pnpm --filter gateway dev

# 方式3：后台运行（生产模式）
cd packages/gateway
PORT=3000 node_modules/.bin/tsx src/index.ts > /tmp/gateway.log 2>&1 &
echo "Gateway PID: $!"
```

**启动成功标志：**
```
[WS] WebSocket server ready on /ws
[DB] SQLite initialized at ./data.db
🦀 TronClaw Gateway running on http://localhost:3000
   Network: nile
   Mock mode: OFF
   LLM: gemini
[WhalePoll] Starting whale polling (USDT every 30s)...
```

---

## 第五步：启动前端

```bash
# 方式1：本地访问
cd packages/frontend
pnpm exec vite

# 方式2：允许外网访问（在服务器上部署时使用）
cd packages/frontend
pnpm exec vite --host 0.0.0.0 --port 5173

# 方式3：从项目根目录启动
pnpm --filter frontend dev

# 方式4：后台运行
cd packages/frontend
pnpm exec vite --host 0.0.0.0 --port 5173 > /tmp/vite.log 2>&1 &
echo "Frontend PID: $!"
```

**启动成功标志：**
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://你的IP:5173/
```

---

## 第六步：验证部署

```bash
# 检查 Gateway 健康
curl http://localhost:3000/api/v1/data/overview

# 检查 AI Chat（Bank of AI）
curl -s -X POST http://localhost:3000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"你好","walletAddress":"","history":[]}' | head -c 200

# 检查 TRX 价格
curl http://localhost:3000/api/v1/data/overview | python3 -m json.tool
```

---

## 一键启动脚本

将以下内容保存为 `start.sh`：

```bash
#!/bin/bash
set -e

echo "🦀 Starting TronClaw..."

# Kill existing processes
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

# Start Gateway
cd packages/gateway
PORT=3000 node_modules/.bin/tsx src/index.ts > /tmp/gateway.log 2>&1 &
GATEWAY_PID=$!
echo "✅ Gateway started (PID: $GATEWAY_PID)"

# Wait for gateway
sleep 4

# Start Frontend
cd ../frontend
pnpm exec vite --host 0.0.0.0 --port 5173 > /tmp/vite.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

sleep 3
echo ""
echo "🌐 Frontend: http://$(hostname -I | awk '{print $1}'):5173"
echo "🔧 Gateway:  http://localhost:3000"
echo ""
echo "Logs: tail -f /tmp/gateway.log /tmp/vite.log"
```

```bash
chmod +x start.sh
./start.sh
```

---

## 停止服务

```bash
# 停止所有 TronClaw 进程
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
echo "Services stopped"
```

---

## 常见问题

### Q: Gateway 启动报 SSL 错误
```
Error: write EPROTO ssl3_get_record
```
**原因**：服务器连接 TronGrid 时 SSL 握手失败
**解决**：这是 demo 模式下可忽略的非阻断错误，已有 fallback 处理

### Q: TRX 价格显示 $0.121（旧值）
**原因**：CoinGecko API 被限流，使用缓存值
**解决**：重启 gateway，会重新拉取实时价格

### Q: Chat 页面提示 "Gemini 暂不可用"
**原因**：Gemini API 在部分地区被屏蔽
**解决**：已自动 fallback 到 `runLocalAgent`，核心功能（DeFi质押等）正常运行；
设置 `BANK_OF_AI_API_KEY` 可使用 minimax-m2.5（推荐）

### Q: TronLink 连接失败
**原因**：浏览器未安装 TronLink 插件
**解决**：安装 TronLink Chrome 插件，切换到 Nile 测试网

### Q: 前端无法访问后端 API
**原因**：Vite 代理配置问题
**检查**：确保 `packages/frontend/vite.config.ts` 中 proxy 目标为 `http://localhost:3000`

---

## 目录结构说明

```
TronClaw/
├── packages/
│   ├── gateway/          # 后端服务 (Node.js + Express + TypeScript)
│   │   ├── src/          # 源码
│   │   └── .env          # 环境变量（需手动创建）
│   ├── frontend/         # 前端 (React + Vite + TailwindCSS)
│   └── shared/           # 共享类型定义
├── start.sh              # 一键启动脚本
├── DEMO_SCRIPT.md        # Demo 视频脚本
└── DEPLOYMENT.md         # 本文件
```

---

## 技术栈快速参考

| 层 | 技术 | 端口 |
|----|------|------|
| 前端 | React 18 + Vite + TailwindCSS | 5173 |
| 后端 | Node.js + Express + TypeScript | 3000 |
| 数据库 | SQLite (better-sqlite3) | 本地文件 |
| AI | Bank of AI minimax-m2.5 | API |
| 区块链 | TRON Nile Testnet | — |
