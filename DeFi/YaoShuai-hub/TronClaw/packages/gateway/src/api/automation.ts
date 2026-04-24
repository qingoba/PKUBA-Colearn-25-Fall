import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import { createAutomationTask, createAutoTrade, createScheduledTransfer, createWhaleFollow, batchTransfer, listTasks, cancelTask, pauseTask, resumeTask, getTaskHistory, getAutoStats } from '../modules/automation/index.js'
import { ok, err } from '@tronclaw/shared'
import type { AutomationAction } from '@tronclaw/shared'

export const automationRouter: Router = Router()

const createHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      type: z.enum(['price_alert', 'auto_swap', 'scheduled_transfer', 'whale_alert']),
      conditions: z.record(z.unknown()),
      actions: z.array(z.object({ type: z.string(), params: z.record(z.unknown()) })),
    })
    const { type, conditions, actions } = schema.parse(req.body)
    res.json(ok(await createAutomationTask(type, conditions, actions as AutomationAction[])))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const tradeHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({ tokenPair: z.string(), triggerPrice: z.string(), action: z.enum(['buy', 'sell']), amount: z.string() })
    const { tokenPair, triggerPrice, action, amount } = schema.parse(req.body)
    res.json(ok(await createAutoTrade(tokenPair, triggerPrice, action, amount)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const scheduleHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({ to: z.string(), amount: z.string(), token: z.string(), schedule: z.enum(['daily', 'weekly', 'monthly']).default('daily') })
    const { to, amount, token, schedule } = schema.parse(req.body)
    res.json(ok(await createScheduledTransfer(to, amount, token, schedule)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const whaleFollowHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({ minAmount: z.string(), token: z.string().default('USDT'), followAction: z.enum(['copy', 'alert']).default('alert') })
    const { minAmount, token, followAction } = schema.parse(req.body)
    res.json(ok(await createWhaleFollow(minAmount, token, followAction)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const batchHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({ transfers: z.array(z.object({ to: z.string(), amount: z.string(), token: z.enum(['USDT', 'USDD', 'TRX']) })) })
    const { transfers } = schema.parse(req.body)
    res.json(ok(await batchTransfer(transfers)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const listHandler: RequestHandler = (req, res) => {
  try { res.json(ok(listTasks(req.query.status as string | undefined))) }
  catch (e) { res.status(500).json(err((e as Error).message)) }
}

const pauseHandler: RequestHandler = (req, res) => {
  try {
    const { taskId } = req.params
    const ok_ = pauseTask(taskId)
    if (!ok_) { res.status(404).json(err('Task not found or not active')); return }
    res.json(ok({ taskId, status: 'paused' }))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const resumeHandler: RequestHandler = (req, res) => {
  try {
    const { taskId } = req.params
    const ok_ = resumeTask(taskId)
    if (!ok_) { res.status(404).json(err('Task not found or not paused')); return }
    res.json(ok({ taskId, status: 'active' }))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const deleteHandler: RequestHandler = (req, res) => {
  try {
    const { taskId } = req.params
    const cancelled = cancelTask(taskId)
    if (!cancelled) { res.status(404).json(err('Task not found or already completed')); return }
    res.json(ok({ taskId, status: 'cancelled' }))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const historyHandler: RequestHandler = (req, res) => {
  try { res.json(ok(getTaskHistory(req.params.taskId))) }
  catch (e) { res.status(500).json(err((e as Error).message)) }
}

const statsHandler: RequestHandler = (req, res) => {
  try { res.json(ok(getAutoStats())) }
  catch (e) { res.status(500).json(err((e as Error).message)) }
}

automationRouter.post('/create', createHandler)
automationRouter.post('/trade', tradeHandler)
automationRouter.post('/schedule', scheduleHandler)
automationRouter.post('/whale-follow', whaleFollowHandler)
automationRouter.post('/batch-transfer', batchHandler)
automationRouter.get('/tasks', listHandler)
automationRouter.get('/tasks/:taskId/history', historyHandler)
automationRouter.patch('/tasks/:taskId/pause', pauseHandler)
automationRouter.patch('/tasks/:taskId/resume', resumeHandler)
automationRouter.delete('/tasks/:taskId', deleteHandler)
automationRouter.get('/stats', statsHandler)
