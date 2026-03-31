import AddressLink from "./AddressLink";

function formatValue(v) {
  if (typeof v === "number") return v.toLocaleString();
  return v ?? "-";
}

function formatTimestamp(ts) {
  if (!ts) return "-";
  return new Date(ts * 1000).toLocaleString();
}

export default function SimpleTable({ title, columns = [], rows = [] }) {
  return (
    <div style={styles.card}>
      <div style={styles.title}>{title}</div>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={styles.th}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} style={styles.tr}>
              {columns.map((col) => (
                <td key={col.key} style={styles.td}>
                  {renderCell(row, col)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 ? <div style={styles.empty}>No data.</div> : null}
    </div>
  );
}

function renderCell(row, col) {
  const value = row[col.key];

  if (typeof col.render === "function") {
    return col.render(value, row);
  }

  if (col.type === "address") {
    return <AddressLink address={value} />;
  }

  if (col.type === "timestamp") {
    return formatTimestamp(value);
  }

  if (col.type === "token") {
    return String(value || "").replace("TokenSymbol.", "") || "-";
  }

  return formatValue(value);
}

const styles = {
  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 16,
  },
  title: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 14,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    color: "#94a3b8",
    fontSize: 13,
    padding: "10px 8px",
    borderBottom: "1px solid #1f2937",
  },
  td: {
    color: "#e5e7eb",
    fontSize: 14,
    padding: "10px 8px",
    borderBottom: "1px solid #1f2937",
    verticalAlign: "top",
  },
  tr: {},
  empty: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 13,
  },
};