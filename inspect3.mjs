import axios from 'axios';
import * as cheerio from 'cheerio';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Get the full PriceOye card HTML to see price elements
const r = await axios.get('https://priceoye.pk/search?q=iPhone+15', {
  headers: { 'User-Agent': UA }, timeout: 15000,
});
const $ = cheerio.load(r.data);
const first = $('a.productBox, a.product-card').first();
// Print the last 2000 chars (where price usually is)
const html = $.html(first) || '';
console.log('=== FULL CARD HTML ===');
console.log(html);
console.log('\n=== data-product-name on all cards ===');
$('a.productBox, a.product-card').each((i, el) => {
  if (i >= 5) return false;
  const name = $(el).attr('data-product-name');
  const href = $(el).attr('href');
  const img = $(el).find('amp-img').first().attr('src');
  const poPrice = $(el).find('.po-price, .price-box').text().trim().substring(0, 80);
  console.log(`[${i}] name="${name}" href="${href}" po-price="${poPrice}"`);
});

// Mega: check index.php search
console.log('\n=== Mega index.php search ===');
const r2 = await axios.get('https://www.mega.pk/index.php?route=product/search&search=iPhone+15', {
  headers: { 'User-Agent': UA, 'Referer': 'https://www.mega.pk' }, timeout: 15000,
});
const $2 = cheerio.load(r2.data);
// Dump all unique class names with "product" in their name
const allClasses = new Set();
$2('[class]').each((i, el) => { $2(el).attr('class').split(/\s+/).forEach(c => allClasses.add(c.trim())); });
const prodClasses = [...allClasses].filter(c => c && (c.includes('product') || c.includes('item') || c.includes('result') || c.includes('listing')));
console.log('Product classes:', prodClasses.join(', '));
// Find any product grid
const possible = $2('.product-thumb, .product-layout, .product-grid, [class*="product"]').first();
console.log('First product-like element HTML:');
console.log($2.html(possible)?.substring(0, 1000));
