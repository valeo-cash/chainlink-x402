export interface FeedConfig {
  address: string;
  decimals: number;
  description: string;
}

export interface FeedResult {
  pair: string;
  price: string;
  decimals: number;
  roundId: string;
  updatedAt: string;
  feedAddress: string;
  network: string;
  chainId: number;
  timestamp: string;
}

export interface PricingInfo {
  pricePerCall: string;
  network: string;
  chainId: number;
  facilitatorUrl: string;
  availablePairs: string[];
  asset: string;
}

export interface ServerConfig {
  rpcUrl: string;
  network: "base";
  pricePerCall: string;
  port: number;
  facilitatorUrl: string;
  resourceWallet: string;
  verifyFeeds: boolean;
}

export interface NetworkConfig {
  chainId: number;
  caip2: string;
  rpcDefault: string;
  usdcAddress: string;
}
