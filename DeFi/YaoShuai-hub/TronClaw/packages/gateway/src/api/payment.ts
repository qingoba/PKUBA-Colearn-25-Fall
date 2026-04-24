import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import { checkBalance, sendPayment, createPaymentRequest, getPaymentStatus } from '../modules/payment/index.js'
import { isValidAddress } from '../tron/wallet.js'
import type { ApiResponse, TokenSymbol } from '@tronclaw/shared'
import { ok, err } from '@tronclaw/shared'

export const paymentRouter: Router = Router()

// ─── GET /api/v1/payment/balance?address=T...&token=USDT ──────────────────────
const balanceHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      address: z.string().min(1),
      token: z.enum(['TRX', 'USDT', 'USDD']).optional().default('USDT'),
    })
    const { address, token } = schema.parse(req.query)

    if (!isValidAddress(address)) {
      res.status(400).json(err('Invalid TRON address'))
      return
    }

    const result = await checkBalance(address, token as TokenSymbol)
    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

// ─── POST /api/v1/payment/send ────────────────────────────────────────────────
const sendHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      to: z.string().min(1),
      amount: z.string().min(1),
      token: z.enum(['USDT', 'USDD']),
      memo: z.string().optional(),
    })
    const { to, amount, token, memo } = schema.parse(req.body)

    if (!isValidAddress(to)) {
      res.status(400).json(err('Invalid recipient TRON address'))
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      res.status(400).json(err('Amount must be a positive number'))
      return
    }

    const result = await sendPayment(to, amount, token as TokenSymbol, memo)
    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

// ─── POST /api/v1/payment/request ────────────────────────────────────────────
const requestHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      amount: z.string().min(1),
      token: z.enum(['USDT', 'USDD']),
      description: z.string().min(1).max(200),
    })
    const { amount, token, description } = schema.parse(req.body)

    const result = await createPaymentRequest(amount, token as TokenSymbol, description)
    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

// ─── GET /api/v1/payment/status/:payId ───────────────────────────────────────
const statusHandler: RequestHandler = async (req, res) => {
  try {
    const { payId } = req.params
    const result = await getPaymentStatus(payId)
    if (!result) {
      res.status(404).json(err('Payment request not found'))
      return
    }
    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

paymentRouter.get('/balance', balanceHandler)
paymentRouter.post('/send', sendHandler)
paymentRouter.post('/request', requestHandler)
paymentRouter.get('/status/:payId', statusHandler)
