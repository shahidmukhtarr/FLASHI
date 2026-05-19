import * as zerolifestyle from './server/scrapers/zerolifestyle.js';
import * as audionic from './server/scrapers/audionic.js';
import * as saya from './server/scrapers/saya.js';
import * as phonecase from './server/scrapers/phonecase.js';

async function test() {
  console.log('=== Testing Zero Lifestyle ===');
  const zl = await zerolifestyle.searchProducts('earbuds', 5);
  console.log(`Zero Lifestyle: ${zl.length} products`);
  zl.forEach(p => console.log(`  - ${p.title} | Rs.${p.price} | inStock:${p.inStock}`));

  console.log('\n=== Testing Audionic ===');
  const au = await audionic.searchProducts('earbuds', 5);
  console.log(`Audionic: ${au.length} products`);
  au.forEach(p => console.log(`  - ${p.title} | Rs.${p.price} | inStock:${p.inStock}`));

  console.log('\n=== Testing Saya ===');
  const sa = await saya.searchProducts('lawn', 5);
  console.log(`Saya: ${sa.length} products`);
  sa.forEach(p => console.log(`  - ${p.title} | Rs.${p.price} | inStock:${p.inStock}`));

  console.log('\n=== Testing PhoneCase ===');
  const pc = await phonecase.searchProducts('iphone case', 5);
  console.log(`PhoneCase: ${pc.length} products`);
  pc.forEach(p => console.log(`  - ${p.title} | Rs.${p.price} | inStock:${p.inStock}`));
}

test().catch(console.error);
