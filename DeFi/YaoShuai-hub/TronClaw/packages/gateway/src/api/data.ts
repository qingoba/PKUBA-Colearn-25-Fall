import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import { analyzeAddress, getTxHistory, getWhaleTransfers, getTokenInfo, getTxDetail, getNetworkOverview } from '../modules/data/index.js'
import { isValidAddress } from '../tron/wallet.js'
import { ok, err } from '@tronclaw/shared'
import type { TokenSymbol } from '@tronclaw/shared'

export const dataRouter: Router = Router()

const addressHandler: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params
    if (!isValidAddress(address)) { res.status(400).json(err('Invalid TRON address')); return }
    res.json(ok(await analyzeAddress(address)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const txHandler: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params
    const limit = parseInt((req.query.limit as string) ?? '20', 10)
    if (!isValidAddress(address)) { res.status(400).json(err('Invalid TRON address')); return }
    res.json(ok(await getTxHistory(address, Math.min(limit, 100))))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const whalesHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      token: z.enum(['TRX', 'USDT', 'USDD', 'all']).optional().default('USDT'),
      minAmount: z.string().optional(),
      hours: z.string().optional().default('24'),
      limit: z.string().optional().default('20'),
    })
    const { token, hours, limit } = schema.parse(req.query)
    const parsedHours = parseInt(hours, 10)
    const parsedLimit = Math.min(parseInt(limit, 10), 50)

    // 'all' or default 'USDT' → on Nile testnet only USDT contract exists
    if (token === 'all' || token === 'USDT') {
      const network = process.env.TRON_NETWORK ?? 'nile'
      if (network === 'nile') {
        // Nile: USDD contract doesn't exist, only fetch USDT
        const data = await getWhaleTransfers('USDT', parsedHours, parsedLimit)
        res.json(ok(data))
        return
      }
      // Mainnet: merge USDT + USDD
      const [usdtResult, usddResult] = await Promise.allSettled([
        getWhaleTransfers('USDT', parsedHours, 15),
        getWhaleTransfers('USDD', parsedHours, 5),
      ])
      const combined = [
        ...(usdtResult.status === 'fulfilled' ? usdtResult.value : []),
        ...(usddResult.status === 'fulfilled' ? usddResult.value : []),
      ]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, parsedLimit)
      res.json(ok(combined))
      return
    }

    res.json(ok(await getWhaleTransfers(token as TokenSymbol, parsedHours, parsedLimit)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const tokenHandler: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params
    res.json(ok(await getTokenInfo(address)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const txDetailHandler: RequestHandler = async (req, res) => {
  try {
    const { hash } = req.params
    res.json(ok(await getTxDetail(hash)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const overviewHandler: RequestHandler = async (_req, res) => {
  try { res.json(ok(await getNetworkOverview())) }
  catch (e) { res.status(500).json(err((e as Error).message)) }
}

dataRouter.get('/overview', overviewHandler)
dataRouter.get('/address/:address', addressHandler)
dataRouter.get('/transactions/:address', txHandler)
dataRouter.get('/whales', whalesHandler)
dataRouter.get('/token/:address', tokenHandler)
dataRouter.get('/tx/:hash', txDetailHandler)
