import { NextRequest, NextResponse } from "next/server";
import { createX402PaymentRequest, verifyX402Payment, recordAgentActivity } from "@/lib/bankofai";
import { getAgentIdentity } from "@/lib/bankofai";

export const dynamic = "force-dynamic";

const AGENT_ADDRESS = () =>
  process.env.AGENT_TRON_ADDRESS || "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";

const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const USDD_CONTRACT = "TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn";

/** GET /api/payment/request — Create a new x402 payment request */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const memo = searchParams.get("memo") || "TronSage AI Analysis";
  const token = (searchParams.get("token") || "USDT") as "USDT" | "USDD";

  if (token !== "USDT" && token !== "USDD") {
    return NextResponse.json(
      { success: false, error: "token must be USDT or USDD" },
      { status: 400 }
    );
  }

  const paymentRequest = createX402PaymentRequest(memo, token);
  const agentIdentity = await getAgentIdentity();

  return NextResponse.json({
    success: true,
    data: {
      paymentRequest,
      agentInfo: {
        name: agentIdentity.name,
        address: agentIdentity.address,
        reputationScore: agentIdentity.reputationScore,
        tier: agentIdentity.tier,
        verified: agentIdentity.verified,
      },
    },
  });
}

/** POST /api/payment/request — Verify a submitted payment proof */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { txHash, requestId } = body;

    if (!txHash || typeof txHash !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing txHash" },
        { status: 400 }
      );
    }

    if (!/^[0-9a-fA-F]{64}$/.test(txHash)) {
      return NextResponse.json(
        { success: false, error: "Invalid TRON transaction hash format (64 hex chars required)" },
        { status: 400 }
      );
    }

    const agentAddress = AGENT_ADDRESS();

    // Try USDT verification first, then USDD
    let verifyResult = await verifyX402Payment(
      { txHash, amount: "100000", token: "USDT", from: "", timestamp: Date.now() / 1000, requestId: requestId || "" },
      { toAddress: agentAddress, amount: "100000", tokenContract: USDT_CONTRACT }
    );

    let acceptedToken: "USDT" | "USDD" = "USDT";

    if (!verifyResult.valid) {
      // Attempt USDD (18 decimals — 0.1 USDD)
      const usddResult = await verifyX402Payment(
        { txHash, amount: "100000000000000000", token: "USDD", from: "", timestamp: Date.now() / 1000, requestId: requestId || "" },
        { toAddress: agentAddress, amount: "100000000000000000", tokenContract: USDD_CONTRACT }
      );
      if (usddResult.valid) {
        verifyResult = usddResult;
        acceptedToken = "USDD";
      }
    }

    if (!verifyResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment not verified on TRON network",
          details: verifyResult.error,
        },
        { status: 402 }
      );
    }

    // Record the confirmed payment in the 8004 activity log
    await recordAgentActivity({
      type: "payment_received",
      description: `Payment verified for AI service`,
      amount: 0.1,
      token: acceptedToken,
      timestamp: Date.now() / 1000,
      txHash,
    });

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        txHash,
        requestId,
        from: verifyResult.from,
        token: acceptedToken,
        message: `Payment verified on TRON network (${acceptedToken})`,
      },
    });
  } catch (err) {
    console.error("[API /payment/request]", err);
    return NextResponse.json(
      { success: false, error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
