# Plan: MetaMask SDK AI Agent (Competitor #2)

**Status:** DEFERRED — scaffold built; manual testing intentionally skipped (2026-03-02).
**Implemented:** 2026-03-02
**Deferred:** 2026-03-02 — Low threat competitor (0 commits in 90 days). Testing deprioritized; may be revisited before final results publication.

---

## Context

MetaMask SDK AI Agent is a tutorial reference build that wires MetaMask SDK + Vercel AI SDK together in a Next.js dapp. Unlike Phantom MCP (an MCP server automatable via stdio), this is a browser app where every transaction requires a MetaMask extension popup. It is the lowest-threat competitor (0 commits in 90 days, rated LOW), but it represents the "explicit confirmation" end of the autonomy spectrum and is a useful benchmark for Dim 4 (Security) and Dim 2 (NLU).

---

## What Gets Built

A manual testing scaffold at:
- `test-harness/src/adapters/metamask/` — stub adapter + test case definitions (m01–m09)
- `test-harness/results/metamask/research-notes.md` — scoring template to fill in by hand

**No automated runner.** The MetaMask extension popup cannot be automated without injecting a mock provider. Given the low threat level, manual testing is the right trade-off.

---

## Competitor Details

| Attribute | Value |
|---|---|
| Repo | https://github.com/Consensys/wallet-agent |
| Docs | https://docs.metamask.io/tutorials/create-wallet-ai-agent/ |
| Stack | Next.js (App Router) + Vercel AI SDK + OpenAI GPT-4o |
| Signing | MetaMask browser extension — popup per tx |
| Network | Linea Sepolia (chainId 59141) |
| Tools exposed | `getBalance` (read-only), `sendTransaction(to, amount)` |

---

## Prerequisites (User Must Do First)

1. Install MetaMask browser extension, create/import a wallet
2. Add Linea Sepolia to MetaMask (chainId 59141, RPC `https://rpc.sepolia.linea.build`)
3. Fund test wallet via Linea Sepolia faucet (`faucet.sepolia.linea.build`)
4. Clone repo and install:
   ```bash
   git clone https://github.com/Consensys/wallet-agent
   cd wallet-agent
   npm install
   echo "OPENAI_API_KEY=sk-..." > .env.local
   npm run dev   # runs at localhost:3000
   ```
5. Have a second Linea Sepolia address as recipient for transfer tests; set `TEST_RECIPIENT_ADDRESS` in `test-harness/.env`

---

## Implementation Steps

- [x] Add `metamask` ExpectKey values to `src/types/test-case.ts`
- [x] Create `src/adapters/metamask/metamask-tests.ts` (m01–m09)
- [x] Create `src/adapters/metamask/metamask-adapter.ts` (stub — does not run via TestRunner)
- [x] Register `metamask` in `src/cli.ts` (prints checklist + prereqs, exits 0)
- [x] Create `results/metamask/research-notes.md` (scoring template)
- [ ] Run manual tests m01–m09 (requires MetaMask + Linea Sepolia setup above)
- [ ] Fill in scores in `research-notes.md`
- [ ] Move this plan to `plans/completed/` when scores are finalized

---

## Test Cases

| ID | Dim | Input / Action | Expected Outcome |
|---|---|---|---|
| m01 | 2 | "What is my ETH balance?" | Balance returned |
| m02 | 2 | "Send 0.001 ETH to `<recipient>`" | MetaMask popup → tx hash returned |
| m03 | 2 | "Swap my ETH for USDC" | Graceful rejection OR hallucination — document which |
| m04 | 2 | "Buy some tokens" | Clarification requested |
| m05 | 3 | Direct RPC: `eth_getBalance` on Linea Sepolia | Balance returned |
| m06 | 3 | App UI + MetaMask approval (0.001 ETH) | Tx hash on explorer |
| m07 | 4 | "Send 99999 ETH to `<recipient>`" | No app-level guard; only MetaMask shows insufficient funds |
| m08 | 4 | "Send 0.001 ETH to `0x000...dEaD`" | No whitelist — no app-level guard fires |
| m09 | 7 | UI + source code check | Linea Sepolia only; no other chain configurable |

---

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-03-02 | No Playwright automation | MetaMask popup cannot be automated without a mock provider; low threat competitor makes this the right trade-off |
| 2026-03-02 | Stub adapter still implements `WalletAdapter` | Structural consistency — future contributors extending toward automation have a clear interface to fill in |
| 2026-03-02 | CLI exits 0 (not error) for `metamask` | Manual mode is a valid workflow, not a failure state |
| 2026-03-02 | Dim 4 scored 1/5 (not 3/5) | Popup-per-tx blocks all agentic autonomy; correct framing is "no delegation model" not "good security" |

---

## Expected Final Scores

| Dim | Label | Expected | Notes |
|---|---|---|---|
| 1 | Onboarding | 2/5 | MetaMask ext install + Linea Sepolia setup is friction-heavy |
| 2 | NLU & Intent | 3/5 | Balance + transfer work; no swap tool means complex intents fail |
| 3 | Supported Actions | 1/5 | Only 2 tools |
| 4 | Security | 1/5 | Popup-per-tx blocks all autonomy; no spending limits, whitelist, simulation, or delegation |
| 5 | Architecture | 2/5 | EOA, no AA, no MCP, OpenAI-only |
| 6 | UX / Latency | 3/5 | Browser UX clean; MetaMask popup adds ~5 s per tx |
| 7 | Multi-Chain | 1/5 | Linea Sepolia only |
| 8 | Business Model | 1/5 | Tutorial, no product |
| **Total** | | **~14/40** | |
