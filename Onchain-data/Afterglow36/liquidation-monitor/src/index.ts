import "dotenv/config";
import fs from "node:fs";
import {
  Contract,
  formatUnits,
  id,
  Interface,
  JsonRpcProvider,
  WebSocketProvider,
  ZeroAddress,
} from "ethers";

const HTTP_RPC_URL = mustEnv("HTTP_RPC_URL");
const WSS_RPC_URL = process.env.WSS_RPC_URL ?? "";

const MORPHO_ADDRESS = mustEnv("MORPHO_ADDRESS").toLowerCase();
const TARGET_MARKET_ID = mustEnv("TARGET_MARKET_ID").toLowerCase();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "";

const STATE_FILE = process.env.STATE_FILE ?? ".monitor-state.json";

const ORACLE_SCALE = 10n ** 36n;
const NATIVE_DECIMALS = 18;

const morphoAbi = [
  "event Liquidate(bytes32 indexed id,address indexed caller,address indexed borrower,uint256 repaidAssets,uint256 repaidShares,uint256 seizedAssets,uint256 badDebtAssets,uint256 badDebtShares)",
  "function idToMarketParams(bytes32 id) view returns (address loanToken,address collateralToken,address oracle,address irm,uint256 lltv)",
];

const erc20Abi = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

const oracleAbi = ["function price() view returns (uint256)"];

const morphoIface = new Interface(morphoAbi);

const liquidateTopic0 = id(
  "Liquidate(bytes32,address,address,uint256,uint256,uint256,uint256,uint256)"
);

type TokenInfo = {
  address: string;
  symbol: string;
  decimals: number;
};

type MonitorState = {
  lastScannedBlock?: number;
};

type DigestResult = {
  txHash: string;
  blockNumber: number;

  marketId: string;
  caller: string;
  borrower: string;

  loanToken: TokenInfo;
  collateralToken: TokenInfo;
  oracle: string;

  repaidAssetsRaw: bigint;
  seizedAssetsRaw: bigint;
  badDebtAssetsRaw: bigint;

  repaidAssets: string;
  seizedAssets: string;
  badDebtAssets: string;

  oraclePriceRaw: bigint;
  collateralValueInLoanRaw: bigint;
  grossRevenueRaw: bigint;

  txFeeRaw: bigint;
  baseFeeCostRaw: bigint;
  priorityFeeCostRaw: bigint;
  netProfitRaw: bigint;

  grossRevenue: string;
  txFee: string;
  baseFeeCost: string;
  priorityFeeCost: string;
  netProfit: string;
  margin: string;

  message: string;
};

function mustEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function shortHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

function toHexBlockNumber(blockNumber: number): string {
  return `0x${blockNumber.toString(16)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatSignedUnits(
  value: bigint,
  decimals: number,
  precision = 8
): string {
  const negative = value < 0n;
  const abs = negative ? -value : value;

  const raw = formatUnits(abs, decimals);
  const [intPart, fracPart = ""] = raw.split(".");

  const trimmedFrac = fracPart.slice(0, precision).replace(/0+$/, "");
  const result = trimmedFrac ? `${intPart}.${trimmedFrac}` : intPart;

  return negative ? `-${result}` : result;
}

function calcMargin(netProfitRaw: bigint, grossRevenueRaw: bigint): string {
  if (grossRevenueRaw <= 0n) return "N/A";

  const negative = netProfitRaw < 0n;
  const abs = negative ? -netProfitRaw : netProfitRaw;

  const bps = (abs * 10000n) / grossRevenueRaw;
  const integer = bps / 100n;
  const frac = bps % 100n;

  return `${negative ? "-" : ""}${integer}.${frac
    .toString()
    .padStart(2, "0")}%`;
}

function loadState(): MonitorState {
  if (!fs.existsSync(STATE_FILE)) return {};

  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveState(state: MonitorState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function getTokenInfo(
  provider: JsonRpcProvider,
  address: string
): Promise<TokenInfo> {
  if (address.toLowerCase() === ZeroAddress.toLowerCase()) {
    return {
      address,
      symbol: "HYPE",
      decimals: 18,
    };
  }

  const token = new Contract(address, erc20Abi, provider);

  const [symbol, decimals] = await Promise.all([
    token.symbol().catch(() => "UNKNOWN"),
    token.decimals().catch(() => 18),
  ]);

  return {
    address,
    symbol,
    decimals: Number(decimals),
  };
}

function receiptHasTargetLiquidation(receipt: any): boolean {
  for (const log of receipt.logs ?? []) {
    if (log.address.toLowerCase() !== MORPHO_ADDRESS.toLowerCase()) {
      continue;
    }

    if (!log.topics?.[0]) {
      continue;
    }

    if (log.topics[0].toLowerCase() !== liquidateTopic0.toLowerCase()) {
      continue;
    }

    try {
      const parsed = morphoIface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });

      if (!parsed) continue;

      const marketId = String(parsed.args.id).toLowerCase();

      if (marketId === TARGET_MARKET_ID.toLowerCase()) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

async function digest(txHash: string): Promise<DigestResult> {
  const provider = new JsonRpcProvider(HTTP_RPC_URL);

  const tx = await provider.getTransaction(txHash);
  if (!tx) {
    throw new Error(`Transaction not found: ${txHash}`);
  }

  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) {
    throw new Error(`Receipt not found: ${txHash}`);
  }

  if (receipt.status !== 1) {
    throw new Error(`Transaction failed: ${txHash}`);
  }

  const block = await provider.getBlock(receipt.blockNumber);
  if (!block) {
    throw new Error(`Block not found: ${receipt.blockNumber}`);
  }

  const morphoLogs = receipt.logs.filter(
    (log) =>
      log.address.toLowerCase() === MORPHO_ADDRESS.toLowerCase() &&
      log.topics[0]?.toLowerCase() === liquidateTopic0.toLowerCase()
  );

  if (morphoLogs.length === 0) {
    throw new Error(`No Morpho Liquidate event found in tx: ${txHash}`);
  }

  let selected: any | undefined;

  for (const log of morphoLogs) {
    const parsed = morphoIface.parseLog({
      topics: log.topics as string[],
      data: log.data,
    });

    if (!parsed) continue;

    const marketId = String(parsed.args.id).toLowerCase();

    if (marketId === TARGET_MARKET_ID.toLowerCase()) {
      selected = parsed;
      break;
    }
  }

  if (!selected) {
    throw new Error(`No target market Liquidate event found in tx: ${txHash}`);
  }

  const marketId = String(selected.args.id);
  const caller = String(selected.args.caller);
  const borrower = String(selected.args.borrower);

  const repaidAssetsRaw = BigInt(selected.args.repaidAssets);
  const seizedAssetsRaw = BigInt(selected.args.seizedAssets);
  const badDebtAssetsRaw = BigInt(selected.args.badDebtAssets);

  const morpho = new Contract(MORPHO_ADDRESS, morphoAbi, provider);

  const marketParams = await morpho.idToMarketParams(marketId, {
    blockTag: receipt.blockNumber,
  });

  const loanTokenAddress = String(marketParams.loanToken);
  const collateralTokenAddress = String(marketParams.collateralToken);
  const oracleAddress = String(marketParams.oracle);

  const [loanToken, collateralToken] = await Promise.all([
    getTokenInfo(provider, loanTokenAddress),
    getTokenInfo(provider, collateralTokenAddress),
  ]);

  const oracle = new Contract(oracleAddress, oracleAbi, provider);

  const oraclePriceRaw = BigInt(
    await oracle.price({
      blockTag: receipt.blockNumber,
    })
  );

  const collateralValueInLoanRaw =
    (seizedAssetsRaw * oraclePriceRaw) / ORACLE_SCALE;

  const grossRevenueRaw = collateralValueInLoanRaw - repaidAssetsRaw;

  const gasUsed = BigInt(receipt.gasUsed);
  const effectiveGasPrice = BigInt(
    (receipt as any).gasPrice ?? tx.gasPrice ?? 0n
  );
  const baseFeePerGas = BigInt(block.baseFeePerGas ?? 0n);

  const txFeeRaw = gasUsed * effectiveGasPrice;
  const baseFeeCostRaw = gasUsed * baseFeePerGas;
  const priorityFeeCostRaw =
    effectiveGasPrice > baseFeePerGas
      ? gasUsed * (effectiveGasPrice - baseFeePerGas)
      : 0n;

  // MVP 假设 loanToken = WHYPE，gas 用 HYPE 支付，二者近似 1:1。
  // 如果以后扩展到非 WHYPE loanToken，需要将 gas cost 按价格换算到 loanToken。
  const netProfitRaw = grossRevenueRaw - txFeeRaw;

  const repaidAssets = formatSignedUnits(
    repaidAssetsRaw,
    loanToken.decimals,
    8
  );

  const seizedAssets = formatSignedUnits(
    seizedAssetsRaw,
    collateralToken.decimals,
    8
  );

  const badDebtAssets = formatSignedUnits(
    badDebtAssetsRaw,
    loanToken.decimals,
    8
  );

  const grossRevenue = formatSignedUnits(
    grossRevenueRaw,
    loanToken.decimals,
    8
  );

  const txFee = formatSignedUnits(txFeeRaw, NATIVE_DECIMALS, 8);
  const baseFeeCost = formatSignedUnits(baseFeeCostRaw, NATIVE_DECIMALS, 8);
  const priorityFeeCost = formatSignedUnits(
    priorityFeeCostRaw,
    NATIVE_DECIMALS,
    8
  );

  const netProfit = formatSignedUnits(netProfitRaw, loanToken.decimals, 8);
  const margin = calcMargin(netProfitRaw, grossRevenueRaw);

  const message = formatTelegramMessage({
    txHash,
    blockNumber: receipt.blockNumber,
    marketId,
    caller,
    borrower,
    loanToken,
    collateralToken,
    oracle: oracleAddress,
    repaidAssets,
    seizedAssets,
    badDebtAssets,
    grossRevenue,
    txFee,
    baseFeeCost,
    priorityFeeCost,
    netProfit,
    margin,
  });

  return {
    txHash,
    blockNumber: receipt.blockNumber,
    marketId,
    caller,
    borrower,
    loanToken,
    collateralToken,
    oracle: oracleAddress,

    repaidAssetsRaw,
    seizedAssetsRaw,
    badDebtAssetsRaw,

    repaidAssets,
    seizedAssets,
    badDebtAssets,

    oraclePriceRaw,
    collateralValueInLoanRaw,
    grossRevenueRaw,

    txFeeRaw,
    baseFeeCostRaw,
    priorityFeeCostRaw,
    netProfitRaw,

    grossRevenue,
    txFee,
    baseFeeCost,
    priorityFeeCost,
    netProfit,
    margin,

    message,
  };
}

function formatTelegramMessage(d: {
  txHash: string;
  blockNumber: number;
  marketId: string;
  caller: string;
  borrower: string;
  loanToken: TokenInfo;
  collateralToken: TokenInfo;
  oracle: string;
  repaidAssets: string;
  seizedAssets: string;
  badDebtAssets: string;
  grossRevenue: string;
  txFee: string;
  baseFeeCost: string;
  priorityFeeCost: string;
  netProfit: string;
  margin: string;
}): string {
  return `
🧹 Morpho Liquidation Detected

Market:
${d.collateralToken.symbol} / ${d.loanToken.symbol}

Tx:
${shortHash(d.txHash)}

Block:
${d.blockNumber}

Borrower:
${shortAddr(d.borrower)}

Caller / Executor:
${shortAddr(d.caller)}

Repaid:
${d.repaidAssets} ${d.loanToken.symbol}

Seized:
${d.seizedAssets} ${d.collateralToken.symbol}

Oracle Gross Revenue:
${d.grossRevenue} ${d.loanToken.symbol}

Gas Cost:
${d.txFee} HYPE

Base Fee:
${d.baseFeeCost} HYPE

Priority / Bribe-like Fee:
${d.priorityFeeCost} HYPE

Oracle Estimated Net Profit:
${d.netProfit} ${d.loanToken.symbol}

Margin:
${d.margin}

Bad Debt:
${d.badDebtAssets} ${d.loanToken.symbol}

Market ID:
${shortHash(d.marketId)}

Note:
Oracle-based estimate, not realized swap profit.
`.trim();
}

function shouldSendTelegram(): boolean {
  if (process.env.SEND_TELEGRAM === "false") return false;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;
  if (TELEGRAM_BOT_TOKEN === "dummy" || TELEGRAM_CHAT_ID === "dummy") {
    return false;
  }
  return true;
}

async function sendTelegram(message: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Telegram send failed: ${res.status} ${text}`);
  }
}

async function processLiquidationTx(
  txHash: string,
  seen: Set<string>
): Promise<void> {
  if (seen.has(txHash.toLowerCase())) return;
  seen.add(txHash.toLowerCase());

  console.log("Processing liquidation tx:", txHash);

  try {
    const result = await digest(txHash);
    console.log(result.message);

    if (shouldSendTelegram()) {
      await sendTelegram(result.message);
      console.log("Sent to Telegram:", txHash);
    } else {
      console.log("Telegram disabled or not configured.");
    }
  } catch (err) {
    console.error("Failed to process tx:", txHash, err);
  }
}

async function findTargetLiquidationTxsInBlock(
  provider: JsonRpcProvider,
  blockNumber: number
): Promise<string[]> {
  const txHashes = new Set<string>();

  const rawBlock = await provider.send("eth_getBlockByNumber", [
    toHexBlockNumber(blockNumber),
    true,
  ]);

  if (!rawBlock) {
    console.log(`Block ${blockNumber} not found.`);
    return [];
  }

  const txs = rawBlock.transactions ?? [];

  for (const tx of txs) {
    const txHash = typeof tx === "string" ? tx : tx.hash;
    if (!txHash) continue;

    try {
      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt || receipt.status !== 1) {
        continue;
      }

      if (receiptHasTargetLiquidation(receipt)) {
        txHashes.add(txHash);
      }
    } catch (err) {
      console.error(`Failed to check receipt ${txHash}:`, err);
    }
  }

  return [...txHashes];
}

async function findTargetLiquidationTxsByReceipts(
  provider: JsonRpcProvider,
  fromBlock: number,
  toBlock: number
): Promise<string[]> {
  const txHashes = new Set<string>();

  for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
    console.log(`Checking block ${blockNumber}...`);

    const blockTxHashes = await findTargetLiquidationTxsInBlock(
      provider,
      blockNumber
    );

    for (const txHash of blockTxHashes) {
      console.log("Found target liquidation tx:", txHash);
      txHashes.add(txHash);
    }
  }

  return [...txHashes];
}

async function runDigestMode(): Promise<void> {
  const txHash = process.argv[3];

  if (!txHash) {
    throw new Error("Usage: npm run digest -- <txHash>");
  }

  const result = await digest(txHash);
  console.log(result.message);
}

async function runSendTestMode(): Promise<void> {
  const message = `
✅ Liquidation Monitor Test

Telegram connection is working.

Morpho:
${MORPHO_ADDRESS}

Market:
${TARGET_MARKET_ID}
`.trim();

  await sendTelegram(message);
  console.log("Telegram test message sent.");
}

async function runScanMode(): Promise<void> {
  const fromBlockArg = process.argv[3];
  const toBlockArg = process.argv[4];

  if (!fromBlockArg || !toBlockArg) {
    throw new Error("Usage: npm run scan -- <fromBlock> <toBlock>");
  }

  const fromBlock = Number(fromBlockArg);
  const toBlock = Number(toBlockArg);

  if (!Number.isInteger(fromBlock) || !Number.isInteger(toBlock)) {
    throw new Error("fromBlock and toBlock must be integers");
  }

  if (toBlock < fromBlock) {
    throw new Error("toBlock must be >= fromBlock");
  }

  const provider = new JsonRpcProvider(HTTP_RPC_URL);
  const seen = new Set<string>();

  console.log(`Scanning blocks ${fromBlock} to ${toBlock} by receipts...`);
  console.log("Morpho:", MORPHO_ADDRESS);
  console.log("Target market:", TARGET_MARKET_ID);
  console.log("Liquidate topic0:", liquidateTopic0);

  const txHashes = await findTargetLiquidationTxsByReceipts(
    provider,
    fromBlock,
    toBlock
  );

  console.log(`Found ${txHashes.length} target liquidation txs.`);

  for (const txHash of txHashes) {
    await processLiquidationTx(txHash, seen);
  }

  console.log("Scan finished.");
}

async function runPollMode(): Promise<void> {
  const provider = new JsonRpcProvider(HTTP_RPC_URL);
  const seen = new Set<string>();

  const pollIntervalMs = Number(process.env.POLL_INTERVAL_MS ?? "5000");
  const confirmations = Number(process.env.BLOCK_CONFIRMATIONS ?? "2");
  const maxBlocksPerPoll = Number(process.env.MAX_BLOCKS_PER_POLL ?? "20");

  const state = loadState();

  const latest = await provider.getBlockNumber();
  const safeLatest = latest - confirmations;

  let nextBlock: number;

  if (process.env.START_BLOCK) {
    nextBlock = Number(process.env.START_BLOCK);
  } else if (state.lastScannedBlock !== undefined) {
    nextBlock = state.lastScannedBlock + 1;
  } else {
    nextBlock = safeLatest + 1;
  }

  if (!Number.isInteger(nextBlock)) {
    throw new Error("Invalid START_BLOCK or state.lastScannedBlock");
  }

  console.log("Starting receipt-based HTTP polling monitor...");
  console.log("Morpho:", MORPHO_ADDRESS);
  console.log("Target market:", TARGET_MARKET_ID);
  console.log("Start block:", nextBlock);
  console.log("Poll interval:", pollIntervalMs, "ms");
  console.log("Confirmations:", confirmations);
  console.log("Max blocks per poll:", maxBlocksPerPoll);
  console.log("State file:", STATE_FILE);

  while (true) {
    try {
      const currentLatest = await provider.getBlockNumber();
      const safeToBlock = currentLatest - confirmations;

      if (safeToBlock < nextBlock) {
        await sleep(pollIntervalMs);
        continue;
      }

      const batchToBlock = Math.min(
        safeToBlock,
        nextBlock + maxBlocksPerPoll - 1
      );

      console.log(`Scanning blocks ${nextBlock} to ${batchToBlock}...`);

      for (
        let blockNumber = nextBlock;
        blockNumber <= batchToBlock;
        blockNumber++
      ) {
        const txHashes = await findTargetLiquidationTxsInBlock(
          provider,
          blockNumber
        );

        if (txHashes.length > 0) {
          console.log(
            `Block ${blockNumber}: found ${txHashes.length} target liquidation txs.`
          );
        }

        for (const txHash of txHashes) {
          await processLiquidationTx(txHash, seen);
        }

        state.lastScannedBlock = blockNumber;
        saveState(state);
      }

      nextBlock = batchToBlock + 1;
    } catch (err) {
      console.error("Polling error:", err);
    }

    await sleep(pollIntervalMs);
  }
}

async function runBotMode(): Promise<void> {
  if (!WSS_RPC_URL || WSS_RPC_URL === "dummy") {
    throw new Error("Missing valid WSS_RPC_URL");
  }

  const provider = new WebSocketProvider(WSS_RPC_URL);
  const seen = new Set<string>();

  const filter = {
    address: MORPHO_ADDRESS,
    topics: [liquidateTopic0, TARGET_MARKET_ID],
  };

  console.log("Listening for Morpho Liquidate events via WebSocket...");
  console.log("Morpho:", MORPHO_ADDRESS);
  console.log("Market:", TARGET_MARKET_ID);

  provider.on(filter, async (log) => {
    const txHash = log.transactionHash;

    try {
      await processLiquidationTx(txHash, seen);
    } catch (err) {
      console.error("Failed to process liquidation:", txHash, err);
    }
  });
}

async function runDebugTxMode(): Promise<void> {
  const txHash = process.argv[3];

  if (!txHash) {
    throw new Error("Usage: npm run debug-tx -- <txHash>");
  }

  const provider = new JsonRpcProvider(HTTP_RPC_URL);

  const tx = await provider.getTransaction(txHash);
  const receipt = await provider.getTransactionReceipt(txHash);

  if (!tx || !receipt) {
    throw new Error(`tx or receipt not found: ${txHash}`);
  }

  console.log("txHash:", txHash);
  console.log("tx.blockNumber:", tx.blockNumber);
  console.log("receipt.blockNumber:", receipt.blockNumber);
  console.log("status:", receipt.status);
  console.log("logs count:", receipt.logs.length);
  console.log("Morpho:", MORPHO_ADDRESS);
  console.log("Target market:", TARGET_MARKET_ID);
  console.log("Liquidate topic0:", liquidateTopic0);
  console.log("");

  for (let i = 0; i < receipt.logs.length; i++) {
    const log = receipt.logs[i];

    console.log(`Log ${i}`);
    console.log("address:", log.address);
    console.log("topic0:", log.topics[0]);

    const isMorpho =
      log.address.toLowerCase() === MORPHO_ADDRESS.toLowerCase();

    const isLiquidate =
      log.topics[0]?.toLowerCase() === liquidateTopic0.toLowerCase();

    console.log("isMorpho:", isMorpho);
    console.log("isLiquidate:", isLiquidate);

    if (isMorpho && isLiquidate) {
      const parsed = morphoIface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });

      if (parsed) {
        const marketId = String(parsed.args.id);

        console.log("parsed name:", parsed.name);
        console.log("id:", marketId);
        console.log("caller:", String(parsed.args.caller));
        console.log("borrower:", String(parsed.args.borrower));
        console.log("repaidAssets:", String(parsed.args.repaidAssets));
        console.log("seizedAssets:", String(parsed.args.seizedAssets));
        console.log(
          "market matched:",
          marketId.toLowerCase() === TARGET_MARKET_ID.toLowerCase()
        );
      }
    }

    console.log("");
  }

  console.log(
    "receiptHasTargetLiquidation:",
    receiptHasTargetLiquidation(receipt)
  );
}

async function runFindMarketMode(): Promise<void> {
  const txHash = process.argv[3];

  if (!txHash) {
    throw new Error("Usage: npm run find-market -- <txHash>");
  }

  const provider = new JsonRpcProvider(HTTP_RPC_URL);
  const receipt = await provider.getTransactionReceipt(txHash);

  if (!receipt) {
    throw new Error(`Receipt not found: ${txHash}`);
  }

  console.log("tx:", txHash);
  console.log("block:", receipt.blockNumber);
  console.log("");

  let found = false;

  for (const log of receipt.logs) {
    if (log.topics[0]?.toLowerCase() !== liquidateTopic0.toLowerCase()) {
      continue;
    }

    found = true;

    const parsed = morphoIface.parseLog({
      topics: log.topics as string[],
      data: log.data,
    });

    if (!parsed) continue;

    console.log("===== Morpho Liquidate Event Found =====");
    console.log("MORPHO_ADDRESS =", log.address);
    console.log("TARGET_MARKET_ID =", parsed.args.id);
    console.log("caller =", parsed.args.caller);
    console.log("borrower =", parsed.args.borrower);
    console.log("repaidAssets =", parsed.args.repaidAssets.toString());
    console.log("repaidShares =", parsed.args.repaidShares.toString());
    console.log("seizedAssets =", parsed.args.seizedAssets.toString());
    console.log("badDebtAssets =", parsed.args.badDebtAssets.toString());
    console.log("badDebtShares =", parsed.args.badDebtShares.toString());
    console.log("");
  }

  if (!found) {
    console.log("No Liquidate event found in this tx.");
  }
}

async function main(): Promise<void> {
  const mode = process.argv[2];

  if (mode === "digest") {
    await runDigestMode();
  } else if (mode === "send-test") {
    await runSendTestMode();
  } else if (mode === "scan") {
    await runScanMode();
  } else if (mode === "poll") {
    await runPollMode();
  } else if (mode === "bot") {
    await runBotMode();
  } else if (mode === "debug-tx") {
    await runDebugTxMode();
  } else if (mode === "find-market") {
    await runFindMarketMode();
  } else {
    throw new Error(
      [
        "Usage:",
        "  npm run digest -- <txHash>",
        "  npm run send-test",
        "  npm run scan -- <fromBlock> <toBlock>",
        "  npm run poll",
        "  npm run bot",
        "  npm run debug-tx -- <txHash>",
        "  npm run find-market -- <txHash>",
      ].join("\n")
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});