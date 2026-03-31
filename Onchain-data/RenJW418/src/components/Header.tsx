"use client";

import { useState, useEffect } from "react";

interface WalletState {
  connected: boolean;
  address: string | null;
  connecting: boolean;
}

declare global {
  interface Window {
    tronWeb?: {
      ready: boolean;
      defaultAddress: { base58: string };
      trx: {
        getBalance: (addr: string) => Promise<number>;
      };
    };
    tronLink?: {
      request: (params: { method: string }) => Promise<void>;
    };
  }
}

export default function Header() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    connecting: false,
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check if TronLink is already connected
  useEffect(() => {
    const check = () => {
      if (window.tronWeb?.ready && window.tronWeb.defaultAddress.base58) {
        setWallet({
          connected: true,
          address: window.tronWeb.defaultAddress.base58,
          connecting: false,
        });
      }
    };
    check();
    window.addEventListener("message", (e) => {
      if (e.data?.message?.action === "setAccount") check();
    });
  }, []);

  const connectWallet = async () => {
    setWallet((w) => ({ ...w, connecting: true }));
    try {
      if (window.tronLink) {
        await window.tronLink.request({ method: "tron_requestAccounts" });
        if (window.tronWeb?.ready) {
          setWallet({
            connected: true,
            address: window.tronWeb.defaultAddress.base58,
            connecting: false,
          });
        }
      } else {
        window.open("https://www.tronlink.org/", "_blank");
        setWallet((w) => ({ ...w, connecting: false }));
      }
    } catch {
      setWallet((w) => ({ ...w, connecting: false }));
    }
  };

  const addrShort = wallet.address
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : null;

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all"
      style={{
        background: scrolled
          ? "rgba(2,6,16,0.92)"
          : "rgba(2,6,16,0.6)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,245,212,0.12)",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.5)" : "none",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{
              background: "linear-gradient(135deg, rgba(0,245,212,0.2) 0%, rgba(0,245,212,0.06) 100%)",
              border: "1px solid rgba(0,245,212,0.35)",
              boxShadow: "0 0 16px rgba(0,245,212,0.2)",
            }}
          >
            ⬡
          </div>
          <div className="flex flex-col leading-none">
            <span
              className="font-orbitron text-base font-black tracking-widest"
              style={{
                color: "#00F5D4",
                textShadow: "0 0 12px rgba(0,245,212,0.5)",
              }}
            >
              TRONSAGE
            </span>
            <span className="font-mono text-[9px] text-cyber-muted tracking-[0.2em] mt-0.5">
              AI INTELLIGENCE AGENT
            </span>
          </div>
        </div>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: "Whale Tracker", href: "#whale" },
            { label: "AI Analysis", href: "#ai" },
            { label: "Portfolio", href: "#portfolio" },
            { label: "DeFi", href: "#defi" },
            { label: "Agent ID", href: "#identity" },
          ].map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="px-3 py-2 rounded-lg font-orbitron text-[10px] font-bold tracking-wider text-cyber-muted hover:text-cyber-text hover:bg-white/4 transition-all"
            >
              {n.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Network Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,51,102,0.1)", border: "1px solid rgba(255,51,102,0.2)" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "#FF3366", boxShadow: "0 0 6px #FF3366" }} />
            <span className="font-orbitron text-[10px] font-bold text-cyber-red tracking-wider">
              TRON Mainnet
            </span>
          </div>

          {/* Wallet Connect */}
          {wallet.connected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.25)" }}>
              <div className="live-dot" style={{ width: "7px", height: "7px" }} />
              <span className="font-mono text-[12px] text-cyber-cyan">{addrShort}</span>
            </div>
          ) : (
            <button onClick={connectWallet} disabled={wallet.connecting} className="btn-cyber btn-cyber-primary">
              {wallet.connecting ? (
                <span className="animate-pulse">Connecting...</span>
              ) : (
                <>
                  <span className="text-xs">⚡</span>
                  <span>Connect TronLink</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
