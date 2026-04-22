import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, truncate, fetchWithRetry } from '../utils/helpers.js';

const STORE_NAME = 'Stationers.pk';
const STORE_URL = 'https://stationers.pk';
const STORE_COLOR = '#e63946'; // Stationers red brand color

export async function searchProducts(query, limit = 20) {
  try {
    // Shopify predictive search API
    const apiUrl = `${STORE_URL}/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=${limit}`;

    let products = await _fetchViaSuggestApi(apiUrl, query, limit);

    // Fallback to HTML
    if (!products || products.length === 0) {
      products = await _fetchViaHtml(query, limit);
    }

    console.log(`[${STORE_NAME}] Found ${products.length} products for "${query}"`);
    return products;
  } catch (error) {
    console.error(`[${STORE_NAME}] Search error:`, error.message);
    return [];
  }
}

async function _fetchViaSuggestApi(apiUrl, query, limit) {
  try {
    const response = await fetchWithRetry(() => axios.get(apiUrl, {
      headers: {
        ...getRequestHeaders(),
        'Accept': 'application/json',
      },
      timeout: 15000,
    }));

    const resources = response.data?.resources?.results;
    const items = resources?.products || [];
    if (!Array.isArray(items) || items.length === 0) return [];

    const products = [];
    const queryWords = query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 1);

    for (const item of items.slice(0, limit)) {
      const title = sanitizeText(item.title || '');
      if (!title) continue;

      const titleLower = title.toLowerCase();
      const matchCount = queryWords.filter(w => titleLower.includes(w)).length;
      const threshold = Math.max(1, Math.ceil(queryWords.length / 2));
      if (queryWords.length > 0 && matchCount < threshold) continue;

      // Shopify prices from suggest API
      const priceRaw = item.price || item.price_min || '0';
      const price = parsePrice(priceRaw);
      if (!price || price <= 0) continue;

      const comparePriceRaw = item.compare_at_price || item.compare_at_price_min || '0';
      const comparePrice = parsePrice(comparePriceRaw);
      const originalPrice = comparePrice > price ? comparePrice : null;

      let discount = null;
      if (originalPrice && originalPrice > price) {
        const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
        discount = `-${pct}%`;
      }

      let image = item.featured_image?.url || item.image || '';
      if (image && image.startsWith('//')) image = 'https:' + image;

      let url = item.url || '';
      if (url && !url.startsWith('http')) url = `${STORE_URL}${url}`;

      products.push({
        title,
        price,
        originalPrice,
        discount,
        image,
        url,
        rating: 0,
        reviewCount: 0,
        store: STORE_NAME,
        storeUrl: STORE_URL,
        storeColor: STORE_COLOR,
        inStock: item.available !== false,
      });
    }

    return products;
  } catch {
    return [];
  }
}

async function _fetchViaHtml(query, limit) {
  const searchUrl = `${STORE_URL}/search?q=${encodeURIComponent(query)}&type=product`;

  const response = await fetchWithRetry(() => axios.get(searchUrl, {
    headers: getRequestHeaders(),
    timeout: 15000,
  }));

  const $ = cheerio.load(response.data);
  const products = [];
  const queryWords = query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 1);

  // stationers.pk uses standard Shopify grid theme
  const selectors = [
    '.grid__item',
    '.product-item',
    '.collection-product-card',
    '.grid-product',
    '.product-card',
  ];

  let $items = $([]);
  for (const sel of selectors) {
    $items = $(sel);
    if ($items.length > 0) break;
  }

  if ($items.length === 0) {
    return _extractFromJsonLd($, query, limit);
  }

  $items.each((i, el) => {
    if (products.length >= limit) return false;
    const $el = $(el);

    // Title
    const titleEl = $el.find('a.full-unstyled-link, .card__heading a, .product-card__title a, .product-item__title a, h3 a, h2 a').first();
    const title = sanitizeText(titleEl.text());
    if (!title) return;

    const titleLower = title.toLowerCase();
    const matchCount = queryWords.filter(w => titleLower.includes(w)).length;
    const threshold = Math.max(1, Math.ceil(queryWords.length / 2));
    if (queryWords.length > 0 && matchCount < threshold) return;

    let link = titleEl.attr('href') || $el.find('a').first().attr('href') || '';
    if (link && !link.startsWith('http')) link = `${STORE_URL}${link}`;

    let image = $el.find('img').first().attr('data-src') ||
                $el.find('img').first().attr('src') || '';
    if (image && image.startsWith('//')) image = 'https:' + image;

    const priceText = $el.find('.price__sale .price-item, .price .price-item--sale, .price .price-item--regular, .money, .price').first().text();
    const price = parsePrice(priceText);
    if (!price) return;

    const oldPriceText = $el.find('s.price-item, .price__regular .price-item, s.money, .was-price').first().text();
    const originalPrice = parsePrice(oldPriceText);
    let discount = null;
    if (originalPrice && originalPrice > price) {
      const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
      discount = `-${pct}%`;
    }

    products.push({
      title,
      price,
      originalPrice: originalPrice || null,
      discount,
      image,
      url: link,
      rating: 0,
      reviewCount: 0,
      store: STORE_NAME,
      storeUrl: STORE_URL,
      storeColor: STORE_COLOR,
      inStock: !$el.find('.sold-out, .badge--sold-out, .product-item--sold-out').length,
    });
  });

  return products;
}

function _extractFromJsonLd($, query, limit) {
  const products = [];
  const queryWords = query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 1);

  $('script[type="application/ld+json"]').each((_, el) => {
    if (products.length >= limit) return false;
    try {
      const data = JSON.parse($(el).html());
      const items = data?.itemListElement || (Array.isArray(data) ? data : [data]);
      for (const item of items) {
        const product = item.item || item;
        if (product['@type'] !== 'Product' || !product.name) continue;

        const title = sanitizeText(product.name);
        const titleLower = title.toLowerCase();
        const matchCount = queryWords.filter(w => titleLower.includes(w)).length;
        const threshold = Math.max(1, Math.ceil(queryWords.length / 2));
        if (queryWords.length > 0 && matchCount < threshold) continue;

        const price = parsePrice(product.offers?.price || product.offers?.lowPrice);
        if (!price) continue;

        products.push({
          title,
          price,
          originalPrice: parsePrice(product.offers?.highPrice) || null,
          discount: null,
          image: Array.isArray(product.image) ? product.image[0] : product.image || '',
          url: product.url || STORE_URL,
          rating: parseFloat(product.aggregateRating?.ratingValue) || 0,
          reviewCount: parseInt(product.aggregateRating?.reviewCount) || 0,
          store: STORE_NAME,
          storeUrl: STORE_URL,
          storeColor: STORE_COLOR,
          inStock: product.offers?.availability?.includes('InStock') ?? true,
        });
        if (products.length >= limit) break;
      }
    } catch { /* continue */ }
  });
  return products;
}

export async function getProductDetails(url) {
  try {
    // Try Shopify product JSON endpoint
    const jsonUrl = url.replace(/(\?.*)$/, '') + '.json';
    try {
      const jsonResp = await axios.get(jsonUrl, {
        headers: { ...getRequestHeaders(), 'Accept': 'application/json' },
        timeout: 10000,
      });
      const p = jsonResp.data?.product;
      if (p && p.title) {
        const variant = p.variants?.[0];
        const price = parseFloat(variant?.price || '0');
        const compareAt = parseFloat(variant?.compare_at_price || '0');
        return {
          title: sanitizeText(p.title),
          price: price || null,
          originalPrice: compareAt > price ? compareAt : null,
          image: p.images?.[0]?.src || '',
          url,
          rating: 0,
          reviewCount: 0,
          store: STORE_NAME,
          storeUrl: STORE_URL,
          storeColor: STORE_COLOR,
          description: truncate(sanitizeText(p.body_html?.replace(/<[^>]*>/g, '') || ''), 300),
          inStock: variant?.inventory_quantity > 0 || variant?.inventory_policy === 'continue',
        };
      }
    } catch { /* fall through to HTML */ }

    const response = await axios.get(url, {
      headers: getRequestHeaders(),
      timeout: 15000,
    });
    const $ = cheerio.load(response.data);

    // JSON-LD
    const jsonLd = $('script[type="application/ld+json"]').toArray();
    for (const script of jsonLd) {
      try {
        const data = JSON.parse($(script).html());
        if (data['@type'] === 'Product' && data.name) {
          return {
            title: sanitizeText(data.name),
            price: parsePrice(data.offers?.price || data.offers?.lowPrice),
            originalPrice: parsePrice(data.offers?.highPrice) || null,
            image: Array.isArray(data.image) ? data.image[0] : data.image || '',
            url,
            rating: parseFloat(data.aggregateRating?.ratingValue) || 0,
            reviewCount: parseInt(data.aggregateRating?.reviewCount) || 0,
            store: STORE_NAME, storeUrl: STORE_URL, storeColor: STORE_COLOR,
            description: truncate(sanitizeText(data.description || ''), 300),
            inStock: data.offers?.availability?.includes('InStock') ?? true,
          };
        }
      } catch { /* continue */ }
    }

    const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text() || '';
    const image = $('meta[property="og:image"]').attr('content') || '';
    const price = parsePrice($('.price__sale .price-item, .price .price-item--regular, .money').first().text());
    if (title && price) {
      return {
        title: sanitizeText(title), price, image, url, rating: 0, reviewCount: 0,
        store: STORE_NAME, storeUrl: STORE_URL, storeColor: STORE_COLOR,
        description: '', inStock: true,
      };
    }
    return null;
  } catch (error) {
    console.error(`[${STORE_NAME}] Product detail error:`, error.message);
    return null;
  }
}

export default { searchProducts, getProductDetails, storeName: STORE_NAME };
