import axios from 'axios';
import * as cheerio from 'cheerio';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Inspect Mega's product/search page items
const r = await axios.get('https://www.mega.pk/index.php?route=product/search&search=iPhone+15', {
  headers: { 'User-Agent': UA, 'Referer': 'https://www.mega.pk' }, timeout: 15000,
});
const $ = cheerio.load(r.data);

// Print first .item element
const first = $('.item, .small-item-box').first();
console.log('First .item HTML:');
console.log($.html(first)?.substring(0, 2000));

// Also check item-link
const links = $('.item-link').slice(0, 5);
console.log(`\n.item-link elements: ${$('.item-link').length}`);
links.each((i, el) => {
  console.log(`[${i}] href=${$(el).attr('href')} text="${$(el).text().trim().substring(0, 60)}"`);
});

// Try to find any price/title nearby
const allItems = $('.item');
console.log(`\n.item count: ${allItems.length}`);
allItems.each((i, el) => {
  if (i >= 5) return false;
  const title = $(el).find('.item-link, h4, .name').text().trim();
  const price = $(el).find('.price, .item-price, [class*="price"]').text().trim();
  const href = $(el).find('a').first().attr('href');
  console.log(`[${i}] title="${title.substring(0,60)}" price="${price.substring(0,30)}" href="${href?.substring(0,60)}"`);
});
