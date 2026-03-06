# Plan: Pigeon — Competitor #5 Evaluation

**Status:** Complete — 2026-03-06
**Final score: 25/40**

---

## Goal
Implement manual testing scaffold for Pigeon (pigeon.trade) and record competitive evaluation scores across all 8 dimensions.

## Constraints
- No public API, SDK, or REST endpoint — bot-only product (Telegram primary)
- pigeon-mcp repo is private as of 2026-03-03
- Mainnet-only — real ETH required for transfer/swap tests
- Manual-only adapter pattern (mirrors MetaMask stub)
- No new ExpectKey values needed

## Steps
- [x] Create `test-harness/src/adapters/pigeon/pigeon-adapter.ts` — manual stub
- [x] Create `test-harness/src/adapters/pigeon/pigeon-tests.ts` — 13 test cases p01–p13 + latency sentinel p14
- [x] Create `test-harness/results/pigeon/research-notes.md` — scoring template with pre-filled Dims 5 & 8
- [x] Modify `test-harness/src/cli.ts` — add `pigeon` case (checklist mode) + update error message
- [x] Create `plans/active/pigeon.md`
- [x] Update `plans/ACTIVE.md` — add Pigeon row
- [x] Build passes: `cd test-harness && npm run build`
- [x] Checklist prints: `npm run test pigeon`
- [x] p01–p08 manual testing via Telegram @PigeonTradeBot (2026-03-04, unfunded wallet)
- [x] p09–p13 manual testing via Telegram (2026-03-06, 0.001 ETH on Base)
- [x] All 8 dims finalized — final score 25/40
- [x] Moved to `plans/completed/pigeon.md`

## Decision Log
| Date | Decision | Rationale |
|---|---|---|
| 2026-03-03 | Manual-only stub (no automation) | No public API; pigeon-mcp private; Privy wallet not automatable from test harness |
| 2026-03-03 | Dims 5 & 8 pre-filled from research | Architecture (Privy+Zerion+closed source) and business model (free beta, no funding) fully assessable without UI testing |
| 2026-03-03 | Test on Telegram (not Discord/Farcaster) | Telegram is most documented and fastest channel per Pigeon docs |
| 2026-03-06 | Dim 4 confirmed 1/5 (not 2/5) | p12 sent to burn address with no warning; p11 "tried to execute"; auto-gas-swap to facilitate burn transfer |

## Final Dimension Scores

| Dim | Label | Score |
|-----|-------|-------|
| 1 | Onboarding & Setup | 4/5 |
| 2 | NLU & Intent Parsing | 4/5 |
| 3 | Supported Actions | 5/5 |
| 4 | Security | 1/5 |
| 5 | Architecture | 2/5 |
| 6 | UX / Latency | 2/5 |
| 7 | Multi-Chain | 5/5 |
| 8 | Business Model | 2/5 |
| **Total** | | **25/40** |

## Progress Checkpoints
- [x] Scaffold implemented — `npm run test pigeon` prints checklist, exits 0
- [x] All 13 tests complete — p01–p08 (2026-03-04), p09–p13 (2026-03-06)
- [x] Final score confirmed: 25/40
- [x] Plan moved to `plans/completed/pigeon.md`
