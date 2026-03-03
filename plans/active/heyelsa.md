# Plan: HeyElsa — Competitor #4 Evaluation

## Goal
Evaluate HeyElsa's AI DeFi copilot across all 8 dimensions and produce a scored research-notes.md.

## Constraints
- HeyElsa is a closed-source web product; no headless automation of the chat UI
- Mainnet only — no testnet available; x402 API requires real USDC on Base
- Budget: $5 USDC max ($0.20/run → ~25 runs)

## Steps
- [x] Research product (interface, chains, architecture, business model)
- [x] Build full x402 REST automated adapter (`src/adapters/heyelsa/heyelsa-adapter.ts`)
- [x] 14 test cases h01–h14 (Dims 3, 4, 6, 7 automated; 1, 2, 5, 8 manual)
- [x] Install deps: axios, viem, x402-axios
- [x] Set HEYELSA_PRIVATE_KEY + HEYELSA_WALLET_ADDRESS in .env
- [x] Fund wallet with $2 USDC on Base mainnet
- [x] Run `npm run test heyelsa` — 13/13 pass
- [x] Debug evaluators for HeyElsa-specific response shapes (quote array, pipeline_id)
- [x] Score Dim 5 and 8 from public research (litepaper, GitHub, social, tokenomics)
- [x] Score Dim 1 and 2 from manual web UI testing
- [x] Finalize research-notes.md — 31/40

## Decision Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-02 | Manual-only stub initially | Closed web UI; x402 API costs real USDC per call |
| 2026-03-02 | Pivoted to automated x402 adapter | User offered real USDC ($2); full automation possible for Dims 3/4/6/7 |
| 2026-03-03 | USDC→ETH swap direction (not ETH→USDC) | Test wallet holds USDC; server validates balance before returning quote |
| 2026-03-03 | Added `dry_run_executed` + `data_returned` ExpectKeys | HeyElsa uses async pipeline (pipeline_id) and different response field names |
| 2026-03-03 | Dim 4 score = 5/5 (automated) | Server-side balance validation + risk analysis both pass; stronger than AgentKit |
| 2026-03-03 | Dim 5 score = 2/5 | Closed source, no MCP, x402-only composability (mainnet paid), nascent OpenClaw |
| 2026-03-03 | Dim 6 score = 3/5 | p95=6.3s exceeds 5s threshold; x402 payment signing overhead unavoidable |

## Progress Checkpoints
- [x] Adapter scaffold + test definitions committed
- [x] All 13 automated test cases run and recorded (13/13 pass)
- [x] Dims 5 and 8 researched from public sources
- [x] Dims 1 and 2 scored from manual web UI testing
- [x] Scores for all 8 dims finalized — 31/40
- [ ] Move to plans/completed/heyelsa.md
