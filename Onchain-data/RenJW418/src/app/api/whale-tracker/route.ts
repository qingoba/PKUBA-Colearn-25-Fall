import { NextResponse } from "next/server";
import { fetchWhaleTransactions } from "@/lib/tron";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = (searchParams.get("token") || "ALL") as "USDT" | "USDD" | "ALL";
  const minUSD = parseInt(searchParams.get("min") || "5000", 10);

  try {
    const transactions = await fetchWhaleTransactions(token, minUSD);
    return NextResponse.json({ success: true, data: transactions });
  } catch (err) {
    console.error("[API /whale-tracker]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch whale transactions" },
      { status: 500 }
    );
  }
}
