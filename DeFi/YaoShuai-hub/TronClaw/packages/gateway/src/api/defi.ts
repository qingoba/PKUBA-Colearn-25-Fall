import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import { getDefiYields, swapTokens, lendSupply, optimizeYield, getDefiOverview, getPortfolio, getSwapRoutes } from '../modules/defi/index.js'
import { ok, err } from '@tronclaw/shared'
import type { TokenSymbol } from '@tronclaw/shared'

export const defiRouter: Router = Router()

const yieldsHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({ protocol: z.enum(['sunswap', 'justlend', 'all']).optional().default('all') })
    const { protocol } = schema.parse(req.query)
    res.json(ok(await getDefiYields(protocol)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const overviewHandler: RequestHandler = async (_req, res) => {
  try { res.json(ok(await getDefiOverview())) }
  catch (e) { res.status(500).json(err((e as Error).message)) }
}

const portfolioHandler: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params
    res.json(ok(await getPortfolio(address)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const swapHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      fromToken: z.string(),
      toToken: z.string(),
      amount: z.string(),
      slippage: z.number().optional().default(0.5),
      callerAddress: z.string().optional(),
      sign: z.boolean().optional().default(true),
    })
    const { fromToken, toToken, amount, slippage, callerAddress, sign } = schema.parse(req.body)
    res.json(ok(await swapTokens(fromToken, toToken, amount, slippage, callerAddress, sign === false)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const lendHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({ token: z.string(), amount: z.string() })
    const { token, amount } = schema.parse(req.body)
    res.json(ok(await lendSupply(token, amount)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const optimizeHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      portfolio: z.array(z.object({ token: z.string(), amount: z.string() })),
      riskPreference: z.enum(['low', 'medium', 'high']).default('medium'),
    })
    const { portfolio, riskPreference } = schema.parse(req.body)
    res.json(ok(await optimizeYield(portfolio, riskPreference)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const routesHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({ fromToken: z.string(), toToken: z.string(), amount: z.string().default('100') })
    const { fromToken, toToken, amount } = schema.parse(req.query)
    res.json(ok(await getSwapRoutes(fromToken, toToken, amount)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

defiRouter.get('/overview', overviewHandler)
defiRouter.get('/yields', yieldsHandler)
defiRouter.get('/routes', routesHandler)
defiRouter.get('/portfolio/:address', portfolioHandler)
defiRouter.post('/swap', swapHandler)
defiRouter.post('/lend', lendHandler)
defiRouter.post('/optimize', optimizeHandler)
