# Plan: Bankr.bot — Competitor #7 Evaluation

## Goal
Build the manual test harness for Bankr.bot and run 14 test cases (b01–b14) via terminal.bankr.bot.

## Constraints
- Free tier: 10 msgs/day — must use Bankr Club or API key for a full 14-test session
- b07 token launch is irreversible (real contract deployment on Base mainnet)
- b08 Avantis: use minimum shown by Bankr, not a hard-coded $10
- b09 Polymarket: browse polymarket.com first; $1 USDC bet is real
- No automated runner — all results recorded manually in research-notes.md

## Steps
- [x] Create `test-harness/src/adapters/bankr/bankr-adapter.ts` (manual stub)
- [x] Create `test-harness/src/adapters/bankr/bankr-tests.ts` (b01–b14 + b15 sentinel)
- [x] Create `test-harness/results/bankr/research-notes.md` (template; Dims 5+8 pre-filled)
- [x] Modify `test-harness/src/cli.ts` — add `bankr` case + update error message
- [x] Create `plans/active/bankr.md` (this file)
- [x] Update `plans/ACTIVE.md` — add Bankr row
- [x] Verify: `npm run build` passes (type-check)
- [x] Verify: `npm run test bankr` prints checklist correctly (exit 0)
- [x] Manual testing: b01–b06 complete (2026-03-06 via Telegram); b07–b14 blocked on 10 msg/day free tier — resume tomorrow with Bankr Club or API key
- [ ] Score all 8 dimensions in research-notes.md
- [ ] Move to `plans/completed/bankr.md` when final scores confirmed

## Decision Log
| Date | Decision | Rationale |
|---|---|---|
| 2026-03-06 | Manual-only adapter despite REST API | API requires sign-up + key provisioning; evaluation mirrors real user experience via Terminal; async job polling adds implementation overhead without adding evaluation value |
| 2026-03-06 | network = "base-mainnet" | Primary EVM chain; gas sponsored on Base, Polygon, Unichain |
| 2026-03-06 | 14 test cases (not 13 like AskGina) | b06–b09 cover DCA/token launch/Avantis/Polymarket — Bankr's key differentiators; extra test justified by action breadth |
| 2026-03-06 | Dim 5 pre-scored 3/5 | REST API + OpenClaw skills > Pigeon/AskGina (both 2/5); no MCP server confirmed absent; closed source drops from 4/5 |
| 2026-03-06 | Dim 8 pre-scored 4/5 | BNKR token with Coinbase/Gate.io listings + 0.8% revenue share is strongest tokenomics in cohort |

## Progress Checkpoints
- [x] Harness scaffold complete — `npm run build` passes
- [x] `npm run test bankr` prints 14-test checklist with Terminal setup instructions
- [~] Manual testing in progress — b01–b06 done 2026-03-06; b07–b14 blocked on free tier; resume tomorrow
- [ ] Final scores confirmed — all 8 dimensions scored, total calculated
- [ ] Plan moved to completed/
