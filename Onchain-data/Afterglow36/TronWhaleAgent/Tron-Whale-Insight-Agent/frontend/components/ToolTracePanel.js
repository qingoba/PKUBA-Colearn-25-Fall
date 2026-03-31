export default function ToolTracePanel({ toolTrace = [] }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>Tool Execution Trace</h3>

      {toolTrace.length === 0 ? (
        <div style={styles.empty}>No tool trace available.</div>
      ) : (
        <div style={styles.list}>
          {toolTrace.map((entry, idx) => (
            <div key={`${entry.tool_name}-${idx}`} style={styles.item}>
              <div style={styles.row}>
                <div>
                  <div style={styles.label}>Tool</div>
                  <div style={styles.value}>{entry.tool_name}</div>
                </div>

                <div>
                  <div style={styles.label}>Provider</div>
                  <span
                    style={{
                      ...styles.badge,
                      background:
                        entry.provider === "bankai_mcp" ? "#7c3aed" : "#2563eb",
                    }}
                  >
                    {entry.provider}
                  </span>
                </div>

                <div>
                  <div style={styles.label}>Status</div>
                  <span
                    style={{
                      ...styles.badge,
                      background:
                        entry.status === "success" ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {entry.status}
                  </span>
                </div>
              </div>

              <div style={styles.block}>
                <div style={styles.label}>Arguments</div>
                <pre style={styles.pre}>
                  {JSON.stringify(entry.arguments || {}, null, 2)}
                </pre>
              </div>

              {entry.error ? (
                <div style={styles.block}>
                  <div style={styles.label}>Error</div>
                  <div style={styles.errorText}>{entry.error}</div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
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
  empty: {
    color: "#64748b",
    fontSize: 14,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  item: {
    background: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: 12,
    padding: 14,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: 16,
    marginBottom: 12,
  },
  label: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 6,
  },
  value: {
    color: "#f8fafc",
    fontWeight: 600,
  },
  badge: {
    display: "inline-block",
    color: "#fff",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 600,
  },
  block: {
    marginTop: 10,
  },
  pre: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: "#cbd5e1",
    fontSize: 12,
    background: "#111827",
    padding: 10,
    borderRadius: 10,
    margin: 0,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 13,
  },
};