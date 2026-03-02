# Plan: Coinbase AgentKit (Competitor #3)

**Status:** Implementing — scaffold complete, awaiting test run.
**Planned:** 2026-03-02

---

## Context

Coinbase AgentKit is the most technically ambitious competitor: a framework-agnostic developer SDK (`@coinbase/agentkit` v0.10.4) that lets AI agents interact with blockchains using 39+ action providers covering DeFi, NFTs, bridges, oracles, and social protocols. Unlike Phantom MCP (Solana-only, 10 tools) or MetaMask SDK (2 tools, manual popup), AgentKit is fully automatable from the CLI and supports Account Abstraction via CDP Smart Wallet and ZeroDev.

This is the highest-scoring competitor. Testing it confirms the ceiling for what an agentic wallet SDK can currently do.

---

## What It Is

| Attribute | Value |
|---|---|
| Repo | https://github.com/coinbase/agentkit |
| Package | `@coinbase/agentkit` v0.10.4 |
| Language | TypeScript (primary) + Python |
| Wallet providers | CdpEvmWalletProvider, CdpSmartWalletProvider, ViemWalletProvider, PrivyWalletProvider (EVM + SVM), ZeroDevWalletProvider — 14 total |
| Action providers | 39 in TS: DeFi (Compound, Morpho, Moonwell, Sushi, 0x, Jupiter), NFT (OpenSea, Zora), bridge (Across), oracle (Pyth), social (Twitter, Farcaster), AA (baseAccount, ZeroDev), and more |
| LLM frameworks | LangChain, Vercel AI, OpenAI Agents SDK, MCP, Eliza, Strands — framework-agnostic |
| Network | Base Sepolia (testnet default); all EVM + Solana supported |
| AA support | Yes — CDP Smart Wallet + ZeroDev session keys |
| Signing | Server-side (no browser popup); fully automatable |

---

## Repository Intelligence (2026-03-02)

| Metric | Value | Signal |
|---|---|---|
| Stars | 1,128 | Moderate traction |
| Forks | 650 | High fork quality score (1.0) — builders, not bots |
| Contributors | 86 | Healthy, led by Coinbase eng |
| Commits (last 90d) | 14 | Slowing from peak; still active |
| Open issues | 135 | Backlog growing |
| Issue close rate | 0.161 | Low — 135 open vs 26 closed |
| Social buzz | Low (9 HN mentions, 89% organic) | Low marketing noise; niche dev audience |
| Security note | Repo targeted in March 2025 tj-actions supply chain attack; Coinbase removed the workflow promptly | |

**Issue themes (from sentiment analysis):**
- 73% feature requests — community wants more protocol integrations (Uniswap V4, reputation checks, multi-agent coordination)
- Security gaps: no spending limits, no address whitelist, no reasoning verification at framework level
- Bugs: misleading ETIMEDOUT errors (asyncio conflict), hardcoded 18-decimal assumptions in Morpho

---

## Architecture Overview

```
AgentKit.from({ walletProvider, actionProviders })
  └── getActions() → Action[]
        ├── name: string
        ├── description: string
        ├── schema: z.ZodSchema
        └── invoke(args) → Promise<string>
```

Each `Action` is self-contained: its Zod schema defines the input, `invoke()` executes it against the wired wallet provider. To integrate with Claude's tool use API:
1. Convert `action.schema` (Zod) → JSON Schema via `zod-to-json-schema`
2. Pass as Anthropic `Tool[]` to the messages API
3. On `tool_use` block, call `action.invoke(toolUse.input)`

This is structurally identical to the Phantom MCP integration (MCPClient ↔ AgentKit), allowing us to build a full automated `CoinbaseAdapter` without modifying any core harness files.

---

## Required Env Vars

```bash
# Coinbase Developer Platform — create at portal.cdp.coinbase.com
CDP_API_KEY_ID=...
CDP_API_KEY_SECRET=...
CDP_WALLET_SECRET=...
NETWORK_ID=base-sepolia          # default; omit for base-sepolia

# Existing
ANTHROPIC_API_KEY=...
TEST_RECIPIENT_ADDRESS=0x...     # a Base Sepolia address you control
```

---

## Prerequisites (User Must Do First)

1. Create a CDP account at `portal.cdp.coinbase.com`
2. Create an API key and copy `CDP_API_KEY_ID` and `CDP_API_KEY_SECRET`
3. Generate a `CDP_WALLET_SECRET` (wallet encryption key — generate once, store in `.env`)
4. Fund the agent wallet via Base Sepolia faucet (`faucet.base.org`)
5. Add credentials to `test-harness/.env`:
   ```bash
   CDP_API_KEY_ID=...
   CDP_API_KEY_SECRET=...
   CDP_WALLET_SECRET=...
   NETWORK_ID=base-sepolia
   ```

---

## What Gets Built

```
test-harness/
├── src/
│   └── adapters/
│       └── coinbase/
│           ├── coinbase-adapter.ts   # Full automated adapter — see below
│           └── coinbase-tests.ts     # c01–c14 test case definitions
└── results/
    └── coinbase/
        └── research-notes.md         # Manual dims + findings template
```

**Plus:**
- `src/types/test-case.ts` — add 2 new `ExpectKey` values: `bridge_initiated`, `solana_tools_available`
- `src/cli.ts` — register `coinbase` competitor (automated path, not manual)
- `test-harness/.env.example` — add CDP env var stubs
- `plans/ACTIVE.md` — add row

---

## CoinbaseAdapter Design

**Unlike Phantom** (which wraps `MCPClient` + delegates to `NLURunner`), `CoinbaseAdapter` owns the AgentKit instance and implements the Claude agentic loop inline. This avoids modifying core harness files and keeps the adapter self-contained.

```typescript
class CoinbaseAdapter implements WalletAdapter {
  readonly name = "Coinbase AgentKit";
  readonly network: string;  // "base-sepolia" default

  private walletProvider?: CdpEvmWalletProvider;
  private agentkit?: AgentKit;
  private actions?: Action[];

  async initialize(): Promise<void> {
    this.walletProvider = await CdpEvmWalletProvider.configureWithWallet();
    this.agentkit = await AgentKit.from({
      walletProvider: this.walletProvider,
      actionProviders: [
        walletActionProvider(),
        erc20ActionProvider(),
        wethActionProvider(),
        // zeroXActionProvider() or sushiActionProvider() for swap tests
      ],
    });
    this.actions = this.agentkit.getActions();
  }

  listTools(): ToolDefinition[]  // convert Action[] to ToolDefinition[]
  callTool(name, params): ToolCallResult  // find action by name → action.invoke(params)
  runNLU(prompt): NLUResult      // inline Claude agentic loop with this.actions as tools
  evaluateTestCase(tc, result, latencyMs): TestResult
}
```

**Key implementation detail — Zod → JSON Schema conversion:**
`action.schema` is a Zod schema. Anthropic tools need `input_schema` as JSON Schema. Use `zodToJsonSchema(action.schema)` from the `zod-to-json-schema` package.

**Required new dependency:**
```bash
npm install @coinbase/agentkit zod-to-json-schema
# zod is likely already present transitively; check before adding
```

---

## Test Cases (c01–c14)

### Dim 2 — NLU & Intent Parsing (automated via Claude + AgentKit tools)

| ID | Input | Expected |
|---|---|---|
| c01 | "What is my wallet address and ETH balance?" | `balance_returned` — both address + balance in response |
| c02 | "Send 0.001 ETH to `<recipient>`" | `transfer_executed` — tx hash in response |
| c03 | "Swap 0.001 ETH for USDC on Base" | `swap_executed` — swap tool called (requires swap action provider) |
| c04 | "Buy some tokens" | `clarification_requested` |
| c05 | "Bridge 0.001 ETH from Base to Arbitrum" | `bridge_initiated` — Across action called (requires `acrossActionProvider`) |

### Dim 3 — Supported Actions (direct tool calls)

| ID | Tool | Params | Expected |
|---|---|---|---|
| c06 | `get_wallet_details` | `{}` | `addresses_returned` |
| c07 | `get_balance` | `{}` or `{assetId: "eth"}` | `balance_returned` |
| c08 | `native_transfer` | `{to, amount: "0.001"}` | `tx_hash` |

> Note: exact action names are discovered at runtime via `agentkit.getActions()`. The adapter maps our logical test names to actual AgentKit action names.

### Dim 4 — Security (direct tool calls)

| ID | Tool / Input | Expected |
|---|---|---|
| c09 | `native_transfer` with `amount: "99999"` | `blocked_limit` — expected to FAIL (no SDK-level spending limit; confirms security gap) |
| c10 | `native_transfer` to `0x000...dEaD` | `blocked_whitelist_or_confirmed` — expected: goes through (no whitelist; security gap) |

### Dim 7 — Multi-Chain (mix of direct and NLU)

| ID | Action | Expected |
|---|---|---|
| c11 | `get_wallet_details` on Base Sepolia | `addresses_returned` — EVM address returned |
| c12 | Check if Jupiter (Solana) action is in `getActions()` | `solana_tools_available` — Jupiter present if Solana wallet provider loaded |
| c13 | NLU: "What chains does this wallet support?" | Agent response describes Base/EVM support; notes Solana as available via different provider |

### Dim 6 — Latency (aggregated from above runs)

| ID | Note |
|---|---|
| c14 | Sentinel — latency aggregated from all calls. `skip: true`. |

---

## Evaluation Notes

**c09 (spending limit) — expected outcome:**
AgentKit has no built-in spending limit mechanism. The test will either: (a) fail with "insufficient funds" from the chain (not an SDK guard — a chain-level rejection), or (b) execute a dust transaction. Either way, **no application-level guard fires**. This confirms the security gap noted in GitHub issues #979 and #980. Score for Dim 4 reflects this.

**c03 / c05 — action provider availability:**
Swap and bridge tests require including `zeroXActionProvider()` (or `sushiActionProvider()`) and `acrossActionProvider()` respectively. If these are unstable on Base Sepolia, skip with note — the key finding is whether the action *exists*, not whether the testnet liquidity is sufficient.

**Dim 5 (Architecture) — manual research note:**
CDP Smart Wallet provider enables AA (ERC-4337) on Base. ZeroDev wallet provider adds session keys with spending limits. These are available but NOT the default setup — they require explicit configuration. This earns a 5/5 on architecture maturity, but the security score (Dim 4) remains low because the default agent wallet has no guardrails.

---

## Expected Scores

| Dim | Label | Expected | Rationale |
|---|---|---|---|
| 1 | Onboarding | 4/5 | `npm create onchain-agent@latest` is fast; CDP API key setup adds one step |
| 2 | NLU & Intent | 4/5 | Claude + 39 providers handles multi-step well; complex bridging may need prompting |
| 3 | Supported Actions | 5/5 | Best action coverage of all 7 competitors; 39 providers, 50+ actions |
| 4 | Security | 2/5 | No spending limits or whitelist by default; ZeroDev session keys exist but require explicit opt-in |
| 5 | Architecture | 5/5 | AA (CDP Smart Wallet + ZeroDev), multi-chain, MCP support, framework-agnostic, most mature SDK |
| 6 | UX / Latency | 4/5 | CLI/code DX is excellent; no popup overhead |
| 7 | Multi-Chain | 4/5 | Base + all EVM + Solana (14 wallet providers); "all EVM and SVM networks" |
| 8 | Business Model | 3/5 | CDP is Coinbase's paid dev platform with real users; SDK is open-source but wallet infra is not |
| **Total** | | **~31/40** | Highest of the 7 competitors |

---

## Implementation Steps

- [x] Install `@coinbase/agentkit` + `zod-to-json-schema` in `test-harness/`
- [x] Add `bridge_initiated` to `ExpectKey` in `src/types/test-case.ts`
- [x] Create `src/adapters/coinbase/coinbase-tests.ts` (c01–c13)
- [x] Create `src/adapters/coinbase/coinbase-adapter.ts` (full automated adapter)
- [x] Register `coinbase` in `src/cli.ts` (automated path — like `phantom`)
- [x] Add CDP env var stubs to `test-harness/.env.example`
- [x] Create `test-harness/results/coinbase/research-notes.md` (manual dims template)
- [ ] Run `npm run test coinbase` — confirm initialization + tool list
- [ ] Run automated tests — record results
- [ ] Fill manual dims (1, 5, 8) in research-notes.md
- [ ] Move plan to `plans/completed/` when scoring is final

---

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-03-02 | Full automated adapter (not manual stub) | AgentKit is server-side; no browser popup; fully automatable like Phantom |
| 2026-03-02 | Inline NLU loop in adapter (not modify NLURunner) | Avoids touching Phantom's working integration; self-contained |
| 2026-03-02 | Use CdpEvmWalletProvider (not CdpSmartWalletProvider) as default | Simpler setup; Smart Wallet requires additional CDP config. Document AA availability in Dim 5 notes. |
| 2026-03-02 | Include swap + bridge providers in action set | Needed to test Dim 3 (action coverage) and Dim 7 (multi-chain bridge) |
| 2026-03-02 | Dim 4 score 2/5 (not 1/5) | ZeroDev session keys + CDP Smart Wallet provide delegation primitives that MetaMask lacks; but they're opt-in, not default |
