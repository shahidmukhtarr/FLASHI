import { searchProducts, getProductDetails } from './server/scrapers/daraz.js';

async function test() {
  console.log('Testing Daraz scraper (Puppeteer)...');
  
  console.log('\n--- Search Test ---');
  const results = await searchProducts('mobile phone', 5);
  console.log('Search Results:', results.length);
  if (results.length > 0) {
    console.log('First result:', JSON.stringify(results[0], null, 2));
  }

  console.log('\n--- Product Details Test ---');
  const details = await getProductDetails('https://www.daraz.pk/products/surf-excel-white-washing-powder-2kg-i884420539-s3913155236.html');
  console.log('Details:', details ? JSON.stringify(details, null, 2) : 'Failed');

  process.exit(0);
}

test().catch((e) => { console.error(e); process.exit(1); });
