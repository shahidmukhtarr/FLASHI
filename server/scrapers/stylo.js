import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, truncate, fetchWithRetry } from '../utils/helpers.js';

const STORE_NAME = 'Stylo';
const STORE_URL = 'https://stylo.pk';
const STORE_COLOR = '#c8102e'; // Stylo red

// Collection pages to fetch for broad/store-keyword queries
const COLLECTION_URLS = [
  'https://stylo.pk/collections/women-shoes',
  'https://stylo.pk/collections/ladies-fancy-shoes',
  'https://stylo.pk/collections/summer-shoes',
  'https://stylo.pk/collections/fall-winter',
  'https://stylo.pk/collections/sale',
];

function buildProduct(item) {
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

async function fetchFromCollection(collectionUrl, query, limit) {
  try {
    const urlObj = new URL(collectionUrl);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const handle = pathParts[pathParts.length - 1];
    const jsonUrl = `${STORE_URL}/collections/${handle}/products.json?limit=${Math.min(limit, 250)}`;

    const response = await fetchWithRetry(() => axios.get(jsonUrl, {
      headers: { ...getRequestHeaders(), Accept: 'application/json' },
      timeout: 15000,
    }));

    const items = response.data?.products || [];
    const queryWords = query.toLowerCase().split(/\s+/)
      .filter(w => w.length > 1 && !['stylo', 'shoes', 'shoe'].includes(w));

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
      return items.map(buildProduct).filter(Boolean);
    })(),
    // All collection pages simultaneously
    ...COLLECTION_URLS.map(url => fetchFromCollection(url, query, limit)),
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

  // 3. HTML search fallback
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
