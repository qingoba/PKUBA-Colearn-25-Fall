/**
 * agentChat.ts — 共享 AI 推理核心
 * 供 /api/chat、/api/bot/telegram、/api/bot/feishu 共同调用
 */

import OpenAI from "openai";
import {
  fetchWhaleTransactions,
  fetchTronNetworkStats,
  fetchWalletPortfolio,
} from "@/lib/tron";

// ── Kimi 客户端 ─────────────────────────────────────────────────

export function getKimiClient(): OpenAI {
  return new OpenAI({
    baseURL: "https://api.moonshot.cn/v1",
    apiKey: process.env.KIMI_API_KEY || "",
  });
}

// ── 工具定义 ────────────────────────────────────────────────────

export const AGENT_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_whale_transactions",
      description: "获取TRON链上最近的巨鲸大额转账交易记录，用于分析市场动向",
      parameters: {
        type: "object",
        properties: {
          token: {
            type: "string",
            enum: ["USDT", "USDD", "ALL"],
            description: "筛选代币类型：USDT、USDD 或 ALL（全部）",
          },
          min_usd: {
            type: "number",
            description: "最小美元金额门槛，默认100000（10万美元）",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_network_stats",
      description: "获取TRON网络当前实时数据：TRX价格、TPS、区块高度、账户总数、销毁量等",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_wallet",
      description: "分析一个TRON钱包地址的资产组合，查看TRX余额、代币持仓和总价值",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "TRON 钱包地址，以 T 开头共 34 个字符",
          },
        },
        required: ["address"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_defi_opportunities",
      description: "查询TRON生态当前最优的DeFi收益机会，包括JustLend、SunSwap、TRON质押等",
      parameters: {
        type: "object",
        properties: {
          risk_level: {
            type: "string",
            enum: ["Low", "Medium", "High", "All"],
          },
          category: {
            type: "string",
            enum: ["Lending", "DEX", "Staking", "Yield", "All"],
          },
        },
        required: [],
      },
    },
  },
];

// ── 工具执行器 ──────────────────────────────────────────────────

export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  try {
    switch (name) {
      case "get_whale_transactions": {
        const token = (args.token as string) || "ALL";
        const minUsd = (args.min_usd as number) || 100_000;
        const txs = await fetchWhaleTransactions(
          token as "USDT" | "USDD" | "ALL",
          minUsd
        );
        if (!txs.length) return "暂无符合条件的巨鲸交易记录";
        const total = txs.reduce((s, t) => s + t.amountUSD, 0);
        const summary = txs
          .slice(0, 8)
          .map(
            (tx) =>
              `• [${tx.tokenSymbol}] $${(tx.amountUSD / 1_000_000).toFixed(2)}M  ${tx.from.slice(0, 8)}... → ${tx.to.slice(0, 8)}...  ${tx.isExchange ? "🏦 交易所" : "👤 钱包"}`
          )
          .join("\n");
        return `共 ${txs.length} 笔巨鲸交易，总金额 $${(total / 1_000_000).toFixed(1)}M\n\n${summary}`;
      }

      case "get_network_stats": {
        const s = await fetchTronNetworkStats();
        return [
          `📊 TRON 网络实时数据`,
          `TRX 价格: $${s.trxPrice.toFixed(4)}  (24h: ${s.priceChange24h >= 0 ? "+" : ""}${s.priceChange24h.toFixed(2)}%)`,
          `TPS: ${s.tps}  |  区块高度: ${s.blockHeight.toLocaleString()}`,
          `总账户数: ${(s.totalAccounts / 1_000_000).toFixed(1)}M`,
          `已销毁 TRX: ${(s.burnedTrx / 1_000_000).toFixed(1)}M`,
          `总交易次数: ${(s.totalTransactions / 1_000_000_000).toFixed(2)}B`,
        ].join("\n");
      }

      case "analyze_wallet": {
        const address = args.address as string;
        if (!/^T[a-zA-Z0-9]{33}$/.test(address)) {
          return "❌ 无效的 TRON 地址（应以 T 开头，共 34 位）";
        }
        const p = await fetchWalletPortfolio(address);
        const tokenList =
          p.tokens.length > 0
            ? p.tokens
                .slice(0, 6)
                .map(
                  (t) =>
                    `  • ${t.symbol}: ${t.balance.toFixed(2)} ≈ $${t.usdValue.toFixed(2)}`
                )
                .join("\n")
            : "  （无其他代币）";
        return [
          `💼 钱包分析: ${address.slice(0, 10)}...${address.slice(-6)}`,
          `总资产价值: $${p.totalValueUsd.toFixed(2)} USD`,
          `TRX 余额: ${p.trxBalance.toFixed(2)} TRX  ($${p.trxValueUsd.toFixed(2)})`,
          `账户类型: ${p.accountType}`,
          `交易次数: ${p.transactionCount.toLocaleString()}`,
          `代币持仓:\n${tokenList}`,
        ].join("\n");
      }

      case "get_defi_opportunities": {
        const allOpps = [
          { protocol: "JustLend",      pair: "USDT Supply",   apy: 8.24,  risk: "Low",    tvl: "$1.84B", category: "Lending" },
          { protocol: "JustLend",      pair: "TRX Supply",    apy: 5.61,  risk: "Low",    tvl: "$890M",  category: "Lending" },
          { protocol: "SunSwap",       pair: "USDT/USDD LP",  apy: 18.7,  risk: "Medium", tvl: "$320M",  category: "DEX"     },
          { protocol: "SunSwap",       pair: "TRX/USDT LP",   apy: 14.3,  risk: "Medium", tvl: "$580M",  category: "DEX"     },
          { protocol: "TRON Staking",  pair: "TRX 2.0 质押",  apy: 4.2,   risk: "Low",    tvl: "$5.2B",  category: "Staking" },
          { protocol: "Sun.io",        pair: "USDD Farm",     apy: 22.1,  risk: "High",   tvl: "$110M",  category: "Yield"   },
        ];
        const riskFilter = args.risk_level as string;
        const catFilter = args.category as string;
        const filtered = allOpps.filter((o) => {
          const riskOk = !riskFilter || riskFilter === "All" || o.risk === riskFilter;
          const catOk = !catFilter || catFilter === "All" || o.category === catFilter;
          return riskOk && catOk;
        });
        const rows = filtered
          .map(
            (o) =>
              `• ${o.protocol} [${o.pair}]  APY: ${o.apy}%  风险: ${o.risk}  TVL: ${o.tvl}`
          )
          .join("\n");
        return `💎 TRON DeFi 收益机会（${filtered.length} 个）:\n\n${rows}\n\n建议: 稳健型选 JustLend 或 TRX 质押；进取型可考虑 SunSwap LP，注意无常损失。`;
      }

      default:
        return `未知工具: ${name}`;
    }
  } catch (err) {
    console.error(`[Tool:${name}]`, err);
    return `工具 ${name} 执行出错: ${err instanceof Error ? err.message : "未知错误"}`;
  }
}

// ── System Prompt ───────────────────────────────────────────────

export const SYSTEM_PROMPT = `你是 TronSage AI 智能助手，专注于 TRON 区块链生态分析，由 Kimi（Moonshot AI）驱动。

你拥有以下能力，可以根据用户的自然语言指令自动调用：
🐋 查询 TRON 链上巨鲸大额交易
📊 获取 TRON 网络实时数据
💼 分析 TRON 钱包资产组合
💎 查询当前 DeFi 收益机会

使用规则：
- 用**中文**回答
- 数据要清晰格式化，金额用逗号分隔
- 分析要简洁有见地，给出行动建议
- 如果需要多个工具，可以依次调用
- 不确定的信息要说明是估算或参考值
- 回复简洁，控制在500字以内（Bot消息）`;

// ── 核心推理函数 ────────────────────────────────────────────────

export interface AgentChatResult {
  content: string;
  toolsUsed: string[];
}

export async function runAgentChat(userMessage: string): Promise<AgentChatResult> {
  const client = getKimiClient();

  const allMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];

  const toolsUsed: string[] = [];
  let finalContent = "";

  // Agentic loop: 最多 5 轮工具调用
  for (let round = 0; round < 5; round++) {
    const response = await client.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: allMessages,
      tools: AGENT_TOOLS,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1500,
    });

    const choice = response.choices[0];

    if (choice.finish_reason === "tool_calls" && choice.message.tool_calls?.length) {
      allMessages.push(choice.message);
      for (const toolCall of choice.message.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments || "{}") as Record<string, unknown>;
        const result = await executeTool(toolCall.function.name, args);
        toolsUsed.push(toolCall.function.name);
        allMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }
      continue;
    }

    finalContent = choice.message.content || "";
    break;
  }

  return { content: finalContent || "（无响应，请重试）", toolsUsed };
}
