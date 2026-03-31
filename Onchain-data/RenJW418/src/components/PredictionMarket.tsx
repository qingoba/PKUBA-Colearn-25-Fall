"use client";

import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────

interface Prediction {
  id: string;
  targetDate: string;
  predictedPrice: number;
  currentPriceAtPrediction: number;
  direction: "up" | "down" | "sideways";
  confidence: number;
  reasoning: string;
  signals: string[];
  createdAt: number;
  resolvedAt?: number;
  actualPrice?: number;
  outcome?: "correct" | "incorrect" | "partial";
  accuracyScore?: number;
  onChainTxHash?: string;
}

interface AccuracyStats {
  rate: number;
  total: number;
  correct: number;
  avgScore: number;
}

interface AgentStats {
  totalPredictions: number;
  streak: number;
  bestScore: number;
  worstScore: number;
}

// ── Direction Badge ────────────────────────────────────────────

function DirectionBadge({ direction, size = "sm" }: { direction: Prediction["direction"]; size?: "sm" | "lg" }) {
  const configs = {
    up: { color: "#00F5D4", icon: "▲", label: "看涨" },
    down: { color: "#FF3366", icon: "▼", label: "看跌" },
    sideways: { color: "#FFD700", icon: "◆", label: "横盘" },
  };
  const cfg = configs[direction];
  const isLg = size === "lg";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-orbitron font-bold ${isLg ? "px-3 py-1.5 text-[13px]" : "px-2 py-0.5 text-[10px]"}`}
      style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}35` }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ── Outcome Badge ──────────────────────────────────────────────

function OutcomeBadge({ outcome, score }: { outcome?: Prediction["outcome"]; score?: number }) {
  if (!outcome) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-orbitron text-[10px] font-bold"
        style={{ background: "rgba(168,85,247,0.1)", color: "#A855F7", border: "1px solid rgba(168,85,247,0.25)" }}>
        ⏳ 待验证
      </span>
    );
  }
  const configs = {
    correct: { color: "#00F5D4", label: "✓ 正确" },
    partial: { color: "#FFD700", label: "◑ 部分正确" },
    incorrect: { color: "#FF3366", label: "✗ 错误" },
  };
  const cfg = configs[outcome];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-orbitron text-[10px] font-bold"
      style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      {cfg.label} {score !== undefined && `(${score}分)`}
    </span>
  );
}

// ── Prediction Card ────────────────────────────────────────────

function PredictionCard({ pred, onResolve }: { pred: Prediction; onResolve: (id: string) => void }) {
  const isPending = !pred.resolvedAt;
  const priceChange = ((pred.predictedPrice - pred.currentPriceAtPrediction) / pred.currentPriceAtPrediction * 100);

  return (
    <div
      className="p-4 rounded-xl transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-orbitron text-[11px] font-bold text-cyber-muted">{pred.targetDate}</span>
          <DirectionBadge direction={pred.direction} />
        </div>
        <OutcomeBadge outcome={pred.outcome} score={pred.accuracyScore} />
      </div>

      {/* Price prediction */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="font-orbitron text-[9px] text-cyber-muted mb-1">预测前价格</p>
          <p className="font-orbitron text-[13px] font-bold text-cyber-text">
            ${pred.currentPriceAtPrediction.toFixed(4)}
          </p>
        </div>
        <div className="text-center p-2 rounded-lg"
          style={{ background: "rgba(0,245,212,0.05)", border: "1px solid rgba(0,245,212,0.12)" }}>
          <p className="font-orbitron text-[9px] text-cyber-cyan mb-1">AI 预测价格</p>
          <p className="font-orbitron text-[13px] font-bold text-cyber-cyan">
            ${pred.predictedPrice.toFixed(4)}
            <span className="text-[10px] ml-1" style={{ color: priceChange >= 0 ? "#00F5D4" : "#FF3366" }}>
              ({priceChange >= 0 ? "+" : ""}{priceChange.toFixed(1)}%)
            </span>
          </p>
        </div>
        <div className="text-center p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="font-orbitron text-[9px] text-cyber-muted mb-1">
            {pred.actualPrice ? "实际价格" : "信心度"}
          </p>
          <p className="font-orbitron text-[13px] font-bold"
            style={{ color: pred.actualPrice ? (pred.outcome === "correct" ? "#00F5D4" : pred.outcome === "incorrect" ? "#FF3366" : "#FFD700") : "#A855F7" }}>
            {pred.actualPrice ? `$${pred.actualPrice.toFixed(4)}` : `${pred.confidence}%`}
          </p>
        </div>
      </div>

      {/* Signals */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {pred.signals.map((s, i) => (
          <span key={i} className="px-2 py-0.5 rounded-full text-[10px] text-cyber-muted"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {s}
          </span>
        ))}
      </div>

      {/* Reasoning */}
      <p className="text-[12px] text-cyber-muted italic mb-3">"{pred.reasoning}"</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] text-cyber-muted/50">
          {pred.onChainTxHash?.slice(0, 30)}...
        </p>
        {isPending && (
          <button
            onClick={() => onResolve(pred.id)}
            className="px-3 py-1 rounded-lg font-orbitron text-[10px] font-bold transition-all hover:scale-105"
            style={{
              background: "rgba(0,245,212,0.08)",
              color: "#00F5D4",
              border: "1px solid rgba(0,245,212,0.25)",
            }}
          >
            ✅ 验证结果 → 8004
          </button>
        )}
      </div>
    </div>
  );
}

// ── Accuracy Gauge ─────────────────────────────────────────────

function AccuracyGauge({ rate }: { rate: number }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference * (1 - rate / 100);
  const color = rate >= 75 ? "#00F5D4" : rate >= 50 ? "#FFD700" : "#FF3366";

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-orbitron text-xl font-black" style={{ color }}>{rate}%</span>
        <span className="font-orbitron text-[9px] text-cyber-muted">准确率</span>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function PredictionMarket() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [accuracy, setAccuracy] = useState<AccuracyStats>({ rate: 0, total: 0, correct: 0, avgScore: 0 });
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch("/api/prediction");
      const data = await res.json() as {
        predictions: Prediction[];
        accuracy: AccuracyStats;
        agentStats: AgentStats;
      };
      setPredictions(data.predictions || []);
      setAccuracy(data.accuracy);
      setAgentStats(data.agentStats || null);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const generatePrediction = async () => {
    setGenerating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/prediction", { method: "POST" });
      const data = await res.json() as { success: boolean; message?: string; error?: string };
      setMessage(data.message || data.error || "完成");
      if (data.success) await loadData();
    } catch {
      setMessage("❌ 生成失败");
    } finally {
      setGenerating(false);
    }
  };

  const resolvePrediction = async (id: string) => {
    try {
      const res = await fetch("/api/prediction", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json() as { success: boolean; message?: string };
      setMessage(data.message || "已验证");
      if (data.success) await loadData();
    } catch {
      setMessage("❌ 验证失败");
    }
  };

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <div className="flex items-center justify-center gap-2 text-cyber-muted">
          <div className="w-4 h-4 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
          加载预测数据...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header Stats */}
      <div className="card card-glow p-5">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="font-orbitron text-lg font-black text-cyber-cyan mb-1">
              🔮 AI 预测市场
            </h2>
            <p className="text-[13px] text-cyber-muted">
              AI 每日预测 TRX 价格走势，结果验证后自动记录至{" "}
              <span className="text-purple-400 font-semibold">8004 链上身份</span>，
              积累可验证的预测信誉
            </p>
          </div>
          <button
            onClick={generatePrediction}
            disabled={generating}
            className="flex-shrink-0 btn-cyber btn-cyber-primary px-4 py-2 rounded-xl font-orbitron text-[11px] disabled:opacity-50"
          >
            {generating ? "生成中..." : "🔮 生成今日预测"}
          </button>
        </div>

        {message && (
          <div
            className="mb-4 px-4 py-2.5 rounded-lg text-[12px]"
            style={{
              background: message.startsWith("❌") ? "rgba(255,51,102,0.08)" : "rgba(0,245,212,0.08)",
              border: `1px solid ${message.startsWith("❌") ? "rgba(255,51,102,0.25)" : "rgba(0,245,212,0.25)"}`,
              color: message.startsWith("❌") ? "#FF3366" : "#00F5D4",
            }}
          >
            {message}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="md:col-span-1 flex flex-col items-center justify-center">
            <AccuracyGauge rate={accuracy.rate} />
          </div>
          {[
            { label: "总预测数", value: agentStats?.totalPredictions || 0, unit: "次", color: "#9BAFC4" },
            { label: "正确数", value: accuracy.correct, unit: "次", color: "#00F5D4" },
            { label: "连续正确", value: agentStats?.streak || 0, unit: "条", color: "#A855F7" },
            { label: "平均得分", value: accuracy.avgScore, unit: "分", color: "#FFD700" },
          ].map((s, i) => (
            <div key={i} className="text-center p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="font-orbitron text-[9px] text-cyber-muted mb-1">{s.label}</p>
              <p className="font-orbitron text-2xl font-black" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="font-orbitron text-[9px] text-cyber-muted">{s.unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div
        className="p-4 rounded-xl"
        style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)" }}
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl flex-shrink-0">🏆</span>
          <div>
            <p className="font-orbitron text-[11px] font-bold text-purple-400 mb-0.5">
              8004 链上信誉积累机制
            </p>
            <p className="text-[12px] text-cyber-muted">
              每次 AI 预测生成后记录 TxHash 至 8004 身份档案。24h 后自动获取真实价格验证准确性，
              得分写入链上——预测越准，Agent 信誉积分越高，形成可验证的 AI 能力证明。
            </p>
          </div>
        </div>
      </div>

      {/* Predictions List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-orbitron text-[12px] font-bold text-cyber-muted">预测历史记录</h3>
          <p className="text-[11px] text-cyber-muted">共 {predictions.length} 条</p>
        </div>
        <div className="space-y-3">
          {predictions.map((pred) => (
            <PredictionCard key={pred.id} pred={pred} onResolve={resolvePrediction} />
          ))}
        </div>
      </div>
    </div>
  );
}
