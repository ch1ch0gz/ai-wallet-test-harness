export type ExpectKey =
  | "balance_returned"
  | "transfer_executed"
  | "swap_executed"
  | "clarification_requested"
  | "addresses_returned"
  | "tx_hash"
  | "blocked_limit"
  | "blocked_whitelist_or_confirmed"
  | "eth_address"
  | "measure_latency_all_calls"
  // MetaMask-specific keys
  | "swap_unsupported_or_hallucinated"
  | "no_app_guard_fires"
  | "single_chain_only";

export interface TestCase {
  /** Unique test ID, e.g. "p01" */
  id: string;
  /** Evaluation dimension (1–8) */
  dim: number;
  /** Human-readable label shown in the terminal */
  description?: string;
  /** For NLU tests (Dim 2): the natural-language prompt to send Claude */
  input?: string;
  /** For direct tool tests (Dim 3, 4, 7): the MCP tool name to call */
  tool?: string;
  /** Parameters for the tool call */
  params?: Record<string, unknown>;
  /** Expected outcome key used by the adapter evaluator */
  expect: ExpectKey;
  /** Free-form note, e.g. "measure_latency_all_calls" */
  note?: string;
  /** If true, the test runner skips this case entirely */
  skip?: boolean;
}
