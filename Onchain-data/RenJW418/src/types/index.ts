// ────────────────────────────────────────────────────────────
// TronSage — Shared TypeScript types
// ────────────────────────────────────────────────────────────

// ── TRON Network ──────────────────────────────────────────────

export interface TronNetworkStats {
  trxPrice: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  tps: number;
  blockHeight: number;
  totalAccounts: number;
  burnedTrx: number;
  totalTransactions: number;
  energyUsed24h: number;
}

// ── Whale Tracker ─────────────────────────────────────────────

export type WhaleTokenType = "USDT" | "USDD" | "TRX" | "BTT" | "JST" | "OTHER";

export interface WhaleTransaction {
  hash: string;
  from: string;
  to: string;
  amount: number;
  amountUSD: number;
  tokenSymbol: WhaleTokenType;
  tokenName: string;
  contractAddress: string;
  timestamp: number;
  blockNumber: number;
  confirmed: boolean;
  isExchange: boolean;
}

// ── Portfolio ─────────────────────────────────────────────────

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  priceUsd: number;
  change24h: number;
  contractAddress?: string;
  logo?: string;
}

export interface WalletPortfolio {
  address: string;
  totalValueUsd: number;
  trxBalance: number;
  trxValueUsd: number;
  tokens: TokenBalance[];
  change24h: number;
  lastActivity: number;
  accountType: "user" | "exchange" | "contract" | "whale";
  transactionCount: number;
}

// ── DeFi ──────────────────────────────────────────────────────

export type DeFiCategory = "DEX" | "Lending" | "Staking" | "Yield";
export type RiskLevel = "Low" | "Medium" | "High";

export interface DeFiOpportunity {
  id: string;
  protocol: string;
  pair: string;
  category: DeFiCategory;
  apy: number;
  apyBase: number;
  apyReward?: number;
  tvl: number;
  tvlChange24h: number;
  risk: RiskLevel;
  tokens: string[];
  url: string;
  contractAddress?: string;
  audited: boolean;
  description: string;
}

// ── Bank of AI — x402 Payment Protocol ───────────────────────

export interface X402PaymentRequest {
  /** Unique ID for this payment request */
  requestId: string;
  /** Amount in token units (e.g., "100000" for 0.1 USDT with 6 decimals) */
  amount: string;
  /** Human-readable amount, e.g., "0.1" */
  amountFormatted: string;
  /** USDT or USDD on TRON */
  token: "USDT" | "USDD";
  /** Contract address of the token */
  tokenContract: string;
  /** TRON address to send payment to */
  toAddress: string;
  /** Purpose description (shown to user) */
  memo: string;
  /** Unix timestamp when this request expires */
  expiresAt: number;
  /** Challenge nonce for replay protection */
  nonce: string;
}

export interface X402PaymentProof {
  /** TRON transaction hash */
  txHash: string;
  /** Amount transferred */
  amount: string;
  /** Token type */
  token: string;
  /** Sender's TRON address */
  from: string;
  /** Unix timestamp of payment */
  timestamp: number;
  /** Payment request ID this proof belongs to */
  requestId: string;
}

export interface X402VerifyResult {
  valid: boolean;
  txHash?: string;
  amount?: string;
  from?: string;
  error?: string;
}

// ── Bank of AI — 8004 On-chain Identity ───────────────────────

export interface AgentIdentity {
  /** 8004 protocol ID */
  id: string;
  /** On-chain TRON address */
  address: string;
  /** Display name */
  name: string;
  /** Short description */
  bio: string;
  /** Composite reputation score 0-100 */
  reputationScore: number;
  /** Agent level (1-10) */
  level: number;
  /** Badge tier */
  tier: "Bronze" | "Silver" | "Gold" | "Diamond";
  /** Total AI jobs completed */
  totalJobs: number;
  /** Percentage of successful jobs */
  successRate: number;
  /** Total USDT earned */
  totalEarned: number;
  /** UNIX timestamp of registration */
  registeredAt: number;
  /** Area specializations */
  specializations: string[];
  /** Achievement badges */
  badges: AgentBadge[];
  /** Recent activity feed */
  recentActivity: AgentActivity[];
  /** Is verified by Bank of AI */
  verified: boolean;
}

export interface AgentBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  awardedAt: number;
}

export interface AgentActivity {
  type: "analysis" | "payment_received" | "job_completed" | "reputation_update";
  description: string;
  amount?: number;
  token?: string;
  timestamp: number;
  txHash?: string;
}

// ── AI Analysis ───────────────────────────────────────────────

export interface AIAnalysisRequest {
  /** User's question or analysis request */
  query: string;
  /** Optional context */
  context?: {
    walletAddress?: string;
    portfolio?: WalletPortfolio | null;
    recentWhaleActivity?: WhaleTransaction[];
    networkStats?: TronNetworkStats | null;
  };
  /** x402 payment proof (required for real analysis) */
  paymentProof?: X402PaymentProof;
  /** Skip payment (demo mode) */
  demoMode?: boolean;
}

export interface AISignal {
  type: "bullish" | "bearish" | "neutral";
  strength: number; // 0-100
  title: string;
  reasoning: string;
}

export interface AIAnalysisResponse {
  /** Main analysis text */
  analysis: string;
  /** Directional signals */
  signals: AISignal[];
  /** Actionable recommendations */
  recommendations: string[];
  /** Overall risk level */
  riskLevel: "low" | "medium" | "high";
  /** Confidence score 0-100 */
  confidence: number;
  /** ISO timestamp */
  timestamp: string;
  /** Payment proof used */
  paidWith?: string;
  /** Demo mode indicator */
  demoMode?: boolean;
}

// ── UI Helpers ────────────────────────────────────────────────

export type TabId = "whale" | "ai" | "portfolio" | "defi" | "identity";

export interface NavTab {
  id: TabId;
  label: string;
  icon: string;
  badge?: string;
}
