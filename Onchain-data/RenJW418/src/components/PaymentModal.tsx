"use client";

import { useState, useEffect } from "react";
import { X402PaymentRequest, X402PaymentProof } from "@/types";

// ──────────────────────────────────────────────
// Token metadata
// ──────────────────────────────────────────────
type TokenChoice = "USDT" | "USDD";

const TOKEN_META: Record<TokenChoice, { contract: string; rawAmount: string; label: string; decimals: number }> = {
  USDT: {
    contract: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    rawAmount: "100000",
    label: "0.1 USDT",
    decimals: 6,
  },
  USDD: {
    contract: "TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn",
    rawAmount: "100000000000000000",
    label: "0.1 USDD",
    decimals: 18,
  },
};

interface Props {
  onClose: () => void;
  onPaymentComplete: (proof: X402PaymentProof | null, demo: boolean) => void;
}

export default function PaymentModal({ onClose, onPaymentComplete }: Props) {
  const [selectedToken, setSelectedToken] = useState<TokenChoice>("USDT");
  const [paymentRequest, setPaymentRequest] = useState<X402PaymentRequest | null>(null);
  const [txHash, setTxHash] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(true);

  // Re-fetch payment request when token changes
  useEffect(() => {
    let cancelled = false;
    setLoadingRequest(true);
    setError(null);

    fetch(`/api/payment/request?memo=TronSage+AI+Analysis&token=${selectedToken}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json.success) {
          setPaymentRequest(json.data.paymentRequest);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load payment request");
      })
      .finally(() => {
        if (!cancelled) setLoadingRequest(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedToken]);

  const handleVerify = async () => {
    if (!/^[0-9a-fA-F]{64}$/.test(txHash.trim())) {
      setError("Invalid transaction hash — must be 64 hex characters");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: txHash.trim(), requestId: paymentRequest?.requestId }),
      });
      const json = await res.json();

      if (json.success && json.data?.valid) {
        const proof: X402PaymentProof = {
          txHash: txHash.trim(),
          amount: TOKEN_META[selectedToken].rawAmount,
          token: selectedToken,
          from: json.data.from || "",
          timestamp: Date.now() / 1000,
          requestId: paymentRequest?.requestId || "",
        };
        onPaymentComplete(proof, false);
      } else {
        setError(json.details || json.error || "Payment verification failed");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setVerifying(false);
    }
  };

  const meta = TOKEN_META[selectedToken];
  // QR value encodes a TRC20 transfer intent
  const qrValue = `tron:${paymentRequest?.toAddress || "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs"}?contract=${meta.contract}&amount=${meta.rawAmount}&token=${selectedToken}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="card card-glow w-full max-w-md relative"
        style={{ border: "1px solid rgba(0,240,255,0.2)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyber-border">
          <div className="flex items-center gap-3">
            <span className="text-xl">💳</span>
            <div>
              <h2 className="font-orbitron text-sm font-bold text-cyber-text tracking-wide">
                x402 PAYMENT
              </h2>
              <p className="text-[11px] text-cyber-muted mt-0.5">Bank of AI Protocol · TRON Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-cyber-muted hover:text-cyber-text transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Token toggle */}
          <div>
            <p className="text-[11px] text-cyber-muted mb-2 font-orbitron tracking-wider uppercase">
              Select Token
            </p>
            <div className="flex gap-2">
              {(["USDT", "USDD"] as TokenChoice[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedToken(t)}
                  className={`flex-1 py-2 rounded-lg border font-orbitron text-[12px] font-bold tracking-wide transition-all ${
                    selectedToken === t
                      ? "border-cyber-cyan/60 bg-cyber-cyan/15 text-cyber-cyan"
                      : "border-white/10 bg-white/4 text-cyber-muted hover:border-cyber-cyan/30 hover:text-cyber-text"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Payment instructions */}
          <div className="p-4 rounded-lg border border-cyber-cyan/15 bg-cyber-cyan/5">
            <p className="text-[11px] text-cyber-muted mb-1">Send exactly</p>
            <p className="font-orbitron text-xl font-bold text-cyber-cyan">{meta.label}</p>
            <p className="text-[11px] text-cyber-muted mt-1">
              Contract:{" "}
              <span className="text-cyber-text font-mono text-[10px]">
                {meta.contract.slice(0, 10)}…{meta.contract.slice(-6)}
              </span>
            </p>
          </div>

          {/* Recipient address */}
          {loadingRequest ? (
            <div className="h-10 rounded-lg bg-white/5 animate-pulse" />
          ) : (
            <div className="space-y-1">
              <p className="text-[11px] text-cyber-muted font-orbitron tracking-wider uppercase">
                To Address
              </p>
              <div className="p-3 rounded-lg bg-white/4 border border-white/8">
                <p className="font-mono text-[11px] text-cyber-text break-all">
                  {paymentRequest?.toAddress || "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs"}
                </p>
              </div>
              <p className="text-[10px] text-cyber-muted">
                Network: <span className="text-cyber-cyan">TRON Mainnet (TRC20)</span>
              </p>
            </div>
          )}

          {/* QR hint */}
          <div className="p-3 rounded-lg bg-white/3 border border-white/8 text-center">
            <p className="text-[10px] text-cyber-muted font-mono break-all opacity-60">
              {qrValue.slice(0, 80)}…
            </p>
            <p className="text-[10px] text-cyber-muted mt-1">
              Scan with any TRON-compatible wallet
            </p>
          </div>

          {/* TxHash input */}
          <div className="space-y-2">
            <label className="text-[11px] text-cyber-muted font-orbitron tracking-wider uppercase">
              Transaction Hash (after sending)
            </label>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="64-character hex transaction ID"
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-cyber-text placeholder-cyber-muted/50 font-mono text-[11px] focus:outline-none focus:border-cyber-cyan/40 transition-colors"
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/8 text-red-400 text-[11px]">
              {error}
            </div>
          )}

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={verifying || !txHash.trim()}
            className="w-full py-3 rounded-lg font-orbitron text-[12px] font-bold tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: verifying ? "rgba(0,240,255,0.15)" : "linear-gradient(135deg, #00f0ff22, #00f0ff44)",
              border: "1px solid rgba(0,240,255,0.4)",
              color: "#00f0ff",
            }}
          >
            {verifying ? "VERIFYING ON-CHAIN…" : "VERIFY PAYMENT"}
          </button>

          <p className="text-[10px] text-cyber-muted text-center">
            Payment confirmed on TRON blockchain via{" "}
            <span className="text-cyber-cyan">Bank of AI x402 Protocol</span>
          </p>
        </div>
      </div>
    </div>
  );
}
