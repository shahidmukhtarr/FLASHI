import axios from 'axios';
import { getRequestHeaders, parsePrice, sanitizeText } from '../utils/helpers.js';

const STORE_NAME = 'OLX';
const STORE_URL = 'https://www.olx.com.pk';
const STORE_COLOR = '#002f34';
const OLX_IMAGE_BASE = 'https://images.olx.com.pk/thumbnails';

/**
 * Extract listing items from the window.state JSON embedded in OLX HTML.
 * Items have: title, price (number), slug, coverPhoto.id, location, etc.
 */
function extractItemsFromHtml(html) {
  const items = [];

  // OLX embeds all data in window.state = {...};
  // The items are nested deep, but we can extract them by regex-matching
  // individual item objects that contain "title", "slug", "coverPhoto"
  
  // Match item-like objects: they have "slug":"some-product-slug" and "title":"..."
  // We use a robust regex to extract each item block
  const itemRegex = /"coverPhoto":\{[^}]*"id":(\d+)[^}]*\}[^]*?"price":(\d+)[^]*?"slug":"([^"]+)"[^]*?"title":"([^"]+)"/g;
  
  let match;
  while ((match = itemRegex.exec(html)) !== null) {
    const [, photoId, price, slug, title] = match;
    const priceNum = parseInt(price);
    if (!title || priceNum <= 0) continue;

    // Extract location from nearby context
    const contextStart = Math.max(0, match.index - 50);
    const contextEnd = Math.min(html.length, match.index + match[0].length + 500);
    const context = html.substring(contextStart, contextEnd);
    const locMatch = context.match(/"location\.lvl\d+":\{[^}]*"name":"([^"]+)"/);

    items.push({
      title: title.replace(/\\u002F/g, '/').replace(/\\"/g, '"'),
      price: priceNum,
      slug,
      imageId: photoId,
      location: locMatch ? locMatch[1] : '',
    });
  }

  return items;
}

/**
 * Search for products on OLX.com.pk
 * OLX is a classifieds marketplace — products are user-listed, often second-hand.
 */
export async function searchProducts(query, limit = 10) {
  try {
    const slug = query.trim().replace(/\s+/g, '-');
    const searchUrl = `${STORE_URL}/items/q-${slug}`;

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
    const products = [];

    // Extract items from the embedded window.state JSON
    const items = extractItemsFromHtml(html);

    const seen = new Set();
    for (const item of items) {
      if (products.length >= limit) break;
      if (seen.has(item.slug)) continue;
      seen.add(item.slug);

      products.push({
        title: sanitizeText(item.title),
        price: item.price,
        originalPrice: null,
        discount: null,
        image: `${OLX_IMAGE_BASE}/${item.imageId}-400x300.webp`,
        url: `${STORE_URL}/item/${item.slug}`,
        rating: 0,
        reviewCount: 0,
        store: STORE_NAME,
        storeUrl: STORE_URL,
        storeColor: STORE_COLOR,
        inStock: true,
        location: item.location,
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
 * Get product details from an OLX URL
 */
export async function getProductDetails(url) {
  try {
    const response = await axios.get(url, {
      headers: getRequestHeaders(),
      timeout: 15000,
    });

    const html = response.data;

    // Extract from embedded state data
    const titleMatch = html.match(/"title":"([^"]+)"/);
    const priceMatch = html.match(/"price":(\d+)/);
    const coverMatch = html.match(/"coverPhoto":\{[^}]*"id":(\d+)/);
    const descMatch = html.match(/"description":"([^"]{0,500})"/);

    const title = titleMatch ? titleMatch[1].replace(/\\u002F/g, '/') : null;
    const price = priceMatch ? parseInt(priceMatch[1]) : null;

    if (title && price && price > 0) {
      return {
        title: sanitizeText(title),
        price,
        originalPrice: null,
        image: coverMatch ? `${OLX_IMAGE_BASE}/${coverMatch[1]}-400x300.webp` : '',
        url,
        rating: 0,
        reviewCount: 0,
        store: STORE_NAME,
        storeUrl: STORE_URL,
        storeColor: STORE_COLOR,
        description: descMatch ? sanitizeText(descMatch[1].replace(/\\u002F/g, '/')) : '',
        inStock: true,
      };
    }

    // Fallback: meta tags
    const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/)?.[1];
    const ogImage = html.match(/property="og:image"\s+content="([^"]+)"/)?.[1] || '';
    const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/)?.[1] || '';
    const bodyPrice = html.match(/Rs\.?\s*([\d,]+)/i);

    if (ogTitle && bodyPrice) {
      return {
        title: sanitizeText(ogTitle),
        price: parsePrice(bodyPrice[0]),
        originalPrice: null,
        image: ogImage,
        url,
        rating: 0,
        reviewCount: 0,
        store: STORE_NAME,
        storeUrl: STORE_URL,
        storeColor: STORE_COLOR,
        description: sanitizeText(ogDesc),
        inStock: true,
      };
    }

    return null;
  } catch (error) {
    console.error(`[${STORE_NAME}] Product details error:`, error.message);
    return null;
  }
}
