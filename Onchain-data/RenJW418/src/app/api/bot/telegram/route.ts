/**
 * Telegram Bot Webhook
 * POST /api/bot/telegram
 *
 * 1. 注册 Webhook：
 *    curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-domain.com/api/bot/telegram&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
 *
 * 2. 所需环境变量：
 *    TELEGRAM_BOT_TOKEN    — BotFather 下发的 Token
 *    TELEGRAM_WEBHOOK_SECRET — 自定义密钥，防止伪造请求（推荐 32+ 位随机字符串）
 */

import { NextRequest, NextResponse } from "next/server";
import { runAgentChat } from "@/lib/agentChat";

export const dynamic = "force-dynamic";

// ── 类型定义 ─────────────────────────────────────────────────────

interface TelegramMessage {
  message_id: number;
  chat: { id: number; type: string; username?: string; first_name?: string };
  from?: { id: number; first_name?: string; username?: string };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    message: TelegramMessage;
    data: string;
  };
}

// ── Telegram API 工具函数 ────────────────────────────────────────

const TG_BASE = () =>
  `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function sendTelegramMessage(
  chatId: number,
  text: string,
  replyToMessageId?: number
): Promise<void> {
  // Telegram 消息最长 4096 字，超出则截断
  const truncated =
    text.length > 3800 ? text.slice(0, 3800) + "\n\n…（内容已截断）" : text;

  await fetch(`${TG_BASE()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: truncated,
      parse_mode: "Markdown",
      ...(replyToMessageId && { reply_to_message_id: replyToMessageId }),
    }),
  });
}

async function sendTypingAction(chatId: number): Promise<void> {
  await fetch(`${TG_BASE()}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
  });
}

// ── 欢迎消息 ─────────────────────────────────────────────────────

const WELCOME_TEXT = `👋 欢迎使用 *TronSage AI Bot*！

我是专注于 TRON 区块链的 AI 智能助手，可以帮你：

🐋 *鲸鱼追踪* — 追踪 TRON 链上大额转账
📊 *网络数据* — 实时 TRX 价格、TPS、区块高度
💼 *钱包分析* — 输入地址即可分析资产组合
💎 *DeFi 机会* — JustLend/SunSwap 最优收益

直接用自然语言提问即可，例如：
• "查一下最近的巨鲸交易"
• "分析钱包 TMxxxxxxxx"
• "现在 TRX 网络状态怎么样"
• "TRON DeFi 有哪些高收益机会"`;

// ── 指令处理 ─────────────────────────────────────────────────────

const QUICK_PROMPTS: Record<string, string> = {
  "/start": WELCOME_TEXT,
  "/help": WELCOME_TEXT,
  "/whale": "帮我查询TRON链上最近的大额鲸鱼交易，找出最大的10笔",
  "/stats": "获取TRON网络当前实时状态数据",
  "/defi": "查询TRON生态目前收益最好的DeFi机会，包括低风险和中风险",
  "/price": "TRON当前价格是多少？最近24小时涨跌幅如何？",
};

// ── POST webhook handler ─────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 安全验证：检查 Telegram 发来的密钥 Header
    const secret = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (
      process.env.TELEGRAM_WEBHOOK_SECRET &&
      secret !== process.env.TELEGRAM_WEBHOOK_SECRET
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN 未配置" }, { status: 500 });
    }

    const update = (await req.json()) as TelegramUpdate;
    const message = update.message;

    // 只处理文本消息
    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const msgId = message.message_id;

    // 处理内置指令
    if (text in QUICK_PROMPTS) {
      const template = QUICK_PROMPTS[text];
      if (text === "/start" || text === "/help") {
        // 直接回复欢迎词，无需调用 AI
        await sendTelegramMessage(chatId, template, msgId);
        return NextResponse.json({ ok: true });
      }
      // 其他指令转成 AI 提示词
      await sendTypingAction(chatId);
      const { content } = await runAgentChat(template);
      await sendTelegramMessage(chatId, content, msgId);
      return NextResponse.json({ ok: true });
    }

    // 未知指令提示
    if (text.startsWith("/")) {
      await sendTelegramMessage(
        chatId,
        "❓ 未知指令。发送 /help 查看可用指令，或直接用自然语言提问。",
        msgId
      );
      return NextResponse.json({ ok: true });
    }

    // 普通消息 → 调用 AI
    if (!process.env.KIMI_API_KEY) {
      await sendTelegramMessage(chatId, "⚠️ AI 服务暂未配置，请稍后再试。", msgId);
      return NextResponse.json({ ok: true });
    }

    await sendTypingAction(chatId);
    const { content, toolsUsed } = await runAgentChat(text);

    // 工具已用时附加提示
    const toolHint =
      toolsUsed.length > 0
        ? `\n\n_🔧 调用工具: ${toolsUsed.join(", ")}_`
        : "";

    await sendTelegramMessage(chatId, content + toolHint, msgId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Telegram Bot]", err);
    // 始终向 Telegram 返回 200，避免重复推送
    return NextResponse.json({ ok: true });
  }
}

// ── GET：查询 Bot 连接状态（便于配置页面检测） ──────────────────

export async function GET(): Promise<NextResponse> {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ configured: false, reason: "TELEGRAM_BOT_TOKEN 未设置" });
  }
  try {
    const res = await fetch(`${TG_BASE()}/getMe`);
    const data = (await res.json()) as { ok: boolean; result?: { username: string; first_name: string } };
    if (data.ok && data.result) {
      return NextResponse.json({
        configured: true,
        username: data.result.username,
        name: data.result.first_name,
      });
    }
    return NextResponse.json({ configured: false, reason: "Token 无效" });
  } catch {
    return NextResponse.json({ configured: false, reason: "网络错误" });
  }
}
