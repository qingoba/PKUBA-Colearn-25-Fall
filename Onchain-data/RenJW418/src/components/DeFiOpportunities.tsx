"use client";

import { useState, useEffect, useCallback } from "react";
import { DeFiOpportunity, DeFiCategory } from "@/types";

function RiskDot({ risk }: { risk: string }) {
  const color = risk === "Low" ? "#34d399" : risk === "Medium" ? "#fbbf24" : "#ff3366";
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      <span className="text-[12px]" style={{ color }}>
        {risk}
      </span>
    </span>
  );
}

function APYBadge({ apy }: { apy: number }) {
  let style: React.CSSProperties;
  if (apy >= 30) {
    style = { color: "#ff3366", textShadow: "0 0 8px rgba(255,51,102,0.5)" };
  } else if (apy >= 15) {
    style = { color: "#fbbf24", textShadow: "0 0 8px rgba(251,191,36,0.5)" };
  } else {
    style = { color: "#34d399" };
  }
  return (
    <span className="font-orbitron font-bold text-[15px]" style={style}>
      {apy.toFixed(1)}%
    </span>
  );
}

function TVLBadge({ tvl }: { tvl: number }) {
  const formatted =
    tvl >= 1e9
      ? `$${(tvl / 1e9).toFixed(2)}B`
      : tvl >= 1e6
      ? `$${(tvl / 1e6).toFixed(1)}M`
      : `$${tvl.toLocaleString()}`;
  return <span className="font-mono text-[13px] text-cyber-text">{formatted}</span>;
}

const CATEGORIES: Array<{ id: string; label: string }> = [
  { id: "all", label: "All" },
  { id: "DEX", label: "DEX" },
  { id: "Lending", label: "Lending" },
  { id: "Staking", label: "Staking" },
  { id: "Yield", label: "Yield" },
];

export default function DeFiOpportunities() {
  const [opps, setOpps] = useState<DeFiOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"apy" | "tvl" | "risk">("apy");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/defi?category=${category}&sort=${sortBy}`);
      const json = await res.json();
      if (json.success) setOpps(json.data);
    } catch {/* keep previous */}
    finally { setLoading(false); }
  }, [category, sortBy]);

  useEffect(() => { load(); }, [load]);

  const top3 = opps.slice(0, 3);
  const rest = opps.slice(3);

  return (
    <div className="card card-glow flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-cyber-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">💎</div>
          <div>
            <h2 className="font-orbitron text-sm font-bold text-cyber-text tracking-wide">
              DEFI OPPORTUNITIES
            </h2>
            <p className="text-xs text-cyber-muted mt-0.5">
              TRON ecosystem yield strategies
            </p>
          </div>
        </div>
        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-cyber-muted font-orbitron">SORT:</span>
          {(["apy", "tvl", "risk"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1 rounded text-[10px] font-orbitron font-bold tracking-wider transition-all ${
                sortBy === s
                  ? "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30"
                  : "text-cyber-muted hover:text-cyber-text"
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Category Filter */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-4 py-1.5 rounded-full font-orbitron text-[11px] font-bold tracking-wider transition-all border ${
                category === c.id
                  ? "border-cyber-cyan/40 bg-cyber-cyan/12 text-cyber-cyan"
                  : "border-white/10 text-cyber-muted hover:border-white/25 hover:text-cyber-text"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shimmer h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Top 3 Featured */}
            {top3.length > 0 && category === "all" && (
              <div>
                <p className="font-orbitron text-[10px] font-bold text-cyber-muted tracking-widest mb-3">
                  ◈ TOP OPPORTUNITIES
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {top3.map((o, i) => (
                    <a
                      key={o.id}
                      href={o.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 rounded-xl border transition-all hover:border-cyber-cyan/30"
                      style={{
                        background: i === 0
                          ? "linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(13,27,54,0.9) 100%)"
                          : "rgba(13,27,54,0.7)",
                        borderColor: i === 0 ? "rgba(255,215,0,0.2)" : "rgba(0,245,212,0.12)",
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-orbitron text-[11px] font-bold shrink-0"
                          style={{
                            background: "rgba(0,245,212,0.1)",
                            color: "#00F5D4",
                            border: "1px solid rgba(0,245,212,0.2)",
                          }}
                        >
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[14px] text-cyber-text group-hover:text-cyber-cyan transition-colors">
                              {o.protocol}
                            </span>
                            <span className="font-mono text-[12px] text-cyber-muted">
                              {o.pair}
                            </span>
                            {o.audited && (
                              <span className="tag tag-cyan text-[9px]">Audited</span>
                            )}
                          </div>
                          <p className="text-[11px] text-cyber-muted mt-0.5">
                            {o.description.slice(0, 80)}...
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <APYBadge apy={o.apy} />
                        <p className="text-[10px] text-cyber-muted font-orbitron mt-0.5">APY</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Full Table */}
            <div>
              <p className="font-orbitron text-[10px] font-bold text-cyber-muted tracking-widest mb-3">
                ◈ ALL PROTOCOLS
              </p>
              <div className="overflow-x-auto">
                <table className="cyber-table">
                  <thead>
                    <tr>
                      <th>Protocol</th>
                      <th>Pair</th>
                      <th>Category</th>
                      <th className="text-right">APY</th>
                      <th className="text-right">TVL</th>
                      <th>Risk</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(category === "all" ? rest : opps).map((o) => (
                      <tr key={o.id} className="group">
                        <td className="px-4 py-3">
                          <span className="font-semibold text-[13px] text-cyber-text">
                            {o.protocol}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[12px] text-cyber-muted">
                            {o.pair}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`tag text-[10px] ${
                            o.category === "DEX" ? "tag-cyan" :
                            o.category === "Lending" ? "tag-purple" :
                            o.category === "Staking" ? "tag-gold" : "tag-red"
                          }`}>
                            {o.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <APYBadge apy={o.apy} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <TVLBadge tvl={o.tvl} />
                        </td>
                        <td className="px-4 py-3">
                          <RiskDot risk={o.risk} />
                        </td>
                        <td className="px-4 py-3">
                          {o.audited ? (
                            <span className="tag tag-cyan text-[9px]">✓ Audited</span>
                          ) : (
                            <span className="tag tag-red text-[9px]">Unaudited</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={o.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-cyber py-1 px-3 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Invest →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
