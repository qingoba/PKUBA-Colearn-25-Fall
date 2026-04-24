/**
 * Phase 1 validation script — verify TronWeb connects to Nile testnet
 * Usage: TRON_PRIVATE_KEY=xxx TRON_NETWORK=nile node --import tsx/esm scripts/verify-tron.ts
 */
import 'dotenv/config'
import { getTronWeb, getNetwork } from '../src/tron/client.js'
import { getWalletAddress, isValidAddress } from '../src/tron/wallet.js'
import { getTrxBalance, getTrc20Balance } from '../src/tron/contracts.js'

async function main() {
  console.log('\n🦀 TronClaw — Phase 1 Verification\n')

  // 1. Connect
  const tw = getTronWeb()
  const network = getNetwork()
  console.log(`✅ Network: ${network}`)

  // 2. Wallet address
  const { address } = getWalletAddress()
  console.log(`✅ Wallet address: ${address}`)

  // 3. Address validation
  const valid = isValidAddress(address)
  console.log(`✅ Address valid: ${valid}`)

  // 4. TRX balance
  try {
    const trxBalance = await getTrxBalance(address)
    console.log(`✅ TRX balance: ${trxBalance} TRX`)
  } catch (e) {
    console.error(`❌ TRX balance error:`, e)
  }

  // 5. USDT balance (Nile testnet)
  try {
    const usdtBalance = await getTrc20Balance(address, 'USDT')
    console.log(`✅ USDT balance: ${usdtBalance} USDT`)
  } catch (e) {
    console.log(`⚠️  USDT balance (may fail on testnet if contract differs):`, (e as Error).message)
  }

  console.log('\n✅ Phase 1 verification complete!\n')
}

main().catch(console.error)
