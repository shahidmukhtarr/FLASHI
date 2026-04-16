import * as homeshopping from './server/scrapers/homeshopping.js';
import * as ishopping from './server/scrapers/ishopping.js';

const QUERY = 'iPhone 15';
const LIMIT = 5;

const scrapers = [
  { name: 'HomeShopping', adapter: homeshopping },
  { name: 'iShopping', adapter: ishopping },
];

for (const { name, adapter } of scrapers) {
  console.log(`\nTesting ${name}...`);
  try {
    const results = await adapter.searchProducts(QUERY, LIMIT);
    console.log(`[${name}] Found ${results.length} products`);
    results.slice(0, 3).forEach(p => {
      console.log(`   • ${p.title} - Rs ${p.price}`);
    });
  } catch (err) {
    console.log(`[${name}] ERROR: ${err.message}`);
  }
}
