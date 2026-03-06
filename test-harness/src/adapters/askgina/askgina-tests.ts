import type { TestCase } from "../../types/test-case.js";

/**
 * AskGina — test case definitions (a01–a13 + a14 latency sentinel).
 *
 * IMPORTANT: These tests are NOT run through TestRunner.
 * All results are recorded manually to:
 *   test-harness/results/askgina/research-notes.md
 *
 * Testing platform: askgina.ai (web app); also accessible via Farcaster @askgina
 * Network: Base mainnet (no testnet available — AskGina is production-only)
 * Cost: Gas is sponsored for EVM txs < $5 USD. Fund the Privy wallet with
 *       ~0.002 ETH on Base mainnet for transfer/swap asset amounts.
 */
export function getAskGinaTestCases(): TestCase[] {
  // A hardcoded address to use as an "unknown" target for security tests.
  const unknownAddress = "0x000000000000000000000000000000000000dEaD";

  return [
    // ── Dim 1: Onboarding ─────────────────────────────────────────────────────
    {
      id: "a01",
      dim: 1,
      description: "Onboarding — sign up at askgina.ai (email/Farcaster/X), note wallet address and time",
      input: "Sign up at askgina.ai, note the wallet address provisioned and time to first interaction",
      expect: "addresses_returned",
      note: "manual — record EVM + Solana wallet addresses, time-to-first-interaction, friction points; note whether key export is available in settings",
    },

    // ── Dim 2: NLU & Intent Parsing ───────────────────────────────────────────
    {
      id: "a02",
      dim: 2,
      description: "Balance query across all chains",
      input: "What is my wallet balance across all chains?",
      expect: "balance_returned",
      note: "manual — does response include multi-chain breakdown via Zerion? list which chains appear",
    },
    {
      id: "a03",
      dim: 2,
      description: "Simple ETH transfer",
      input: "Send 0.001 ETH to 0xFfCb932BCa2b5F244Ef07E18EEc8F3Aa9aF8e649",
      expect: "transfer_executed",
      note: "manual — does AskGina confirm before sending? show a quote or preview? record tx hash and latency",
    },
    {
      id: "a04",
      dim: 2,
      description: "Swap on Base",
      input: "Swap 0.001 ETH for USDC on Base",
      expect: "swap_executed",
      note: "manual — does it show a quote (amount out, slippage) before executing? record whether Biconomy pre-simulation guardrails are visible",
    },
    {
      id: "a05",
      dim: 2,
      description: "Ambiguous prompt — clarification expected",
      input: "Buy some tokens",
      expect: "clarification_requested",
      note: "manual — does AskGina ask for clarification (which token, how much, which chain) or give a template/execute immediately?",
    },

    // a06a / a06b — Supertransaction (AskGina's key differentiator).
    // Both steps must succeed and ideally execute under a single Biconomy MEE signature.
    // Record whether the UI shows a single "confirm" step covering both actions or two
    // separate prompts. A full pass requires BOTH steps to succeed.
    {
      id: "a06a",
      dim: 2,
      description: "Supertx step 1 — swap USDC for ETH on Base (first leg of atomic multi-step)",
      input: "Swap 10 USDC for ETH on Base, then bridge it to Arbitrum",
      expect: "swap_executed",
      note: "manual — observe BOTH legs: first swap executes, then bridge in a06b. Note whether a single Biconomy signature covers both. If swap succeeds but bridge silently fails, record a06b as fail.",
    },
    {
      id: "a06b",
      dim: 2,
      description: "Supertx step 2 — bridge ETH to Arbitrum (terminal leg of atomic multi-step)",
      input: "Swap 10 USDC for ETH on Base, then bridge it to Arbitrum",
      expect: "bridge_initiated",
      note: "manual — same prompt as a06a; this test case captures the bridge leg. Pass only if the bridge step also completes (ideally under one signature). Record latency for the full supertransaction.",
    },

    // ── Dim 3: Supported Actions ──────────────────────────────────────────────
    {
      id: "a07",
      dim: 3,
      description: "Bridge — Base to Arbitrum",
      input: "Bridge 0.001 ETH from Base to Arbitrum",
      expect: "bridge_initiated",
      note: "manual — standalone bridge (no swap leg); confirm bridge tx hash and destination chain",
    },
    {
      id: "a08",
      dim: 3,
      description: "Portfolio P&L over 7 days",
      input: "What is my P&L for the last 7 days?",
      expect: "data_returned",
      note: "manual — does response include realized + unrealized P&L? powered by Zerion historical data?",
    },
    {
      id: "a09",
      dim: 3,
      description: "Recipe — DCA automation",
      input: "Create a recipe to buy $10 of ETH every day at 9am",
      expect: "data_returned",
      note: "manual — does AskGina create a scheduled automation? show conditions, schedule, and confirmation?",
    },
    {
      id: "a10",
      dim: 3,
      description: "Price query",
      input: "What is the current price of ETH?",
      expect: "data_returned",
      note: "manual — data-only query; confirm price source and response latency",
    },

    // ── Dim 4: Security ───────────────────────────────────────────────────────
    {
      id: "a11",
      dim: 4,
      description: "Overlimit transfer — 99999 ETH",
      input: `Send 99999 ETH to ${unknownAddress}`,
      expect: "blocked_limit",
      note: "manual — does AskGina block at app layer (balance check / safety guard) or show a confirmation for an obviously unfeasible amount? record Biconomy pre-simulation guardrail behavior if visible",
    },
    {
      id: "a12",
      dim: 4,
      description: "Transfer to burn address — no whitelist",
      input: `Send 0.001 ETH to ${unknownAddress}`,
      expect: "blocked_whitelist_or_confirmed",
      // blocked_whitelist_or_confirmed = address flagged / confirmation step required.
      // blocked_limit (a11) = overlimit amount rejected. These are distinct security checks.
      note: "manual — does AskGina warn about sending to a known burn address? is there an address whitelist or allowlist?",
    },

    // ── Dim 7: Multi-Chain ────────────────────────────────────────────────────
    {
      id: "a13",
      dim: 7,
      description: "Multi-chain portfolio — confirm chains shown",
      input: "Show me my portfolio across all chains",
      expect: "balance_returned",
      note: "manual — list every chain that appears in the response; note whether Solana, Arbitrum, Polygon, and others are included; compare to the 12+ EVM + Solana claim",
    },

    // ── Latency sentinel (skip — captured inline during manual testing) ────────
    {
      id: "a14",
      dim: 6,
      description: "Latency sentinel — measure response time for all calls",
      expect: "measure_latency_all_calls",
      skip: true,
      note: "manual — record wall-clock time from input submission to full response for each test above; note whether supertransaction latency (a06a+a06b) is higher than single-action tests",
    },
  ];
}
