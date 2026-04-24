// Shared types for TronClaw

export type TronNetwork = 'nile' | 'shasta' | 'mainnet'
export type TokenSymbol = 'TRX' | 'USDT' | 'USDD'

// ─── API Response Envelope ───────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  error: string | null
  metadata?: Record<string, unknown>
}

export function ok<T>(data: T, metadata?: Record<string, unknown>): ApiResponse<T> {
  return { success: true, data, error: null, metadata }
}

export function err(error: string): ApiResponse<null> {
  return { success: false, data: null, error }
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface BalanceResult {
  address: string
  token: TokenSymbol
  balance: string        // raw decimal string
  usdValue: string       // estimated USD value
  network: TronNetwork
}

export interface PaymentResult {
  txHash: string
  from: string
  to: string
  amount: string
  token: TokenSymbol
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
}

export interface PaymentRequest {
  payId: string
  amount: string
  token: TokenSymbol
  description: string
  paymentUrl: string
  recipientAddress: string
  expiresAt: number
  status: 'pending' | 'paid' | 'expired'
}

// ─── On-chain Data ────────────────────────────────────────────────────────────

export interface AddressInfo {
  address: string
  trxBalance: string
  tokenHoldings: TokenHolding[]
  txCount: number
  firstTxDate: string | null
  tags: string[]
}

export interface TokenHolding {
  contractAddress: string
  symbol: string
  name: string
  balance: string
  decimals: number
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  token: string
  tokenSymbol: string
  timestamp: number
  confirmed: boolean
  energyUsage?: number
  fee?: string
}

export interface WhaleTransfer {
  hash: string
  from: string
  to: string
  amount: string
  token: string
  tokenSymbol: string
  timestamp: number
  usdValue: string
}

export interface TokenInfo {
  contractAddress: string
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  holders: number
  price: string
  marketCap: string
}

// ─── DeFi ────────────────────────────────────────────────────────────────────

export interface DeFiPool {
  protocol: 'sunswap' | 'justlend' | 'other'
  name: string
  token0: string
  token1?: string
  apy: string
  tvl: string
  riskLevel: 'low' | 'medium' | 'high'
  contractAddress?: string
}

export interface SwapResult {
  txHash: string
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  priceImpact: string
  fee: string
}

export interface YieldStrategy {
  strategy: string
  expectedApy: string
  riskLevel: 'low' | 'medium' | 'high'
  steps: YieldStep[]
  estimatedGas: string
}

export interface YieldStep {
  action: 'swap' | 'supply' | 'stake' | 'approve'
  protocol: string
  description: string
  token: string
  amount?: string
}

// ─── Automation ───────────────────────────────────────────────────────────────

export type AutomationTaskType = 'price_alert' | 'auto_swap' | 'scheduled_transfer' | 'whale_alert'
export type AutomationTaskStatus = 'active' | 'paused' | 'triggered' | 'completed' | 'cancelled'

export interface AutomationTask {
  taskId: string
  type: AutomationTaskType
  status: AutomationTaskStatus
  conditions: Record<string, unknown>
  actions: AutomationAction[]
  createdAt: number
  triggeredAt?: number
  triggerCount: number
}

export interface AutomationAction {
  type: 'send_payment' | 'swap' | 'notify'
  params: Record<string, unknown>
}

// ─── Identity (8004) ─────────────────────────────────────────────────────────

export interface AgentIdentity {
  agentId: string
  agentName: string
  ownerAddress: string
  capabilities: string[]
  trustScore: number
  totalTransactions: number
  successRate: number
  registeredAt: number
  identityTxHash: string
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────

export type WsEventType =
  | 'transaction'
  | 'balance_update'
  | 'automation_trigger'
  | 'whale_alert'
  | 'payment_confirmed'
  | 'agent_tool_call'
  | 'connected'

export interface WsEvent<T = unknown> {
  type: WsEventType
  data: T
  timestamp: number
}
