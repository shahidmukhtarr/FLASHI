import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, truncate } from '../utils/helpers.js';

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
    const searchUrl = `${STORE_URL}/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=10`;

    const response = await axios.get(searchUrl, {
      headers: {
        ...getRequestHeaders(),
        'Accept': 'application/json',
        'Referer': STORE_URL,
      },
      timeout: 20000,
    });

    const data = response.data;
    const rawProducts = data?.resources?.results?.products || [];
    const products = [];

    const queryWords = query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 1);

    for (const item of rawProducts) {
      if (products.length >= limit) break;

      const title = sanitizeText(item.title || '');
      if (!title) continue;

      // Relevance filter: majority of query words must appear in the title
      const titleLower = title.toLowerCase();
      const matchCount = queryWords.filter(word => titleLower.includes(word)).length;
      const threshold = Math.max(1, Math.ceil(queryWords.length / 2));
      if (queryWords.length > 0 && matchCount < threshold) continue;

      const price = parsePrice(item.price);
      const originalPrice = parsePrice(item.compare_at_price_max || item.compare_at_price_min);
      let discount = null;
      if (originalPrice && price && originalPrice > price) {
        discount = Math.round(((originalPrice - price) / originalPrice) * 100) + '%';
      }

      const image = item.featured_image?.url || item.image || '';
      const urlPath = item.url ? item.url.split('?')[0] : `/products/${item.handle}`;
      const productUrl = `${STORE_URL}${urlPath}`;

      products.push({
        title,
        price,
        originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
        discount,
        image,
        url: productUrl,
        rating: 0,
        reviewCount: 0,
        store: STORE_NAME,
        storeUrl: STORE_URL,
        storeColor: STORE_COLOR,
        inStock: item.available !== false,
      });
    }

    console.log(`[${STORE_NAME}] Found ${products.length} relevant products for "${query}"`);
    return products;
  } catch (error) {
    console.error(`[${STORE_NAME}] Search error:`, error.message);
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
