/**
 * TronClaw Demo Agent — CLI
 * A standalone agent that connects to TronClaw Gateway via REST API
 * Demonstrates: User NL → Gemini tool_use → TronClaw Tools → TRON
 *
 * Usage: node demo-agent.mjs
 * Requirements: GEMINI_API_KEY env var set
 */

import readline from 'readline'

const GATEWAY = process.env.TRONCLAW_GATEWAY ?? 'http://localhost:3000'
const GEMINI_KEY = process.env.GEMINI_API_KEY
const WALLET = process.env.TRON_WALLET ?? 'TFp3Ls4mHdzysbX1qxbwXdMzS8mkvhCMx6'

if (!GEMINI_KEY) {
  console.error('❌ Missing GEMINI_API_KEY environment variable')
  process.exit(1)
}

// ─── Call TronClaw Gateway ────────────────────────────────────────────────────

async function callTronClaw(path, method = 'GET', body = null) {
  const res = await fetch(`${GATEWAY}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

// ─── Tool executor via TronClaw REST API ─────────────────────────────────────

async function executeTool(name, input) {
  switch (name) {
    case 'tron_check_balance':
      return callTronClaw(`/api/v1/payment/balance?address=${input.address}&token=${input.token ?? 'USDT'}`)
    case 'tron_create_payment_request':
      return callTronClaw('/api/v1/payment/request', 'POST', input)
    case 'tron_send_payment':
      return callTronClaw('/api/v1/payment/send', 'POST', input)
    case 'tron_whale_tracker':
      return callTronClaw(`/api/v1/data/whales?token=${input.token ?? 'USDT'}&hours=${input.hours ?? 24}`)
    case 'tron_analyze_address':
      return callTronClaw(`/api/v1/data/address/${input.address}`)
    case 'tron_tx_history':
      return callTronClaw(`/api/v1/data/transactions/${input.address}?limit=${input.limit ?? 10}`)
    case 'tron_defi_yields':
      return callTronClaw(`/api/v1/defi/yields?protocol=${input.protocol ?? 'all'}`)
    case 'tron_swap':
      return callTronClaw('/api/v1/defi/swap', 'POST', input)
    case 'tron_yield_optimize':
      return callTronClaw('/api/v1/defi/optimize', 'POST', input)
    case 'tron_auto_trade':
      return callTronClaw('/api/v1/automation/trade', 'POST', input)
    case 'tron_batch_transfer':
      return callTronClaw('/api/v1/automation/batch-transfer', 'POST', input)
    case 'tron_register_agent_identity':
      return callTronClaw('/api/v1/identity/register', 'POST', input)
    case 'tron_agent_reputation':
      return callTronClaw(`/api/v1/identity/reputation/${input.agentId}`)
    default:
      return { error: `Unknown tool: ${name}` }
  }
}

// ─── Tool definitions for Gemini ─────────────────────────────────────────────

const TOOLS = [{
  functionDeclarations: [
    { name: 'tron_check_balance', description: 'Check TRX, USDT, or USDD balance for a TRON address', parameters: { type: 'OBJECT', properties: { address: { type: 'STRING', description: 'TRON wallet address' }, token: { type: 'STRING', description: 'TRX, USDT, or USDD' } }, required: ['address'] } },
    { name: 'tron_create_payment_request', description: 'Create an x402 payment request URL for collecting USDT/USDD', parameters: { type: 'OBJECT', properties: { amount: { type: 'STRING' }, token: { type: 'STRING', description: 'USDT or USDD' }, description: { type: 'STRING' } }, required: ['amount', 'token', 'description'] } },
    { name: 'tron_send_payment', description: 'Send USDT or USDD to a TRON address', parameters: { type: 'OBJECT', properties: { to: { type: 'STRING' }, amount: { type: 'STRING' }, token: { type: 'STRING' }, memo: { type: 'STRING' } }, required: ['to', 'amount', 'token'] } },
    { name: 'tron_whale_tracker', description: 'Track large USDT/USDD transfers on TRON in the last N hours', parameters: { type: 'OBJECT', properties: { token: { type: 'STRING', description: 'USDT or USDD' }, hours: { type: 'NUMBER' } } } },
    { name: 'tron_analyze_address', description: 'Analyze a TRON address: TRX balance, token holdings, tx count', parameters: { type: 'OBJECT', properties: { address: { type: 'STRING' } }, required: ['address'] } },
    { name: 'tron_defi_yields', description: 'Get current DeFi yield rates on TRON (SunSwap, JustLend)', parameters: { type: 'OBJECT', properties: { protocol: { type: 'STRING', description: 'sunswap, justlend, or all' } } } },
    { name: 'tron_yield_optimize', description: 'AI yield optimization: recommend best DeFi strategy for portfolio', parameters: { type: 'OBJECT', properties: { portfolio: { type: 'ARRAY', items: { type: 'OBJECT', properties: { token: { type: 'STRING' }, amount: { type: 'STRING' } } } }, riskPreference: { type: 'STRING', description: 'low, medium, or high' } }, required: ['portfolio'] } },
    { name: 'tron_auto_trade', description: 'Create a price-triggered automated trade task', parameters: { type: 'OBJECT', properties: { tokenPair: { type: 'STRING', description: 'e.g. TRX/USDT' }, triggerPrice: { type: 'STRING' }, action: { type: 'STRING', description: 'buy or sell' }, amount: { type: 'STRING' } }, required: ['tokenPair', 'triggerPrice', 'action', 'amount'] } },
    { name: 'tron_register_agent_identity', description: 'Register an AI Agent on-chain identity using 8004 protocol', parameters: { type: 'OBJECT', properties: { agentName: { type: 'STRING' }, capabilities: { type: 'ARRAY', items: { type: 'STRING' } }, ownerAddress: { type: 'STRING' } }, required: ['agentName', 'capabilities', 'ownerAddress'] } },
  ],
}]

// ─── Gemini agentic loop ──────────────────────────────────────────────────────

async function chat(userMessage, history) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(GEMINI_KEY)
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',
    systemInstruction: `You are TronClaw Agent — an AI with full TRON blockchain capabilities via TronClaw Gateway.
User wallet: ${WALLET} | Network: Nile testnet
Available tools: balance check, payments (x402), DeFi yields & swap, whale tracking, automation, on-chain identity (8004).
Always use tools to answer TRON questions. Respond in the user's language. Be concise but complete.`,
    tools: TOOLS,
  })

  const geminiHistory = history.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const chatSession = model.startChat({ history: geminiHistory })
  let result = await chatSession.sendMessage(userMessage)
  const toolCallLog = []

  while (true) {
    const parts = result.response.candidates?.[0]?.content?.parts ?? []
    const fnCalls = parts.filter(p => p.functionCall)
    if (fnCalls.length === 0) break

    const toolResponses = []
    for (const part of fnCalls) {
      const fn = part.functionCall
      process.stdout.write(`  \x1b[33m⚡ Calling ${fn.name}...\x1b[0m `)
      const toolResult = await executeTool(fn.name, fn.args)
      process.stdout.write(`\x1b[32m✓\x1b[0m\n`)
      toolCallLog.push({ tool: fn.name, input: fn.args, result: toolResult?.data ?? toolResult })
      toolResponses.push({ functionResponse: { name: fn.name, response: { result: toolResult } } })
    }
    result = await chatSession.sendMessage(toolResponses)
  }

  return { text: result.response.text(), toolCalls: toolCallLog }
}

// ─── CLI REPL ─────────────────────────────────────────────────────────────────

async function main() {
  // Check gateway health
  try {
    const health = await callTronClaw('/health')
    console.log(`\x1b[32m🦀 TronClaw Agent\x1b[0m`)
    console.log(`   Gateway: \x1b[36m${GATEWAY}\x1b[0m`)
    console.log(`   Network: \x1b[33m${health.data?.network ?? 'unknown'}\x1b[0m`)
    console.log(`   Mock:    \x1b[33m${health.data?.mock ? 'ON' : 'OFF'}\x1b[0m`)
    console.log(`   Wallet:  \x1b[36m${WALLET}\x1b[0m`)
    console.log(`\n\x1b[90mType your question or command. Ctrl+C to exit.\x1b[0m\n`)
  } catch {
    console.error(`❌ Cannot reach TronClaw Gateway at ${GATEWAY}`)
    console.error(`   Make sure to run: cd packages/gateway && node_modules/.bin/tsx src/index.ts`)
    process.exit(1)
  }

  const history = []
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  const prompt = () => {
    rl.question('\x1b[36mYou:\x1b[0m ', async (input) => {
      const msg = input.trim()
      if (!msg) return prompt()
      if (msg === 'exit' || msg === 'quit') { rl.close(); return }

      try {
        process.stdout.write('\n')
        const { text, toolCalls } = await chat(msg, history)
        history.push({ role: 'user', content: msg })
        history.push({ role: 'assistant', content: text })

        console.log(`\x1b[32mTronClaw:\x1b[0m ${text}`)
        if (toolCalls.length > 0) {
          console.log(`\x1b[90m[${toolCalls.length} tool call(s): ${toolCalls.map(t => t.tool).join(', ')}]\x1b[0m`)
        }
        console.log()
      } catch (e) {
        console.error(`\x1b[31m❌ Error: ${e.message}\x1b[0m\n`)
      }
      prompt()
    })
  }

  prompt()
}

main()
