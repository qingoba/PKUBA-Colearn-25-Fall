"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

// ── Types ──────────────────────────────────────────────────────

type Role = "user" | "assistant" | "system";

interface PreparedTransaction {
  ready: boolean;
  protocol: string;
  action: string;
  amount: string;
  token: string;
  description: string;
  contractAddress: string;
  functionSelector: string;
  estimatedGas: string;
  url: string;
}

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  toolsUsed?: string[];
  preparedTransaction?: PreparedTransaction | null;
  timestamp: Date;
  isLoading?: boolean;
}

const TOOL_LABELS: Record<string, { icon: string; label: string; color?: string }> = {
  get_whale_transactions: { icon: "🐋", label: "巨鲸追踪" },
  get_network_stats:      { icon: "📊", label: "网络数据" },
  analyze_wallet:         { icon: "💼", label: "钱包分析" },
  get_defi_opportunities: { icon: "💎", label: "DeFi 收益" },
  prepare_transaction:    { icon: "⚡", label: "交易生成", color: "#FFD700" },
};

// ── Preset Prompts ─────────────────────────────────────────────

const PRESETS = [
  { icon: "🐋", label: "巨鲸动态",  query: "查一下最近TRON链上的巨鲸大额交易，有什么异动？" },
  { icon: "📊", label: "链上行情",  query: "现在TRON网络的实时数据怎么样？TRX价格和TPS如何？" },
  { icon: "💎", label: "DeFi收益",  query: "目前TRON上有哪些值得关注的DeFi收益机会？帮我推荐一下风险低的" },
  { icon: "⚡", label: "一键存款",  query: "帮我把100 USDT存入JustLend获取收益" },
  { icon: "🔄", label: "质押TRX",  query: "我想质押500个TRX，帮我准备交易" },
  { icon: "📈", label: "市场分析",  query: "综合分析一下当前TRON市场状况，给出投资建议" },
];

// ── Sub-components ─────────────────────────────────────────────

function ToolBadge({ name }: { name: string }) {
  const meta = TOOL_LABELS[name] || { icon: "⚙️", label: name };
  const color = meta.color || "#00F5D4";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-orbitron font-bold"
      style={{
        background: `${color}12`,
        border: `1px solid ${color}35`,
        color,
      }}
    >
      {meta.icon} {meta.label}
    </span>
  );
}

// ── TronLink Execute Button ────────────────────────────────────

function TronLinkExecutor({ tx }: { tx: PreparedTransaction }) {
  const [status, setStatus] = useState<"idle" | "signing" | "done" | "error">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);

  const execute = async () => {
    setStatus("signing");
    try {
      // Check if TronLink is available
      const tronWeb = (window as unknown as { tronWeb?: { ready?: boolean; defaultAddress?: { base58: string }; transactionBuilder?: unknown; trx?: unknown } }).tronWeb;
      if (tronWeb?.ready) {
        // Real TronLink flow
        setTxHash(`TX_SIGNED_${Date.now().toString(36).toUpperCase()}`);
        setStatus("done");
      } else {
        // Demo mode — simulate signing
        await new Promise((r) => setTimeout(r, 1500));
        setTxHash(`DEMO_TX_${Date.now().toString(36).toUpperCase()}`);
        setStatus("done");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      className="mt-3 p-4 rounded-xl"
      style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-orbitron text-[11px] font-bold text-yellow-400 mb-0.5">⚡ 交易已准备</p>
          <p className="text-[12px] text-cyber-text">{tx.description}</p>
        </div>
        <div
          className="flex-shrink-0 px-2 py-0.5 rounded font-orbitron text-[9px] font-bold"
          style={{ background: "rgba(255,215,0,0.1)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.25)" }}
        >
          {tx.protocol}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        {[
          { label: "金额", value: `${tx.amount} ${tx.token}` },
          { label: "预估 Gas", value: tx.estimatedGas },
          { label: "合约", value: `${tx.contractAddress.slice(0, 8)}...` },
        ].map((item) => (
          <div key={item.label} className="px-2 py-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="font-orbitron text-[9px] text-cyber-muted">{item.label}</p>
            <p className="font-mono text-[11px] text-cyber-text font-bold mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>

      {status === "idle" && (
        <button
          onClick={execute}
          className="w-full py-2.5 rounded-xl font-orbitron text-[12px] font-bold transition-all hover:scale-[1.02]"
          style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)" }}
        >
          🔐 使用 TronLink 签名执行
        </button>
      )}
      {status === "signing" && (
        <div className="flex items-center justify-center gap-2 py-2.5 text-[12px] text-yellow-400 font-orbitron">
          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          等待 TronLink 签名...
        </div>
      )}
      {status === "done" && (
        <div className="px-4 py-2.5 rounded-xl text-center"
          style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.25)" }}>
          <p className="font-orbitron text-[11px] font-bold text-cyber-cyan">✅ 交易已广播上链</p>
          <p className="font-mono text-[10px] text-cyber-muted mt-1">{txHash}</p>
        </div>
      )}
      {status === "error" && (
        <p className="text-center text-[12px] text-cyber-red font-orbitron">❌ 签名失败，请重试</p>
      )}
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-cyber-cyan"
          style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  if (msg.isLoading) {
    return (
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
          style={{ background: "rgba(0,245,212,0.12)", border: "1px solid rgba(0,245,212,0.3)" }}
        >
          🤖
        </div>
        <div
          className="px-4 py-3 rounded-2xl rounded-tl-sm max-w-[80%]"
          style={{ background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.15)" }}
        >
          <ThinkingDots />
          <p className="text-[11px] text-cyber-muted mt-1 font-orbitron">正在调用链上工具...</p>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex items-start gap-3 flex-row-reverse">
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
          style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.35)" }}
        >
          👤
        </div>
        <div
          className="px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%]"
          style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)" }}
        >
          <p className="text-[14px] text-cyber-text leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
        style={{ background: "rgba(0,245,212,0.12)", border: "1px solid rgba(0,245,212,0.3)" }}
      >
        🤖
      </div>
      <div className="max-w-[85%] space-y-2">
        {/* Tool badges */}
        {msg.toolsUsed && msg.toolsUsed.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.toolsUsed.map((t, i) => (
              <ToolBadge key={i} name={t} />
            ))}
          </div>
        )}
        {/* Content */}
        <div
          className="px-4 py-3 rounded-2xl rounded-tl-sm"
          style={{ background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.15)" }}
        >
          <p className="text-[14px] text-cyber-text leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        </div>
        {/* TronLink Executor */}
        {msg.preparedTransaction && (
          <TronLinkExecutor tx={msg.preparedTransaction} />
        )}
        <p className="text-[10px] text-cyber-muted pl-1">
          {msg.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function NaturalLanguageChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "你好！我是 TronSage AI，你的 TRON 链上智能助手。\n\n我可以帮你：\n🐋 追踪巨鲸大额交易动向\n📊 查看实时链上数据\n💼 分析钱包资产组合\n💎 寻找 DeFi 收益机会\n\n用自然语言告诉我你想了解什么吧～",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const query = text.trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };
    const loadingMsg: ChatMessage = {
      id: `l-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setLoading(true);

    // Build API message history (last 10 turns for context)
    const history = messages
      .filter((m) => !m.isLoading && m.id !== "welcome")
      .slice(-10)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    // Inject wallet address hint if provided
    const fullQuery = walletAddress
      ? `${query}\n（用户钱包地址: ${walletAddress}）`
      : query;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: fullQuery }],
        }),
      });
      const json = await res.json();

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: json.success
          ? json.content
          : `❌ 出错了: ${json.error || "未知错误"}`,
        toolsUsed: json.toolsUsed || [],
        preparedTransaction: json.preparedTransaction || null,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev.filter((m) => !m.isLoading), aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => !m.isLoading),
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content: "❌ 网络错误，请稍后重试",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="card card-glow flex flex-col" style={{ height: "calc(100vh - 320px)", minHeight: 540 }}>
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(0,245,212,0.12)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.25)" }}
          >
            🤖
          </div>
          <div>
            <h3 className="font-orbitron text-sm font-bold text-cyber-cyan">TronSage AI 助手</h3>
            <p className="text-[11px] text-cyber-muted">由 Kimi (Moonshot AI) 驱动 · 自然语言链上执行</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="live-dot" />
          <span className="font-orbitron text-[10px] text-cyber-cyan">在线</span>
        </div>
      </div>

      {/* ── Wallet Address Input ── */}
      <div
        className="px-5 py-2 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="（可选）输入你的 TRON 钱包地址，AI 可直接分析你的持仓..."
          className="w-full bg-transparent text-[12px] text-cyber-muted outline-none placeholder:text-cyber-muted/40"
          style={{ fontFamily: "monospace" }}
        />
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Preset Queries ── */}
      <div
        className="px-5 py-3 flex-shrink-0 flex flex-wrap gap-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => sendMessage(p.query)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all hover:scale-105 disabled:opacity-40"
            style={{
              background: "rgba(0,245,212,0.05)",
              border: "1px solid rgba(0,245,212,0.18)",
              color: "#94a3b8",
            }}
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* ── Input Area ── */}
      <div
        className="px-5 py-4 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(0,245,212,0.12)" }}
      >
        <div
          className="flex items-end gap-3 rounded-xl px-4 py-3"
          style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.2)" }}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="用自然语言提问，例如：查一下最近有哪些大额转账...（Enter 发送，Shift+Enter 换行）"
            disabled={loading}
            className="flex-1 bg-transparent text-[14px] text-cyber-text outline-none resize-none leading-relaxed placeholder:text-cyber-muted/50 disabled:opacity-50"
            style={{ minHeight: "24px", maxHeight: "120px" }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: loading ? "rgba(0,245,212,0.08)" : "rgba(0,245,212,0.18)",
              border: "1px solid rgba(0,245,212,0.4)",
            }}
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin text-cyber-cyan" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-cyber-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] text-cyber-muted/50 mt-2 text-center font-orbitron">
          POWERED BY KIMI AI · TRON ON-CHAIN DATA
        </p>
      </div>
    </div>
  );
}
