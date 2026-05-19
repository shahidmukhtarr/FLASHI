import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, truncate, fetchWithRetry } from '../utils/helpers.js';

const STORE_NAME = 'PhoneCase.pk';
const STORE_URL = 'https://phonecase.pk';
const STORE_COLOR = '#1565c0';

function parseShopifyProduct(item) {
  // price_min is in cents (e.g. "99900" = 999.00 PKR) — Shopify returns prices multiplied by 100
  const rawPrice = item.price || item.price_min || '0';
  // Shopify suggest API returns prices as integers scaled by 100 (e.g. 99900 = Rs.999)
  const priceNum = parseInt(String(rawPrice).replace(/[^0-9]/g, ''), 10) || 0;
  const price = priceNum > 10000 ? priceNum / 100 : priceNum; // normalize
  if (!price) return null;
  const rawCompare = item.compare_at_price || item.compare_at_price_max || '0';
  const compareNum = parseInt(String(rawCompare).replace(/[^0-9]/g, ''), 10) || 0;
  const comparePrice = compareNum > 10000 ? compareNum / 100 : compareNum;
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

export async function searchProducts(query, limit = 50) {
  const seen = new Set();
  const allProducts = [];

  // Primary: suggest.json API
  try {
    const apiUrl = `${STORE_URL}/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=20`;
    const response = await fetchWithRetry(() => axios.get(apiUrl, {
      headers: { ...getRequestHeaders(), Accept: 'application/json' }, timeout: 15000,
    }));
    const items = response.data?.resources?.results?.products || [];
    for (const item of items) {
      const p = parseShopifyProduct(item);
      if (p?.url && !seen.has(p.url)) { seen.add(p.url); allProducts.push(p); }
    }
  } catch { /* continue to fallback */ }

  // Fallback: HTML search
  if (allProducts.length === 0) {
    try {
      const searchUrl = `${STORE_URL}/search?q=${encodeURIComponent(query)}&type=product`;
      const response = await fetchWithRetry(() => axios.get(searchUrl, {
        headers: getRequestHeaders(), timeout: 15000,
      }));
      const $ = cheerio.load(response.data);
      $('.grid__item .card-wrapper, .product-item, li.grid__item, .grid-product, .product-card').each((_, el) => {
        if (allProducts.length >= limit) return false;
        const $el = $(el);
        const titleEl = $el.find('a.full-unstyled-link, .card__heading a, h3 a, h2 a').first();
        const title = sanitizeText(titleEl.text());
        if (!title) return;
        let link = titleEl.attr('href') || '';
        if (link && !link.startsWith('http')) link = `${STORE_URL}${link}`;
        link = link.split('?')[0];
        if (seen.has(link)) return;
        let image = $el.find('img').first().attr('data-src') || $el.find('img').first().attr('src') || '';
        if (image && image.startsWith('//')) image = 'https:' + image;
        const price = parsePrice($el.find('.price__sale .price-item, .price .price-item--sale, .price .price-item--regular').first().text());
        if (!price) return;
        const originalPrice = parsePrice($el.find('.price__regular .price-item--regular, s.money').first().text()) || null;
        seen.add(link);
        allProducts.push({
          title, price, originalPrice,
          discount: originalPrice && originalPrice > price ? `-${Math.round(((originalPrice - price) / originalPrice) * 100)}%` : null,
          image, url: link, rating: 0, reviewCount: 0,
          store: STORE_NAME, storeUrl: STORE_URL, storeColor: STORE_COLOR,
          inStock: !$el.find('.sold-out, .badge--sold-out').length,
        });
      });
    } catch (e) {
      console.error(`[${STORE_NAME}] HTML fallback error:`, e.message);
    }
  }

  console.log(`[${STORE_NAME}] Found ${allProducts.length} products for "${query}"`);
  return allProducts.slice(0, limit);
}

export async function getProductDetails(url) {
  try {
    const cleanUrl = url.split('?')[0];
    const response = await axios.get(cleanUrl, { headers: getRequestHeaders(), timeout: 15000 });
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
            url: cleanUrl, rating: 0, reviewCount: 0,
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
        title, price, image, url: cleanUrl, rating: 0, reviewCount: 0,
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
