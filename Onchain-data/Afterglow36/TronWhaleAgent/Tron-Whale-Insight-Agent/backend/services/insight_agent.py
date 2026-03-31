from __future__ import annotations


class InsightAgent:
    def generate_address_insight(self, profile: dict) -> dict:
        address = profile["address"]
        features = profile["features"]
        labels = profile.get("labels", [])
        risk_signals = profile.get("risk_signals", [])
        top_counterparties = profile.get("top_counterparties", [])

        summary = (
            f"Address {address} has {features['tx_count']} recent transfers, "
            f"max transfer {features['max_transfer']}, "
            f"with inflow/outflow USDT = {features['inflow_usdt']}/{features['outflow_usdt']}."
        )

        key_signals = [
            f"labels={','.join(labels) if labels else 'none'}",
            f"counterparties={features['counterparty_count']}",
            f"active_days={profile.get('active_days', 0)}",
        ]

        if top_counterparties:
            top_cp = top_counterparties[0]
            interpretation = (
                f"The address shows concentrated interaction with counterparties. "
                f"The top counterparty is {top_cp['address']} with total amount {top_cp['total_amount']}."
            )
        else:
            interpretation = "The address currently shows limited counterparty interaction."

        risk_note = (
            f"Current detected risk signals: {', '.join(risk_signals)}."
            if risk_signals
            else "Current detected risk signals: none."
        )

        return {
            "summary": summary,
            "key_signals": key_signals,
            "interpretation": interpretation,
            "risk_note": risk_note,
        }