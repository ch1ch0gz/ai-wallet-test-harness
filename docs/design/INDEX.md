# Design Document Index

All design documents for the AI Wallet Competitors Research project.

## Format

Each entry: `[Title](path)` | Status | Last verified | Notes

## Documents

| Document | Status | Last Verified | Notes |
|---|---|---|---|
| [Competitor Evaluation Framework](../../Agentic-Wallet-Competitor-Evaluation-Framework.md) | DRAFT | 2026-02-26 | 7 products, 8 dimensions, scoring template, test protocol, positioning map, 6 design insights. Many "Not confirmed" entries pending hands-on testing. |
| [Competitor MCP Analysis Report](01-competitor-mcp-analysis.md) | DRAFT | 2026-02-26 | GitHub metrics (MetaMask SDK, AgentKit), social trends (all 7), emergent signals, cross-ref vs Intake Form, threat levels. |
| [Intake Form V2](../../Agentic%20Wallet%20Stage%200%20-%20Intake%20Form%20V2.md) | VERIFIED | 2026-01-15 | Core venture definition: problem, solution (3 phases), business model, team, market, tech architecture, validation data (Warden 13M users, ERC-4337 onchain data, MetaMask/Coinbase user pain). Primary source of truth for Agentic Wallet requirements. |

---

## Adding a Document

1. Create the file under `docs/design/`
2. Add a row to the table above with status `DRAFT`
3. Mark `VERIFIED` only after confirming against a primary source (live product, GitHub, official docs)
4. Use `DEPRECATED` when superseded — do not delete, keep for history

## Verification Criteria

A design doc is `VERIFIED` when:
- Claims are traceable to a primary source (linked)
- A human or agent has spot-checked at least 3 key claims
- The verified date is within 90 days (research goes stale fast in this space)
