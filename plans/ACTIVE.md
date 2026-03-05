# Active Execution Plans

Index of all in-progress plans. Each plan is a separate file under `plans/active/`.

## Current Plans

| Plan | File | Started | Status |
|---|---|---|---|
| Phantom MCP Test Harness | `active/phantom-mcp-test-harness.md` | 2026-02-26 | Implemented — awaiting user prereqs |
| MetaMask SDK AI Agent | `active/metamask-sdk-agent.md` | 2026-03-02 | **DEFERRED** — scaffold built, manual testing skipped for now; scores unpublished |
| Coinbase AgentKit | `completed/coinbase-agentkit.md` | 2026-03-02 | ✅ Complete — 27/40 |
| HeyElsa | `completed/heyelsa.md` | 2026-03-02 | ✅ Complete — 31/40 |
| Pigeon | `active/pigeon.md` | 2026-03-03 | p01–p08 complete (2026-03-04); **interim 25/40**; p09–p13 blocked on mainnet funds |

---

## Execution Plan Template

When starting complex work, create `plans/active/<slug>.md` with this structure:

```markdown
# Plan: <Title>

## Goal
One sentence.

## Constraints
- Hard limits or requirements

## Steps
- [ ] Step 1
- [ ] Step 2

## Decision Log
| Date | Decision | Rationale |
|---|---|---|

## Progress Checkpoints
- [ ] Checkpoint description — what "done" looks like
```

When complete, move to `plans/completed/<slug>.md` and update this index.
