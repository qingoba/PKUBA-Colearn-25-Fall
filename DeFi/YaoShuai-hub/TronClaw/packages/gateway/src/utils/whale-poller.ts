/**
 * Whale Poller — periodically fetches large transfers and broadcasts via WebSocket
 */
import { getWhaleTransfers } from '../modules/data/index.js'
import { broadcast } from '../ws/index.js'

const seen = new Set<string>()

async function poll(token: 'USDT' | 'USDD', limit: number) {
  try {
    const whales = await getWhaleTransfers(token, 24, limit)
    for (const w of whales) {
      if (!seen.has(w.hash)) {
        seen.add(w.hash)
        broadcast('whale_alert', w)
      }
    }
    // Keep set manageable — trim to last 200 when it grows too large
    if (seen.size > 500) {
      const arr = [...seen]
      seen.clear()
      arr.slice(-200).forEach(h => seen.add(h))
    }
  } catch (e) {
    console.warn(`[WhalePoll] ${token} poll error:`, (e as Error).message)
  }
}

export function startWhalePolling() {
  const network = process.env.TRON_NETWORK ?? 'nile'
  console.log('[WhalePoll] Starting whale polling (USDT every 30s)...')
  // Only poll USDT on Nile testnet (USDD contract doesn't exist on Nile)
  setInterval(() => poll('USDT', 15), 30_000)
  if (network !== 'nile') {
    setInterval(() => poll('USDD', 5), 47_000)
  }
}
