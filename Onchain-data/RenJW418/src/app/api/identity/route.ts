import { NextResponse } from "next/server";
import { getAgentIdentity } from "@/lib/bankofai";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  try {
    const identity = await getAgentIdentity();
    return NextResponse.json({ success: true, data: identity });
  } catch (err) {
    console.error("[API /identity]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch agent identity" },
      { status: 500 }
    );
  }
}
