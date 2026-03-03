import type { TestCase } from "../../types/test-case.js";

/**
 * HeyElsa — x402 REST API test suite (h01–h13).
 * Run via: npm run test heyelsa
 *
 * Prerequisites:
 *   HEYELSA_PRIVATE_KEY=0x...  (wallet that pays x402 fees; needs USDC on Base)
 *   HEYELSA_WALLET_ADDRESS=0x... (optional; defaults to address derived from private key)
 *   BASE_RPC_URL=...            (optional; defaults to https://mainnet.base.org)
 *
 * Estimated cost per run: ~$0.20 USDC (all execution tests use dry_run: true)
 *
 * Dims NOT automated (manual via web UI at https://app.heyelsa.ai):
 *   Dim 1 (Onboarding), Dim 2 (NLU), Dim 5 (Architecture), Dim 8 (Business Model)
 *
 * NOTE: params.wallet_address="" is resolved at runtime by HeyElsaAdapter.callTool()
 * to the wallet address derived from HEYELSA_PRIVATE_KEY (or HEYELSA_WALLET_ADDRESS
 * if explicitly set).
 */
export function getHeyElsaTestCases(): TestCase[] {
  // wallet_address resolved in adapter.callTool() when left empty
  const wallet = process.env.HEYELSA_WALLET_ADDRESS ?? "";

  return [
    // ── Dim 3: Supported Actions ──────────────────────────────────────────────
    {
      id: "h01",
      dim: 3,
      description: "Health check (free endpoint)",
      tool: "health",
      params: {},
      expect: "data_returned",
    },
    {
      id: "h02",
      dim: 3,
      description: "Token price — ETH on Base",
      // ETH native address on Base
      tool: "get_token_price",
      params: { token_address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", chain: "base" },
      expect: "data_returned",
      note: "cost $0.002",
    },
    {
      id: "h03",
      dim: 3,
      description: "Gas prices — Base",
      tool: "get_gas_prices",
      params: { chain: "base" },
      expect: "data_returned",
      note: "cost $0.001",
    },
    {
      id: "h04",
      dim: 3,
      description: "Token balances across chains",
      tool: "get_balances",
      params: { wallet_address: wallet },
      expect: "balance_returned",
      note: "cost $0.005",
    },
    {
      id: "h05",
      dim: 3,
      description: "Staking positions",
      tool: "get_stake_balances",
      params: { wallet_address: wallet },
      expect: "data_returned",
      note: "cost $0.005 — empty array is valid (new wallet); checks endpoint responds",
    },
    {
      id: "h06",
      dim: 3,
      description: "Transaction history (limit 10)",
      tool: "get_transaction_history",
      params: { wallet_address: wallet, limit: 10 },
      expect: "data_returned",
      note: "cost $0.003",
    },
    {
      id: "h07",
      dim: 3,
      description: "Swap quote — USDC → ETH on Base",
      tool: "get_swap_quote",
      params: {
        from_chain: "base",
        from_token: "USDC",
        from_amount: "1",
        to_chain: "base",
        to_token: "ETH",
        wallet_address: wallet,
        slippage: 0.5,
      },
      expect: "swap_executed",
      note: "cost $0.01 — wallet holds USDC; expect route + output_amount in response",
    },
    {
      id: "h08",
      dim: 3,
      description: "Execute swap dry_run — USDC → ETH on Base",
      tool: "execute_swap",
      params: {
        from_chain: "base",
        from_token: "USDC",
        from_amount: "1",
        to_chain: "base",
        to_token: "ETH",
        wallet_address: wallet,
        slippage: 0.5,
        dry_run: true,
      },
      expect: "dry_run_executed",
      note: "cost $0.10 — wallet holds USDC; confirms execution endpoint; no real swap",
    },
    {
      id: "h09",
      dim: 3,
      description: "Yield suggestions",
      tool: "get_yield_suggestions",
      params: { wallet_address: wallet },
      expect: "data_returned",
      note: "cost $0.02",
    },

    // ── Dim 4: Security ───────────────────────────────────────────────────────
    {
      id: "h10",
      dim: 4,
      description: "Overlimit swap quote (99999 ETH)",
      tool: "get_swap_quote",
      params: {
        from_chain: "base",
        from_token: "ETH",
        from_amount: "99999",
        to_chain: "base",
        to_token: "USDC",
        wallet_address: wallet,
        slippage: 0.5,
      },
      expect: "blocked_limit",
      note: "cost $0.01 — pass if API rejects; fail if it returns a quote (no validation)",
    },
    {
      id: "h11",
      dim: 4,
      description: "Wallet risk analysis",
      tool: "analyze_wallet",
      params: { wallet_address: wallet },
      expect: "data_returned",
      note: "cost $0.02 — check for risk_score in response; informs Dim 4 scoring",
    },

    // ── Dim 7: Multi-Chain ────────────────────────────────────────────────────
    {
      id: "h12",
      dim: 7,
      description: "Portfolio across chains",
      tool: "get_portfolio",
      params: { wallet_address: wallet },
      expect: "data_returned",
      note: "cost $0.01 — confirm multi-chain portfolio data returned",
    },
    {
      id: "h13",
      dim: 7,
      description: "Multi-chain address presence in portfolio",
      tool: "get_portfolio",
      params: { wallet_address: wallet },
      expect: "eth_address",
      note: "cost $0.01 — confirm EVM address + chain names visible in response",
    },

    // ── Dim 6: Latency sentinel ───────────────────────────────────────────────
    {
      id: "h14",
      dim: 6,
      description: "Latency (all calls)",
      expect: "measure_latency_all_calls",
      skip: true, // runner aggregates latency from all other tests
    },
  ];
}
