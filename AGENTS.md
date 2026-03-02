# AGENTS.md

**This file is a map, not a document.** Keep it under 120 lines. Content belongs in the files it points to.

---

## Core Beliefs

These are invariants. Agents must not violate them.

1. **Progressive disclosure over front-loading.** Start here, follow pointers only when needed.
2. **Plans are artifacts.** Complex work lives in checked-in execution plans, not in memory.
3. **Pointers, not copies.** Never duplicate information across files. One source of truth per fact.
4. **Verification status matters.** Unverified design docs are hypotheses, not ground truth.
5. **Debt is visible or it is repeated.** All known gaps are logged in `plans/DEBT.md`.
6. **This file has a hard 120-line budget.** If a new entry doesn't fit, something must be removed or promoted to a deeper doc — never expand this file.

---

## Navigation Map

| What you need | Where to look |
|---|---|
| Project purpose & MCP tools | `CLAUDE.md` |
| This map | `AGENTS.md` (here) |
| Design doc catalogue & status | `docs/design/INDEX.md` |
| Architecture overview | `docs/architecture/MAP.md` |
| Quality grades by domain | `docs/quality/GRADES.md` |
| Active execution plans | `plans/ACTIVE.md` |
| Completed plans (history) | `plans/completed/` |
| Known technical debt | `plans/DEBT.md` |
| Session-scoped scratch work | `~/.claude/projects/.../memory/` (not checked in) |

---

## Plan Classification

| Type | When to use | Where it lives |
|---|---|---|
| Ephemeral | Single-session, small change | Claude memory dir (not checked in) |
| Execution plan | Multi-session or complex work | `plans/active/<slug>.md` (checked in) |
| Completed | Done, preserved for reference | `plans/completed/<slug>.md` |
| Debt | Known gap, not yet planned | `plans/DEBT.md` entry |

Execution plans must include: goal, constraints, decision log, progress checkpoints.

---

## Design Doc Verification Statuses

- `VERIFIED` — Confirmed against implementation or primary source
- `DRAFT` — Working hypothesis, not yet validated
- `DEPRECATED` — Superseded, kept for history

See `docs/design/INDEX.md` for the full catalogue.

---

## What Agents Should Do on Session Start

1. Read `AGENTS.md` (this file) — always
2. Read `CLAUDE.md` — always
3. Check `plans/ACTIVE.md` — if continuing existing work
4. Pull only the specific design doc or plan needed for the current task
