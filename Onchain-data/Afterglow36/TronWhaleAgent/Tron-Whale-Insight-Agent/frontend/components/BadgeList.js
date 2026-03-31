export default function BadgeList({ title, items = [], color = "#2563eb" }) {
  return (
    <div style={styles.card}>
      <div style={styles.title}>{title}</div>
      <div style={styles.wrap}>
        {items.length ? (
          items.map((item) => (
            <span
              key={item}
              style={{
                ...styles.badge,
                background: color,
              }}
            >
              {item}
            </span>
          ))
        ) : (
          <span style={styles.empty}>None</span>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 16,
  },
  title: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 12,
  },
  wrap: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    color: "#fff",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 600,
  },
  empty: {
    color: "#64748b",
    fontSize: 13,
  },
};