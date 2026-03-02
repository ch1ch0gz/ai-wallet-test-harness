export interface ToolDefinition {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

export interface ToolCallResult {
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
  latencyMs: number;
}

export interface NLUResult {
  toolsCalled: string[];
  finalResponse: string;
  clarificationRequested: boolean;
  latencyMs: number;
  toolResults: ToolCallResult[];
}

export function isNLUResult(r: ToolCallResult | NLUResult): r is NLUResult {
  return "toolsCalled" in r;
}
