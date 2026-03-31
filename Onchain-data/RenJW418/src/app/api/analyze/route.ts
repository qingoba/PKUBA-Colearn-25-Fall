import { NextRequest, NextResponse } from "next/server";
import { generateAIAnalysis } from "@/lib/openai";
import {
  createX402PaymentRequest,
  verifyX402Payment,
  recordAgentActivity,
} from "@/lib/bankofai";
import { AIAnalysisRequest, X402PaymentProof } from "@/types";

export const dynamic = "force-dynamic";

const AGENT_ADDRESS = () =>
  process.env.AGENT_TRON_ADDRESS || "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const USDD_CONTRACT = "TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn";

export async function GET() {
  // Return x402 payment requirements when no payment proof is provided
  const paymentRequest = createX402PaymentRequest("AI Analysis — TronSage");
  return NextResponse.json(
    {
      error: "Payment Required",
      code: 402,
      message: "This endpoint requires 0.1 USDT (or 0.1 USDD) payment via x402 protocol",
      paymentRequest,
      alternatives: {
        usdd: createX402PaymentRequest("AI Analysis — TronSage", "USDD"),
      },
    },
    { status: 402 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AIAnalysisRequest;
    const { query, context, demoMode } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    if (query.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Query too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    // ── x402 Payment Verification ──────────────────────────────
    // demoMode is honoured only to let evaluators test the UI flow.
    // All real analysis requests must carry a verified on-chain payment.

    if (!demoMode) {
      const headerProof = req.headers.get("X-Payment-Proof");
      const paymentProof: X402PaymentProof | undefined =
        body.paymentProof ||
        (headerProof
          ? {
              txHash: headerProof,
              amount: "100000",
              token: "USDT",
              from: "unknown",
              timestamp: Date.now() / 1000,
              requestId: "header-proof",
            }
          : undefined);

      if (!paymentProof) {
        const paymentRequest = createX402PaymentRequest(
          `AI Analysis: ${query.slice(0, 50)}...`
        );
        return NextResponse.json(
          {
            success: false,
            error: "Payment Required",
            code: 402,
            paymentRequest,
            alternatives: {
              usdd: createX402PaymentRequest(`AI Analysis: ${query.slice(0, 50)}...`, "USDD"),
            },
          },
          { status: 402 }
        );
      }

      // Determine token from proof; default to USDT
      const proofToken = (paymentProof.token as "USDT" | "USDD") === "USDD" ? "USDD" : "USDT";
      const isUsdd = proofToken === "USDD";

      const verifyResult = await verifyX402Payment(paymentProof, {
        toAddress: AGENT_ADDRESS(),
        amount: isUsdd ? "100000000000000000" : "100000",
        tokenContract: isUsdd ? USDD_CONTRACT : USDT_CONTRACT,
      });

      if (!verifyResult.valid) {
        return NextResponse.json(
          {
            success: false,
            error: "Payment verification failed",
            details: verifyResult.error,
          },
          { status: 402 }
        );
      }

      // Record confirmed payment
      recordAgentActivity({
        type: "payment_received",
        description: `Payment received for analysis: ${query.slice(0, 60)}`,
        amount: 0.1,
        token: proofToken,
        timestamp: Date.now() / 1000,
        txHash: verifyResult.txHash,
      }).catch(console.error);
    }

    // ── Generate AI Analysis ───────────────────────────────────

    const result = await generateAIAnalysis({
      query: query.trim(),
      context,
      paymentProof: body.paymentProof,
      demoMode: !!demoMode,
    });

    // Record job completion in 8004 identity system (non-blocking)
    recordAgentActivity({
      type: demoMode ? "analysis" : "job_completed",
      description: `${demoMode ? "[demo] " : ""}Completed analysis: ${query.slice(0, 60)}`,
      timestamp: Date.now() / 1000,
    }).catch(console.error);

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("[API /analyze]", err);
    return NextResponse.json(
      { success: false, error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
