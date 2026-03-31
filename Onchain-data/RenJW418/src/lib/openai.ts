// ────────────────────────────────────────────────────────────
// Kimi (Moonshot AI) Integration — AI Analysis for TronSage
// Compatible with OpenAI SDK via baseURL override
// ────────────────────────────────────────────────────────────

import OpenAI from "openai";
import { AIAnalysisRequest, AIAnalysisResponse, AISignal } from "@/types";

let kimi: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!kimi) {
    kimi = new OpenAI({
      baseURL: "https://api.moonshot.cn/v1",
      apiKey: process.env.KIMI_API_KEY || "",
    });
  }
  return kimi;
}

// ── System Prompt ──────────────────────────────────────────────

const SYSTEM_PROMPT = `You are TronSage AI, an advanced blockchain intelligence agent built on the TRON network, powered by Bank of AI infrastructure.

Your expertise:
- TRON ecosystem DeFi protocols (SunSwap, JustLend, WINkLink, JUST)
- On-chain whale movement analysis and interpretation
- DeFi yield strategy optimization
- Risk assessment and portfolio management
- TRON tokenomics (TRX, USDT, USDD, energy/bandwidth mechanics)

You provide:
1. Clear, actionable market analysis
2. Whale activity interpretation (large transfers signal market moves)
3. DeFi strategy recommendations with specific APY/risk tradeoffs
4. Portfolio optimization advice

Always respond in this exact JSON format:
{
  "analysis": "<3-4 paragraph comprehensive analysis>",
  "signals": [
    {
      "type": "bullish|bearish|neutral",
      "strength": <0-100>,
      "title": "<signal title>",
      "reasoning": "<1-2 sentence explanation>"
    }
  ],
  "recommendations": [
    "<specific actionable recommendation 1>",
    "<specific actionable recommendation 2>",
    "<specific actionable recommendation 3>"
  ],
  "riskLevel": "low|medium|high",
  "confidence": <0-100>
}

Be direct, data-driven, and specific. Reference TRON-specific protocols and metrics where relevant.`;

// ── Main Analysis Function ─────────────────────────────────────

export async function generateAIAnalysis(
  request: AIAnalysisRequest
): Promise<AIAnalysisResponse> {
  const { query, context, demoMode } = request;

  // Build context summary for the prompt
  let contextStr = "";
  if (context?.networkStats) {
    const s = context.networkStats;
    contextStr += `\nTRON Network: TRX=$${s.trxPrice} (${s.priceChange24h > 0 ? "+" : ""}${s.priceChange24h}% 24h), TPS=${s.tps}, Block=${s.blockHeight}`;
  }
  if (context?.portfolio) {
    const p = context.portfolio;
    contextStr += `\nPortfolio: Total $${p.totalValueUsd.toFixed(0)} USD, TRX=${p.trxBalance.toFixed(0)}, Tokens=${p.tokens.length}`;
  }
  if (context?.recentWhaleActivity?.length) {
    const total = context.recentWhaleActivity
      .slice(0, 5)
      .reduce((s, t) => s + t.amountUSD, 0);
    contextStr += `\nRecent whale activity: ${context.recentWhaleActivity.length} large transfers totaling $${(total / 1_000_000).toFixed(1)}M in past hour`;
  }

  // Demo mode: return hardcoded realistic response without API call
  if (demoMode || !process.env.KIMI_API_KEY) {
    return generateDemoAnalysis(query, contextStr);
  }

  try {
    const ai = getOpenAI();
    const userMessage = contextStr
      ? `Context:\n${contextStr}\n\nUser query: ${query}`
      : query;

    const completion = await ai.chat.completions.create({
      model: "moonshot-v1-8k",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenAI");

    const parsed = JSON.parse(content);
    return {
      analysis: parsed.analysis || "",
      signals: (parsed.signals || []).slice(0, 4) as AISignal[],
      recommendations: (parsed.recommendations || []).slice(0, 4),
      riskLevel: parsed.riskLevel || "medium",
      confidence: parsed.confidence || 75,
      timestamp: new Date().toISOString(),
      paidWith: request.paymentProof?.txHash,
      demoMode: false,
    };
  } catch (err) {
    console.error("[OpenAI] Analysis error:", err);
    return generateDemoAnalysis(query, contextStr);
  }
}

// ── Demo / Fallback Analysis ───────────────────────────────────

function generateDemoAnalysis(query: string, context: string): AIAnalysisResponse {
  const q = query.toLowerCase();

  const responses: Record<string, Omit<AIAnalysisResponse, "timestamp" | "demoMode">> = {
    default: {
      analysis:
        "The TRON ecosystem is showing strong activity with significant stablecoin movement suggesting institutional positioning. Recent whale data indicates accumulation patterns typical of pre-breakout phases. USDT flows into major TRON DeFi protocols (particularly SunSwap and JustLend) have increased 23% in the past 48 hours, signaling renewed DeFi interest.\n\nOn-chain metrics paint a bullish picture: TRON's TPS remains consistently above 60 transactions/second with energy consumption trending up, indicating higher smart contract activity. The burn mechanism has eliminated $84M+ in TRX supply, creating long-term deflationary pressure.\n\nKey risk: Large exchange outflows (Binance, OKX) in the past 24h suggest some profit-taking at current levels. However, net stablecoin inflows to TRON remain positive, which historically precedes price appreciation.\n\nRecommendation: Consider a phased entry — 40% now, 60% on any pullback to the $0.125 support level.",
      signals: [
        { type: "bullish", strength: 78, title: "Stablecoin Inflow Surge", reasoning: "USDT/USDD deposits to TRON DeFi protocols up 23% in 48h, indicating fresh capital deployment." },
        { type: "bullish", strength: 65, title: "Whale Accumulation Pattern", reasoning: "Multiple addresses above $1M are moving stablecoins on-chain — historically precedes price moves." },
        { type: "bearish", strength: 45, title: "Exchange Outflow", reasoning: "Notable TRX withdrawals from major exchanges suggest some holders taking profits." },
        { type: "neutral", strength: 55, title: "Network Activity Stable", reasoning: "TPS holding at 60-70 range — healthy but not showing explosive growth yet." },
      ],
      recommendations: [
        "Allocate 30-40% of TRON portfolio to JustLend USDT lending (current APY: 8.2%) for stable yield while waiting for market confirmation",
        "Monitor SunSwap TRX/USDT liquidity — current pool sizes suggest a gap between supply and demand that could narrow quickly",
        "Set alerts for single transactions >$5M USDT on TRON — current whale threshold is being breached more frequently",
        "Consider USDD farming on Sun.io for higher APY (12-18%) if you can tolerate slightly elevated depeg risk",
      ],
      riskLevel: "medium",
      confidence: 82,
      paidWith: undefined,
    },
    whale: {
      analysis:
        "Current whale activity on TRON shows an unusual pattern: large stablecoin transfers (>$500K) are happening in clusters, suggesting coordinated movement. In the last 2 hours, 8 transactions above $1M USDT have been confirmed on-chain.\n\nHistorical analysis of similar patterns shows a 73% correlation with significant price action within 24-48 hours. The directional asymmetry (more inflows to DeFi protocols than exchanges) suggests these whales are deploying capital for yield rather than preparing to dump.\n\nTwo notable wallets have historically preceded TRON bull runs by 48-72 hours. Both are currently accumulating USDD — a notable signal given USDD's algorithmic backing requires active management during price volatility.",
      signals: [
        { type: "bullish", strength: 85, title: "Coordinated Whale Accumulation", reasoning: "Cluster of >$1M transfers in 2h window — historically precedes 10-20% price moves." },
        { type: "bullish", strength: 70, title: "DeFi Capital Deployment", reasoning: "Whales routing to protocols (not exchanges) signals intent to earn yield, not sell." },
        { type: "neutral", strength: 50, title: "USDD Demand Rising", reasoning: "Increased USDD demand often indicates sophisticated players building stable positions." },
      ],
      recommendations: [
        "Follow whale wallets loading up on JustLend — consider similar yield farming positions",
        "Whale movements suggest $0.14 is a strong support; position sizing should account for potential 15-20% move",
        "Watch for second wave of large transfers in 6-12h — if it comes, trend is confirmed",
        "Reduce exposure to smaller TRC20 tokens during this phase — whales rarely move in altcoins before establishing TRON positions",
      ],
      riskLevel: "medium",
      confidence: 79,
    },
    defi: {
      analysis:
        "TRON DeFi ecosystem TVL stands at approximately $8.2B, making it the 3rd largest DeFi ecosystem by TVL. The dominant protocols are Sun.io (formerly JustSwap/JustLend) with ~$5.1B TVL, and several newer yield aggregators showing strong growth.\n\nCurrent yield opportunities on TRON are exceptional compared to Ethereum/BSC peers: USDT lending on JustLend yields 7.5-9.2% APY versus 3-4% on Aave. TRX staking through Super Representatives offers 4.2% APY with perfect security (no smart contract risk). The highest-risk, highest-reward play is USDD/USDT liquidity on SunSwap at 18-22% APY.\n\nKey risk factor: USDD maintains its $1 peg through algorithmic mechanisms — during high volatility, temporary depegs have occurred (max observed: -2.8%). Factor this into position sizing for USDD-denominated strategies.",
      signals: [
        { type: "bullish", strength: 72, title: "DeFi TVL Growth", reasoning: "TRON DeFi TVL up 8% month-over-month, indicating growing ecosystem confidence." },
        { type: "bullish", strength: 68, title: "Yield Premium vs Competitors", reasoning: "TRON offers 2-3x yield vs Ethereum for equivalent risk, attracting capital." },
        { type: "bearish", strength: 35, title: "USDD Depeg Risk", reasoning: "Algorithmic stablecoins carry inherent risk; USDD has briefly depegged 3x in past year." },
        { type: "neutral", strength: 60, title: "Protocol Concentration", reasoning: "70%+ of TRON TVL in Sun.io — single-protocol concentration warrants consideration." },
      ],
      recommendations: [
        "Optimal risk-adjusted strategy: 50% JustLend USDT (7.5% APY, minimal risk), 30% TRX staking (4.2% APY, zero smart contract risk), 20% SunSwap USDD/USDT LP (18% APY, medium risk)",
        "For higher yield seekers: explore WINkLink WIN/TRX farming at 35-45% APY with proper position limits",
        "Set a 6-week auto-rebalance: DeFi yields on TRON can compress quickly when TVL grows",
        "Always maintain 20%+ in liquid TRX for energy — gas costs can spike during high-activity periods",
      ],
      riskLevel: "low",
      confidence: 88,
    },
  };

  let response = responses.default;
  if (q.includes("whale") || q.includes("巨鲸") || q.includes("large transfer")) {
    response = responses.whale;
  } else if (q.includes("defi") || q.includes("yield") || q.includes("apy") || q.includes("strategy")) {
    response = responses.defi;
  }

  return {
    ...response,
    timestamp: new Date().toISOString(),
    demoMode: true,
  };
}
