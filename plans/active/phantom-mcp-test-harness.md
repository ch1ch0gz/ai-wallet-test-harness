# Plan: Phantom MCP Test Harness (Competitor #1)

**Status:** Implemented — `test-harness/` is built and type-checks clean.
**Implemented:** 2026-02-26

## Context

The Agentic Wallet project needs hands-on evaluation of 7 AI wallet competitors across 8 dimensions. The Evaluation Framework defines the rubric; this plan builds the test infrastructure starting with Phantom MCP — the only competitor that is itself an MCP server, making it the most directly automatable. The harness is designed to be reused for all 7 competitors as adapters are added.

---

## What Gets Built

A TypeScript test harness at `test-harness/` inside the project root that:
- Connects to the Phantom MCP server via stdio
- Runs standardized test cases against all 8 evaluation dimensions
- Shows live output (progress + scores) in the terminal as tests run
- Saves results to `test-harness/results/phantom/` in JSON + Markdown

---

## Prerequisites (User Must Do First — Cannot Be Automated)

**Network: Solana Devnet** (free, no financial risk)

### Step 1 — Create a Phantom App ID (portal.phantom.app)
1. Go to [portal.phantom.app](https://portal.phantom.app) and sign in
2. Click **"New App"** → choose **Embedded Wallet**
3. Name it (e.g., "Agentic Wallet Testing")
4. Copy the **App ID** shown on the app dashboard

### Step 2 — Install the MCP server and do the one-time OAuth flow
```bash
npm install -g @phantom/mcp-server
PHANTOM_APP_ID=your_app_id phantom-mcp
# Opens browser → Google/Apple login → approve agent permissions
# Session saved to ~/.phantom-mcp/session.json
```
During the OAuth flow, set spending limits conservatively (e.g., 0.1 SOL per tx) — these can be changed later.

### Step 3 — Fund the devnet test wallet
After OAuth, the wallet address is shown. Fund it:
```bash
solana airdrop 2 <your_wallet_address> --url devnet
```
(Repeat if needed — devnet faucet allows ~2 SOL per request)

### Step 4 — Add to `.env` in `test-harness/`
```
PHANTOM_APP_ID=your_app_id
ANTHROPIC_API_KEY=your_key       # Already set
SOLANA_RPC_URL=https://api.devnet.solana.com
TEST_NETWORK=devnet
TEST_RECIPIENT_ADDRESS=          # A second devnet address to send test transfers to
```
Copy from `test-harness/.env.example`.

---

## Dimension Coverage

| Dimension | Approach | Method |
|---|---|---|
| 1. Onboarding & Setup | MANUAL — timed by user | Notes captured post-setup |
| 2. NLU & Intent Parsing | AUTOMATED | Claude API + Phantom MCP tools wired together |
| 3. Supported Actions | AUTOMATED | Direct MCP tool calls; RPC verification |
| 4. Security Model | AUTOMATED | Attempt limit-exceeding amounts, unwhitelisted addresses |
| 5. Architecture & Integration | RESEARCH | Tool registry inspection; docs review |
| 6. UX — latency only | AUTOMATED | Timestamp every MCP call; build latency histogram |
| 7. Multi-Chain | AUTOMATED | Call tools per chain (Solana, Ethereum, Bitcoin, Sui) |
| 8. Business Model | RESEARCH | Separate research pass; not in harness |

---

## File Structure (as implemented)

```
test-harness/
├── src/
│   ├── adapters/
│   │   ├── base-adapter.ts         # Interface all 7 competitors implement
│   │   └── phantom/
│   │       ├── phantom-adapter.ts  # MCP client wrapper for Phantom's 5 tools
│   │       └── phantom-tests.ts    # Phantom-specific test cases
│   ├── core/
│   │   ├── mcp-client.ts          # stdio MCP client (@modelcontextprotocol/sdk)
│   │   ├── test-runner.ts         # Orchestrates test cases, captures results
│   │   ├── nlu-runner.ts          # Claude API wrapper for Dimension 2 tests
│   │   ├── chain-verifier.ts      # RPC verification (@solana/web3.js, ethers)
│   │   └── reporter.ts            # Live terminal output + file export
│   ├── types/
│   │   ├── adapter.ts
│   │   ├── test-case.ts
│   │   └── result.ts
│   └── cli.ts                     # Entry point: `npm run test phantom`
├── test-cases/
│   └── standard-suite.json        # Reference; runtime uses phantom-tests.ts
├── results/
│   └── phantom/                   # Per-run output goes here
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Phantom MCP Tools (5 available)

| Tool | Used To Test |
|---|---|
| `get_wallet_addresses` | Dim 3: address retrieval; Dim 7: multi-chain |
| `transfer_tokens` | Dim 3: token transfer; Dim 4: spending limits |
| `buy_token` | Dim 3: swap; Dim 2: complex intent decomposition |
| `sign_transaction` | Dim 3: raw tx signing; Dim 4: guardrails |
| `sign_message` | Dim 2: simple command; Dim 4: arbitrary signing |

---

## Standard Test Cases (Phantom)

| ID | Dim | Type | Input / Tool | Expected |
|----|-----|------|-------------|----------|
| p01 | 2 | NLU | "What is my SOL balance?" | balance_returned |
| p02 | 2 | NLU | "Send 0.001 SOL to \<addr\>" | transfer_executed |
| p03 | 2 | NLU | "Swap half my SOL for USDC" | swap_executed |
| p04 | 2 | NLU | "Buy some tokens" | clarification_requested |
| p05 | 3 | tool | get_wallet_addresses {} | addresses_returned |
| p06 | 3 | tool | transfer_tokens {amount:0.001} | tx_hash |
| p07 | 4 | tool | transfer_tokens {amount:99999} | blocked_limit |
| p08 | 4 | tool | transfer_tokens {to:unwhitelisted} | blocked_whitelist_or_confirmed |
| p09 | 7 | tool | get_wallet_addresses {network:ethereum} | eth_address |
| p10 | 6 | meta | latency aggregation | measure_latency_all_calls |

---

## Run Commands

```bash
cd test-harness
npm install
npm run test phantom            # Run Phantom tests (devnet)
npm run test phantom -- --network mainnet  # Override to mainnet
```

---

## Live Terminal Output

```
▶ Testing Phantom MCP — devnet — 2026-02-26

  Dim 2: NLU & Intent
    ✓ p01  Balance query                    87ms
    ✓ p02  Simple transfer                  342ms
    ✓ p03  Swap intent                     1204ms
    ✗ p04  Ambiguous prompt                 clarification NOT requested

  Dim 3: Supported Actions
    ✓ p05  get_wallet_addresses             44ms
    ✓ p06  transfer_tokens (0.001 SOL)     891ms [tx: 3xK7…]

  Dim 4: Security
    ✓ p07  Spending limit (99999 SOL)       spending limit enforced ✓
    ? p08  Unwhitelisted address            confirmed (not blocked)

  Dim 6: UX / Latency
    min 44ms  avg 512ms  p50 342ms  p95 1204ms  max 1204ms  (8 samples)

  Dim 7: Multi-Chain
    ✓ p09  Ethereum address                returned

  ┌──────────────┬──┬──┬──┬──┬──┬──┬──┬──┬────────┐
  │ Competitor   │1 │2 │3 │4 │5 │6 │7 │8 │ Total  │
  ├──────────────┼──┼──┼──┼──┼──┼──┼──┼──┼────────┤
  │ Phantom MCP  │- │3 │5 │3 │- │4 │5 │- │ 20/25  │
  └──────────────┴──┴──┴──┴──┴──┴──┴──┴──┴────────┘

  Results saved → results/phantom/2026-02-26.json
```

---

## Verification Checklist

- [ ] `npm run test phantom` completes without crash
- [ ] Terminal shows live pass/fail per test case
- [ ] `results/phantom/<date>.json` exists with scores for dims 2, 3, 4, 6, 7
- [ ] At least one on-chain tx hash verifiable on [Solana devnet explorer](https://explorer.solana.com/?cluster=devnet)

---

## Scaling to All 7 Competitors

Once Phantom passes, each new competitor adds:
1. An adapter in `src/adapters/<name>/` implementing `base-adapter.ts`
2. Competitor-specific test cases (function returning `TestCase[]`)
3. A new `case` in `cli.ts` switch statement
4. Any new setup steps in `.env.example`

| Competitor | Adapter type |
|---|---|
| Coinbase AgentKit | MCP (same pattern as Phantom) |
| AskGina.ai | MCP (same pattern as Phantom) |
| HeyElsa | Playwright (web app) |
| MetaMask SDK | Playwright (web app) |
| Pigeon | Semi-manual (bot prompt + manual scoring) |
| Bankr.bot | Semi-manual (bot prompt + manual scoring) |

---

## Research Dimensions (post-harness)

After the harness run, fill these in manually to `results/phantom/research-notes.md`:

- **Dim 1 (Onboarding):** Time the OAuth + funding flow from zero
- **Dim 5 (Architecture):** Inspect `listTools()` output; review Phantom MCP docs
- **Dim 8 (Business Model):** Check fee structure, Phantom's token economics, developer pricing
