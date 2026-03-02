import type { ToolDefinition, ToolCallResult, NLUResult } from "../types/adapter.js";
import type { TestCase } from "../types/test-case.js";
import type { TestResult } from "../types/result.js";

/**
 * Every competitor adapter implements this interface.
 * MCP-based competitors (Phantom, Coinbase AgentKit, AskGina) wrap an MCPClient.
 * Web-app competitors (HeyElsa, MetaMask SDK) use Playwright instead.
 * Bot competitors (Pigeon, Bankr.bot) use semi-manual scoring.
 */
export interface WalletAdapter {
  /** Display name shown in reports, e.g. "Phantom MCP" */
  readonly name: string;

  /** Network the adapter is configured for, e.g. "devnet" */
  readonly network: string;

  /** Start any servers / browsers / connections needed */
  initialize(): Promise<void>;

  /** Tear down all resources */
  cleanup(): Promise<void>;

  /** List the tools exposed by this competitor */
  listTools(): Promise<ToolDefinition[]>;

  /**
   * Call a named tool directly.
   * Used for Dim 3 (action coverage), Dim 4 (security), and Dim 7 (multi-chain).
   */
  callTool(
    toolName: string,
    params: Record<string, unknown>
  ): Promise<ToolCallResult>;

  /**
   * Run a natural-language prompt through the full NLU loop.
   * The adapter wires Claude + MCP tools together and returns what happened.
   * Used for Dim 2 tests.
   */
  runNLU(prompt: string): Promise<NLUResult>;

  /**
   * Convert a raw ToolCallResult or NLUResult into a scored TestResult.
   * Each adapter implements its own evaluation logic (expected output shapes
   * differ between competitors).
   */
  evaluateTestCase(
    testCase: TestCase,
    result: ToolCallResult | NLUResult | null,
    latencyMs: number
  ): TestResult;
}
