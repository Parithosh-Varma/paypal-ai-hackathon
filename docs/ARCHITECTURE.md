# Architecture

```
browser (3 views, vanilla JS + AG Grid CDN)
  │  GET /api/products · POST /api/products/generate
  │  POST /api/ai/chat · GET /api/ai/insights
  │  POST /api/orders · POST /api/orders/:id/capture
  ▼
Express (src/server.js)
  ├── src/ai.js ── OpenAI chat completions if OPENAI_API_KEY else stub
  │     ├── generateProducts(idea) -> products[]
  │     ├── chatAgent(message, products, cart) -> {reply, recommendedIds[]}
  │     └── insights(products, txs) -> {revenue, orders, bullets[]}
  ├── src/paypal.js ── REST Orders v2 (sandbox default)
  │     ├── createOrder · captureOrder (OAuth client-credentials)
  │     └── server falls back to MOCK- orders when creds absent
  └── src/store.js ── data/db.json {products[], transactions[]}
```

No build step, no DB to configure. `PUT /api/products` caps at 24 items, all inputs length-capped. Secrets stay server-side; only the publishable client-id is exposed via `/api/config`.
