#!/bin/bash
# @valeo/chainlink-x402 — curl examples
BASE_URL="${1:-http://localhost:4020}"

echo "=== Public Endpoints ==="
echo ""

echo "1. Health check"
curl -s "$BASE_URL/health" | jq .
echo ""

echo "2. Pricing info"
curl -s "$BASE_URL/pricing" | jq .
echo ""

echo "3. Available feeds"
curl -s "$BASE_URL/feeds" | jq .
echo ""

echo "=== Protected Endpoints (x402 payment required) ==="
echo ""

echo "4. ETH/USD feed (expect 402)"
curl -s -w "\nHTTP Status: %{http_code}\n" "$BASE_URL/feeds/eth-usd"
echo ""

echo "5. Unknown pair (expect 404)"
curl -s "$BASE_URL/feeds/foo-bar" | jq .
echo ""

echo ""
echo "=== To make PAID requests ==="
echo '  import { wrapFetch } from "@x402/fetch";'
echo '  const x402fetch = wrapFetch(fetch, wallet);'
echo '  const res = await x402fetch("http://localhost:4020/feeds/eth-usd");'
