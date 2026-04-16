import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, sanitizeText } from '../utils/helpers.js';

const STORE_NAME = 'OLX';
const STORE_URL = 'https://www.olx.com.pk';
const STORE_COLOR = '#002f34';
const OLX_IMAGE_BASE = 'https://images.olx.com.pk/thumbnails';

/**
 * Search for products on OLX.com.pk
 * Uses window.state JSON extraction for better reliability than HTML scraping.
 */
export async function searchProducts(query, limit = 20) {
  try {
    const slug = query.trim().replace(/\s+/g, '-');
    const searchUrl = `${STORE_URL}/items/q-${slug}`;

    const response = await axios.get(searchUrl, {
      headers: {
        ...getRequestHeaders(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    });

    const html = response.data;
    const products = [];

    // Extract window.state string
    const stateMatch = html.match(/window\.state\s*=\s*(\{[\s\S]+?\});/);
    if (!stateMatch) {
       console.log(`[${STORE_NAME}] Could not find window.state`);
       return [];
    }

    const stateJsonStr = stateMatch[1];
    let state;
    try {
      state = JSON.parse(stateJsonStr);
    } catch (e) {
      console.log(`[${STORE_NAME}] JSON parse error:`, e.message);
      return [];
    }

    const hits = state?.algolia?.content?.hits || [];
    
    for (const hit of hits) {
      if (products.length >= limit) break;
      
      const title = hit.title || hit.name || '';
      const slug = hit.slug || '';
      
      // Price can be in price.value.value or extraFields.price
      let price = hit.extraFields?.price;
      if (!price && hit.price) {
          price = hit.price.value?.value || hit.price.value;
      }
      
      if (!title || !price) continue;
      
      // Relevance check: check if it matches query words roughly
      const queryWords = query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 2);
      const titleLower = title.toLowerCase();
      const matchCount = queryWords.filter(w => titleLower.includes(w)).length;
      const threshold = Math.max(1, Math.ceil(queryWords.length / 2));
      
      if (queryWords.length > 0 && matchCount < threshold) continue;

      const coverPhotoId = hit.coverPhoto?.externalID || (hit.photos?.[0]?.externalID) || '';
      const image = coverPhotoId ? `${OLX_IMAGE_BASE}/${coverPhotoId}-400x300.webp` : '';

      products.push({
        title: sanitizeText(title),
        price: parseFloat(price),
        originalPrice: null,
        discount: null,
        image,
        url: `${STORE_URL}/item/${slug}`,
        rating: 0,
        reviewCount: 0,
        store: STORE_NAME,
        storeUrl: STORE_URL,
        storeColor: STORE_COLOR,
        inStock: true,
      });
    }

    console.log(`[${STORE_NAME}] Found ${products.length} products for "${query}"`);
    return products;
  } catch (error) {
    console.error(`[${STORE_NAME}] Search error:`, error.message);
    return [];
  }
}

/**
 * Get details for a specific OLX product URL
 */
export async function getProductDetails(url) {
  try {
    const response = await axios.get(url, {
      headers: getRequestHeaders(),
      timeout: 15000,
    });

    const html = response.data;

    // Use meta tags and regex for details
    const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/i);
    const descMatch = html.match(/property="og:description"\s+content="([^"]+)"/i);
    const imgMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
    
    const title = titleMatch ? titleMatch[1] : '';
    const description = descMatch ? sanitizeText(descMatch[1]) : '';
    let image = imgMatch ? imgMatch[1] : '';
    
    // Find price in JSON within script tags or regex
    const priceRegex = /"price":\{"value":\{"display":"[^"]+","value":([\d.]+)\}/;
    const priceMatch = html.match(priceRegex);
    const price = priceMatch ? parseFloat(priceMatch[1]) : null;

    if (title && price) {
      return {
        title: sanitizeText(title),
        price,
        originalPrice: null,
        image,
        url,
        rating: 0,
        reviewCount: 0,
        store: STORE_NAME,
        storeUrl: STORE_URL,
        storeColor: STORE_COLOR,
        description,
        inStock: true,
      };
    }
    return null;
  } catch (error) {
    console.error(`[${STORE_NAME}] Product details error:`, error.message);
    return null;
  }
}

export default { searchProducts, getProductDetails, storeName: STORE_NAME };
