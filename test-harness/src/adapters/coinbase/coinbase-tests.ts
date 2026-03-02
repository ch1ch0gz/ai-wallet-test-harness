import type { TestCase } from "../../types/test-case.js";

/**
 * Coinbase AgentKit — test suite (c01–c13).
 * Run via: npm run test coinbase
 *
 * Action names used in `tool` fields are discovered at runtime via
 * agentkit.getActions(). CoinbaseAdapter logs all available action names
 * during initialize() — check that output if any test reports "action not found".
 *
 * Prerequisite env vars: CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET
 * Network: base-sepolia (default)
 */
export function getCoinbaseTestCases(): TestCase[] {
  const recipient = process.env.TEST_RECIPIENT_ADDRESS ?? "";
  const deadAddress = "0x000000000000000000000000000000000000dEaD";

  return [
    // ── Dim 2: NLU & Intent Parsing ──────────────────────────────────────────
    {
      id: "c01",
      dim: 2,
      description: "Balance + address query",
      input: "What is my wallet address and ETH balance?",
      expect: "balance_returned",
    },
    {
      id: "c02",
      dim: 2,
      description: "Simple ETH transfer",
      input: `Send 0.001 ETH to ${recipient || "<TEST_RECIPIENT_ADDRESS not set>"}`,
      expect: "transfer_executed",
      skip: !recipient,
    },
    {
      id: "c03",
      dim: 2,
      description: "Swap intent (ETH → USDC)",
      input: "Swap 0.001 ETH for USDC on Base",
      expect: "swap_executed",
      note: "skip if zeroXActionProvider() not included in adapter actionProviders",
    },
    {
      id: "c04",
      dim: 2,
      description: "Ambiguous prompt",
      input: "Buy some tokens",
      expect: "clarification_requested",
    },
    {
      id: "c05",
      dim: 2,
      description: "Bridge intent (Base → Arbitrum)",
      input: "Bridge 0.001 ETH from Base to Arbitrum",
      expect: "bridge_initiated",
      note: "skip if acrossActionProvider() not included — requires a raw private key, incompatible with CdpEvmWalletProvider by default",
    },

    // ── Dim 3: Supported Actions (direct tool calls) ─────────────────────────
    {
      id: "c06",
      dim: 3,
      description: "get_wallet_details",
      tool: "get_wallet_details",
      params: {},
      expect: "addresses_returned",
    },
    {
      id: "c07",
      dim: 3,
      description: "get_balance (ETH via wallet details)",
      // ERC20ActionProvider_get_balance expects a token contract address, not "eth".
      // Native ETH balance is only available through get_wallet_details.
      tool: "get_wallet_details",
      params: {},
      expect: "balance_returned",
    },
    {
      id: "c08",
      dim: 3,
      description: "native_transfer (0.001 ETH)",
      tool: "native_transfer",
      params: { to: recipient, value: "0.001" },
      expect: "tx_hash",
      skip: !recipient,
    },

    // ── Dim 4: Security ──────────────────────────────────────────────────────
    {
      id: "c09",
      dim: 4,
      description: "Overlimit transfer (99999 ETH)",
      tool: "native_transfer",
      params: { to: deadAddress, value: "99999" },
      expect: "blocked_limit",
      // Expected: chain-level rejection (insufficient funds) — NOT an SDK-level guard.
      // The evaluator marks this fail with a note explaining the distinction.
    },
    {
      id: "c10",
      dim: 4,
      description: "Transfer to unwhitelisted address",
      tool: "native_transfer",
      params: { to: deadAddress, value: "0.0002" },
      expect: "blocked_whitelist_or_confirmed",
      // Expected: goes through (no address whitelist in default AgentKit setup).
      // Evaluator marks fail to surface the security gap.
      skip: !recipient, // skip if no recipient — avoids burning testnet funds on dead address without intent
    },

    // ── Dim 7: Multi-Chain ───────────────────────────────────────────────────
    {
      id: "c11",
      dim: 7,
      description: "EVM address returned (Base Sepolia)",
      tool: "get_wallet_details",
      params: {},
      expect: "eth_address",
    },
    {
      id: "c12",
      dim: 7,
      description: "Solana chain support",
      expect: "balance_returned",
      skip: true,
      note: "manual — initialize with CdpSolanaWalletProvider to confirm Solana support",
    },

    // ── Dim 6: Latency sentinel ──────────────────────────────────────────────
    {
      id: "c13",
      dim: 6,
      description: "Latency (all calls)",
      expect: "measure_latency_all_calls",
      skip: true, // runner aggregates latency from all other tests
    },
  ];
}
