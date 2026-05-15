import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, truncate, fetchWithRetry } from '../utils/helpers.js';

const STORE_NAME = 'Outfitters';
const STORE_URL = 'https://outfitters.com.pk';
const STORE_COLOR = '#1a1a1a';

// Collection pages to use as fallback for browsing
const COLLECTION_URLS = [
  'https://outfitters.com.pk/collections/men-t-shirts-and-polos',
  'https://outfitters.com.pk/collections/women-t-shirts',
  'https://outfitters.com.pk/collections/men-view-all-collection',
  'https://outfitters.com.pk/pages/women-pause',
];

function parseShopifyProduct(item, limit) {
  const price = parsePrice(item.price || item.price_min || '0');
  if (!price) return null;
  const comparePrice = parsePrice(item.compare_at_price || item.compare_at_price_min || '0');
  const originalPrice = comparePrice > price ? comparePrice : null;
  let image = item.featured_image?.url || item.image || '';
  if (image && image.startsWith('//')) image = 'https:' + image;
  let url = item.url || (item.handle ? `${STORE_URL}/products/${item.handle}` : '');
  if (url && !url.startsWith('http')) url = `${STORE_URL}${url}`;
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
    // Extract collection handle from URL
    const urlObj = new URL(collectionUrl);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const handle = pathParts[pathParts.length - 1];
    const type = pathParts.includes('collections') ? 'collections' : 'pages';

    // Try Shopify JSON API for collections
    if (type === 'collections') {
      const jsonUrl = `${STORE_URL}/collections/${handle}/products.json?limit=${limit}`;
      const response = await fetchWithRetry(() => axios.get(jsonUrl, {
        headers: { ...getRequestHeaders(), Accept: 'application/json' },
        timeout: 15000,
      }));
      const items = response.data?.products || [];
      const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1 && w !== 'outfitters' && w !== 'outfitter');
      return items
        .map(item => {
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
            image,
            url: `${STORE_URL}/products/${item.handle}`,
            rating: 0, reviewCount: 0,
            store: STORE_NAME, storeUrl: STORE_URL, storeColor: STORE_COLOR,
            inStock: item.variants?.some(v => v.available) ?? true,
          };
        })
        .filter(p => {
          if (!p) return false;
          if (queryWords.length === 0) return true;
          const titleLower = p.title.toLowerCase();
          return queryWords.some(w => titleLower.includes(w));
        })
        .slice(0, limit);
    }
    return [];
  } catch {
    return [];
  }
}

export async function searchProducts(query, limit = 50) {
  // Run suggest API + all collection pages in parallel for maximum results
  const seen = new Set();
  const allProducts = [];

  const [suggestResult, ...collectionResults] = await Promise.allSettled([
    // Suggest API
    (async () => {
      const apiUrl = `${STORE_URL}/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=20`;
      const response = await fetchWithRetry(() => axios.get(apiUrl, {
        headers: { ...getRequestHeaders(), Accept: 'application/json' },
        timeout: 15000,
      }));
      const items = response.data?.resources?.results?.products || [];
      return items.map(item => parseShopifyProduct(item)).filter(Boolean);
    })(),
    // All collection pages simultaneously
    ...COLLECTION_URLS.map(url => fetchCollectionProducts(url, query, limit)),
  ]);

  // Merge suggest results first (most relevant)
  if (suggestResult.status === 'fulfilled') {
    for (const p of suggestResult.value || []) {
      if (p?.url && !seen.has(p.url)) { seen.add(p.url); allProducts.push(p); }
    }
  }
  // Then add collection results
  for (const cr of collectionResults) {
    if (cr.status !== 'fulfilled') continue;
    for (const p of cr.value || []) {
      if (allProducts.length >= limit) break;
      if (p?.url && !seen.has(p.url)) { seen.add(p.url); allProducts.push(p); }
    }
  }

  if (allProducts.length > 0) return allProducts.slice(0, limit);

  // Last resort: HTML search page
  try {
    const searchUrl = `${STORE_URL}/search?q=${encodeURIComponent(query)}&type=product`;
    const response = await fetchWithRetry(() => axios.get(searchUrl, {
      headers: getRequestHeaders(), timeout: 15000,
    }));
    const $ = cheerio.load(response.data);
    const products = [];
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);

    $('.grid__item .card-wrapper, .product-item, li.grid__item, .grid-product').each((_, el) => {
      if (products.length >= limit) return false;
      const $el = $(el);
      const titleEl = $el.find('a.full-unstyled-link, .card__heading a, .product-item__title, h3 a, h2 a').first();
      const title = sanitizeText(titleEl.text());
      if (!title) return;
      const titleLower = title.toLowerCase();
      const matchCount = queryWords.filter(w => titleLower.includes(w)).length;
      if (queryWords.length > 0 && matchCount < Math.max(1, Math.ceil(queryWords.length / 2))) return;
      let link = titleEl.attr('href') || '';
      if (link && !link.startsWith('http')) link = `${STORE_URL}${link}`;
      let image = $el.find('img').first().attr('data-src') || $el.find('img').first().attr('src') || '';
      if (image && image.startsWith('//')) image = 'https:' + image;
      const price = parsePrice($el.find('.price__sale .price-item, .price .price-item--sale, .price .price-item--regular').first().text());
      if (!price) return;
      const originalPrice = parsePrice($el.find('.price__regular .price-item--regular, s.money').first().text()) || null;
      products.push({
        title, price, originalPrice,
        discount: originalPrice && originalPrice > price ? `-${Math.round(((originalPrice - price) / originalPrice) * 100)}%` : null,
        image, url: link, rating: 0, reviewCount: 0,
        store: STORE_NAME, storeUrl: STORE_URL, storeColor: STORE_COLOR,
        inStock: !$el.find('.sold-out, .badge--sold-out').length,
      });
    });
    return products;
  } catch (e) {
    console.error(`[${STORE_NAME}] Search error:`, e.message);
    return [];
  }
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