import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load .env from the test-harness root (one level up from src/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { config } = await import("dotenv");
config({ path: path.join(__dirname, "..", ".env") });

import { PhantomAdapter } from "./adapters/phantom/phantom-adapter.js";
import { getPhantomTestCases } from "./adapters/phantom/phantom-tests.js";
import { getMetaMaskTestCases } from "./adapters/metamask/metamask-tests.js";
import { CoinbaseAdapter } from "./adapters/coinbase/coinbase-adapter.js";
import { getCoinbaseTestCases } from "./adapters/coinbase/coinbase-tests.js";
import { HeyElsaAdapter } from "./adapters/heyelsa/heyelsa-adapter.js";
import { getHeyElsaTestCases } from "./adapters/heyelsa/heyelsa-tests.js";
import { getPigeonTestCases } from "./adapters/pigeon/pigeon-tests.js";
import { getAskGinaTestCases } from "./adapters/askgina/askgina-tests.js";
import { getBankrTestCases } from "./adapters/bankr/bankr-tests.js";
import { WardenAdapter } from "./adapters/warden/warden-adapter.js";
import { getWardenTestCases } from "./adapters/warden/warden-tests.js";
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
  case "metamask": {
    // MetaMask SDK AI Agent requires a running browser + MetaMask extension.
    // No automated runner is configured; all results are recorded manually.
    const testCases = getMetaMaskTestCases();
    console.log(`
MetaMask SDK AI Agent — Manual Testing Mode
============================================
Automated execution is not supported for this competitor.
Every transaction requires a MetaMask browser extension popup.

Test cases to run manually (${testCases.length} total):
${testCases
  .filter((tc) => !tc.skip)
  .map((tc) => `  [${tc.id}] Dim ${tc.dim}: ${tc.description ?? tc.input ?? tc.note}`)
  .join("\n")}

Record all findings in:
  test-harness/results/metamask/research-notes.md

Setup prerequisites:
  1. Install MetaMask browser extension
  2. Add Linea Sepolia (chainId 59141, RPC https://rpc.sepolia.linea.build)
  3. Fund wallet via faucet.sepolia.linea.build
  4. git clone https://github.com/Consensys/wallet-agent
  5. cd wallet-agent && npm install
  6. echo 'OPENAI_API_KEY=sk-...' > .env.local
  7. npm run dev  # → localhost:3000
`);
    process.exit(0);
  }
  case "coinbase": {
    // Coinbase uses EVM network IDs (e.g. "base-sepolia"), not Solana's "devnet".
    // Read NETWORK_ID env var; fall back to "base-sepolia" if absent.
    const cbNetwork =
      networkArgIdx !== -1 ? argv[networkArgIdx + 1] : (process.env.NETWORK_ID ?? "base-sepolia");
    adapter = new CoinbaseAdapter(cbNetwork, reporter);
    testCases = getCoinbaseTestCases();
    break;
  }
  case "heyelsa": {
    // HeyElsa x402 REST API — automated adapter.
    // Dims 1, 2, 5, 8 are manual; Dims 3, 4, 6, 7 automated via the x402 API.
    // Estimated cost per run: ~$0.20 USDC on Base mainnet.
    adapter = new HeyElsaAdapter();
    testCases = getHeyElsaTestCases();
    break;
  }
  case "pigeon": {
    // Pigeon has no public API or SDK — all testing is done via Telegram DM.
    // No automated runner is configured; all results are recorded manually.
    const testCases = getPigeonTestCases();
    console.log(`
Pigeon — Manual Testing Mode
=============================
Test via Telegram: DM @PigeonTradeBot (or t.me/PigeonTradeBot)
Also available on: Discord, Farcaster, WhatsApp, SMS, and 7 more channels.
Pigeon is free (beta) — no API fees. Fund the Privy wallet with ~0.002 ETH (~$5 at current prices) on Base mainnet for transfer/swap tests.

Test cases to run manually (${testCases.filter((tc) => !tc.skip).length} total):
${testCases
  .filter((tc) => !tc.skip)
  .map((tc) => `  [${tc.id}] Dim ${tc.dim}: ${tc.description ?? tc.input ?? tc.note}`)
  .join("\n")}

Record findings in:
  test-harness/results/pigeon/research-notes.md

Prerequisites:
  1. Open Telegram and search for @PigeonTradeBot (or open t.me/PigeonTradeBot)
  2. Send /start — wallet auto-provisioned by Privy (no seed phrase)
  3. Note the wallet address shown
  4. Send ~0.002 ETH (~$5 at current prices, Base mainnet) to the Privy wallet for transfer/swap tests
  5. Run each test case above and record the bot response + latency in research-notes.md
`);
    process.exit(0);
  }
  case "askgina": {
    // AskGina has no public API, SDK, or MCP server — all testing is done via the web app.
    // No automated runner is configured; all results are recorded manually.
    // Network: Base mainnet only (no testnet). Gas sponsored for EVM txs < $5 USD.
    const testCases = getAskGinaTestCases();
    console.log(`
AskGina — Manual Testing Mode
==============================
Test via web app: https://askgina.ai (also accessible via Farcaster @askgina)
Network: Base mainnet only — no testnet available.
Gas is sponsored for EVM transactions under $5 USD.
Fund the Privy wallet with ~0.002 ETH on Base mainnet for transfer/swap asset amounts.

Test cases to run manually (${testCases.filter((tc) => !tc.skip).length} total):
${testCases
  .filter((tc) => !tc.skip)
  .map((tc) => `  [${tc.id}] Dim ${tc.dim}: ${tc.description ?? tc.input ?? tc.note}`)
  .join("\n")}

Record findings in:
  test-harness/results/askgina/research-notes.md

Prerequisites:
  1. Open https://askgina.ai in a browser
  2. Sign up with email, Farcaster, or X — Privy wallet auto-provisioned (no seed phrase)
  3. Check settings for key export option (Privy with user key export)
  4. Note the EVM and Solana wallet addresses
  5. Send ~0.002 ETH on Base mainnet to the wallet for transfer/swap tests (gas is sponsored)
  6. Run each test case above and record the response + latency in research-notes.md

Notes:
  - a06a and a06b use the same prompt; run it once and record both the swap leg (a06a)
    and the bridge leg (a06b), noting whether Biconomy executed both under one signature
  - Gas sponsorship covers tx fees; only the asset amounts (0.001 ETH, 10 USDC) need funding
`);
    process.exit(0);
  }
  case "bankr": {
    // Bankr.bot has no SDK — all testing is done via the Terminal web app.
    // The REST Agent API (api.bankr.bot) requires sign-up and API key provisioning;
    // evaluation mirrors real user experience via the Terminal browser interface.
    const testCases = getBankrTestCases();
    console.log(`
Bankr.bot — Manual Testing Mode
=================================
Test via browser: https://terminal.bankr.bot
Also available: X/Twitter @bankrbot, Farcaster @bankr

⚠️  FREE TIER LIMIT: 10 messages/day.
With 14 tests you WILL hit the limit mid-session.
Either upgrade to Bankr Club ($20/month in BNKR) or obtain an API key before starting.
  Bankr Club: https://bankr.bot (look for Club/subscription in settings)

Gas sponsorship: Base, Polygon, Unichain are gas-sponsored. Ethereum mainnet is NOT.
Fund the Privy wallet with ~0.001–0.002 ETH on Base mainnet for transfer/swap asset amounts
(gas is covered — only the asset amounts need funding).

Test cases to run manually (${testCases.filter((tc) => !tc.skip).length} total):
${testCases
  .filter((tc) => !tc.skip)
  .map((tc) => `  [${tc.id}] Dim ${tc.dim}: ${tc.description ?? tc.input ?? tc.note}`)
  .join("\n")}

Record findings in:
  test-harness/results/bankr/research-notes.md

Prerequisites:
  1. Open https://terminal.bankr.bot in a browser
  2. Sign up with email, X/Twitter, or Farcaster — Privy wallet auto-provisioned (no seed phrase)
  3. Confirm key export is available in settings (Privy with user key export — distinct from Pigeon MPC)
  4. Note the EVM and Solana wallet addresses
  5. Send ~0.001–0.002 ETH on Base mainnet to the wallet for transfer/swap tests (gas is sponsored)
  6. Upgrade to Bankr Club OR get API key if you haven't already (10 msg/day free tier too low for 14 tests)
  7. Run each test case above and record the response + latency in research-notes.md

Notes:
  - b07 (token launch): IRREVERSIBLE — this deploys a real ERC-20 contract on Base mainnet if executed.
    Record whether Bankr shows a simulation or confirmation step before deploying.
    Record the contract address if deployment proceeds. Token launching is unique to Bankr in this cohort.
  - b08 (Avantis leverage): Do NOT hard-code $10 — it is likely below the Avantis minimum (~$20–50).
    Use the minimum position size Bankr shows in the UI. Record the minimum shown.
  - b09 (Polymarket): Browse https://polymarket.com first to find an active market.
    Record the market URL in research-notes.md. The $1 bet is real USDC (on Polygon).
  - b12 (burn address): Compare directly to Pigeon p12 — Pigeon executed 0.001 USDC to 0xdead
    with NO warning AND auto-swapped 0.5 USDC → ETH (uninstructed) to cover gas.
    Record exact Bankr behavior for direct comparison.
`);
    process.exit(0);
  }
  case "warden": {
    // Warden Protocol has no public SDK or REST API for end-user wallet operations.
    // All testing is done via the web app and AI Trading Terminal.
    // Both the main chat AND Agent Hub should be tested separately:
    //   Main chat:       https://app.wardenprotocol.org
    //   Agent Hub:       https://app.wardenprotocol.org/agent-hub
    //   Trading Terminal: https://app.wardenprotocol.org/trade
    const testCases = getWardenTestCases();
    console.log(`
Warden Protocol — Manual Testing Mode
=======================================
Test via web app: https://app.wardenprotocol.org
Agent Hub (browse separately): https://app.wardenprotocol.org/agent-hub
AI Trading Terminal (test w08): https://app.wardenprotocol.org/trade

Wallet: Privy embedded smart accounts (ERC-4337 + delegated access).
Sign up with email or social — no seed phrase.
⚠️  Check settings for key export — smart account key export differs from plain Privy
embedded wallets (AskGina) and Privy MPC (Pigeon). Record exactly what is shown.
Fund the wallet with ~0.002 ETH on Base or Ethereum mainnet for execution tests.

WARD TOKEN:
  Some features (AI Trading Terminal, Agent Hub subscriptions) may require WARD.
  If blocked by a WARD paywall mid-test, acquire WARD before proceeding:
    Option A — buy WARD on Coinbase
    Option B — in-app swap: any supported token → WARD on Base
  Check whether a minimum WARD stake is required before accessing /trade and record the amount.

KYC WARNING (w09 — tokenized stocks):
  Tokenized real-world assets (AAPL, etc.) are regulated. Warden/Messari may require
  identity verification before stock purchases — this could be a hard blocker.
  Attempt w09 last, after completing all other tests. Record whether KYC is prompted.

Test cases to run manually (${testCases.filter((tc) => !tc.skip).length} total):
${testCases
  .filter((tc) => !tc.skip)
  .map((tc) => `  [${tc.id}] Dim ${tc.dim}: ${tc.description ?? tc.input ?? tc.note}`)
  .join("\n")}

Record findings in:
  test-harness/results/warden/research-notes.md

Prerequisites:
  1. Open https://app.wardenprotocol.org in a browser
  2. Sign up with email or social — Privy smart account auto-provisioned (no seed phrase)
  3. Check settings for key export (record what is available — differs from AskGina/Pigeon/Bankr)
  4. Note the EVM wallet address (and WardenChain address if shown separately)
  5. Send ~0.002 ETH on Base or Ethereum mainnet for transfer/swap tests
  6. Check if WARD is required for /trade — acquire via Coinbase or in-app swap if needed
  7. Run w01–w07, w10–w14 first; run w08 (Trading Terminal) and w09 (tokenized stocks) last

Notes:
  - w06 (Agent Hub): try the NL query first in chat, then navigate to /agent-hub if no agents listed.
    Record which path succeeded and list every agent name and capability shown.
  - w08 (perps): use https://app.wardenprotocol.org/trade — record the exact URL used.
    Record whether Messari Signals data powers the terminal.
  - w09 (tokenized stocks): UNIQUE IN COHORT — no other tested competitor supports this.
    Record: KYC requirement, asset/exchange/settlement chain, tokenization mechanism.
    This is the most differentiated single feature Warden has.
  - w03 (transfer): look for SPEx verification screen — this is Warden's unique verifiability
    layer. Record any "proof of execution" or "verified intent" UI that appears.
  - PUMPs rewards: record if WARD-convertible rewards appear at any point during testing.
`);
    process.exit(0);
  }
  default:
    console.error(`Unknown competitor: "${competitor}"`);
    console.error("Available competitors: phantom, metamask, coinbase, heyelsa, pigeon, askgina, bankr, warden");
    console.error("Usage: npm run test <competitor> [--network devnet|mainnet]");
    process.exit(1);
}

// ── Run ──────────────────────────────────────────────────────────────────────
reporter.printHeader(adapter.name, adapter.network, today);

try {
  await adapter.initialize();
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`\n❌  Failed to initialize ${competitor}: ${msg}`);
  if (competitor === "coinbase") {
    console.error(`
Coinbase AgentKit prerequisite checklist:
  1. Create a CDP account at https://portal.cdp.coinbase.com
  2. API Keys → Create API Key → copy CDP_API_KEY_ID and CDP_API_KEY_SECRET
  3. Generate CDP_WALLET_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  4. Add all three to test-harness/.env (see .env.example for the full template)
  5. Run once to obtain wallet address, then fund via https://faucet.base.org
`);
  } else if (competitor === "heyelsa") {
    console.error(`
HeyElsa x402 prerequisite checklist:
  1. Generate or export a Base wallet private key (0x + 64 hex chars)
  2. Fund that wallet with USDC on Base mainnet (~$1 covers 5 full test runs)
  3. Add to test-harness/.env:
       HEYELSA_PRIVATE_KEY=0x<your-private-key>
       HEYELSA_WALLET_ADDRESS=0x<your-address>   # optional — derived from key if absent
  4. Run: npm run test heyelsa
  Estimated cost: ~$0.20 USDC per run
`);
  } else {
    console.error(`
Phantom MCP prerequisite checklist:
  1. npm install -g @phantom/mcp-server
  2. PHANTOM_APP_ID=<id> phantom-mcp    ← one-time OAuth (opens browser)
  3. Copy .env.example → .env and fill in PHANTOM_APP_ID + TEST_RECIPIENT_ADDRESS
  4. Fund devnet wallet: solana airdrop 2 <address> --url devnet
`);
  }
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
