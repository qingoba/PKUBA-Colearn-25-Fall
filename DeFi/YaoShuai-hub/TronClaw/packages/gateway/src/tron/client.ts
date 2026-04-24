import { TronWeb } from 'tronweb'
import { TRON_ENDPOINTS, type TronNetwork } from '@tronclaw/shared'

let tronWebInstance: TronWeb | null = null

export function getTronWeb(): TronWeb {
  if (tronWebInstance) return tronWebInstance

  const network = (process.env.TRON_NETWORK ?? 'nile') as TronNetwork
  const privateKey = process.env.TRON_PRIVATE_KEY
  const apiKey = process.env.TRONGRID_API_KEY

  if (!privateKey) {
    throw new Error('TRON_PRIVATE_KEY is not set in environment variables')
  }

  const endpoints = TRON_ENDPOINTS[network]

  tronWebInstance = new TronWeb({
    fullHost: endpoints.fullNode,
    headers: apiKey ? { 'TRON-PRO-API-KEY': apiKey } : {},
    privateKey,
  })

  console.log(`[TronWeb] Connected to ${network} (${endpoints.fullNode})`)
  return tronWebInstance
}

export function getNetwork(): TronNetwork {
  return (process.env.TRON_NETWORK ?? 'nile') as TronNetwork
}

export function isMockMode(): boolean {
  return process.env.MOCK_TRON === 'true'
}
