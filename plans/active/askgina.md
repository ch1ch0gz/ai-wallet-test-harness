# Plan: AskGina — Competitor #6 Evaluation

## Goal

Build the manual test scaffold for AskGina (askgina.ai) and run all 14 test cases
(a01–a13 + a14 latency sentinel) to produce a final score across 8 evaluation dimensions.

## Constraints

- No testnet available — Base mainnet only; gas sponsored for EVM txs < $5 USD
- No public API, SDK, or MCP server — web app testing only (askgina.ai)
- Manual-only adapter pattern (same as MetaMask, Pigeon)
- All existing ExpectKey values used — no new types needed

## Steps

- [x] Create `test-harness/src/adapters/askgina/askgina-adapter.ts` — manual stub
- [x] Create `test-harness/src/adapters/askgina/askgina-tests.ts` — a01–a13 + a14 latency sentinel
- [x] Create `test-harness/results/askgina/research-notes.md` — scoring template (Dims 5+8 pre-filled)
- [x] Modify `test-harness/src/cli.ts` — add `askgina` case + update error message
- [x] Create `plans/active/askgina.md` (this file)
- [x] Update `plans/ACTIVE.md` — add AskGina row
- [ ] Type-check: `npm run build` passes in test-harness/
- [ ] Smoke test: `npm run test askgina` prints checklist and exits 0
- [x] Manual testing: run a01–a13 at askgina.ai (2026-03-06 — partial; a04–a13 hit backend outage)
- [x] Score all 8 dims: 18/40 (outage-degraded; pre-outage estimate 27/40)
- [ ] Retest a04–a13 on a stable day and update scores
- [ ] Move to `plans/completed/askgina.md` once retesting + final scoring done

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-03-05 | Split a06 → a06a + a06b | Supertransaction is AskGina's key differentiator; single expect key would miss a silent bridge failure |
| 2026-03-05 | "Privy with user key export" (not "self-custodial") | Privy still holds threshold shares; key export on demand ≠ self-custody from day one |
| 2026-03-05 | Dim 5 = 2/5 despite Biconomy MEE | Dim 5 scores developer extensibility; MEE is internal and inaccessible to devs |
| 2026-03-05 | No testnet | AskGina is production-only; gas sponsorship (<$5 USD) covers tx fees |

## Progress Checkpoints

- [x] Scaffold complete — adapter + tests + research-notes + CLI
- [x] Build passes (`npm run build`)
- [x] CLI smoke test passes (`npm run test askgina`)
- [x] a01–a03 run; a04–a13 hit backend outage (2026-03-06)
- [x] Interim scores recorded: 18/40 (outage-degraded)
- [ ] Retest a04–a13 on a stable day
- [ ] Final scores filled in research-notes.md
- [ ] Moved to completed/
