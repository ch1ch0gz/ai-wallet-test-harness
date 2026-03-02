import type { WalletAdapter } from "../base-adapter.js";
import type {
  ToolDefinition,
  ToolCallResult,
  NLUResult,
} from "../../types/adapter.js";
import type { TestCase } from "../../types/test-case.js";
import type { TestResult } from "../../types/result.js";

/**
 * MetaMask SDK AI Agent — stub adapter.
 *
 * This adapter does NOT run through TestRunner. All test results are recorded
 * manually to: test-harness/results/metamask/research-notes.md
 *
 * The class exists solely so the codebase maintains a consistent structural
 * pattern across all 7 competitors. Future contributors extending this toward
 * automation (e.g. via a mock MetaMask provider or Anvil) have a clear
 * interface to implement.
 *
 * Competitor details:
 *   Repo:    https://github.com/Consensys/wallet-agent
 *   Docs:    https://docs.metamask.io/tutorials/create-wallet-ai-agent/
 *   Stack:   Next.js (App Router) + Vercel AI SDK + OpenAI GPT-4o
 *   Network: Linea Sepolia (chainId 59141)
 *   Tools:   getBalance (read-only), sendTransaction (popup per tx)
 */
export class MetaMaskAdapter implements WalletAdapter {
  readonly name = "MetaMask SDK AI Agent";
  readonly network = "linea-sepolia";

  // ── Static tool manifest ──────────────────────────────────────────────────
  // These are the only two tools exposed by the wallet-agent tutorial app.
  private static readonly TOOLS: ToolDefinition[] = [
    {
      name: "getBalance",
      description: "Returns the ETH balance of the connected wallet (read-only, no params).",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    {
      name: "sendTransaction",
      description: "Initiates a MetaMask popup for the user to approve an ETH transfer.",
      inputSchema: {
        type: "object",
        properties: {
          to: { type: "string", description: "Recipient Ethereum address" },
          amount: { type: "string", description: "Amount in ETH, e.g. '0.001'" },
        },
        required: ["to", "amount"],
      },
    },
  ];

  // ── WalletAdapter interface ───────────────────────────────────────────────

  async initialize(): Promise<void> {
    throw new Error(
      [
        "MetaMaskAdapter: automated initialization is not supported.",
        "",
        "MetaMask SDK AI Agent requires a running browser with the MetaMask",
        "extension installed. Every transaction requires manual popup approval.",
        "",
        "Run tests manually and record findings in:",
        "  test-harness/results/metamask/research-notes.md",
        "",
        "Prerequisite setup steps:",
        "  1. Install MetaMask browser extension",
        "  2. Add Linea Sepolia (chainId 59141, RPC https://rpc.sepolia.linea.build)",
        "  3. Fund wallet via faucet.sepolia.linea.build",
        "  4. git clone https://github.com/Consensys/wallet-agent",
        "  5. cd wallet-agent && npm install",
        "  6. echo 'OPENAI_API_KEY=sk-...' > .env.local",
        "  7. npm run dev  # → localhost:3000",
      ].join("\n")
    );
  }

  async cleanup(): Promise<void> {
    // No-op — nothing to tear down for a manual-only adapter.
  }

  async listTools(): Promise<ToolDefinition[]> {
    // Returns the static tool manifest; does not require initialization.
    return MetaMaskAdapter.TOOLS;
  }

  async callTool(
    _toolName: string,
    _params: Record<string, unknown>
  ): Promise<ToolCallResult> {
    throw new Error(
      "MetaMaskAdapter: callTool is not supported. " +
        "Run tests manually and record results in research-notes.md."
    );
  }

  async runNLU(_prompt: string): Promise<NLUResult> {
    throw new Error(
      "MetaMaskAdapter: runNLU is not supported. " +
        "Send prompts manually via the Next.js app at localhost:3000."
    );
  }

  evaluateTestCase(
    tc: TestCase,
    _result: ToolCallResult | NLUResult | null,
    latencyMs: number
  ): TestResult {
    // All MetaMask test cases are manually evaluated.
    return {
      id: tc.id,
      dim: tc.dim,
      description: tc.description ?? tc.input,
      expectedOutcome: tc.expect,
      latencyMs,
      status: "manual",
      notes: "Record result in test-harness/results/metamask/research-notes.md",
    };
  }
}
