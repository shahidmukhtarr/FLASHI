import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, truncate, fetchWithRetry } from '../utils/helpers.js';

const STORE_NAME = 'Audionic';
const STORE_URL = 'https://audionic.co';
const STORE_COLOR = '#e53935';

const COLLECTION_URLS = [
  'https://audionic.co/collections/wireless-earbuds',
  'https://audionic.co/collections/wireless-headphones',
  'https://audionic.co/collections/power-bank',
  'https://audionic.co/collections/bluetooth-portable-speakers',
  'https://audionic.co/collections/wired-earphones-1',
  'https://audionic.co/collections/mobile-phone-accessories',
];

function parseShopifyProduct(item) {
  const price = parsePrice(item.price || item.price_min || '0');
  if (!price) return null;
  const comparePrice = parsePrice(item.compare_at_price || item.compare_at_price_max || '0');
  const originalPrice = comparePrice > price ? comparePrice : null;
  let image = item.featured_image?.url || item.image || '';
  if (image && image.startsWith('//')) image = 'https:' + image;
  let url = item.url || (item.handle ? `${STORE_URL}/products/${item.handle}` : '');
  if (url && !url.startsWith('http')) url = `${STORE_URL}${url}`;
  url = url.split('?')[0];
  return {
    title: sanitizeText(item.title || ''),
    price, originalPrice,
    discount: originalPrice ? `-${Math.round(((originalPrice - price) / originalPrice) * 100)}%` : null,
    image, url, rating: 0, reviewCount: 0,
    store: STORE_NAME, storeUrl: STORE_URL, storeColor: STORE_COLOR,
    inStock: item.available !== false,
  };
}

async function fetchCollectionProducts(collectionUrl, query, limit = 20) {
  try {
    const pathParts = new URL(collectionUrl).pathname.split('/').filter(Boolean);
    const handle = pathParts[pathParts.length - 1];
    if (!pathParts.includes('collections')) return [];
    const jsonUrl = `${STORE_URL}/collections/${handle}/products.json?limit=${limit}`;
    const response = await fetchWithRetry(() => axios.get(jsonUrl, {
      headers: { ...getRequestHeaders(), Accept: 'application/json' },
      timeout: 15000,
    }));
    const items = response.data?.products || [];
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1 && w !== 'audionic');
    return items.map(item => {
      const price = parsePrice(item.variants?.[0]?.price || '0');
      if (!price) return null;
      const comparePrice = parsePrice(item.variants?.[0]?.compare_at_price || '0');
      const originalPrice = comparePrice > price ? comparePrice : null;
      let image = item.image?.src || item.images?.[0]?.src || '';
      if (image && image.startsWith('//')) image = 'https:' + image;
      return {
        title: sanitizeText(item.title || ''),
        price, originalPrice,
        discount: originalPrice ? `-${Math.round(((originalPrice - price) / originalPrice) * 100)}%` : null,
        image, url: `${STORE_URL}/products/${item.handle}`,
        rating: 0, reviewCount: 0,
        store: STORE_NAME, storeUrl: STORE_URL, storeColor: STORE_COLOR,
        inStock: item.variants?.some(v => v.available) ?? true,
      };
    }).filter(p => {
      if (!p) return false;
      if (queryWords.length === 0) return true;
      return queryWords.some(w => p.title.toLowerCase().includes(w));
    }).slice(0, limit);
  } catch { return []; }
}

export async function searchProducts(query, limit = 50) {
  const seen = new Set();
  const allProducts = [];
  const [suggestResult, ...collectionResults] = await Promise.allSettled([
    (async () => {
      const apiUrl = `${STORE_URL}/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=20`;
      const response = await fetchWithRetry(() => axios.get(apiUrl, {
        headers: { ...getRequestHeaders(), Accept: 'application/json' }, timeout: 15000,
      }));
      return (response.data?.resources?.results?.products || []).map(item => parseShopifyProduct(item)).filter(Boolean);
    })(),
    ...COLLECTION_URLS.map(url => fetchCollectionProducts(url, query, limit)),
  ]);

  if (suggestResult.status === 'fulfilled') {
    for (const p of suggestResult.value || []) {
      if (p?.url && !seen.has(p.url)) { seen.add(p.url); allProducts.push(p); }
    }
  }
  for (const cr of collectionResults) {
    if (cr.status !== 'fulfilled') continue;
    for (const p of cr.value || []) {
      if (allProducts.length >= limit) break;
      if (p?.url && !seen.has(p.url)) { seen.add(p.url); allProducts.push(p); }
    }
  }

  console.log(`[${STORE_NAME}] Found ${allProducts.length} products for "${query}"`);
  return allProducts.slice(0, limit);
}

export async function getProductDetails(url) {
  try {
    const response = await axios.get(url, { headers: getRequestHeaders(), timeout: 15000 });
    const $ = cheerio.load(response.data);
    for (const script of $('script[type="application/ld+json"]').toArray()) {
      try {
        const data = JSON.parse($(script).html());
        if (data['@type'] === 'Product' && data.name) {
          return {
            title: sanitizeText(data.name),
            price: parsePrice(data.offers?.price || data.offers?.lowPrice),
            originalPrice: parsePrice(data.offers?.highPrice) || null,
            image: Array.isArray(data.image) ? data.image[0] : data.image || '',
            url, rating: 0, reviewCount: 0,
            store: STORE_NAME, storeUrl: STORE_URL, storeColor: STORE_COLOR,
            description: truncate(sanitizeText(data.description || ''), 300),
            inStock: data.offers?.availability?.includes('InStock') ?? true,
          };
        }
      } catch { /* continue */ }
    }
    const title = sanitizeText($('meta[property="og:title"]').attr('content') || $('h1').first().text() || '');
    const price = parsePrice($('.price__sale .price-item, .price .price-item--sale, .price .price-item--regular').first().text());
    const image = $('meta[property="og:image"]').attr('content') || '';
    if (title && price) {
      return {
        title, price, image, url, rating: 0, reviewCount: 0,
        store: STORE_NAME, storeUrl: STORE_URL, storeColor: STORE_COLOR,
        description: truncate(sanitizeText($('meta[property="og:description"]').attr('content') || ''), 300),
        inStock: !$('.sold-out-badge, .product-form__submit[disabled]').length,
      };
    }
    return null;
  } catch (e) {
    console.error(`[${STORE_NAME}] Product detail error:`, e.message);
    return null;
  }
}

export default { searchProducts, getProductDetails, storeName: STORE_NAME };
