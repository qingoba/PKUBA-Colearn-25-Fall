"use client";

import { useState } from "react";
import { WalletPortfolio } from "@/types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#00F5D4", "#A855F7", "#FFD700", "#FF3366", "#3B82F6", "#34D399", "#F97316"];

const DEMO_PORTFOLIO: WalletPortfolio = {
  address: "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax",
  totalValueUsd: 284_720.5,
  trxBalance: 425_000,
  trxValueUsd: 58_650,
  tokens: [
    { symbol: "USDT", name: "Tether USD", balance: 180_000, usdValue: 180_000, priceUsd: 1.0, change24h: 0.01, contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" },
    { symbol: "USDD", name: "Decentralized USD", balance: 32_000, usdValue: 32_140, priceUsd: 1.004, change24h: 0.4, contractAddress: "TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn" },
    { symbol: "JST", name: "JUST", balance: 50_000, usdValue: 8_250, priceUsd: 0.165, change24h: -2.1, contractAddress: "TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZkQf" },
    { symbol: "WIN", name: "WINkLink", balance: 12_000_000, usdValue: 5_680, priceUsd: 0.000473, change24h: 5.2, contractAddress: "WINkLink" },
  ],
  change24h: 1.8,
  lastActivity: Date.now() - 7200000,
  accountType: "whale",
  transactionCount: 4820,
};

function TokenRow({ token, total }: { token: WalletPortfolio["tokens"][0]; total: number }) {
  const pct = total > 0 ? (token.usdValue / total) * 100 : 0;
  return (
    <tr className="group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-orbitron text-[10px] font-bold"
            style={{ background: "rgba(0,245,212,0.12)", color: "#00F5D4", border: "1px solid rgba(0,245,212,0.25)" }}
          >
            {token.symbol.slice(0, 2)}
          </div>
          <div>
            <p className="font-semibold text-[13px] text-cyber-text">{token.symbol}</p>
            <p className="text-[11px] text-cyber-muted">{token.name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="font-mono text-[13px] text-cyber-text">
          {token.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="font-mono text-[13px] font-semibold text-cyber-text">
          ${token.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`font-mono text-[12px] font-semibold ${token.change24h >= 0 ? "text-emerald-400" : "text-cyber-red"}`}>
          {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="progress-bar flex-1" style={{ height: "6px" }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="font-mono text-[11px] text-cyber-muted w-10 text-right">
            {pct.toFixed(1)}%
          </span>
        </div>
      </td>
    </tr>
  );
}

export default function PortfolioAnalyzer() {
  const [address, setAddress] = useState("");
  const [portfolio, setPortfolio] = useState<WalletPortfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolio = async (addr?: string) => {
    const target = (addr || address).trim();
    if (!target) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolio?address=${target}`);
      const json = await res.json();
      if (json.success) {
        setPortfolio(json.data);
      } else {
        setError(json.error || "Failed to load portfolio");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = () => {
    setPortfolio(DEMO_PORTFOLIO);
    setAddress(DEMO_PORTFOLIO.address);
    setError(null);
  };

  const pieData = portfolio
    ? [
        { name: "TRX", value: portfolio.trxValueUsd },
        ...portfolio.tokens.map((t) => ({ name: t.symbol, value: t.usdValue })),
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="card card-glow flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-cyber-border flex items-center gap-3">
        <div className="text-2xl">💼</div>
        <div>
          <h2 className="font-orbitron text-sm font-bold text-cyber-text tracking-wide">
            PORTFOLIO ANALYZER
          </h2>
          <p className="text-xs text-cyber-muted mt-0.5">
            TRON wallet on-chain intelligence
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            className="cyber-input flex-1 text-sm font-mono"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter TRON wallet address (starts with T...)"
            onKeyDown={(e) => e.key === "Enter" && loadPortfolio()}
          />
          <button
            onClick={() => loadPortfolio()}
            disabled={loading || !address.trim()}
            className={`btn-cyber btn-cyber-primary px-4 ${(!address.trim() || loading) ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "..." : "Scan"}
          </button>
        </div>
        <button
          onClick={loadDemo}
          className="w-full py-2 rounded-lg border border-purple-500/25 bg-purple-500/8 text-purple-400 font-orbitron text-[11px] tracking-wider hover:bg-purple-500/15 transition-all"
        >
          🎭 Load Demo Whale Wallet
        </button>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg border border-cyber-red/30 bg-cyber-red/8">
            <p className="text-cyber-red text-[13px]">{error}</p>
          </div>
        )}

        {/* Portfolio Display */}
        {portfolio && (
          <div className="space-y-5 fade-in-up">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="stat-card">
                <span className="stat-label">Total Value</span>
                <span className="font-orbitron text-lg font-bold text-cyber-cyan"
                  style={{ textShadow: "0 0 8px rgba(0,245,212,0.4)" }}>
                  ${(portfolio.totalValueUsd / 1000).toFixed(1)}K
                </span>
                <span className={`text-[11px] font-semibold ${portfolio.change24h >= 0 ? "text-emerald-400" : "text-cyber-red"}`}>
                  {portfolio.change24h >= 0 ? "+" : ""}{portfolio.change24h.toFixed(2)}% 24h
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">TRX Balance</span>
                <span className="font-orbitron text-base font-bold text-cyber-text">
                  {(portfolio.trxBalance / 1000).toFixed(0)}K
                </span>
                <span className="text-[11px] text-cyber-muted">${portfolio.trxValueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Account Type</span>
                <span className={`tag mt-1 ${portfolio.accountType === "whale" ? "tag-gold" : "tag-cyan"}`}>
                  {portfolio.accountType === "whale" ? "🐋 Whale" : "👤 " + portfolio.accountType}
                </span>
                <span className="text-[11px] text-cyber-muted">{portfolio.transactionCount.toLocaleString()} txs</span>
              </div>
            </div>

            {/* Pie Chart + Token Table */}
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-2">
                <h4 className="font-orbitron text-[10px] font-bold text-cyber-muted tracking-widest mb-3">
                  ALLOCATION
                </h4>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                      contentStyle={{
                        background: "#0D1B36",
                        border: "1px solid rgba(0,245,212,0.2)",
                        borderRadius: "8px",
                        color: "#C8DDF0",
                        fontFamily: "monospace",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {pieData.slice(0, 4).map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-[11px] text-cyber-muted flex-1">{d.name}</span>
                      <span className="text-[11px] font-mono text-cyber-text">
                        {((d.value / portfolio.totalValueUsd) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-3 overflow-x-auto">
                <h4 className="font-orbitron text-[10px] font-bold text-cyber-muted tracking-widest mb-3">
                  TOKENS
                </h4>
                <table className="cyber-table">
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th className="text-right">Balance</th>
                      <th className="text-right">Value</th>
                      <th className="text-right">24h</th>
                      <th>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* TRX row */}
                    <tr>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center font-orbitron text-[10px] font-bold"
                            style={{ background: "rgba(255,51,102,0.12)", color: "#ff3366", border: "1px solid rgba(255,51,102,0.25)" }}>
                            TR
                          </div>
                          <div>
                            <p className="font-semibold text-[13px] text-cyber-text">TRX</p>
                            <p className="text-[11px] text-cyber-muted">TRON</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-[13px] text-cyber-text">
                          {portfolio.trxBalance.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-[13px] font-semibold text-cyber-text">
                          ${portfolio.trxValueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">—</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="progress-bar flex-1" style={{ height: "6px" }}>
                            <div className="progress-fill"
                              style={{ width: `${(portfolio.trxValueUsd / portfolio.totalValueUsd) * 100}%` }} />
                          </div>
                          <span className="font-mono text-[11px] text-cyber-muted w-10 text-right">
                            {((portfolio.trxValueUsd / portfolio.totalValueUsd) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                    {portfolio.tokens.map((t) => (
                      <TokenRow key={t.symbol} token={t} total={portfolio.totalValueUsd} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Address */}
            <div className="px-4 py-3 rounded-lg bg-cyber-black/50 flex items-center justify-between">
              <span className="font-mono text-[12px] text-cyber-muted">
                {portfolio.address}
              </span>
              <a
                href={`https://tronscan.org/#/address/${portfolio.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-cyber-cyan hover:underline ml-4 shrink-0"
              >
                View on TronScan →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
