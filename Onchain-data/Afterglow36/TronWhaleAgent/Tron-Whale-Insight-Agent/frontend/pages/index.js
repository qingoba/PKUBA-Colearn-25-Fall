import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import WhaleTable from "../components/WhaleTable";
import DashboardInsightCard from "../components/DashboardInsightCard";
import { fetchWhales } from "../lib/api";

export default function HomePage() {
  const [hours, setHours] = useState(24);
  const [limit, setLimit] = useState(20);
  const [token, setToken] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const result = await fetchWhales({
        hours,
        limit,
        token: token || undefined,
      });
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load whale data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Layout>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Whale Dashboard</h1>
          <p style={styles.subtitle}>
            Monitor large TRON stablecoin transfers and whale activity.
          </p>
        </div>

        <div style={styles.filters}>
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            style={styles.select}
          >
            <option value={1}>1h</option>
            <option value={24}>24h</option>
            <option value={72}>72h</option>
            <option value={168}>7d</option>
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={styles.select}
          >
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
            <option value={50}>50 rows</option>
          </select>

          <select
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={styles.select}
          >
            <option value="">All tokens</option>
            <option value="USDT">USDT</option>
            <option value="USDD">USDD</option>
          </select>

          <button style={styles.button} onClick={loadData}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? <div style={styles.info}>Loading...</div> : null}
      {error ? <div style={styles.error}>{error}</div> : null}

      <DashboardInsightCard data={data} />

      <div style={styles.statsGrid}>
        <StatCard
          title="Window"
          value={`${data?.hours ?? hours}h`}
          subtitle="Selected analysis window"
        />
        <StatCard
          title="Whale Events"
          value={data?.count ?? 0}
          subtitle="Detected whale transfers"
        />
        <StatCard
          title="Largest Transfer"
          value={Number(data?.largest_transfer || 0).toLocaleString()}
          subtitle="Maximum amount in current result set"
        />
        <StatCard
          title="Token Filter"
          value={data?.token_filter || token || "ALL"}
          subtitle="Current token scope"
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <WhaleTable events={data?.events || []} />
      </div>
    </Layout>
  );
}

const styles = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 32,
    margin: 0,
    color: "#f8fafc",
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 8,
  },
  filters: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  select: {
    background: "#111827",
    color: "#e5e7eb",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: "10px 12px",
  },
  button: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  info: {
    marginBottom: 16,
    color: "#cbd5e1",
  },
  error: {
    marginBottom: 16,
    color: "#fca5a5",
    background: "#3f1d1d",
    padding: 12,
    borderRadius: 10,
  },
};