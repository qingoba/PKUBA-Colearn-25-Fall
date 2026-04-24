import { getTronWeb, getNetwork } from './client.js'
import { TOKEN_CONTRACTS, TOKEN_DECIMALS, type TokenSymbol } from '@tronclaw/shared'

// Minimal TRC20 ABI for balance + transfer
const TRC20_ABI = [
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'Function',
  },
  {
    constant: false,
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'Function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'Function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'Function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'Function',
  },
]

/**
 * Get TRX balance for an address (in TRX, not SUN)
 */
export async function getTrxBalance(address: string): Promise<string> {
  const tw = getTronWeb()
  const sunBalance = await tw.trx.getBalance(address)
  // Convert SUN → TRX (1 TRX = 1,000,000 SUN)
  return (Number(sunBalance) / 1_000_000).toFixed(6)
}

/**
 * Get TRC20 token balance for an address
 */
export async function getTrc20Balance(
  address: string,
  token: TokenSymbol,
): Promise<string> {
  const tw = getTronWeb()
  const network = getNetwork()
  const contractAddress = TOKEN_CONTRACTS[network][token]
  const decimals = TOKEN_DECIMALS[token]

  const contract = await tw.contract(TRC20_ABI, contractAddress)
  const rawBalance = await contract.balanceOf(address).call()

  const balance = Number(BigInt(rawBalance.toString())) / Math.pow(10, decimals)
  return balance.toFixed(decimals)
}

/**
 * Transfer TRC20 tokens to an address
 */
export async function transferTrc20(
  to: string,
  amount: string,
  token: TokenSymbol,
): Promise<string> {
  const tw = getTronWeb()
  const network = getNetwork()
  const contractAddress = TOKEN_CONTRACTS[network][token]
  const decimals = TOKEN_DECIMALS[token]

  // Ensure defaultAddress is set — TronWeb .send() needs hex address internally
  const fromBase58 = tw.defaultAddress.base58 as string | false
  const fromHex = tw.defaultAddress.hex as string | false
  if (!fromBase58 || !fromHex) {
    throw new Error('[TronWeb] Wallet address not initialized — check TRON_PRIVATE_KEY')
  }

  const rawAmount = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)))

  const contract = await tw.contract(TRC20_ABI, contractAddress)
  const tx = await contract.transfer(to, rawAmount.toString()).send({
    feeLimit: 40_000_000, // 40 TRX fee limit
    shouldPollResponse: false,
    from: fromBase58, // explicitly provide sender to avoid TronWeb internal undefined.toLowerCase()
  })

  return tx as string
}

/**
 * Get token contract address for given symbol and current network
 */
export function getTokenContractAddress(token: TokenSymbol): string {
  const network = getNetwork()
  return TOKEN_CONTRACTS[network][token]
}

/**
 * Get contract instance for any TRC20
 */
export async function getTrc20Contract(contractAddress: string) {
  const tw = getTronWeb()
  return tw.contract(TRC20_ABI, contractAddress)
}
