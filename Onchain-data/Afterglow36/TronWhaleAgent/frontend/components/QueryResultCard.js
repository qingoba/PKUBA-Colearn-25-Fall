import Link from "next/link";
import WhaleTable from "./WhaleTable";
import InsightCard from "./InsightCard";
import StatCard from "./StatCard";
import BadgeList from "./BadgeList";
import ToolTracePanel from "./ToolTracePanel";
import PremiumReportCard from "./PremiumReportCard";

export default function QueryResultCard({ data }) {
  if (!data) return null;

  const queryType = data.query_type;
  const answer = data.answer || {};
  const toolTrace = data.tool_trace || [];

  return (
    <div style={styles.wrapper}>
      <div style={styles.topGrid}>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Query Result</div>
          {renderAnswer(queryType, answer)}
        </div>

        <div style={styles.section}>
          <ToolTracePanel toolTrace={toolTrace} />
        </div>
      </div>
    </div>
  );
}

function renderAnswer(queryType, answer) {
  if (queryType === "whale_query") {
    return (
      <>
        <div style={styles.grid3}>
          <StatCard title="Query Type" value="Whale Query" />
          <StatCard title="Event Count" value={answer.count || 0} />
          <StatCard
            title="Top Amount"
            value={Number(answer.top_amount || 0).toLocaleString()}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <WhaleTable events={answer.events || []} />
        </div>
      </>
    );
  }

  if (queryType === "address_query") {
    const profile = answer.profile || {};
    const insight = answer.insight || {};
    const features = profile.features || {};

    return (
      <>
        <div style={styles.grid3}>
          <StatCard title="Query Type" value="Address Query" />
          <StatCard title="Transactions" value={features.tx_count || 0} />
          <StatCard
            title="Max Transfer"
            value={Number(features.max_transfer || 0).toLocaleString()}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <Link
            href={`/address?address=${encodeURIComponent(profile.address || "")}`}
            style={styles.linkBtn}
          >
            Open Full Address Analysis
          </Link>
        </div>

        <div style={styles.grid2}>
          <BadgeList title="Labels" items={profile.labels || []} color="#2563eb" />
          <BadgeList
            title="Risk Signals"
            items={profile.risk_signals || []}
            color="#dc2626"
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <InsightCard insight={insight} />
        </div>
      </>
    );
  }

  if (queryType === "premium_address_query") {
    if (answer.payment_required) {
      return (
        <div style={styles.card}>
          <h3 style={styles.heading}>Premium Query Locked</h3>
          <p style={styles.text}>
            Payment is required before the premium address report can be returned.
          </p>
        </div>
      );
    }

    return <PremiumReportCard report={answer} />;
  }

  if (queryType === "summary_query") {
    return (
      <>
        <div style={styles.card}>
          <h3 style={styles.heading}>Summary</h3>
          <p style={styles.text}>{answer.summary || "-"}</p>
        </div>

        <div style={{ marginTop: 16 }}>
          <WhaleTable events={answer.events || []} />
        </div>
      </>
    );
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>Raw Result</h3>
      <pre style={styles.pre}>{JSON.stringify({ queryType, answer }, null, 2)}</pre>
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: 20,
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: 16,
    alignItems: "start",
  },
  section: {
    minWidth: 0,
  },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 10,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginTop: 16,
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },
  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 18,
  },
  heading: {
    margin: 0,
    marginBottom: 12,
    color: "#f8fafc",
  },
  text: {
    color: "#e5e7eb",
    lineHeight: 1.6,
    margin: 0,
  },
  pre: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: "#cbd5e1",
    fontSize: 13,
  },
  linkBtn: {
    display: "inline-block",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 600,
  },
};