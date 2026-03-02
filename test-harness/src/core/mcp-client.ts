import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { ToolDefinition, ToolCallResult } from "../types/adapter.js";

export class MCPClient {
  private client: Client;
  private transport?: StdioClientTransport;

  constructor(
    private readonly command: string,
    private readonly args: string[] = [],
    private readonly extraEnv: Record<string, string> = {}
  ) {
    this.client = new Client(
      { name: "ai-wallet-test-harness", version: "0.1.0" },
      { capabilities: {} }
    );
  }

  async connect(): Promise<void> {
    const env: Record<string, string> = {};
    // Merge current process env (strip undefined values)
    for (const [k, v] of Object.entries(process.env)) {
      if (v !== undefined) env[k] = v;
    }
    for (const [k, v] of Object.entries(this.extraEnv)) {
      env[k] = v;
    }

    this.transport = new StdioClientTransport({
      command: this.command,
      args: this.args,
      env,
      stderr: "ignore", // suppress MCP server's own log noise from the terminal
    });
    await this.client.connect(this.transport);
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  async listTools(): Promise<ToolDefinition[]> {
    const { tools } = await this.client.listTools();
    return tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema as Record<string, unknown>,
    }));
  }

  async callTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<ToolCallResult> {
    const start = Date.now();
    const response = await this.client.callTool({ name, arguments: args });
    return {
      content: response.content as Array<{ type: string; text?: string }>,
      isError: response.isError as boolean | undefined,
      latencyMs: Date.now() - start,
    };
  }
}
