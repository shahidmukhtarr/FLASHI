import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, truncate } from '../utils/helpers.js';

const STORE_NAME = 'PriceOye';
const STORE_URL = 'https://priceoye.pk';
const STORE_COLOR = '#e21b70';

/**
 * Search products on PriceOye.pk
 * PriceOye renders product cards as <a class="product-card"> with:
 *   - data-product-name   → title
 *   - href                → product URL
 *   - amp-img[src]        → image
 *   - .price-box.p1       → current price  ("Rs  266,999")
 *   - .price-diff-retail  → original price ("Rs  284,000")
 *   - .h6.bold            → rating value
 *   - .rating-h7.bold:first → review count
 */
export async function searchProducts(query, limit = 20) {
  try {
    const searchUrl = `${STORE_URL}/search?q=${encodeURIComponent(query)}`;

    const response = await axios.get(searchUrl, {
      headers: getRequestHeaders(),
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const products = [];

    $('a.productBox, a.product-card').each((i, el) => {
      if (products.length >= limit) return false;

      const $el = $(el);

      // Title is stored directly in data attribute
      const name = $el.attr('data-product-name') || $el.find('.p-title').text().trim();
      if (!name) return;

      // URL
      const href = $el.attr('href') || '';
      const url = href.startsWith('http') ? href : `${STORE_URL}${href}`;

      // Image: PriceOye uses <amp-img> — grab the src from it
      const imgEl = $el.find('amp-img').first();
      const image = imgEl.attr('src') || imgEl.attr('data-src') || '';

      // Price: ".price-box.p1" contains "Rs  266,999"
      const priceText = $el.find('.price-box.p1, .price-box').first().text();
      const price = parsePrice(priceText);

      // Original price: ".price-diff-retail" contains "Rs  284,000"
      const origText = $el.find('.price-diff-retail').first().text();
      const originalPrice = parsePrice(origText);

      // Rating & reviews
      const ratingText = $el.find('.user-rating-content .h6').text().trim();
      const rating = parseFloat(ratingText) || 0;
      const reviewCountText = $el.find('.user-rating-content .rating-h7').first().text().trim();
      const reviewCount = parseInt(reviewCountText) || 0;

      if (name && price) {
        products.push({
          title: sanitizeText(name),
          price,
          originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
          image: image.startsWith('http') ? image : '',
          url,
          rating,
          reviewCount,
          store: STORE_NAME,
          storeUrl: STORE_URL,
          storeColor: STORE_COLOR,
          inStock: true,
        });
      }
    });

    console.log(`[${STORE_NAME}] Found ${products.length} products for "${query}"`);
    return products;
  } catch (error) {
    console.error(`[${STORE_NAME}] Search error:`, error.message);
    return [];
  }
}

/**
 * Get product details from a PriceOye URL
 */
export async function getProductDetails(url) {
  try {
    const response = await axios.get(url, {
      headers: getRequestHeaders(),
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // 1. Try JSON-LD (most reliable)
    const jsonLdScripts = $('script[type="application/ld+json"]');
    for (let i = 0; i < jsonLdScripts.length; i++) {
      try {
        const data = JSON.parse($(jsonLdScripts[i]).html());
        const product = Array.isArray(data) ? data.find(item => item['@type'] === 'Product') : (data['@type'] === 'Product' ? data : null);

        if (product) {
          return {
            title: sanitizeText(product.name),
            price: parsePrice(product.offers?.price || product.offers?.lowPrice || product.offers?.[0]?.price),
            originalPrice: parsePrice(product.offers?.highPrice),
            image: Array.isArray(product.image) ? product.image[0] : (product.image || ''),
            url,
            rating: parseFloat(product.aggregateRating?.ratingValue) || 0,
            reviewCount: parseInt(product.aggregateRating?.reviewCount) || 0,
            store: STORE_NAME,
            storeUrl: STORE_URL,
            storeColor: STORE_COLOR,
            description: truncate(sanitizeText(product.description || ''), 300),
            inStock: product.offers?.availability?.includes('InStock') ?? true,
          };
        }
      } catch (e) { /* ignore parse errors */ }
    }

    // 2. Fallback: use same selectors as search
    const title = $('[data-product-name]').attr('data-product-name') ||
                  sanitizeText($('meta[property="og:title"]').attr('content') || $('h1').first().text());
    const image = $('meta[property="og:image"]').attr('content') || '';
    const priceText = $('.price-box.p1, .price-box').first().text();
    const price = parsePrice(priceText) || parsePrice($('meta[property="product:price:amount"]').attr('content'));
    const origText = $('.price-diff-retail').first().text();
    const originalPrice = parsePrice(origText);

    if (title && price) {
      return {
        title,
        price,
        originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
        image,
        url,
        rating: parseFloat($('.h6.bold').first().text()) || 0,
        reviewCount: 0,
        store: STORE_NAME,
        storeUrl: STORE_URL,
        storeColor: STORE_COLOR,
        description: truncate(sanitizeText($('meta[name="description"]').attr('content') || ''), 300),
        inStock: true,
      };
    }

    return null;
  } catch (error) {
    console.error(`[${STORE_NAME}] Product detail error:`, error.message);
    return null;
  }
}

export default { searchProducts, getProductDetails, storeName: STORE_NAME };
