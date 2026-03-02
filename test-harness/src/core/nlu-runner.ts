import Anthropic from "@anthropic-ai/sdk";
import type { MCPClient } from "./mcp-client.js";
import type { NLUResult } from "../types/adapter.js";
import type { Reporter } from "./reporter.js";

const NETWORK_ID: Record<string, string> = {
  devnet: "solana:devnet",
  mainnet: "solana:mainnet",
};

function buildSystemPrompt(network: string): string {
  const networkId = NETWORK_ID[network] ?? `solana:${network}`;
  return `You are an AI assistant with access to a Phantom crypto wallet.
When the user asks you to perform wallet operations, use the available tools to fulfill their request.
If a request is ambiguous (e.g. "buy some tokens" without specifying which token or amount),
ask for clarification rather than guessing. Always confirm the action before executing.
For all Solana transactions, use networkId "${networkId}" unless the user explicitly specifies otherwise.`;
}

export class NLURunner {
  private anthropic: Anthropic;

  constructor(
    private readonly mcpClient: MCPClient,
    private readonly reporter?: Reporter,
    private readonly network = "devnet"
  ) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async run(userMessage: string): Promise<NLUResult> {
    const start = Date.now();

    // Fetch MCP tools and convert to Anthropic API format
    const mcpTools = await this.mcpClient.listTools();
    const anthropicTools: Anthropic.Tool[] = mcpTools.map((t) => ({
      name: t.name,
      description: t.description ?? "",
      input_schema: t.inputSchema as Anthropic.Tool["input_schema"],
    }));

    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: userMessage },
    ];

    const toolsCalled: string[] = [];
    const toolResults: import("../types/adapter.js").ToolCallResult[] = [];
    let finalResponse = "";
    let clarificationRequested = false;

    // Agentic loop: keep going until end_turn or no more tool_use
    while (true) {
      const response = await this.anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: buildSystemPrompt(this.network),
        tools: anthropicTools,
        messages,
      });

      if (response.stop_reason === "end_turn") {
        for (const block of response.content) {
          if (block.type === "text") {
            finalResponse = block.text;
            clarificationRequested = this.detectsClarification(block.text);
          }
        }
        this.reporter?.printVerboseNLUFinal(finalResponse);
        break;
      }

      if (response.stop_reason === "tool_use") {
        const toolUseBlocks = response.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
        );

        // Append assistant turn
        messages.push({ role: "assistant", content: response.content });

        // Execute every tool call sequentially
        const toolResultContent: Anthropic.ToolResultBlockParam[] = [];
        for (const block of toolUseBlocks) {
          toolsCalled.push(block.name);

          this.reporter?.printVerboseToolCall(
            block.name,
            block.input as Record<string, unknown>
          );

          const result = await this.mcpClient.callTool(
            block.name,
            block.input as Record<string, unknown>
          );
          toolResults.push(result);

          const resultText = result.content
            .filter((c) => c.type === "text")
            .map((c) => c.text ?? "")
            .join("\n");

          this.reporter?.printVerboseToolResponse(resultText, result.isError);

          toolResultContent.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: resultText,
            is_error: result.isError,
          });
        }

        messages.push({ role: "user", content: toolResultContent });
      } else {
        // stop_reason is something unexpected — bail out
        break;
      }
    }

    return {
      toolsCalled,
      finalResponse,
      clarificationRequested,
      latencyMs: Date.now() - start,
      toolResults,
    };
  }

  private detectsClarification(text: string): boolean {
    const patterns = [
      /which token/i,
      /what token/i,
      /how much/i,
      /what amount/i,
      /please (specify|clarify|provide)/i,
      /could you (clarify|specify|tell me)/i,
      /need more (info|information|detail)/i,
      /which chain/i,
      /\?$/, // ends with a question — likely asking for input
    ];
    return patterns.some((p) => p.test(text));
  }
}
