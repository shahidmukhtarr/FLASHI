import axios from 'axios';
import * as cheerio from 'cheerio';

const { data } = await axios.get('https://highfy.pk/search?q=iphone+15&options[prefix]=last', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,*/*',
  },
  timeout: 15000,
});

const $ = cheerio.load(data);

console.log('Total li.grid__item:', $('li.grid__item').length);
console.log('\n=== Checking product items ===');

$('li.grid__item').each((i, el) => {
  if (i >= 5) return false;
  const $el = $(el);
  const headingText = $el.find('.card__heading').text().trim().slice(0, 80);
  const linkHref = $el.find('a.full-unstyled-link, a.card__heading').first().attr('href') || '';
  const priceEl = $el.find('.price-item--sale, .price-item--regular').first().text().trim();
  const h3Text = $el.find('h3').text().trim().slice(0, 80);
  console.log(`[${i}] h3: "${h3Text}"`);
  console.log(`     heading: "${headingText}"`);
  console.log(`     link: "${linkHref.slice(0, 60)}"`);
  console.log(`     price: "${priceEl}"`);
});

// Also check if search actually returned relevant products by looking at URLs
console.log('\n=== All product links ===');
$('li.grid__item a[href*="/products/"]').each((i, el) => {
  if (i >= 10) return false;
  console.log($(el).attr('href')?.slice(0, 80));
});
