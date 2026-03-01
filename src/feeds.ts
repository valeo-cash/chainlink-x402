import type { FeedConfig } from "./types.js";

/**
 * Minimal AggregatorV3Interface ABI.
 * Source: https://docs.chain.link/data-feeds/api-reference
 */
export const AGGREGATOR_V3_ABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Chainlink Price Feed proxy addresses on Base Mainnet (chain ID: 8453).
 *
 * Source: https://data.chain.link/feeds/base/base/<pair>
 * The `description` field must match the on-chain description() return value.
 * Verified at startup by verifyFeeds().
 */
export const BASE_MAINNET_FEEDS: Record<string, FeedConfig> = {
  "eth-usd": {
    address: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
    decimals: 8,
    description: "ETH / USD",
  },
  "btc-usd": {
    address: "0x64c911996D3c6aC71f9b455B1E8E7266BcbD848F",
    decimals: 8,
    description: "BTC / USD",
  },
  "usdc-usd": {
    address: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
    decimals: 8,
    description: "USDC / USD",
  },
  "dai-usd": {
    address: "0x591e79239a7d679378eC8c847e5038150364C78F",
    decimals: 8,
    description: "DAI / USD",
  },
};

export function getFeed(pair: string): FeedConfig | undefined {
  return BASE_MAINNET_FEEDS[pair.toLowerCase()];
}

export function getAvailablePairs(): string[] {
  return Object.keys(BASE_MAINNET_FEEDS);
}
