import axios from 'axios';
import * as cheerio from 'cheerio';

async function testDarazAxios() {
  try {
    const url = 'https://www.daraz.pk/products/apple-iphone-15-pro-max-i434254248-s2082218084.html';
    const r = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000,
    });
    
    const $ = cheerio.load(r.data);
    const title = $('title').text();
    console.log(`Response length: ${r.data.length}`);
    console.log(`Title: ${title}`);
    
    let jsonLdFound = false;
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const data = JSON.parse($(el).html());
        if (data['@type'] === 'Product') {
          console.log(`Found Product JSON-LD!`);
          console.log(`  Name: ${data.name}`);
          console.log(`  Price: ${data.offers?.price} ${data.offers?.priceCurrency}`);
          jsonLdFound = true;
        }
      } catch (e) {}
    });
    
    if (!jsonLdFound) {
      console.log('No valid Product JSON-LD found.');
    }
    
    // Also look for appData in the page which contains the state
    const appDataMatch = r.data.match(/app\.run\((.*?)\);/);
    if (appDataMatch) {
       console.log('Found app.run(...) state data!');
    } else {
       console.log('No app.run data found');
    }

  } catch (e) {
    if (e.response) {
      console.log(`Daraz Error: ${e.response.status} - ${e.response.statusText}`);
      if (e.response.data.includes('x5sec')) {
         console.log('Blocked by x5sec');
      }
    } else {
      console.log(`Daraz Error: ${e.message}`);
    }
  }
}

testDarazAxios();
