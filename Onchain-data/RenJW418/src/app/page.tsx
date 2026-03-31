"use client";

import { useState } from "react";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import WhaleTracker from "@/components/WhaleTracker";
import AIAnalyst from "@/components/AIAnalyst";
import PortfolioAnalyzer from "@/components/PortfolioAnalyzer";
import DeFiOpportunities from "@/components/DeFiOpportunities";
import AgentIdentityCard from "@/components/AgentIdentity";
import NaturalLanguageChat from "@/components/NaturalLanguageChat";
import MultiAgentFlow from "@/components/MultiAgentFlow";
import AlertSystem from "@/components/AlertSystem";
import PredictionMarket from "@/components/PredictionMarket";
import BotIntegration from "@/components/BotIntegration";

type Tab = "chat" | "multi-agent" | "whale" | "ai" | "portfolio" | "defi" | "identity" | "alerts" | "predict" | "bots";

const TABS: Array<{ id: Tab; icon: string; label: string; badge?: string }> = [
  { id: "chat",        icon: "💬", label: "AI 对话",      badge: "NEW" },
  { id: "multi-agent", icon: "🤖", label: "Agent 经济",   badge: "x402" },
  { id: "alerts",      icon: "🔔", label: "智能告警",      badge: "NEW" },
  { id: "predict",     icon: "🔮", label: "AI 预测",      badge: "8004" },
  { id: "whale",       icon: "🐋", label: "Whale Tracker" },
  { id: "ai",          icon: "🧠", label: "AI Analysis",  badge: "x402" },
  { id: "portfolio",   icon: "💼", label: "Portfolio" },
  { id: "defi",        icon: "💎", label: "DeFi Opps" },
  { id: "identity",    icon: "🆔", label: "Agent ID",     badge: "8004" },
  { id: "bots",        icon: "📲", label: "Bot 集成",      badge: "NEW" },
];

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-14 px-6">
      {/* Background glow blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]"
          style={{ background: "radial-gradient(circle, #00F5D4, transparent)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-8 blur-[100px]"
          style={{ background: "radial-gradient(circle, #A855F7, transparent)" }}
        />
      </div>

      <div className="relative max-w-[1440px] mx-auto">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.2)" }}>
              <div className="live-dot" />
              <span className="font-orbitron text-[10px] font-bold text-cyber-cyan tracking-widest">
                LIVE ON TRON MAINNET
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}>
              <span className="font-orbitron text-[10px] font-bold text-purple-400 tracking-widest">
                Powered by Bank of AI
              </span>
            </div>
          </div>

          {/* Title */}
          <h1
            className="font-orbitron text-5xl md:text-6xl font-black leading-none tracking-tight mb-4"
            style={{
              background: "linear-gradient(135deg, #00F5D4 0%, #C8DDF0 50%, #A855F7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            TronSage
          </h1>
          <p className="text-[18px] text-cyber-text leading-relaxed mb-2 font-medium">
            AI-Powered TRON Intelligence Agent
          </p>
          <p className="text-[14px] text-cyber-muted leading-relaxed max-w-xl">
            Real-time whale tracking · AI DeFi analysis · Portfolio intelligence ·
            Micropayment via{" "}
            <span className="text-cyber-cyan font-semibold">x402 Protocol</span> ·
            On-chain identity via{" "}
            <span className="text-purple-400 font-semibold">8004 Protocol</span>
          </p>

          {/* CTA Badges */}
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { icon: "🤖", text: "Multi-Agent Economy", color: "#00F5D4" },
              { icon: "⚡", text: "1-Click TronLink Exec", color: "#FFD700" },
              { icon: "🔮", text: "AI Prediction Market", color: "#A855F7" },
              { icon: "💳", text: "x402 Micropayment", color: "#3B82F6" },
              { icon: "🔔", text: "Smart Alerts", color: "#FF3366" },
              { icon: "🔐", text: "8004 Identity", color: "#6B7280" },
            ].map((b) => (
              <div
                key={b.text}
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-orbitron text-[11px] font-bold tracking-wider"
                style={{ background: `${b.color}10`, color: b.color, border: `1px solid ${b.color}25` }}
              >
                <span>{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <StatsBar />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 pb-12">
        <HeroSection />

        {/* Tab Navigation */}
        <div
          className="sticky top-16 z-40 flex items-center gap-1 mb-6 overflow-x-auto"
          style={{
            background: "rgba(2,6,16,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(0,245,212,0.12)",
            marginLeft: "-1.5rem",
            marginRight: "-1.5rem",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-orbitron font-bold"
                  style={{
                    background:
                      tab.badge === "x402"
                        ? "rgba(0,245,212,0.15)"
                        : tab.badge === "NEW"
                        ? "rgba(251,191,36,0.15)"
                        : "rgba(168,85,247,0.15)",
                    color:
                      tab.badge === "x402"
                        ? "#00F5D4"
                        : tab.badge === "NEW"
                        ? "#fbbf24"
                        : "#A855F7",
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === "chat" && (
            <div className="fade-in-up max-w-4xl mx-auto">
              <NaturalLanguageChat />
            </div>
          )}

          {activeTab === "multi-agent" && (
            <div className="fade-in-up max-w-4xl mx-auto">
              <MultiAgentFlow />
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="fade-in-up max-w-2xl mx-auto">
              <AlertSystem />
            </div>
          )}

          {activeTab === "predict" && (
            <div className="fade-in-up max-w-3xl mx-auto">
              <PredictionMarket />
            </div>
          )}

          {activeTab === "whale" && (
            <div className="fade-in-up">
              <WhaleTracker />
            </div>
          )}

          {activeTab === "ai" && (
            <div className="fade-in-up max-w-3xl mx-auto">
              <AIAnalyst />
            </div>
          )}

          {activeTab === "portfolio" && (
            <div className="fade-in-up">
              <PortfolioAnalyzer />
            </div>
          )}

          {activeTab === "defi" && (
            <div className="fade-in-up">
              <DeFiOpportunities />
            </div>
          )}

          {activeTab === "identity" && (
            <div className="fade-in-up max-w-xl mx-auto">
              <AgentIdentityCard />
            </div>
          )}

          {activeTab === "bots" && (
            <div className="fade-in-up max-w-3xl mx-auto">
              <BotIntegration />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t border-cyber-border py-6 px-6"
        style={{ background: "rgba(10,18,37,0.6)" }}
      >
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-orbitron text-sm font-black text-cyber-cyan">TRONSAGE</span>
            <span className="text-cyber-muted text-[12px]">
              AI Intelligence Agent · TRON × Bank of AI Hackathon 2025
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://bankofai.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-cyber-muted hover:text-cyber-cyan transition-colors"
            >
              🏦 Bank of AI
            </a>
            <a
              href="https://tron.network"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-cyber-muted hover:text-cyber-red transition-colors"
            >
              ⬡ TRON Network
            </a>
            <a
              href="https://tronscan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-cyber-muted hover:text-cyber-text transition-colors"
            >
              🔍 TronScan
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
