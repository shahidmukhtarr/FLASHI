import axios from 'axios';
import * as cheerio from 'cheerio';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Mega.pk deep dive - the correct URL found
async function testMega() {
  console.log('=== MEGA.PK DEEP DIVE ===');
  try {
    const r = await axios.get('https://mega.pk/index.php?route=product/search&search=iphone%2016', {
      headers: { 'User-Agent': UA },
      timeout: 15000
    });
    const bdy = r.data;
    const $ = cheerio.load(bdy);
    
    // Find all links with /product in href
    const links = [];
    $('a[href*="/product"]').each((i, el) => {
      if (i < 5) {
        const href = $(el).attr('href');
        const text = $(el).text().replace(/\s+/g, ' ').trim().substring(0, 100);
        if (text.length > 5) links.push({ href, text });
      }
    });
    console.log('Product links:', JSON.stringify(links, null, 2));
    
    // Try .item selector
    console.log('\n--- .item analysis ---');
    $('.item').each((i, el) => {
      if (i >= 3) return false;
      const $el = $(el);
      const html = $el.html()?.substring(0, 500);
      console.log(`\nItem ${i}:`, html);
    });
    
    // Look for Vue/React data
    const scripts = bdy.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
    for (const s of scripts) {
      if (s.includes('products') || s.includes('searchResult') || s.includes('app.__vue__') || s.includes('__NUXT__')) {
        console.log('\nFound data script:', s.substring(0, 500));
      }
    }
    
    // Check if Mega uses a JSON API
    console.log('\n--- Looking for Mega API ---');
    const apiMatch = bdy.match(/api[^"']*search/gi) || bdy.match(/\/api\/[^"'\s]*/gi) || [];
    console.log('API patterns:', apiMatch.slice(0, 10));
    
    // Print body HTML sample looking for product structure
    const bodyHtml = $('body').html() || '';
    // Find actual product data
    const priceIdx = bodyHtml.indexOf('Rs.');
    if (priceIdx > 0) {
      console.log('\n--- HTML around Rs. ---');
      console.log(bodyHtml.substring(Math.max(0, priceIdx - 500), priceIdx + 200));
    }
    
    // Check JSON-LD
    const jsonLd = $('script[type="application/ld+json"]').first().html();
    if (jsonLd) console.log('\nJSON-LD:', jsonLd.substring(0, 500));
    
  } catch(e) {
    console.log('Mega ERROR:', e.message);
  }
}

// Telemart deep dive
async function testTelemart() {
  console.log('\n\n=== TELEMART.PK DEEP DIVE ===');
  try {
    const r = await axios.get('https://www.telemart.pk/search?q=iphone+16', {
      headers: { 'User-Agent': UA },
      timeout: 15000
    });
    const bdy = r.data;
    const $ = cheerio.load(bdy);
    
    console.log('Title:', $('title').text());
    console.log('Body length:', bdy.length);
    
    // Look for Vue/Nuxt/Next data
    const scripts = bdy.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
    console.log('Scripts count:', scripts.length);
    for (const s of scripts) {
      if (s.includes('__NUXT__') || s.includes('__NEXT_DATA__') || s.includes('products') || s.includes('searchResult') || s.includes('window.__')) {
        console.log('\nData script found:', s.substring(0, 800));
      }
    }
    
    // Check for API endpoints in the source 
    const apiMatches = bdy.match(/["'](\/api\/[^"'\s]*|https?:\/\/[^"'\s]*api[^"'\s]*)/gi) || [];
    console.log('\nAPI endpoints found:', apiMatches.slice(0, 10));
    
    // Check for AJAX/fetch calls 
    const fetchMatches = bdy.match(/fetch\s*\(['"]([^'"]+)/gi) || [];
    console.log('Fetch calls:', fetchMatches.slice(0, 10));
    
    const axiosMatches = bdy.match(/axios\.[a-z]+\s*\(['"]([^'"]+)/gi) || [];
    console.log('Axios calls:', axiosMatches.slice(0, 10));
    
    // Print a chunk of the HTML 
    console.log('\nHTML sample (chars 20000-22000):', bdy.substring(20000, 22000));
    
  } catch(e) {
    console.log('Telemart ERROR:', e.message);
  }
}

// Check Daraz itemUrl field
async function testDarazUrl() {
  console.log('\n\n=== DARAZ ITEM URL CHECK ===');
  try {
    const r = await axios.get('https://www.daraz.pk/catalog/?ajax=true&q=iphone+16', {
      headers: { 'User-Agent': UA, 'Accept': 'application/json' },
      timeout: 15000
    });
    const items = r.data.mods?.listItems || [];
    if (items.length > 0) {
      const p = items[0];
      console.log('itemUrl:', p.itemUrl);
      console.log('productUrl:', p.productUrl);
      console.log('All URL-like keys:', Object.entries(p).filter(([k,v]) => typeof v === 'string' && (k.toLowerCase().includes('url') || (typeof v === 'string' && v.startsWith('/')))).map(([k,v]) => `${k}: ${v}`));
    }
  } catch(e) {
    console.log('Daraz URL ERROR:', e.message);
  }
}

async function main() {
  await testMega();
  await testTelemart();
  await testDarazUrl();
}
main();
