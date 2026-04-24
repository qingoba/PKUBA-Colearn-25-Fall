# TronClaw — TRON Blockchain Capabilities for OpenClaw

TronClaw gives your OpenClaw agent instant access to TRON blockchain operations.

## Installation

```bash
clawhub install tronclaw
```

Or manually:
```bash
# Clone into your OpenClaw workspace skills directory
git clone https://github.com/YOUR_USERNAME/tronclaw ~/.openclaw/skills/tronclaw
```

## Configuration

Set your TronClaw Gateway URL in OpenClaw settings:
```yaml
# ~/.openclaw/config.yaml
skills:
  tronclaw:
    gateway_url: https://api.tronclaw.io   # or http://localhost:3000
    network: nile                           # nile | mainnet
    mock_mode: false
```

## Available Tools

Once installed, your OpenClaw agent can use:

### Payment (x402 Protocol)
- `tron_check_balance` — Check TRX/USDT/USDD balance
- `tron_send_payment` — Send USDT or USDD to any address
- `tron_create_payment_request` — Create payment URL for collecting fees
- `tron_payment_status` — Check if payment was received

### On-chain Data
- `tron_analyze_address` — Full address analysis
- `tron_tx_history` — Transaction history
- `tron_whale_tracker` — Track large transfers
- `tron_token_info` — Token information

### DeFi (SunSwap + JustLend)
- `tron_defi_yields` — Current yield rates
- `tron_swap` — Swap tokens via SunSwap
- `tron_yield_optimize` — AI yield optimization strategy

### Automation
- `tron_auto_trade` — Price-triggered automated trading
- `tron_batch_transfer` — Send to multiple addresses at once

### Identity (8004 Protocol)
- `tron_register_agent_identity` — Register on-chain Agent identity
- `tron_agent_reputation` — Query Agent trust score

## Example Usage

In your OpenClaw chat:
```
"查询地址 TXYZop... 的USDT余额"
→ Agent calls tron_check_balance → returns 500.00 USDT

"当前TRON DeFi最高收益是多少？"
→ Agent calls tron_defi_yields → shows all pools sorted by APY

"帮我把1000 USDT做收益优化"
→ Agent calls tron_yield_optimize → suggests best strategy
```

## Architecture

```
OpenClaw Agent
    │ (tool call)
    ▼
TronClaw Plugin (this package)
    │ (HTTP request)
    ▼
TronClaw Gateway (REST API)
    │
    ▼
TRON Network + Bank of AI Infrastructure
```
