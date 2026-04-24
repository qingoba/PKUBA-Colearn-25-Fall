/**
 * Agent Activity Broadcaster
 * Called by REST API routes to push agent tool call events to Dashboard via WebSocket
 */
import { broadcast } from '../ws/index.js'

export interface AgentToolCallEvent {
  agentId?: string
  agentName?: string
  tool: string
  input: Record<string, unknown>
  result: unknown
  success: boolean
  duration: number
}

export function broadcastToolCall(event: AgentToolCallEvent) {
  broadcast('agent_tool_call', event)
}

/**
 * Wraps a tool handler with timing + broadcast
 */
export async function withBroadcast<T>(
  tool: string,
  input: Record<string, unknown>,
  fn: () => Promise<T>,
  agentInfo?: { agentId?: string; agentName?: string },
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    broadcastToolCall({
      ...agentInfo,
      tool,
      input,
      result,
      success: true,
      duration: Date.now() - start,
    })
    return result
  } catch (e) {
    broadcastToolCall({
      ...agentInfo,
      tool,
      input,
      result: { error: (e as Error).message },
      success: false,
      duration: Date.now() - start,
    })
    throw e
  }
}
