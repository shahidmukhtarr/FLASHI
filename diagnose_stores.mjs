import * as zerolifestyle from './server/scrapers/zerolifestyle.js';
import * as audionic from './server/scrapers/audionic.js';
import * as saya from './server/scrapers/saya.js';
import * as phonecase from './server/scrapers/phonecase.js';
import { queryStoredProducts, saveProducts } from './server/services/db.js';
import { isRelevantProduct } from './server/services/scraperEngine.js';

const NEW_STORES = [
  { name: 'Zero Lifestyle', adapter: zerolifestyle, testQuery: 'earbuds', categoryTitle: 'Earbuds' },
  { name: 'Audionic', adapter: audionic, testQuery: 'earbuds', categoryTitle: 'Wireless Earbuds' },
  { name: 'Saya', adapter: saya, testQuery: 'lawn', categoryTitle: 'Unstitched 3 Piece Lawn' },
  { name: 'PhoneCase.pk', adapter: phonecase, testQuery: 'iphone case', categoryTitle: 'Phone Cases' },
];

async function diagnose() {
  console.log('═══════════════════════════════════════');
  console.log('  DIAGNOSTIC: New Store Integration');
  console.log('═══════════════════════════════════════\n');

  for (const store of NEW_STORES) {
    console.log(`\n▶ ${store.name}`);
    console.log('─'.repeat(40));

    // Step 1: Test scraper directly
    console.log(`  [1] Testing scraper with query "${store.testQuery}"...`);
    let products = [];
    try {
      products = await store.adapter.searchProducts(store.testQuery, 10);
      console.log(`  ✅ Scraper returned ${products.length} products`);
      if (products.length > 0) {
        console.log(`     First: "${products[0].title}" | Rs.${products[0].price} | inStock:${products[0].inStock} | store:"${products[0].store}"`);
      }
    } catch (e) {
      console.log(`  ❌ Scraper FAILED: ${e.message}`);
      continue;
    }

    // Step 2: Test isRelevantProduct filter
    if (products.length > 0) {
      console.log(`  [2] Testing isRelevantProduct filter with query "${store.categoryTitle}"...`);
      const relevant = products.filter(p => isRelevantProduct(p.title, store.categoryTitle));
      const irrelevant = products.filter(p => !isRelevantProduct(p.title, store.categoryTitle));
      console.log(`  ✅ ${relevant.length} passed, ${irrelevant.length} filtered out`);
      if (irrelevant.length > 0) {
        irrelevant.slice(0, 3).forEach(p => console.log(`     ❌ Filtered: "${p.title}" (query: "${store.categoryTitle}")`));
      }
    }

    // Step 3: Test saving to DB
    if (products.length > 0) {
      console.log(`  [3] Testing saveProducts to DB...`);
      try {
        const saveResult = await saveProducts(products.slice(0, 3), `diagnostic:${store.name}`);
        console.log(`  ✅ Saved: ${saveResult.newCount} new, ${saveResult.updatedCount} updated`);
      } catch (e) {
        console.log(`  ❌ Save FAILED: ${e.message}`);
      }
    }

    // Step 4: Check what's in the DB for this store
    console.log(`  [4] Checking DB for store "${store.name}"...`);
    try {
      const dbResult = await queryStoredProducts({ q: store.testQuery, store: store.name, limit: 100 });
      console.log(`  📦 DB has ${dbResult.total} products for "${store.testQuery}" from ${store.name}`);
      if (dbResult.products.length > 0) {
        dbResult.products.slice(0, 2).forEach(p => console.log(`     - "${p.title}" | Rs.${p.price}`));
      }
    } catch (e) {
      console.log(`  ❌ DB query FAILED: ${e.message}`);
    }

    // Step 5: Check DB for ALL products from this store (no query filter)
    try {
      const allFromStore = await queryStoredProducts({ store: store.name, limit: 500 });
      console.log(`  📦 DB TOTAL for ${store.name}: ${allFromStore.total} products`);
    } catch (e) {
      console.log(`  ❌ DB total query FAILED: ${e.message}`);
    }
  }

  console.log('\n\n═══════════════════════════════════════');
  console.log('  DIAGNOSTIC COMPLETE');
  console.log('═══════════════════════════════════════\n');
}

diagnose().catch(e => { console.error('Diagnostic failed:', e); process.exit(1); });
