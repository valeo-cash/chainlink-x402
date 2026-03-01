# @valeo/chainlink-x402

Pay-per-request Chainlink Data Feeds via the [x402 payment protocol](https://x402.org) on Base mainnet.

## Quick Start

```bash
git clone https://github.com/valeo-cash/chainlink-x402.git
cd chainlink-x402
cp .env.example .env
# Edit .env — set RESOURCE_WALLET to your address

pnpm install
pnpm dev
```

## How It Works

```
1. Client → GET /feeds/eth-usd
   Server → 402 Payment Required + payment instructions

2. Client signs $0.001 USDC payment, retries with payment header
   Server → verifies via x402 facilitator

3. Server reads Chainlink on-chain oracle → returns price data
   Client → 200 OK + JSON response
```

No API keys. No accounts. No subscriptions. Just USDC and a wallet.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | Public | Health check |
| GET | /pricing | Public | Pricing + payment info |
| GET | /feeds | Public | List available pairs |
| GET | /feeds/:pair | x402 paid | Get price feed data |
| POST | /feeds/batch | x402 paid | Batch query (max 10) |

## Available Feeds (Base Mainnet)

ETH/USD, BTC/USD, USDC/USD, DAI/USD

## Making Paid Requests

```typescript
import { wrapFetch } from "@x402/fetch";
import { createWallet } from "@x402/evm";

const wallet = createWallet(process.env.PRIVATE_KEY);
const x402fetch = wrapFetch(fetch, wallet);

const res = await x402fetch("https://your-server.com/feeds/eth-usd");
const data = await res.json();
// { pair: "eth-usd", price: "2145.12345678", decimals: 8, ... }
```

## Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `RPC_URL` | Yes | — | Base mainnet RPC endpoint |
| `RESOURCE_WALLET` | Yes | — | Address to receive USDC payments |
| `PRICE_PER_CALL` | No | `$0.001` | Cost per request |
| `PORT` | No | `4020` | Server port |
| `FACILITATOR_URL` | No | `https://x402.org/facilitator` | x402 facilitator |
| `VERIFY_FEEDS` | No | `true` | Verify feed addresses on startup |

## License

MIT — Built by [Valeo](https://valeo.cash)
