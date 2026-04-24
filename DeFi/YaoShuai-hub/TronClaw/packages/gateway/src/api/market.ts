import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import { ok, err } from '@tronclaw/shared'
import { getServices, getServiceById, registerService, invokeService, getInvocationHistory, rateService, getMarketStats } from '../modules/market/index.js'

export const marketRouter: Router = Router()

// GET /api/v1/market/services?category=all
const listHandler: RequestHandler = (req, res) => {
  try {
    const category = req.query.category as string | undefined
    const services = getServices(category)
    res.json(ok(services))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

// GET /api/v1/market/services/:id
const getHandler: RequestHandler = (req, res) => {
  try {
    const service = getServiceById(req.params.id)
    if (!service) { res.status(404).json(err('Service not found')); return }
    res.json(ok(service))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

// POST /api/v1/market/register
const registerHandler: RequestHandler = (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1), description: z.string().min(1),
      agentName: z.string().min(1), agentId: z.string().min(1),
      price: z.string(), token: z.enum(['USDT', 'USDD']),
      category: z.string().optional().default('General'),
    })
    const data = schema.parse(req.body)
    const service = registerService(data.name, data.description, data.agentName, data.agentId, data.price, data.token, data.category)
    res.json(ok(service))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

// POST /api/v1/market/invoke
const invokeHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      serviceId: z.string(),
      callerAddress: z.string().optional().default(''),
      input: z.string().optional(),
    })
    const { serviceId, callerAddress, input } = schema.parse(req.body)
    const result = await invokeService(serviceId, callerAddress, input)
    res.json(ok(result))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

// GET /api/v1/market/history?address=T...
const historyHandler: RequestHandler = (req, res) => {
  try {
    const address = req.query.address as string | undefined
    const history = getInvocationHistory(address)
    res.json(ok(history))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

// POST /api/v1/market/rate
const rateHandler: RequestHandler = (req, res) => {
  try {
    const schema = z.object({ serviceId: z.string(), rating: z.number().min(1).max(5) })
    const { serviceId, rating } = schema.parse(req.body)
    rateService(serviceId, rating)
    res.json(ok({ success: true }))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

// GET /api/v1/market/stats
const statsHandler: RequestHandler = (req, res) => {
  try { res.json(ok(getMarketStats())) }
  catch (e) { res.status(500).json(err((e as Error).message)) }
}

marketRouter.get('/services', listHandler)
marketRouter.get('/services/:id', getHandler)
marketRouter.post('/register', registerHandler)
marketRouter.post('/invoke', invokeHandler)
marketRouter.get('/history', historyHandler)
marketRouter.post('/rate', rateHandler)
marketRouter.get('/stats', statsHandler)
