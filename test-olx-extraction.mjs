import fs from 'fs';

const html = fs.readFileSync('olx_debug.html', 'utf8');

function extractItemsFromHtml(html) {
  const items = [];
  const stateMatch = html.match(/window\.state\s*=\s*(\{[\s\S]+?\});/);
  if (stateMatch) {
    try {
      const state = JSON.parse(stateMatch[1]);
      console.log('State keys:', Object.keys(state));
      // Recursively find ads
      const collectAds = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        if (Array.isArray(obj)) {
          obj.forEach(collectAds);
          return;
        }
        if (obj.title && obj.price && obj.slug) {
          items.push(obj);
          return;
        }
        Object.values(obj).forEach(collectAds);
      };
      collectAds(state);
    } catch (e) {
      console.error('JSON Parse Error:', e.message);
    }
  }
  return items;
}

const items = extractItemsFromHtml(html);
console.log('Items found:', items.length);
if (items.length > 0) {
  console.log('First item:', JSON.stringify(items[0], null, 2));
}
