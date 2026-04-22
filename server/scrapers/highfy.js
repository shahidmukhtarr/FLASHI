import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, truncate, fetchWithRetry } from '../utils/helpers.js';

const STORE_NAME = 'Highfy';
const STORE_URL = 'https://highfy.pk';
const STORE_COLOR = '#e91e63';

/**
 * Highfy.pk is a Shopify store.
 * Search uses the Shopify suggest API: /search/suggest.json
 * Product details use the Shopify product JSON endpoint: /products/{handle}.json
 */
export async function searchProducts(query, limit = 20) {
  try {
    // 1. Try Shopify suggest API first
    let products = await _fetchViaSuggestApi(query, limit);

    // 2. Fallback to HTML scraping (suggest API often returns empty on Highfy)
    if (!products || products.length === 0) {
      products = await _fetchViaHtml(query, limit);
    }

    console.log(`[${STORE_NAME}] Found ${products.length} relevant products for "${query}"`);
    return products;
  } catch (error) {
    console.error(`[${STORE_NAME}] Search error:`, error.message);
    return [];
  }
}

async function _fetchViaSuggestApi(query, limit) {
  try {
    const searchUrl = `${STORE_URL}/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=${limit}`;
    const response = await fetchWithRetry(() => axios.get(searchUrl, {
      headers: { ...getRequestHeaders(), 'Accept': 'application/json', 'Referer': STORE_URL },
      timeout: 15000,
    }));

    const rawProducts = response.data?.resources?.results?.products || [];
    if (rawProducts.length === 0) return [];

    const products = [];
    for (const item of rawProducts.slice(0, limit)) {
      const title = sanitizeText(item.title || '');
      if (!title) continue;

      const price = parsePrice(item.price);
      if (!price) continue;

      const originalPrice = parsePrice(item.compare_at_price_max || item.compare_at_price_min);
      let discount = null;
      if (originalPrice && originalPrice > price) {
        discount = `-${Math.round(((originalPrice - price) / originalPrice) * 100)}%`;
      }

      const image = item.featured_image?.url || item.image || '';
      const urlPath = item.url ? item.url.split('?')[0] : `/products/${item.handle}`;

      products.push({
        title, price,
        originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
        discount, image,
        url: `${STORE_URL}${urlPath}`,
        rating: 0, reviewCount: 0,
        store: STORE_NAME, storeUrl: STORE_URL, storeColor: STORE_COLOR,
        inStock: item.available !== false,
      });
    }
    return products;
  } catch {
    return [];
  }
}

async function _fetchViaHtml(query, limit) {
  try {
    const searchUrl = `${STORE_URL}/search?q=${encodeURIComponent(query)}&type=product`;
    const response = await fetchWithRetry(() => axios.get(searchUrl, {
      headers: getRequestHeaders(),
      timeout: 15000,
    }));

    const $ = cheerio.load(response.data);
    const products = [];

    // Highfy uses Dawn theme: .card-wrapper contains product cards
    $('.card-wrapper').each((i, el) => {
      if (products.length >= limit) return false;
      const $el = $(el);

      // Title & link from .card__heading a.full-unstyled-link
      const titleEl = $el.find('.card__heading a.full-unstyled-link, .card__heading a, h3 a').first();
      const title = sanitizeText(titleEl.text());
      if (!title) return;

      let link = titleEl.attr('href') || '';
      if (link && !link.startsWith('http')) link = `${STORE_URL}${link.split('?')[0]}`;

      // Image
      let image = $el.find('img.motion-reduce, img').first().attr('src') ||
                  $el.find('img').first().attr('data-src') || '';
      if (image && image.startsWith('//')) image = 'https:' + image;

      // Price: .price-item--regular or .price-item--sale
      const priceText = $el.find('.price-item--sale, .price-item--regular').first().text();
      const price = parsePrice(priceText);
      if (!price) return;

      const oldPriceText = $el.find('.price-item--regular').last().text();
      const salePrice = $el.find('.price-item--sale').first().text();
      let originalPrice = null;
      if (salePrice && oldPriceText) {
        const op = parsePrice(oldPriceText);
        if (op && op > price) originalPrice = op;
      }

      let discount = null;
      if (originalPrice && originalPrice > price) {
        discount = `-${Math.round(((originalPrice - price) / originalPrice) * 100)}%`;
      }

      products.push({
        title, price,
        originalPrice,
        discount, image,
        url: link,
        rating: 0, reviewCount: 0,
        store: STORE_NAME, storeUrl: STORE_URL, storeColor: STORE_COLOR,
        inStock: !$el.find('.sold-out, .badge--sold-out').length,
      });
    });

    return products;
  } catch (error) {
    console.error(`[${STORE_NAME}] HTML search error:`, error.message);
    return [];
  }
}

/**
 * Get product details from a Highfy.pk product URL
 */
export async function getProductDetails(url) {
  try {
    // Extract handle from URL and use Shopify JSON endpoint
    const handleMatch = url.match(/\/products\/([^?/#]+)/);
    if (handleMatch) {
      const jsonUrl = `${STORE_URL}/products/${handleMatch[1]}.json`;
      try {
        const jsonResp = await axios.get(jsonUrl, {
          headers: { ...getRequestHeaders(), 'Accept': 'application/json' },
          timeout: 15000,
        });
        const product = jsonResp.data?.product;
        if (product) {
          const variant = product.variants?.[0] || {};
          const price = parsePrice(variant.price);
          const originalPrice = parsePrice(variant.compare_at_price);
          const image = product.image?.src || product.images?.[0]?.src || '';
          const description = sanitizeText(product.body_html?.replace(/<[^>]+>/g, '') || '');

          return {
            title: sanitizeText(product.title),
            price,
            originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
            image,
            url,
            rating: 0,
            reviewCount: 0,
            store: STORE_NAME,
            storeUrl: STORE_URL,
            storeColor: STORE_COLOR,
            description: truncate(description, 300),
            inStock: variant.available !== false,
          };
        }
      } catch (e) {
        console.warn(`[${STORE_NAME}] JSON endpoint failed, falling back to HTML:`, e.message);
      }
    }

    // Fallback: scrape the HTML page
    const response = await axios.get(url, {
      headers: getRequestHeaders(),
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Try JSON-LD first
    const jsonLd = $('script[type="application/ld+json"]').toArray();
    for (const script of jsonLd) {
      try {
        const data = JSON.parse($(script).html());
        if (data['@type'] === 'Product') {
          const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          return {
            title: sanitizeText(data.name),
            price: parsePrice(offer?.price),
            image: Array.isArray(data.image) ? data.image[0] : data.image || '',
            url,
            rating: parseFloat(data.aggregateRating?.ratingValue) || 0,
            reviewCount: parseInt(data.aggregateRating?.reviewCount) || 0,
            store: STORE_NAME,
            storeUrl: STORE_URL,
            storeColor: STORE_COLOR,
            description: truncate(sanitizeText(data.description), 300),
            inStock: offer?.availability?.includes('InStock') ?? true,
          };
        }
      } catch (e) { /* continue */ }
    }

    // Manual HTML extraction fallback
    const title = sanitizeText($('h1').first().text() || $('meta[property="og:title"]').attr('content') || '');
    const image = $('meta[property="og:image"]').attr('content') || '';
    const priceText = $('.price-item--sale, .price-item--regular, .product-price').first().text();
    const price = parsePrice(priceText);
    const description = sanitizeText($('meta[property="og:description"]').attr('content') || '');

    if (title) {
      return {
        title, price, image, url,
        rating: 0, reviewCount: 0,
        store: STORE_NAME, storeUrl: STORE_URL, storeColor: STORE_COLOR,
        description: truncate(description, 300),
        inStock: true,
      };
    }

    return null;
  } catch (error) {
    console.error(`[${STORE_NAME}] Product details error:`, error.message);
    return null;
  }
}

export const storeName = STORE_NAME;
