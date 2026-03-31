import AddressLink from "./AddressLink";

function shortAddr(addr = "") {
  if (!addr) return "-";
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

function formatAmount(v) {
  if (v == null) return "-";
  return Number(v).toLocaleString();
}

function formatTs(ts) {
  if (!ts) return "-";
  return new Date(ts * 1000).toLocaleString();
}

function levelColor(level) {
  if (level === "mega_whale") return "#ef4444";
  if (level === "large_whale") return "#f59e0b";
  return "#22c55e";
}

export default function WhaleTable({ events = [] }) {
  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Token</th>
            <th style={styles.th}>Amount</th>
            <th style={styles.th}>Level</th>
            <th style={styles.th}>From</th>
            <th style={styles.th}>To</th>
            <th style={styles.th}>Time</th>
          </tr>
        </thead>
        <tbody>
          {events.map((item) => (
            <tr key={`${item.tx_hash}-${item.amount}`} style={styles.tr}>
              <td style={styles.td}>
                {String(item.token).replace("TokenSymbol.", "")}
              </td>
              <td style={styles.td}>{formatAmount(item.amount)}</td>
              <td style={styles.td}>
                <span
                  style={{
                    ...styles.badge,
                    background: levelColor(item.whale_level),
                  }}
                >
                  {item.whale_level}
                </span>
              </td>
              <td style={styles.td}>
                <AddressLink address={item.from_address} />
              </td>
              <td style={styles.td}>
                <AddressLink address={item.to_address} />
              </td>
              <td style={styles.td}>{formatTs(item.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {events.length === 0 ? (
        <div style={styles.empty}>No whale events found for this window.</div>
      ) : null}
    </div>
  );
}

const styles = {
  wrapper: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    fontSize: 13,
    color: "#94a3b8",
    borderBottom: "1px solid #1f2937",
    background: "#0f172a",
  },
  tr: {
    borderBottom: "1px solid #1f2937",
  },
  td: {
    padding: "14px 16px",
    fontSize: 14,
    color: "#e5e7eb",
    verticalAlign: "middle",
  },
  badge: {
    display: "inline-block",
    color: "white",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 600,
  },
  empty: {
    padding: 20,
    color: "#94a3b8",
  },
};