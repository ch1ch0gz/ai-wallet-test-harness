import type { WalletAdapter } from "../base-adapter.js";
import type {
  ToolDefinition,
  ToolCallResult,
  NLUResult,
} from "../../types/adapter.js";
import type { TestCase } from "../../types/test-case.js";
import type { TestResult } from "../../types/result.js";

/**
 * Warden Protocol (wardenprotocol.org) — stub adapter.
 *
 * This adapter does NOT run through TestRunner. All test results are recorded
 * manually to: test-harness/results/warden/research-notes.md
 *
 * The class exists solely so the codebase maintains a consistent structural
 * pattern across all 8 competitors. Warden has no confirmed public REST API
 * for end-user wallet operations; evaluation mirrors real user experience via
 * the web app and AI Trading Terminal.
 *
 * Competitor details:
 *   Product:  Warden Protocol — agentic wallet + Layer 1 blockchain
 *   Creator:  Warden Protocol team
 *   Access:   app.wardenprotocol.org (main chat + Agent Hub + AI Trading Terminal)
 *   Stack:    Privy embedded smart accounts (ERC-4337 + delegated access for agents);
 *             agents transact on behalf of users with configurable Privy policies.
 *             This is the most capable custody architecture in the cohort —
 *             distinct from plain Privy embedded wallets (AskGina: no delegated access)
 *             and Privy MPC (Pigeon: no key export) and Privy embedded with key export (Bankr).
 *   Chain:    Cosmos SDK L1 (WardenChain), EVM-compatible; execution on ETH, Base, BNB, Solana,
 *             Arbitrum + native WardenChain (6 chains total)
 *   Token:    WARD — governance, staking, tx fees on WardenChain, agent publishing fees,
 *             subscriptions; ERC-20 on Base, BEP-20 on BNB Chain, native on WardenChain;
 *             launched Feb 4, 2026
 *   MCP:      No confirmed MCP server for the crypto product (a PHP warden-mcp-server exists
 *             but is unrelated — third-party, not official Warden)
 *   REST API: No confirmed public REST API for end-user wallet operations
 *
 * Key architectural features (unique in cohort):
 *   - Open-source L1 monorepo: github.com/warden-protocol/wardenprotocol (Cosmos SDK + EVM)
 *   - Agent Hub: decentralized marketplace of AI agents; users pick from a catalog
 *     (OpenClaw, Moltbot, Clawdbot compatible) rather than interacting with a single fixed AI
 *   - Warden Studio: deploy and monetize agents in < 1 min; per-inference or subscription pricing;
 *     framework-agnostic (OpenClaw, Moltbot, Clawdbot); NOTE: Studio lets developers build agents
 *     that run ON Warden — it does NOT let external developers wire Warden as a wallet tool
 *     inside their own agent. That's the missing capability that caps Dim 5 at 3/5.
 *   - SPEx (Statistical Proof of Execution): verifiability layer for AI model integrity — unique
 *     in cohort; ensures AI model integrity on-chain; may surface during transfers/security tests
 *   - AI Trading Terminal: perps + tokenized stocks via Messari Signals (unique in cohort)
 *   - BetFlix: "Swipe-to-Trade" gamification interface
 *   - PUMPs rewards → convertible to WARD; gamified user retention
 *
 * Key distinctions from Bankr (nearest competitor):
 *   - Warden has tokenized stocks + perps via Messari; Bankr has DCA/TWAP + token launch
 *   - Warden is VC-backed ($4M at $200M valuation, Jan 2026) + open-source L1;
 *     Bankr is bootstrapped + closed source
 *   - Warden: 20M users, 60M+ agentic tasks (company-reported, unverified independently);
 *     Bankr: undisclosed (much smaller) user base
 *   - Warden has no confirmed DCA/TWAP; Bankr confirmed DCA working
 *   - Warden adds WardenChain as native chain; Bankr uses existing chains only
 *   - Neither has an MCP server; Bankr has a public REST Agent API; Warden does not
 */
export class WardenAdapter implements WalletAdapter {
  readonly name = "Warden Protocol";
  readonly network = "warden-mainnet"; // WardenChain is native; EVM + Solana for execution

  // ── Static tool manifest ──────────────────────────────────────────────────
  // Inferred from product documentation, app.wardenprotocol.org, and public announcements.
  private static readonly TOOLS: ToolDefinition[] = [
    {
      name: "get_balance",
      description: "Returns wallet balances across all supported chains.",
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
          chain: { type: "string", description: "Chain to swap on (e.g. 'base', 'ethereum')" },
        },
        required: ["from_token", "to_token", "amount"],
      },
    },
    {
      name: "cross_chain_swap",
      description: "Bridges and swaps assets cross-chain (may route through WardenChain as settlement layer).",
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
      name: "discover_agents",
      description: "Lists available AI agents in the Agent Hub marketplace (OpenClaw, Moltbot, Clawdbot compatible).",
      inputSchema: {
        type: "object",
        properties: {
          category: { type: "string", description: "Agent category filter (e.g. 'trading', 'yield', 'analytics')" },
        },
        required: [],
      },
    },
    {
      name: "leveraged_trade",
      description: "Opens a leveraged long/short perpetual position via the AI Trading Terminal.",
      inputSchema: {
        type: "object",
        properties: {
          asset: { type: "string", description: "Asset symbol (e.g. 'ETH', 'BTC')" },
          direction: { type: "string", enum: ["long", "short"], description: "Position direction" },
          leverage: { type: "number", description: "Leverage multiplier (e.g. 2)" },
          size_usd: { type: "number", description: "Position size in USD" },
        },
        required: ["asset", "direction", "leverage", "size_usd"],
      },
    },
    {
      name: "trade_tokenized_asset",
      description: "Buys or sells a tokenized real-world asset (e.g. AAPL, TSLA) via Messari Signals. UNIQUE IN COHORT.",
      inputSchema: {
        type: "object",
        properties: {
          asset: { type: "string", description: "Asset ticker (e.g. 'AAPL', 'TSLA')" },
          direction: { type: "string", enum: ["buy", "sell"], description: "Trade direction" },
          amount_usd: { type: "number", description: "Amount in USD" },
        },
        required: ["asset", "direction", "amount_usd"],
      },
    },
  ];

  // ── WalletAdapter interface ───────────────────────────────────────────────

  async initialize(): Promise<void> {
    throw new Error(
      [
        "WardenAdapter: automated testing is not supported.",
        "",
        "Warden Protocol is evaluated manually via the web app.",
        "  Main app (chat + Agent Hub): https://app.wardenprotocol.org",
        "  AI Trading Terminal:          https://app.wardenprotocol.org/trade",
        "  Agent Hub (direct):           https://app.wardenprotocol.org/agent-hub",
        "",
        "Wallet: Privy embedded smart accounts (ERC-4337 + delegated access).",
        "Sign up with email or social — no seed phrase. Check settings for key export",
        "(smart account key export behavior differs from plain Privy embedded wallets).",
        "",
        "Fund the Privy smart account with ~0.002 ETH on Base or Ethereum mainnet",
        "for transfer/swap asset amounts.",
        "",
        "WARD token:",
        "  Some features (AI Trading Terminal, Agent Hub subscriptions) may require WARD.",
        "  Acquire WARD via Coinbase or via the in-app swap (swap any supported token → WARD on Base).",
        "  Check whether a minimum WARD stake is required before accessing /trade.",
        "",
        "Record all results in:",
        "  test-harness/results/warden/research-notes.md",
      ].join("\n")
    );
  }

  async cleanup(): Promise<void> {
    // No-op — nothing to tear down for a manual-only adapter.
  }

  async listTools(): Promise<ToolDefinition[]> {
    // Returns the static tool manifest; does not require initialization.
    return WardenAdapter.TOOLS;
  }

  async callTool(
    _toolName: string,
    _params: Record<string, unknown>
  ): Promise<ToolCallResult> {
    throw new Error(
      "WardenAdapter: callTool is not supported. " +
        "Send commands manually via app.wardenprotocol.org and record results in research-notes.md."
    );
  }

  async runNLU(_prompt: string): Promise<NLUResult> {
    throw new Error(
      "WardenAdapter: runNLU is not supported. " +
        "Send prompts manually via app.wardenprotocol.org and record responses in research-notes.md."
    );
  }

  evaluateTestCase(
    tc: TestCase,
    _result: ToolCallResult | NLUResult | null,
    latencyMs: number
  ): TestResult {
    // All Warden test cases are manually evaluated.
    return {
      id: tc.id,
      dim: tc.dim,
      description: tc.description ?? tc.input,
      expectedOutcome: tc.expect,
      latencyMs,
      status: "manual",
      notes: "Record result in test-harness/results/warden/research-notes.md",
    };
  }
}
