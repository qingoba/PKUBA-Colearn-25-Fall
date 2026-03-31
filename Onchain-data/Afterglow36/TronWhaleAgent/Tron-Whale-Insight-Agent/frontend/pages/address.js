import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import BadgeList from "../components/BadgeList";
import SimpleTable from "../components/SimpleTable";
import InsightCard from "../components/InsightCard";
import PremiumReportCard from "../components/PremiumReportCard";
import {
  fetchAddressProfile,
  fetchPremiumAddressReport,
} from "../lib/api";

export default function AddressPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [premiumReport, setPremiumReport] = useState(null);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(null);
  const [premiumError, setPremiumError] = useState("");

  async function loadAddress(targetAddress) {
    if (!targetAddress?.trim()) return;
    try {
      setLoading(true);
      setError("");
      const result = await fetchAddressProfile(targetAddress.trim());
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to fetch address profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!address.trim()) return;

    router.push(
      `/address?address=${encodeURIComponent(address.trim())}`,
      undefined,
      { shallow: true }
    );

    setPremiumReport(null);
    setPaymentRequired(null);
    setPremiumError("");
    loadAddress(address.trim());
  }

  async function handleUnlockPremium() {
    if (!address.trim()) return;

    try {
      setPremiumLoading(true);
      setPremiumError("");
      setPaymentRequired(null);

      const result = await fetchPremiumAddressReport({
        address: address.trim(),
        windowDays: 7,
        includeCounterpartyAnalysis: true,
        includeRiskSummary: true,
        paid: false,
      });

      setPremiumReport(result);
    } catch (err) {
      if (err.status === 402) {
        setPaymentRequired(err.payload?.detail || err.payload || {});
      } else {
        setPremiumError(err.message || "Failed to load premium report.");
      }
    } finally {
      setPremiumLoading(false);
    }
  }

  async function handleSimulatePayment() {
    if (!address.trim()) return;

    try {
      setPremiumLoading(true);
      setPremiumError("");

      const result = await fetchPremiumAddressReport({
        address: address.trim(),
        windowDays: 7,
        includeCounterpartyAnalysis: true,
        includeRiskSummary: true,
        paid: true,
      });

      setPremiumReport(result);
      setPaymentRequired(null);
    } catch (err) {
      setPremiumError(err.message || "Premium payment simulation failed.");
    } finally {
      setPremiumLoading(false);
    }
  }

  useEffect(() => {
    const qAddress = router.query.address;
    if (typeof qAddress === "string" && qAddress) {
      setAddress(qAddress);
      setPremiumReport(null);
      setPaymentRequired(null);
      setPremiumError("");
      loadAddress(qAddress);
    }
  }, [router.query.address]);

  const profile = data?.profile;
  const insight = data?.insight;
  const features = profile?.features || {};

  const tokenBreakdownRows = Object.entries(profile?.token_breakdown || {}).map(
    ([token, amount]) => ({ token, amount })
  );

  return (
    <Layout>
      <h1 style={styles.title}>Address Intelligence</h1>
      <p style={styles.subtitle}>
        Analyze a TRON address and inspect its counterparties, flows, and risk signals.
      </p>

      <div style={styles.searchRow}>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter a TRON address"
          style={styles.input}
        />
        <button onClick={handleSearch} style={styles.button}>
          Analyze
        </button>
        <button onClick={handleUnlockPremium} style={styles.premiumButton}>
          Unlock Deep Report
        </button>
      </div>

      {loading ? <div style={styles.info}>Loading...</div> : null}
      {error ? <div style={styles.error}>{error}</div> : null}

      {profile ? (
        <>
          <div style={styles.statsGrid}>
            <StatCard title="Transactions" value={features.tx_count || 0} />
            <StatCard
              title="USDT Inflow"
              value={Number(features.inflow_usdt || 0).toLocaleString()}
            />
            <StatCard
              title="USDT Outflow"
              value={Number(features.outflow_usdt || 0).toLocaleString()}
            />
            <StatCard
              title="Max Transfer"
              value={Number(features.max_transfer || 0).toLocaleString()}
            />
          </div>

          <div style={styles.grid2}>
            <BadgeList title="Labels" items={profile.labels || []} color="#2563eb" />
            <BadgeList
              title="Risk Signals"
              items={profile.risk_signals || []}
              color="#dc2626"
            />
          </div>

          <div style={styles.grid3}>
            <StatCard title="Counterparties" value={features.counterparty_count || 0} />
            <StatCard title="Active Days" value={profile.active_days || 0} />
            <StatCard
              title="Stablecoin Ratio"
              value={Number(features.stablecoin_ratio || 0).toLocaleString()}
            />
          </div>

          <div style={styles.grid2}>
            <SimpleTable
              title="Largest Inflow"
              columns={[
                { key: "timestamp", label: "Time", type: "timestamp" },
                { key: "token", label: "Token", type: "token" },
                { key: "amount", label: "Amount" },
                { key: "from_address", label: "From", type: "address" },
              ]}
              rows={profile.largest_inflow ? [profile.largest_inflow] : []}
            />

            <SimpleTable
              title="Largest Outflow"
              columns={[
                { key: "timestamp", label: "Time", type: "timestamp" },
                { key: "token", label: "Token", type: "token" },
                { key: "amount", label: "Amount" },
                { key: "to_address", label: "To", type: "address" },
              ]}
              rows={profile.largest_outflow ? [profile.largest_outflow] : []}
            />
          </div>

          <div style={styles.grid2}>
            <SimpleTable
              title="Top Counterparties"
              columns={[
                { key: "address", label: "Address", type: "address" },
                { key: "tx_count", label: "Tx Count" },
                { key: "total_amount", label: "Total Amount" },
              ]}
              rows={profile.top_counterparties || []}
            />

            <SimpleTable
              title="Token Breakdown"
              columns={[
                { key: "token", label: "Token", type: "token" },
                { key: "amount", label: "Amount" },
              ]}
              rows={tokenBreakdownRows}
            />
          </div>

          <div style={styles.grid2}>
            <SimpleTable
              title="Recent Transfers"
              columns={[
                { key: "timestamp", label: "Time", type: "timestamp" },
                { key: "token", label: "Token", type: "token" },
                { key: "amount", label: "Amount" },
                { key: "from_address", label: "From", type: "address" },
                { key: "to_address", label: "To", type: "address" },
              ]}
              rows={profile.recent_transfers || []}
            />

            <InsightCard insight={insight} />
          </div>
        </>
      ) : null}

      {premiumLoading ? <div style={styles.info}>Loading premium report...</div> : null}
      {premiumError ? <div style={styles.error}>{premiumError}</div> : null}

      {paymentRequired ? (
        <div style={styles.paymentCard}>
          <h3 style={styles.paymentTitle}>Premium Report Locked</h3>
          <p style={styles.paymentText}>
            {paymentRequired.message || "Payment required to unlock premium report."}
          </p>

          <div style={styles.paymentMeta}>
            <div><strong>Scheme:</strong> {paymentRequired.payment_scheme || "-"}</div>
            <div><strong>Amount:</strong> {paymentRequired.amount || "-"} {paymentRequired.currency || ""}</div>
            <div><strong>Resource:</strong> {paymentRequired.resource || "-"}</div>
          </div>

          <button onClick={handleSimulatePayment} style={styles.paidButton}>
            Simulate Payment & Unlock
          </button>
        </div>
      ) : null}

      {premiumReport ? <PremiumReportCard report={premiumReport} /> : null}
    </Layout>
  );
}

const styles = {
  title: {
    fontSize: 32,
    margin: 0,
    color: "#f8fafc",
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 8,
  },
  searchRow: {
    display: "flex",
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: 260,
    background: "#111827",
    color: "#e5e7eb",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: "12px 14px",
  },
  button: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "12px 16px",
    cursor: "pointer",
  },
  premiumButton: {
    background: "#7c3aed",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
  paidButton: {
    marginTop: 14,
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
  info: {
    color: "#cbd5e1",
    marginBottom: 16,
  },
  error: {
    marginBottom: 16,
    color: "#fca5a5",
    background: "#3f1d1d",
    padding: 12,
    borderRadius: 10,
  },
  paymentCard: {
    marginTop: 20,
    background: "#111827",
    border: "1px solid #4c1d95",
    borderRadius: 16,
    padding: 18,
  },
  paymentTitle: {
    margin: 0,
    marginBottom: 10,
    color: "#f8fafc",
  },
  paymentText: {
    margin: 0,
    color: "#cbd5e1",
    marginBottom: 12,
  },
  paymentMeta: {
    color: "#e5e7eb",
    display: "grid",
    gap: 6,
    fontSize: 14,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 16,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 16,
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 16,
  },
};