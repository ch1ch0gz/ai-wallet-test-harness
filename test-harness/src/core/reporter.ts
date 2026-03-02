import chalk from "chalk";
import fs from "node:fs";
import path from "node:path";
import type { TestResult, RunResult, DimensionScore } from "../types/result.js";

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

const STATUS_ICON: Record<string, string> = {
  pass: chalk.green("✓"),
  fail: chalk.red("✗"),
  skip: chalk.yellow("?"),
  manual: chalk.gray("-"),
  error: chalk.red("!"),
};

export class Reporter {
  constructor(readonly verbose = false) {}

  printVerboseToolCall(toolName: string, params: Record<string, unknown>): void {
    if (!this.verbose) return;
    const paramsStr = Object.keys(params).length
      ? " " + JSON.stringify(params)
      : "";
    console.log(chalk.gray(`\n        → ${chalk.cyan(toolName)}${paramsStr}`));
  }

  printVerboseToolResponse(text: string, isError?: boolean): void {
    if (!this.verbose) return;
    const preview = text.length > 600 ? text.slice(0, 600) + "…" : text;
    const color = isError ? chalk.red : chalk.gray;
    const indented = preview
      .split("\n")
      .map((l, i) => (i === 0 ? `        ← ${l}` : `           ${l}`))
      .join("\n");
    console.log(color(indented));
  }

  printVerboseNLUFinal(text: string): void {
    if (!this.verbose) return;
    const preview = text.length > 400 ? text.slice(0, 400) + "…" : text;
    const indented = preview
      .split("\n")
      .map((l, i) => (i === 0 ? `        💬 ${l}` : `           ${l}`))
      .join("\n");
    console.log(chalk.white(indented));
    console.log();
  }

  printHeader(competitor: string, network: string, date: string): void {
    console.log();
    console.log(
      chalk.bold.cyan(`▶ Testing ${competitor} — ${network} — ${date}`)
    );
    console.log();
  }

  printDimensionHeader(dim: number): void {
    const label = DIM_LABELS[dim] ?? `Dimension ${dim}`;
    console.log(chalk.bold(`  Dim ${dim}: ${label}`));
  }

  printManualDimension(dim: number): void {
    const label = DIM_LABELS[dim] ?? `Dimension ${dim}`;
    console.log(chalk.bold(`  Dim ${dim}: ${label}`));
    console.log(`    ${chalk.yellow("⊙")} ${chalk.gray("MANUAL (skip)")}`);
  }

  printTestResult(r: TestResult): void {
    const icon = STATUS_ICON[r.status] ?? chalk.gray("?");
    const id = chalk.gray(r.id.padEnd(4));
    const desc = (r.description ?? r.expectedOutcome).slice(0, 32).padEnd(32);
    const latency = r.latencyMs != null ? chalk.gray(` ${r.latencyMs}ms`) : "";
    const tx = r.txHash ? chalk.gray(` [tx: ${r.txHash.slice(0, 8)}…]`) : "";
    const notes = r.notes ? chalk.yellow(`  ${r.notes}`) : "";
    console.log(`    ${icon} ${id} ${desc}${latency}${tx}${notes}`);
  }

  printLatencyStats(latencies: number[]): void {
    if (latencies.length === 0) return;
    const sorted = [...latencies].sort((a, b) => a - b);
    const avg = Math.round(
      sorted.reduce((s, v) => s + v, 0) / sorted.length
    );
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.min(Math.floor(sorted.length * 0.95), sorted.length - 1)];

    console.log();
    console.log(chalk.bold("  Dim 6: UX / Latency"));
    console.log(
      `    min ${chalk.green(sorted[0] + "ms")}  ` +
        `avg ${chalk.yellow(avg + "ms")}  ` +
        `p50 ${chalk.yellow(p50 + "ms")}  ` +
        `p95 ${chalk.red(p95 + "ms")}  ` +
        `max ${chalk.red(sorted[sorted.length - 1] + "ms")}  ` +
        chalk.gray(`(${sorted.length} samples)`)
    );
  }

  printScoreTable(r: RunResult): void {
    console.log();

    const scores = r.dimensionScores.map((d) =>
      d.score === null ? "-" : String(d.score)
    );
    const totalStr = `${r.totalScore}/${r.maxScore}`;
    const name = r.competitor.slice(0, 12).padEnd(12);

    // Fixed-width ASCII table
    const T = chalk.gray;
    console.log(T("  ┌──────────────┬──┬──┬──┬──┬──┬──┬──┬──┬────────┐"));
    console.log(T("  │ Competitor   │1 │2 │3 │4 │5 │6 │7 │8 │ Total  │"));
    console.log(T("  ├──────────────┼──┼──┼──┼──┼──┼──┼──┼──┼────────┤"));
    console.log(
      `  │ ${chalk.white(name)} │` +
        scores.map((s) => ` ${s}`).join("│") +
        `│ ${chalk.bold(totalStr.padEnd(6))} │`
    );
    console.log(T("  └──────────────┴──┴──┴──┴──┴──┴──┴──┴──┴────────┘"));
    console.log();
  }

  async saveResults(runResult: RunResult, outputDir: string): Promise<string> {
    fs.mkdirSync(outputDir, { recursive: true });

    const slug = runResult.timestamp.replace(/:/g, "-");
    const jsonPath = path.join(outputDir, `${slug}.json`);
    const mdPath = path.join(outputDir, `${slug}.md`);

    fs.writeFileSync(jsonPath, JSON.stringify(runResult, null, 2), "utf8");
    fs.writeFileSync(mdPath, this.toMarkdown(runResult), "utf8");

    console.log(chalk.green(`  Results saved → ${jsonPath}`));
    return jsonPath;
  }

  private toMarkdown(r: RunResult): string {
    const lines: string[] = [
      `# ${r.competitor} — Test Results`,
      ``,
      `**Network:** ${r.network}`,
      `**Date:** ${r.timestamp}`,
      `**Score:** ${r.totalScore} / ${r.maxScore}`,
      ``,
      `## Dimension Scores`,
      ``,
      `| # | Dimension | Score | Max |`,
      `|---|-----------|------:|----:|`,
    ];

    for (const d of r.dimensionScores) {
      const score = d.score === null ? "MANUAL" : String(d.score);
      lines.push(`| ${d.dimension} | ${d.label} | ${score} | ${d.maxScore} |`);
    }

    lines.push(``, `## Test Results`, ``);
    lines.push(`| ID | Dim | Status | Latency | Notes |`);
    lines.push(`|----|-----|--------|---------|-------|`);

    for (const res of r.results) {
      const lat = res.latencyMs != null ? `${res.latencyMs}ms` : "";
      const noteParts = [
        res.notes,
        res.txHash ? `tx: \`${res.txHash}\`` : "",
        res.errorMessage,
      ].filter(Boolean);
      lines.push(
        `| ${res.id} | ${res.dim} | ${res.status} | ${lat} | ${noteParts.join("; ")} |`
      );
    }

    if (r.latencyStats) {
      const s = r.latencyStats;
      lines.push(
        ``,
        `## Latency Stats`,
        ``,
        `| Metric | Value |`,
        `|--------|------:|`,
        `| min | ${s.min}ms |`,
        `| avg | ${s.avg}ms |`,
        `| p50 | ${s.p50}ms |`,
        `| p95 | ${s.p95}ms |`,
        `| max | ${s.max}ms |`,
        `| samples | ${s.samples} |`
      );
    }

    lines.push(``, `---`, `*Generated by ai-wallet-test-harness*`);
    return lines.join("\n");
  }
}
