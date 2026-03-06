import type { WalletAdapter } from "../base-adapter.js";
import type {
  ToolDefinition,
  ToolCallResult,
  NLUResult,
} from "../../types/adapter.js";
import type { TestCase } from "../../types/test-case.js";
import type { TestResult } from "../../types/result.js";

/**
 * Bankr.bot (bankr.bot) — stub adapter.
 *
 * This adapter does NOT run through TestRunner. All test results are recorded
 * manually to: test-harness/results/bankr/research-notes.md
 *
 * The class exists solely so the codebase maintains a consistent structural
 * pattern across all 7 competitors. Bankr's API requires sign-up and API key
 * provisioning; evaluation mirrors real user experience via Terminal.
 *
 * Competitor details:
 *   Product:  bankr.bot — AI trading assistant
 *   Creator:  Bankr team
 *   Access:   terminal.bankr.bot (browser), X/Twitter (@bankrbot), Farcaster
 *   Stack:    Privy embedded wallets (key export available — self-custodial, not MPC);
 *             LiFi for bridging; Uniswap/aggregators for swap; Avantis for leverage;
 *             Polymarket integration; NFT mint/buy/transfer
 *   Network:  Base (primary), Ethereum, Polygon, Unichain, Solana (5 chains)
 *   Gas:      Sponsored on Base, Polygon, and Unichain; NOT on Ethereum mainnet
 *   Cost:     Free tier — 10 msgs/day; Bankr Club — $20/month in BNKR (unlimited)
 *   Token:    BNKR (ERC-20 on Base) — 0.8% transaction fee revenue share with stakers;
 *             listed on Coinbase and Gate.io
 *   REST API: POST https://api.bankr.bot/agent/prompt → { jobId };
 *             GET /agent/job/{jobId} → poll for result;
 *             X-API-Key auth; 100 msgs/day free tier, 1000/day Club
 *   MCP:      No MCP server confirmed absent from mcp.so, mcpservers.org, pulsemcp.com,
 *             smithery.ai
 *   Skills:   github.com/BankrBot/openclaw-skills — 15+ pre-built community skills;
 *             NOT a Bankr MCP server (different paradigm — extends Bankr's own runtime)
 *
 * Key distinction from AskGina:
 *   AskGina uses Privy MPC with NO key export. Bankr uses Privy embedded wallets
 *   WITH user key export — making it effectively self-custodial on demand.
 *
 * Key distinction from Pigeon:
 *   Pigeon uses Privy MPC with no key export. Bankr exposes the private key via
 *   Privy's export flow — users own the key.
 */
export class BankrAdapter implements WalletAdapter {
  readonly name = "Bankr";
  readonly network = "base-mainnet"; // primary EVM chain; gas sponsored on Base, Polygon, Unichain

  // ── Static tool manifest ──────────────────────────────────────────────────
  // Inferred from product documentation, terminal.bankr.bot, and public announcements.
  private static readonly TOOLS: ToolDefinition[] = [
    {
      name: "get_balance",
      description: "Returns wallet balances across all supported chains.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    {
      name: "swap",
      description: "Executes a token swap on a supported chain via aggregator.",
      inputSchema: {
        type: "object",
        properties: {
          from_token: { type: "string", description: "Token to sell (symbol or address)" },
          to_token: { type: "string", description: "Token to buy (symbol or address)" },
          amount: { type: "string", description: "Amount to swap" },
          chain: { type: "string", description: "Chain to swap on (e.g. 'base', 'polygon')" },
        },
        required: ["from_token", "to_token", "amount"],
      },
    },
    {
      name: "cross_chain_swap",
      description: "Bridges and swaps assets cross-chain via LiFi (EVM-only).",
      inputSchema: {
        type: "object",
        properties: {
          from_token: { type: "string", description: "Token to send" },
          to_token: { type: "string", description: "Token to receive" },
          amount: { type: "string", description: "Amount to bridge/swap" },
          from_chain: { type: "string", description: "Source chain" },
          to_chain: { type: "string", description: "Destination chain" },
        },
        required: ["from_token", "to_token", "amount", "from_chain", "to_chain"],
      },
    },
    {
      name: "transfer",
      description: "Sends tokens to a recipient address.",
      inputSchema: {
        type: "object",
        properties: {
          token: { type: "string", description: "Token to send (symbol or address)" },
          amount: { type: "string", description: "Amount to send" },
          to: { type: "string", description: "Recipient address" },
          chain: { type: "string", description: "Chain to send on" },
        },
        required: ["token", "amount", "to"],
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
    {
      name: "create_dca",
      description: "Creates a Dollar-Cost Averaging order (recurring buy at interval).",
      inputSchema: {
        type: "object",
        properties: {
          token: { type: "string", description: "Token to buy (symbol or address)" },
          amount_usd: { type: "number", description: "Amount in USD per interval" },
          interval: { type: "string", description: "Interval (e.g. 'daily', 'weekly')" },
          chain: { type: "string", description: "Chain to execute DCA on" },
        },
        required: ["token", "amount_usd", "interval"],
      },
    },
    {
      name: "launch_token",
      description: "Deploys a new ERC-20 token on Base mainnet (irreversible).",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Token name (e.g. 'NETHTEST')" },
          symbol: { type: "string", description: "Token symbol (e.g. 'NTH')" },
          supply: { type: "number", description: "Total supply (optional — Bankr may set a default)" },
        },
        required: ["name", "symbol"],
      },
    },
    {
      name: "leveraged_trade",
      description: "Opens a leveraged long/short position on Avantis (Base mainnet only).",
      inputSchema: {
        type: "object",
        properties: {
          asset: { type: "string", description: "Asset symbol (e.g. 'ETH', 'BTC')" },
          direction: { type: "string", enum: ["long", "short"], description: "Position direction" },
          leverage: { type: "number", description: "Leverage multiplier (e.g. 2)" },
          size_usd: { type: "number", description: "Position size in USD (check Avantis minimum ~$20–50)" },
        },
        required: ["asset", "direction", "leverage", "size_usd"],
      },
    },
  ];

  // ── WalletAdapter interface ───────────────────────────────────────────────

  async initialize(): Promise<void> {
    throw new Error(
      [
        "BankrAdapter: automated testing is not supported.",
        "",
        "Bankr is evaluated manually via the Terminal web app.",
        "  Terminal: https://terminal.bankr.bot",
        "  X/Twitter: @bankrbot",
        "  Farcaster: @bankr",
        "",
        "⚠️  FREE TIER LIMIT: 10 messages/day.",
        "With 14 tests you WILL hit the limit mid-session.",
        "Upgrade to Bankr Club ($20/month in BNKR) or obtain an API key before starting.",
        "",
        "Wallet: Privy embedded wallet with user key export (self-custodial on demand).",
        "Gas:    Sponsored on Base, Polygon, Unichain. NOT sponsored on Ethereum mainnet.",
        "Fund the Privy wallet with ~0.001–0.002 ETH on Base mainnet",
        "for transfer/swap asset amounts (gas is covered).",
        "",
        "Record all results in:",
        "  test-harness/results/bankr/research-notes.md",
      ].join("\n")
    );
  }

  async cleanup(): Promise<void> {
    // No-op — nothing to tear down for a manual-only adapter.
  }

  async listTools(): Promise<ToolDefinition[]> {
    // Returns the static tool manifest; does not require initialization.
    return BankrAdapter.TOOLS;
  }

  async callTool(
    _toolName: string,
    _params: Record<string, unknown>
  ): Promise<ToolCallResult> {
    throw new Error(
      "BankrAdapter: callTool is not supported. " +
        "Send commands manually via terminal.bankr.bot and record results in research-notes.md."
    );
  }

  async runNLU(_prompt: string): Promise<NLUResult> {
    throw new Error(
      "BankrAdapter: runNLU is not supported. " +
        "Send prompts manually via terminal.bankr.bot and record responses in research-notes.md."
    );
  }

  evaluateTestCase(
    tc: TestCase,
    _result: ToolCallResult | NLUResult | null,
    latencyMs: number
  ): TestResult {
    // All Bankr test cases are manually evaluated.
    return {
      id: tc.id,
      dim: tc.dim,
      description: tc.description ?? tc.input,
      expectedOutcome: tc.expect,
      latencyMs,
      status: "manual",
      notes: "Record result in test-harness/results/bankr/research-notes.md",
    };
  }
}
