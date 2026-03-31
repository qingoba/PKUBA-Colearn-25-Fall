import { NextResponse } from "next/server";
import { fetchWalletPortfolio } from "@/lib/tron";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { success: false, error: "Missing address parameter" },
      { status: 400 }
    );
  }

  // Basic TRON address validation (starts with T, 34 chars)
  if (!/^T[a-zA-Z0-9]{33}$/.test(address)) {
    return NextResponse.json(
      { success: false, error: "Invalid TRON address format" },
      { status: 400 }
    );
  }

  try {
    const portfolio = await fetchWalletPortfolio(address);
    return NextResponse.json({ success: true, data: portfolio });
  } catch (err) {
    console.error("[API /portfolio]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch portfolio data" },
      { status: 500 }
    );
  }
}
