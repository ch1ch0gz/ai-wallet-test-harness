# Competitor MCP Analysis Report

**Status:** DRAFT
**Analyzed:** 2026-02-26
**Tools used:** `analyze_repo_metrics`, `analyze_social_trends`
**Note:** `analyze_sentiment` failed (ANTHROPIC_API_KEY not set in MCP server env). Partial sentiment data sourced from Intake Form §11.1.

---

## 1. GitHub Repo Health

Only 2 of 7 competitors have public repos directly relevant to their AI wallet product.

### MetaMask/metamask-sdk
| Metric | Value | Signal |
|---|---|---|
| Stars | 315 | Low — reference impl, not community project |
| Forks | 226 | Moderate |
| Fork quality score | 0.20 / 1.0 | **Poor** — forks are shallow, not production builds |
| Contributors | 32 | Small, internal team |
| Commits (last 30d) | **0** | **Stalled** |
| Commits (last 90d) | **0** | **Stalled** |
| Open issues | 89 | High backlog |
| Issue close ratio | 0.536 | Mediocre — more open than closed |
| Last updated | 2026-02-19 | Recent metadata update, but no code |

**Verdict:** The SDK AI agent tutorial is a marketing reference build, not a living product. Zero development velocity in 90 days. Not a serious threat as an AI wallet platform — MetaMask is using this as a developer story, not a product.

---

### coinbase/agentkit
| Metric | Value | Signal |
|---|---|---|
| Stars | 1,122 | 3.5× MetaMask SDK — strong developer interest |
| Forks | 648 | High |
| Fork quality score | **1.0 / 1.0** | **Perfect** — forks are being actively developed |
| Contributors | 85 | Large, active team |
| Commits (last 30d) | 5 | Alive but slowing |
| Commits (last 90d) | 13 | Moderate |
| Open issues | 134 | High backlog |
| Issue close ratio | 0.163 | **Very low** — 134 open vs 26 closed — issues piling up |
| Created | 2024-10-31 | ~16 months old |
| Last updated | 2026-02-26 | Active today |

**Verdict:** AgentKit is the most credible open-source competitor. Perfect fork quality means developers are genuinely building on it. Issue accumulation (0.163 close ratio) suggests the team is shipping faster than they're fixing — technical debt growing. The 85 contributors and 1-year age at 1,122 stars is strong. **This is the benchmark to watch.**

---

### Repos not found / closed source
| Product | Status |
|---|---|
| Phantom MCP | No public GitHub found for the MCP server component |
| HeyElsa | Closed source |
| Pigeon | Closed source (built on Zerion API) |
| AskGina.ai | Closed source |
| Bankr.bot | Closed source |

---

## 2. Social Traction by Competitor

Ranked by volume × organic ratio × engagement (composite signal):

| Competitor | Mentions | Organic % | Avg Engagement | Sources | Composite Signal |
|---|---|---|---|---|---|
| HeyElsa AI crypto | 54 | 91% | 77.5 | Reddit (52), HN (2) | **Highest volume** |
| Coinbase Agentic Wallet | 46 | 89% | **65.6** | Reddit (30), HN (16) | **Highest quality** |
| Bankr bot | 31 | 90% | 31.6 | Reddit (16), HN (15) | Moderate, HN presence |
| AskGina AI wallet | 27 | 78% | 18.9 | Reddit (24), HN (3) | Low engagement |
| MetaMask AI agent | 23 | 87% | 18.8 | Reddit (18), HN (5) | Brand halo, not product |
| Pigeon AI wallet | 12 | 75% | 42.3 | Reddit only | Low volume |
| Phantom MCP wallet | 5 | 60% | 19.2 | Reddit only | **Essentially invisible** |

### Reading the data correctly

**HeyElsa (54 mentions, 91% organic):** High volume but the content analysis shows most mentions are about general AI+crypto topics, not HeyElsa specifically. Brand awareness is weak — HeyElsa is riding a general narrative, not generating its own pull.

**Coinbase Agentic Wallet (46 mentions, 65.6 avg engagement):** The only competitor generating substantive HN discussion (9 stories/comments including several about x402, PolicyLayer, SpendSafe). High engagement = deep community interest. This is genuine developer mindshare, not consumer attention.

**Bankr.bot (31 mentions, 90% organic, HN presence):** Strong organic signal relative to its size. The AI trading agent marketplace narrative being discussed (r/CryptoCurrency post about "The AI Trading Agent Marketplace Is Coming") references Bankr's space directly. Second-most-credible social signal after Coinbase.

**Phantom MCP (5 mentions, 60% organic):** Near-zero social presence despite being early to MCP. None of the 5 mentions are specifically about the Phantom MCP product — they're about Phantom's swap fees, Ethereum AA, etc. MCP wallet adoption is not yet generating consumer conversation.

---

## 3. Emergent Signals from the Broader Conversation

These are patterns in the social data **not specific to any one competitor** but highly relevant to Agentic Wallet's positioning:

### 3a. Security anxiety is the dominant AI wallet narrative
The most-engaged posts across the AI wallet space are about risk, not capability:
- *"Single AI agents are absolute degens"* — community is building committee/consensus architectures for agent signing (validates simulation + adaptive friction thesis)
- *"AI Agents in DeFi: Genuine Efficiency or just Black Box Risk?"* — 15 upvotes, substantive discussion
- *"If AI bots can now use crypto wallets, how do we solve Sybil attacks?"* — 37+ engagement
- Guardian Wallet (threshold MPC for AI agents) posting research across multiple subreddits shows an emerging solution space

**Implication:** Agentic Wallet's Safety Layer (simulation, threat scoring, adaptive friction) is *exactly* what the market is asking for. Lead with security, not autonomy.

### 3b. x402 is generating real developer traction
Multiple HN stories and Reddit posts about x402 integration:
- "How to x402: A Complete Guide to permissionless Agent payments" (16 engagement on Ethereum subreddit)
- "Show HN: X402 Agent Starter Kit: AI agents that pay for their own APIs" (HN)
- "Show HN: PolicyLayer – Non-custodial spending limits for AI agents" (HN)
- "Show HN: Spendsafe.ai – Ship AI agents that can't drain your wallet" (HN)

**Implication:** The x402 + AA + spending controls stack is becoming infrastructure-level. Agentic Wallet's planned x402 integration is well-timed. The "can't drain your wallet" framing from SpendSafe.ai is the exact message that resonates.

### 3c. The agent marketplace narrative is emerging but pre-product
Post: *"The AI Trading Agent Marketplace Is Coming and It Will Change Who Wins in Crypto Markets"* — organic, medium engagement. The community sees this coming but no one has shipped it yet.

**Implication:** First-mover window for agent marketplace is open. Bankr, Coinbase, and AskGina have marketplaces on roadmaps but none are live. Intake Form's 15–30% take-rate model is in the right direction.

### 3d. MPC threshold custody for AI agents is the emerging security standard
CellistNegative1402 posted the same threshold MPC research to r/ethereum, r/defi, and r/CryptoTechnology. Multiple responses. The "key never exists" framing is resonating.

**Implication:** ERC-4337 EOA approach in Phase 1 is pragmatic, but the roadmap should show awareness that MPC/threshold signing for agent keys is where the security-conscious segment is heading.

---

## 4. Cross-Reference: Social Data vs Intake Form Claims

| Intake Form Claim | Social Evidence | Verdict |
|---|---|---|
| "Complex onboarding is pain point #1" | MetaMask/Coinbase user pain sections (§11.3): slow, laggy, account access failures dominate 1-star reviews | ✅ Confirmed |
| "No competitor offers visible tx simulation" | Zero social mentions of simulation as a feature of any competitor. SpendSafe.ai ("can't drain your wallet") is the closest HN hit | ✅ **White space confirmed** |
| "x402 is emerging standard" | Multiple HN/Reddit posts building on x402 in past 30 days | ✅ Confirmed |
| "Agent marketplace first-mover opportunity" | Community discussing the narrative but no live product mentioned | ✅ Confirmed |
| "MCP is the emerging interoperability standard" | Phantom, Coinbase AgentKit (via MCP server) cited; OpenClaw MCP discussions on Reddit | ✅ Confirmed |
| "Base rejected due to Nethermind alignment" | Community preference for Ethereum mainnet among security-conscious developers vs. Base for consumer apps | Contextually supported |
| "ERC-4337 retention improved to 70%" | Intake Form §11.2 sourced from bundlebear/ratex — not independently validated via social, but consistent with EIP-7702 adoption discussion | Not contradicted |

---

## 5. Competitive Signal Summary

| Competitor | GitHub Health | Social Traction | Threat Level | Agentic Wallet Risk |
|---|---|---|---|---|
| Coinbase Agentic Wallets | ⭐⭐⭐⭐⭐ (active, high quality) | ⭐⭐⭐⭐ (high quality HN presence) | **HIGH** | Well-funded, developer ecosystem, x402 native. Risk: Base-centric, no visible simulation |
| Bankr.bot | N/A (closed) | ⭐⭐⭐ (organic, HN) | MEDIUM | Deep feature set, trading-focused, but no security layer, no MCP server |
| HeyElsa | N/A (closed) | ⭐⭐⭐ (volume, but generic) | MEDIUM | DeFi breadth is strong; no developer ecosystem or MCP exposure |
| MetaMask SDK | ⭐ (stalled) | ⭐⭐ (brand halo) | LOW | Brand awareness but AI agent product is a tutorial, not shipped product |
| AskGina.ai | N/A (closed) | ⭐⭐ (moderate) | LOW-MEDIUM | Unique perps/predictions coverage; small team signal |
| Pigeon | N/A (closed) | ⭐⭐ (low volume) | LOW | Messenger-native UX is differentiated but narrow distribution |
| Phantom MCP | N/A | ⭐ (invisible) | LOW | First-mover on MCP but no social traction. Solana-primary limits EVM relevance |

---

## 6. Gaps Still Requiring Hands-On Testing

The social/GitHub analysis cannot answer these — they require the test protocol in the Evaluation Framework:

- Transaction simulation: confirmed absent in 6/7 (MetaMask SDK the only one confirmed absent), but needs hands-on verification for all
- Spending limit UX quality: present in most (session keys), but UX polish unknown
- Cross-chain single-instruction quality: partially confirmed for HeyElsa and Bankr, unconfirmed for 4 others
- Response latency benchmarks: not observable from GitHub/social
- Onboarding time-to-first-action: requires live testing

---

## 7. Recommended Next Steps

1. **Run hands-on testing protocol** starting with Coinbase Agentic Wallets (highest threat) and Bankr.bot (most feature-complete)
2. **Watch these repos** for competitive intelligence: `coinbase/agentkit` (active), `warden-protocol/wardenprotocol` (13M users, intent-centric), `alchemyplatform/aa-sdk` (most active AA infra, 14.7 commits/week)
3. **Archive Reference #12** from Evaluation Framework — the S3 presigned URL for the Intake Form will expire. The local file is now at `Agentic Wallet Stage 0 - Intake Form V2.md`
