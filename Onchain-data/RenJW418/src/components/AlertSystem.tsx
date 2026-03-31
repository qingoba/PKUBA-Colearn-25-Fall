"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────

type AlertConditionType = "price_above" | "price_below" | "whale_move" | "tps_spike";

interface Alert {
  id: string;
  type: AlertConditionType;
  label: string;
  condition: string;
  threshold: number;
  unit: string;
  sessionId: string;
  subscriptionPaid: string;
  createdAt: number;
  status: "active" | "triggered" | "expired";
  triggeredAt?: number;
  triggeredValue?: number;
  icon: string;
}

// ── Alert Templates ────────────────────────────────────────────

const ALERT_TYPES: Array<{
  type: AlertConditionType;
  icon: string;
  label: string;
  placeholder: string;
  default: number;
  unit: string;
  hint: string;
}> = [
  {
    type: "price_above",
    icon: "📈",
    label: "TRX 价格突破",
    placeholder: "如 0.10",
    default: 0.10,
    unit: "USD",
    hint: "当 TRX 价格突破指定价位时提醒",
  },
  {
    type: "price_below",
    icon: "📉",
    label: "TRX 价格跌破",
    placeholder: "如 0.085",
    default: 0.085,
    unit: "USD",
    hint: "当 TRX 价格跌破指定价位时提醒",
  },
  {
    type: "whale_move",
    icon: "🐋",
    label: "巨鲸移动超过",
    placeholder: "如 1（百万）",
    default: 1,
    unit: "M USDT",
    hint: "当单笔转账超过指定金额时提醒",
  },
  {
    type: "tps_spike",
    icon: "⚡",
    label: "网络 TPS 超过",
    placeholder: "如 100",
    default: 100,
    unit: "TPS",
    hint: "当网络交易速度异常升高时提醒",
  },
];

const SESSION_ID = `user_${Math.random().toString(36).slice(2, 10)}`;

// ── Alert Card ─────────────────────────────────────────────────

function AlertCard({ alert, onDelete }: { alert: Alert; onDelete: (id: string) => void }) {
  const isTriggered = alert.status === "triggered";
  const isActive = alert.status === "active";

  const statusColor = isTriggered ? "#00F5D4" : isActive ? "#A855F7" : "#6B7280";
  const statusLabel = isTriggered ? "已触发 🔔" : isActive ? "监控中" : "已过期";

  return (
    <div
      className="p-4 rounded-xl transition-all duration-300"
      style={{
        background: isTriggered ? "rgba(0,245,212,0.06)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${isTriggered ? "rgba(0,245,212,0.3)" : "rgba(255,255,255,0.07)"}`,
        boxShadow: isTriggered ? "0 0 20px rgba(0,245,212,0.08)" : "none",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: `${statusColor}12`, border: `1px solid ${statusColor}30` }}
          >
            {alert.icon}
          </div>
          <div className="min-w-0">
            <p className="font-orbitron text-[11px] font-bold mb-0.5" style={{ color: statusColor }}>
              {alert.condition}
            </p>
            <p className="text-[11px] text-cyber-muted truncate">
              订阅费: {alert.subscriptionPaid} USDT (x402) ·{" "}
              {new Date(alert.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="px-2 py-0.5 rounded-full font-orbitron text-[9px] font-bold"
            style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}
          >
            {statusLabel}
          </span>
          <button
            onClick={() => onDelete(alert.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-cyber-muted hover:text-cyber-red transition-colors text-[12px]"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            ×
          </button>
        </div>
      </div>

      {isTriggered && (
        <div
          className="mt-3 p-3 rounded-lg"
          style={{ background: "rgba(0,245,212,0.05)", border: "1px solid rgba(0,245,212,0.15)" }}
        >
          <p className="text-[12px] text-cyber-cyan font-semibold">
            🔔 告警触发！当前值:{" "}
            <span className="font-orbitron font-bold">
              {alert.triggeredValue?.toFixed(4)} {alert.unit}
            </span>
            {alert.triggeredAt && (
              <span className="text-cyber-muted font-normal ml-2">
                · {new Date(alert.triggeredAt).toLocaleTimeString("zh-CN")}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function AlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedType, setSelectedType] = useState<AlertConditionType>("price_above");
  const [threshold, setThreshold] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const selectedTemplate = ALERT_TYPES.find((t) => t.type === selectedType)!;

  // Load alerts
  const loadAlerts = useCallback(async () => {
    try {
      const res = await fetch(`/api/alerts?sessionId=${SESSION_ID}`);
      const data = await res.json() as { alerts: Alert[] };
      setAlerts(data.alerts || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Auto-check active alerts every 30s
  useEffect(() => {
    const active = alerts.filter((a) => a.status === "active");
    if (active.length === 0 || checking) return;

    const interval = setInterval(async () => {
      setChecking(true);
      for (const alert of active) {
        try {
          const res = await fetch(`/api/alerts?sessionId=${SESSION_ID}&checkId=${alert.id}`);
          const data = await res.json() as { triggered?: boolean; alert?: Alert };
          if (data.triggered && data.alert) {
            setAlerts((prev) =>
              prev.map((a) => (a.id === alert.id ? data.alert! : a))
            );
          }
        } catch { /* ignore */ }
      }
      setChecking(false);
    }, 30_000);

    return () => clearInterval(interval);
  }, [alerts, checking]);

  const createAlert = async () => {
    const val = parseFloat(threshold || String(selectedTemplate.default));
    if (isNaN(val) || val <= 0) {
      setMessage("❌ 请输入有效的阈值");
      return;
    }

    setCreating(true);
    setMessage(null);

    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          threshold: val,
          sessionId: SESSION_ID,
        }),
      });
      const data = await res.json() as { success: boolean; message?: string; error?: string };

      if (data.success) {
        setMessage(data.message || "✅ 告警已创建");
        setThreshold("");
        await loadAlerts();
      } else {
        setMessage(`❌ ${data.error || "创建失败"}`);
      }
    } catch {
      setMessage("❌ 网络错误");
    } finally {
      setCreating(false);
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch { /* ignore */ }
  };

  const checkNow = async () => {
    setChecking(true);
    const active = alerts.filter((a) => a.status === "active");
    for (const alert of active) {
      try {
        const res = await fetch(`/api/alerts?sessionId=${SESSION_ID}&checkId=${alert.id}`);
        const data = await res.json() as { triggered?: boolean; alert?: Alert };
        if (data.alert) {
          setAlerts((prev) => prev.map((a) => (a.id === alert.id ? data.alert! : a)));
        }
      } catch { /* ignore */ }
    }
    setChecking(false);
    setMessage("✅ 已检查所有告警条件");
    setTimeout(() => setMessage(null), 3000);
  };

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const triggeredCount = alerts.filter((a) => a.status === "triggered").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card card-glow p-5">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="font-orbitron text-lg font-black text-cyber-cyan mb-1">
              🔔 AI 智能告警系统
            </h2>
            <p className="text-[13px] text-cyber-muted">
              设置链上条件，Agent 自动监控并触发告警。每个告警通过{" "}
              <span className="text-cyber-cyan font-semibold">x402 Protocol</span>{" "}
              收取 0.1 USDT 订阅费
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)" }}>
                <div className="live-dot" />
                <span className="font-orbitron text-[10px] font-bold text-purple-400">
                  {activeCount} 个监控中
                </span>
              </div>
            )}
            {triggeredCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.3)" }}>
                <span className="font-orbitron text-[10px] font-bold text-cyber-cyan">
                  🔔 {triggeredCount} 已触发
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Alert Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {ALERT_TYPES.map((t) => (
            <button
              key={t.type}
              onClick={() => {
                setSelectedType(t.type);
                setThreshold(String(t.default));
              }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200"
              style={{
                background:
                  selectedType === t.type
                    ? "rgba(0,245,212,0.1)"
                    : "rgba(255,255,255,0.02)",
                border: `1px solid ${selectedType === t.type ? "rgba(0,245,212,0.35)" : "rgba(255,255,255,0.07)"}`,
              }}
            >
              <span className="text-xl">{t.icon}</span>
              <span
                className="font-orbitron text-[10px] font-bold text-center leading-tight"
                style={{ color: selectedType === t.type ? "#00F5D4" : "#9BAFC4" }}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Threshold Input */}
        <div
          className="p-4 rounded-xl mb-4"
          style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.12)" }}
        >
          <p className="text-[12px] text-cyber-muted mb-2">{selectedTemplate.hint}</p>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="font-orbitron text-[10px] font-bold text-cyber-cyan block mb-1.5">
                {selectedTemplate.label} ___
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={threshold || selectedTemplate.default}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder={selectedTemplate.placeholder}
                  step="0.001"
                  className="w-full px-3 py-2 rounded-lg text-[13px] text-cyber-text outline-none font-mono"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(0,245,212,0.2)",
                  }}
                />
                <span className="text-[12px] text-cyber-muted font-orbitron font-bold flex-shrink-0">
                  {selectedTemplate.unit}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* x402 Payment Info */}
        <div
          className="flex items-center justify-between p-3 rounded-lg mb-4"
          style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">💳</span>
            <div>
              <p className="font-orbitron text-[10px] font-bold text-purple-400">x402 订阅费</p>
              <p className="text-[11px] text-cyber-muted">自动从 Agent 钱包扣除</p>
            </div>
          </div>
          <span className="font-orbitron text-[14px] font-bold text-purple-400">0.1 USDT</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={createAlert}
            disabled={creating}
            className="flex-1 btn-cyber btn-cyber-primary py-2.5 rounded-xl font-orbitron text-[12px] disabled:opacity-50"
          >
            {creating ? "创建中..." : "➕ 创建告警 (-0.1 USDT)"}
          </button>
          {activeCount > 0 && (
            <button
              onClick={checkNow}
              disabled={checking}
              className="px-4 py-2.5 rounded-xl font-orbitron text-[12px] transition-all"
              style={{
                background: "rgba(168,85,247,0.1)",
                border: "1px solid rgba(168,85,247,0.25)",
                color: "#A855F7",
              }}
            >
              {checking ? "检查中..." : "🔍 立即检查"}
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className="mt-3 px-4 py-2.5 rounded-lg text-[12px]"
            style={{
              background: message.startsWith("❌") ? "rgba(255,51,102,0.08)" : "rgba(0,245,212,0.08)",
              border: `1px solid ${message.startsWith("❌") ? "rgba(255,51,102,0.25)" : "rgba(0,245,212,0.25)"}`,
              color: message.startsWith("❌") ? "#FF3366" : "#00F5D4",
            }}
          >
            {message}
          </div>
        )}
      </div>

      {/* Active Alerts List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-orbitron text-[12px] font-bold text-cyber-muted">
            我的告警 ({alerts.length})
          </h3>
          <p className="text-[11px] text-cyber-muted">每 30 秒自动检查</p>
        </div>

        {alerts.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-4xl mb-3">🔕</p>
            <p className="font-orbitron text-[13px] font-bold text-cyber-cyan mb-1">暂无告警</p>
            <p className="text-[12px] text-cyber-muted">创建你的第一个链上条件告警</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onDelete={deleteAlert} />
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="card p-5">
        <h4 className="font-orbitron text-[11px] font-bold text-cyber-muted mb-3">HOW IT WORKS</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { step: "1", icon: "💳", title: "x402 付款", desc: "0.1 USDT 通过 x402 协议订阅告警服务" },
            { step: "2", icon: "👁️", title: "Agent 监控", desc: "TronSage AI 持续轮询链上数据" },
            { step: "3", icon: "🔔", title: "条件触发", desc: "条件满足即时通知，记录至 8004 身份" },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.2)" }}
              >
                {item.icon}
              </div>
              <p className="font-orbitron text-[10px] font-bold text-cyber-cyan">{item.title}</p>
              <p className="text-[11px] text-cyber-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
