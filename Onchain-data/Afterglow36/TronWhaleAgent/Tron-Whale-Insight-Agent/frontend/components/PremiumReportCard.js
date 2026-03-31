import BadgeList from "./BadgeList";
import SimpleTable from "./SimpleTable";
import InsightCard from "./InsightCard";
import StatCard from "./StatCard";

export default function PremiumReportCard({ report }) {
  if (!report) return null;

  const deepMetrics = report.deep_metrics || {};
  const riskSummary = report.risk_summary || {};
  const counterpartyAnalysis = report.counterparty_analysis || {};
  const profile = report.profile || {};
  const insight = report.insight || {};

  const counterparties = counterpartyAnalysis.top_counterparties || [];

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerCard}>
        <h3 style={styles.title}>Premium Address Report</h3>
        <p style={styles.summary}>{report.executive_summary || "-"}</p>
      </div>

      <div style={styles.grid4}>
        <StatCard
          title="Window Days"
          value={report.window_days || 0}
          subtitle="Selected premium analysis window"
        />
        <StatCard
          title="Netflow USDT"
          value={Number(deepMetrics.netflow_usdt || 0).toLocaleString()}
          subtitle="Inflow - outflow"
        />
        <StatCard
          title="Activity Score"
          value={Number(deepMetrics.activity_intensity_score || 0).toLocaleString()}
          subtitle="Internal premium intensity metric"
        />
        <StatCard
          title="Risk Severity"
          value={riskSummary.severity || "-"}
          subtitle="Premium risk assessment"
        />
      </div>

      <div style={styles.grid2}>
        <BadgeList
          title="Premium Risk Signals"
          items={riskSummary.risk_signals || []}
          color="#dc2626"
        />
        <BadgeList
          title="Premium Labels"
          items={riskSummary.labels || profile.labels || []}
          color="#2563eb"
        />
      </div>

      <div style={styles.grid2}>
        <SimpleTable
          title="Counterparty Analysis"
          columns={[
            { key: "address", label: "Address", type: "address" },
            { key: "tx_count", label: "Tx Count" },
            { key: "total_amount", label: "Total Amount" },
          ]}
          rows={counterparties}
        />

        <SimpleTable
          title="Deep Metrics"
          columns={[
            { key: "metric", label: "Metric" },
            { key: "value", label: "Value" },
          ]}
          rows={[
            {
              metric: "Recent Transfer Count",
              value: deepMetrics.recent_transfer_count,
            },
            {
              metric: "Recent Total Volume",
              value: deepMetrics.recent_total_volume,
            },
            {
              metric: "Average Recent Transfer",
              value: deepMetrics.average_recent_transfer,
            },
            {
              metric: "Counterparty Concentration Ratio",
              value: counterpartyAnalysis.counterparty_concentration_ratio,
            },
          ]}
        />
      </div>

      <div style={styles.grid2}>
        <InsightCard insight={insight} />

        <div style={styles.noteCard}>
          <h3 style={styles.noteTitle}>Payment Layer</h3>
          <p style={styles.noteText}>
            This report is delivered through an x402-compatible premium flow.
            In the current demo, payment is simulated via a development payment
            gate abstraction, while preserving a direct upgrade path to real
            payment settlement and Bank of AI paid-tool orchestration.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  headerCard: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 18,
  },
  title: {
    margin: 0,
    marginBottom: 10,
    color: "#f8fafc",
    fontSize: 22,
  },
  summary: {
    margin: 0,
    color: "#cbd5e1",
    lineHeight: 1.7,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
  },
  noteCard: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 18,
  },
  noteTitle: {
    margin: 0,
    marginBottom: 10,
    color: "#f8fafc",
  },
  noteText: {
    margin: 0,
    color: "#cbd5e1",
    lineHeight: 1.7,
  },
};