"use client";

import { useState, useEffect, useCallback } from "react";
import { WhaleTransaction } from "@/types";
import { formatDistanceToNow } from "date-fns";

const TRONSCAN_TX = "https://tronscan.org/#/transaction/";
const TRONSCAN_ADDR = "https://tronscan.org/#/address/";

function shorten(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
}

function formatAmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

function AmountBadge({ amount, token }: { amount: number; token: string }) {
  let colorClass = "text-cyber-text";
  let glowStyle = {};
  if (amount >= 5_000_000) {
    colorClass = "glow-gold font-bold";
    glowStyle = {};
  } else if (amount >= 1_000_000) {
    colorClass = "text-cyber-cyan font-semibold";
    glowStyle = { textShadow: "0 0 8px rgba(0,245,212,0.6)" };
  } else if (amount >= 500_000) {
    colorClass = "text-emerald-400";
  }
  return (
    <span className={`${colorClass} font-mono`} style={glowStyle}>
      {formatAmt(amount)} {token}
    </span>
  );
}

function RowSkeleton() {
  return (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="shimmer h-4 rounded" style={{ width: `${60 + i * 12}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function WhaleTracker() {
  const [txs, setTxs] = useState<WhaleTransaction[]>([]);
  const [filter, setFilter] = useState<"ALL" | "USDT" | "USDD">("ALL");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/whale-tracker?token=${filter}&min=5000`);
      const json = await res.json();
      if (json.success) {
        setTxs(json.data);
        setLastUpdated(new Date());
      }
    } catch {
      // Keep previous data
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  const filters: Array<"ALL" | "USDT" | "USDD"> = ["ALL", "USDT", "USDD"];

  return (
    <div className="card card-glow flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cyber-border">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🐋</div>
          <div>
            <h2 className="font-orbitron text-sm font-bold text-cyber-text tracking-wide">
              WHALE TRACKER
            </h2>
            <p className="text-xs text-cyber-muted mt-0.5">
              Large transfers &gt; $100K on TRON
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-cyber-black/60 rounded-lg p-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-orbitron font-bold tracking-wider transition-all ${
                  filter === f
                    ? "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 shadow-cyan-sm"
                    : "text-cyber-muted hover:text-cyber-text"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <div className="live-dot" />
            <span className="font-orbitron text-[10px] text-cyber-cyan tracking-wider">
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <div className="px-6 py-2 bg-cyber-black/30 border-b border-white/5">
          <span className="text-[11px] text-cyber-muted font-mono">
            Last updated:{" "}
            {formatDistanceToNow(lastUpdated, { addSuffix: true })} · Auto-refresh
            every 30s
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="cyber-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>From</th>
              <th>To</th>
              <th className="text-right">Amount</th>
              <th>Token</th>
              <th>Type</th>
              <th>Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <RowSkeleton key={i} />)
              : txs.length === 0
              ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-cyber-muted">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl opacity-40">🐋</span>
                      <span className="font-mono text-sm">
                        No whale transactions detected
                      </span>
                    </div>
                  </td>
                </tr>
              )
              : txs.map((tx) => (
                <tr key={tx.hash} className="group">
                  <td className="text-cyber-muted text-[12px] whitespace-nowrap">
                    {tx.timestamp
                      ? formatDistanceToNow(new Date(tx.timestamp), {
                          addSuffix: true,
                        })
                      : "—"}
                  </td>
                  <td>
                    <a
                      href={`${TRONSCAN_ADDR}${tx.from}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[12px] text-cyber-text hover:text-cyber-cyan transition-colors"
                    >
                      {shorten(tx.from)}
                      {tx.isExchange && (
                        <span className="ml-1.5 tag tag-purple text-[9px]">
                          Exchange
                        </span>
                      )}
                    </a>
                  </td>
                  <td>
                    <a
                      href={`${TRONSCAN_ADDR}${tx.to}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[12px] text-cyber-text hover:text-cyber-cyan transition-colors"
                    >
                      {shorten(tx.to)}
                    </a>
                  </td>
                  <td className="text-right">
                    <AmountBadge amount={tx.amount} token={tx.tokenSymbol} />
                  </td>
                  <td>
                    <span
                      className={`tag text-[10px] ${
                        tx.tokenSymbol === "USDT"
                          ? "tag-cyan"
                          : tx.tokenSymbol === "USDD"
                          ? "tag-gold"
                          : "tag-gray"
                      }`}
                    >
                      {tx.tokenSymbol}
                    </span>
                  </td>
                  <td>
                    <span className="tag tag-gray text-[10px]">Transfer</span>
                  </td>
                  <td>
                    <a
                      href={`${TRONSCAN_TX}${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[11px] text-cyber-muted hover:text-cyber-cyan transition-colors flex items-center gap-1"
                    >
                      {tx.hash.slice(0, 12)}...
                      <svg
                        className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[11px] text-cyber-muted font-mono">
          Showing {txs.length} transactions · Data from TronScan
        </span>
        <a
          href="https://tronscan.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-cyber-cyan hover:underline"
        >
          View on TronScan →
        </a>
      </div>
    </div>
  );
}
