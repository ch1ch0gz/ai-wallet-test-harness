import type { WalletAdapter } from "../adapters/base-adapter.js";
import type { TestCase } from "../types/test-case.js";
import type { TestResult, RunResult, DimensionScore, LatencyStats } from "../types/result.js";
import type { ToolCallResult, NLUResult } from "../types/adapter.js";
import { Reporter } from "./reporter.js";

/** Dimensions scored manually / by research — not by the automated harness */
const MANUAL_DIMS = new Set([1, 5, 8]);

const DIM_LABELS: Record<number, string> = {
  1: "Onboarding",
  2: "NLU & Intent",
  3: "Supported Actions",
  4: "Security",
  5: "Architecture",
  6: "UX / Latency",
  7: "Multi-Chain",
  8: "Business Model",
};

export class TestRunner {
  private latencies: number[] = [];

  constructor(
    private readonly adapter: WalletAdapter,
    private readonly reporter: Reporter
  ) {}

  async run(testCases: TestCase[]): Promise<RunResult> {
    const results: TestResult[] = [];
    const printedDims = new Set<number>();

    for (const tc of testCases) {
      if (tc.skip) continue;

      // Print dimension header once per dim
      if (!printedDims.has(tc.dim)) {
        printedDims.add(tc.dim);
        if (MANUAL_DIMS.has(tc.dim)) {
          this.reporter.printManualDimension(tc.dim);
        } else if (tc.dim !== 6) {
          // Dim 6 header printed by printLatencyStats
          this.reporter.printDimensionHeader(tc.dim);
        }
      }

      if (MANUAL_DIMS.has(tc.dim)) {
        results.push({
          id: tc.id,
          dim: tc.dim,
          status: "manual",
          description: tc.description,
          expectedOutcome: tc.expect,
        });
        continue;
      }

      // Latency-only sentinel case
      if (tc.expect === "measure_latency_all_calls") {
        continue;
      }

      const result = await this.runOne(tc);
      results.push(result);
      this.reporter.printTestResult(result);
    }

    // Print latency summary (Dim 6)
    this.reporter.printLatencyStats(this.latencies);

    // Build dimension scores (latency stats needed for dim 6)
    const latencyStats = this.buildLatencyStats(this.latencies);
    const dimensionScores = this.buildScores(results, latencyStats);
    const autoScores = dimensionScores.filter((d) => d.score !== null);
    const totalScore = autoScores.reduce((s, d) => s + (d.score ?? 0), 0);
    const maxScore = autoScores.reduce((s, d) => s + d.maxScore, 0);

    return {
      competitor: this.adapter.name,
      network: this.adapter.network,
      timestamp: new Date().toISOString().split("T")[0],
      results,
      dimensionScores,
      totalScore,
      maxScore,
      latencyStats,
    };
  }

  private async runOne(tc: TestCase): Promise<TestResult> {
    const start = Date.now();
    try {
      let raw: ToolCallResult | NLUResult | null = null;

      if (tc.input) {
        raw = await this.adapter.runNLU(tc.input);
      } else if (tc.tool) {
        this.reporter.printVerboseToolCall(tc.tool, tc.params ?? {});
        raw = await this.adapter.callTool(tc.tool, tc.params ?? {});
        const text = (raw as import("../types/adapter.js").ToolCallResult).content
          .filter((c) => c.type === "text")
          .map((c) => c.text ?? "")
          .join("\n");
        this.reporter.printVerboseToolResponse(
          text,
          (raw as import("../types/adapter.js").ToolCallResult).isError
        );
      }

      const latencyMs = Date.now() - start;
      this.latencies.push(latencyMs);

      return this.adapter.evaluateTestCase(tc, raw, latencyMs);
    } catch (err) {
      const latencyMs = Date.now() - start;
      return {
        id: tc.id,
        dim: tc.dim,
        status: "error",
        description: tc.description ?? tc.input ?? tc.tool,
        expectedOutcome: tc.expect,
        latencyMs,
        errorMessage: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private buildScores(
    results: TestResult[],
    latencyStats: LatencyStats | undefined
  ): DimensionScore[] {
    const scores: DimensionScore[] = [];
    for (let dim = 1; dim <= 8; dim++) {
      const label = DIM_LABELS[dim] ?? `Dim ${dim}`;
      if (MANUAL_DIMS.has(dim)) {
        scores.push({ dimension: dim, label, score: null, maxScore: 5 });
        continue;
      }

      // Dim 6 (UX / Latency) is scored from p95 response time, not pass/fail
      if (dim === 6) {
        const p95 = latencyStats?.p95;
        let score: number;
        if (p95 == null)        score = 0;
        else if (p95 < 2_000)   score = 5;
        else if (p95 < 5_000)   score = 4;
        else if (p95 < 10_000)  score = 3;
        else if (p95 < 20_000)  score = 2;
        else                    score = 1;
        scores.push({ dimension: dim, label, score, maxScore: 5 });
        continue;
      }

      const dimResults = results.filter(
        (r) => r.dim === dim && r.status !== "manual" && r.status !== "skip"
      );

      if (dimResults.length === 0) {
        scores.push({ dimension: dim, label, score: 0, maxScore: 5 });
        continue;
      }

      const passed = dimResults.filter((r) => r.status === "pass").length;
      const ratio = passed / dimResults.length;
      scores.push({
        dimension: dim,
        label,
        score: Math.round(ratio * 5),
        maxScore: 5,
      });
    }
    return scores;
  }

  private buildLatencyStats(latencies: number[]): LatencyStats | undefined {
    if (latencies.length === 0) return undefined;
    const sorted = [...latencies].sort((a, b) => a - b);
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length),
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.min(Math.floor(sorted.length * 0.95), sorted.length - 1)],
      samples: sorted.length,
    };
  }
}
