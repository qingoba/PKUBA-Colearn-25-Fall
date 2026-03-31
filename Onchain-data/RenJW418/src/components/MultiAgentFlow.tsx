"use client";

import React, { useState, useEffect, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────

interface MultiAgentEvent {
  type: "start" | "payment" | "working" | "result" | "synthesis" | "complete";
  agentId?: string;
  agentName?: string;
  agentIcon?: string;
  agentColor?: string;
  message?: string;
  txHash?: string;
  amount?: string;
  data?: string;
  totalPaid?: string;
  timestamp: number;
}

interface SubAgent {
  id: string;
  name: string;
  address: string;
  specialty: string;
  cost: string;
  icon: string;
  color: string;
}

// ── Preset Queries ─────────────────────────────────────────────

const PRESET_QUERIES = [
  { icon: "🔍", label: "全面市场分析", query: "对当前TRON市场进行全面分析，包括价格、巨鲸动向和风险评估" },
  { icon: "📊", label: "投资建议报告", query: "帮我分析现在是否适合买入TRX，给出详细投资建议" },
  { icon: "🚨", label: "风险警报扫描", query: "扫描当前链上是否存在异常风险信号" },
];

// ── EventLine Component ────────────────────────────────────────

function EventLine({ event, index, visible }: { event: MultiAgentEvent; index: number; visible: boolean }) {
  const style: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : "translateX(-20px)",
    transition: `opacity 0.4s ease ${index * 0.15}s, transform 0.4s ease ${index * 0.15}s`,
  };

  if (event.type === "start") {
    return (
      <div style={style} className="flex items-center gap-3 py-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
          style={{ background: "rgba(0,245,212,0.15)", border: "1px solid rgba(0,245,212,0.3)" }}>
          🧠
        </div>
        <div>
          <p className="font-orbitron text-[11px] font-bold text-cyber-cyan">TRONSAGE ORCHESTRATOR</p>
          <p className="text-[13px] text-cyber-text mt-0.5">{event.message}</p>
        </div>
      </div>
    );
  }

  if (event.type === "payment") {
    return (
      <div style={{ ...style, borderLeftColor: event.agentColor || "#00F5D4", borderLeftWidth: "2px", borderLeftStyle: "solid" }}
        className="flex items-center gap-3 py-2 pl-4">
        {/* Flow arrow */}
        <div className="flex items-center gap-2 text-[11px] text-cyber-muted font-orbitron flex-shrink-0">
          <span>TronSage</span>
          <span className="text-cyber-cyan">→</span>
          <span style={{ color: event.agentColor }}>{event.agentIcon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-cyber-text truncate">{event.message}</p>
          <p className="text-[10px] text-cyber-muted font-mono mt-0.5">
            TX: {event.txHash?.slice(0, 24)}...
          </p>
        </div>
        <div className="flex-shrink-0 px-2 py-1 rounded text-[11px] font-orbitron font-bold"
          style={{ background: "rgba(0,245,212,0.08)", color: "#00F5D4", border: "1px solid rgba(0,245,212,0.2)" }}>
          -{event.amount} USDT
        </div>
      </div>
    );
  }

  if (event.type === "result") {
    // Parse JSON and render a human-readable Chinese summary
    let summary: React.ReactNode = <span className="text-[12px] text-cyber-text">{event.data}</span>;
    try {
      const parsed = JSON.parse(event.data || "{}");
      const lines: string[] = [];
      if (parsed.trxPrice !== undefined)
        lines.push(`📈 TRX 当前价格：$${parsed.trxPrice}  |  24h 涨跌：${parsed.change24h > 0 ? "+" : ""}${parsed.change24h}%`);
      if (parsed.volume24h !== undefined)
        lines.push(`💹 24h 成交量：$${(parsed.volume24h / 1e6).toFixed(1)}M  |  市值：$${(parsed.marketCap / 1e9).toFixed(2)}B`);
      if (parsed.largeTransactions !== undefined)
        lines.push(`🐋 大额转账笔数：${parsed.largeTransactions} 笔  |  总转移量：$${(parsed.totalVolume / 1e6).toFixed(2)}M`);
      if (parsed.topWhaleAction)
        lines.push(`🧭 主力动向：${parsed.topWhaleAction === "accumulating" ? "积极建仓 🟢" : "分批派发 🔴"}  |  警戒级别：${parsed.alertLevel === "high" ? "高风险 ⚠️" : "正常 ✅"}`);
      if (parsed.fearGreedIndex !== undefined)
        lines.push(`😨 恐贫指数：${parsed.fearGreedIndex}  |  市场情绪：${parsed.sentiment === "greed" ? "贪婪" : parsed.sentiment === "fear" ? "恐惧" : "中性"}`);
      if (parsed.volatilityScore !== undefined)
        lines.push(`📊 波动率评分：${parsed.volatilityScore}  |  建议操作：${parsed.recommendation}`);
      if (lines.length > 0) {
        summary = (
          <div className="flex flex-col gap-1.5">
            {lines.map((l, i) => (
              <p key={i} className="text-[12px] text-cyber-text leading-relaxed">{l}</p>
            ))}
          </div>
        );
      }
    } catch { /* use raw data */ }

    return (
      <div style={style} className="flex items-start gap-3 py-2 pl-6">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
          style={{ background: `${event.agentColor}18`, border: `1px solid ${event.agentColor}40` }}>
          {event.agentIcon}
        </div>
        <div className="flex-1 rounded-lg px-3 py-2"
          style={{ background: `${event.agentColor}08`, border: `1px solid ${event.agentColor}20` }}>
          <p className="font-orbitron text-[10px] font-bold mb-2" style={{ color: event.agentColor }}>
            {event.agentName?.toUpperCase()} · 链上结果
          </p>
          {summary}
        </div>
      </div>
    );
  }

  if (event.type === "synthesis") {
    return (
      <div style={{ ...style, background: "rgba(0,245,212,0.05)", border: "1px solid rgba(0,245,212,0.15)" }}
        className="py-3 px-4 rounded-xl mt-2">
        <p className="font-orbitron text-[11px] font-bold text-cyber-cyan mb-2">🧠 TronSage 综合分析</p>
        <p className="text-[13px] text-cyber-text leading-relaxed whitespace-pre-wrap">{event.message}</p>
      </div>
    );
  }

  if (event.type === "complete") {
    return (
      <div style={{ ...style, background: "rgba(0,245,212,0.05)", border: "1px solid rgba(0,245,212,0.15)" }}
        className="flex items-center justify-between py-2 px-4 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-sm">✅</span>
          <p className="text-[12px] text-cyber-text">{event.message}</p>
        </div>
        <div className="font-orbitron text-[11px] font-bold"
          style={{ color: "#FFD700" }}>
          总支出: {event.totalPaid} USDT
        </div>
      </div>
    );
  }

  return null;
}

// ── Agent Node Visualization ───────────────────────────────────

function AgentNode({ agent, active, paid }: { agent: SubAgent; active: boolean; paid: boolean }) {
  return (
    <div
      className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-500"
      style={{
        background: active ? `${agent.color}15` : "rgba(255,255,255,0.02)",
        border: `1px solid ${active ? agent.color + "50" : "rgba(255,255,255,0.06)"}`,
        boxShadow: active ? `0 0 20px ${agent.color}20` : "none",
        transform: active ? "scale(1.04)" : "scale(1)",
      }}
    >
      <div className="text-2xl">{agent.icon}</div>
      <p className="font-orbitron text-[9px] font-bold text-center leading-tight" style={{ color: agent.color }}>
        {agent.name.toUpperCase()}
      </p>
      <p className="text-[9px] text-cyber-muted text-center">{agent.specialty}</p>
      <div
        className="px-2 py-0.5 rounded-full font-orbitron text-[9px] font-bold"
        style={{
          background: paid ? "rgba(0,245,212,0.1)" : "rgba(255,255,255,0.04)",
          color: paid ? "#00F5D4" : "#666",
          border: `1px solid ${paid ? "rgba(0,245,212,0.3)" : "rgba(255,255,255,0.08)"}`,
        }}
      >
        {paid ? `✓ ${agent.cost} USDT` : agent.cost + " USDT"}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function MultiAgentFlow() {
  const [events, setEvents] = useState<MultiAgentEvent[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [subAgents, setSubAgents] = useState<SubAgent[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [paidAgents, setPaidAgents] = useState<Set<string>>(new Set());
  const [totalPaid, setTotalPaid] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load sub-agent registry
  useEffect(() => {
    fetch("/api/multi-agent")
      .then((r) => r.json())
      .then((d) => setSubAgents(d.subAgents || []))
      .catch(() => {});
  }, []);

  // Animate events
  useEffect(() => {
    if (events.length > visibleCount) {
      const timer = setTimeout(() => {
        setVisibleCount((n) => n + 1);
        const latest = events[visibleCount];
        if (latest?.type === "payment" && latest.agentId) {
          setActiveAgent(latest.agentId);
        }
        if (latest?.type === "result" && latest.agentId) {
          const newId = latest.agentId;
          setPaidAgents((prev) => { const next = new Set(Array.from(prev)); next.add(newId); return next; });
          setActiveAgent(null);
        }
        if (latest?.type === "complete" && latest.totalPaid) {
          setTotalPaid(latest.totalPaid);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [events, visibleCount]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount]);

  const runAnalysis = async (q: string) => {
    if (loading) return;
    const finalQuery = q || query || "对当前TRON市场进行全面多维度分析";

    setLoading(true);
    setEvents([]);
    setVisibleCount(0);
    setActiveAgent(null);
    setPaidAgents(new Set());
    setTotalPaid(null);

    try {
      const res = await fetch("/api/multi-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: finalQuery }),
      });
      const data = await res.json() as { success: boolean; events?: MultiAgentEvent[]; totalPaid?: string; error?: string };

      if (data.success && data.events) {
        setEvents(data.events);
      } else {
        setEvents([{
          type: "start",
          message: `❌ 错误: ${data.error || "未知错误"}`,
          timestamp: Date.now(),
        }]);
      }
    } catch {
      setEvents([{
        type: "start",
        message: "❌ 网络错误，请重试",
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card card-glow p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-orbitron text-lg font-black text-cyber-cyan mb-1">
              🤖 Multi-Agent Economy
            </h2>
            <p className="text-[13px] text-cyber-muted">
              TronSage 作为主 Agent，雇佣专业子 Agent 协作分析，通过{" "}
              <span className="text-cyber-cyan font-semibold">x402 Protocol</span>{" "}
              自动完成 Agent 间微支付
            </p>
          </div>
          <div
            className="flex-shrink-0 px-3 py-1.5 rounded-lg font-orbitron text-[10px] font-bold"
            style={{ background: "rgba(168,85,247,0.1)", color: "#A855F7", border: "1px solid rgba(168,85,247,0.25)" }}
          >
            Bank of AI x402
          </div>
        </div>

        {/* Agent Network Visualization */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {/* Orchestrator */}
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl"
            style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.25)" }}>
            <div className="text-2xl">🧠</div>
            <p className="font-orbitron text-[9px] font-bold text-cyber-cyan text-center">TRONSAGE</p>
            <p className="text-[9px] text-cyber-muted text-center">主 Orchestrator</p>
            <div className="px-2 py-0.5 rounded-full font-orbitron text-[9px] font-bold"
              style={{ background: "rgba(0,245,212,0.1)", color: "#00F5D4", border: "1px solid rgba(0,245,212,0.3)" }}>
              {totalPaid ? `-${totalPaid} USDT` : "Coordinator"}
            </div>
          </div>

          {/* Sub-agents */}
          {subAgents.slice(0, 3).map((agent) => (
            <AgentNode
              key={agent.id}
              agent={agent}
              active={activeAgent === agent.id}
              paid={paidAgents.has(agent.id)}
            />
          ))}
        </div>

        {/* Query Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runAnalysis(query)}
            placeholder="输入分析任务（或选择下方快捷任务）..."
            className="flex-1 px-4 py-2.5 rounded-xl text-[13px] text-cyber-text outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(0,245,212,0.15)",
            }}
          />
          <button
            onClick={() => runAnalysis(query)}
            disabled={loading}
            className="btn-cyber btn-cyber-primary px-5 py-2.5 rounded-xl font-orbitron text-[12px] disabled:opacity-50"
          >
            {loading ? "运行中..." : "▶ 启动"}
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 mt-3">
          {PRESET_QUERIES.map((p) => (
            <button
              key={p.label}
              onClick={() => runAnalysis(p.query)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all hover:scale-105 disabled:opacity-40"
              style={{
                background: "rgba(0,245,212,0.05)",
                border: "1px solid rgba(0,245,212,0.15)",
                color: "#9BAFC4",
              }}
            >
              <span>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Stream */}
      {events.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="live-dot" />
            <h3 className="font-orbitron text-[12px] font-bold text-cyber-cyan">AGENT EXECUTION LOG</h3>
          </div>

          <div className="space-y-2">
            {events.slice(0, visibleCount).map((evt, i) => (
              <EventLine key={i} event={evt} index={i} visible />
            ))}

            {loading && visibleCount < events.length && (
              <div className="flex items-center gap-2 py-2 pl-4 text-[12px] text-cyber-muted">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-cyber-cyan inline-block"
                      style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
                正在处理...
              </div>
            )}
          </div>

          <div ref={bottomRef} />
        </div>
      )}

      {/* Empty state */}
      {events.length === 0 && !loading && (
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3">🤖</p>
          <p className="font-orbitron text-[13px] font-bold text-cyber-cyan mb-1">
            Agent Economy 演示
          </p>
          <p className="text-[12px] text-cyber-muted max-w-sm mx-auto">
            点击"启动"后，TronSage 将实时雇佣 3 个专业 Agent，每次调用均通过 x402 协议
            自动完成微支付，可在上方 Agent 网络图中看到资金流动。
          </p>
        </div>
      )}
    </div>
  );
}
