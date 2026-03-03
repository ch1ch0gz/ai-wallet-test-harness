# Plan: Pigeon — Competitor #5 Evaluation

## Goal
Implement manual testing scaffold for Pigeon (pigeon.trade) and record competitive evaluation scores across all 8 dimensions.

## Constraints
- No public API, SDK, or REST endpoint — bot-only product (Telegram primary)
- pigeon-mcp repo is private as of 2026-03-03
- Mainnet-only — real ETH required for transfer/swap tests (~$5 on Base)
- Manual-only adapter pattern (mirrors MetaMask stub)
- No new ExpectKey values needed

## Steps
- [x] Create `test-harness/src/adapters/pigeon/pigeon-adapter.ts` — manual stub
- [x] Create `test-harness/src/adapters/pigeon/pigeon-tests.ts` — 13 test cases p01–p13 + latency sentinel p14
- [x] Create `test-harness/results/pigeon/research-notes.md` — scoring template with pre-filled Dims 5 & 8
- [x] Modify `test-harness/src/cli.ts` — add `pigeon` case (checklist mode) + update error message
- [x] Create `plans/active/pigeon.md` — this file
- [x] Update `plans/ACTIVE.md` — add Pigeon row
- [ ] Build passes: `cd test-harness && npm run build`
- [ ] Checklist prints: `npm run test pigeon`
- [ ] User conducts manual testing via Telegram @PigeonTradeBot
- [ ] Fill in `results/pigeon/research-notes.md` with all 8 dimension scores
- [ ] Move to `plans/completed/pigeon.md` when scoring finalized

## Decision Log
| Date | Decision | Rationale |
|---|---|---|
| 2026-03-03 | Manual-only stub (no automation) | No public API; pigeon-mcp private; Privy wallet not automatable from test harness |
| 2026-03-03 | Dims 5 & 8 pre-filled from research | Architecture (Privy+Zerion+closed source) and business model (free beta, no funding) fully assessable without UI testing |
| 2026-03-03 | Test on Telegram (not Discord/Farcaster) | Telegram is most documented and fastest channel per Pigeon docs |
| 2026-03-03 | Expected score ~28/40 | Strongest on features/onboarding/multi-chain; weakest on composability and business maturity |

## Progress Checkpoints
- [x] Scaffold implemented — `npm run test pigeon` prints checklist, exits 0
- [ ] Manual testing complete — all 13 test cases recorded in research-notes.md
- [ ] Final scores confirmed — all 8 dims filled with rationale
- [ ] Plan moved to `plans/completed/pigeon.md`
