const $ = (id) => document.getElementById(id);
const money = (n) => `$${Number(n || 0).toFixed(2)}`;
let PRODUCTS = [];
let CART = {}; // id -> qty

// Same-origin API when served by Express; in-browser fallback when hosted
// static (e.g. Cloudflare Pages) with no backend. Same contracts either way.
let OFFLINE = false;
const LS_P = "shopgenie_products", LS_TX = "shopgenie_txns";
const SEED = [
  { id: "p1", name: "Midnight Roast Beans (12oz)", price: 18, category: "Coffee", emoji: "☕", description: "Small-batch dark roast, chocolate + cherry notes." },
  { id: "p2", name: "Pour-Over Starter Kit", price: 42, category: "Coffee", emoji: "🫖", description: "Dripper, filters + brewing guide for beginners." },
  { id: "p3", name: "Ceramic Camp Mug", price: 24, category: "Merch", emoji: "🍶", description: "12oz speckled ceramic mug, campfire approved." },
  { id: "p4", name: "Sticker Pack (x8)", price: 9, category: "Merch", emoji: "✨", description: "Waterproof vinyl stickers for laptops + bottles." },
  { id: "p5", name: "Espresso Tasting Flight", price: 15, category: "In-store", emoji: "🧪", description: "Three single-origin shots + tasting card." },
  { id: "p6", name: "Brew Class Ticket", price: 35, category: "In-store", emoji: "🎓", description: "45-min weekend brewing workshop, beans included." },
];
function lsGet(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
function localProds() { const p = lsGet(LS_P, null); if (!p) { lsSet(LS_P, SEED); return SEED.slice(); } return p; }

function stubTheme(idea) {
  const s = (idea || "").toLowerCase();
  const pick = (cat, items) => items.map(([name, price, emoji, description], i) => ({ id: `p${i + 1}`, name, price, category: cat, emoji, description }));
  if (s.includes("plant")) return pick("Plants", [["Monstera Deliciosa (6in)", 28, "🪴", "Lush split-leaf starter plant."], ["Pothos Golden (4in)", 12, "🌿", "Trailing easy-care classic."], ["Succulent Trio", 18, "🌵", "Three drought-proof minis."], ["Ceramic Pot + Saucer", 22, "🏺", "Matte glaze, drainage hole."], ["Plant Food Concentrate", 14, "🧴", "Makes 24 gallons of feed."], ["Repotting Workshop Seat", 30, "🎓", "45-min weekend repot class."]]);
  if (s.includes("candle") || s.includes("soap") || s.includes("skincare")) return pick("Goods", [["Soy Candle — Cedar + Sage", 24, "🕯️", "40-hr burn, cotton wick."], ["Whipped Body Butter", 19, "🧴", "Shea + oat, unscented."], ["Oatmeal Soap Bar Trio", 16, "🧼", "Cold-process, vegan."], ["Bath Soak Pouch", 14, "🛁", "Epsom + lavender, 8oz."], ["Discovery Set (4 minis)", 22, "🎁", "Try every scent."], ["Refill — Candle Insert", 12, "♻️", "Zero-waste wax refill."]]);
  if (s.includes("art") || s.includes("print") || s.includes("sticker")) return pick("Art", [["Risograph Print 8x10", 25, "🖼️", "3-color riso, signed."], ["Sticker Pack (x10)", 10, "✨", "Waterproof vinyl sampler."], ["Zine — Issue 04", 12, "📖", "32 pages, full color."], ["Enamel Pin", 14, "📍", "Hard enamel, gold clutch."], ["Tote — Heavyweight", 28, "👜", "12oz canvas, big pocket."], ["Commission Slot", 60, "🎨", "Custom half-page piece."]]);
  return SEED.slice();
}

function localApi(path, opts) {
  const method = (opts?.method || "GET").toUpperCase();
  let body = {};
  try { body = opts?.body ? JSON.parse(opts.body) : {}; } catch {}
  const prods = localProds();
  const txs = lsGet(LS_TX, []);
  if (path === "/api/health") return { ok: true, app: "shopgenie-static", paypalMode: "mock", paypalConfigured: false, aiConfigured: false, aiProvider: "stub", products: prods.length, transactions: txs.length };
  if (path === "/api/config") return { paypalClientId: "", paypalMode: "mock" };
  if (path === "/api/products" && method === "GET") return prods;
  if (path === "/api/products/generate" && method === "POST") {
    const products = stubTheme(body.idea || "");
    lsSet(LS_P, products);
    return { provider: "stub", products };
  }
  if (path === "/api/ai/chat" && method === "POST") {
    const msg = String(body.message || "");
    const m = msg.match(/under\s?\$?(\d+)/i) || msg.match(/\$?\s?(\d+)/);
    const budget = m ? Number(m[1]) : null;
    const words = msg.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
    const scored = prods.map((p) => {
      let sc = 0;
      const hay = `${p.name} ${p.description} ${p.category}`.toLowerCase();
      for (const w of words) if (hay.includes(w)) sc += 2;
      if (budget != null && p.price <= budget) sc += 3;
      return { p, sc };
    }).sort((a, b) => b.sc - a.sc);
    const top = (scored[0]?.sc > 0 ? scored : prods.map((p) => ({ p, sc: 0 }))).slice(0, 3).map((x) => x.p);
    const total = top.reduce((s, p) => s + p.price, 0);
    return { provider: "stub", reply: `Based on "${msg}", I'd grab: ` + top.map((p) => `${p.emoji} ${p.name} ($${p.price.toFixed(2)})`).join(", ") + `. Est. total $${total.toFixed(2)} — take the tickets and ring the till to complete the demo.`, recommendedIds: top.map((p) => p.id) };
  }
  if (path === "/api/ai/insights") {
    const revenue = txs.reduce((s, t) => s + Number(t.amount || 0), 0);
    return { provider: "stub", revenue, orders: txs.length, bullets: txs.length ? [`${txs.length} order(s), $${revenue.toFixed(2)} revenue on the static demo ledger.`, `Avg ticket $${(revenue / txs.length).toFixed(2)} — bundle cheapest + priciest to lift it.`, "Connect the Express backend for live PayPal + LLM insights."] : ["No sales yet — ring the till to populate the ledger.", "Tip: a sub-$10 entry ticket raises conversion.", "Connect the Express backend for live PayPal + LLM insights."] };
  }
  if (path === "/api/orders" && method === "POST") return { id: `MOCK-${Date.now().toString(36).toUpperCase()}`, status: "CREATED", mock: true };
  const cap = path.match(/^\/api\/orders\/(.+)\/capture$/);
  if (cap && method === "POST") {
    const items = Array.isArray(body.items) ? body.items : [];
    const tx = { id: `tx_${Date.now()}`, orderId: cap[1], amount: Number(body.amount) || 0, currency: "USD", status: "COMPLETED", mock: true, items, buyerNote: String(body.buyerNote || "").slice(0, 200), createdAt: new Date().toISOString() };
    lsSet(LS_TX, [tx, ...txs]);
    return { capture: { id: cap[1], status: "COMPLETED", mock: true }, transaction: tx };
  }
  if (path === "/api/transactions") return txs;
  return { error: "static demo: unknown route " + path };
}

async function api(path, opts) {
  if (!OFFLINE) {
    try {
      const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
      const text = await res.text();
      try { return JSON.parse(text); } catch { return { raw: text, status: res.status }; }
    } catch { OFFLINE = true; }
  }
  return localApi(path, opts);
}

// Stall rail
document.querySelectorAll("nav.tabs button").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll("nav.tabs button").forEach((x) => x.classList.remove("active"));
    document.querySelectorAll(".view").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    $("view-" + b.dataset.tab).classList.add("active");
    if (b.dataset.tab === "dash") loadDashboard();
  };
});

function esc(s) { return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

function productCard(p, mode) {
  const qty = CART[p.id] || 0;
  const btn = mode === "shop"
    ? `<button class="take" onclick="addToCart('${p.id}')">Take ticket${qty ? ` · ${qty} in cart` : ""}</button>`
    : "";
  return `<article class="ticket"><div class="em" aria-hidden="true">${esc(p.emoji)}</div><h4>${esc(p.name)}</h4>
    <div class="price">${money(p.price)}<span class="cat">${esc(p.category)}</span></div>
    <p class="desc">${esc(p.description)}</p>${btn}</article>`;
}

async function loadProducts() {
  PRODUCTS = await api("/api/products");
  $("pCount").textContent = PRODUCTS.length;
  $("sellerGrid").innerHTML = PRODUCTS.map((p) => productCard(p, "seller")).join("");
  $("shopGrid").innerHTML = PRODUCTS.map((p) => productCard(p, "shop")).join("");
}

window.addToCart = (id) => {
  CART[id] = (CART[id] || 0) + 1;
  renderCart(); loadProducts();
};

function renderCart() {
  const entries = Object.entries(CART);
  hideStamp();
  if (!entries.length) {
    $("cartList").textContent = "Empty — take a ticket above.";
    $("cartTotal").textContent = "$0.00";
    $("amount").value = "";
    return;
  }
  let total = 0;
  $("cartList").innerHTML = entries.map(([id, qty]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return "";
    total += p.price * qty;
    return `<div>${esc(p.emoji)} ${esc(p.name)} ×${qty} — ${money(p.price * qty)} <button class="ghost" style="padding:.1rem .5rem" onclick="rmFromCart('${id}')" aria-label="Remove one">−</button></div>`;
  }).join("");
  $("cartTotal").textContent = money(total);
  $("amount").value = total.toFixed(2);
}
window.rmFromCart = (id) => {
  CART[id]--;
  if (CART[id] <= 0) delete CART[id];
  renderCart(); loadProducts();
};

function cartItems() {
  return Object.entries(CART).map(([id, qty]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return { id, name: p?.name || id, price: p?.price || 0, qty };
  });
}
function cartTotal() {
  return cartItems().reduce((s, i) => s + i.price * i.qty, 0);
}

// Stamp — the signature moment
function showStamp() {
  const el = $("paidStamp");
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
}
function hideStamp() { $("paidStamp")?.classList.remove("show"); }

// Seller: grant the wish
$("genBtn").onclick = async () => {
  $("genBtn").disabled = true;
  $("genOut").textContent = "Consulting the lamp…";
  try {
    const idea = $("idea").value;
    const data = await api("/api/products/generate", { method: "POST", body: JSON.stringify({ idea }) });
    if (data.error) { $("genOut").textContent = "The lamp sputters: " + data.error; return; }
    $("genOut").textContent = `Lamp report · provider ${data.provider}\nStocked ${data.products.length} tickets for "${idea}"`;
    await loadProducts();
  } finally { $("genBtn").disabled = false; }
};
$("resetBtn").onclick = async () => {
  await api("/api/products", { method: "PUT", body: JSON.stringify({ products: null }) }).catch(() => {});
  location.reload();
};

// Agent chat
function pushChat(who, text) {
  const d = document.createElement("div");
  d.className = "msg " + (who === "u" ? "you" : "agent-msg");
  d.textContent = text;
  $("chatlog").appendChild(d);
  $("chatlog").scrollTop = 1e6;
  return d;
}
$("chatBtn").onclick = async () => {
  const message = $("chatIn").value.trim();
  if (!message) return;
  pushChat("u", message);
  $("chatIn").value = "";
  const thinking = pushChat("a", "Checking the shelves…");
  const data = await api("/api/ai/chat", { method: "POST", body: JSON.stringify({ message, cart: cartItems() }) });
  thinking.textContent = data.reply || data.error || "The agent is speechless.";
  if (data.recommendedIds?.length) {
    const first = data.recommendedIds[0];
    if (PRODUCTS.find((p) => p.id === first)) { CART[first] = (CART[first] || 0) + 1; renderCart(); loadProducts(); }
  }
};
$("chatIn").addEventListener("keydown", (e) => { if (e.key === "Enter") $("chatBtn").click(); });

// PayPal buttons (real when client-id present, graceful otherwise)
async function initPayPal() {
  const cfg = await api("/api/config");
  if (!cfg.paypalClientId) {
    $("payOut").textContent = "Night-market mode: no PAYPAL_CLIENT_ID in .env, so the till runs mock captures. Judges can ring sales with zero keys.";
    return;
  }
  const s = document.createElement("script");
  s.src = `https://www.paypal.com/sdk/js?client-id=${cfg.paypalClientId}&currency=USD&intent=capture`;
  s.onload = () => window.paypal.Buttons({
    createOrder: async () => {
      const amount = $("amount").value || cartTotal().toFixed(2) || "10.00";
      const order = await api("/api/orders", { method: "POST", body: JSON.stringify({ amount, currency: "USD", items: cartItems(), description: "ShopGenie order" }) });
      if (!order.id) throw new Error(JSON.stringify(order).slice(0, 200));
      return order.id;
    },
    onApprove: async (data) => {
      const result = await api(`/api/orders/${data.orderID}/capture`, { method: "POST", body: JSON.stringify({ items: cartItems(), buyerNote: $("buyerNote").value, amount: $("amount").value }) });
      $("payOut").textContent = JSON.stringify(result, null, 2);
      showStamp();
      CART = {}; renderCart(); loadDashboard();
    },
    onError: (err) => { $("payOut").textContent = "Till jam: " + err; },
  }).render("#paypal-buttons");
  document.head.appendChild(s);
}
$("mockPayBtn").onclick = async () => {
  const amount = $("amount").value || cartTotal().toFixed(2) || "10.00";
  $("payOut").textContent = "Ringing up…";
  const order = await api("/api/orders", { method: "POST", body: JSON.stringify({ amount, items: cartItems() }) });
  const result = await api(`/api/orders/${order.id}/capture`, { method: "POST", body: JSON.stringify({ items: cartItems(), buyerNote: $("buyerNote").value, amount }) });
  $("payOut").textContent = JSON.stringify(result, null, 2);
  showStamp();
  CART = {}; renderCart(); loadDashboard();
};

// Dashboard (AG Grid + insights)
let gridApi = null;
async function loadDashboard() {
  const txs = await api("/api/transactions");
  const rev = txs.reduce((s, t) => s + Number(t.amount || 0), 0);
  $("revStat").textContent = money(rev);
  $("ordStat").textContent = txs.length;
  $("aovStat").textContent = money(txs.length ? rev / txs.length : 0);
  const ins = await api("/api/ai/insights");
  $("insightsOut").textContent = `[${ins.provider}] Revenue ${money(ins.revenue)} · ${ins.orders} orders\n• ` + (ins.bullets || []).join("\n• ");
  const colDefs = [
    { field: "createdAt", headerName: "When", filter: true, sort: "desc", valueFormatter: (p) => (p.value || "").slice(0, 19).replace("T", " ") },
    { field: "orderId", headerName: "PayPal Order", filter: true },
    { field: "amount", headerName: "Amount", valueFormatter: (p) => money(p.value) },
    { field: "currency", headerName: "Cur", width: 80 },
    { field: "status", headerName: "Status", filter: true },
    { field: "mock", headerName: "Mock?", width: 90, valueFormatter: (p) => (p.value ? "yes" : "live") },
    { field: "buyerNote", headerName: "Note", filter: true, flex: 1 },
  ];
  const gridOptions = {
    columnDefs: colDefs, rowData: txs, pagination: true,
    defaultColDef: { sortable: true, filter: true, resizable: true },
    theme: "legacy",
  };
  if (gridApi) { gridApi.setGridOption("rowData", txs); }
  else if (window.agGrid) { gridApi = agGrid.createGrid($("ag-grid"), gridOptions); }
}
$("refreshBtn").onclick = loadDashboard;

// Boot
(async () => {
  const h = await api("/api/health");
  $("modeBadge").textContent = h.paypalConfigured ? "Till: live sandbox" : "Till: mock (no keys)";
  $("provLine").textContent = `AI ${h.aiProvider} · ${h.products} tickets · ${h.transactions} rings`;
  await loadProducts();
  renderCart();
  initPayPal();
})();
