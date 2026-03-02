import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load .env from the test-harness root (one level up from src/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { config } = await import("dotenv");
config({ path: path.join(__dirname, "..", ".env") });

import { PhantomAdapter } from "./adapters/phantom/phantom-adapter.js";
import { getPhantomTestCases } from "./adapters/phantom/phantom-tests.js";
import { TestRunner } from "./core/test-runner.js";
import { Reporter } from "./core/reporter.js";
import type { WalletAdapter } from "./adapters/base-adapter.js";
import type { TestCase } from "./types/test-case.js";

// ── Arg parsing ──────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const competitor = (argv.find((a) => !a.startsWith("--")) ?? "phantom").toLowerCase();

const networkArgIdx = argv.indexOf("--network");
const network =
  networkArgIdx !== -1
    ? argv[networkArgIdx + 1]
    : (process.env.TEST_NETWORK ?? "devnet");

const verbose = argv.includes("--verbose");

const today = new Date().toISOString().split("T")[0];

// ── Reporter (created before adapter so it can be passed in) ─────────────────

const reporter = new Reporter(verbose);

// ── Build adapter + test cases ───────────────────────────────────────────────

let adapter: WalletAdapter;
let testCases: TestCase[];

switch (competitor) {
  case "phantom": {
    adapter = new PhantomAdapter(network, reporter);
    testCases = getPhantomTestCases(network);
    break;
  }
  default:
    console.error(`Unknown competitor: "${competitor}"`);
    console.error("Available competitors: phantom");
    console.error("Usage: npm run test <competitor> [--network devnet|mainnet]");
    process.exit(1);
}

// ── Run ──────────────────────────────────────────────────────────────────────
reporter.printHeader(adapter.name, network, today);

try {
  await adapter.initialize();
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`\n❌  Failed to initialize ${competitor}: ${msg}`);
  console.error(`
Prerequisite checklist:
  1. npm install -g @phantom/mcp-server
  2. PHANTOM_APP_ID=<id> phantom-mcp    ← one-time OAuth (opens browser)
  3. Copy .env.example → .env and fill in PHANTOM_APP_ID + TEST_RECIPIENT_ADDRESS
  4. Fund devnet wallet: solana airdrop 2 <address> --url devnet
`);
  process.exit(1);
}

const runner = new TestRunner(adapter, reporter);

try {
  const runResult = await runner.run(testCases);
  reporter.printScoreTable(runResult);

  const outputDir = path.join(__dirname, "..", "results", competitor);
  await reporter.saveResults(runResult, outputDir);
} finally {
  await adapter.cleanup();
}
