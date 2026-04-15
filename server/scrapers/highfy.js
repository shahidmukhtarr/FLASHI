import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, truncate } from '../utils/helpers.js';

const STORE_NAME = 'Highfy';
const STORE_URL = 'https://highfy.pk';
const STORE_COLOR = '#000000';

export async function searchProducts(query, limit = 20) {
  try {
    const searchUrl = `${STORE_URL}/search?q=${encodeURIComponent(query)}&options[prefix]=last`;
    const response = await axios.get(searchUrl, {
      headers: getRequestHeaders(),
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const products = [];

    $('.grid__item').each((i, el) => {
      if (products.length >= limit) return false;

      const $el = $(el);

      // Title: h3.card__heading or .card__heading a — grab only the link text to avoid duplication
      const titleEl = $el.find('h3.card__heading a, .card__heading a').first();
      const title = sanitizeText(titleEl.text() || $el.find('h3.card__heading').first().clone().children().remove().end().text());
      if (!title) return;

      const priceEl = $el.find('.price-item--sale, .price-item--regular').first();
      const price = parsePrice(priceEl.text());

      const linkEl = $el.find('a[href*="/products/"], a.full-unstyled-link, a.card__heading').first().attr('href');
      const url = linkEl ? (linkEl.startsWith('http') ? linkEl : `${STORE_URL}${linkEl}`) : STORE_URL;

      // Image: srcset contains multiple sizes; grab first URL from src or srcset
      const imgEl = $el.find('.card__media img, img').first();
      const imgSrc = imgEl.attr('src') || imgEl.attr('data-src') || '';
      // Shopify images may start with // — add https:
      let image = imgSrc.startsWith('//') ? `https:${imgSrc}` : imgSrc;
      // Trim Shopify resize params (keep clean URL)
      if (image.includes('?')) image = image.split('?')[0];

      // Strict relevance: all significant query words must appear in title
      const queryWords = query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 1);
      const titleLower = title.toLowerCase();
      const allMatch = queryWords.every(w => titleLower.includes(w));
      if (!allMatch) return;

      if (title && price) {
        products.push({
          title,
          price,
          image,
          url,
          store: STORE_NAME,
          storeUrl: STORE_URL,
          storeColor: STORE_COLOR,
          inStock: !$el.find('.badge--bottom-left').text().toLowerCase().includes('sold out'),
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

export async function getProductDetails(url) {
  try {
    const response = await axios.get(url, {
      headers: getRequestHeaders(),
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    const title = sanitizeText(
      $('meta[property="og:title"]').attr('content') ||
      $('h1.product__title, h1').first().text()
    );
    const image = $('meta[property="og:image"]').attr('content') || '';
    const priceText = $('meta[property="og:price:amount"]').attr('content') ||
                      $('.price-item--sale, .price-item--regular').first().text();
    const price = parsePrice(priceText);

    if (title) {
      return {
        title,
        price,
        image,
        url,
        store: STORE_NAME,
        storeUrl: STORE_URL,
        storeColor: STORE_COLOR,
        description: truncate(sanitizeText($('meta[property="og:description"]').attr('content') || ''), 300),
        inStock: !$('.product-form__buttons [disabled]').length,
      };
    }

    return null;
  } catch (error) {
    console.error(`[${STORE_NAME}] Product detail error:`, error.message);
    return null;
  }
}

export default { searchProducts, getProductDetails, storeName: STORE_NAME };
