// Smoke test: pure unit (ai/store) + live HTTP against a spawned server.
const assert = require("assert");
const { spawn } = require("child_process");

async function main() {
  const store = require("../src/store");
  const ai = require("../src/ai");
  store.save({ products: store.DEFAULT_PRODUCTS, transactions: [] });

  const g = await ai.generateProducts("plant store for apartments");
  assert(Array.isArray(g.products) && g.products.length >= 4, "generateProducts failed");
  console.log("generateProducts OK:", g.provider, g.products.length);

  const c = await ai.chatAgent("gift under $25 for a plant lover", g.products, []);
  assert(c.reply && c.reply.length > 20, "chatAgent failed");
  console.log("chatAgent OK:", c.provider);

  const ins = await ai.insights(g.products, [{ amount: 18, items: [{ name: g.products[0].name, qty: 2 }] }]);
  assert(ins.bullets.length >= 2, "insights failed");
  console.log("insights OK:", ins.bullets.length, "bullets");

  const PORT = "3211";
  const child = spawn("node", ["src/server.js"], {
    env: { ...process.env, PORT },
    stdio: "pipe",
  });
  await new Promise((r) => setTimeout(r, 1200));
  try {
    const h = await (await fetch(`http://localhost:${PORT}/api/health`)).json();
    assert(h.ok, "health failed: " + JSON.stringify(h));
    console.log("health OK:", JSON.stringify(h));
    const order = await (await fetch(`http://localhost:${PORT}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: "18.00" }) })).json();
    assert(order.id, "create order failed: " + JSON.stringify(order));
    const cap = await (await fetch(`http://localhost:${PORT}/api/orders/${order.id}/capture`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: [{ name: "Test", price: 18, qty: 1 }] }) })).json();
    assert(cap.transaction, "capture failed: " + JSON.stringify(cap).slice(0, 200));
    console.log("HTTP OK: order", order.id, "captured, txn", cap.transaction.id);
  } finally {
    child.kill();
  }
  console.log("SMOKE PASS");
}
main().catch((e) => { console.error("SMOKE FAIL:", e.message); process.exit(1); });
