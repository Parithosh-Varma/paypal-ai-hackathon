const $ = (id) => document.getElementById(id);
const money = (n) => `$${Number(n || 0).toFixed(2)}`;
let PRODUCTS = [];
let CART = {}; // id -> qty

async function api(path, opts) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text, status: res.status }; }
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
