import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono, Syne } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  variable: "--font-share-tech",
  weight: "400",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tron-sage.vercel.app"),
  title: "TronSage — AI-Powered TRON Intelligence Agent",
  description:
    "AI-driven DeFi analytics, whale tracking, and portfolio intelligence for the TRON ecosystem. Powered by Bank of AI x402 & 8004 protocols.",
  keywords: "TRON, AI Agent, DeFi, Bank of AI, x402, whale tracker, blockchain",
  openGraph: {
    title: "TronSage — AI-Powered TRON Intelligence Agent",
    description: "Real-time AI analysis for TRON on-chain data. Pay with USDT via x402 micropayment protocol.",
    type: "website",
    images: [{ url: "/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TronSage — AI-Powered TRON Intelligence Agent",
    description: "AI + Web3 + TRON. On-chain intelligence powered by Bank of AI.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${shareTechMono.variable} ${syne.variable}`}
    >
      <body className="cyber-bg antialiased">{children}</body>
    </html>
  );
}
