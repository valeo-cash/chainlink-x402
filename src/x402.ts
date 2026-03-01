import { paymentMiddleware } from "x402-express";
import type { RequestHandler } from "express";
import { getConfig } from "./config.js";

/**
 * Build the x402 payment middleware for Base mainnet.
 *
 * Route pattern syntax (from x402-express SDK source):
 *   "[param]" → matches a single path segment
 *   "GET /path" → verb-specific matching
 */
export function createPaymentMiddleware(): RequestHandler {
  const config = getConfig();

  const routes = {
    "GET /feeds/[pair]": {
      price: config.pricePerCall,
      network: "base" as const,
      config: {
        description: "Chainlink price feed data (pay-per-request)",
      },
    },
    "POST /feeds/batch": {
      price: config.pricePerCall,
      network: "base" as const,
      config: {
        description: "Batch Chainlink price feed query",
      },
    },
  };

  const payTo = config.resourceWallet as `0x${string}`;
  const facilitator = {
    url: config.facilitatorUrl as `${string}://${string}`,
  };

  console.log(`[chainlink-x402] Payment middleware configured:`);
  console.log(`  payTo: ${payTo}`);
  console.log(`  price: ${config.pricePerCall}`);
  console.log(`  network: base (chain 8453)`);
  console.log(`  facilitator: ${config.facilitatorUrl}`);
  console.log(`  protected: GET /feeds/[pair], POST /feeds/batch`);

  return paymentMiddleware(payTo, routes, facilitator) as RequestHandler;
}
