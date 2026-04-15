import axios from 'axios';
import * as cheerio from 'cheerio';

const query = 'iPhone 15';

async function testPriceOye() {
  try {
    const url = `https://priceoye.pk/search?q=${encodeURIComponent(query)}`;
    const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, timeout: 15000 });
    const $ = cheerio.load(r.data);
    const cards = $('.product-card, a.ga-dataset');
    console.log(`[PriceOye] HTML elements found: ${cards.length}`);
    cards.each((i, el) => {
      if (i >= 3) return false;
      const $el = $(el);
      const name = $el.attr('data-product-name') || $el.find('.product-card-title, h4, .card-name').text().trim();
      const priceText = $el.find('.price-box, .product-card-price, .price').text().trim();
      console.log(`  [${i}] title="${name}" price="${priceText}"`);
    });
    // Also dump first 500 chars of product-related HTML
    const allClasses = new Set();
    $('[class]').each((i, el) => { $(el).attr('class').split(/\s+/).forEach(c => allClasses.add(c)); });
    const productClasses = [...allClasses].filter(c => c.toLowerCase().includes('product') || c.toLowerCase().includes('card') || c.toLowerCase().includes('price'));
    console.log(`  Relevant CSS classes: ${productClasses.slice(0, 30).join(', ')}`);
  } catch (e) { console.log(`[PriceOye] ERROR: ${e.message}`); }
}

async function testMega() {
  try {
    const url = `https://www.mega.pk/ajax.php?key=search&search=${encodeURIComponent(query)}`;
    const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'X-Requested-With': 'XMLHttpRequest', 'Referer': 'https://www.mega.pk' }, timeout: 15000 });
    const $ = cheerio.load(r.data);
    const items = $('.srch-result-div');
    console.log(`[Mega] Items found: ${items.length}`);
    items.each((i, el) => {
      if (i >= 3) return false;
      const $el = $(el);
      const title = $el.find('a.result-header h4').text().trim();
      const price = $el.find('.srch-price').text().trim();
      console.log(`  [${i}] title="${title}" price="${price}"`);
    });
    if (items.length === 0) {
      // Dump structure to debug
      console.log(`  Response length: ${r.data.length}`);
      console.log(`  First 500 chars: ${r.data.substring(0, 500)}`);
    }
  } catch (e) { console.log(`[Mega] ERROR: ${e.message}`); }
}

async function testHighfy() {
  try {
    const url = `https://highfy.pk/search?q=${encodeURIComponent(query)}&options[prefix]=last`;
    const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, timeout: 15000 });
    const $ = cheerio.load(r.data);
    const items = $('li.grid__item');
    console.log(`[Highfy] Items found: ${items.length}`);
    items.each((i, el) => {
      if (i >= 3) return false;
      const title = $(el).find('h3.card__heading').text().trim();
      const price = $(el).find('.price-item--sale, .price-item--regular').first().text().trim();
      console.log(`  [${i}] title="${title}" price="${price}"`);
    });
    if (items.length === 0) {
      const allClasses = new Set();
      $('[class]').each((i, el) => { $(el).attr('class').split(/\s+/).forEach(c => allClasses.add(c)); });
      const relevant = [...allClasses].filter(c => c.toLowerCase().includes('product') || c.toLowerCase().includes('card') || c.toLowerCase().includes('grid') || c.toLowerCase().includes('price'));
      console.log(`  Relevant CSS classes: ${relevant.slice(0, 30).join(', ')}`);
    }
  } catch (e) { console.log(`[Highfy] ERROR: ${e.message}`); }
}

async function testShophive() {
  try {
    const url = `https://www.shophive.com/catalogsearch/result/?q=${encodeURIComponent(query)}`;
    const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, timeout: 15000 });
    const $ = cheerio.load(r.data);
    const items = $('.product-item-info, .item.product-item');
    console.log(`[Shophive] Items found: ${items.length}`);
    items.each((i, el) => {
      if (i >= 3) return false;
      const title = $(el).find('.product-item-link').first().text().trim();
      const price = $(el).find('.price').first().text().trim();
      console.log(`  [${i}] title="${title}" price="${price}"`);
    });
    if (items.length === 0) {
      console.log(`  Response length: ${r.data.length}`);
      const allClasses = new Set();
      $('[class]').each((i, el) => { $(el).attr('class').split(/\s+/).forEach(c => allClasses.add(c)); });
      const relevant = [...allClasses].filter(c => c.toLowerCase().includes('product') || c.toLowerCase().includes('item') || c.toLowerCase().includes('price'));
      console.log(`  Relevant CSS classes: ${relevant.slice(0, 30).join(', ')}`);
    }
  } catch (e) { console.log(`[Shophive] ERROR: ${e.message}`); }
}

async function testOLX() {
  try {
    const slug = query.trim().replace(/\s+/g, '-');
    const url = `https://www.olx.com.pk/items/q-${slug}`;
    const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html', 'Referer': 'https://www.olx.com.pk' }, timeout: 15000 });
    const html = r.data;
    // Test the regex extraction
    const itemRegex = /"coverPhoto":\{[^}]*"id":(\d+)[^}]*\}[^]*?"price":(\d+)[^]*?"slug":"([^"]+)"[^]*?"title":"([^"]+)"/g;
    let match, count = 0;
    while ((match = itemRegex.exec(html)) !== null && count < 3) {
      console.log(`[OLX] [${count}] title="${match[4]}" price=${match[2]}`);
      count++;
    }
    if (count === 0) {
      console.log(`[OLX] No regex matches. Checking HTML length: ${html.length}`);
      // Try to find any price/title patterns
      const titleMatches = html.match(/"title":"[^"]{5,}"/g)?.slice(0, 3);
      console.log(`  Title patterns found: ${titleMatches?.join(', ') || 'NONE'}`);
    } else {
      console.log(`[OLX] Total regex matches found: ${count}+`);
    }
  } catch (e) { console.log(`[OLX] ERROR: ${e.message}`); }
}

async function testNaheed() {
  try {
    const url = `https://www.naheed.pk/catalogsearch/result/?q=${encodeURIComponent(query)}`;
    const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html', 'Referer': 'https://www.naheed.pk' }, timeout: 15000 });
    const $ = cheerio.load(r.data);
    const selectors = ['.product-item', '.products-grid .item', '.products.list .item', 'li.product-item', '.product-items > li'];
    for (const sel of selectors) {
      const items = $(sel);
      if (items.length > 0) {
        console.log(`[Naheed] Selector "${sel}": ${items.length} items`);
        items.each((i, el) => {
          if (i >= 3) return false;
          const name = $(el).find('.product-item-link, .product-name a').text().trim();
          const price = $(el).find('.price').first().text().trim();
          console.log(`  [${i}] title="${name.substring(0, 60)}" price="${price}"`);
        });
        break;
      }
    }
    // Check JSON-LD
    const jsonLd = $('script[type="application/ld+json"]');
    console.log(`[Naheed] JSON-LD scripts: ${jsonLd.length}`);
    // Check GraphQL
    try {
      const gql = await axios.post('https://www.naheed.pk/graphql', {
        query: `{ products(search: "${query}", pageSize: 3) { items { name price_range { minimum_price { final_price { value } } } } } }`
      }, { headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0', 'Store': 'default' }, timeout: 10000 });
      const items = gql.data?.data?.products?.items || [];
      console.log(`[Naheed] GraphQL items: ${items.length}`);
      items.forEach((item, i) => console.log(`  [${i}] "${item.name}" price=${item.price_range?.minimum_price?.final_price?.value}`));
    } catch (e) { console.log(`[Naheed] GraphQL error: ${e.message}`); }
  } catch (e) { console.log(`[Naheed] ERROR: ${e.message}`); }
}

console.log(`\n=== SCRAPER TEST: "${query}" ===\n`);
await testPriceOye();
console.log('---');
await testMega();
console.log('---');
await testHighfy();
console.log('---');
await testShophive();
console.log('---');
await testOLX();
console.log('---');
await testNaheed();
console.log('\n=== DONE ===');
