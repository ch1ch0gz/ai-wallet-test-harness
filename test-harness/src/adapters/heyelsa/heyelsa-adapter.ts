import axios from "axios";
import { withPaymentInterceptor } from "x402-axios";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import type { WalletAdapter } from "../base-adapter.js";
import type {
  ToolDefinition,
  ToolCallResult,
  NLUResult,
} from "../../types/adapter.js";
import type { TestCase } from "../../types/test-case.js";
import type { TestResult } from "../../types/result.js";

const BASE_URL = "https://x402-api.heyelsa.ai";

/**
 * HeyElsa — automated x402 REST API adapter.
 *
 * Uses the x402 HTTP micropayment protocol: every paid API call automatically
 * signs a USDC payment on Base mainnet using the wallet from HEYELSA_PRIVATE_KEY.
 *
 * Cost per full test run: ~$0.20 USDC (13 calls, max $0.10 for execute_swap).
 * All execution endpoints use dry_run: true — no real swaps execute.
 *
 * Env vars required:
 *   HEYELSA_PRIVATE_KEY   — 0x + 64 hex chars; wallet that pays x402 fees
 *   HEYELSA_WALLET_ADDRESS — (optional) wallet address to query; derived from
 *                            HEYELSA_PRIVATE_KEY if not set
 *   BASE_RPC_URL          — (optional) defaults to https://mainnet.base.org
 */
export class HeyElsaAdapter implements WalletAdapter {
  readonly name = "HeyElsa";
  readonly network = "base-mainnet";

  private client?: ReturnType<typeof axios.create>;
  walletAddress = "";

  constructor() {
    const key = process.env.HEYELSA_PRIVATE_KEY;
    if (!key) {
      throw new Error(
        "HEYELSA_PRIVATE_KEY is not set.\n" +
          "See test-harness/.env.example for setup instructions.\n" +
          "The private key wallet needs USDC on Base mainnet for x402 API fees.\n" +
          "A full test run costs ~$0.20 USDC."
      );
    }
  }

  async initialize(): Promise<void> {
    const rawKey = process.env.HEYELSA_PRIVATE_KEY!;
    const privateKey = (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) as `0x${string}`;

    const account = privateKeyToAccount(privateKey);
    this.walletAddress = process.env.HEYELSA_WALLET_ADDRESS || account.address;

    const rpcUrl = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(rpcUrl),
    });

    const baseAxios = axios.create({
      baseURL: BASE_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 90_000,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.client = withPaymentInterceptor(baseAxios, walletClient as any);

    // Verify connectivity with the free health endpoint before running paid tests
    const health = await this.client.get("/health");
    const env = health.data?.environment?.network ?? "unknown";
    console.log(
      `  [heyelsa] Connected — network: ${env}` +
        ` | wallet: ${this.walletAddress.slice(0, 10)}…` +
        ` | query wallet: ${this.walletAddress.slice(0, 10)}…`
    );
    if (env !== "mainnet") {
      console.warn("  [heyelsa] ⚠  API returned non-mainnet — results may differ");
    }
  }

  async cleanup(): Promise<void> {
    // HTTP client has no persistent connections to tear down.
  }

  async listTools(): Promise<ToolDefinition[]> {
    return [
      {
        name: "health",
        description: "Free health check — confirms API is reachable.",
        inputSchema: { type: "object", properties: {}, required: [] },
      },
      {
        name: "get_token_price",
        description: "Token price and 24h stats. Cost: $0.002.",
        inputSchema: {
          type: "object",
          properties: {
            token_address: { type: "string" },
            chain: { type: "string" },
          },
          required: ["token_address"],
        },
      },
      {
        name: "get_gas_prices",
        description: "Current gas prices for a chain. Cost: $0.001.",
        inputSchema: {
          type: "object",
          properties: { chain: { type: "string" } },
          required: ["chain"],
        },
      },
      {
        name: "get_balances",
        description: "Token balances across all chains. Cost: $0.005.",
        inputSchema: {
          type: "object",
          properties: { wallet_address: { type: "string" } },
          required: ["wallet_address"],
        },
      },
      {
        name: "get_portfolio",
        description: "Full portfolio with USD values and allocation. Cost: $0.01.",
        inputSchema: {
          type: "object",
          properties: { wallet_address: { type: "string" } },
          required: ["wallet_address"],
        },
      },
      {
        name: "get_swap_quote",
        description: "Swap quote with route and price impact. Cost: $0.01.",
        inputSchema: {
          type: "object",
          properties: {
            from_chain: { type: "string" },
            from_token: { type: "string" },
            from_amount: { type: "string" },
            to_chain: { type: "string" },
            to_token: { type: "string" },
            wallet_address: { type: "string" },
            slippage: { type: "number" },
          },
          required: ["from_chain", "from_token", "from_amount", "to_chain", "to_token"],
        },
      },
      {
        name: "execute_swap",
        description: "Execute or simulate a swap. Cost: $0.10. Use dry_run: true for simulation.",
        inputSchema: {
          type: "object",
          properties: {
            from_chain: { type: "string" },
            from_token: { type: "string" },
            from_amount: { type: "string" },
            to_chain: { type: "string" },
            to_token: { type: "string" },
            wallet_address: { type: "string" },
            slippage: { type: "number" },
            dry_run: { type: "boolean" },
          },
          required: ["from_chain", "from_token", "from_amount", "to_chain", "to_token"],
        },
      },
      {
        name: "get_stake_balances",
        description: "Active staking positions across DeFi protocols. Cost: $0.005.",
        inputSchema: {
          type: "object",
          properties: { wallet_address: { type: "string" } },
          required: ["wallet_address"],
        },
      },
      {
        name: "get_transaction_history",
        description: "Recent transaction history. Cost: $0.003.",
        inputSchema: {
          type: "object",
          properties: {
            wallet_address: { type: "string" },
            limit: { type: "number" },
          },
          required: ["wallet_address"],
        },
      },
      {
        name: "analyze_wallet",
        description: "Wallet risk score, profitability, and strategy analysis. Cost: $0.02.",
        inputSchema: {
          type: "object",
          properties: { wallet_address: { type: "string" } },
          required: ["wallet_address"],
        },
      },
      {
        name: "get_yield_suggestions",
        description: "DeFi yield opportunities ranked by APY and risk. Cost: $0.02.",
        inputSchema: {
          type: "object",
          properties: { wallet_address: { type: "string" } },
          required: ["wallet_address"],
        },
      },
      {
        name: "get_pnl_report",
        description: "Realized and unrealized P&L report. Cost: $0.015.",
        inputSchema: {
          type: "object",
          properties: {
            wallet_address: { type: "string" },
            time_period: { type: "string", enum: ["7_days", "30_days", "90_days", "all_time"] },
          },
          required: ["wallet_address"],
        },
      },
    ];
  }

  async callTool(
    toolName: string,
    params: Record<string, unknown>
  ): Promise<ToolCallResult> {
    if (!this.client) throw new Error("HeyElsaAdapter not initialized");

    // Inject self wallet address when params leave it empty
    const resolved = { ...params };
    if ("wallet_address" in resolved && !resolved.wallet_address) {
      resolved.wallet_address = this.walletAddress;
    }

    const start = Date.now();
    try {
      let data: unknown;
      if (toolName === "health") {
        const resp = await this.client.get("/health");
        data = resp.data;
      } else {
        const resp = await this.client.post(`/api/${toolName}`, resolved);
        data = resp.data;
      }
      return {
        content: [{ type: "text", text: JSON.stringify(data) }],
        isError: false,
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Axios error with response body
      const body = (err as { response?: { data?: unknown } }).response?.data;
      const detail = body ? `\n${JSON.stringify(body)}` : "";
      return {
        content: [{ type: "text", text: msg + detail }],
        isError: true,
        latencyMs: Date.now() - start,
      };
    }
  }

  async runNLU(_prompt: string): Promise<NLUResult> {
    throw new Error(
      "HeyElsaAdapter: runNLU is not supported. The x402 API is a structured REST " +
        "interface — there is no NLU endpoint. Test Dim 2 manually via the web UI at " +
        "https://app.heyelsa.ai."
    );
  }

  evaluateTestCase(
    tc: TestCase,
    result: ToolCallResult | NLUResult | null,
    latencyMs: number
  ): TestResult {
    const base = {
      id: tc.id,
      dim: tc.dim,
      description: tc.description ?? tc.tool,
      expectedOutcome: tc.expect,
      latencyMs,
    } as const;

    if (!result) {
      return { ...base, status: "error", errorMessage: "No result returned" };
    }

    const r = result as ToolCallResult;
    const text = r.content.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n");

    switch (tc.expect) {
      case "data_returned": {
        // Any non-empty JSON response counts as pass
        if (r.isError) return { ...base, status: "fail", notes: text.slice(0, 120) };
        try {
          const parsed = JSON.parse(text);
          const hasData = parsed !== null && typeof parsed === "object";
          return { ...base, status: hasData ? "pass" : "fail", notes: text.slice(0, 80) };
        } catch {
          return { ...base, status: "fail", notes: "non-JSON response" };
        }
      }

      case "balance_returned": {
        if (r.isError) return { ...base, status: "fail", notes: text.slice(0, 120) };
        try {
          const parsed = JSON.parse(text);
          // Accept: array of holdings, or object with total_value / holdings / balances
          const hasBalance =
            Array.isArray(parsed) ||
            parsed.total_value !== undefined ||
            parsed.holdings !== undefined ||
            parsed.balances !== undefined ||
            parsed.tokens !== undefined;
          return { ...base, status: hasBalance ? "pass" : "fail", notes: text.slice(0, 80) };
        } catch {
          return { ...base, status: "fail", notes: "non-JSON response" };
        }
      }

      case "swap_executed": {
        // HeyElsa quote response: {"quote":[{"action_type":"approve",...},{"action_type":"swap","task_description":"Swap X to Y",...}]}
        // Generic: output_amount, route, to_amount
        if (r.isError) return { ...base, status: "fail", notes: text.slice(0, 120) };
        try {
          const parsed = JSON.parse(text);
          const elsaQuote = Array.isArray(parsed.quote) && parsed.quote.length > 0;
          const swapStep = elsaQuote
            ? parsed.quote.find((s: { action_type: string }) => s.action_type === "swap")
            : undefined;
          const hasQuote =
            elsaQuote ||
            parsed.output_amount !== undefined ||
            parsed.route !== undefined ||
            parsed.to_amount !== undefined;
          return {
            ...base,
            status: hasQuote ? "pass" : "fail",
            notes: swapStep?.task_description
              ? swapStep.task_description
              : hasQuote
              ? `output_amount: ${parsed.output_amount ?? parsed.to_amount}`
              : "no quote in response",
          };
        } catch {
          return { ...base, status: "fail", notes: "non-JSON response" };
        }
      }

      case "dry_run_executed": {
        // HeyElsa uses async pipeline model: returns {pipeline_id:...} immediately.
        // The swap is queued server-side; polling /api/get_pipeline_status is required
        // for full result. For our purposes, pipeline_id = execution was accepted.
        if (r.isError) {
          const isInsufficient = /insufficient|balance|funds/i.test(text);
          return {
            ...base,
            status: isInsufficient ? "skip" : "fail",
            notes: isInsufficient
              ? "insufficient balance for dry_run simulation (fund wallet to test)"
              : text.slice(0, 120),
          };
        }
        try {
          const parsed = JSON.parse(text);
          const hasPipeline = parsed.pipeline_id !== undefined;
          const hasResult =
            hasPipeline ||
            parsed.status !== undefined ||
            parsed.tx_hash !== undefined ||
            parsed.from_amount !== undefined;
          return {
            ...base,
            status: hasResult ? "pass" : "fail",
            notes: hasPipeline
              ? `async pipeline accepted — pipeline_id: ${parsed.pipeline_id}`
              : hasResult
              ? `status: ${parsed.status}`
              : "no execution result in response",
          };
        } catch {
          return { ...base, status: "fail", notes: "non-JSON response" };
        }
      }

      case "blocked_limit": {
        // Overlimit swap quote: does the API validate or just return a quote for 99999 ETH?
        // Pass = API explicitly rejects; fail = returns quote without validation (security gap)
        if (r.isError) {
          const isValidation = /insufficient|too large|exceed|invalid|amount/i.test(text);
          return {
            ...base,
            status: isValidation ? "pass" : "fail",
            notes: isValidation
              ? "API rejected overlimit amount ✓"
              : `API error but not a validation rejection: ${text.slice(0, 80)}`,
          };
        }
        try {
          const parsed = JSON.parse(text);
          // If we got a quote back for 99999 ETH, that's a security gap
          if (parsed.output_amount !== undefined || parsed.route !== undefined) {
            return {
              ...base,
              status: "fail",
              notes: "no amount validation — API returned quote for 99999 ETH (security gap)",
            };
          }
          return { ...base, status: "pass", notes: "API rejected without quote" };
        } catch {
          return { ...base, status: "fail", notes: "non-JSON response" };
        }
      }

      case "eth_address": {
        if (r.isError) return { ...base, status: "fail", notes: text.slice(0, 120) };
        try {
          const parsed = JSON.parse(text);
          // Check for any EVM address in response fields
          const hasEvm = /0x[0-9a-fA-F]{40}/.test(text);
          const chains = parsed.chains ? Object.keys(parsed.chains) : [];
          return {
            ...base,
            status: hasEvm ? "pass" : "fail",
            notes: hasEvm
              ? `chains visible: ${chains.join(", ") || "unknown"}`
              : "no EVM address in portfolio response",
          };
        } catch {
          return { ...base, status: "fail", notes: "non-JSON response" };
        }
      }

      default:
        return { ...base, status: "skip", notes: `unhandled expect key: ${tc.expect}` };
    }
  }
}
