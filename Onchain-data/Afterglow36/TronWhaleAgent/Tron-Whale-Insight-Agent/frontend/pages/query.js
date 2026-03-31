import { useState } from "react";
import Layout from "../components/Layout";
import QueryResultCard from "../components/QueryResultCard";
import { queryAgent } from "../lib/api";

const EXAMPLES = [
  "What are the largest whale transfers on TRON?",
  "Analyze this address TBPxhVAsuzoFnKyXtc1o2UySEydPHgATto",
  "Give me a summary of recent TRON activity",
  "Give me a premium report for this address TBPxhVAsuzoFnKyXtc1o2UySEydPHgATto",
];

export default function QueryPage() {
  const [question, setQuestion] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentRequired, setPaymentRequired] = useState(null);

  async function handleSubmit(paid = false) {
    if (!question.trim()) return;

    try {
      setLoading(true);
      setError("");
      const result = await queryAgent(question.trim(), { paid });
      setData(result);

      if (result?.answer?.payment_required) {
        setPaymentRequired(result.answer.payment_detail || {});
      } else {
        setPaymentRequired(null);
      }
    } catch (err) {
      setError(err.message || "Query failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <h1 style={styles.title}>AI Query</h1>
      <p style={styles.subtitle}>
        Ask natural-language questions about TRON whale activity, address behavior, and premium intelligence.
      </p>

      <div style={styles.box}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Example: Give me a premium report for this address T..."
          style={styles.textarea}
        />

        <div style={styles.actions}>
          <button onClick={() => handleSubmit(false)} style={styles.button}>
            Run Query
          </button>
        </div>
      </div>

      <div style={styles.examples}>
        <div style={styles.examplesTitle}>Example prompts</div>
        <div style={styles.exampleList}>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              style={styles.exampleBtn}
              onClick={() => setQuestion(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div style={styles.info}>Loading...</div> : null}
      {error ? <div style={styles.error}>{error}</div> : null}

      {paymentRequired ? (
        <div style={styles.paymentCard}>
          <h3 style={styles.paymentTitle}>Premium Query Locked</h3>
          <p style={styles.paymentText}>
            {paymentRequired.message || "Payment required to unlock premium query result."}
          </p>

          <div style={styles.paymentMeta}>
            <div><strong>Scheme:</strong> {paymentRequired.payment_scheme || "-"}</div>
            <div><strong>Amount:</strong> {paymentRequired.amount || "-"} {paymentRequired.currency || ""}</div>
            <div><strong>Resource:</strong> {paymentRequired.resource || "-"}</div>
          </div>

          <button onClick={() => handleSubmit(true)} style={styles.paidButton}>
            Simulate Payment & Unlock Query
          </button>
        </div>
      ) : null}

      {data ? <QueryResultCard data={data} /> : null}
    </Layout>
  );
}

const styles = {
  title: {
    fontSize: 32,
    margin: 0,
    color: "#f8fafc",
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 8,
  },
  box: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  textarea: {
    minHeight: 140,
    background: "#111827",
    color: "#e5e7eb",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-start",
  },
  button: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
  examples: {
    marginTop: 18,
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 16,
  },
  examplesTitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 12,
  },
  exampleList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  exampleBtn: {
    background: "#1f2937",
    color: "#e5e7eb",
    border: "1px solid #334155",
    borderRadius: 999,
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: 13,
  },
  info: {
    color: "#cbd5e1",
    marginTop: 16,
  },
  error: {
    marginTop: 16,
    color: "#fca5a5",
    background: "#3f1d1d",
    padding: 12,
    borderRadius: 10,
  },
  paymentCard: {
    marginTop: 16,
    background: "#111827",
    border: "1px solid #4c1d95",
    borderRadius: 16,
    padding: 18,
  },
  paymentTitle: {
    margin: 0,
    marginBottom: 10,
    color: "#f8fafc",
  },
  paymentText: {
    margin: 0,
    color: "#cbd5e1",
    marginBottom: 12,
  },
  paymentMeta: {
    color: "#e5e7eb",
    display: "grid",
    gap: 6,
    fontSize: 14,
  },
  paidButton: {
    marginTop: 14,
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
};