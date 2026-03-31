export default function InsightCard({ insight }) {
  if (!insight) return null;

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>AI Insight</h3>

      <div style={styles.block}>
        <div style={styles.label}>Summary</div>
        <div style={styles.text}>{insight.summary || "-"}</div>
      </div>

      <div style={styles.block}>
        <div style={styles.label}>Key Signals</div>
        <ul style={styles.list}>
          {(insight.key_signals || []).map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>

      <div style={styles.block}>
        <div style={styles.label}>Interpretation</div>
        <div style={styles.text}>{insight.interpretation || "-"}</div>
      </div>

      <div style={styles.block}>
        <div style={styles.label}>Risk Note</div>
        <div style={styles.text}>{insight.risk_note || "-"}</div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 18,
  },
  heading: {
    margin: 0,
    marginBottom: 16,
    color: "#f8fafc",
  },
  block: {
    marginBottom: 14,
  },
  label: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 6,
  },
  text: {
    color: "#e5e7eb",
    lineHeight: 1.6,
  },
  list: {
    color: "#e5e7eb",
    paddingLeft: 18,
    margin: 0,
  },
};
