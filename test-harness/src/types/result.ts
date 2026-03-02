export type TestStatus = "pass" | "fail" | "skip" | "manual" | "error";

export interface TestResult {
  id: string;
  dim: number;
  status: TestStatus;
  description?: string;
  expectedOutcome: string;
  latencyMs?: number;
  notes?: string;
  txHash?: string;
  errorMessage?: string;
}

export interface DimensionScore {
  dimension: number;
  label: string;
  /** null = manual / research dimension */
  score: number | null;
  maxScore: number;
}

export interface LatencyStats {
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  samples: number;
}

export interface RunResult {
  competitor: string;
  network: string;
  /** ISO date string, e.g. "2026-02-26" */
  timestamp: string;
  results: TestResult[];
  dimensionScores: DimensionScore[];
  totalScore: number;
  maxScore: number;
  latencyStats?: LatencyStats;
}
