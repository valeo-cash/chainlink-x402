import express from "express";
import { getConfig, getNetworkConfig } from "./config.js";
import { getFeed, getAvailablePairs } from "./feeds.js";
import { readFeed, verifyFeeds } from "./chainlink.js";
import { createPaymentMiddleware } from "./x402.js";
import type { PricingInfo } from "./types.js";

async function main() {
  const config = getConfig();
  const net = getNetworkConfig();

  console.log(`[chainlink-x402] Starting server...`);
  console.log(`  network: base (chain ${net.chainId})`);
  console.log(`  rpc: ${config.rpcUrl}`);
  console.log(`  port: ${config.port}`);

  // Verify feed addresses on-chain (skip with VERIFY_FEEDS=false)
  if (config.verifyFeeds) {
    await verifyFeeds();
  } else {
    console.log("[chainlink-x402] Feed verification skipped (VERIFY_FEEDS=false)");
  }

  const app = express();
  app.use(express.json());

  // x402 payment middleware — MUST be mounted BEFORE routes
  app.use(createPaymentMiddleware());

  // ── GET /health ─────────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      network: "base",
      chainId: net.chainId,
      availablePairs: getAvailablePairs(),
    });
  });

  // ── GET /pricing ────────────────────────────────────────────
  app.get("/pricing", (_req, res) => {
    const pricing: PricingInfo = {
      pricePerCall: config.pricePerCall,
      network: "base",
      chainId: net.chainId,
      facilitatorUrl: config.facilitatorUrl,
      availablePairs: getAvailablePairs(),
      asset: "USDC",
    };
    res.json(pricing);
  });

  // ── GET /feeds ──────────────────────────────────────────────
  app.get("/feeds", (_req, res) => {
    res.json({
      network: "base",
      pairs: getAvailablePairs(),
    });
  });

  // ── GET /feeds/:pair (x402 paid) ────────────────────────────
  app.get("/feeds/:pair", async (req, res) => {
    const pair = req.params.pair.toLowerCase();
    const feedConfig = getFeed(pair);

    if (!feedConfig) {
      res.status(404).json({
        error: "Unknown feed pair",
        pair,
        available: getAvailablePairs(),
      });
      return;
    }

    try {
      const result = await readFeed(pair, feedConfig);
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[chainlink-x402] Feed query failed for ${pair}: ${message}`);
      res.status(502).json({
        error: "Feed query failed",
        pair,
        details: message,
      });
    }
  });

  // ── POST /feeds/batch (x402 paid) ──────────────────────────
  app.post("/feeds/batch", async (req, res) => {
    const { pairs } = req.body as { pairs?: string[] };

    if (!pairs || !Array.isArray(pairs) || pairs.length === 0) {
      res.status(400).json({
        error: "Request body must include a non-empty 'pairs' array",
        example: { pairs: ["eth-usd", "btc-usd"] },
      });
      return;
    }

    if (pairs.length > 10) {
      res.status(400).json({ error: "Maximum 10 pairs per batch request" });
      return;
    }

    const results = await Promise.allSettled(
      pairs.map(async (pair) => {
        const p = pair.toLowerCase();
        const feedConfig = getFeed(p);
        if (!feedConfig) {
          throw new Error(`Unknown pair: ${p}`);
        }
        return readFeed(p, feedConfig);
      }),
    );

    const response = results.map((r, i) =>
      r.status === "fulfilled"
        ? { status: "ok" as const, data: r.value }
        : { status: "error" as const, pair: pairs[i], error: r.reason?.message ?? String(r.reason) },
    );

    res.json({ results: response });
  });

  // ── Start ───────────────────────────────────────────────────
  app.listen(config.port, () => {
    console.log(`\n[chainlink-x402] Server running at http://localhost:${config.port}`);
    console.log(`  GET  /health           — health check (public)`);
    console.log(`  GET  /pricing          — pricing info (public)`);
    console.log(`  GET  /feeds            — list pairs (public)`);
    console.log(`  GET  /feeds/:pair      — price feed (x402 paid)`);
    console.log(`  POST /feeds/batch      — batch query (x402 paid)\n`);
  });
}

main().catch((err) => {
  console.error("[chainlink-x402] Fatal startup error:", err);
  process.exit(1);
});
