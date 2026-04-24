/**
 * Automation Module — conditional on-chain task execution
 * Bank of AI infrastructure: MCP Server + Skills Modules
 */
import { v4 as uuidv4 } from 'uuid'
import { isMockMode } from '../../tron/client.js'
import { getDb } from '../../db/index.js'
import { broadcast } from '../../ws/index.js'
import { sendPayment } from '../payment/index.js'
import type { AutomationTask, AutomationAction, TokenSymbol } from '@tronclaw/shared'

// ─── Create generic automation task ──────────────────────────────────────────

export async function createAutomationTask(
  type: AutomationTask['type'],
  conditions: Record<string, unknown>,
  actions: AutomationAction[],
): Promise<AutomationTask> {
  const taskId = uuidv4()
  const now = Date.now()

  const task: AutomationTask = {
    taskId,
    type,
    status: 'active',
    conditions,
    actions,
    createdAt: now,
    triggerCount: 0,
  }

  const db = getDb()
  db.prepare(`
    INSERT INTO automation_tasks (task_id, type, status, conditions, actions, created_at, trigger_count)
    VALUES (?, ?, 'active', ?, ?, ?, 0)
  `).run(taskId, type, JSON.stringify(conditions), JSON.stringify(actions), now)

  return task
}

// ─── Auto Trade ───────────────────────────────────────────────────────────────

export async function createAutoTrade(
  tokenPair: string,
  triggerPrice: string,
  action: 'buy' | 'sell',
  amount: string,
): Promise<AutomationTask> {
  const [baseToken, quoteToken] = tokenPair.split('/')

  return createAutomationTask(
    'auto_swap',
    { tokenPair, triggerPrice, action, priceDirection: action === 'buy' ? 'below' : 'above' },
    [{
      type: 'swap',
      params: {
        fromToken: action === 'buy' ? quoteToken : baseToken,
        toToken: action === 'buy' ? baseToken : quoteToken,
        amount,
      },
    }],
  )
}

// ─── Batch Transfer ───────────────────────────────────────────────────────────

export async function batchTransfer(
  transfers: Array<{ to: string; amount: string; token: string }>,
): Promise<{ txHashes: string[]; totalCost: string }> {
  const txHashes: string[] = []

  for (const t of transfers) {
    try {
      const result = await sendPayment(t.to, t.amount, t.token as TokenSymbol)
      txHashes.push(result.txHash)
    } catch (e) {
      txHashes.push(`error: ${(e as Error).message}`)
    }
  }

  return {
    txHashes,
    totalCost: '~20 TRX energy', // estimate
  }
}

// ─── List Tasks ───────────────────────────────────────────────────────────────

export function listTasks(status?: string): AutomationTask[] {
  const db = getDb()
  const rows = status
    ? db.prepare('SELECT * FROM automation_tasks WHERE status = ?').all(status)
    : db.prepare('SELECT * FROM automation_tasks').all()

  return (rows as Record<string, unknown>[]).map(row => ({
    taskId: row.task_id as string,
    type: row.type as AutomationTask['type'],
    status: row.status as AutomationTask['status'],
    conditions: JSON.parse(row.conditions as string),
    actions: JSON.parse(row.actions as string),
    createdAt: row.created_at as number,
    triggeredAt: row.triggered_at as number | undefined,
    triggerCount: row.trigger_count as number,
  }))
}

// ─── Cancel Task ──────────────────────────────────────────────────────────────

export function cancelTask(taskId: string): boolean {
  const db = getDb()
  const result = db.prepare(
    "UPDATE automation_tasks SET status = 'cancelled' WHERE task_id = ? AND status = 'active'"
  ).run(taskId)
  return result.changes > 0
}

// ─── Scheduled Transfer ───────────────────────────────────────────────────────

export async function createScheduledTransfer(
  to: string,
  amount: string,
  token: string,
  schedule: string, // 'daily' | 'weekly' | 'monthly'
): Promise<AutomationTask> {
  return createAutomationTask(
    'scheduled_transfer',
    { to, schedule, nextRun: Date.now() + 86400000 },
    [{ type: 'send_payment', params: { to, amount, token } }],
  )
}

// ─── Whale Follow ─────────────────────────────────────────────────────────────

export async function createWhaleFollow(
  minAmount: string,
  token: string,
  followAction: 'copy' | 'alert',
): Promise<AutomationTask> {
  return createAutomationTask(
    'whale_alert',
    { minAmount, token, followAction },
    [{ type: 'notify', params: { message: `Whale detected: ${minAmount}+ ${token}` } }],
  )
}

// ─── Pause / Resume Task ──────────────────────────────────────────────────────

export function pauseTask(taskId: string): boolean {
  const db = getDb()
  const result = db.prepare("UPDATE automation_tasks SET status = 'paused' WHERE task_id = ? AND status = 'active'").run(taskId)
  return result.changes > 0
}

export function resumeTask(taskId: string): boolean {
  const db = getDb()
  const result = db.prepare("UPDATE automation_tasks SET status = 'active' WHERE task_id = ? AND status = 'paused'").run(taskId)
  return result.changes > 0
}

// ─── Task History ─────────────────────────────────────────────────────────────

export function getTaskHistory(taskId: string) {
  // In production, track per-trigger history in a separate table
  // For demo, return mock history
  return [
    { timestamp: Date.now() - 3600000, event: 'triggered', success: true, txHash: `mock_auto_${Date.now().toString(16)}` },
    { timestamp: Date.now() - 7200000, event: 'triggered', success: true, txHash: `mock_auto_${(Date.now() - 1).toString(16)}` },
  ]
}

// ─── Global Stats ─────────────────────────────────────────────────────────────

export function getAutoStats() {
  const db = getDb()
  const rows = db.prepare('SELECT status, COUNT(*) as c, SUM(trigger_count) as t FROM automation_tasks GROUP BY status').all() as Array<{ status: string; c: number; t: number }>
  const stats = { active: 0, paused: 0, completed: 0, cancelled: 0, totalTriggers: 0 }
  for (const r of rows) {
    if (r.status in stats) (stats as Record<string, number>)[r.status] = r.c
    stats.totalTriggers += r.t ?? 0
  }
  return stats
}

let monitorInterval: ReturnType<typeof setInterval> | null = null

export function startPriceMonitor() {
  if (monitorInterval) return

  monitorInterval = setInterval(async () => {
    const tasks = listTasks('active')
    for (const task of tasks) {
      if (task.type === 'auto_swap') {
        await checkAutoTradeCondition(task)
      }
    }
  }, 30_000) // check every 30 seconds
}

async function checkAutoTradeCondition(task: AutomationTask) {
  if (isMockMode()) return // skip polling in mock mode

  try {
    // TODO: fetch current price from SunSwap/TronGrid
    // Compare with task.conditions.triggerPrice
    // If triggered, execute actions and update DB
  } catch (e) {
    console.error('[Automation] Error checking task', task.taskId, e)
  }
}
