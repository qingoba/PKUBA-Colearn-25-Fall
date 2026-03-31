"use client";

import { useState, useEffect } from "react";
import { TronNetworkStats } from "@/types";

function StatItem({
  label,
  value,
  change,
  loading,
}: {
  label: string;
  value: string;
  change?: number | null;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-5 py-3 border-r border-cyber-border last:border-r-0">
      <span className="stat-label">{label}</span>
      {loading ? (
        <div className="shimmer h-5 w-20 rounded mt-1" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span
            className="font-orbitron text-[15px] font-bold text-cyber-text leading-none"
            style={{ letterSpacing: "-0.02em" }}
          >
            {value}
          </span>
          {change !== null && change !== undefined && (
            <span
              className={`text-[11px] font-semibold ${
                change >= 0 ? "text-emerald-400" : "text-cyber-red"
              }`}
            >
              {change >= 0 ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function LiveBlock({ height, loading }: { height: number; loading: boolean }) {
  const [current, setCurrent] = useState(height);

  useEffect(() => {
    setCurrent(height);
    if (!height) return;
    const id = setInterval(() => setCurrent((n) => n + 1), 3000);
    return () => clearInterval(id);
  }, [height]);

  return (
    <div className="flex flex-col gap-0.5 px-5 py-3">
      <span className="stat-label">Block Height</span>
      {loading ? (
        <div className="shimmer h-5 w-24 rounded mt-1" />
      ) : (
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[15px] font-bold text-cyber-cyan leading-none"
            style={{ textShadow: "0 0 8px rgba(0,245,212,0.6)" }}
          >
            #{current.toLocaleString()}
          </span>
          <span className="live-dot" />
        </div>
      )}
    </div>
  );
}

export default function StatsBar() {
  const [stats, setStats] = useState<TronNetworkStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/stats");
        const json = await res.json();
        if (json.success) setStats(json.data);
      } catch {
        // Use fallback
        setStats({
          trxPrice: 0.138,
          priceChange24h: 2.4,
          marketCap: 12_006_000_000,
          volume24h: 620_000_000,
          tps: 67,
          blockHeight: 63_547_291,
          totalAccounts: 256_389_441,
          burnedTrx: 84_321_000,
          totalTransactions: 9_843_000_000,
          energyUsed24h: 423_000_000_000,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  const fmt = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
    return `$${n.toLocaleString()}`;
  };

  return (
    <div className="w-full overflow-x-auto border-b border-cyber-border bg-cyber-dark/60 backdrop-blur-sm">
      <div className="flex items-stretch min-w-max">
        {/* TRON Network Label */}
        <div className="flex items-center gap-2 px-5 py-3 border-r border-cyber-border">
          <div
            className="w-2 h-2 rounded-full bg-cyber-red"
            style={{ boxShadow: "0 0 8px rgba(255,51,102,0.8)" }}
          />
          <span className="font-orbitron text-[10px] font-bold text-cyber-red tracking-widest uppercase">
            TRON Network
          </span>
        </div>

        <StatItem
          label="TRX Price"
          value={stats ? `$${stats.trxPrice.toFixed(4)}` : "—"}
          change={stats?.priceChange24h}
          loading={loading}
        />
        <StatItem
          label="Market Cap"
          value={stats ? fmt(stats.marketCap) : "—"}
          loading={loading}
        />
        <StatItem
          label="24h Volume"
          value={stats ? fmt(stats.volume24h) : "—"}
          loading={loading}
        />
        <StatItem
          label="TPS"
          value={stats ? `${stats.tps}` : "—"}
          loading={loading}
        />
        <StatItem
          label="Accounts"
          value={
            stats
              ? `${(stats.totalAccounts / 1e6).toFixed(1)}M`
              : "—"
          }
          loading={loading}
        />
        <StatItem
          label="Burned TRX"
          value={
            stats ? `${(stats.burnedTrx / 1e6).toFixed(1)}M` : "—"
          }
          loading={loading}
        />
        <LiveBlock
          height={stats?.blockHeight ?? 0}
          loading={loading}
        />
      </div>
    </div>
  );
}
