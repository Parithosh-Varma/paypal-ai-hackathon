const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

const DEFAULT_PRODUCTS = [
  { id: "p1", name: "Midnight Roast Beans (12oz)", price: 18.0, category: "Coffee", emoji: "☕", description: "Small-batch dark roast, chocolate + cherry notes." },
  { id: "p2", name: "Pour-Over Starter Kit", price: 42.0, category: "Coffee", emoji: "🫖", description: "Dripper, filters + brewing guide for beginners." },
  { id: "p3", name: "Ceramic Camp Mug", price: 24.0, category: "Merch", emoji: "🍶", description: "12oz speckled ceramic mug, campfire approved." },
  { id: "p4", name: "Sticker Pack (x8)", price: 9.0, category: "Merch", emoji: "✨", description: "Waterproof vinyl stickers for laptops + bottles." },
  { id: "p5", name: "Espresso Tasting Flight", price: 15.0, category: "In-store", emoji: "🧪", description: "Three single-origin shots + tasting card." },
  { id: "p6", name: "Brew Class Ticket", price: 35.0, category: "In-store", emoji: "🎓", description: "45-min weekend brewing workshop, beans included." },
];

function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    }
  } catch (_) {}
  return { products: DEFAULT_PRODUCTS, transactions: [] };
}

function save(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function getDb() {
  return load();
}

function setProducts(products) {
  const db = load();
  db.products = products;
  save(db);
  return db.products;
}

function addTransaction(tx) {
  const db = load();
  db.transactions.unshift(tx);
  save(db);
  return tx;
}

module.exports = { load, save, getDb, setProducts, addTransaction, DEFAULT_PRODUCTS };
