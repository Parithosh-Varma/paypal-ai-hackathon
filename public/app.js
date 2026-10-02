const $ = (id) => document.getElementById(id);
const money = (n) => `$${Number(n || 0).toFixed(2)}`;
let PRODUCTS = [];
let CART = {}; // id -> qty

async function api(path, opts) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text, status: res.status }; }
}

// Tabs
document.querySelectorAll("nav.tabs button").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll("nav.tabs button").forEach((x) => x.classList.remove("active"));
    document.querySelectorAll(".view").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    $("view-" + b.dataset.tab).classList.add("active");
    if (b.dataset.tab === "dash") loadDashboard();
  };
});

function productCard(p, mode) {
  const qty = CART[p.id] || 0;
  const btn = mode === "shop"
    ? `<button class="ghost" onclick="addToCart('${p.id}')">Add${qty ? ` (${qty})` : ""}</button>`
    : "";
  return `<div class="product"><div class="em">${p.emoji}</div><h4>${p.name}</h4>
    <div class="price">${money(p.price)} <span class="pill">${p.category}</span></div>
    <div class="mut">${p.description}</div><div style="margin-top:.5rem">${btn}</div></div>`;
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
  if (!entries.length) {
    $("cartList").textContent = "Empty — add something.";
    $("cartTotal").textContent = "$0.00";
    $("amount").value = "";
    return;
  }
  let total = 0;
  $("cartList").innerHTML = entries.map(([id, qty]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return "";
    total += p.price * qty;
    return `<div>${p.emoji} ${p.name} ×${qty} — ${money(p.price * qty)} <button class="ghost" onclick="rmFromCart('${id}')">−</button></div>`;
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

// Seller: generate
$("genBtn").onclick = async () => {
  $("genOut").textContent = "Generating…";
  const idea = $("idea").value;
  const data = await api("/api/products/generate", { method: "POST", body: JSON.stringify({ idea }) });
  if (data.error) { $("genOut").textContent = "Error: " + data.error; return; }
  $("genOut").textContent = `Provider: ${data.provider}\nGenerated ${data.products.length} products for "${idea}"`;
  await loadProducts();
};
$("resetBtn").onclick = async () => {
  await api("/api/products", { method: "PUT", body: JSON.stringify({ products: null }) }).catch(() => {});
  location.reload();
};

// Chat agent
function pushChat(who, text) {
  const d = document.createElement("div");
  d.className = who === "u" ? "u" : "";
  d.innerHTML = who === "u" ? `<span>${text}</span>` : `<span class="a">${text}</span>`;
  $("chatlog").appendChild(d);
  $("chatlog").scrollTop = 1e6;
}
$("chatBtn").onclick = async () => {
  const message = $("chatIn").value.trim();
  if (!message) return;
  pushChat("u", message);
  $("chatIn").value = "";
  pushChat("a", "…");
  const data = await api("/api/ai/chat", { method: "POST", body: JSON.stringify({ message, cart: cartItems() }) });
  $("chatlog").lastChild.innerHTML = `<span class="a">${(data.reply || data.error || "?").replace(/</g, "&lt;")}</span>`;
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
    $("payOut").textContent = "MOCK PayPal mode (no PAYPAL_CLIENT_ID in .env). Use the 1-click mock capture below — judges can run with zero keys.";
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
      CART = {}; renderCart(); loadDashboard();
    },
    onError: (err) => { $("payOut").textContent = "PayPal error: " + err; },
  }).render("#paypal-buttons");
  document.head.appendChild(s);
}
$("mockPayBtn").onclick = async () => {
  const amount = $("amount").value || cartTotal().toFixed(2) || "10.00";
  $("payOut").textContent = "Creating mock order…";
  const order = await api("/api/orders", { method: "POST", body: JSON.stringify({ amount, items: cartItems() }) });
  const result = await api(`/api/orders/${order.id}/capture`, { method: "POST", body: JSON.stringify({ items: cartItems(), buyerNote: $("buyerNote").value, amount }) });
  $("payOut").textContent = JSON.stringify(result, null, 2);
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
  const gridOptions = { columnDefs: colDefs, rowData: txs, pagination: true, defaultColDef: { sortable: true, filter: true, resizable: true } };
  if (gridApi) { gridApi.setGridOption("rowData", txs); }
  else { gridApi = agGrid.createGrid($("ag-grid"), gridOptions); }
}
$("refreshBtn").onclick = loadDashboard;

// Boot
(async () => {
  const h = await api("/api/health");
  $("modeBadge").textContent = h.paypalConfigured ? "PayPal: LIVE sandbox" : "PayPal: MOCK (no keys)";
  $("provLine").textContent = `AI provider: ${h.aiProvider} · ${h.products} products · ${h.transactions} txns`;
  await loadProducts();
  renderCart();
  initPayPal();
})();
