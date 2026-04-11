import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, truncate } from '../utils/helpers.js';

const STORE_NAME = 'Telemart';
const STORE_URL = 'https://www.telemart.pk';
const STORE_COLOR = '#00b300';

/**
 * Search products on Telemart.pk
 * Telemart uses Cloudflare protection and Vue.js SPA rendering.
 * We try to extract embedded data from the server-side rendered shell.
 * The window.Telemart object contains some pre-rendered data.
 */
export async function searchProducts(query, limit = 10) {
  try {
    const searchUrl = `${STORE_URL}/search?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        ...getRequestHeaders(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': STORE_URL,
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const products = [];

    // Telemart embeds product data in a window.Telemart JS object
    // Try to extract product data from script tags
    const scripts = $('script').toArray();
    for (const script of scripts) {
      const content = $(script).html() || '';
      
      // Look for search results or product data in JS
      if (content.includes('window.Telemart') || content.includes('products')) {
        // Try to find product arrays in the embedded data
        const productMatches = content.match(/"name"\s*:\s*"([^"]+)"/gi);
        const priceMatches = content.match(/"price"\s*:\s*"?(\d+)"?/gi);
        const imageMatches = content.match(/"image"\s*:\s*"([^"]+)"/gi);
        const urlMatches = content.match(/"url"\s*:\s*"([^"]+)"/gi) || 
                           content.match(/"slug"\s*:\s*"([^"]+)"/gi);
        
        if (productMatches && priceMatches) {
          for (let i = 0; i < Math.min(productMatches.length, limit); i++) {
            const nameMatch = productMatches[i].match(/"name"\s*:\s*"([^"]+)"/i);
            const priceMatch = priceMatches[i]?.match(/"price"\s*:\s*"?(\d+)"?/i);
            const imageMatch = imageMatches?.[i]?.match(/"image"\s*:\s*"([^"]+)"/i);
            const urlMatch = urlMatches?.[i]?.match(/"(?:url|slug)"\s*:\s*"([^"]+)"/i);
            
            if (nameMatch && priceMatch) {
              const name = nameMatch[1];
              const queryWords = query.toLowerCase().split(/\s+/);
              const nameMatches = queryWords.some(w => name.toLowerCase().includes(w));
              
              if (nameMatches) {
                products.push({
                  title: sanitizeText(name),
                  price: parseInt(priceMatch[1]),
                  originalPrice: null,
                  discount: null,
                  image: imageMatch ? imageMatch[1].replace(/\\\//g, '/') : '',
                  url: urlMatch ? `${STORE_URL}/${urlMatch[1].replace(/\\\//g, '/')}` : searchUrl,
                  rating: 0,
                  reviewCount: 0,
                  store: STORE_NAME,
                  storeUrl: STORE_URL,
                  storeColor: STORE_COLOR,
                  inStock: true,
                });
              }
            }
          }
        }
      }
    }

    // Fallback: Try to find product data in meta tags or structured data
    if (products.length === 0) {
      const jsonLd = $('script[type="application/ld+json"]').toArray();
      for (const script of jsonLd) {
        try {
          const data = JSON.parse($(script).html());
          if (data['@type'] === 'ItemList' && data.itemListElement) {
            for (const item of data.itemListElement.slice(0, limit)) {
              const product = item.item || item;
              if (product.name) {
                products.push({
                  title: sanitizeText(product.name),
                  price: parsePrice(product.offers?.price),
                  originalPrice: null,
                  discount: null,
                  image: product.image || '',
                  url: product.url || searchUrl,
                  rating: parseFloat(product.aggregateRating?.ratingValue) || 0,
                  reviewCount: parseInt(product.aggregateRating?.reviewCount) || 0,
                  store: STORE_NAME,
                  storeUrl: STORE_URL,
                  storeColor: STORE_COLOR,
                  inStock: true,
                });
              }
            }
          }
        } catch (e) { /* continue */ }
      }
    }

    // Fallback: Try API endpoint (Telemart may have internal API)
    if (products.length === 0) {
      try {
        const apiResponse = await axios.get(`${STORE_URL}/api/search?q=${encodeURIComponent(query)}`, {
          headers: { ...getRequestHeaders(), 'Accept': 'application/json' },
          timeout: 10000,
        });
        const apiData = apiResponse.data;
        if (apiData?.data?.products || apiData?.products) {
          const apiProducts = apiData.data?.products || apiData.products || [];
          for (const p of apiProducts.slice(0, limit)) {
            products.push({
              title: sanitizeText(p.name || p.title || ''),
              price: parsePrice(p.price) || parseInt(p.price) || null,
              originalPrice: parsePrice(p.original_price || p.old_price) || null,
              discount: p.discount || null,
              image: p.image || p.thumbnail || '',
              url: p.url || p.slug ? `${STORE_URL}/${p.slug}` : searchUrl,
              rating: parseFloat(p.rating) || 0,
              reviewCount: parseInt(p.reviews_count || p.review_count) || 0,
              store: STORE_NAME,
              storeUrl: STORE_URL,
              storeColor: STORE_COLOR,
              inStock: p.in_stock !== false,
            });
          }
        }
      } catch (e) {
        // API not available
      }
    }

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
