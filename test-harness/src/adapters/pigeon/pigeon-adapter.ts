import type { WalletAdapter } from "../base-adapter.js";
import type {
  ToolDefinition,
  ToolCallResult,
  NLUResult,
} from "../../types/adapter.js";
import type { TestCase } from "../../types/test-case.js";
import type { TestResult } from "../../types/result.js";

/**
 * Pigeon (pigeon.trade, by BigWhaleLabs) — stub adapter.
 *
 * This adapter does NOT run through TestRunner. All test results are recorded
 * manually to: test-harness/results/pigeon/research-notes.md
 *
 * The class exists solely so the codebase maintains a consistent structural
 * pattern across all 7 competitors. Pigeon has no public API, no SDK, and no
 * public MCP server — it is accessed exclusively via messaging platforms (Telegram
 * is primary). Privy manages keys; automation is not feasible.
 *
 * Competitor details:
 *   Product: pigeon.trade
 *   Creator: BigWhaleLabs / Jason Kim (YC alum)
 *   Access:  Telegram @PigeonTradeBot (also Discord, Farcaster, WhatsApp, SMS, +7 channels)
 *   Stack:   Privy wallets (EVM + Solana + Bitcoin) + Zerion API (multi-chain read)
 *   Network: Base mainnet (primary), Arbitrum, Polygon, Solana, Hyperliquid, +more
 *   Cost:    Free (beta) — no subscription, no token, no disclosed transaction fee
 *   MCP:     pigeon-mcp announced by founder but repo is private as of 2026-03-03
 */
export class PigeonAdapter implements WalletAdapter {
  readonly name = "Pigeon";
  readonly network = "base-mainnet"; // mainnet only, no testnet

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
      description: "Executes a token swap on a supported chain.",
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
      description: "Bridges assets cross-chain via an integrated bridge aggregator.",
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
      name: "get_perp_quote",
      description: "Gets a perpetuals quote on Hyperliquid (ETH, BTC, SOL, etc.).",
      inputSchema: {
        type: "object",
        properties: {
          asset: { type: "string", description: "Asset symbol (e.g. 'ETH')" },
          direction: { type: "string", enum: ["long", "short"], description: "Position direction" },
          leverage: { type: "number", description: "Leverage multiplier (e.g. 2)" },
          size_usd: { type: "number", description: "Position size in USD" },
        },
        required: ["asset", "direction", "leverage", "size_usd"],
      },
    },
    {
      name: "copy_trade",
      description: "Subscribes to copy trade signals from a target wallet address.",
      inputSchema: {
        type: "object",
        properties: {
          wallet_address: { type: "string", description: "Wallet address to copy-trade" },
          max_size_usd: { type: "number", description: "Max USD per copied trade (optional)" },
        },
        required: ["wallet_address"],
      },
    },
    {
      name: "get_portfolio",
      description: "Returns portfolio breakdown including P&L, positions, and performance over time.",
      inputSchema: {
        type: "object",
        properties: {
          period_days: { type: "number", description: "Number of days for P&L calculation (e.g. 7)" },
        },
        required: [],
      },
    },
  ];

  // ── WalletAdapter interface ───────────────────────────────────────────────

  async initialize(): Promise<void> {
    throw new Error(
      [
        "PigeonAdapter: automated testing is not supported.",
        "",
        "Pigeon has no public API or SDK. Testing requires messaging the bot directly:",
        "  Telegram: DM @PigeonTradeBot (or t.me/PigeonTradeBot)",
        "  Discord:  Join the Pigeon server and use the bot",
        "  Farcaster: Cast to @pigeon",
        "",
        "Wallet provisioning is handled by Privy — no seed phrase, no key export needed.",
        "Fund the Privy wallet with ~$5 ETH on Base mainnet for transfer/swap tests.",
        "",
        "Record all results in:",
        "  test-harness/results/pigeon/research-notes.md",
      ].join("\n")
    );
  }

  async cleanup(): Promise<void> {
    // No-op — nothing to tear down for a manual-only adapter.
  }

  async listTools(): Promise<ToolDefinition[]> {
    // Returns the static tool manifest; does not require initialization.
    return PigeonAdapter.TOOLS;
  }

  async callTool(
    _toolName: string,
    _params: Record<string, unknown>
  ): Promise<ToolCallResult> {
    throw new Error(
      "PigeonAdapter: callTool is not supported. " +
        "Send commands manually via Telegram (@PigeonTradeBot) and record results in research-notes.md."
    );
  }

  async runNLU(_prompt: string): Promise<NLUResult> {
    throw new Error(
      "PigeonAdapter: runNLU is not supported. " +
        "Send prompts manually via Telegram (@PigeonTradeBot) and record responses in research-notes.md."
    );
  }

  evaluateTestCase(
    tc: TestCase,
    _result: ToolCallResult | NLUResult | null,
    latencyMs: number
  ): TestResult {
    // All Pigeon test cases are manually evaluated.
    return {
      id: tc.id,
      dim: tc.dim,
      description: tc.description ?? tc.input,
      expectedOutcome: tc.expect,
      latencyMs,
      status: "manual",
      notes: "Record result in test-harness/results/pigeon/research-notes.md",
    };
  }
}
