"use client";

import { useState, useEffect } from "react";
import { AgentIdentity, AgentActivity } from "@/types";
import { formatDistanceToNow } from "date-fns";

function ReputationGauge({ score }: { score: number }) {
  const angle = (score / 100) * 180;
  const r = 50;
  const cx = 60;
  const cy = 60;
  const startAngle = -180;
  const endAngle = startAngle + angle;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = angle > 180 ? 1 : 0;

  const color = score >= 80 ? "#00F5D4" : score >= 60 ? "#fbbf24" : "#ff3366";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={120} height={70} viewBox="0 0 120 70">
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        {/* Score text */}
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          fill={color}
          fontSize={18}
          fontFamily="Orbitron, monospace"
          fontWeight="bold"
        >
          {score}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="#4a6580" fontSize={9} fontFamily="Orbitron, monospace">
          REP
        </text>
      </svg>
    </div>
  );
}

function ActivityIcon({ type }: { type: AgentActivity["type"] }) {
  const icons: Record<AgentActivity["type"], string> = {
    analysis: "🔍",
    payment_received: "💰",
    job_completed: "✅",
    reputation_update: "⭐",
  };
  return <span className="text-sm">{icons[type]}</span>;
}

const TIER_COLORS: Record<string, string> = {
  Bronze: "#CD7F32",
  Silver: "#C0C0C0",
  Gold: "#FFD700",
  Diamond: "#00F5D4",
};

export default function AgentIdentityCard() {
  const [identity, setIdentity] = useState<AgentIdentity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/identity")
      .then((r) => r.json())
      .then((json) => { if (json.success) setIdentity(json.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card card-glow p-6 space-y-4">
        <div className="shimmer h-8 w-40 rounded" />
        <div className="shimmer h-24 w-full rounded" />
        <div className="shimmer h-40 w-full rounded" />
      </div>
    );
  }

  if (!identity) return null;

  const tierColor = TIER_COLORS[identity.tier] || "#00F5D4";

  return (
    <div className="card card-glow flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-cyber-border flex items-center gap-3">
        <div className="text-2xl">🆔</div>
        <div>
          <h2 className="font-orbitron text-sm font-bold text-cyber-text tracking-wide">
            AGENT IDENTITY
          </h2>
          <p className="text-xs text-cyber-muted mt-0.5">Bank of AI · 8004 Protocol</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Agent Card */}
        <div
          className="relative p-5 rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0D1B36 0%, #060D1E 100%)",
            border: `1px solid ${tierColor}33`,
            boxShadow: `0 0 30px ${tierColor}15`,
          }}
        >
          {/* Scan line effect */}
          <div className="scan-line absolute inset-0 pointer-events-none" />

          {/* Top row */}
          <div className="flex items-start justify-between mb-4">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: `linear-gradient(135deg, ${tierColor}20, ${tierColor}08)`,
                border: `1px solid ${tierColor}30`,
                boxShadow: `0 0 20px ${tierColor}15`,
              }}
            >
              🤖
            </div>
            {/* Verified badge */}
            <div className="flex flex-col items-end gap-1">
              {identity.verified && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-orbitron font-bold"
                  style={{ background: `${tierColor}15`, color: tierColor, border: `1px solid ${tierColor}25` }}
                >
                  ✓ VERIFIED
                </div>
              )}
              <span
                className="px-3 py-1 rounded-full font-orbitron text-[11px] font-bold"
                style={{ background: `${tierColor}20`, color: tierColor }}
              >
                {identity.tier} · Lv.{identity.level}
              </span>
            </div>
          </div>

          {/* Agent Name */}
          <h3
            className="font-orbitron text-xl font-black mb-1"
            style={{ color: tierColor, textShadow: `0 0 12px ${tierColor}60` }}
          >
            {identity.name}
          </h3>
          <p className="text-[12px] text-cyber-muted mb-3">
            {identity.id}
          </p>
          <p className="text-[12px] text-cyber-text leading-relaxed mb-4">
            {identity.bio}
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="font-orbitron text-xl font-bold text-cyber-text">
                {identity.totalJobs.toLocaleString()}
              </p>
              <p className="text-[10px] text-cyber-muted font-orbitron">JOBS</p>
            </div>
            <div className="text-center">
              <p className="font-orbitron text-xl font-bold text-emerald-400">
                {identity.successRate}%
              </p>
              <p className="text-[10px] text-cyber-muted font-orbitron">SUCCESS</p>
            </div>
            <div className="text-center">
              <p className="font-orbitron text-xl font-bold" style={{ color: "#00F5D4" }}>
                ${identity.totalEarned.toFixed(0)}
              </p>
              <p className="text-[10px] text-cyber-muted font-orbitron">EARNED</p>
            </div>
          </div>

          {/* Reputation gauge */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-cyber-muted font-orbitron mb-1">REPUTATION</p>
              <ReputationGauge score={identity.reputationScore} />
            </div>
            <div className="flex flex-col gap-1 items-end">
              <p className="text-[10px] text-cyber-muted font-orbitron">ADDRESS</p>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[11px] text-cyber-text">
                  {identity.address.slice(0, 8)}...{identity.address.slice(-6)}
                </span>
                <a
                  href={`https://tronscan.org/#/address/${identity.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyber-cyan text-xs hover:underline"
                >
                  ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div>
          <p className="font-orbitron text-[10px] font-bold text-cyber-muted tracking-widest mb-2">
            ◈ SPECIALIZATIONS
          </p>
          <div className="flex flex-wrap gap-2">
            {identity.specializations.map((s) => (
              <span key={s} className="tag tag-cyan text-[11px]">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div>
          <p className="font-orbitron text-[10px] font-bold text-cyber-muted tracking-widest mb-2">
            ◈ BADGES
          </p>
          <div className="grid grid-cols-2 gap-2">
            {identity.badges.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-2 p-2 rounded-lg"
                style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.1)" }}
                title={b.description}
              >
                <span className="text-xl">{b.icon}</span>
                <div>
                  <p className="text-[12px] font-semibold text-cyber-text">{b.name}</p>
                  <p className="text-[10px] text-cyber-muted">
                    {formatDistanceToNow(new Date(b.awardedAt * 1000), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <p className="font-orbitron text-[10px] font-bold text-cyber-muted tracking-widest mb-2">
            ◈ RECENT ACTIVITY
          </p>
          <div className="space-y-2">
            {identity.recentActivity.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-2 py-2 border-b border-white/5 last:border-0"
              >
                <ActivityIcon type={a.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-cyber-text leading-tight">
                    {a.description}
                    {a.amount && (
                      <span className="text-cyber-cyan ml-1">
                        +{a.amount} {a.token}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-cyber-muted mt-0.5">
                    {formatDistanceToNow(new Date(a.timestamp * 1000), { addSuffix: true })}
                    {a.txHash && (
                      <a
                        href={`https://tronscan.org/#/transaction/${a.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-cyber-cyan hover:underline"
                      >
                        {a.txHash.slice(0, 8)}...
                      </a>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bank of AI Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-cyber-cyan/15"
          style={{ background: "rgba(0,245,212,0.04)" }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏦</span>
            <div>
              <p className="text-[12px] font-semibold text-cyber-text">
                Powered by Bank of AI
              </p>
              <p className="text-[10px] text-cyber-muted">
                x402 Protocol · 8004 Identity
              </p>
            </div>
          </div>
          <a
            href="https://bankofai.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-cyber-cyan hover:underline"
          >
            bankofai.io ↗
          </a>
        </div>
      </div>
    </div>
  );
}
