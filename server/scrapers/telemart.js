import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, truncate } from '../utils/helpers.js';

const STORE_NAME = 'Telemart';
const STORE_URL = 'https://www.telemart.pk';
const STORE_COLOR = '#00b300';

// Telemart uses Algolia for search
const ALGOLIA_APP_ID = '7Z6UNQYQER';
const ALGOLIA_API_KEY = '9b4c33f99e845fe1363fd4c6ceb0f467';
const ALGOLIA_INDEX = 'products';

export async function searchProducts(query, limit = 10) {
  try {
    const response = await axios.post(
      `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`,
      { params: `query=${encodeURIComponent(query)}&hitsPerPage=${limit}` },
      {
        headers: {
          'X-Algolia-Application-Id': ALGOLIA_APP_ID,
          'X-Algolia-API-Key': ALGOLIA_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const hits = response.data?.hits || [];
    const products = hits.map(hit => ({
      title: sanitizeText(hit.title || ''),
      price: hit.sale_price || hit.discounted_price || hit.price || null,
      originalPrice: hit.sale_price && hit.price > hit.sale_price ? hit.price : null,
      discount: hit.discountPercent ? `${hit.discountPercent}%` : null,
      image: hit.mainImageLink || '',
      url: hit.slug ? `${STORE_URL}/${hit.slug}.html` : STORE_URL,
      rating: parseFloat(hit.rating) || 0,
      reviewCount: parseInt(hit.reviewsCount) || 0,
      store: STORE_NAME,
      storeUrl: STORE_URL,
      storeColor: STORE_COLOR,
      inStock: (hit.qty || 0) > 0,
    })).filter(p => p.title && p.price);

    console.log(`[${STORE_NAME}] Found ${products.length} products for "${query}"`);
    return products;
  } catch (error) {
    console.error(`[${STORE_NAME}] Search error:`, error.message);
    return [];
  }
}

/**
 * Get product details from a Telemart URL
 */
export async function getProductDetails(url) {
  try {
    const response = await axios.get(url, {
      headers: getRequestHeaders(),
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Try JSON-LD
    const jsonLd = $('script[type="application/ld+json"]').toArray();
    for (const script of jsonLd) {
      try {
        const data = JSON.parse($(script).html());
        if (data['@type'] === 'Product' && data.name) {
          return {
            title: sanitizeText(data.name),
            price: parsePrice(data.offers?.price),
            image: data.image || '',
            url,
            rating: parseFloat(data.aggregateRating?.ratingValue) || 0,
            reviewCount: parseInt(data.aggregateRating?.reviewCount) || 0,
            store: STORE_NAME,
            storeUrl: STORE_URL,
            storeColor: STORE_COLOR,
            description: truncate(sanitizeText(data.description), 300),
            inStock: true,
          };
        }
      } catch (e) { /* continue */ }
    }

    // Fallback: OG tags
    const title = $('meta[property="og:title"]').attr('content') || $('title').text();
    const image = $('meta[property="og:image"]').attr('content') || '';
    const fullText = $('body').text();
    const priceMatch = fullText.match(/Rs\.?\s*([\d,]+)/i);

    if (title) {
      return {
        title: sanitizeText(title),
        price: priceMatch ? parsePrice(priceMatch[0]) : null,
        image, url, rating: 0, reviewCount: 0,
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
