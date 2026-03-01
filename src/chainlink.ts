import { ethers, getAddress } from "ethers";
import { AGGREGATOR_V3_ABI, BASE_MAINNET_FEEDS } from "./feeds.js";
import { getConfig, getNetworkConfig } from "./config.js";
import type { FeedResult, FeedConfig } from "./types.js";

let provider: ethers.JsonRpcProvider | null = null;

function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(getConfig().rpcUrl);
  }
  return provider;
}

/** Normalize address to proper EIP-55 checksum. */
function checksumAddress(addr: string): string {
  return getAddress(addr.toLowerCase());
}

/**
 * Read latest data from a Chainlink price feed.
 */
export async function readFeed(pair: string, feedConfig: FeedConfig): Promise<FeedResult> {
  const config = getConfig();
  const net = getNetworkConfig();
  const contract = new ethers.Contract(
    checksumAddress(feedConfig.address),
    AGGREGATOR_V3_ABI,
    getProvider(),
  );

  const [roundData, decimals] = await Promise.all([
    contract.latestRoundData(),
    contract.decimals(),
  ]);

  const [roundId, answer, , updatedAt] = roundData;
  const decimalCount = Number(decimals);

  return {
    pair,
    price: ethers.formatUnits(answer, decimalCount),
    decimals: decimalCount,
    roundId: roundId.toString(),
    updatedAt: new Date(Number(updatedAt) * 1000).toISOString(),
    feedAddress: feedConfig.address,
    network: config.network,
    chainId: net.chainId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Verify all feed addresses on-chain at startup.
 * Calls description() on each contract and checks it matches our config.
 * Crashes the process if any address is wrong or unreachable.
 */
export async function verifyFeeds(): Promise<void> {
  const p = getProvider();
  const feeds = BASE_MAINNET_FEEDS;

  console.log(
    `[chainlink-x402] Verifying ${Object.keys(feeds).length} feeds on Base mainnet...`,
  );

  const errors: string[] = [];

  for (const [pair, feed] of Object.entries(feeds)) {
    try {
      const contract = new ethers.Contract(
        checksumAddress(feed.address),
        AGGREGATOR_V3_ABI,
        p,
      );
      const onChainDesc: string = await contract.description();

      if (onChainDesc !== feed.description) {
        errors.push(
          `  ✗ ${pair}: expected "${feed.description}", got "${onChainDesc}" at ${feed.address}`,
        );
      } else {
        console.log(`  ✓ ${pair} → ${feed.address} (${onChainDesc})`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`  ✗ ${pair}: failed to query ${feed.address} — ${msg}`);
    }
  }

  if (errors.length > 0) {
    console.error("[chainlink-x402] Feed verification FAILED:");
    errors.forEach((e) => console.error(e));
    console.error(
      "\n[chainlink-x402] Fix addresses in src/feeds.ts or set VERIFY_FEEDS=false to skip.\n" +
        "Reference: https://docs.chain.link/data-feeds/price-feeds/addresses",
    );
    process.exit(1);
  }

  console.log("[chainlink-x402] All feeds verified ✓");
}
