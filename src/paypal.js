// PayPal REST client (Sandbox by default). Throws if creds missing — server falls back to mock mode.
const PAYPAL_BASE =
  (process.env.PAYPAL_MODE || "sandbox") === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

function creds() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Missing PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET");
  return { id, secret };
}

async function accessToken() {
  const { id, secret } = creds();
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  return (await res.json()).access_token;
}

async function createOrder({ amount, currency = "USD", description = "ShopGenie order" }) {
  const token = await accessToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: currency, value: String(amount) }, description }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal createOrder ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

async function captureOrder(orderId) {
  const token = await accessToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal capture ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

module.exports = { createOrder, captureOrder, PAYPAL_BASE };
