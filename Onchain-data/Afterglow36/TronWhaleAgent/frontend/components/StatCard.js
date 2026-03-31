export default function StatCard({ title, value, subtitle }) {
  return (
    <div style={styles.card}>
      <div style={styles.title}>{title}</div>
      <div style={styles.value}>{value}</div>
      {subtitle ? <div style={styles.subtitle}>{subtitle}</div> : null}
    </div>
  );
}

const styles = {
  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 18,
    minHeight: 110,
  },
  title: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 10,
  },
  value: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 13,
  },
};