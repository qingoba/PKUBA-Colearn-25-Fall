"use client";

import { useState, useEffect } from "react";

// ── 类型 ─────────────────────────────────────────────────────────

interface BotStatus {
  configured: boolean;
  name?: string;
  username?: string;
  openId?: string;
  reason?: string;
}

type BotPlatform = "telegram" | "feishu";

// ── 常量 ─────────────────────────────────────────────────────────

const PLATFORM_META: Record<
  BotPlatform,
  { label: string; icon: string; color: string; border: string; bg: string }
> = {
  telegram: {
    label: "Telegram Bot",
    icon: "✈️",
    color: "#29B6F6",
    border: "rgba(41,182,246,0.3)",
    bg: "rgba(41,182,246,0.06)",
  },
  feishu: {
    label: "飞书 Bot",
    icon: "🪁",
    color: "#00C853",
    border: "rgba(0,200,83,0.3)",
    bg: "rgba(0,200,83,0.06)",
  },
};

const TELEGRAM_COMMANDS = [
  { cmd: "/start", desc: "显示欢迎信息与功能介绍" },
  { cmd: "/whale", desc: "查询最新鲸鱼大额交易" },
  { cmd: "/stats", desc: "TRON 网络实时状态" },
  { cmd: "/defi", desc: "最佳 DeFi 收益机会" },
  { cmd: "/price", desc: "TRX 当前价格" },
];

const FEISHU_COMMANDS = [
  { cmd: "/帮助", desc: "显示功能菜单" },
  { cmd: "/鲸鱼", desc: "查询最新鲸鱼大额交易" },
  { cmd: "/网络", desc: "TRON 网络实时状态" },
  { cmd: "/defi", desc: "最佳 DeFi 收益机会" },
  { cmd: "/价格", desc: "TRX 当前价格" },
];

// ── 状态卡片 ─────────────────────────────────────────────────────

function BotStatusCard({
  platform,
  status,
  loading,
  onRefresh,
}: {
  platform: BotPlatform;
  status: BotStatus | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  const meta = PLATFORM_META[platform];
  const commands = platform === "telegram" ? TELEGRAM_COMMANDS : FEISHU_COMMANDS;

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 border transition-all duration-300"
      style={{ background: meta.bg, borderColor: meta.border }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <div className="font-orbitron text-sm font-bold" style={{ color: meta.color }}>
              {meta.label}
            </div>
            {status?.name && (
              <div className="text-xs text-cyber-muted mt-0.5">
                {platform === "telegram" ? `@${status.username ?? status.name}` : status.name}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={
              loading
                ? { background: "rgba(128,128,128,0.15)", color: "#888" }
                : status?.configured
                ? { background: "rgba(0,200,83,0.15)", color: "#00C853" }
                : { background: "rgba(255,51,102,0.15)", color: "#FF3366" }
            }
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: loading
                  ? "#888"
                  : status?.configured
                  ? "#00C853"
                  : "#FF3366",
                animation: status?.configured && !loading ? "pulse 2s infinite" : "none",
              }}
            />
            {loading ? "检测中…" : status?.configured ? "已连接" : "未配置"}
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.05)" }}
            title="刷新状态"
          >
            <span className={loading ? "animate-spin inline-block" : ""}>🔄</span>
          </button>
        </div>
      </div>

      {/* Not configured hint */}
      {!loading && !status?.configured && (
        <div
          className="text-xs rounded-lg p-3 leading-relaxed"
          style={{ background: "rgba(255,51,102,0.08)", color: "#FF3366", border: "1px solid rgba(255,51,102,0.2)" }}
        >
          ⚠️ {status?.reason ?? "未配置环境变量"}
        </div>
      )}

      {/* Commands list */}
      <div>
        <div className="text-xs text-cyber-muted mb-2 font-semibold tracking-wider uppercase">
          支持指令
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {commands.map(({ cmd, desc }) => (
            <div
              key={cmd}
              className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <code
                className="font-mono px-1.5 py-0.5 rounded text-xs"
                style={{ background: "rgba(255,255,255,0.08)", color: meta.color }}
              >
                {cmd}
              </code>
              <span className="text-cyber-muted">{desc}</span>
            </div>
          ))}
          <div
            className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <code
              className="font-mono px-1.5 py-0.5 rounded text-xs"
              style={{ background: "rgba(255,255,255,0.08)", color: meta.color }}
            >
              自然语言
            </code>
            <span className="text-cyber-muted">直接提问，AI 自动调用工具回答</span>
          </div>
        </div>
      </div>

      {/* Webhook URL hint */}
      <div
        className="rounded-lg p-3 text-xs"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="text-cyber-muted mb-1 font-semibold">Webhook 地址</div>
        <code className="text-cyber-text break-all">
          {typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}
          /api/bot/{platform}
        </code>
      </div>
    </div>
  );
}

// ── 配置指引 ─────────────────────────────────────────────────────

function SetupGuide({ platform }: { platform: BotPlatform }) {
  const [open, setOpen] = useState(false);

  const steps =
    platform === "telegram"
      ? [
          "在 Telegram 搜索 @BotFather，发送 /newbot 创建 Bot，获取 Token",
          "在 .env.local 中设置 TELEGRAM_BOT_TOKEN=你的Token",
          "设置 TELEGRAM_WEBHOOK_SECRET=随机字符串（增强安全性）",
          "部署到 Vercel 后，执行以下命令注册 Webhook：",
          "curl \"https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-domain/api/bot/telegram&secret_token=<SECRET>\"",
        ]
      : [
          "登录飞书开放平台（open.feishu.cn），新建企业自建应用",
          "开启「机器人」能力，并申请权限：im:message、im:message:send_as_bot",
          "在「事件订阅」中添加 im.message.receive_v1 事件",
          "设置请求网址：https://your-domain/api/bot/feishu",
          "在 .env.local 设置：FEISHU_APP_ID、FEISHU_APP_SECRET、FEISHU_VERIFICATION_TOKEN",
        ];

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor:
          platform === "telegram"
            ? "rgba(41,182,246,0.2)"
            : "rgba(0,200,83,0.2)",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
        style={{ background: "rgba(255,255,255,0.03)" }}
      >
        <span className="text-cyber-text">
          📋 {platform === "telegram" ? "Telegram" : "飞书"} 配置指南
        </span>
        <span className="text-cyber-muted">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 text-xs">
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-bold text-white text-[10px]"
                style={{
                  background:
                    platform === "telegram"
                      ? "rgba(41,182,246,0.6)"
                      : "rgba(0,200,83,0.6)",
                }}
              >
                {i + 1}
              </span>
              {step.startsWith("curl") ? (
                <code
                  className="text-[10px] text-cyber-muted break-all font-mono p-2 rounded"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  {step}
                </code>
              ) : (
                <span className="text-cyber-muted leading-relaxed">{step}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 主组件 ───────────────────────────────────────────────────────

export default function BotIntegration() {
  const [telegramStatus, setTelegramStatus] = useState<BotStatus | null>(null);
  const [feishuStatus, setFeishuStatus] = useState<BotStatus | null>(null);
  const [loadingTg, setLoadingTg] = useState(false);
  const [loadingFs, setLoadingFs] = useState(false);

  async function checkTelegram() {
    setLoadingTg(true);
    try {
      const res = await fetch("/api/bot/telegram");
      setTelegramStatus(await res.json() as BotStatus);
    } catch {
      setTelegramStatus({ configured: false, reason: "网络请求失败" });
    } finally {
      setLoadingTg(false);
    }
  }

  async function checkFeishu() {
    setLoadingFs(true);
    try {
      const res = await fetch("/api/bot/feishu");
      setFeishuStatus(await res.json() as BotStatus);
    } catch {
      setFeishuStatus({ configured: false, reason: "网络请求失败" });
    } finally {
      setLoadingFs(false);
    }
  }

  useEffect(() => {
    checkTelegram();
    checkFeishu();
  }, []);

  return (
    <div className="flex flex-col gap-6 fade-in-up">
      {/* 页头 */}
      <div>
        <h2 className="font-orbitron text-xl font-bold text-cyber-cyan mb-1">
          🤝 社交平台 Bot 集成
        </h2>
        <p className="text-sm text-cyber-muted">
          通过 Telegram 或飞书直接与 TronSage AI 对话，随时随地查询链上数据。
        </p>
      </div>

      {/* Bot 状态卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BotStatusCard
          platform="telegram"
          status={telegramStatus}
          loading={loadingTg}
          onRefresh={checkTelegram}
        />
        <BotStatusCard
          platform="feishu"
          status={feishuStatus}
          loading={loadingFs}
          onRefresh={checkFeishu}
        />
      </div>

      {/* 工作原理 */}
      <div
        className="rounded-xl p-5 border"
        style={{
          background: "rgba(0,245,212,0.04)",
          borderColor: "rgba(0,245,212,0.15)",
        }}
      >
        <div className="font-semibold text-sm text-cyber-cyan mb-3">⚡ 工作原理</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-cyber-muted">
          {[
            { icon: "💬", label: "用户发消息", desc: "在 Telegram/飞书中发送自然语言" },
            { icon: "🔗", label: "Webhook 接收", desc: "平台 → TronSage API 路由" },
            { icon: "🤖", label: "Kimi AI 推理", desc: "多轮工具调用获取链上数据" },
            { icon: "📩", label: "Bot 回复", desc: "结构化结果直接推送到聊天" },
          ].map(({ icon, label, desc }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center gap-1.5 p-3 rounded-lg"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <span className="text-xl">{icon}</span>
              <div className="font-semibold text-cyber-text">{label}</div>
              <div>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 配置指南 */}
      <div className="flex flex-col gap-3">
        <SetupGuide platform="telegram" />
        <SetupGuide platform="feishu" />
      </div>
    </div>
  );
}
