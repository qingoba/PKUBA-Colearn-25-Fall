/**
 * Payment Module — x402 Protocol + TRC20 transfers
 * Bank of AI infrastructure: x402 Payment Protocol + Skills Modules
 * Uses @t402/tron SDK for address validation, amount conversion, and x402 payment requirements
 */
import { v4 as uuidv4 } from 'uuid'
import {
  validateTronAddress,
  convertToSmallestUnits,
  convertFromSmallestUnits,
  getTRC20Config,
  isNetworkSupported,
} from '@t402/tron'
import { getNetwork, isMockMode } from '../../tron/client.js'
import { getWalletAddress } from '../../tron/wallet.js'
import { getTrxBalance, getTrc20Balance, transferTrc20 } from '../../tron/contracts.js'
import { getDb } from '../../db/index.js'
import { broadcast } from '../../ws/index.js'
import type {
  BalanceResult,
  PaymentResult,
  PaymentRequest,
  TokenSymbol,
} from '@tronclaw/shared'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_BALANCES: Record<TokenSymbol, string> = {
  TRX: '1250.500000',
  USDT: '500.000000',
  USDD: '200.000000000000000000',
}

// ─── Balance ──────────────────────────────────────────────────────────────────

export async function checkBalance(
  address: string,
  token: TokenSymbol = 'USDT',
): Promise<BalanceResult> {
  const network = getNetwork()

  if (isMockMode()) {
    return {
      address,
      token,
      balance: MOCK_BALANCES[token],
      usdValue: token === 'TRX'
        ? (parseFloat(MOCK_BALANCES.TRX) * 0.12).toFixed(2)
        : MOCK_BALANCES[token],
      network,
    }
  }

  let balance: string
  if (token === 'TRX') {
    balance = await getTrxBalance(address)
  } else {
    balance = await getTrc20Balance(address, token)
  }

  // Simple USD estimate (TRX ~ $0.12, stablecoins ~ $1)
  const usdValue = token === 'TRX'
    ? (parseFloat(balance) * 0.12).toFixed(2)
    : balance

  return { address, token, balance, usdValue, network }
}

// ─── Send Payment (x402) ──────────────────────────────────────────────────────

export async function sendPayment(
  to: string,
  amount: string,
  token: TokenSymbol,
  memo?: string,
): Promise<PaymentResult> {
  const { address: from } = getWalletAddress()
  const timestamp = Date.now()
  const network = getNetwork()

  // Defensive check before SDK call (validateTronAddress calls .toLowerCase() internally)
  if (!to || typeof to !== 'string') {
    throw new Error(`[x402] Payment recipient address is required`)
  }

  // x402 Protocol: validate address using @t402/tron SDK
  if (!validateTronAddress(to)) {
    throw new Error(`[x402] Invalid TRON address: ${to}`)
  }

  // x402 Protocol: get token config and convert amount using @t402/tron SDK
  const caip2Network = `tron:${network}` // e.g. 'tron:nile'
  const networkSupported = isNetworkSupported(caip2Network)
  const tokenConfig = networkSupported ? getTRC20Config(caip2Network, token) : null
  const decimals = tokenConfig?.decimals ?? 6
  const amountInSmallestUnits = convertToSmallestUnits(amount, decimals)
  const readableAmount = convertFromSmallestUnits(amountInSmallestUnits, decimals)

  console.log(`[x402] Payment: ${readableAmount} ${token} → ${to} (${caip2Network}, contract: ${tokenConfig?.contractAddress ?? 'unknown'})`)

  if (isMockMode()) {
    const mockTx: PaymentResult = {
      txHash: `x402_mock_${uuidv4().replace(/-/g, '').slice(0, 32)}`,
      from,
      to,
      amount: readableAmount,
      token,
      status: 'confirmed',
      timestamp,
    }
    logTransaction(mockTx)
    broadcast('transaction', mockTx)
    broadcast('payment_confirmed', mockTx)
    return mockTx
  }

  try {
    const txHash = await transferTrc20(to, amount, token)

    const result: PaymentResult = {
      txHash,
      from,
      to,
      amount,
      token,
      status: 'pending',
      timestamp,
    }

    logTransaction(result)
    broadcast('transaction', result)

    return result
  } catch (error) {
    const err = error as Error
    console.error('[x402] transferTrc20 failed:', err.message)
    console.error('[x402] Stack:', err.stack)
    throw new Error(`Payment failed: ${err.message}`)
  }
}

// ─── Create Payment Request (x402) ───────────────────────────────────────────

export async function createPaymentRequest(
  amount: string,
  token: TokenSymbol,
  description: string,
): Promise<PaymentRequest> {
  const { address: recipientAddress } = getWalletAddress()
  const payId = uuidv4()
  const now = Date.now()
  const expiresAt = now + 30 * 60 * 1000 // 30 minutes
  const network = getNetwork()

  // x402 Protocol: build standard payment requirement using @t402/tron SDK
  const caip2Network = `tron:${network}`
  const tokenConfig = isNetworkSupported(caip2Network) ? getTRC20Config(caip2Network, token) : null
  const decimals = tokenConfig?.decimals ?? 6
  const amountInSmallestUnits = convertToSmallestUnits(amount, decimals)

  // x402-compliant payment requirement object
  const x402PaymentRequirement = {
    scheme: 'exact',
    network: caip2Network,
    maxAmountRequired: amountInSmallestUnits.toString(),
    resource: `${process.env.GATEWAY_URL ?? 'http://localhost:3000'}/api/v1/payment/${payId}`,
    description,
    mimeType: 'application/json',
    payTo: recipientAddress,
    maxTimeoutSeconds: 1800,
    asset: tokenConfig?.contractAddress ?? token,
    extra: { name: tokenConfig?.name ?? token, version: '1' },
  }

  const paymentRequest: PaymentRequest = {
    payId,
    amount,
    token,
    description,
    paymentUrl: `${process.env.GATEWAY_URL ?? 'http://localhost:3000'}/pay/${payId}`,
    recipientAddress,
    expiresAt,
    status: 'pending',
  }

  // Persist to DB
  const db = getDb()
  db.prepare(`
    INSERT INTO payment_requests (pay_id, amount, token, description, recipient_address, status, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(payId, amount, token, description, recipientAddress, now, expiresAt)

  console.log(`[x402] Payment requirement created: ${JSON.stringify(x402PaymentRequirement).slice(0, 120)}`)

  return { ...paymentRequest, x402: x402PaymentRequirement } as PaymentRequest & { x402: typeof x402PaymentRequirement }
}

// ─── Payment Status ───────────────────────────────────────────────────────────

export async function getPaymentStatus(payId: string): Promise<PaymentRequest | null> {
  const db = getDb()
  const row = db.prepare('SELECT * FROM payment_requests WHERE pay_id = ?').get(payId) as
    | Record<string, unknown>
    | undefined

  if (!row) return null

  return {
    payId: row.pay_id as string,
    amount: row.amount as string,
    token: row.token as TokenSymbol,
    description: row.description as string,
    paymentUrl: `${process.env.GATEWAY_URL ?? 'http://localhost:3000'}/pay/${payId}`,
    recipientAddress: row.recipient_address as string,
    expiresAt: row.expires_at as number,
    status: row.status as PaymentRequest['status'],
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function logTransaction(tx: PaymentResult) {
  try {
    const db = getDb()
    db.prepare(`
      INSERT INTO tx_log (tx_hash, type, from_address, to_address, amount, token, status, timestamp)
      VALUES (?, 'payment', ?, ?, ?, ?, ?, ?)
    `).run(tx.txHash, tx.from, tx.to, tx.amount, tx.token, tx.status, tx.timestamp)
  } catch (e) {
    console.error('[DB] Failed to log transaction:', e)
  }
}
