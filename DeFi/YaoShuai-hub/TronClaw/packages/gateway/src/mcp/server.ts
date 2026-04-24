/**
 * MCP Tool Provider — calls TronClaw Gateway REST API
 * All tool calls go through HTTP → triggers WebSocket broadcast → visible in Dashboard
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const GATEWAY = process.env.TRONCLAW_GATEWAY ?? 'http://localhost:3000'

// ─── HTTP client calling gateway REST API ────────────────────────────────────

async function callGateway(path: string, method = 'GET', body?: unknown): Promise<unknown> {
  const res = await fetch(`${GATEWAY}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json() as { success: boolean; data: unknown; error: string }
  if (!json.success) throw new Error(json.error)
  return json.data
}

// ─── MCP Server ───────────────────────────────────────────────────────────────

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: 'TronClaw', version: '1.0.0' })

  // ── Payment Tools ─────────────────────────────────────────────────────────

  server.tool('tron_check_balance',
    'Check TRX, USDT, or USDD balance for a TRON address',
    { address: z.string().describe('TRON wallet address (base58)'), token: z.enum(['TRX', 'USDT', 'USDD']).optional().default('USDT') },
    async ({ address, token }) => ({
      content: [{ type: 'text', text: JSON.stringify(await callGateway(`/api/v1/payment/balance?address=${address}&token=${token}`), null, 2) }],
    }),
  )

  server.tool('tron_send_payment',
    'Send USDT or USDD to a TRON address using x402 protocol',
    { to: z.string(), amount: z.string(), token: z.enum(['USDT', 'USDD']), memo: z.string().optional() },
    async (params) => ({
      content: [{ type: 'text', text: JSON.stringify(await callGateway('/api/v1/payment/send', 'POST', params), null, 2) }],
    }),
  )

  server.tool('tron_create_payment_request',
    'Create an x402 payment request URL for collecting USDT/USDD',
    { amount: z.string(), token: z.enum(['USDT', 'USDD']), description: z.string() },
    async (params) => ({
      content: [{ type: 'text', text: JSON.stringify(await callGateway('/api/v1/payment/request', 'POST', params), null, 2) }],
    }),
  )

  server.tool('tron_payment_status',
    'Check the status of a payment request',
    { payId: z.string() },
    async ({ payId }) => ({
      content: [{ type: 'text', text: JSON.stringify(await callGateway(`/api/v1/payment/status/${payId}`), null, 2) }],
    }),
  )

  // ── On-chain Data Tools ───────────────────────────────────────────────────

  server.tool('tron_analyze_address',
    'Analyze a TRON address: balances, token holdings, tx count, tags',
    { address: z.string() },
    async ({ address }) => ({
      content: [{ type: 'text', text: JSON.stringify(await callGateway(`/api/v1/data/address/${address}`), null, 2) }],
    }),
  )

  server.tool('tron_tx_history',
    'Get TRC20 transaction history for a TRON address',
    { address: z.string(), limit: z.number().optional().default(20) },
    async ({ address, limit }) => ({
      content: [{ type: 'text', text: JSON.stringify(await callGateway(`/api/v1/data/transactions/${address}?limit=${limit}`), null, 2) }],
    }),
  )

  server.tool('tron_whale_tracker',
    'Track large USDT/USDD/TRX transfers on TRON',
    { token: z.enum(['TRX', 'USDT', 'USDD']).optional().default('USDT'), minAmount: z.string().optional(), hours: z.number().optional().default(24) },
    async ({ token, minAmount, hours }) => {
      const qs = new URLSearchParams({ token, hours: String(hours) })
      if (minAmount) qs.set('minAmount', minAmount)
      return { content: [{ type: 'text', text: JSON.stringify(await callGateway(`/api/v1/data/whales?${qs}`), null, 2) }] }
    },
  )

  server.tool('tron_token_info',
    'Get information about a TRC20 token',
    { tokenAddress: z.string() },
    async ({ tokenAddress }) => ({
      content: [{ type: 'text', text: JSON.stringify(await callGateway(`/api/v1/data/token/${tokenAddress}`), null, 2) }],
    }),
  )

  // ── DeFi Tools ────────────────────────────────────────────────────────────

  server.tool('tron_defi_yields',
    'Query current DeFi yield rates on TRON (SunSwap, JustLend)',
    { protocol: z.enum(['sunswap', 'justlend', 'all']).optional().default('all') },
    async ({ protocol }) => ({
      content: [{ type: 'text', text: JSON.stringify(await callGateway(`/api/v1/defi/yields?protocol=${protocol}`), null, 2) }],
    }),
  )

  server.tool('tron_swap',
    'Swap tokens on SunSwap DEX',
    { fromToken: z.string(), toToken: z.string(), amount: z.string(), slippage: z.number().optional().default(0.5) },
    async (params) => ({
      content: [{ type: 'text', text: JSON.stringify(await callGateway('/api/v1/defi/swap', 'POST', params), null, 2) }],
    }),
  )

  server.tool('tron_yield_optimize',
    'Get AI-powered DeFi yield optimization strategy for your portfolio',
    { portfolio: z.array(z.object({ token: z.string(), amount: z.string() })), riskPreference: z.enum(['low', 'medium', 'high']).default('medium') },
    async (params) => ({
      content: [{ type: 'text', text: JSON.stringify(await callGateway('/api/v1/defi/optimize', 'POST', params), null, 2) }],
    }),
  )

  // ── Automation Tools ──────────────────────────────────────────────────────

  server.tool('tron_auto_trade',
    'Set up an automated trade triggered by price conditions',
    { tokenPair: z.string(), triggerPrice: z.string(), action: z.enum(['buy', 'sell']), amount: z.string() },
    async (params) => ({
      content: [{ type: 'text', text: JSON.stringify(await callGateway('/api/v1/automation/trade', 'POST', params), null, 2) }],
    }),
  )

  server.tool('tron_batch_transfer',
    'Send tokens to multiple addresses in one operation',
    { transfers: z.array(z.object({ to: z.string(), amount: z.string(), token: z.enum(['USDT', 'USDD', 'TRX']) })) },
    async (params) => ({
      content: [{ type: 'text', text: JSON.stringify(await callGateway('/api/v1/automation/batch-transfer', 'POST', params), null, 2) }],
    }),
  )

  // ── Identity Tools ────────────────────────────────────────────────────────

  server.tool('tron_register_agent_identity',
    'Register an AI Agent on-chain identity using 8004 protocol',
    { agentName: z.string(), capabilities: z.array(z.string()), ownerAddress: z.string() },
    async (params) => ({
      content: [{ type: 'text', text: JSON.stringify(await callGateway('/api/v1/identity/register', 'POST', params), null, 2) }],
    }),
  )

  server.tool('tron_agent_reputation',
    'Query on-chain reputation and trust score for an AI Agent',
    { agentId: z.string() },
    async ({ agentId }) => ({
      content: [{ type: 'text', text: JSON.stringify(await callGateway(`/api/v1/identity/reputation/${agentId}`), null, 2) }],
    }),
  )

  return server
}

export async function startMcpStdio() {
  const server = createMcpServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error(`[MCP] TronClaw MCP server running → ${GATEWAY}`)
}
