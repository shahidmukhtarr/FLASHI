import axios from 'axios';
import * as cheerio from 'cheerio';

// Find the actual product title/price/link selectors inside .grid__item
const r = await axios.get('https://highfy.pk/search?q=iphone&options[prefix]=last', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,*/*;q=0.9',
  },
  timeout: 15000,
});

const ch = cheerio.load(r.data);
const items = ch('.grid__item');
console.log('Total .grid__item:', items.length);

items.each((i, el) => {
  if (i >= 4) return false;
  const item = ch(el);
  
  // Try different title selectors
  const t1 = item.find('.card__heading a').first().text().trim();
  const t2 = item.find('.card-product-custom-div a[href*="/products/"]').first().text().trim();
  const t3 = item.find('[data-product-title]').first().attr('data-product-title') || '';
  const t4 = item.find('.card__heading').first().text().trim();
  
  // Try different price selectors
  const p1 = item.find('.price-item--regular').first().text().trim();
  const p2 = item.find('.price-item--sale').first().text().trim();
  const p3 = item.find('.price__regular .price-item').first().text().trim();
  const p4 = item.find('[class*="price-item"]').first().text().trim();
  
  // Link
  const link = item.find('a[href*="/products/"]').first().attr('href') || '';
  
  // Image
  const img = item.find('img').first().attr('src') || item.find('img').first().attr('srcset') || '';

  console.log(`\n--- Item ${i} ---`);
  console.log(`  t1 (.card__heading a): "${t1}"`);
  console.log(`  t2 (.card-product-custom-div a product): "${t2}"`);
  console.log(`  t3 (data-product-title): "${t3}"`);
  console.log(`  t4 (.card__heading text): "${t4}"`);
  console.log(`  p1 (.price-item--regular): "${p1}"`);
  console.log(`  p2 (.price-item--sale): "${p2}"`);
  console.log(`  p3 (.price__regular .price-item): "${p3}"`);
  console.log(`  p4 ([class*=price-item]): "${p4}"`);
  console.log(`  link: "${link}"`);
  console.log(`  img: "${img?.substring(0, 100)}"`);
});
