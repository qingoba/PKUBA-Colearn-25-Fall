/**
 * TronClaw OpenClaw Plugin
 * Registers TronClaw tools into OpenClaw's skill system
 */

const GATEWAY_URL = process.env.TRONCLAW_GATEWAY_URL ?? 'http://localhost:3000'

async function callGateway(path: string, method = 'GET', body?: unknown): Promise<unknown> {
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

// OpenClaw skill definition
export const skill = {
  name: 'tronclaw',
  description: 'TRON blockchain capabilities: payments, DeFi, on-chain data, automation',
  version: '1.0.0',

  tools: [
    {
      name: 'tron_check_balance',
      description: 'Check TRX, USDT, or USDD balance for a TRON address',
      parameters: {
        address: { type: 'string', required: true },
        token: { type: 'string', enum: ['TRX', 'USDT', 'USDD'], default: 'USDT' },
      },
      execute: async ({ address, token }: { address: string; token: string }) => {
        return callGateway(`/api/v1/payment/balance?address=${address}&token=${token}`)
      },
    },
    {
      name: 'tron_send_payment',
      description: 'Send USDT or USDD to a TRON address',
      parameters: {
        to: { type: 'string', required: true },
        amount: { type: 'string', required: true },
        token: { type: 'string', enum: ['USDT', 'USDD'], required: true },
        memo: { type: 'string' },
      },
      execute: async (params: Record<string, string>) => {
        return callGateway('/api/v1/payment/send', 'POST', params)
      },
    },
    {
      name: 'tron_create_payment_request',
      description: 'Create an x402 payment request URL',
      parameters: {
        amount: { type: 'string', required: true },
        token: { type: 'string', enum: ['USDT', 'USDD'], required: true },
        description: { type: 'string', required: true },
      },
      execute: async (params: Record<string, string>) => {
        return callGateway('/api/v1/payment/request', 'POST', params)
      },
    },
    {
      name: 'tron_whale_tracker',
      description: 'Track large USDT/USDD transfers on TRON',
      parameters: {
        token: { type: 'string', default: 'USDT' },
        hours: { type: 'number', default: 24 },
      },
      execute: async ({ token, hours }: { token: string; hours: number }) => {
        return callGateway(`/api/v1/data/whales?token=${token}&hours=${hours}`)
      },
    },
    {
      name: 'tron_defi_yields',
      description: 'Query DeFi yield rates on TRON',
      parameters: {
        protocol: { type: 'string', default: 'all' },
      },
      execute: async ({ protocol }: { protocol: string }) => {
        return callGateway(`/api/v1/defi/yields?protocol=${protocol}`)
      },
    },
    {
      name: 'tron_yield_optimize',
      description: 'Get AI yield optimization strategy',
      parameters: {
        portfolio: { type: 'array', required: true },
        riskPreference: { type: 'string', default: 'medium' },
      },
      execute: async (params: Record<string, unknown>) => {
        return callGateway('/api/v1/defi/optimize', 'POST', params)
      },
    },
    {
      name: 'tron_analyze_address',
      description: 'Analyze a TRON address',
      parameters: {
        address: { type: 'string', required: true },
      },
      execute: async ({ address }: { address: string }) => {
        return callGateway(`/api/v1/data/address/${address}`)
      },
    },
    {
      name: 'tron_auto_trade',
      description: 'Set up price-triggered automated trading',
      parameters: {
        tokenPair: { type: 'string', required: true },
        triggerPrice: { type: 'string', required: true },
        action: { type: 'string', enum: ['buy', 'sell'], required: true },
        amount: { type: 'string', required: true },
      },
      execute: async (params: Record<string, string>) => {
        return callGateway('/api/v1/automation/trade', 'POST', params)
      },
    },
  ],
}

export default skill
