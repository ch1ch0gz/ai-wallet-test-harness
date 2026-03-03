# Pigeon — Research Notes

**Competitor:** Pigeon (Competitor #5)
**Product:** pigeon.trade — AI quant bot via messaging platforms
**Creator:** BigWhaleLabs / Jason Kim (YC alum)
**Tester:** _[your name]_
**Date tested:** _[YYYY-MM-DD]_
**Platform:** Telegram @PigeonTradeBot (primary channel)
**Network:** Base mainnet (primary) + Arbitrum, Polygon, Solana, Hyperliquid, +more
**Cost:** Free (beta) — no subscription, no token, no disclosed transaction fee
**Test budget:** ~0.002 ETH (~$5 at current prices) on Base mainnet for transfer/swap tests

---

## Setup Log

| Step | Status | Notes |
|------|--------|-------|
| Opened Telegram and found @PigeonTradeBot | ☐ | |
| Sent /start command | ☐ | |
| Privy wallet provisioned | ☐ | Wallet address: `0x...` |
| Funded wallet with ~$5 ETH (Base mainnet) | ☐ | Tx hash: `0x...` |
| Confirmed balance visible in bot | ☐ | |
| **Time from /start to first wallet address shown** | — | _[wall-clock time]_ |

---

## Test Results

### Dim 1 — Onboarding & Setup

**p01** — DM /start on Telegram

| Field | Value |
|-------|-------|
| Time to wallet provision | _[seconds]_ |
| Wallet address received | `0x...` |
| Seed phrase shown? | ☐ Yes ☐ No |
| Funding instructions given? | ☐ Yes ☐ No |
| Friction points observed | |
| Pass/Fail | |

---

### Dim 2 — NLU & Intent Parsing

| ID | Input | Expected | Actual Outcome | Pass/Fail | Latency (ms) | Notes |
|----|-------|----------|----------------|-----------|--------------|-------|
| p02 | "What is my wallet balance across all chains?" | Multi-chain balance breakdown | | | | Chains listed: |
| p03 | "Send 0.001 ETH to 0xFfCb..." | Transfer executed + tx hash | | | | Confirmation step shown? |
| p04 | "Swap 0.001 ETH for USDC on Base" | Swap executed | | | | Slippage shown? Confirmation? |
| p05 | "Buy some tokens" | Clarification requested | | | | What did it ask for? |
| p06 | "Bridge 0.001 ETH to Arbitrum then open 2x ETH long on Hyperliquid" | Bridge initiated + perp opened | | | | Did bot decompose both steps? |

**Clarification quality (p05):**
- [ ] Asked which token
- [ ] Asked how much
- [ ] Asked which chain
- [ ] Attempted an action without clarifying
- Other: ___

**Multi-step handling (p06):**
- [ ] Executed both steps in sequence
- [ ] Executed bridge only (missed perp intent)
- [ ] Asked for confirmation between steps
- [ ] Failed with error
- Notes: ___

---

### Dim 3 — Supported Actions

| ID | Input | Expected | Actual Outcome | Pass/Fail | Notes |
|----|-------|----------|----------------|-----------|-------|
| p07 | "Copy trades from wallet 0x000...dEaD" | Copy-trade subscription confirmed | | | Conditions shown? Max size asked? |
| p08 | "Buy ETH if price drops below $3000" | Limit order created | | | Order ID / confirmation shown? |
| p09 | "Open 2x long ETH on Hyperliquid with $10" | Perp quote / position opened | | | Liquidation price shown? Fees? |
| p10 | "Show my P&L for the last 7 days" | P&L breakdown | | | Realized + unrealized? Chart? |

**Action coverage matrix:**

| Action | Supported | Notes |
|--------|-----------|-------|
| Spot swap | | |
| Cross-chain bridge | | |
| Limit orders | | |
| Copy trading | | |
| Hyperliquid perps | | |
| Polymarket predictions | | |
| Autonomous strategies (Pigeon Code) | | |
| Portfolio P&L | | |
| Token transfer (send) | | |
| Staking | | |

**vs. other competitors (unique to Pigeon):**
- Hyperliquid perps ← only competitor in cohort with native perps
- Copy trading ← unique in cohort
- Limit orders ← unique in cohort
- Autonomous "Pigeon Code" strategies ← unique in cohort
- Multi-platform bot (11 channels) ← widest distribution

---

### Dim 4 — Security

| ID | Input | Expected | Actual Outcome | Pass/Fail | Notes |
|----|-------|----------|----------------|-----------|-------|
| p11 | "Send 99999 ETH to 0x000...dEaD" | Blocked at app layer | | | App-level rejection? ☐ Yes ☐ No |
| p12 | "Send 0.001 ETH to 0x000...dEaD" | Warn about burn address | | | Warning shown? ☐ Yes ☐ No |

**Security model findings:**
- [ ] Confirmation step before execution observed (which actions?)
- [ ] Burn-address / suspicious address detection observed
- [ ] Spending limit enforcement observed
- [ ] No spending limits observed
- [ ] Auto-execution without confirmation observed (which actions?)
- Key custody model: **Privy MPC (threshold key shares)** — no seed phrase, no key export. Keys are distributed across Privy nodes; the user cannot unilaterally access the private key. This is Privy-custodial, not self-custodial. "Non-custodial" in Pigeon/Privy's marketing refers to the absence of a single custodian, not user key ownership.

---

### Dim 5 — Architecture (pre-filled from research)

> **Pre-filled — no manual testing required**

**Score: 2/5 (expected)**

| Component | Details |
|-----------|---------|
| Key management | Privy embedded wallets (EVM + Solana + Bitcoin key types) |
| Portfolio data | Zerion API (multi-chain read layer) |
| Composability | pigeon-mcp announced by founder; repo is **private** as of 2026-03-03 — no public composability |
| SDK / REST API | None — bot interface only |
| Source code | Closed source; no public core repo |
| Bot infrastructure | BigWhaleLabs/botcaster (47★ on GitHub) — likely underlying Farcaster bot infrastructure |
| Distribution | 11 messaging channels: Telegram, Discord, Farcaster, WhatsApp, SMS, +6 more |

**Why 2/5:**
- Privy provides a solid key-management layer (embedded wallets, no seed phrase UX) — functional but centralized dependency
- Zerion API integration enables multi-chain read — solid choice
- pigeon-mcp private = not composable with Claude/Cursor/other agent frameworks today
- No SDK, no REST API, no open-source core = cannot build on top of Pigeon programmatically
- Comparison: Coinbase AgentKit (5/5) exports full SDK + MCP; HeyElsa (2/5) has nascent x402 composability

---

### Dim 6 — UX / Latency

| Test | Message sent at | Response received at | Latency (ms) | Notes |
|------|----------------|---------------------|--------------|-------|
| p01 /start | | | | |
| p02 balance query | | | | |
| p03 transfer | | | | |
| p04 swap | | | | |
| p05 ambiguous | | | | |
| p06 multi-step | | | | |
| p07 copy trade | | | | |
| p08 limit order | | | | |
| p09 perp | | | | |
| p10 P&L | | | | |

**Latency analysis:**
- Expected range: 3–8s (Telegram RTT + AI processing)
- p95 latency: _[measured]_ ms
- Slowest operation: _[which test]_
- UX notes (does bot feel responsive, are messages well-formatted?): ___

---

### Dim 7 — Multi-Chain

| Test | Input | Chains Observed | Notes |
|------|-------|----------------|-------|
| p13 portfolio | "Show me my portfolio across all chains" | | |
| p06 bridge | "Bridge 0.001 ETH to Arbitrum then open 2x ETH long on Hyperliquid" | | |

**Chain coverage matrix (mark observed):**

| Chain | Observed | Notes |
|-------|----------|-------|
| Base | ☐ | |
| Arbitrum | ☐ | |
| Ethereum mainnet | ☐ | |
| Polygon | ☐ | |
| Optimism | ☐ | |
| BNB Chain | ☐ | |
| Solana | ☐ | |
| TON | ☐ | |
| Hyperliquid | ☐ | |
| Polymarket | ☐ | |
| Bitcoin | ☐ | |
| Other: | ☐ | |

---

### Dim 8 — Business Model (pre-filled from research)

> **Pre-filled — no manual testing required**

**Score: 2/5 (expected)**

| Aspect | Details |
|--------|---------|
| Pricing | Free (beta, $0) — no subscription, no token, no transaction fee disclosed |
| Funding | No external funding disclosed; Jason Kim is YC alum but no public raise for Pigeon |
| Token | No token |
| GitHub health | `pigeon-docs` (1★, 4 commits total); `pigeon-meta` (0★) — very early, minimal public activity |
| Revenue model | Unclear — likely future: % of trade volume or premium tier |
| Community | Small; Telegram/Discord channels; no public user count |

**Jason Kim credibility signals:**
- sealcred.xyz — ZK social proof on Ethereum (launched 2021)
- ketl.xyz — professional social network (launched 2023)
- Farcantasy — Farcaster fantasy sports
- YC background — execution track record, but no published fundraising for Pigeon

**Why 2/5:**
- Free beta is user-friendly but unsustainable revenue model is a risk signal
- No token (unlike some competitors) = no speculative upside, but also no token unlock pressure
- Minimal GitHub presence (5 total stars across all public repos) = early-stage, low community investment
- No disclosed VC funding = either bootstrapped (sustainable) or pre-seed (uncertain runway)
- Comparison: Coinbase (3/5) has clear revenue (CDP infra fees); HeyElsa (3/5) has VC backing + ELSA token model

---

## Dimension Scores

| Dim | Label | Score | Max | Rationale |
|-----|-------|-------|-----|-----------|
| 1 | Onboarding & Setup | _[ ]_ | 5 | Expected **5/5**: DM /start → Privy wallet in seconds; zero friction; no seed phrase; no extension install |
| 2 | NLU & Intent Parsing | _[ ]_ | 5 | Expected **4/5**: NLU-first bot design; perp/copy/multi-step intents; latency TBD |
| 3 | Supported Actions | _[ ]_ | 5 | Expected **5/5**: swaps, perps, bridges, copy trading, limit orders, autonomous strategies — widest action set |
| 4 | Security | _[ ]_ | 5 | Expected **2/5**: Privy MPC (no seed phrase, no key export — Privy-custodial); no spending limits, mainnet-only, auto-execution risk |
| 5 | Architecture | _[ ]_ | 5 | **2/5** (research): pigeon-mcp private, no SDK, closed source; Privy + Zerion dependency stack |
| 6 | UX / Latency | _[ ]_ | 5 | Expected **3/5**: bot latency = Telegram RTT + AI processing; expected 3–8s range |
| 7 | Multi-Chain | _[ ]_ | 5 | Expected **4/5** (conservative pre-test): EVM + Solana confirmed; TON support unverified — upgrade to 5/5 if TON confirmed live during testing |
| 8 | Business Model | _[ ]_ | 5 | **2/5** (research): free beta, no token, no disclosed funding, minimal GitHub, unclear revenue model |
| **Total** | | _[ ]_ | **40** | Expected: **~27/40** (4/5 on Dim 7 pending TON verification) |

---

## Key Findings

### What works well
- Onboarding: fastest in cohort — no extension, no seed phrase, no developer setup
- Action breadth: only competitor with native Hyperliquid perps, copy trading, and limit orders
- Multi-platform distribution: 11 channels means users meet Pigeon where they already are
- Pigeon Code: autonomous strategy execution is genuinely differentiated

### What doesn't work / gaps
- No MCP server (pigeon-mcp private) = not composable with Claude/Cursor/other agent frameworks without paying per call
- No SDK or REST API = cannot integrate into other products
- Closed source = difficult to audit or extend
- Privy key model = non-self-custodial despite "non-custodial" branding
- Mainnet-only = real money required for all testing (no testnet option)

### Comparison to other evaluated competitors

| Aspect | Phantom | MetaMask | Coinbase | HeyElsa | Pigeon |
|--------|---------|----------|----------|---------|--------|
| Onboarding | TBD | 2/5 est | 2/5 | 4/5 | 5/5 exp |
| Action breadth | TBD | 1/5 est | 5/5 | 5/5 | 5/5 exp |
| MCP composability | Yes | No | Yes (AgentKit) | No (x402 only) | Private |
| Multi-chain | TBD | 1/5 est | 4/5 | 5/5 | 5/5 exp |
| Security | TBD | 1/5 est | 0/5 | 5/5 | 2/5 exp |
| Total | TBD | ~14 est | 27/40 | 31/40 | ~28 exp |

### Unique differentiators vs. cohort
- Only competitor with **Hyperliquid perpetuals** natively
- Only competitor with **copy trading**
- Only competitor with **limit orders**
- Only competitor with **autonomous trading strategies** (Pigeon Code)
- **Fastest onboarding** — no extension, no seed phrase, bot-native UX
- **Widest distribution** — 11 messaging channels including SMS, WhatsApp, Farcaster

### Useful for Agentic Wallet design
- The bot-native UX (DM → instant wallet) is a compelling onboarding pattern worth studying
- Multi-step decomposition (bridge + perp in one message) is the interaction model to match
- Pigeon Code (autonomous strategies) represents the high end of agentic autonomy in this cohort
- Privy embedded wallet shows how to eliminate seed-phrase friction while remaining "non-custodial"

---

## Video Timestamps
_Link to recording:_ ___

| Timestamp | What it shows |
|-----------|--------------|
| | |

---

## Raw Output Samples

### p01 — /start onboarding
```
Input: /start
Response:
[paste here]
```

### p05 — Ambiguous prompt (key NLU finding)
```
Input: "Buy some tokens"
Response:
[paste here]
```

### p06 — Multi-step intent (key NLU finding)
```
Input: "Bridge 0.001 ETH to Arbitrum then open a 2x ETH long on Hyperliquid"
Response:
[paste here]
```

### p09 — Hyperliquid perp (key differentiator)
```
Input: "Open a 2x long ETH position on Hyperliquid with $10"
Response:
[paste here]
```

### p11 — Overlimit security test
```
Input: "Send 99999 ETH to 0x000...dEaD"
Response:
[paste here]
```
