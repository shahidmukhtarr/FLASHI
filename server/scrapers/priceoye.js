import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, truncate } from '../utils/helpers.js';

const STORE_NAME = 'PriceOye';
const STORE_URL = 'https://priceoye.pk';
const STORE_COLOR = '#e21b70';

/**
 * Search products on PriceOye.pk using HTML scraping
 * PriceOye uses server-side rendered HTML with .productBox containers
 */
export async function searchProducts(query, limit = 10) {
  try {
    const searchUrl = `${STORE_URL}/search?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(searchUrl, {
      headers: getRequestHeaders(),
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const products = [];

    // PriceOye uses .productBox with nested .product-card <a> tags
    $('.productBox').each((i, el) => {
      if (i >= limit) return false;

      const $el = $(el);
      const card = $el.find('a.product-card');
      
      // Product name from data attribute
      const name = card.attr('data-product-name') || '';
      const productId = card.attr('data-product-id') || '';
      const link = card.attr('href') || '';
      
      // Image from amp-img element
      const image = $el.find('amp-img.product-thumbnail').attr('src') || 
                     $el.find('img.product-thumbnail').attr('src') || 
                     $el.find('amp-img').attr('src') || 
                     $el.find('img').attr('data-src') ||
                     $el.find('img').attr('src') || '';
      
      // Extract prices from full text
      const fullText = $el.text().replace(/\s+/g, ' ').trim();
      const priceMatches = fullText.match(/Rs\s*([\d,]+)/g) || [];
      
      let price = null;
      let originalPrice = null;
      
      if (priceMatches.length >= 1) {
        price = parsePrice(priceMatches[0]);
      }
      if (priceMatches.length >= 2) {
        originalPrice = parsePrice(priceMatches[1]);
        // If second price is higher, it's original; if lower, swap
        if (originalPrice && price && originalPrice < price) {
          [price, originalPrice] = [originalPrice, price];
        }
      }

      // Extract rating from text (e.g. "4.9")
      const ratingMatch = fullText.match(/(\d+\.?\d*)\s*\d+\s*Reviews?/i);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
      
      // Extract review count
      const reviewMatch = fullText.match(/(\d+)\s*Reviews?/i);
      const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : 0;

      // Discount
      const discountMatch = fullText.match(/(\d+)%\s*OFF/i);
      const discount = discountMatch ? `-${discountMatch[1]}%` : null;

      if (name && price) {
        products.push({
          title: sanitizeText(name),
          price,
          originalPrice,
          discount,
          image: image.startsWith('http') ? image : `${STORE_URL}${image}`,
          url: link.startsWith('http') ? link : `${STORE_URL}${link}`,
          rating,
          reviewCount,
          store: STORE_NAME,
          storeUrl: STORE_URL,
          storeColor: STORE_COLOR,
          inStock: !$el.find('.out-of-stock, .outOfStock').length,
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

    // 2. Fallback to Meta Tags & Selectors
    const title = sanitizeText($('meta[property="og:title"]').attr('content') || $('h1').first().text() || $('title').text());
    const image = $('meta[property="og:image"]').attr('content') || 
                  $('amp-img.product-thumbnail').first().attr('src') ||
                  $('img.product-thumbnail').first().attr('src') || '';
    
    const fullText = $('body').text();
    // Try to find price in meta or body
    const metaPrice = $('meta[property="product:price:amount"]').attr('content');
    const priceText = metaPrice || fullText.match(/Rs\s*([\d,]+)/)?.[0] || fullText.match(/PKR\s*([\d,]+)/)?.[0];
    const price = parsePrice(priceText);
    
    const ratingAttr = $('[itemprop="ratingValue"]').attr('content') || '0';
    const reviewCountAttr = $('[itemprop="reviewCount"]').attr('content') || '0';
    const description = sanitizeText($('meta[name="description"]').attr('content') || $('[itemprop="description"], .product-description').first().text());

    if (title && price) {
      return {
        title,
        price,
        image: image.startsWith('http') ? image : (image ? `${STORE_URL}${image}` : ''),
        url,
        rating: parseFloat(ratingAttr) || 0,
        reviewCount: parseInt(reviewCountAttr) || 0,
        store: STORE_NAME,
        storeUrl: STORE_URL,
        storeColor: STORE_COLOR,
        description: truncate(description, 300),
        inStock: !$('body').text().toLowerCase().includes('out of stock'),
      };
    }

    return null;
  } catch (error) {
    console.error(`[${STORE_NAME}] Product detail error:`, error.message);
    return null;
  }
}

export default { searchProducts, getProductDetails, storeName: STORE_NAME };
