import { NextResponse } from "next/server";
import { fetchTronNetworkStats } from "@/lib/tron";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET() {
  try {
    const stats = await fetchTronNetworkStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (err) {
    console.error("[API /stats]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch network stats" },
      { status: 500 }
    );
  }
}
