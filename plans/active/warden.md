# Plan: Warden Protocol — Competitor #8 Evaluation

## Goal
Build test harness scaffold and scoring template for Warden Protocol, then complete manual testing at app.wardenprotocol.org.

## Constraints
- Manual testing only — no confirmed public REST API for end-user wallet operations
- Some features (Trading Terminal, Agent Hub subscriptions) may require WARD token
- w09 (tokenized stocks) may require KYC — attempt last
- Use consistent test addresses (0xFfCb... known, 0x000...dEaD burn) for cross-competitor comparison

## Steps

### Implementation (scaffold)
- [x] Create `test-harness/src/adapters/warden/warden-adapter.ts` — manual stub
- [x] Create `test-harness/src/adapters/warden/warden-tests.ts` — w01–w14 + w15 latency sentinel
- [x] Create `test-harness/results/warden/research-notes.md` — scoring template, Dims 5+8 pre-filled
- [x] Modify `test-harness/src/cli.ts` — add `warden` case + update error message
- [x] Create `plans/active/warden.md` — this file
- [x] Modify `plans/ACTIVE.md` — add Warden row

### Manual testing
- [x] w01 — Onboarding: 1-step MetaMask connect, instant wallet, key export available
- [x] w02 — Balance query: returned Base only; stale data issue; chain prompt friction
- [x] w03 — ETH transfer: confirmation gate confirmed; no SPEx UI (background only)
- [x] w04 — Swap: full quote + "Do you want to proceed?" — tx hash confirmed
- [x] w05 — Ambiguous prompt: 3-question genuine clarification (best in cohort)
- [x] w06 — Agent Hub: NL query worked; 5 agents listed incl. Intelligent DCA (DCA confirmed)
- [x] w07 — DeFi yield: Aave 12% returned (APY figure suspect — likely hallucinated)
- [x] w08 — Trading Terminal: Hyperliquid UI present but chat agent disconnected — FAIL
- [x] w09 — Tokenized stocks: feature does not exist in live app — FAIL (directed to Robinhood)
- [x] w10 — Portfolio P&L: historical price fetch failed — FAIL
- [x] w11 — Overlimit transfer: balance check blocked correctly
- [x] w12 — Burn address: confirmation gate shown; no burn address warning
- [x] w13 — Multi-chain portfolio: only Base shown — FAIL
- [x] w14 — Cross-chain swap: "BNB not available from Base" — FAIL

### Scoring
- [x] Fill all dim scores in research-notes.md
- [x] Record manifesto citation for Dim 2 rationale (M5)
- [x] Finalize total score — **24/40**
- [ ] Update MEMORY.md with Warden findings

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-06 | Manual-only adapter | No confirmed public REST API for end-user wallet operations |
| 2026-03-06 | Dim 5 = 3/5 pre-filled | Open-source L1 + Studio strong, but Studio is "build on Warden" not "wire Warden into your agent" — no MCP, no external SDK |
| 2026-03-06 | Dim 8 = 4/5 pre-filled | $4M VC, WARD token, 20M reported users, agent marketplace ~$1M; docked 1 for WARD < 2 months old |
| 2026-03-06 | Expected total ~28/40 | Comparable to Bankr; strongest on Dim 7 (6 chains) + Dim 8 (ecosystem scale) |

## Progress Checkpoints
- [x] Scaffold complete — `npm run test warden` prints 14-test checklist, exits 0
- [x] Build passes — `npm run build` exits 0
- [x] w01–w14 complete (all 14 tests done 2026-03-09)
- [x] All dim scores final in research-notes.md — **24/40**
- [ ] MEMORY.md updated with Warden final score
