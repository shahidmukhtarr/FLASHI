import axios from 'axios';
import * as cheerio from 'cheerio';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function parsePrice(str) {
  if (!str) return null;
  const cleaned = String(str).replace(/Rs\.?/gi,'').replace(/PKR/gi,'').replace(/,/g,'').replace(/[^\d.]/g,'');
  const n = parseFloat(cleaned);
  return isNaN(n) || n <= 0 ? null : n;
}

async function testPriceOye() {
  console.log('\n=== PriceOye (fixed) ===');
  const r = await axios.get('https://priceoye.pk/search?q=iPhone+15', { headers: { 'User-Agent': UA }, timeout: 15000 });
  const $ = cheerio.load(r.data);
  let count = 0;
  $('a.productBox, a.product-card').each((i, el) => {
    if (i >= 5) return false;
    const $el = $(el);
    const name = $el.attr('data-product-name');
    const price = parsePrice($el.find('.price-box.p1, .price-box').first().text());
    const img = $el.find('amp-img').first().attr('src');
    const href = $el.attr('href');
    console.log(`  [${i}] "${name}" | Rs.${price} | img=${!!img} | url=${href?.substring(0,50)}`);
    if (name && price) count++;
  });
  console.log(`  → ${count} valid products`);
}

async function testMega() {
  console.log('\n=== Mega.pk (fixed) ===');
  const queryWords = ['iphone', '15'];
  const r = await axios.get('https://www.mega.pk/ajax.php?key=search&search=iPhone+15', {
    headers: { 'User-Agent': UA, 'X-Requested-With': 'XMLHttpRequest', 'Referer': 'https://www.mega.pk' },
    timeout: 20000,
  });
  const $ = cheerio.load(r.data);
  let count = 0;
  $('.srch-result-div').each((i, el) => {
    const title = $(el).find('a.result-header h4').text().trim();
    const price = parsePrice($(el).find('.srch-price').text());
    if (!title || !price) return;
    const titleLower = title.toLowerCase();
    if (!queryWords.every(w => titleLower.includes(w))) return;
    if (count < 5) console.log(`  [${count}] "${title}" | Rs.${price}`);
    count++;
  });
  console.log(`  → ${count} relevant products`);
}

async function testHighfy() {
  console.log('\n=== Highfy (fixed) ===');
  const r = await axios.get('https://highfy.pk/search?q=Samsung+Galaxy', { headers: { 'User-Agent': UA }, timeout: 15000 });
  const $ = cheerio.load(r.data);
  let count = 0;
  $('li.grid__item').each((i, el) => {
    if (i >= 5) return false;
    const $el = $(el);
    const titleEl = $el.find('h3.card__heading a, .card__heading a').first();
    const title = titleEl.text().trim();
    const price = parsePrice($el.find('.price-item--sale, .price-item--regular').first().text());
    console.log(`  [${i}] "${title}" | Rs.${price}`);
    if (title && price) count++;
  });
  console.log(`  → ${count} valid products`);
}

try { await testPriceOye(); } catch(e) { console.log('PriceOye error:', e.message); }
try { await testMega(); } catch(e) { console.log('Mega error:', e.message); }
try { await testHighfy(); } catch(e) { console.log('Highfy error:', e.message); }
console.log('\n=== DONE ===');
