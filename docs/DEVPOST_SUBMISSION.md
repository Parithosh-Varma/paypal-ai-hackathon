# Devpost submission draft

**Title:** ShopGenie — AI Storefront Builder + Agentic PayPal Checkout

**Tagline:** Describe a business, AI builds the store, an agent sells, PayPal checks out.

**Description:** Solo sellers waste hours on listings and DMs. ShopGenie turns one sentence ("plant store for apartments") into a live catalog via AI, then an agentic chat sells from that catalog (budget-aware recommendations, one-tap add to cart), and checkout completes through PayPal Sandbox Orders v2 (create + capture) with Smart Buttons. A seller dashboard (AG Grid) shows revenue, orders, AOV, filterable transactions, and AI business insights. Runs with zero keys (mock PayPal + stub AI with identical contracts) so anyone can evaluate; adding PAYPAL_* + OPENAI_API_KEY switches to live sandbox + real LLM.

**Built with:** PayPal Orders v2 / Smart Buttons (Sandbox), OpenAI gpt-4o-mini (pluggable, stub fallback), AG Grid, Express, Render, Postman.

**PayPal use:** server-side Orders v2 create + capture (`src/paypal.js`), Smart Buttons approval flow, webhook endpoint, mock fallback that preserves the ledger contract.

**AI use:** (1) catalog generation from natural language, (2) shopping agent with recommendations + cart actions, (3) revenue insights. All in `src/ai.js` with OpenAI-or-stub switch.

**Demo:** hosted URL + repo setup (`npm install && npm start` → http://localhost:3000). Video per `docs/DEMO_SCRIPT.md`.
