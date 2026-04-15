import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, truncate } from '../utils/helpers.js';

const STORE_NAME = 'Mega.pk';
const STORE_URL = 'https://www.mega.pk';
const STORE_COLOR = '#0071dc';

/**
 * Mega.pk AJAX search endpoint returns the full product catalog (2000+ items).
 * We fetch it and filter down to items whose title contains ALL query words.
 * Structure of each .srch-result-div:
 *   a.result-header[href]
 *     img[src]
 *     h4  → title
 *     .srch-price → price (e.g. "404,999")
 */
export async function searchProducts(query, limit = 20) {
  try {
    const searchUrl = `${STORE_URL}/ajax.php?key=search&search=${encodeURIComponent(query)}`;

    const response = await axios.get(searchUrl, {
      headers: {
        ...getRequestHeaders(),
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': STORE_URL,
      },
      timeout: 20000,
    });

    const $ = cheerio.load(response.data);
    const products = [];

    // Pre-compute query words for relevance filtering
    const queryWords = query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 1);

    $('.srch-result-div').each((i, el) => {
      if (products.length >= limit) return false;

      const $el = $(el);
      const $a = $el.find('a.result-header').first();
      const link = $a.attr('href') || '';
      const title = sanitizeText($a.find('h4').text());
      const img = $a.find('img').attr('src') || '';
      const priceText = $a.find('.srch-price').text();
      const price = parsePrice(priceText);

      if (!title || !price) return;

      // ── Relevance filter: ALL query words must appear in the title ──
      const titleLower = title.toLowerCase();
      const allMatch = queryWords.every(word => titleLower.includes(word));
      if (!allMatch) return;

      products.push({
        title,
        price,
        originalPrice: null,
        discount: null,
        image: img.startsWith('http') ? img : img ? `${STORE_URL}/${img}` : '',
        url: link.startsWith('http') ? link : link ? `${STORE_URL}/${link}` : STORE_URL,
        rating: 0,
        reviewCount: 0,
        store: STORE_NAME,
        storeUrl: STORE_URL,
        storeColor: STORE_COLOR,
        inStock: true,
      });
    });

    console.log(`[${STORE_NAME}] Found ${products.length} relevant products for "${query}"`);
    return products;
  } catch (error) {
    console.error(`[${STORE_NAME}] Search error:`, error.message);
    return [];
  }
}

/**
 * Get product details from a Mega.pk URL
 */
export async function getProductDetails(url) {
  try {
    const response = await axios.get(url, {
      headers: getRequestHeaders(),
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    const title = sanitizeText($('h1').first().text() || $('title').text());
    const image = $('meta[property="og:image"]').attr('content') ||
                  $('.product-image img, .main-img img, #image').first().attr('src') || '';

    const fullText = $('body').text();
    const priceMatch = fullText.match(/Rs\.?\s*([\d,]+)/i);
    const price = priceMatch ? parsePrice(priceMatch[0]) : null;

    const description = sanitizeText($('meta[property="og:description"]').attr('content') || '');

    // Try JSON-LD
    const jsonLd = $('script[type="application/ld+json"]').toArray();
    for (const script of jsonLd) {
      try {
        const data = JSON.parse($(script).html());
        if (data['@type'] === 'Product') {
          return {
            title: sanitizeText(data.name) || title,
            price: parsePrice(data.offers?.price) || price,
            image: data.image || image,
            url,
            rating: parseFloat(data.aggregateRating?.ratingValue) || 0,
            reviewCount: parseInt(data.aggregateRating?.reviewCount) || 0,
            store: STORE_NAME,
            storeUrl: STORE_URL,
            storeColor: STORE_COLOR,
            description: truncate(sanitizeText(data.description), 300) || description,
            inStock: true,
          };
        }
      } catch (e) { /* continue */ }
    }

    if (title) {
      return {
        title, price, image,
        url, rating: 0, reviewCount: 0,
        store: STORE_NAME, storeUrl: STORE_URL, storeColor: STORE_COLOR,
        description, inStock: true,
      };
    }

    return null;
  } catch (error) {
    console.error(`[${STORE_NAME}] Product detail error:`, error.message);
    return null;
  }
}

export default { searchProducts, getProductDetails, storeName: STORE_NAME };
