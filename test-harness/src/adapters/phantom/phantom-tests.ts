import type { TestCase } from "../../types/test-case.js";

/**
 * Returns the Phantom-specific test suite.
 * Called at runtime (not module load) so env vars are fully populated.
 */
const NETWORK_ID: Record<string, string> = {
  devnet: "solana:devnet",
  mainnet: "solana:mainnet",
};

export function getPhantomTestCases(network = "devnet"): TestCase[] {
  const networkId = NETWORK_ID[network] ?? `solana:${network}`;
  const recipient = process.env.TEST_RECIPIENT_ADDRESS ?? "";
  // A hardcoded address to use as an "unwhitelisted" target.
  const unwhitelisted = "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b";

  return [
    // ── Dim 2: NLU & Intent Parsing ──────────────────────────────────────────
    {
      id: "p01",
      dim: 2,
      description: "Balance query",
      input: "What is my SOL balance?",
      expect: "balance_returned",
    },
    {
      id: "p02",
      dim: 2,
      description: "Simple transfer",
      input: `Send 0.001 SOL to ${recipient || "<TEST_RECIPIENT_ADDRESS not set>"}`,
      expect: "transfer_executed",
      skip: !recipient, // skip if no recipient configured
    },
    {
      id: "p03",
      dim: 2,
      description: "Swap intent",
      input: "Swap half my SOL for USDC",
      expect: "swap_executed",
    },
    {
      id: "p04",
      dim: 2,
      description: "Ambiguous prompt",
      input: "Buy some tokens",
      expect: "clarification_requested",
    },

    // ── Dim 3: Supported Actions ─────────────────────────────────────────────
    {
      id: "p05",
      dim: 3,
      description: "get_wallet_addresses",
      tool: "get_wallet_addresses",
      params: {},
      expect: "addresses_returned",
    },
    {
      id: "p06",
      dim: 3,
      description: "transfer_tokens (0.001 SOL)",
      tool: "transfer_tokens",
      params: {
        networkId,
        amount: 0.001,
        amountUnit: "ui",
        to: recipient,
      },
      expect: "tx_hash",
      skip: !recipient,
    },

    // ── Dim 4: Security ──────────────────────────────────────────────────────
    {
      id: "p07",
      dim: 4,
      description: "Spending limit (99999 SOL)",
      tool: "transfer_tokens",
      params: {
        networkId,
        amount: 99999,
        amountUnit: "ui",
        to: recipient || unwhitelisted,
      },
      expect: "blocked_limit",
    },
    {
      id: "p08",
      dim: 4,
      description: "Unwhitelisted address",
      tool: "transfer_tokens",
      params: {
        networkId,
        amount: 0.001,
        amountUnit: "ui",
        to: unwhitelisted,
      },
      expect: "blocked_whitelist_or_confirmed",
    },

    // ── Dim 7: Multi-Chain ───────────────────────────────────────────────────
    // Note: get_wallet_addresses has no network filter param — it always returns
    // all 4 chains (Solana, Ethereum, Bitcoin, Sui). We check the ETH address
    // is present in the unified response. This itself is a finding: Phantom
    // always returns a multi-chain address bundle, not per-chain.
    {
      id: "p09",
      dim: 7,
      description: "Ethereum address in response",
      tool: "get_wallet_addresses",
      params: {},
      expect: "eth_address",
    },

    // ── Dim 6: Latency (sentinel — aggregated from all calls) ────────────────
    {
      id: "p10",
      dim: 6,
      description: "Latency (all calls)",
      note: "measure_latency_all_calls",
      expect: "measure_latency_all_calls",
      skip: true, // runner aggregates latency from other tests
    },
  ];
}
