import { z } from "zod";
import dotenv from "dotenv";
import type { ServerConfig, NetworkConfig } from "./types.js";

dotenv.config();

const configSchema = z.object({
  rpcUrl: z.string().url("RPC_URL must be a valid URL"),
  network: z.literal("base").default("base"),
  pricePerCall: z.string().default("$0.001"),
  port: z.coerce.number().int().positive().default(4020),
  facilitatorUrl: z.string().url().default("https://x402.org/facilitator"),
  resourceWallet: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "RESOURCE_WALLET must be a valid Ethereum address"),
  verifyFeeds: z
    .string()
    .transform((v) => v !== "false")
    .default("true"),
});

export const NETWORK_CONFIG: NetworkConfig = {
  chainId: 8453,
  caip2: "eip155:8453",
  rpcDefault: "https://mainnet.base.org",
  usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

let _config: ServerConfig | null = null;

export function getConfig(): ServerConfig {
  if (!_config) {
    _config = configSchema.parse({
      rpcUrl: process.env.RPC_URL,
      network: process.env.NETWORK || "base",
      pricePerCall: process.env.PRICE_PER_CALL,
      port: process.env.PORT,
      facilitatorUrl: process.env.FACILITATOR_URL,
      resourceWallet: process.env.RESOURCE_WALLET,
      verifyFeeds: process.env.VERIFY_FEEDS,
    });
  }
  return _config;
}

export function getNetworkConfig(): NetworkConfig {
  return NETWORK_CONFIG;
}
