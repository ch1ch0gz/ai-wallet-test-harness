import type { WalletAdapter } from "../base-adapter.js";
import type {
  ToolDefinition,
  ToolCallResult,
  NLUResult,
} from "../../types/adapter.js";
import type { TestCase } from "../../types/test-case.js";
import type { TestResult } from "../../types/result.js";

/**
 * AskGina (askgina.ai) — stub adapter.
 *
 * This adapter does NOT run through TestRunner. All test results are recorded
 * manually to: test-harness/results/askgina/research-notes.md
 *
 * The class exists solely so the codebase maintains a consistent structural
 * pattern across all 7 competitors. AskGina has no public REST API, no SDK, and
 * no MCP server (confirmed absent from mcp.so, mcpservers.org, pulsemcp.com) —
 * it is accessed exclusively via the web app at askgina.ai and via Farcaster.
 *
 * Key architectural differentiators vs. Pigeon (both use Privy):
 *   - AskGina uses Privy with optional user key export (user can recover full
 *     private key on demand); Pigeon uses Privy MPC with NO key export.
 *   - AskGina uses Biconomy MEE for supertransactions: atomic multi-step
 *     execution (e.g. swap → bridge → swap) under a single signature with
 *     pre-simulation guardrails (balance checks, slippage bounds, failure thresholds).
 *   - AskGina uses Zerion API for portfolio data and P&L (same as Pigeon).
 *
 * Competitor details:
 *   Product:  askgina.ai
 *   Creator:  Sid Shekhar (ex-Coinbase research lead; TokenAnalyst co-founder, acq. by Coinbase)
 *   Access:   Web app (askgina.ai); Farcaster (X/Telegram expansion planned)
 *   Stack:    Privy with user key export (EVM + Solana) + Zerion API + Biconomy MEE
 *   Network:  Base mainnet (primary EVM); 12+ EVM chains + Solana
 *   Cost:     Gas-sponsored for EVM txs < $5 USD; no subscription fee; GINA token credits
 *   MCP:      None — confirmed absent from all major MCP registries
 *   Volume:   8K+ swaps, 700+ tokens, $3M+ on-chain volume (as of March 2025)
 */
export class AskGinaAdapter implements WalletAdapter {
  readonly name = "AskGina";
  readonly network = "base-mainnet"; // mainnet only; gas-sponsored for txs < $5 USD

  // ── Static tool manifest ──────────────────────────────────────────────────
  // Inferred from product documentation and public announcements.
  private static readonly TOOLS: ToolDefinition[] = [
    {
      name: "get_balance",
      description: "Returns wallet balances across all supported chains via Zerion API.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    {
      name: "swap",
      description: "Executes a token swap on a supported EVM chain or Solana.",
      inputSchema: {
        type: "object",
        properties: {
          from_token: { type: "string", description: "Token to sell (symbol or address)" },
          to_token: { type: "string", description: "Token to buy (symbol or address)" },
          amount: { type: "string", description: "Amount to swap" },
          chain: { type: "string", description: "Chain to swap on (e.g. 'base', 'arbitrum')" },
        },
        required: ["from_token", "to_token", "amount"],
      },
    },
    {
      name: "bridge",
      description: "Bridges assets cross-chain.",
      inputSchema: {
        type: "object",
        properties: {
          token: { type: "string", description: "Token to bridge" },
          amount: { type: "string", description: "Amount to bridge" },
          from_chain: { type: "string", description: "Source chain" },
          to_chain: { type: "string", description: "Destination chain" },
        },
        required: ["token", "amount", "from_chain", "to_chain"],
      },
    },
    {
      name: "transfer",
      description: "Transfers tokens to a specified address.",
      inputSchema: {
        type: "object",
        properties: {
          token: { type: "string", description: "Token symbol or address" },
          amount: { type: "string", description: "Amount to transfer" },
          to_address: { type: "string", description: "Recipient wallet address" },
          chain: { type: "string", description: "Chain for the transfer" },
        },
        required: ["token", "amount", "to_address"],
      },
    },
    {
      name: "get_portfolio",
      description: "Returns portfolio breakdown including P&L and performance via Zerion API.",
      inputSchema: {
        type: "object",
        properties: {
          period_days: { type: "number", description: "Number of days for P&L calculation (e.g. 7)" },
        },
        required: [],
      },
    },
    {
      name: "create_recipe",
      description:
        "Creates a scheduled or conditional automation (recipe) for recurring actions such as DCA or alerts.",
      inputSchema: {
        type: "object",
        properties: {
          description: { type: "string", description: "Natural-language description of the automation" },
        },
        required: ["description"],
      },
    },
  ];

  // ── WalletAdapter interface ───────────────────────────────────────────────

  async initialize(): Promise<void> {
    throw new Error(
      [
        "AskGinaAdapter: automated testing is not supported.",
        "",
        "AskGina has no public REST API, SDK, or MCP server.",
        "Testing requires using the web app directly:",
        "  Web:      https://askgina.ai",
        "  Farcaster: @askgina",
        "",
        "Wallet provisioning is handled by Privy with optional user key export.",
        "Gas is sponsored for EVM transactions under $5 USD.",
        "Fund the Privy wallet with ~0.002 ETH on Base mainnet for transfer/swap tests.",
        "",
        "Record all results in:",
        "  test-harness/results/askgina/research-notes.md",
      ].join("\n")
    );
  }

  async cleanup(): Promise<void> {
    // No-op — nothing to tear down for a manual-only adapter.
  }

  async listTools(): Promise<ToolDefinition[]> {
    // Returns the static tool manifest; does not require initialization.
    return AskGinaAdapter.TOOLS;
  }

  async callTool(
    _toolName: string,
    _params: Record<string, unknown>
  ): Promise<ToolCallResult> {
    throw new Error(
      "AskGinaAdapter: callTool is not supported. " +
        "Send commands manually via askgina.ai and record results in research-notes.md."
    );
  }

  async runNLU(_prompt: string): Promise<NLUResult> {
    throw new Error(
      "AskGinaAdapter: runNLU is not supported. " +
        "Send prompts manually via askgina.ai and record responses in research-notes.md."
    );
  }

  evaluateTestCase(
    tc: TestCase,
    _result: ToolCallResult | NLUResult | null,
    latencyMs: number
  ): TestResult {
    // All AskGina test cases are manually evaluated.
    return {
      id: tc.id,
      dim: tc.dim,
      description: tc.description ?? tc.input,
      expectedOutcome: tc.expect,
      latencyMs,
      status: "manual",
      notes: "Record result in test-harness/results/askgina/research-notes.md",
    };
  }
}
