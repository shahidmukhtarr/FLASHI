import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRequestHeaders, parsePrice, sanitizeText, fetchWithRetry } from '../../../server/utils/helpers.js';

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchLimelightSale(url, limit = 500) {
  // Try Shopify JSON API first (much faster, no rate limit issues)
  try {
    const collectionHandle = url.split('/collections/')[1]?.split('?')[0] || 'sale';
    const apiUrl = `https://www.limelight.pk/collections/${collectionHandle}/products.json?limit=250`;
    const res = await fetchWithRetry(() => axios.get(apiUrl, {
      headers: { ...getRequestHeaders(), Accept: 'application/json' },
      timeout: 15000,
    }));
    const items = res.data?.products || [];
    return items.slice(0, limit).map(p => {
      const variant = p.variants?.[0] || {};
      const price = parseFloat(variant.price || '0');
      const comparePrice = parseFloat(variant.compare_at_price || '0');
      let image = p.images?.[0]?.src || '';
      if (image.startsWith('//')) image = 'https:' + image;
      return {
        title: sanitizeText(p.title),
        price,
        originalPrice: comparePrice > price ? comparePrice : null,
        image,
        url: `https://www.limelight.pk/products/${p.handle}`,
        store: 'Limelight', storeColor: '#c8a45a', inStock: variant.available !== false,
      };
    }).filter(p => p.title && p.price > 0);
  } catch (e) {
    // Fallback: HTML scraping with retry
    try {
      const response = await fetchWithRetry(() => axios.get(url, {
        headers: getRequestHeaders(), timeout: 15000,
      }), 3, 3000);
      const $ = cheerio.load(response.data);
      const products = [];
      $('.grid__item, .product-item, .card-wrapper').each((i, el) => {
        if (products.length >= limit) return false;
        const $el = $(el);
        const titleEl = $el.find('a.full-unstyled-link, .card__heading a, .product-item__title, h3 a, h2 a').first();
        const title = sanitizeText(titleEl.text());
        if (!title) return;
        let link = titleEl.attr('href') || $el.find('a').first().attr('href') || '';
        if (link && !link.startsWith('http')) link = `https://www.limelight.pk${link}`;
        let image = $el.find('img').first().attr('data-src') || $el.find('img').first().attr('src') || '';
        if (image && image.startsWith('//')) image = 'https:' + image;
        const priceText = $el.find('.price__sale .price-item, .price .price-item--sale, .price .price-item--regular, .product-price .money').first().text();
        const price = parsePrice(priceText);
        if (!price) return;
        const originalPrice = parsePrice($el.find('.price__regular .price-item--regular, s.money').first().text());
        products.push({ title, price, originalPrice: originalPrice || null, image, url: link, store: 'Limelight', storeColor: '#c8a45a', inStock: true });
      });
      return products;
    } catch {
      return [];
    }
  }
}

async function fetchSapphireSale(url, limit = 500) {
  try {
    const response = await fetchWithRetry(() => axios.get(url, {
      headers: getRequestHeaders(), timeout: 15000,
    }), 3, 3000);
    const $ = cheerio.load(response.data);
    const products = [];

    $('.product-tile').each((i, el) => {
      if (products.length >= limit) return false;
      const $el = $(el);

      const titleEl = $el.find('.pdp-link a, a.link, .link').filter((_, e) => {
        const t = $(e).text().trim();
        return t.length > 0 && !t.includes('%') && t.length < 120;
      }).first();

      const title = sanitizeText(titleEl.text());
      if (!title) return;

      let link = titleEl.attr('href') || '';
      if (link && !link.startsWith('http')) link = `https://pk.sapphireonline.pk${link}`;

      let image = $el.find('img.tile-image').attr('data-src') || $el.find('img.tile-image').attr('src') || $el.find('img').first().attr('src') || '';
      if (image && image.startsWith('//')) image = 'https:' + image;

      // Sapphire stores price in content attribute in actual PKR value (not cents)
      // Try the content attribute first, then fall back to text
      const salesPriceContent = $el.find('.price .sales .value').attr('content');
      const salesPriceText = $el.find('.price .sales, .price .value').first().text();
      let price = salesPriceContent ? parseFloat(salesPriceContent) : parsePrice(salesPriceText);
      
      // If price seems unreasonably large (>500000), it might be in cents - divide by 100
      if (price && price > 500000) price = Math.round(price / 100);
      if (!price || price <= 0) return;

      const oldPriceContent = $el.find('.price .strike-through .value').attr('content');
      const oldPriceText = $el.find('.price .strike-through').first().text();
      let originalPrice = oldPriceContent ? parseFloat(oldPriceContent) : parsePrice(oldPriceText);
      if (originalPrice && originalPrice > 500000) originalPrice = Math.round(originalPrice / 100);

      products.push({
        title, price, originalPrice: (originalPrice && originalPrice > price) ? originalPrice : null,
        image, url: link, store: 'Sapphire', storeColor: '#1a3a5c', inStock: true
      });
    });

    return products;
  } catch {
    return [];
  }
}

async function fetchNaheedSale(url, limit = 500) {
  try {
    const response = await fetchWithRetry(() => axios.get(url, {
      headers: getRequestHeaders(), timeout: 15000,
    }), 3, 3000);
    const $ = cheerio.load(response.data);
    const products = [];

    $('.product-item').each((i, el) => {
      if (products.length >= limit) return false;
      const $el = $(el);
      const titleEl = $el.find('.product-item-link');
      const title = sanitizeText(titleEl.text());
      if (!title) return;

      const link = titleEl.attr('href') || '';
      let image = $el.find('.product-image-photo').attr('data-src') || $el.find('.product-image-photo').attr('src') || '';

      const priceText = $el.find('.special-price .price, .price-wrapper .price').first().text();
      const price = parsePrice(priceText);
      if (!price) return;

      const originalPrice = parsePrice($el.find('.old-price .price').first().text());

      products.push({ title, price, originalPrice: originalPrice || null, image, url: link, store: 'Naheed', storeColor: '#e32525', inStock: true });
    });
    return products;
  } catch {
    return [];
  }
}

async function fetchHighfySale(url, limit = 500) {
  // Try Shopify JSON API first
  try {
    const collectionHandle = url.split('/collections/')[1]?.split('?')[0] || 'all';
    const apiUrl = `https://highfy.pk/collections/${collectionHandle}/products.json?limit=250`;
    const res = await fetchWithRetry(() => axios.get(apiUrl, {
      headers: { ...getRequestHeaders(), Accept: 'application/json' },
      timeout: 15000,
    }), 3, 3000);
    const items = res.data?.products || [];
    return items.slice(0, limit).map(p => {
      const variant = p.variants?.[0] || {};
      const price = parseFloat(variant.price || '0');
      const comparePrice = parseFloat(variant.compare_at_price || '0');
      let image = p.images?.[0]?.src || '';
      if (image.startsWith('//')) image = 'https:' + image;
      return {
        title: sanitizeText(p.title),
        price,
        originalPrice: comparePrice > price ? comparePrice : null,
        image,
        url: `https://highfy.pk/products/${p.handle}`,
        store: 'Highfy', storeColor: '#000000', inStock: variant.available !== false,
      };
    }).filter(p => p.title && p.price > 0);
  } catch (e) {
    // Fallback HTML
    try {
      const res = await fetchWithRetry(() => axios.get(url, {
        headers: getRequestHeaders(), timeout: 15000,
      }), 3, 3000);
      const $ = cheerio.load(res.data);
      const products = [];
      $('.product-item, .grid__item').each((i, el) => {
        if (products.length >= limit) return false;
        const $el = $(el);
        const titleEl = $el.find('.product-item__title, .card__heading a');
        const title = sanitizeText(titleEl.text());
        if (!title) return;
        let link = titleEl.attr('href') || '';
        if (link && !link.startsWith('http')) link = `https://highfy.pk${link}`;
        let image = $el.find('img').first().attr('data-src') || $el.find('img').first().attr('src') || '';
        if (image && image.startsWith('//')) image = 'https:' + image;
        const price = parsePrice($el.find('.price-item--sale, .price__sale').first().text());
        if (!price) return;
        const originalPrice = parsePrice($el.find('.price-item--regular').first().text());
        products.push({ title, price, originalPrice: originalPrice || null, image, url: link, store: 'Highfy', storeColor: '#000000', inStock: true });
      });
      return products;
    } catch {
      return [];
    }
  }
}

async function fetchDarazSale(url, limit = 500) {
  try {
    // Daraz flash sale pages are JS-rendered and can't be scraped via HTML.
    // Use the Daraz search adapter to search for deals/sale items instead.
    const { default: daraz } = await import('../../../server/scrapers/daraz.js');
    
    const saleQueries = ['flash sale', 'sale deals', 'discount offer', 'clearance sale'];
    const allProducts = [];
    const seen = new Set();
    
    for (const q of saleQueries) {
      if (allProducts.length >= limit) break;
      try {
        const products = await daraz.searchProducts(q, Math.min(50, limit - allProducts.length));
        for (const p of products) {
          const key = p.url || p.title;
          if (!seen.has(key)) {
            seen.add(key);
            allProducts.push(p);
          }
        }
      } catch { /* continue to next query */ }
      await delay(500);
    }
    
    return allProducts.slice(0, limit);
  } catch {
    return [];
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    const limit = 500;
    let products = [];

    if (targetUrl.includes('limelight.pk')) {
      products = await fetchLimelightSale(targetUrl, limit);
    } else if (targetUrl.includes('sapphireonline.pk')) {
      products = await fetchSapphireSale(targetUrl, limit);
    } else if (targetUrl.includes('naheed.pk')) {
      products = await fetchNaheedSale(targetUrl, limit);
    } else if (targetUrl.includes('highfy.pk')) {
      products = await fetchHighfySale(targetUrl, limit);
    } else if (targetUrl.includes('daraz.pk')) {
      products = await fetchDarazSale(targetUrl, limit);
    } else {
      const { scrapeCategoryUrl } = await import('../../../server/services/scraperEngine.js');
      const res = await scrapeCategoryUrl(targetUrl, limit);
      products = res.products || [];
    }

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('[Sales API] Error scraping category:', error.message);
    return NextResponse.json({ success: false, error: error.message, products: [] }, { status: 500 });
  }
}
