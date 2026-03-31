import { NextResponse } from "next/server";
import { DeFiOpportunity } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 min cache

// Static DeFi opportunities based on real TRON protocols
// In production: fetch from on-chain data / DeFi Llama API
const DEFI_OPPORTUNITIES: DeFiOpportunity[] = [
  {
    id: "justlend-usdt",
    protocol: "JustLend",
    pair: "USDT Supply",
    category: "Lending",
    apy: 8.24,
    apyBase: 8.24,
    tvl: 1_840_000_000,
    tvlChange24h: 1.2,
    risk: "Low",
    tokens: ["USDT"],
    url: "https://justlend.org",
    audited: true,
    description: "Supply USDT to earn interest from borrowers on TRON's leading lending protocol.",
  },
  {
    id: "justlend-trx",
    protocol: "JustLend",
    pair: "TRX Supply",
    category: "Lending",
    apy: 5.61,
    apyBase: 5.61,
    tvl: 890_000_000,
    tvlChange24h: -0.5,
    risk: "Low",
    tokens: ["TRX"],
    url: "https://justlend.org",
    audited: true,
    description: "Supply TRX as collateral and earn supply APY from the JustLend lending pool.",
  },
  {
    id: "sunswap-usdt-usdd",
    protocol: "SunSwap",
    pair: "USDT / USDD",
    category: "DEX",
    apy: 18.7,
    apyBase: 3.2,
    apyReward: 15.5,
    tvl: 320_000_000,
    tvlChange24h: 4.1,
    risk: "Medium",
    tokens: ["USDT", "USDD"],
    url: "https://sun.io",
    audited: true,
    description: "Provide stablecoin liquidity to the most active USDT/USDD pool and earn SUN rewards.",
  },
  {
    id: "sunswap-trx-usdt",
    protocol: "SunSwap",
    pair: "TRX / USDT",
    category: "DEX",
    apy: 14.3,
    apyBase: 6.8,
    apyReward: 7.5,
    tvl: 580_000_000,
    tvlChange24h: 2.8,
    risk: "Medium",
    tokens: ["TRX", "USDT"],
    url: "https://sun.io",
    audited: true,
    description: "TRON's largest TRX/USDT LP. Earn trading fees + SUN governance token rewards.",
  },
  {
    id: "tron-staking",
    protocol: "TRON Staking",
    pair: "TRX Staking 2.0",
    category: "Staking",
    apy: 4.2,
    apyBase: 4.2,
    tvl: 5_200_000_000,
    tvlChange24h: 0.3,
    risk: "Low",
    tokens: ["TRX"],
    url: "https://tronscan.org/#/sr/votes",
    audited: true,
    description: "Stake TRX for energy/bandwidth and earn Super Representative voting rewards. Zero smart contract risk.",
  },
  {
    id: "wink-farm",
    protocol: "WINkLink",
    pair: "WIN / TRX Farm",
    category: "Yield",
    apy: 42.1,
    apyBase: 12.4,
    apyReward: 29.7,
    tvl: 48_000_000,
    tvlChange24h: -1.8,
    risk: "High",
    tokens: ["WIN", "TRX"],
    url: "https://wink.org",
    audited: false,
    description: "High-yield WIN token farm. Significant impermanent loss risk given TRX/WIN price divergence.",
  },
  {
    id: "justlend-usdd",
    protocol: "JustLend",
    pair: "USDD Supply",
    category: "Lending",
    apy: 11.8,
    apyBase: 11.8,
    tvl: 245_000_000,
    tvlChange24h: 3.4,
    risk: "Medium",
    tokens: ["USDD"],
    url: "https://justlend.org",
    audited: true,
    description: "Higher yield USDD lending. Additional risk from USDD's algorithmic peg mechanism.",
  },
  {
    id: "sunswap-jst-trx",
    protocol: "SunSwap",
    pair: "JST / TRX",
    category: "DEX",
    apy: 28.6,
    apyBase: 8.1,
    apyReward: 20.5,
    tvl: 62_000_000,
    tvlChange24h: 6.2,
    risk: "High",
    tokens: ["JST", "TRX"],
    url: "https://sun.io",
    audited: true,
    description: "JUST token liquidity pool with high SUN rewards. Volatile due to JST price movements.",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const risk = searchParams.get("risk");
  const sortBy = searchParams.get("sort") || "apy";

  let data = [...DEFI_OPPORTUNITIES];

  if (category && category !== "all") {
    data = data.filter(
      (d) => d.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (risk && risk !== "all") {
    data = data.filter(
      (d) => d.risk.toLowerCase() === risk.toLowerCase()
    );
  }

  if (sortBy === "apy") {
    data.sort((a, b) => b.apy - a.apy);
  } else if (sortBy === "tvl") {
    data.sort((a, b) => b.tvl - a.tvl);
  } else if (sortBy === "risk") {
    const riskOrder = { Low: 0, Medium: 1, High: 2 };
    data.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]);
  }

  return NextResponse.json({ success: true, data });
}
