import 'dotenv/config'
import { setupProxy } from './utils/proxy.js'
import { createServer } from './server.js'
import { startWhalePolling } from './utils/whale-poller.js'

const PORT = parseInt(process.env.PORT ?? '3000', 10)

async function main() {
  // Setup proxy before any HTTP calls
  await setupProxy()

  const server = createServer()

  server.listen(PORT, () => {
    console.log(`🦀 TronClaw Gateway running on http://localhost:${PORT}`)
    console.log(`   Network: ${process.env.TRON_NETWORK ?? 'nile'}`)
    console.log(`   Mock mode: ${process.env.MOCK_TRON === 'true' ? 'ON' : 'OFF'}`)
    console.log(`   LLM: ${process.env.LLM_PROVIDER ?? 'gemini'}`)
    if (process.env.HTTPS_PROXY || process.env.HTTP_PROXY) {
      console.log(`   Proxy: ${process.env.HTTPS_PROXY || process.env.HTTP_PROXY}`)
    }
    startWhalePolling()
  })
}

main().catch(console.error)
