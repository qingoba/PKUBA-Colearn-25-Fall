import { WebSocketServer, WebSocket } from 'ws'
import type { Server } from 'http'
import type { WsEvent, WsEventType } from '@tronclaw/shared'

let wss: WebSocketServer

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' })

  wss.on('connection', (ws) => {
    console.log('[WS] Client connected')
    // Send welcome event
    const welcome: WsEvent = {
      type: 'connected',
      data: { message: 'Connected to TronClaw Gateway' },
      timestamp: Date.now(),
    }
    ws.send(JSON.stringify(welcome))

    ws.on('close', () => console.log('[WS] Client disconnected'))
    ws.on('error', (err) => console.error('[WS] Error:', err))
  })

  console.log('[WS] WebSocket server ready on /ws')
}

export function broadcast<T>(type: WsEventType, data: T) {
  if (!wss) return
  const event: WsEvent<T> = { type, data, timestamp: Date.now() }
  const message = JSON.stringify(event)
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}
