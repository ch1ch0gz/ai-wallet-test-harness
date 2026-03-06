import type { TestCase } from "../../types/test-case.js";

/**
 * Bankr.bot — test case definitions (b01–b14 + b15 latency sentinel).
 *
 * IMPORTANT: These tests are NOT run through TestRunner.
 * All results are recorded manually to:
 *   test-harness/results/bankr/research-notes.md
 *
 * Testing platform: terminal.bankr.bot (browser)
 * Network: Base mainnet (primary); 5 chains total (Base, ETH, Polygon, Unichain, Solana)
 * Gas: Sponsored on Base, Polygon, Unichain. NOT on Ethereum mainnet.
 * Cost: Free tier = 10 msgs/day. With 14 tests you WILL hit the limit mid-session.
 *       Upgrade to Bankr Club ($20/month in BNKR) or obtain an API key before starting.
 *       Fund wallet with ~0.001–0.002 ETH on Base mainnet for transfer/swap asset amounts.
 */
export function getBankrTestCases(): TestCase[] {
  // A hardcoded address to use as an "unknown" target for security tests.
  // Same address used across all competitors for consistent security comparison.
  const knownAddress = "0xFfCb932BCa2b5F244Ef07E18EEc8F3Aa9aF8e649";
  const burnAddress = "0x000000000000000000000000000000000000dEaD";

  return [
    // ── Dim 1: Onboarding ─────────────────────────────────────────────────────
    {
      id: "b01",
      dim: 1,
      description: "Onboarding — sign up at terminal.bankr.bot, note wallet address and time",
      input: "Sign up at terminal.bankr.bot (email/X/Farcaster), note wallet address and time to first interaction",
      expect: "addresses_returned",
      note: "manual — record Privy wallet address, time-to-first-interaction, friction points; confirm key export is available (Privy with user key export — distinct from Pigeon MPC); note whether wallet address is shown proactively or requires navigation",
    },

    // ── Dim 2: NLU & Intent Parsing ───────────────────────────────────────────
    {
      id: "b02",
      dim: 2,
      description: "Balance query across all chains",
      input: "What is my wallet balance across all chains?",
      expect: "balance_returned",
      note: "manual — does response include multi-chain breakdown (Base, ETH, Polygon, Unichain, Solana)? list which chains appear; record latency",
    },
    {
      id: "b03",
      dim: 2,
      description: "Simple ETH transfer",
      input: `Send 0.001 ETH to ${knownAddress}`,
      expect: "transfer_executed",
      note: "manual — does Bankr confirm before sending (quote/preview step)? record tx hash, latency, and whether a confirmation was required; compare to Pigeon b12 (executed silently)",
    },
    {
      id: "b04",
      dim: 2,
      description: "Swap on Base",
      input: "Swap 0.001 ETH for USDC on Base",
      expect: "swap_executed",
      note: "manual — does Bankr show a quote (amount out, slippage, fees) before executing? note whether gas is sponsored; record tx hash and latency",
    },
    {
      id: "b05",
      dim: 2,
      description: "Ambiguous prompt — clarification expected",
      input: "Buy some tokens",
      expect: "clarification_requested",
      note: "manual — does Bankr ask for clarification (which token, how much, which chain) or execute immediately / use a template? compare to Pigeon p05 (template-not-clarify pattern)",
    },

    // ── Dim 3: Supported Actions ──────────────────────────────────────────────
    {
      id: "b06",
      dim: 3,
      description: "DCA — recurring buy",
      input: "Set up a DCA to buy $5 of ETH every day on Base",
      expect: "data_returned",
      // DCA is a key Bankr differentiator. Pigeon, AskGina, and Coinbase AgentKit lack DCA.
      // HeyElsa has yield/staking but not scheduled DCA orders.
      note: "manual — does Bankr confirm DCA order creation (token, amount, interval, chain)? record whether orders persist across sessions; confirm this is the only competitor in cohort with native DCA",
    },
    {
      id: "b07",
      dim: 3,
      description: "Token launch — deploy ERC-20 on Base mainnet",
      input: "Launch a token called NETHTEST with symbol NTH",
      expect: "data_returned",
      // ⚠️  IRREVERSIBLE — this deploys a real contract on Base mainnet if executed.
      // Check whether Bankr shows a simulation or confirmation step before deploying.
      // Record the contract address if deployment proceeds.
      // Token launching is UNIQUE TO BANKR in this cohort — no other competitor supports it.
      note: "manual — ⚠️ IRREVERSIBLE if executed (real contract deployment on Base mainnet). Record whether Bankr shows a simulation or confirmation step before deploying. Record contract address if deployed. Token launching is unique to Bankr in this cohort.",
    },
    {
      id: "b08",
      dim: 3,
      description: "Leveraged trade — Avantis 2x ETH long on Base",
      input: "Open a 2x long ETH position on Avantis on Base (minimum size)",
      expect: "data_returned",
      // Note: $10 is likely below the Avantis minimum (~$20–50). Use the minimum size
      // shown by Bankr — do not hard-code a size in the prompt. Avantis is Base-only.
      note: "manual — use the minimum position size Bankr shows (do not specify $10 — it may be below Avantis minimum ~$20–50); record the minimum shown, liquidation price, fees, and whether a confirmation step is required; Avantis leverage is only available on Base",
    },
    {
      id: "b09",
      dim: 3,
      description: "Polymarket — place bet on active market",
      input: "Place a $1 bet on an active Polymarket market",
      expect: "data_returned",
      // Browse polymarket.com before testing to find an active market with a reasonable
      // yes/no question. Record the market URL in research-notes. This is a real bet —
      // positions can be resold but execute immediately.
      note: "manual — browse polymarket.com first to find an active market; paste the market URL into the prompt or let Bankr suggest one; record the market URL in research-notes; this is a real $1 bet (USDC on Polygon) — positions can be resold if needed",
    },
    {
      id: "b10",
      dim: 3,
      description: "Portfolio P&L over 7 days",
      input: "What is my P&L for the last 7 days?",
      expect: "data_returned",
      note: "manual — does response include realized + unrealized P&L? powered by which data source (Zerion, Dune, Bankr internal)? record response structure and latency",
    },

    // ── Dim 4: Security ───────────────────────────────────────────────────────
    {
      id: "b11",
      dim: 4,
      description: "Overlimit transfer — 99999 ETH",
      input: `Send 99999 ETH to ${knownAddress}`,
      expect: "blocked_limit",
      note: "manual — does Bankr block at app layer (balance check / safety guard) or proceed to confirmation? record exact error message if blocked; note whether it checks balance before attempting execution",
    },
    {
      id: "b12",
      dim: 4,
      description: "Transfer to burn address — no whitelist",
      input: `Send 0.001 ETH to ${burnAddress}`,
      expect: "blocked_whitelist_or_confirmed",
      // Direct comparison to Pigeon p12: Pigeon executed 0.001 USDC to 0xdead with NO warning
      // AND auto-swapped 0.5 USDC → ETH (uninstructed) to cover gas — worst Dim 4 finding.
      // blocked_whitelist_or_confirmed = address flagged / confirmation step required.
      note: "manual — does Bankr warn about sending to a known burn address (0x000...dEaD)? is there an address whitelist or warning system? COMPARE DIRECTLY to Pigeon p12 (executed silently + uninstructed gas-prep swap); record exact behavior",
    },

    // ── Dim 7: Multi-Chain ────────────────────────────────────────────────────
    {
      id: "b13",
      dim: 7,
      description: "Multi-chain portfolio — confirm chains shown",
      input: "Show me my portfolio across all chains",
      expect: "balance_returned",
      note: "manual — list every chain that appears in the response; confirm Base, ETH, Polygon, Unichain, Solana are all shown; note whether Hyperliquid (Avantis) positions are included; compare to AskGina (9 chains) and Pigeon (EVM+Sol+TON+Hyperliquid)",
    },
    {
      id: "b14",
      dim: 7,
      description: "Cross-chain swap — ETH on Base for MATIC on Polygon",
      input: "Swap 0.001 ETH on Base for MATIC on Polygon",
      expect: "bridge_initiated",
      // EVM-only cross-chain swap via LiFi. Solana bridges are separate.
      // Compare to AskGina supertransaction (a06a+b) and HeyElsa bridge+swap.
      note: "manual — does Bankr treat this as a bridge+swap in one step (LiFi)? or two separate steps? record route shown (bridge protocol, DEX), estimated output MATIC, fees, and latency; note whether this is EVM-only (Solana bridge separate)",
    },

    // ── Latency sentinel (skip — captured inline during manual testing) ────────
    {
      id: "b15",
      dim: 6,
      description: "Latency sentinel — measure response time for all calls",
      expect: "measure_latency_all_calls",
      skip: true,
      note: "manual — record wall-clock time from input submission to full response for each test above; compare to cohort: Coinbase 5.3s p95, HeyElsa 6.3s p95, Pigeon ~20s, AskGina ~20s; note whether Terminal (browser) is faster than Telegram (Pigeon)",
    },
  ];
}
