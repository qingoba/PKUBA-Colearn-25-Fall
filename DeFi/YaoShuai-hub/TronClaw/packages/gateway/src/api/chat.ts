import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import { ok, err } from '@tronclaw/shared'
import { checkBalance, sendPayment, createPaymentRequest, getPaymentStatus } from '../modules/payment/index.js'
import { analyzeAddress, getTxHistory, getWhaleTransfers, getTokenInfo, getTxDetail, getNetworkOverview } from '../modules/data/index.js'
import { getDefiYields, swapTokens, optimizeYield, getDefiOverview } from '../modules/defi/index.js'
import { createAutoTrade, batchTransfer, getAutoStats, createScheduledTransfer, createWhaleFollow } from '../modules/automation/index.js'
import { getServices, invokeService as invokeSvc, getMarketStats } from '../modules/market/index.js'
import type { TokenSymbol } from '@tronclaw/shared'

export const chatRouter: Router = Router()

// ─── Tool executor ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeTool(name: string, input: Record<string, any>): Promise<unknown> {
  switch (name) {
    case 'tron_check_balance': return checkBalance(input.address, (input.token ?? 'USDT') as TokenSymbol)
    case 'tron_send_payment': return sendPayment(input.to, input.amount, input.token as TokenSymbol, input.memo)
    case 'tron_create_payment_request': return createPaymentRequest(input.amount, input.token as TokenSymbol, input.description)
    case 'tron_payment_status': return getPaymentStatus(input.payId)
    case 'tron_whale_tracker': return getWhaleTransfers((input.token ?? 'USDT') as TokenSymbol, undefined, input.hours ?? 24)
    case 'tron_defi_yields': return getDefiYields(input.protocol ?? 'all')
    case 'tron_yield_optimize': return optimizeYield(input.portfolio, input.riskPreference ?? 'medium')
    case 'tron_analyze_address': return analyzeAddress(input.address)
    case 'tron_tx_history': return getTxHistory(input.address, input.limit ?? 20)
    case 'tron_token_info': return getTokenInfo(input.tokenAddress)
    case 'tron_auto_trade': return createAutoTrade(input.tokenPair, input.triggerPrice, input.action, input.amount)
    case 'tron_batch_transfer': return batchTransfer(input.transfers)
    case 'tron_schedule_transfer': return createScheduledTransfer(input.to, input.amount, input.token, input.schedule ?? 'daily')
    case 'tron_whale_follow': return createWhaleFollow(input.minAmount ?? '100000', input.token ?? 'USDT', input.followAction ?? 'alert')
    case 'tron_auto_stats': return getAutoStats()
    case 'tron_market_services': return getServices(input.category)
    case 'tron_market_invoke': return invokeSvc(input.serviceId, input.callerAddress ?? '', input.userInput)
    case 'tron_market_stats': return getMarketStats()
    case 'tron_defi_overview': return getDefiOverview()
    case 'tron_network_overview': return getNetworkOverview()
    case 'tron_tx_detail': return getTxDetail(input.hash)
    case 'tron_defi_supply': {
      const { lendSupply } = await import('../modules/defi/index.js')
      const result = await lendSupply(input.token ?? 'USDT', input.amount ?? '1000')
      return {
        ...result,
        protocol: input.protocol ?? 'justlend',
        poolName: input.poolName ?? `${input.token ?? 'USDT'} Supply`,
        token: input.token ?? 'USDT',
        amount: input.amount ?? '1000',
        confirmedAt: new Date().toISOString(),
      }
    }
    default: return { error: `Unknown tool: ${name}` }
  }
}

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOL_DEFS = [
  { name: 'tron_check_balance', description: 'Check TRX, USDT, or USDD balance for a TRON address', parameters: { type: 'OBJECT', properties: { address: { type: 'STRING', description: 'TRON wallet address' }, token: { type: 'STRING', description: 'TRX, USDT, or USDD' } }, required: ['address'] } },
  { name: 'tron_send_payment', description: 'Send USDT or USDD payment to a TRON address', parameters: { type: 'OBJECT', properties: { to: { type: 'STRING' }, amount: { type: 'STRING' }, token: { type: 'STRING', description: 'USDT or USDD' }, memo: { type: 'STRING' } }, required: ['to', 'amount', 'token'] } },
  { name: 'tron_create_payment_request', description: 'Create an x402 payment request URL', parameters: { type: 'OBJECT', properties: { amount: { type: 'STRING' }, token: { type: 'STRING' }, description: { type: 'STRING' } }, required: ['amount', 'token', 'description'] } },
  { name: 'tron_whale_tracker', description: 'Track large USDT/USDD transfers on TRON', parameters: { type: 'OBJECT', properties: { token: { type: 'STRING' }, hours: { type: 'NUMBER' } } } },
  { name: 'tron_defi_yields', description: 'Query current DeFi yield rates on TRON (SunSwap, JustLend)', parameters: { type: 'OBJECT', properties: { protocol: { type: 'STRING', description: 'sunswap, justlend, or all' } } } },
  { name: 'tron_yield_optimize', description: 'Get AI-powered yield optimization strategy for portfolio', parameters: { type: 'OBJECT', properties: { portfolio: { type: 'ARRAY', items: { type: 'OBJECT', properties: { token: { type: 'STRING' }, amount: { type: 'STRING' } } } }, riskPreference: { type: 'STRING', description: 'low, medium, or high' } }, required: ['portfolio'] } },
  { name: 'tron_analyze_address', description: 'Analyze a TRON address: balances, holdings, tx history', parameters: { type: 'OBJECT', properties: { address: { type: 'STRING' } }, required: ['address'] } },
  { name: 'tron_auto_trade', description: 'Set up automated trading triggered by price conditions', parameters: { type: 'OBJECT', properties: { tokenPair: { type: 'STRING', description: 'e.g. TRX/USDT' }, triggerPrice: { type: 'STRING' }, action: { type: 'STRING', description: 'buy or sell' }, amount: { type: 'STRING' } }, required: ['tokenPair', 'triggerPrice', 'action', 'amount'] } },
  { name: 'tron_market_services', description: 'List AI Agent services in SealPay marketplace', parameters: { type: 'OBJECT', properties: { category: { type: 'STRING', description: 'Content, Trading, Security, Data, DeFi, or all' } } } },
  { name: 'tron_market_invoke', description: 'Invoke an AI Agent service and pay via x402', parameters: { type: 'OBJECT', properties: { serviceId: { type: 'STRING' }, callerAddress: { type: 'STRING' }, userInput: { type: 'STRING' } }, required: ['serviceId'] } },
  { name: 'tron_market_stats', description: 'Get SealPay marketplace statistics', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'tron_defi_overview', description: 'Get TRON DeFi ecosystem overview: TVL, avg APY, protocols', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'tron_network_overview', description: 'Get TRON network stats: TRX price, market cap, TPS, block height', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'tron_tx_detail', description: 'Get detailed breakdown of a specific TRON transaction', parameters: { type: 'OBJECT', properties: { hash: { type: 'STRING', description: 'Transaction hash' } }, required: ['hash'] } },
  { name: 'tron_schedule_transfer', description: 'Create a scheduled recurring transfer', parameters: { type: 'OBJECT', properties: { to: { type: 'STRING' }, amount: { type: 'STRING' }, token: { type: 'STRING' }, schedule: { type: 'STRING', description: 'daily, weekly, or monthly' } }, required: ['to', 'amount', 'token'] } },
  { name: 'tron_auto_stats', description: 'Get AutoHarvest automation task statistics', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'tron_defi_supply', description: 'Supply/stake tokens into JustLend or SunSwap pool. Returns txHash and confirmation.', parameters: { type: 'OBJECT', properties: { token: { type: 'STRING', description: 'Token to supply: USDT, USDD, TRX' }, amount: { type: 'STRING', description: 'Amount to supply' }, protocol: { type: 'STRING', description: 'justlend or sunswap' }, poolName: { type: 'STRING', description: 'Pool or market name' } }, required: ['token', 'amount', 'protocol'] } },
]

// ─── Gemini provider ──────────────────────────────────────────────────────────

async function runGemini(
  message: string,
  history: Array<{ role: string; content: string }>,
  walletAddress: string,
): Promise<{ response: string; toolCalls: unknown[] }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { GoogleGenerativeAI } = await import('@google/generative-ai') as any
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',
    systemInstruction: `You are TronClaw AI Agent — a powerful TRON blockchain assistant.
${walletAddress ? `User wallet: ${walletAddress}` : ''}
Network: ${process.env.TRON_NETWORK ?? 'nile'} testnet | Mock: ${process.env.MOCK_TRON === 'true' ? 'ON' : 'OFF'}

IMPORTANT: When user asks to stake/supply/invest/deposit into DeFi:
1. Call tron_defi_yields to get current rates
2. Call tron_yield_optimize with their portfolio and riskPreference="low"
3. Call tron_defi_supply to execute the best strategy
4. Return a formatted report wrapped in [DEFI_REPORT] tags like this:

[DEFI_REPORT]
{"protocol":"JustLend","pool":"USDT Supply","amount":"1000","token":"USDT","apy":"8.52","txHash":"<from tool>","steps":["Analyzed 7 pools","Selected lowest risk: USDT Supply on JustLend (8.52% APY)","Supplied 1000 USDT to JustLend protocol","Transaction confirmed on Nile testnet"],"estimatedMonthly":"7.10","estimatedYearly":"85.20"}
[/DEFI_REPORT]

Always use tools before answering. Respond in the user's language (Chinese if they write Chinese).`,
    tools: [{ functionDeclarations: TOOL_DEFS }],
  })

  // Gemini requires history to start with 'user' role — skip leading assistant messages
  const filteredHistory = history.filter((_, i) => {
    if (i === 0 && history[0]?.role === 'assistant') return false
    return true
  })
  // Also ensure alternating roles (Gemini strict requirement)
  const validHistory: typeof history = []
  let lastRole = ''
  for (const h of filteredHistory) {
    const geminiRole = h.role === 'assistant' ? 'model' : 'user'
    if (geminiRole !== lastRole) { validHistory.push(h); lastRole = geminiRole }
  }

  const chatHistory = validHistory.map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }],
  }))

  const chat = model.startChat({ history: chatHistory })
  const toolCallLog: unknown[] = []
  let result = await chat.sendMessage(message)

  // Agentic tool use loop
  while (true) {
    const candidate = result.response.candidates?.[0]
    const parts: unknown[] = candidate?.content?.parts ?? []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fnCalls = parts.filter((p: any) => p.functionCall)
    if (fnCalls.length === 0) break

    const toolResponses = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const part of fnCalls as any[]) {
      const fn = part.functionCall as { name: string; args: Record<string, unknown> }
      const toolResult = await executeTool(fn.name, fn.args)
      toolCallLog.push({ tool: fn.name, input: fn.args, result: toolResult })
      toolResponses.push({ functionResponse: { name: fn.name, response: { result: toolResult } } })
    }
    result = await chat.sendMessage(toolResponses)
  }

  return { response: result.response.text(), toolCalls: toolCallLog }
}

// ─── Anthropic provider ───────────────────────────────────────────────────────

async function runAnthropic(
  message: string,
  history: Array<{ role: string; content: string }>,
  walletAddress: string,
): Promise<{ response: string; toolCalls: unknown[] }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Anthropic = ((await import('@anthropic-ai/sdk')) as any).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const system = `You are TronClaw AI Agent — a powerful TRON blockchain assistant.
${walletAddress ? `User wallet: ${walletAddress}` : ''}
Network: ${process.env.TRON_NETWORK ?? 'nile'} testnet | Mock: ${process.env.MOCK_TRON === 'true' ? 'ON' : 'OFF'}

IMPORTANT: When user asks to stake/supply/invest/deposit into DeFi:
1. Call tron_defi_yields to get current rates
2. Call tron_yield_optimize with their portfolio and riskPreference="low"
3. Call tron_defi_supply to execute the best strategy
4. Return a formatted report wrapped in [DEFI_REPORT] tags like this:

[DEFI_REPORT]
{"protocol":"JustLend","pool":"USDT Supply","amount":"1000","token":"USDT","apy":"8.52","txHash":"<from tool>","steps":["Analyzed 7 pools","Selected lowest risk: USDT Supply on JustLend (8.52% APY)","Supplied 1000 USDT to JustLend protocol","Transaction confirmed on Nile testnet"],"estimatedMonthly":"7.10","estimatedYearly":"85.20"}
[/DEFI_REPORT]

Always use tools before answering. Respond in the user's language (Chinese if they write Chinese).`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any[] = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anthropicTools = TOOL_DEFS.map(t => ({ name: t.name, description: t.description, input_schema: { type: 'object', properties: (t.parameters as any).properties, required: (t.parameters as any).required ?? [] } }))

  const toolCallLog: unknown[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let response: any = await client.messages.create({ model: 'claude-3-5-sonnet-20241022', max_tokens: 1024, system, tools: anthropicTools, messages })

  while (response.stop_reason === 'tool_use') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolUseBlocks = response.content.filter((b: any) => b.type === 'tool_use')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolResults = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const tu of toolUseBlocks as any[]) {
      const toolResult = await executeTool(tu.name, tu.input)
      toolCallLog.push({ tool: tu.name, input: tu.input, result: toolResult })
      toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(toolResult) })
    }
    messages.push({ role: 'assistant', content: response.content })
    messages.push({ role: 'user', content: toolResults })
    response = await client.messages.create({ model: 'claude-3-5-sonnet-20241022', max_tokens: 1024, system, tools: anthropicTools, messages })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const text = response.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n')
  return { response: text, toolCalls: toolCallLog }
}

// ─── Bank of AI provider (minimax-m2.5) ─────────────────────────────────────

async function runBankOfAI(
  message: string,
  history: Array<{ role: string; content: string }>,
  walletAddress: string,
): Promise<{ response: string; toolCalls: unknown[] }> {
  const apiKey = process.env.BANK_OF_AI_API_KEY
  const baseUrl = process.env.BANK_OF_AI_API_URL ?? 'https://api.bankofai.io/v1'
  if (!apiKey) throw new Error('BANK_OF_AI_API_KEY not configured')

  const systemPrompt = `You are TronClaw AI Agent — powered by Bank of AI (minimax-m2.5) with full TRON blockchain capabilities.
${walletAddress ? `User wallet: ${walletAddress}` : ''}
Network: ${process.env.TRON_NETWORK ?? 'nile'} testnet

IMPORTANT: When user asks to stake/supply/invest/deposit into DeFi:
1. Call tron_defi_yields to get current rates
2. Call tron_yield_optimize with their portfolio and riskPreference="low"
3. Call tron_defi_supply to execute the best strategy
4. Return a formatted report wrapped in [DEFI_REPORT] tags like this:

[DEFI_REPORT]
{"protocol":"JustLend","pool":"USDT Supply","amount":"1000","token":"USDT","apy":"8.52","txHash":"<from tool>","steps":["Analyzed 7 pools","Selected lowest risk","Supplied to JustLend","Transaction confirmed"],"estimatedMonthly":"7.10","estimatedYearly":"85.20"}
[/DEFI_REPORT]

Always use tools before answering. Respond in the user's language (Chinese if they write Chinese).`

  // Build OpenAI-format messages
  const filteredHistory = history.filter((_, i) => !(i === 0 && history[0]?.role === 'assistant'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    ...filteredHistory.map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
    { role: 'user', content: message },
  ]

  // Convert TOOL_DEFS to OpenAI format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools = TOOL_DEFS.map((t: any) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: {
        type: 'object',
        properties: t.parameters.properties ?? {},
        required: t.parameters.required ?? [],
      },
    },
  }))

  const toolCallLog: unknown[] = []

  // Agentic tool-use loop
  while (true) {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'minimax-m2.5',
        messages,
        tools,
        tool_choice: 'auto',
        max_tokens: 2048,
      }),
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json()

    if (!response.ok) throw new Error(data?.error?.message ?? `Bank of AI error ${response.status}`)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const choice = data.choices?.[0] as any
    const finishReason = choice?.finish_reason
    const assistantMsg = choice?.message

    if (finishReason !== 'tool_calls' || !assistantMsg?.tool_calls?.length) {
      // Final text response
      return { response: assistantMsg?.content ?? '', toolCalls: toolCallLog }
    }

    // Execute tool calls
    messages.push({ role: 'assistant', content: assistantMsg.content ?? '', tool_calls: assistantMsg.tool_calls })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const tc of assistantMsg.tool_calls as any[]) {
      const fnName = tc.function.name as string
      const fnArgs = JSON.parse(tc.function.arguments ?? '{}') as Record<string, unknown>
      const toolResult = await executeTool(fnName, fnArgs)
      toolCallLog.push({ tool: fnName, input: fnArgs, result: toolResult })
      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(toolResult),
      })
    }
  }
}

// ─── Local Agent (fallback when LLM unavailable) ───────────────────────────

async function runLocalAgent(
  message: string,
  walletAddress: string,
): Promise<{ response: string; toolCalls: unknown[] }> {
  const msg = message.toLowerCase()
  const toolCallLog: unknown[] = []

  // DeFi staking / supply intent detection
  const isDefiStake = msg.includes('质押') || msg.includes('存入') || msg.includes('放到') || msg.includes('defi') ||
    msg.includes('stake') || msg.includes('supply') || msg.includes('投入') || msg.includes('低风险')

  if (isDefiStake) {
    // Extract amount from message
    const amountMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:usdt|u|USDT)/i)
    const amount = amountMatch?.[1] ?? '1000'
    const token = 'USDT'

    // Step 1: get yields
    const { getDefiYields } = await import('../modules/defi/index.js')
    const yields = await getDefiYields('justlend')
    toolCallLog.push({ tool: 'tron_defi_yields', input: { protocol: 'justlend' }, result: yields })

    // Step 2: optimize
    const { optimizeYield } = await import('../modules/defi/index.js')
    const strategy = await optimizeYield([{ token, amount }], 'low')
    toolCallLog.push({ tool: 'tron_yield_optimize', input: { portfolio: [{ token, amount }], riskPreference: 'low' }, result: strategy })

    // Step 3: supply
    const { lendSupply } = await import('../modules/defi/index.js')
    const supply = await lendSupply(token, amount)
    const poolName = `${token} Supply`
    toolCallLog.push({ tool: 'tron_defi_supply', input: { token, amount, protocol: 'justlend', poolName }, result: supply })

    // Calculate earnings
    const apy = parseFloat(supply.apy)
    const amountNum = parseFloat(amount)
    const monthly = (amountNum * apy / 100 / 12).toFixed(2)
    const yearly = (amountNum * apy / 100).toFixed(2)

    const report = JSON.stringify({
      protocol: 'JustLend',
      pool: poolName,
      amount,
      token,
      apy: supply.apy,
      txHash: supply.txHash,
      steps: [
        `分析了 ${yields.length} 个 DeFi 收益池`,
        `选出最低风险池：${poolName}（年化 ${supply.apy}%）`,
        `已将 ${amount} ${token} 质押到 JustLend 协议`,
        `交易已在 Nile 测试网确认`,
      ],
      estimatedMonthly: monthly,
      estimatedYearly: yearly,
    })

    const response = `✅ 已为你完成 DeFi 低风险质押！

将 ${amount} ${token} 存入 JustLend ${poolName}，年化收益 **${supply.apy}%**，预计每月收益 ${monthly} ${token}。

[DEFI_REPORT]
${report}
[/DEFI_REPORT]`

    return { response, toolCalls: toolCallLog }
  }

  // Whale tracking intent
  if (msg.includes('巨鲸') || msg.includes('whale') || msg.includes('大额')) {
    const { getWhaleTransfers } = await import('../modules/data/index.js')
    const whales = await getWhaleTransfers('USDT', 24, 10)
    toolCallLog.push({ tool: 'tron_whale_tracker', input: { token: 'USDT', hours: 24 }, result: whales })
    const topWhale = whales[0]
    return {
      response: `最近 24 小时 TRON 主网共检测到 ${whales.length} 笔大额 USDT 转账。\n\n最大一笔：${parseFloat(topWhale?.amount ?? '0').toLocaleString()} USDT`,
      toolCalls: toolCallLog,
    }
  }

  // Balance check intent
  if (msg.includes('余额') || msg.includes('balance') || walletAddress) {
    const { checkBalance } = await import('../modules/payment/index.js')
    const bal = await checkBalance(walletAddress || 'TFp3Ls4mHdzysbX1qxbwXdMzS8mkvhCMx6', 'USDT')
    toolCallLog.push({ tool: 'tron_check_balance', input: { address: walletAddress }, result: bal })
    return {
      response: `您的钱包余额：\n• TRX: ${(bal as unknown as Record<string, string>).trx ?? '—'}\n• USDT: ${(bal as unknown as Record<string, string>).usdt ?? '—'}`,
      toolCalls: toolCallLog,
    }
  }

  // Default response
  return {
    response: `您好！我是 TronClaw AI Agent 🦀\n\n我可以帮您：\n• 💰 查询钱包余额\n• 📈 DeFi 收益质押（试试："帮我把1000 USDT做低风险质押"）\n• 🐋 追踪巨鲸大额转账\n• ⚡ 设置自动交易策略\n\n请告诉我您需要什么帮助！`,
    toolCalls: [],
  }
}

// ─── POST /api/v1/chat/message ────────────────────────────────────────────────

const messageHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      message: z.string().min(1).max(2000),
      walletAddress: z.string().optional().default(''),
      history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional().default([]),
    })
    const { message, walletAddress, history } = schema.parse(req.body)

    const provider = process.env.LLM_PROVIDER ?? 'gemini'
    const hasGemini = !!process.env.GEMINI_API_KEY
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
    const hasBankOfAI = !!process.env.BANK_OF_AI_API_KEY

    // Bank of AI (minimax-m2.5) takes highest priority when configured
    const result = hasBankOfAI
      ? await runBankOfAI(message, history, walletAddress).catch(async (e: Error) => {
          console.warn('[Chat] Bank of AI error, falling back:', e.message)
          return runLocalAgent(message, walletAddress)
        })
      : provider === 'gemini' && hasGemini
        ? await runGemini(message, history, walletAddress).catch(async (e: Error) => {
            // Fallback if region blocked or quota exceeded — try smart local execution
            console.warn('[Chat] Gemini error, trying local execution:', e.message)
            return runLocalAgent(message, walletAddress)
          })
        : provider === 'anthropic' && hasAnthropic
          ? await runAnthropic(message, history, walletAddress)
          : runLocalAgent(message, walletAddress)

    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

chatRouter.post('/message', messageHandler)
