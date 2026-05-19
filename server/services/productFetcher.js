import { queryStoredProducts } from './db.js';
import { isRelevantProduct } from './scraperEngine.js';

export async function fetchProductsForCategory(searchQueries) {
  const allProducts = [];
  const seen = new Set();

  for (const q of searchQueries) {
    const data = await queryStoredProducts({ q, limit: 1000, page: 1 });
    if (!data || !data.products) continue;

    for (const p of data.products) {
      if (!isRelevantProduct(p.title || '', q)) continue;

      // Filter out >15% discounts, but exempt stores that use fake discounts as their standard pricing
      const exemptedStores = ['zero lifestyle', 'audionic', 'saya', 'phonecase.pk', 'daraz', 'priceoye', 'mega.pk', 'shophive', 'naheed'];
      const storeNameLower = String(p.store || '').toLowerCase();

      if (!exemptedStores.includes(storeNameLower)) {
        const parsePrice = (val) => {
          if (typeof val === 'number') return val;
          if (!val || typeof val !== 'string') return NaN;
          return Number(val.replace(/[^0-9.]/g, ''));
        };
        const price = parsePrice(p.price);
        const origPrice = parsePrice(p.originalPrice);
        
        if (!isNaN(origPrice) && !isNaN(price) && origPrice > price) {
          const discountPct = ((origPrice - price) / origPrice) * 100;
          if (discountPct >= 15) continue; // Skip premium sale items
        }
      }

      // Fix broken Daraz URLs
      if (p.url && typeof p.url === 'string') {
        p.url = p.url.replace(/\/products\/-i(\d+)\.html/, '/products/item-i$1.html');
      }

      if (!seen.has(p.id)) {
        seen.add(p.id);
        allProducts.push(p);
      }
    }
  }

  return allProducts;
}
