// AI provider: OpenAI when OPENAI_API_KEY is set, deterministic stub otherwise.
// Stub keeps the demo + judging runnable with zero keys while preserving the same JSON contracts.
const MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const hasKey = () => Boolean(process.env.OPENAI_API_KEY);

async function openaiChat(messages, maxTokens = 400) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: maxTokens, temperature: 0.7 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return data.choices?.[0]?.message?.content ?? "";
}

// --- 1. Generate storefront products from a natural-language idea ---
async function generateProducts(idea) {
  if (hasKey()) {
    const raw = await openaiChat([
      {
        role: "system",
        content:
          "You generate e-commerce products as strict JSON. Return ONLY a JSON array of 6 objects with keys: id (p1..p6), name, price (number), category, emoji (single), description (under 90 chars). No markdown.",
      },
      { role: "user", content: `Business idea: ${idea}` },
    ]);
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const arr = JSON.parse(cleaned);
      if (Array.isArray(arr) && arr.length) return { provider: "openai", products: arr.slice(0, 8) };
    } catch (_) {
      // fall through to stub
    }
  }
  return { provider: "stub", products: stubProducts(idea) };
}

function stubProducts(idea = "") {
  const s = idea.toLowerCase();
  const theme = s.includes("plant")
    ? { cat: "Plants", items: [["Monstera Deliciosa (6in)", 28, "🪴", "Lush split-leaf starter plant."], ["Pothos Golden (4in)", 12, "🌿", "Trailing easy-care classic."], ["Succulent Trio", 18, "🌵", "Three drought-proof minis."], ["Ceramic Pot + Saucer", 22, "🏺", "Matte glaze, drainage hole."], ["Plant Food Concentrate", 14, "🧴", "Makes 24 gallons of feed."], ["Repotting Workshop Seat", 30, "🎓", "45-min weekend repot class."]] }
    : s.includes("candle") || s.includes("soap") || s.includes("skincare")
    ? { cat: "Goods", items: [["Soy Candle — Cedar + Sage", 24, "🕯️", "40-hr burn, cotton wick."], ["Whipped Body Butter", 19, "🧴", "Shea + oat, unscented."], ["Oatmeal Soap Bar Trio", 16, "🧼", "Cold-process, vegan."], ["Bath Soak Pouch", 14, "🛁", "Epsom + lavender, 8oz."], ["Discovery Set (4 minis)", 22, "🎁", "Try every scent."], ["Refill — Candle Insert", 12, "♻️", "Zero-waste wax refill."]] }
    : s.includes("art") || s.includes("print") || s.includes("sticker")
    ? { cat: "Art", items: [["Risograph Print 8x10", 25, "🖼️", "3-color riso, signed."], ["Sticker Pack (x10)", 10, "✨", "Waterproof vinyl sampler."], ["Zine — Issue 04", 12, "📖", "32 pages, full color."], ["Enamel Pin", 14, "📍", "Hard enamel, gold clutch."], ["Tote — Heavyweight", 28, "👜", "12oz canvas, big pocket."], ["Commission Slot", 60, "🎨", "Custom half-page piece."]] }
    : { cat: "Coffee", items: [["Midnight Roast Beans (12oz)", 18, "☕", "Dark roast, choco-cherry."], ["Pour-Over Starter Kit", 42, "🫖", "Dripper + filters + guide."], ["Ceramic Camp Mug", 24, "🍶", "12oz speckled stoneware."], ["Sticker Pack (x8)", 9, "✨", "Waterproof vinyl pack."], ["Espresso Tasting Flight", 15, "🧪", "3 shots + tasting card."], ["Brew Class Ticket", 35, "🎓", "Weekend workshop seat."]] };
  return theme.items.map(([name, price, emoji, description], i) => ({
    id: `p${i + 1}`,
    name,
    price,
    category: theme.cat,
    emoji,
    description,
  }));
}

// --- 2. Agentic shopping chat: recommend + build cart ---
async function chatAgent(message, products, cart = []) {
  if (hasKey()) {
    const reply = await openaiChat([
      {
        role: "system",
        content: `You are ShopGenie, a concise shopping agent. Products: ${JSON.stringify(products)}. Cart: ${JSON.stringify(cart)}. Recommend 1-3 products with prices, keep under 80 words, end with a checkout nudge.`,
      },
      { role: "user", content: message },
    ]);
    return { provider: "openai", reply };
  }
  // Stub: budget + keyword matching
  const budgetMatch = message.match(/\$?\s?(\d+)\s?(dollar|usd|bucks)?/i) || message.match(/under\s?\$?(\d+)/i);
  const budget = budgetMatch ? Number(budgetMatch[1]) : null;
  const words = message.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
  let scored = products.map((p) => {
    let score = 0;
    const hay = `${p.name} ${p.description} ${p.category}`.toLowerCase();
    for (const w of words) if (hay.includes(w)) score += 2;
    if (budget != null && p.price <= budget) score += 3;
    return { p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = (scored[0]?.score > 0 ? scored : products.map((p) => ({ p, score: 0 }))).slice(0, 3).map((x) => x.p);
  const total = top.reduce((s, p) => s + p.price, 0);
  const reply =
    `Based on "${message}", I'd grab: ` +
    top.map((p) => `${p.emoji} ${p.name} ($${p.price.toFixed(2)})`).join(", ") +
    `. Est. total $${total.toFixed(2)} — add them to cart and check out with PayPal Sandbox to complete the demo.` +
    (budget != null ? ` All under your ~$${budget} budget.` : "");
  return { provider: "stub", reply, recommendedIds: top.map((p) => p.id) };
}

// --- 3. Business insights for the dashboard ---
async function insights(products, transactions) {
  const revenue = transactions.reduce((s, t) => s + Number(t.amount || 0), 0);
  const count = transactions.length;
  if (hasKey() && transactions.length) {
    try {
      const reply = await openaiChat([
        { role: "system", content: "You are a terse SMB analyst. Given products + transactions JSON, return 3 bullet insights (best seller, pricing tip, next action), under 70 words." },
        { role: "user", content: JSON.stringify({ products, transactions: transactions.slice(0, 20) }) },
      ]);
      return { provider: "openai", revenue, orders: count, bullets: reply.split("\n").filter(Boolean) };
    } catch (_) {}
  }
  const byProduct = {};
  for (const t of transactions) for (const it of t.items || []) byProduct[it.name] = (byProduct[it.name] || 0) + (it.qty || 1);
  const best = Object.entries(byProduct).sort((a, b) => b[1] - a[1])[0];
  const avg = count ? revenue / count : 0;
  const bullets = [
    count ? `Best seller: ${best ? `${best[0]} ×${best[1]}` : "—"} across ${count} order(s), $${revenue.toFixed(2)} revenue.` : "No sales yet — run a sandbox checkout to populate the dashboard.",
    avg ? `Average order value $${avg.toFixed(2)}. Try bundling the cheapest + priciest items to lift AOV 15%.` : "Tip: AI-generated descriptions + a sub-$10 entry item raise conversion.",
    products.length ? `${products.length} live products. Add one limited-edition item to create urgency.` : "Add products via Seller Studio first.",
  ];
  return { provider: hasKey() ? "openai-fallback" : "stub", revenue, orders: count, bullets };
}

module.exports = { generateProducts, chatAgent, insights };
