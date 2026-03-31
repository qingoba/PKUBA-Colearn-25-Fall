// ─────────────────────────────────────────────────────────────
// AI Alert System API
// Condition-based alerts with x402 subscription payment verification
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { fetchTronNetworkStats, fetchWhaleTransactions } from "@/lib/tron";
import {
  createX402PaymentRequest,
  verifyX402Payment,
  recordAgentActivity,
} from "@/lib/bankofai";

export const dynamic = "force-dynamic";

const AGENT_ADDRESS = () =>
  process.env.AGENT_TRON_ADDRESS || "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

// ── In-memory alert store ────────────────────────────────────
// (resets on server restart — perfect for hackathon demo)

export type AlertConditionType =
  | "price_above"
  | "price_below"
  | "whale_move"
  | "tps_spike"
  | "custom";

export interface Alert {
  id: string;
  type: AlertConditionType;
  label: string;
  condition: string;
  threshold: number;
  unit: string;
  sessionId: string;
  subscriptionTxHash: string;
  subscriptionPaid: string;
  createdAt: number;
  status: "active" | "triggered" | "expired";
  triggeredAt?: number;
  triggeredValue?: number;
  icon: string;
}

// Global in-memory store (survives across requests within same server process)
const alertStore = new Map<string, Alert>();

function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Preset Alert Templates ────────────────────────────────────

const ALERT_TEMPLATES: Record<AlertConditionType, { label: string; icon: string; unit: string }> = {
  price_above:  { label: "TRX 价格突破",    icon: "📈", unit: "USD"  },
  price_below:  { label: "TRX 价格跌破",    icon: "📉", unit: "USD"  },
  whale_move:   { label: "巨鲸移动超过",    icon: "🐋", unit: "USDT" },
  tps_spike:    { label: "网络 TPS 超过",   icon: "⚡", unit: "TPS"  },
  custom:       { label: "自定义条件",       icon: "🔔", unit: ""     },
};

// ── Alert Condition Checker ───────────────────────────────────

async function checkAlertCondition(alert: Alert): Promise<{ triggered: boolean; currentValue: number }> {
  try {
    switch (alert.type) {
      case "price_above":
      case "price_below": {
        const stats = await fetchTronNetworkStats();
        const triggered =
          alert.type === "price_above"
            ? stats.trxPrice >= alert.threshold
            : stats.trxPrice <= alert.threshold;
        return { triggered, currentValue: stats.trxPrice };
      }
      case "whale_move": {
        const txs = await fetchWhaleTransactions("ALL", alert.threshold * 1_000_000);
        return { triggered: txs.length > 0, currentValue: txs[0]?.amountUSD || 0 };
      }
      case "tps_spike": {
        const stats = await fetchTronNetworkStats();
        return { triggered: stats.tps >= alert.threshold, currentValue: stats.tps };
      }
      default:
        return { triggered: false, currentValue: 0 };
    }
  } catch {
    return { triggered: false, currentValue: 0 };
  }
}

// ── GET /api/alerts?sessionId=xxx ─────────────────────────────

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId") || "default";
  const checkId = req.nextUrl.searchParams.get("checkId");

  // Check a specific alert
  if (checkId) {
    const alert = alertStore.get(checkId);
    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }
    if (alert.status === "active") {
      const { triggered, currentValue } = await checkAlertCondition(alert);
      if (triggered) {
        alert.status = "triggered";
        alert.triggeredAt = Date.now();
        alert.triggeredValue = currentValue;
        alertStore.set(checkId, alert);
      }
      return NextResponse.json({ alert, currentValue, triggered });
    }
    return NextResponse.json({ alert, triggered: false });
  }

  // List all alerts for session
  const alerts = Array.from(alertStore.values())
    .filter((a) => a.sessionId === sessionId)
    .sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json({ alerts });
}

// ── POST /api/alerts ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      type: AlertConditionType;
      threshold: number;
      sessionId?: string;
      txHash?: string;
    };

    const { type, threshold, sessionId = "default", txHash } = body;

    if (!type || threshold === undefined) {
      return NextResponse.json({ error: "type 和 threshold 必填" }, { status: 400 });
    }

    const template = ALERT_TEMPLATES[type];
    if (!template) {
      return NextResponse.json({ error: "不支持的告警类型" }, { status: 400 });
    }

    // ── x402 subscription payment (demo mode: bypass when no txHash) ──
    const isDemoMode = !txHash;
    if (txHash) {
      // Paid mode: validate format then verify on-chain
      if (!/^[0-9a-fA-F]{64}$/.test(txHash)) {
        return NextResponse.json(
          { error: "Invalid TRON transaction hash format" },
          { status: 400 }
        );
      }
      const verifyResult = await verifyX402Payment(
        { txHash, amount: "100000", token: "USDT", from: "", timestamp: Date.now() / 1000, requestId: "" },
        { toAddress: AGENT_ADDRESS(), amount: "100000", tokenContract: USDT_CONTRACT }
      );
      if (!verifyResult.valid) {
        return NextResponse.json(
          { error: "支付验证失败", details: verifyResult.error },
          { status: 402 }
        );
      }
      recordAgentActivity({
        type: "payment_received",
        description: `Alert subscription: ${template.label}`,
        amount: 0.1,
        token: "USDT",
        timestamp: Date.now() / 1000,
        txHash,
      }).catch(console.error);
    }

    const alert: Alert = {
      id: generateAlertId(),
      type,
      label: template.label,
      condition: `${template.label} ${threshold} ${template.unit}`,
      threshold,
      unit: template.unit,
      sessionId,
      subscriptionTxHash: txHash || "demo",
      subscriptionPaid: isDemoMode ? "0" : "0.1",
      createdAt: Date.now(),
      status: "active",
      icon: template.icon,
    };

    alertStore.set(alert.id, alert);

    const modeNote = isDemoMode
      ? "（演示模式 · 免费创建）"
      : `已通过 x402 扣除 0.1 USDT（TxHash: ${txHash!.slice(0, 16)}...）`;

    return NextResponse.json({
      success: true,
      alert,
      message: `✅ 告警已创建！当 ${alert.condition} 时，你将收到通知。${modeNote}`,
    });
  } catch (err) {
    console.error("[/api/alerts POST]", err);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

// ── DELETE /api/alerts?id=xxx ─────────────────────────────────

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !alertStore.has(id)) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }
  alertStore.delete(id);
  return NextResponse.json({ success: true });
}
