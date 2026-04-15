import * as daraz from './server/scrapers/daraz.js';
import * as priceoye from './server/scrapers/priceoye.js';
import * as mega from './server/scrapers/mega.js';
import * as highfy from './server/scrapers/highfy.js';
import * as shophive from './server/scrapers/shophive.js';
import * as olx from './server/scrapers/olx.js';
import * as naheed from './server/scrapers/naheed.js';

// Test with both queries
const QUERIES = ['iPhone 15', 'Samsung Galaxy S24'];
const LIMIT = 10;

const scrapers = [
  { name: 'Daraz', adapter: daraz },
  { name: 'PriceOye', adapter: priceoye },
  { name: 'Mega.pk', adapter: mega },
  { name: 'Highfy', adapter: highfy },
  { name: 'Shophive', adapter: shophive },
  { name: 'OLX', adapter: olx },
  { name: 'Naheed', adapter: naheed },
];

for (const QUERY of QUERIES) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔍  QUERY: "${QUERY}"`);
  console.log('='.repeat(70));

  for (const { name, adapter } of scrapers) {
    const start = Date.now();
    try {
      const raw = await adapter.searchProducts(QUERY, LIMIT);
      const elapsed = Date.now() - start;
      const count = raw?.length || 0;
      console.log(`\n[${name}] ${count} raw in ${elapsed}ms`);
      if (count > 0) {
        raw.slice(0, 3).forEach(p => {
          console.log(`   • ${p.title.slice(0, 70)}`);
          console.log(`     Rs ${p.price?.toLocaleString()}`);
        });
      }
    } catch (err) {
      console.log(`\n[${name}] ERROR: ${err.message}`);
    }
  }
}
console.log('\nDone.\n');
