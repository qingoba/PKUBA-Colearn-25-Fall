// Token contract addresses for TRON networks

import type { TronNetwork, TokenSymbol } from '../types/index.js'

export const TOKEN_CONTRACTS: Record<TronNetwork, Record<TokenSymbol, string>> = {
  nile: {
    // Nile testnet addresses
    TRX: 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb', // native, placeholder
    USDT: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf', // Nile USDT (may vary)
    USDD: 'TGjgkFPfBhMkXdB2E8bBHRQLQ11Z4BBgKu', // Nile USDD (may vary)
  },
  shasta: {
    TRX: 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
    USDT: 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs',
    USDD: 'TGjgkFPfBhMkXdB2E8bBHRQLQ11Z4BBgKu',
  },
  mainnet: {
    TRX: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR', // native TRX wrapper
    USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // mainnet USDT (official)
    USDD: 'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn', // mainnet USDD (official)
  },
}

export const TRON_ENDPOINTS: Record<TronNetwork, { fullNode: string; solidityNode: string; eventServer: string }> = {
  nile: {
    fullNode: 'https://nile.trongrid.io',
    solidityNode: 'https://nile.trongrid.io',
    eventServer: 'https://nile.trongrid.io',
  },
  shasta: {
    fullNode: 'https://api.shasta.trongrid.io',
    solidityNode: 'https://api.shasta.trongrid.io',
    eventServer: 'https://api.shasta.trongrid.io',
  },
  mainnet: {
    fullNode: 'https://api.trongrid.io',
    solidityNode: 'https://api.trongrid.io',
    eventServer: 'https://api.trongrid.io',
  },
}

export const TRONGRID_BASE: Record<TronNetwork, string> = {
  nile: 'https://nile.trongrid.io',
  shasta: 'https://api.shasta.trongrid.io',
  mainnet: 'https://api.trongrid.io',
}

// Minimum whale transfer threshold (in token units)
export const WHALE_THRESHOLD: Record<TokenSymbol, string> = {
  TRX: '1000000',   // 1M TRX
  USDT: '100000',   // 100K USDT
  USDD: '100000',   // 100K USDD
}

export const TOKEN_DECIMALS: Record<TokenSymbol, number> = {
  TRX: 6,
  USDT: 6,
  USDD: 18,
}
