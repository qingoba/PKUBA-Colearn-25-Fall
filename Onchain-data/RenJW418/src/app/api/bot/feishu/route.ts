/**
 * 飞书 Bot Webhook
 * POST /api/bot/feishu
 *
 * 配置步骤（飞书开放平台 → 应用 → 事件订阅）：
 * 1. 创建企业自建应用，开启"机器人"能力
 * 2. 订阅事件：im.message.receive_v1
 * 3. 请求网址：https://your-domain.com/api/bot/feishu
 * 4. 权限：im:message、im:message:send_as_bot
 *
 * 所需环境变量：
 *   FEISHU_APP_ID         — 应用 App ID
 *   FEISHU_APP_SECRET     — 应用 App Secret
 *   FEISHU_VERIFICATION_TOKEN — 事件验证 Token（开放平台 → 事件订阅页面查看）
 */

import { NextRequest, NextResponse } from "next/server";
import { runAgentChat } from "@/lib/agentChat";

export const dynamic = "force-dynamic";

// ── 飞书 API 工具函数 ────────────────────────────────────────────

const FEISHU_BASE = "https://open.feishu.cn/open-apis";

/** 获取 tenant_access_token（应用级） */
async function getTenantToken(): Promise<string> {
  const res = await fetch(`${FEISHU_BASE}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: process.env.FEISHU_APP_ID,
      app_secret: process.env.FEISHU_APP_SECRET,
    }),
  });
  const data = (await res.json()) as { tenant_access_token?: string; code?: number };
  if (!data.tenant_access_token) {
    throw new Error(`获取飞书 Token 失败: ${JSON.stringify(data)}`);
  }
  return data.tenant_access_token;
}

/** 回复飞书消息 */
async function replyFeishuMessage(
  messageId: string,
  content: string,
  token: string
): Promise<void> {
  // 飞书单条消息最长 4000 字节
  const truncated =
    content.length > 3500 ? content.slice(0, 3500) + "\n\n…（内容已截断）" : content;

  await fetch(`${FEISHU_BASE}/im/v1/messages/${messageId}/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      msg_type: "text",
      content: JSON.stringify({ text: truncated }),
    }),
  });
}

/** 主动发送消息到 chat（群/私聊） */
async function sendFeishuMessage(
  receiveId: string,
  receiveIdType: "chat_id" | "open_id" | "user_id",
  content: string,
  token: string
): Promise<void> {
  const truncated =
    content.length > 3500 ? content.slice(0, 3500) + "\n\n…（内容已截断）" : content;

  await fetch(
    `${FEISHU_BASE}/im/v1/messages?receive_id_type=${receiveIdType}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        receive_id: receiveId,
        msg_type: "text",
        content: JSON.stringify({ text: truncated }),
      }),
    }
  );
}

// ── 飞书 Event 类型 ──────────────────────────────────────────────

interface FeishuTextEvent {
  schema?: string;
  header?: { event_type: string; token?: string };
  event?: {
    message: {
      message_id: string;
      chat_id: string;
      chat_type: string;
      message_type: string;
      content: string; // JSON string: { text: "..." }
      mentions?: Array<{ id: { open_id: string }; name: string; is_bot?: boolean }>;
    };
    sender: { sender_id: { open_id?: string }; sender_type: string };
  };
  // 旧版 v1 challenge
  challenge?: string;
  token?: string;
  type?: string;
}

// ── 指令快捷映射 ─────────────────────────────────────────────────

const QUICK_PROMPTS: Record<string, string> = {
  "/帮助": "你好！我是 TronSage AI，你可以问我：\n• 查询鲸鱼交易\n• TRON 网络状态\n• 分析某个钱包地址\n• DeFi 最佳收益机会",
  "/鲸鱼": "帮我查询TRON链上最近的大额鲸鱼交易，找出最大的10笔",
  "/网络": "获取TRON网络当前实时状态数据",
  "/defi": "查询TRON生态目前收益最好的DeFi机会",
  "/价格": "TRON当前价格是多少？最近24小时涨跌幅如何？",
};

// ── POST webhook handler ─────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as FeishuTextEvent;

    // ── 1. 飞书 URL 验证（首次配置时） ──────────────────────────
    if (body.type === "url_verification" || body.challenge) {
      // 验证 Token
      if (
        process.env.FEISHU_VERIFICATION_TOKEN &&
        body.token !== process.env.FEISHU_VERIFICATION_TOKEN
      ) {
        return NextResponse.json({ error: "token mismatch" }, { status: 401 });
      }
      return NextResponse.json({ challenge: body.challenge });
    }

    // ── 2. 验证事件 Token ────────────────────────────────────────
    if (
      process.env.FEISHU_VERIFICATION_TOKEN &&
      body.header?.token !== process.env.FEISHU_VERIFICATION_TOKEN
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 3. 只处理文本消息 ────────────────────────────────────────
    const event = body.event;
    if (!event || body.header?.event_type !== "im.message.receive_v1") {
      return NextResponse.json({ ok: true });
    }

    const msg = event.message;
    if (msg.message_type !== "text") {
      return NextResponse.json({ ok: true });
    }

    // 解析消息内容
    let userText = "";
    try {
      const parsed = JSON.parse(msg.content) as { text?: string };
      userText = (parsed.text || "").trim();
    } catch {
      return NextResponse.json({ ok: true });
    }

    // 如果消息来自机器人自身，忽略（防无限循环）
    if (event.sender.sender_type === "bot") {
      return NextResponse.json({ ok: true });
    }

    // 群消息中需要 @机器人 才响应（私聊直接响应）
    if (msg.chat_type !== "p2p") {
      const isMentioned = msg.mentions?.some((m) => m.is_bot);
      if (!isMentioned) {
        return NextResponse.json({ ok: true });
      }
      // 去掉 @mention 标记
      userText = userText.replace(/@\S+/g, "").trim();
    }

    if (!userText) return NextResponse.json({ ok: true });

    // ── 4. 处理内置指令 ──────────────────────────────────────────
    const tenantToken = await getTenantToken();

    if (userText in QUICK_PROMPTS) {
      const templateOrReply = QUICK_PROMPTS[userText];
      if (userText === "/帮助") {
        await replyFeishuMessage(msg.message_id, templateOrReply, tenantToken);
        return NextResponse.json({ ok: true });
      }
      const { content } = await runAgentChat(templateOrReply);
      await replyFeishuMessage(msg.message_id, content, tenantToken);
      return NextResponse.json({ ok: true });
    }

    // ── 5. 普通消息 → AI 推理 ────────────────────────────────────
    if (!process.env.KIMI_API_KEY) {
      await replyFeishuMessage(msg.message_id, "⚠️ AI 服务暂未配置，请联系管理员。", tenantToken);
      return NextResponse.json({ ok: true });
    }

    const { content, toolsUsed } = await runAgentChat(userText);
    const toolHint =
      toolsUsed.length > 0 ? `\n\n🔧 调用工具: ${toolsUsed.join(", ")}` : "";

    await replyFeishuMessage(msg.message_id, content + toolHint, tenantToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Feishu Bot]", err);
    // 始终返回 200，否则飞书会重试
    return NextResponse.json({ ok: true });
  }
}

// ── GET：查询飞书 Bot 连接状态 ────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  if (!process.env.FEISHU_APP_ID || !process.env.FEISHU_APP_SECRET) {
    return NextResponse.json({
      configured: false,
      reason: "FEISHU_APP_ID 或 FEISHU_APP_SECRET 未设置",
    });
  }
  try {
    const token = await getTenantToken();
    // 用 Token 获取机器人信息
    const res = await fetch(`${FEISHU_BASE}/bot/v3/info`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as {
      code?: number;
      bot?: { app_name: string; open_id: string };
    };
    if (data.code === 0 && data.bot) {
      return NextResponse.json({
        configured: true,
        name: data.bot.app_name,
        openId: data.bot.open_id,
      });
    }
    return NextResponse.json({ configured: false, reason: "App ID/Secret 无效" });
  } catch (err) {
    return NextResponse.json({
      configured: false,
      reason: err instanceof Error ? err.message : "网络错误",
    });
  }
}
