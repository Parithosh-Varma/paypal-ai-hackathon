# ShopGenie — AI Storefront Builder + Agentic PayPal Checkout
**PayPal AI Hackathon 2026 · Build What's Next with PayPal and AI**

Describe a business in plain English → AI builds the product catalog → an AI sales agent sells → checkout runs on **PayPal Sandbox (Orders v2)** → seller dashboard (AG Grid) shows revenue + AI insights.

Demo runs with **zero API keys** (mock PayPal + stub AI). Add keys for live behavior.

## 60-second run (judges)

```bash
npm install
cp .env.example .env   # optional — demo works without keys
npm start
# open http://localhost:3000
```

1. **Seller Studio:** keep "cozy neighborhood coffee shop" (or type "plant store") → Generate products → catalog appears.
2. **Shop + Agent:** ask "gift under $25" → agent recommends → Add to cart → **1-click mock PayPal capture** (or PayPal buttons if `PAYPAL_CLIENT_ID` set).
3. **Dashboard:** revenue updates, AG Grid ledger row appears, AI insights refresh.

With keys (`PAYPAL_CLIENT_ID/SECRET` sandbox + `OPENAI_API_KEY`): same flow uses real PayPal order create/capture + real LLM copy.

## What counts for judging

| Requirement | Where |
|---|---|
| PayPal, meaningful | `src/paypal.js` + `POST /api/orders`, `POST /api/orders/:id/capture` (Orders v2, sandbox). Smart Buttons in `public/app.js`. |
| AI, meaningful | `src/ai.js`: product generation, agentic shopping chat (recommends + auto-adds to cart), business insights. OpenAI when key set, same-contract stub otherwise. |
| Working prototype | 3 views end-to-end in one deployable Node app, no build step. |
| Docs to evaluate | This README + `docs/` (demo script, Devpost draft, architecture). |
| Public repo + license | This repo, MIT `LICENSE`. |

## API

- `GET /api/health`, `GET /api/config`
- `GET /api/products`, `POST /api/products/generate {idea}`, `PUT /api/products {products}`
- `POST /api/ai/chat {message, cart}`, `GET /api/ai/insights`
- `POST /api/orders {amount, currency, items}`, `POST /api/orders/:id/capture {items, buyerNote}`
- `GET /api/transactions`, `POST /api/webhooks/paypal`

Postman: import `postman_collection.json` (set `base`).

## Deploy (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Parithosh-Varma/paypal-ai-hackathon)

Or manual: New → Web Service → `npm install` / `npm start`, add `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `OPENAI_API_KEY` as env vars. `render.yaml` included.

## Tools used

- PayPal Developer Platform (Sandbox, Orders v2, Smart Buttons)
- OpenAI (`gpt-4o-mini`, pluggable — any chat model works via `src/ai.js`)
- AG Grid Community (dashboard ledger — sponsor track)
- Render (hosting — sponsor track), Postman (API collection — sponsor track)
- Node 20+, Express, vanilla JS (no build step so judges can run instantly)

## Env

See `.env.example`. Only `PORT` is required to boot. Everything else degrades gracefully and the header badge shows `MOCK` vs `LIVE sandbox` mode.

## Project layout

```
src/server.js   Express API + static hosting
src/paypal.js   PayPal REST client
src/ai.js       OpenAI-or-stub provider
src/store.js    JSON-file ledger (data/db.json, gitignored)
public/         3-view frontend (seller / shop+agent / dashboard)
docs/           demo script, Devpost draft, architecture
```

## License

MIT — see `LICENSE`.
