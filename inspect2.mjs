import axios from 'axios';
import * as cheerio from 'cheerio';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Check what the actual price element looks like inside productBox
async function inspectPriceOyePrice() {
  console.log('\n=== PriceOye Price Element ===');
  const r = await axios.get('https://priceoye.pk/search?q=iPhone+15', {
    headers: { 'User-Agent': UA },
    timeout: 15000,
  });
  const $ = cheerio.load(r.data);
  const first = $('a.productBox, a.product-card').first();
  // Print the full HTML of first card
  console.log($.html(first)?.substring(0, 3000));
}

// Check Mega search URL
async function inspectMegaSearch() {
  console.log('\n=== Mega Search URL ===');
  // Try different Mega search endpoints
  const urls = [
    'https://www.mega.pk/ajax.php?key=search&search=iPhone+15&q=iPhone+15',
    'https://www.mega.pk/index.php?route=product/search&search=iPhone+15',
    'https://www.mega.pk/search?q=iPhone+15',
    'https://www.mega.pk/?search=iPhone+15&category_id=0&description=true',
  ];
  for (const url of urls) {
    try {
      const r = await axios.get(url, {
        headers: { 'User-Agent': UA, 'X-Requested-With': 'XMLHttpRequest', 'Referer': 'https://www.mega.pk' },
        timeout: 10000,
        maxRedirects: 3,
      });
      const $ = cheerio.load(r.data);
      const items = $('.srch-result-div, .product-item, .product-grid');
      console.log(`URL: ${url}`);
      console.log(`  Items: ${items.length}, Response size: ${r.data.length}, Status: ${r.status}`);
      if (items.length > 0 && items.length < 100) {
        items.each((i, el) => {
          if (i >= 3) return false;
          const title = $(el).find('h4').text().trim() || $(el).find('.product-item-link').text().trim();
          console.log(`  [${i}] ${title.substring(0, 60)}`);
        });
      }
    } catch(e) {
      console.log(`URL: ${url} => ERROR: ${e.message}`);
    }
  }
}

await inspectPriceOyePrice();
await inspectMegaSearch();
