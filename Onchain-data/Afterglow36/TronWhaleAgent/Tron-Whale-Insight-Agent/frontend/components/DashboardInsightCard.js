export default function DashboardInsightCard({ data }) {
  const events = data?.events || [];
  const count = data?.count || 0;
  const largest = Number(data?.largest_transfer || 0);
  const tokenFilter = data?.token_filter || "ALL";
  const hours = data?.hours || 24;

  const summary = buildSummary({ count, largest, tokenFilter, hours, events });
  const highlights = buildHighlights(events);

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Today&apos;s Insight</h3>
      <p style={styles.summary}>{summary}</p>

      <div style={styles.grid}>
        {highlights.map((item) => (
          <div key={item.label} style={styles.item}>
            <div style={styles.label}>{item.label}</div>
            <div style={styles.value}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildSummary({ count, largest, tokenFilter, hours, events }) {
  if (!count || !events.length) {
    return `No whale transfers were detected in the last ${hours} hours${
      tokenFilter !== "ALL" ? ` for ${tokenFilter}` : ""
    }.`;
  }

  const tokenCounts = {};
  for (const e of events) {
    const token = String(e.token || "").replace("TokenSymbol.", "") || "UNKNOWN";
    tokenCounts[token] = (tokenCounts[token] || 0) + 1;
  }

  const dominantToken = Object.entries(tokenCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "UNKNOWN";
  const dominantLevel = mostCommon(events.map((e) => e.whale_level || "unknown"));

  return `In the last ${hours} hours, ${count} whale transfer${
    count > 1 ? "s were" : " was"
  } detected. Activity is currently dominated by ${dominantToken}, with the largest transfer reaching ${largest.toLocaleString()} and the most common level being ${dominantLevel}.`;
}

function buildHighlights(events) {
  if (!events.length) {
    return [
      { label: "Dominant Token", value: "-" },
      { label: "Top Whale Level", value: "-" },
      { label: "Most Active Sender", value: "-" },
    ];
  }

  const tokenCounts = {};
  const levelCounts = {};
  const senderCounts = {};

  for (const e of events) {
    const token = String(e.token || "").replace("TokenSymbol.", "") || "UNKNOWN";
    tokenCounts[token] = (tokenCounts[token] || 0) + 1;
    levelCounts[e.whale_level || "unknown"] = (levelCounts[e.whale_level || "unknown"] || 0) + 1;
    senderCounts[e.from_address || "-"] = (senderCounts[e.from_address || "-"] || 0) + 1;
  }

  return [
    {
      label: "Dominant Token",
      value: topKey(tokenCounts),
    },
    {
      label: "Top Whale Level",
      value: topKey(levelCounts),
    },
    {
      label: "Most Active Sender",
      value: shortAddr(topKey(senderCounts)),
    },
  ];
}

function topKey(obj) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
}

function mostCommon(arr) {
  const counts = {};
  for (const x of arr) counts[x] = (counts[x] || 0) + 1;
  return topKey(counts);
}

function shortAddr(addr = "") {
  if (!addr || addr === "-") return "-";
  if (addr.length <= 18) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

const styles = {
  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  title: {
    margin: 0,
    marginBottom: 12,
    color: "#f8fafc",
    fontSize: 20,
  },
  summary: {
    margin: 0,
    color: "#cbd5e1",
    lineHeight: 1.7,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginTop: 16,
  },
  item: {
    background: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: 12,
    padding: 14,
  },
  label: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 8,
  },
  value: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: 600,
  },
};