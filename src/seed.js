const { getDb } = require("./store");
const store = require("./store");

const seedProducts = store.DEFAULT_PRODUCTS;

if (require.main === module) {
  store.setProducts(seedProducts);
  console.log(`Seeded ${seedProducts.length} products to data/db.json`);
}
module.exports = { seedProducts };
