import axios from 'axios';
import * as cheerio from 'cheerio';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// ─── PriceOye ─────────────────────────────────────────────────────────────────
async function inspectPriceOye() {
  console.log('\n========== PRICEOYE ==========');
  const r = await axios.get('https://priceoye.pk/search?q=iPhone+15', {
    headers: { 'User-Agent': UA },
    timeout: 15000,
  });
  const $ = cheerio.load(r.data);

  // Try the old productBox selector
  const boxes = $('a.productBox, a.b-productBox, .productBox');
  console.log(`productBox count: ${boxes.length}`);
  if (boxes.length > 0) {
    const first = boxes.first();
    console.log('First productBox HTML (1200 chars):');
    console.log(first.html()?.substring(0, 1200));
    console.log('href:', first.attr('href'));
  } else {
    // Try what the test found - product-card
    const cards = $('.product-card');
    console.log(`product-card count: ${cards.length}`);
    if (cards.length > 0) {
      console.log('First product-card outer HTML (1200 chars):');
      console.log($.html(cards[0])?.substring(0, 1200));
    }
  }
}

// ─── Mega ─────────────────────────────────────────────────────────────────────
async function inspectMega() {
  console.log('\n========== MEGA.PK ==========');
  // Test the AJAX endpoint
  const r = await axios.get('https://www.mega.pk/ajax.php?key=search&search=iPhone+15', {
    headers: {
      'User-Agent': UA,
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://www.mega.pk',
    },
    timeout: 15000,
  });
  const $ = cheerio.load(r.data);
  const items = $('.srch-result-div');
  console.log(`srch-result-div count: ${items.length}`);
  console.log('First item HTML (800 chars):');
  console.log($.html(items[0])?.substring(0, 800));
  
  // Also try the regular search page
  console.log('\n--- Regular search page ---');
  const r2 = await axios.get('https://www.mega.pk/search/iPhone-15', {
    headers: { 'User-Agent': UA, 'Referer': 'https://www.mega.pk' },
    timeout: 15000,
  });
  const $2 = cheerio.load(r2.data);
  const prodDivs = $2('.product-item, .product-listing, .srch-result-div, .grid-product');
  console.log(`Regular search selectors: ${prodDivs.length}`);
  const allClasses2 = new Set();
  $2('[class]').each((i, el) => { $2(el).attr('class').split(/\s+/).forEach(c => allClasses2.add(c.trim())); });
  const relevant2 = [...allClasses2].filter(c => c && (c.includes('product') || c.includes('item') || c.includes('result') || c.includes('price')));
  console.log(`Relevant classes: ${relevant2.slice(0, 25).join(', ')}`);
}

// ─── Shophive ─────────────────────────────────────────────────────────────────
async function inspectShophive() {
  console.log('\n========== SHOPHIVE ==========');
  const r = await axios.get('https://www.shophive.com/catalogsearch/result/?q=iPhone+15', {
    headers: { 'User-Agent': UA },
    timeout: 15000,
  });
  const $ = cheerio.load(r.data);
  const items = $('.product-item-info, .item.product-item');
  console.log(`Items found: ${items.length}`);
  items.each((i, el) => {
    if (i >= 5) return false;
    const title = $(el).find('.product-item-link').first().text().trim();
    const price = $(el).find('.price').first().text().trim();
    console.log(`  [${i}] "${title.substring(0, 60)}" | ${price}`);
  });
}

// ─── Naheed GraphQL ───────────────────────────────────────────────────────────
async function inspectNaheed() {
  console.log('\n========== NAHEED ==========');
  try {
    const r = await axios.post('https://www.naheed.pk/graphql', {
      query: `{ products(search: "iPhone 15", pageSize: 5) { items { name url_key small_image { url } price_range { minimum_price { final_price { value } } } } } }`
    }, {
      headers: { 'Content-Type': 'application/json', 'User-Agent': UA, 'Store': 'default' },
      timeout: 15000,
    });
    const items = r.data?.data?.products?.items || [];
    console.log(`GraphQL items: ${items.length}`);
    items.forEach((item, i) => {
      console.log(`  [${i}] "${item.name}" price=${item.price_range?.minimum_price?.final_price?.value} url_key=${item.url_key}`);
    });
  } catch(e) {
    console.log(`GraphQL error: ${e.message}`);
    // Try HTML fallback
    const r2 = await axios.get('https://www.naheed.pk/catalogsearch/result/?q=iPhone+15', {
      headers: { 'User-Agent': UA },
      timeout: 15000,
    });
    const $ = cheerio.load(r2.data);
    const allClasses = new Set();
    $('[class]').each((i, el) => { $(el).attr('class').split(/\s+/).forEach(c => allClasses.add(c.trim())); });
    const relevant = [...allClasses].filter(c => c && (c.includes('product') || c.includes('item') || c.includes('price')));
    console.log(`HTML classes: ${relevant.slice(0, 25).join(', ')}`);
  }
}

try { await inspectPriceOye(); } catch(e) { console.log('PriceOye failed:', e.message); }
try { await inspectMega(); } catch(e) { console.log('Mega failed:', e.message); }
try { await inspectShophive(); } catch(e) { console.log('Shophive failed:', e.message); }
try { await inspectNaheed(); } catch(e) { console.log('Naheed failed:', e.message); }
console.log('\n=== DONE ===');
