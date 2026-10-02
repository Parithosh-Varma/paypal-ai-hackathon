require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const store = require("./store");
const ai = require("./ai");
const paypal = require("./paypal");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

const PORT = process.env.PORT || 3000;
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";
const paypalConfigured = Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
const aiConfigured = Boolean(process.env.OPENAI_API_KEY);

// ---------- Meta ----------
app.get("/api/health", (_req, res) => {
  const db = store.getDb();
  res.json({
    ok: true,
    app: "shopgenie",
    paypalMode: PAYPAL_MODE,
    paypalConfigured,
    aiConfigured,
    aiProvider: aiConfigured ? "openai" : "stub",
    products: db.products.length,
    transactions: db.transactions.length,
  });
});

app.get("/api/config", (_req, res) => {
  res.json({ paypalClientId: process.env.PAYPAL_CLIENT_ID || "", paypalMode: PAYPAL_MODE });
});

// ---------- Catalog ----------
app.get("/api/products", (_req, res) => res.json(store.getDb().products));

app.post("/api/products/generate", async (req, res) => {
  try {
    const { idea = "cozy neighborhood coffee shop" } = req.body || {};
    if (typeof idea !== "string" || idea.trim().length < 3)
      return res.status(400).json({ error: "idea must be a few words or more" });
    const { provider, products } = await ai.generateProducts(idea.trim());
    store.setProducts(products);
    res.json({ provider, products });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/products", (req, res) => {
  try {
    const { products } = req.body || {};
    if (!Array.isArray(products) || !products.length)
      return res.status(400).json({ error: "products must be a non-empty array" });
    const clean = products.slice(0, 24).map((p, i) => ({
      id: String(p.id || `p${i + 1}`),
      name: String(p.name || "Untitled").slice(0, 80),
      price: Math.max(0, Number(p.price) || 0),
      category: String(p.category || "General").slice(0, 40),
      emoji: String(p.emoji || "🛍️").slice(0, 8),
      description: String(p.description || "").slice(0, 200),
    }));
    store.setProducts(clean);
    res.json(clean);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- AI ----------
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message = "", cart = [] } = req.body || {};
    if (!message.trim()) return res.status(400).json({ error: "message is required" });
    const result = await ai.chatAgent(message.trim(), store.getDb().products, cart);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/ai/insights", async (_req, res) => {
  try {
    const db = store.getDb();
    res.json(await ai.insights(db.products, db.transactions));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Back-compat with v0 starter
app.post("/api/ai/assist", async (req, res) => {
  try {
    const { prompt = "", cartTotal = "" } = req.body || {};
    const r = await ai.chatAgent(`${prompt} (cart total: ${cartTotal})`, store.getDb().products, []);
    res.json({ provider: r.provider, reply: r.reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- PayPal checkout (real when creds exist, mock otherwise) ----------
function mockOrder(amount, currency, description) {
  return {
    id: `MOCK-${Date.now().toString(36).toUpperCase()}`,
    status: "CREATED",
    mock: true,
    purchase_units: [{ amount: { currency_code: currency, value: String(amount) }, description }],
  };
}

app.post("/api/orders", async (req, res) => {
  try {
    const { amount = "10.00", currency = "USD", description = "ShopGenie order", items = [] } = req.body || {};
    if (paypalConfigured) {
      const order = await paypal.createOrder({ amount, currency, description });
      return res.json({ ...order, mock: false });
    }
    return res.json(mockOrder(amount, currency, description));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/orders/:id/capture", async (req, res) => {
  try {
    const { items = [], buyerNote = "" } = req.body || {};
    const orderId = req.params.id;
    let capture;
    if (paypalConfigured && !orderId.startsWith("MOCK-")) {
      capture = await paypal.captureOrder(orderId);
    } else {
      capture = { id: orderId, status: "COMPLETED", mock: true, payer: { name: { given_name: "Sandbox" } } };
    }
    const pu = capture.purchase_units?.[0];
    const amount =
      pu?.payments?.captures?.[0]?.amount?.value || req.body?.amount || "10.00";
    const currency = pu?.payments?.captures?.[0]?.amount?.currency_code || req.body?.currency || "USD";
    const tx = store.addTransaction({
      id: `tx_${Date.now()}`,
      orderId,
      amount: Number(amount) || 0,
      currency,
      status: capture.status || "COMPLETED",
      mock: Boolean(capture.mock),
      items: Array.isArray(items) ? items : [],
      buyerNote: String(buyerNote || "").slice(0, 200),
      createdAt: new Date().toISOString(),
    });
    res.json({ capture, transaction: tx });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Ledger / webhooks ----------
app.get("/api/transactions", (_req, res) => res.json(store.getDb().transactions));

app.post("/api/webhooks/paypal", (req, res) => {
  console.log("[paypal webhook]", JSON.stringify(req.body).slice(0, 500));
  res.json({ received: true });
});

app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "..", "public", "index.html"))
);

app.listen(PORT, () => {
  console.log(`ShopGenie on http://localhost:${PORT} (paypal: ${PAYPAL_MODE}${paypalConfigured ? "" : " — MOCK mode, set PAYPAL_* in .env for real"})`);
});
