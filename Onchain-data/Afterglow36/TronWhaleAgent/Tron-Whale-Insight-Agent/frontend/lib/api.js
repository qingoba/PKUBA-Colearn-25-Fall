const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://tron-whale-insight-agent.onrender.com";

async function handleResponse(res) {
  let payload = null;

  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const err = new Error(
      payload?.detail?.message ||
        payload?.message ||
        `Request failed: ${res.status}`
    );
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

export async function fetchWhales({ hours = 24, limit = 20, token } = {}) {
  const params = new URLSearchParams();
  params.set("hours", String(hours));
  params.set("limit", String(limit));
  if (token) params.set("token", token);

  const res = await fetch(`${API_BASE}/api/whales?${params.toString()}`);
  return handleResponse(res);
}

export async function fetchAddressProfile(address) {
  const res = await fetch(`${API_BASE}/api/address/${address}`);
  return handleResponse(res);
}

export async function queryAgent(question, { paid = false } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (paid) {
    headers["x-demo-payment"] = "paid";
  }

  const res = await fetch(`${API_BASE}/api/query`, {
    method: "POST",
    headers,
    body: JSON.stringify({ question }),
  });
  return handleResponse(res);
}

export async function fetchPremiumAddressReport({
  address,
  windowDays = 7,
  includeCounterpartyAnalysis = true,
  includeRiskSummary = true,
  paid = false,
}) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (paid) {
    headers["x-demo-payment"] = "paid";
  }

  const res = await fetch(`${API_BASE}/api/premium/address-report`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      address,
      window_days: windowDays,
      include_counterparty_analysis: includeCounterpartyAnalysis,
      include_risk_summary: includeRiskSummary,
    }),
  });

  return handleResponse(res);
}