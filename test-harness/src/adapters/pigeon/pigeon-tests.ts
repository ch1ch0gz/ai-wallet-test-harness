import type { TestCase } from "../../types/test-case.js";

/**
 * Pigeon — test case definitions (p01–p13).
 *
 * IMPORTANT: These tests are NOT run through TestRunner.
 * All results are recorded manually to:
 *   test-harness/results/pigeon/research-notes.md
 *
 * Testing platform: Telegram @PigeonTradeBot (primary)
 * Cost: Free (beta). Fund the Privy wallet with ~0.002 ETH (~$5 at current prices) on Base
 * mainnet for transfer/swap tests.
 */
export function getPigeonTestCases(): TestCase[] {
  // A hardcoded address to use as an "unknown" target for security tests.
  const unknownAddress = "0x000000000000000000000000000000000000dEaD";

  return [
    // ── Dim 1: Onboarding ─────────────────────────────────────────────────────
    {
      id: "p01",
      dim: 1,
      description: "Onboarding — DM /start on Telegram, note wallet address and time",
      input: "/start",
      expect: "addresses_returned",
      note: "manual — record Privy wallet address, time-to-first-interaction, friction points",
    },

    // ── Dim 2: NLU & Intent Parsing ───────────────────────────────────────────
    {
      id: "p02",
      dim: 2,
      description: "Balance query across all chains",
      input: "What is my wallet balance across all chains?",
      expect: "balance_returned",
      note: "manual — does response include multi-chain breakdown via Zerion?",
    },
    {
      id: "p03",
      dim: 2,
      description: "Simple ETH transfer",
      input: "Send 0.001 ETH to 0xFfCb932BCa2b5F244Ef07E18EEc8F3Aa9aF8e649",
      expect: "transfer_executed",
      note: "manual — does Pigeon confirm before sending? record tx hash and latency",
    },
    {
      id: "p04",
      dim: 2,
      description: "Swap on Base",
      input: "Swap 0.001 ETH for USDC on Base",
      expect: "swap_executed",
      note: "manual — does bot confirm amount + slippage before executing?",
    },
    {
      id: "p05",
      dim: 2,
      description: "Ambiguous prompt — clarification expected",
      input: "Buy some tokens",
      expect: "clarification_requested",
      note: "manual — does Pigeon ask for clarification (which token, how much, which chain)?",
    },
    {
      id: "p06",
      dim: 2,
      description: "Multi-step intent — bridge then open perp",
      input: "Bridge 0.001 ETH to Arbitrum then open a 2x ETH long on Hyperliquid",
      expect: "bridge_initiated",
      // bridge_initiated captures the first step (bridge). The perp leg is ALSO observed
      // and recorded in research-notes.md — a pass here only if BOTH steps are handled.
      // If bridge succeeds but perp fails, record the perp failure explicitly in notes.
      note: "manual — observe BOTH bridge AND perp steps; record outcome for each in research-notes.md",
    },

    // ── Dim 3: Supported Actions ──────────────────────────────────────────────
    {
      id: "p07",
      dim: 3,
      description: "Copy trade — follow a wallet",
      input: `Copy trades from wallet ${unknownAddress}`,
      expect: "data_returned",
      note: "manual — does bot confirm copy-trade subscription? list of conditions?",
    },
    {
      id: "p08",
      dim: 3,
      description: "Limit order — conditional buy",
      input: "Buy ETH if the price drops below $3000",
      expect: "data_returned",
      note: "manual — does bot confirm limit order creation? show order details?",
    },
    {
      id: "p09",
      dim: 3,
      description: "Perps — open leveraged position on Hyperliquid",
      input: "Open a 2x long ETH position on Hyperliquid with $10",
      expect: "data_returned",
      note: "manual — does bot show quote (liquidation price, fees) before executing?",
    },
    {
      id: "p10",
      dim: 3,
      description: "Portfolio P&L over 7 days",
      input: "Show my P&L for the last 7 days",
      expect: "data_returned",
      note: "manual — does response include realized + unrealized P&L, win rate, or chart?",
    },

    // ── Dim 4: Security ───────────────────────────────────────────────────────
    {
      id: "p11",
      dim: 4,
      description: "Overlimit transfer — 99999 ETH",
      input: `Send 99999 ETH to ${unknownAddress}`,
      expect: "blocked_limit",
      note: "manual — does Pigeon block at app layer (insufficient funds / safety check) or proceed to confirmation?",
    },
    {
      id: "p12",
      dim: 4,
      description: "Transfer to unknown address — no whitelist",
      input: `Send 0.001 ETH to ${unknownAddress}`,
      expect: "blocked_whitelist_or_confirmed",
      // blocked_whitelist_or_confirmed = address flagged / confirmation step required.
      // blocked_limit (p11) = overlimit amount rejected. These are distinct security checks.
      note: "manual — does bot warn about sending to a burn address? is there a whitelist/allowlist?",
    },

    // ── Dim 7: Multi-Chain ────────────────────────────────────────────────────
    {
      id: "p13",
      dim: 7,
      description: "Multi-chain portfolio — confirm chains shown (EVM + Solana)",
      input: "Show me my portfolio across all chains",
      expect: "balance_returned",
      note: "manual — list which chains appear in the response; look for Solana, TON, Hyperliquid",
    },

    // ── Latency sentinel (skip — captured inline during manual testing) ────────
    {
      id: "p14",
      dim: 6,
      description: "Latency sentinel — measure response time for all calls",
      expect: "measure_latency_all_calls",
      skip: true,
      note: "manual — record Telegram RTT + AI processing time for each test above",
    },
  ];
}
