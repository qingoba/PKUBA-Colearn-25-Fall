import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { fetchWhaleTransactions, fetchTronNetworkStats, fetchWalletPortfolio } from "@/lib/tron";

export const dynamic = "force-dynamic";

// ── KIMI Client ────────────────────────────────────────────────

function getKimiClient(): OpenAI {
  return new OpenAI({
    baseURL: "https://api.moonshot.cn/v1",
    apiKey: process.env.KIMI_API_KEY || "",
  });
}

// ── Tool Definitions ───────────────────────────────────────────

const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
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
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
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
            description: "TRON钱包地址，必须以T开头，共34位字符",
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
      description: "获取TRON DeFi生态的当前收益机会，包括JustLend借贷、SunSwap流动性挖矿、TRX质押等",
      parameters: {
        type: "object",
        properties: {
          risk_level: {
            type: "string",
            enum: ["Low", "Medium", "High", "All"],
            description: "按风险等级筛选：低风险/中等风险/高风险/全部",
          },
          category: {
            type: "string",
            enum: ["DEX", "Lending", "Staking", "Yield", "All"],
            description: "按类型筛选：去中心化交易所/借贷/质押/收益聚合/全部",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "prepare_transaction",
      description: "根据用户意图生成可在TronLink钱包中一键执行的链上交易参数。当用户表示想要执行某个DeFi操作时调用此工具。",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["deposit_justlend", "swap_sunswap", "stake_trx", "transfer_usdt", "withdraw_justlend", "add_liquidity"],
            description: "要执行的操作：justlend存款/sunswap兑换/trx质押/usdt转账/justlend取款/添加流动性",
          },
          amount: {
            type: "string",
            description: "操作金额，如 '100' 表示100个代币",
          },
          token: {
            type: "string",
            description: "代币符号，如 USDT、TRX、USDD",
          },
          toAddress: {
            type: "string",
            description: "目标地址（转账时必填）",
          },
        },
        required: ["action", "amount"],
      },
    },
  },
];

// ── Tool Executor ───────────────────────────────────────────────

async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "get_whale_transactions": {
        const token = (args.token as string) || "ALL";
        const minUsd = (args.min_usd as number) || 100_000;
        const txs = await fetchWhaleTransactions(token as "USDT" | "USDD" | "ALL", minUsd);
        if (!txs.length) return "暂无符合条件的巨鲸交易记录";
        const total = txs.reduce((s, t) => s + t.amountUSD, 0);
        const summary = txs.slice(0, 8).map((tx) =>
          `• [${tx.tokenSymbol}] $${(tx.amountUSD / 1_000_000).toFixed(2)}M  ${tx.from.slice(0, 8)}... → ${tx.to.slice(0, 8)}...  ${tx.isExchange ? "🏦 交易所" : "👤 钱包"}`
        ).join("\n");
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
        const tokenList = p.tokens.length > 0
          ? p.tokens.slice(0, 6).map(t =>
              `  • ${t.symbol}: ${t.balance.toFixed(2)} ≈ $${t.usdValue.toFixed(2)}`
            ).join("\n")
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
          { protocol: "JustLend",     pair: "USDT Supply",    apy: 8.24,  risk: "Low",    tvl: "$1.84B", category: "Lending", url: "https://justlend.org" },
          { protocol: "JustLend",     pair: "TRX Supply",     apy: 5.61,  risk: "Low",    tvl: "$890M",  category: "Lending", url: "https://justlend.org" },
          { protocol: "SunSwap",      pair: "USDT/USDD LP",   apy: 18.7,  risk: "Medium", tvl: "$320M",  category: "DEX",     url: "https://sun.io" },
          { protocol: "SunSwap",      pair: "TRX/USDT LP",    apy: 14.3,  risk: "Medium", tvl: "$580M",  category: "DEX",     url: "https://sun.io" },
          { protocol: "TRON Staking", pair: "TRX 2.0 质押",   apy: 4.2,   risk: "Low",    tvl: "$5.2B",  category: "Staking", url: "https://tronscan.org" },
          { protocol: "Sun.io",       pair: "USDD Farm",      apy: 22.1,  risk: "High",   tvl: "$110M",  category: "Yield",   url: "https://sun.io" },
        ];
        const riskFilter = args.risk_level as string;
        const catFilter = args.category as string;
        const filtered = allOpps.filter((o) => {
          const riskOk = !riskFilter || riskFilter === "All" || o.risk === riskFilter;
          const catOk = !catFilter || catFilter === "All" || o.category === catFilter;
          return riskOk && catOk;
        });
        const rows = filtered.map((o) =>
          `• ${o.protocol} [${o.pair}]  APY: ${o.apy}%  风险: ${o.risk}  TVL: ${o.tvl}`
        ).join("\n");
        return `💎 TRON DeFi 收益机会（${filtered.length} 个）:\n\n${rows}\n\n建议: 稳健型选 JustLend 或 TRX 质押；进取型可考虑 SunSwap LP，注意无常损失。`;
      }

      case "prepare_transaction": {
        const action = args.action as string;
        const amount = args.amount as string;
        const token = (args.token as string) || "USDT";

        const TX_CONFIGS: Record<string, {
          protocol: string; desc: string; contract: string;
          selector: string; params: Array<{type:string;value:string}>;
          gas: string; url: string;
        }> = {
          deposit_justlend: {
            protocol: "JustLend",
            desc: `在 JustLend 存入 ${amount} ${token}，当前 APY 8.24%`,
            contract: "TGjYzgCyPobsNS9n6WcbdLVR9dH7mWqFx4",
            selector: "mint(uint256)",
            params: [{ type: "uint256", value: String(Number(amount) * 1_000_000) }],
            gas: "~5 TRX",
            url: "https://justlend.org",
          },
          withdraw_justlend: {
            protocol: "JustLend",
            desc: `从 JustLend 取回 ${amount} ${token}`,
            contract: "TGjYzgCyPobsNS9n6WcbdLVR9dH7mWqFx4",
            selector: "redeem(uint256)",
            params: [{ type: "uint256", value: String(Number(amount) * 1_000_000) }],
            gas: "~4 TRX",
            url: "https://justlend.org",
          },
          swap_sunswap: {
            protocol: "SunSwap",
            desc: `在 SunSwap 兑换 ${amount} TRX → USDT`,
            contract: "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax",
            selector: "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
            params: [
              { type: "uint256", value: String(Number(amount) * 1_000_000) },
              { type: "uint256", value: "0" },
            ],
            gas: "~8 TRX",
            url: "https://sun.io",
          },
          stake_trx: {
            protocol: "TRON 2.0 质押",
            desc: `质押 ${amount} TRX，获取能量+带宽，年化 4.2%`,
            contract: "TronSystemStaking",
            selector: "freezeBalanceV2(uint256,uint256)",
            params: [
              { type: "uint256", value: String(Number(amount) * 1_000_000) },
              { type: "uint256", value: "1" },
            ],
            gas: "~1 TRX",
            url: "https://tronscan.org",
          },
          transfer_usdt: {
            protocol: "TRON TRC20",
            desc: `转账 ${amount} USDT 到指定地址`,
            contract: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
            selector: "transfer(address,uint256)",
            params: [
              { type: "address", value: (args.toAddress as string) || "填入目标地址" },
              { type: "uint256", value: String(Number(amount) * 1_000_000) },
            ],
            gas: "~1 TRX",
            url: "https://tronscan.org",
          },
          add_liquidity: {
            protocol: "SunSwap V2",
            desc: `向 SunSwap USDT/TRX 池添加 ${amount} USDT 流动性，APY 14.3%`,
            contract: "TFVisXFaijZfeyeSjCEVkHfex7HGdTxzF9",
            selector: "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)",
            params: [{ type: "uint256", value: String(Number(amount) * 1_000_000) }],
            gas: "~10 TRX",
            url: "https://sun.io",
          },
        };

        const cfg = TX_CONFIGS[action];
        if (!cfg) return "❌ 不支持的操作类型";

        const txPayload = {
          ready: true,
          protocol: cfg.protocol,
          action,
          amount,
          token,
          description: cfg.desc,
          contractAddress: cfg.contract,
          functionSelector: cfg.selector,
          params: cfg.params,
          estimatedGas: cfg.gas,
          url: cfg.url,
          timestamp: Date.now(),
        };

        return `✅ 交易已准备就绪！\n\n📋 操作: ${cfg.desc}\n📬 合约: ${cfg.contract.slice(0,10)}...\n⛽ 预估 Gas: ${cfg.gas}\n\n__TX_PAYLOAD__${JSON.stringify(txPayload)}__TX_PAYLOAD__\n\n点击下方按钮在 TronLink 中签名执行。`;
      }

      default:
        return `未知工具: ${name}`;
    }
  } catch (err) {
    console.error(`[Tool:${name}]`, err);
    return `工具 ${name} 执行出错: ${err instanceof Error ? err.message : "未知错误"}`;
  }
}

// ── Chat System Prompt ─────────────────────────────────────────

const SYSTEM_PROMPT = `你是 TronSage AI 智能助手，专注于 TRON 区块链生态分析，由 Kimi（Moonshot AI）驱动。

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
- 不确定的信息要说明是估算或参考值`;

// ── POST /api/chat ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body as {
      messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages 不能为空" }, { status: 400 });
    }

    if (!process.env.KIMI_API_KEY) {
      return NextResponse.json({ error: "KIMI_API_KEY 未配置" }, { status: 500 });
    }

    const client = getKimiClient();

    const allMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    const toolsUsed: string[] = [];
    let finalContent = "";
    let preparedTransaction: Record<string, unknown> | null = null;

    // Agentic loop: up to 5 rounds of tool calling
    for (let round = 0; round < 5; round++) {
      const response = await client.chat.completions.create({
        model: "moonshot-v1-8k",
        messages: allMessages,
        tools: TOOLS,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 2000,
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
      // Extract prepared transaction from content if present
      const txStart = finalContent.indexOf("__TX_PAYLOAD__");
      const txEnd = finalContent.lastIndexOf("__TX_PAYLOAD__");
      if (txStart !== -1 && txEnd !== txStart) {
        const jsonStr = finalContent.slice(txStart + 14, txEnd);
        try {
          preparedTransaction = JSON.parse(jsonStr) as Record<string, unknown>;
          finalContent = (finalContent.slice(0, txStart) + finalContent.slice(txEnd + 14)).trim();
        } catch { /* ignore parse errors */ }
      }
      break;
    }

    return NextResponse.json({ success: true, content: finalContent, toolsUsed, preparedTransaction });
  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "服务器内部错误" },
      { status: 500 }
    );
  }
}
