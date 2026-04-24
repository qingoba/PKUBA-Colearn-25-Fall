import { TronWeb } from 'tronweb'
import { getTronWeb } from './client.js'

export interface WalletInfo {
  address: string
  hexAddress: string
}

/**
 * Get the wallet address from the configured private key
 */
export function getWalletAddress(): WalletInfo {
  const tw = getTronWeb()
  const address = tw.defaultAddress.base58 as string
  const hexAddress = tw.defaultAddress.hex as string

  if (!address) {
    throw new Error('No wallet address — check TRON_PRIVATE_KEY')
  }

  return { address, hexAddress }
}

/**
 * Validate a TRON address (base58)
 */
export function isValidAddress(address: string): boolean {
  return TronWeb.isAddress(address)
}

/**
 * Convert hex address to base58
 */
export function hexToBase58(hexAddress: string): string {
  return TronWeb.address.fromHex(hexAddress)
}

/**
 * Convert base58 address to hex
 */
export function base58ToHex(address: string): string {
  return TronWeb.address.toHex(address)
}
