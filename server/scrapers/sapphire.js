import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, truncate, fetchWithRetry } from '../utils/helpers.js';

const STORE_NAME = 'Sapphire';
const STORE_URL = 'https://pk.sapphireonline.pk';
const STORE_COLOR = '#1a3a5c'; // Sapphire deep navy brand color

export async function searchProducts(query, limit = 20) {
  try {
    const searchUrl = `${STORE_URL}/search?q=${encodeURIComponent(query)}`;
    const products = await _fetchViaHtml(searchUrl, query, limit);

    console.log(`[${STORE_NAME}] Found ${products.length} products for "${query}"`);
    return products;
  } catch (error) {
    console.error(`[${STORE_NAME}] Search error:`, error.message);
    return [];
  }
}

async function _fetchViaHtml(searchUrl, query, limit) {
  try {
    const response = await fetchWithRetry(() => axios.get(searchUrl, {
      headers: getRequestHeaders(),
      timeout: 15000,
    }));

    const $ = cheerio.load(response.data);
    const products = [];
    const queryWords = query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 1);

    const tiles = $('.product-tile');
    // console.log(`[${STORE_NAME}] HTML tiles found: ${tiles.length}`);

    tiles.each((i, el) => {
      if (products.length >= limit) return false;
      const $el = $(el);

      const titleEl = $el.find('.pdp-link a, a.link, .link').filter((_, e) => $(e).text().trim().length > 0).first();
      const title = sanitizeText(titleEl.text());
      if (!title) return;

      const titleLower = title.toLowerCase();
      const matchCount = queryWords.filter(w => titleLower.includes(w)).length;
      const threshold = Math.max(1, Math.ceil(queryWords.length / 2));
      if (queryWords.length > 0 && matchCount < threshold) return;

      let link = titleEl.attr('href') || '';
      if (link && !link.startsWith('http')) link = `${STORE_URL}${link}`;

      let image = $el.find('img.tile-image').attr('data-src') ||
                  $el.find('img.tile-image').attr('src') || '';
      if (image && image.startsWith('//')) image = 'https:' + image;

      const priceText = $el.find('.price .sales, .price').first().text();
      const price = parsePrice(priceText);
      if (!price) return;

      const oldPriceText = $el.find('.price .strike-through').first().text();
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
        inStock: true, // Sapphire search results don't clearly show out of stock in HTML usually
      });
    });

    return products;
  } catch (error) {
    console.error(`[${STORE_NAME}] HTML fetch error:`, error.message);
    return [];
  }
}

export async function getProductDetails(url) {
  try {
    const response = await axios.get(url, {
      headers: getRequestHeaders(),
      timeout: 15000,
    });
    const $ = cheerio.load(response.data);

    const title = $('meta[property="og:title"]').attr('content') || $('.product-name').first().text() || '';
    const image = $('meta[property="og:image"]').attr('content') || '';
    const price = parsePrice($('.price .sales .value').attr('content') || $('.price .sales').first().text());
    
    if (title && price) {
      return {
        title: sanitizeText(title),
        price,
        originalPrice: parsePrice($('.price .strike-through').first().text()) || null,
        image,
        url,
        rating: 0,
        reviewCount: 0,
        store: STORE_NAME,
        storeUrl: STORE_URL,
        storeColor: STORE_COLOR,
        description: truncate(sanitizeText($('.product-description').text() || ''), 300),
        inStock: !$('.out-of-stock').length,
      };
    }
    return null;
  } catch (error) {
    console.error(`[${STORE_NAME}] Product detail error:`, error.message);
    return null;
  }
}

export default { searchProducts, getProductDetails, storeName: STORE_NAME };
