import { NextRequest, NextResponse } from "next/server";
import { recordOnchainMemo } from "@/lib/tron";
import { recordAgentActivity } from "@/lib/bankofai";

export const dynamic = "force-dynamic";

// ──────────────────────────────────────────────
// In-memory prediction store
// ──────────────────────────────────────────────
interface Prediction {
  id: string;
  date: string;
  prediction: string;
  targetPrice: number;
  direction: "up" | "down" | "sideways";
  confidence: number;
  reasoning: string;
  onChainTxHash?: string;
  resolved?: boolean;
  actualPrice?: number;
  accurate?: boolean;
  createdAt: number;
}

const predictionStore: Prediction[] = [
  {
    id: "pred_001",
    date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    prediction: "TRX will consolidate between $0.095 - $0.110 with mild upward bias driven by ecosystem DeFi growth",
    targetPrice: 0.103,
    direction: "up",
    confidence: 72,
    reasoning: "On-chain TVL increasing 8%, whale accumulation detected in 3 large wallets",
    resolved: true,
    actualPrice: 0.101,
    accurate: true,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "pred_002",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    prediction: "TRX faces short-term resistance at $0.105. Potential retracement to $0.096 before continuation",
    targetPrice: 0.096,
    direction: "down",
    confidence: 65,
    reasoning: "RSI overbought on 4h, profit-taking signals from mid-tier wallets",
    resolved: false,
    createdAt: Date.now() - 86400000,
  },
];

// ──────────────────────────────────────────────
// Generate today's AI prediction (deterministic mock)
// ──────────────────────────────────────────────
function generateDailyPrediction(): Omit<Prediction, "id" | "onChainTxHash" | "createdAt"> {
  const seed = new Date().getDate() + new Date().getMonth() * 31;
  const directions = ["up", "down", "sideways"] as const;
  const direction = directions[seed % 3];
  const basePrice = 0.098 + (seed % 10) * 0.001;
  const confidence = 60 + (seed % 30);

  const reasoningMap: Record<string, string> = {
    up: "On-chain activity and DeFi TVL growth signal bullish momentum. Whale wallets showing accumulation patterns.",
    down: "Profit-taking signals detected from large holders. Resistance zone at current levels may trigger correction.",
    sideways: "Mixed signals from on-chain data. Market awaiting macro catalyst before directional move.",
  };

  const predictionMap: Record<string, string> = {
    up: `TRX likely to test $${(basePrice * 1.04).toFixed(4)} resistance within 24h`,
    down: `TRX may retrace to $${(basePrice * 0.96).toFixed(4)} support zone before recovery`,
    sideways: `TRX expected to consolidate in $${(basePrice * 0.98).toFixed(4)} - $${(basePrice * 1.02).toFixed(4)} range`,
  };

  return {
    date: new Date().toISOString().split("T")[0],
    prediction: predictionMap[direction],
    targetPrice: direction === "up" ? parseFloat((basePrice * 1.04).toFixed(4)) : direction === "down" ? parseFloat((basePrice * 0.96).toFixed(4)) : parseFloat(basePrice.toFixed(4)),
    direction,
    confidence,
    reasoning: reasoningMap[direction],
  };
}

// ──────────────────────────────────────────────
// GET /api/prediction — list predictions
// ──────────────────────────────────────────────
export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  const sorted = [...predictionStore].reverse();

  // Calculate accuracy stats
  const resolved = sorted.filter((p) => p.resolved && p.accurate !== undefined);
  const correct = resolved.filter((p) => p.accurate === true).length;
  const accuracy = {
    rate: resolved.length > 0 ? Math.round((correct / resolved.length) * 100) : 0,
    total: sorted.length,
    correct,
    avgScore: resolved.length > 0 ? Math.round(resolved.reduce((s, p) => s + (p.accurate ? 85 : 30), 0) / resolved.length) : 0,
  };

  const agentStats = {
    totalPredictions: sorted.length,
    streak: correct,
    bestScore: 95,
    worstScore: 28,
  };

  return NextResponse.json({
    success: true,
    predictions: sorted.map((p) => ({
      id: p.id,
      // Fields the frontend Prediction interface expects
      targetDate: p.date,
      predictedPrice: p.targetPrice,
      currentPriceAtPrediction: parseFloat(
        (p.direction === "up"
          ? p.targetPrice / 1.04
          : p.direction === "down"
          ? p.targetPrice / 0.96
          : p.targetPrice
        ).toFixed(4)
      ),
      direction: p.direction,
      confidence: p.confidence,
      reasoning: p.reasoning,
      signals: p.reasoning
        .split(/[.。]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 5)
        .slice(0, 3),
      createdAt: p.createdAt,
      resolvedAt: p.resolved ? p.createdAt + 86_400_000 : undefined,
      actualPrice: p.actualPrice,
      outcome: p.accurate === true ? "correct" : p.accurate === false ? "incorrect" : undefined,
      accuracyScore: p.accurate === true ? 85 : p.accurate === false ? 30 : undefined,
      onChainTxHash: p.onChainTxHash,
    })),
    accuracy,
    agentStats,
    hasTodayPrediction: sorted.some((p) => p.date === today),
  });
}

// ──────────────────────────────────────────────
// POST /api/prediction — create & anchor new prediction
// ──────────────────────────────────────────────
export async function POST(_req: NextRequest) {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Only allow one prediction per day
    if (predictionStore.some((p) => p.date === today)) {
      return NextResponse.json(
        {
          success: false,
          error: "Prediction for today already exists",
          data: { existing: predictionStore.find((p) => p.date === today) },
        },
        { status: 409 }
      );
    }

    const predData = generateDailyPrediction();

    // Build a deterministic digest for on-chain anchoring
    const digest = `TRONSAGE_PRED:${predData.date}:${predData.direction}:${predData.targetPrice}:${predData.confidence}`;

    // Attempt on-chain memo anchoring
    const txHash = await recordOnchainMemo(digest);

    const newPrediction: Prediction = {
      id: `pred_${Date.now()}`,
      ...predData,
      onChainTxHash: txHash || undefined,
      createdAt: Date.now(),
    };

    predictionStore.push(newPrediction);

    // Record in 8004 identity log
    await recordAgentActivity({
      type: "job_completed",
      description: `Daily TRX price prediction anchored — ${predData.direction} to $${predData.targetPrice}`,
      amount: 0,
      token: "USDT",
      timestamp: Date.now() / 1000,
      txHash: txHash || undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        prediction: newPrediction,
        onChainAnchored: !!txHash,
        message: txHash
          ? `Prediction anchored on TRON chain. TxHash: ${txHash}`
          : "Prediction generated (on-chain anchoring skipped — set AGENT_TRON_PRIVATE_KEY to enable)",
      },
    });
  } catch (err) {
    console.error("[API /prediction POST]", err);
    return NextResponse.json(
      { success: false, error: "Failed to create prediction" },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────
// PUT /api/prediction — resolve prediction with actual outcome
// ──────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, actualPrice } = body;

    if (!id || typeof actualPrice !== "number") {
      return NextResponse.json(
        { success: false, error: "id and actualPrice (number) are required" },
        { status: 400 }
      );
    }

    const pred = predictionStore.find((p) => p.id === id);
    if (!pred) {
      return NextResponse.json(
        { success: false, error: "Prediction not found" },
        { status: 404 }
      );
    }

    if (pred.resolved) {
      return NextResponse.json(
        { success: false, error: "Prediction already resolved" },
        { status: 409 }
      );
    }

    // Determine accuracy: within 2% of target counts as accurate
    const priceDiffPct = Math.abs(actualPrice - pred.targetPrice) / pred.targetPrice;
    pred.resolved = true;
    pred.actualPrice = actualPrice;
    pred.accurate = priceDiffPct <= 0.02;

    await recordAgentActivity({
      type: "job_completed",
      description: `Prediction ${id} resolved — ${pred.accurate ? "ACCURATE" : "INACCURATE"} (actual $${actualPrice}, target $${pred.targetPrice})`,
      amount: 0,
      token: "USDT",
      timestamp: Date.now() / 1000,
    });

    return NextResponse.json({
      success: true,
      data: {
        prediction: pred,
        accurate: pred.accurate,
        diffPercent: (priceDiffPct * 100).toFixed(2),
      },
    });
  } catch (err) {
    console.error("[API /prediction PUT]", err);
    return NextResponse.json(
      { success: false, error: "Failed to resolve prediction" },
      { status: 500 }
    );
  }
}
