#!/bin/bash
# TronClaw Local Demo Startup Script
# Usage: ./start-demo.sh

set -e

GATEWAY_DIR="$(dirname "$0")/packages/gateway"
FRONTEND_DIR="$(dirname "$0")/packages/frontend"

echo "🦀 Starting TronClaw Demo..."
echo ""

# Check .env
if [ ! -f "$GATEWAY_DIR/.env" ]; then
  echo "❌ Missing packages/gateway/.env — copy from .env.example and fill in keys"
  exit 1
fi

# Kill any existing processes on ports 3000 and 5173
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
sleep 1

# Start Gateway
echo "▶ Starting Gateway on http://localhost:3000..."
cd "$GATEWAY_DIR"
node_modules/.bin/tsx src/index.ts &
GATEWAY_PID=$!

sleep 2

# Verify gateway is running
if curl -s http://localhost:3000/health > /dev/null; then
  echo "✅ Gateway running (PID $GATEWAY_PID)"
else
  echo "❌ Gateway failed to start"
  kill $GATEWAY_PID 2>/dev/null
  exit 1
fi

# Start Frontend
echo "▶ Starting Frontend on http://localhost:5173..."
cd "$FRONTEND_DIR"
pnpm exec vite &
FRONTEND_PID=$!

sleep 2
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TronClaw Demo is running!"
echo ""
echo "  🌐 Frontend:  http://localhost:5173"
echo "  ⚙️  Gateway:   http://localhost:3000"
echo "  🔌 MCP:       stdio (see mcp-config.json)"
echo "  📡 WebSocket: ws://localhost:3000/ws"
echo ""
echo "  Network: $(grep TRON_NETWORK $GATEWAY_DIR/.env | cut -d= -f2)"
echo "  Mock:    $(grep MOCK_TRON $GATEWAY_DIR/.env | cut -d= -f2)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait and cleanup on exit
trap "echo ''; echo 'Stopping TronClaw...'; kill $GATEWAY_PID $FRONTEND_PID 2>/dev/null; echo 'Done.'" EXIT
wait
