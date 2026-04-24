import express from 'express'
import cors from 'cors'
import { createServer as createHttpServer } from 'http'
import { initDb } from './db/index.js'
import { paymentRouter } from './api/payment.js'
import { dataRouter } from './api/data.js'
import { defiRouter } from './api/defi.js'
import { automationRouter } from './api/automation.js'
import { identityRouter } from './api/identity.js'
import { chatRouter } from './api/chat.js'
import { marketRouter } from './api/market.js'
import { agentRouter } from './api/agent.js'
import { setupWebSocket, broadcast } from './ws/index.js'
import type { ApiResponse } from '@tronclaw/shared'

// ─── API Activity Interceptor (broadcasts all /api/v1/* calls to Dashboard) ──

function apiActivityMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  // Skip health + chat (too noisy)
  if (!req.path.startsWith('/api/v1/') || req.path.startsWith('/api/v1/chat')) {
    return next()
  }

  const start = Date.now()
  const originalJson = res.json.bind(res)

  res.json = (body: unknown) => {
    const duration = Date.now() - start
    const apiBody = body as ApiResponse

    // Derive tool name from path: /api/v1/payment/balance → tron_payment_balance
    const parts = req.path.replace('/api/v1/', '').replace(/^\//, '').split('/').filter(Boolean)
    const tool = `tron_${parts.join('_').replace(/-/g, '_')}`

    // Broadcast to all WebSocket clients
    broadcast('agent_tool_call', {
      tool,
      method: req.method,
      path: req.path,
      input: req.method === 'GET' ? req.query : req.body,
      result: apiBody?.data,
      success: apiBody?.success ?? true,
      duration,
      timestamp: Date.now(),
    })

    return originalJson(body)
  }

  next()
}

export function createServer() {
  const app = express()

  // ─── Middleware ───────────────────────────────────────────────────────────
  app.use(cors({
    origin: (origin, callback) => {
      // Allow: no origin (curl/MCP), localhost, or any IP:5173
      if (!origin || origin.includes('localhost') || origin.includes(':5173') || origin.includes(':3000')) {
        callback(null, true)
      } else {
        callback(null, true) // Allow all for hackathon demo
      }
    },
    credentials: true,
  }))
  app.use(express.json())
  app.use(apiActivityMiddleware)

  // ─── Health check ─────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    const response: ApiResponse<{ status: string; network: string; mock: boolean }> = {
      success: true,
      data: {
        status: 'ok',
        network: process.env.TRON_NETWORK ?? 'nile',
        mock: process.env.MOCK_TRON === 'true',
      },
      error: null,
    }
    res.json(response)
  })

  // ─── API Routes ───────────────────────────────────────────────────────────
  app.use('/api/v1/payment', paymentRouter)
  app.use('/api/v1/data', dataRouter)
  app.use('/api/v1/defi', defiRouter)
  app.use('/api/v1/automation', automationRouter)
  app.use('/api/v1/identity', identityRouter)
  app.use('/api/v1/chat', chatRouter)
  app.use('/api/v1/market', marketRouter)
  app.use('/api/v1/agent', agentRouter)

  // ─── Error handler ────────────────────────────────────────────────────────
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Gateway Error]', err)
    const response: ApiResponse = { success: false, data: null, error: err.message }
    res.status(500).json(response)
  })

  // ─── HTTP server + WebSocket ──────────────────────────────────────────────
  const httpServer = createHttpServer(app)
  setupWebSocket(httpServer)

  // ─── Init DB ──────────────────────────────────────────────────────────────
  initDb()

  return httpServer
}
