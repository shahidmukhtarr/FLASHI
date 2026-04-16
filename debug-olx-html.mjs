import axios from 'axios';
import fs from 'fs';

async function debugOLX() {
  const query = 'iphone-15';
  const url = `https://www.olx.com.pk/items/q-${query}`;
  console.log(`Fetching ${url}...`);
  try {
    const r = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000
    });
    fs.writeFileSync('olx_debug.html', r.data);
    console.log('Saved olx_debug.html, size:', r.data.length);
    
    const nextMatch = r.data.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/);
    console.log('__NEXT_DATA__ found:', !!nextMatch);
    if (nextMatch) console.log('Data sample:', nextMatch[1].substring(0, 500));
    
  } catch (e) {
    console.error('OLX Error:', e.message);
  }
}

debugOLX();
