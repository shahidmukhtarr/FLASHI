import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, truncate } from '../utils/helpers.js';

const STORE_NAME = 'Mega.pk';
const STORE_URL = 'https://www.mega.pk';
const STORE_COLOR = '#0071dc';

/**
 * Search products on Mega.pk
 * Mega.pk uses OpenCart with route-based search: index.php?route=product/search&search=...
 * Product data is in the featured items and search results sections
 */
export async function searchProducts(query, limit = 10) {
  try {
    const searchUrl = `${STORE_URL}/index.php?route=product/search&search=${encodeURIComponent(query)}`;
    
    const response = await axios.get(searchUrl, {
      headers: getRequestHeaders(),
      timeout: 15000,
      maxRedirects: 5,
    });

    const $ = cheerio.load(response.data);
    const products = [];

    // Mega uses product links with pattern: /category_products/ID/Name.html
    // Each product appears in featured sections with channelBlurbs
    // Look for product links with images and prices
    
    // Try direct product listing approach
    $('a[href*="_products/"]').each((i, el) => {
      if (products.length >= limit) return false;

      const $el = $(el);
      const link = $el.attr('href') || '';
      const img = $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';
      const alt = $el.find('img').attr('alt') || '';
      
      // Only process if this has an image (product card) and alt text
      if (!alt || !img || alt.length < 3) return;
      
      // Check if product name matches query
      const queryWords = query.toLowerCase().split(/\s+/);
      const altLower = alt.toLowerCase();
      const matches = queryWords.some(w => altLower.includes(w));
      if (!matches) return;

      // Look for price near this element
      const parent = $el.parent().parent().parent();
      const parentText = parent.text().replace(/\s+/g, ' ');
      const priceMatch = parentText.match(/Rs\.?\s*([\d,]+)/i);
      const price = priceMatch ? parsePrice(priceMatch[0]) : null;

      // Avoid duplicates
      if (products.some(p => p.url === link)) return;

      products.push({
        title: sanitizeText(alt),
        price,
        originalPrice: null,
        discount: null,
        image: img.startsWith('http') ? img : `${STORE_URL}/${img}`,
        url: link.startsWith('http') ? link : `${STORE_URL}/${link}`,
        rating: 0,
        reviewCount: 0,
        store: STORE_NAME,
        storeUrl: STORE_URL,
        storeColor: STORE_COLOR,
        inStock: true,
      });
    });

    // Alternative: Also try scraping the category pages for better results
    if (products.length === 0) {
      // Try fetching a category page (e.g., mobiles)
      const categoryUrl = `${STORE_URL}/mobiles`;
      try {
        const catResponse = await axios.get(categoryUrl, {
          headers: getRequestHeaders(),
          timeout: 10000,
        });
        const $cat = cheerio.load(catResponse.data);
        
        $cat('a[href*="_products/"]').each((i, el) => {
          if (products.length >= limit) return false;
          const $catEl = $cat(el);
          const link = $catEl.attr('href') || '';
          const img = $catEl.find('img').attr('src') || '';
          const alt = $catEl.find('img').attr('alt') || '';
          
          if (!alt || alt.length < 3) return;
          
          const queryWords = query.toLowerCase().split(/\s+/);
          const altLower = alt.toLowerCase();
          if (!queryWords.some(w => altLower.includes(w))) return;
          if (products.some(p => p.url === link)) return;

          const parent = $catEl.closest('.row, div');
          const parentText = parent.text();
          const priceMatch = parentText.match(/Rs\.?\s*([\d,]+)/i);

          products.push({
            title: sanitizeText(alt),
            price: priceMatch ? parsePrice(priceMatch[0]) : null,
            originalPrice: null,
            discount: null,
            image: img.startsWith('http') ? img : `${STORE_URL}/${img}`,
            url: link.startsWith('http') ? link : `${STORE_URL}/${link}`,
            rating: 0,
            reviewCount: 0,
            store: STORE_NAME,
            storeUrl: STORE_URL,
            storeColor: STORE_COLOR,
            inStock: true,
          });
        });
      } catch (e) {
        // Category fallback failed, continue
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
