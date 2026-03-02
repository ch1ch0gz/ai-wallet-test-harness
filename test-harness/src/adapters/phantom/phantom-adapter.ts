import { MCPClient } from "../../core/mcp-client.js";
import { NLURunner } from "../../core/nlu-runner.js";
import { ChainVerifier } from "../../core/chain-verifier.js";
import type { Reporter } from "../../core/reporter.js";
import type { WalletAdapter } from "../base-adapter.js";
import type {
  ToolDefinition,
  ToolCallResult,
  NLUResult,
} from "../../types/adapter.js";
import { isNLUResult } from "../../types/adapter.js";
import type { TestCase } from "../../types/test-case.js";
import type { TestResult } from "../../types/result.js";

export class PhantomAdapter implements WalletAdapter {
  readonly name = "Phantom MCP";
  readonly network: string;

  private mcp: MCPClient;
  private nlu?: NLURunner;
  private reporter?: Reporter;

  constructor(network = "devnet", reporter?: Reporter) {
    this.network = network;
    this.reporter = reporter;
    const appId = process.env.PHANTOM_APP_ID;
    if (!appId) {
      throw new Error(
        "PHANTOM_APP_ID is not set. See .env.example for setup instructions."
      );
    }
    this.mcp = new MCPClient("phantom-mcp", [], {
      PHANTOM_APP_ID: appId,
      SOLANA_NETWORK: network,
    });
  }

  async initialize(): Promise<void> {
    await this.mcp.connect();
    this.nlu = new NLURunner(this.mcp, this.reporter, this.network);
  }

  async cleanup(): Promise<void> {
    await this.mcp.disconnect();
  }

  async listTools(): Promise<ToolDefinition[]> {
    return this.mcp.listTools();
  }

  async callTool(
    toolName: string,
    params: Record<string, unknown>
  ): Promise<ToolCallResult> {
    return this.mcp.callTool(toolName, params);
  }

  async runNLU(prompt: string): Promise<NLUResult> {
    if (!this.nlu) throw new Error("PhantomAdapter not initialized");
    return this.nlu.run(prompt);
  }

  // ── Evaluation ─────────────────────────────────────────────────────────────

  evaluateTestCase(
    tc: TestCase,
    result: ToolCallResult | NLUResult | null,
    latencyMs: number
  ): TestResult {
    const base = {
      id: tc.id,
      dim: tc.dim,
      description: tc.description ?? tc.input ?? tc.tool,
      expectedOutcome: tc.expect,
      latencyMs,
    } as const;

    if (!result) {
      return { ...base, status: "error", errorMessage: "No result returned" };
    }

    switch (tc.expect) {
      case "balance_returned": {
        if (!isNLUResult(result)) {
          return { ...base, status: "error", errorMessage: "expected NLU result" };
        }
        // Pass if a wallet-address tool was called OR the response contains a numeric balance
        const passed =
          result.toolsCalled.some((t) =>
            ["get_wallet_addresses", "get_balance"].includes(t)
          ) || /\d+\.?\d*\s*(SOL|sol)/i.test(result.finalResponse);
        return { ...base, status: passed ? "pass" : "fail" };
      }

      case "transfer_executed": {
        if (!isNLUResult(result)) {
          return { ...base, status: "error", errorMessage: "expected NLU result" };
        }
        const called = result.toolsCalled.includes("transfer_tokens");
        const txHash = this.extractSolTx(result);
        return { ...base, status: called ? "pass" : "fail", txHash };
      }

      case "swap_executed": {
        if (!isNLUResult(result)) {
          return { ...base, status: "error", errorMessage: "expected NLU result" };
        }
        const called = result.toolsCalled.some((t) =>
          ["buy_token", "swap_tokens", "transfer_tokens"].includes(t)
        );
        return { ...base, status: called ? "pass" : "fail" };
      }

      case "clarification_requested": {
        if (!isNLUResult(result)) {
          return { ...base, status: "error", errorMessage: "expected NLU result" };
        }
        return {
          ...base,
          status: result.clarificationRequested ? "pass" : "fail",
          notes: result.clarificationRequested
            ? "clarification requested ✓"
            : "clarification NOT requested",
        };
      }

      case "addresses_returned": {
        const tool = result as ToolCallResult;
        const text = this.getText(tool);
        // A Solana address is base-58, 32–44 chars
        const hasSolanaAddr = /[1-9A-HJ-NP-Za-km-z]{32,44}/.test(text);
        return {
          ...base,
          status: hasSolanaAddr && !tool.isError ? "pass" : "fail",
          notes: hasSolanaAddr ? text.slice(0, 80) : "no address in response",
        };
      }

      case "tx_hash": {
        const tool = result as ToolCallResult;
        const text = this.getText(tool);
        const txHash = ChainVerifier.extractSolanaSignature(text);
        return {
          ...base,
          status: txHash ? "pass" : "fail",
          txHash,
          notes: tool.isError ? "tool returned error" : undefined,
        };
      }

      case "blocked_limit": {
        const tool = result as ToolCallResult;
        const text = this.getText(tool).toLowerCase();
        const blocked =
          tool.isError === true ||
          /limit|exceed|denied|rejected|insufficient|too large/i.test(text);
        return {
          ...base,
          status: blocked ? "pass" : "fail",
          notes: blocked
            ? "spending limit enforced ✓"
            : "WARNING: limit NOT enforced — security gap",
        };
      }

      case "blocked_whitelist_or_confirmed": {
        const tool = result as ToolCallResult;
        const text = this.getText(tool).toLowerCase();
        const blocked =
          tool.isError === true ||
          /whitelist|blocked|denied|not allowed|unauthorized/i.test(text);
        const txHash = ChainVerifier.extractSolanaSignature(this.getText(tool));
        return {
          ...base,
          // Both outcomes are acceptable — blocked is ideal, confirmed is neutral
          status: blocked ? "pass" : "skip",
          notes: blocked
            ? "blocked by whitelist ✓"
            : `confirmed (address not whitelisted by default)${txHash ? "" : ""}`,
          txHash,
        };
      }

      case "eth_address": {
        const tool = result as ToolCallResult;
        const text = this.getText(tool);
        const ethAddr = text.match(/0x[0-9a-fA-F]{40}/)?.[0];
        return {
          ...base,
          status: ethAddr ? "pass" : "fail",
          notes: ethAddr ? `${ethAddr.slice(0, 10)}…` : "no ETH address returned",
        };
      }

      default:
        return {
          ...base,
          status: "skip",
          notes: `unhandled expect key: ${tc.expect}`,
        };
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private getText(r: ToolCallResult): string {
    return r.content
      .filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("\n");
  }

  private extractSolTx(nlu: NLUResult): string | undefined {
    for (const r of nlu.toolResults) {
      const sig = ChainVerifier.extractSolanaSignature(this.getText(r));
      if (sig) return sig;
    }
    return undefined;
  }
}
