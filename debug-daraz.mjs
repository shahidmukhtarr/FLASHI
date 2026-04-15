import axios from 'axios';

// Test Daraz alternative approaches
const query = 'iphone 15';

const approaches = [
  // Attempt: Daraz JSON search API
  {
    name: 'Daraz Search API (JSON)',
    url: `https://www.daraz.pk/catalog/?ajax=true&isFirstRequest=true&q=${encodeURIComponent(query)}&page=1`,
    headers: {
      'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; SM-G998B Build/SP1A.210812.016)',
      'Accept': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
    }
  },
  // Attempt: Daraz graphql / search API
  {
    name: 'Daraz Search JSON (mobile UA)',
    url: `https://www.daraz.pk/catalog/?ajax=true&isFirstRequest=true&q=${encodeURIComponent(query)}`,
    headers: {
      'User-Agent': 'com.lazada.android/8.56.1',
      'Accept': 'application/json',
    }
  },
  // Attempt: Daraz product page (JSON-LD)
  {
    name: 'Daraz search HTML (mobile UA)',
    url: `https://www.daraz.pk/catalog/?q=${encodeURIComponent(query)}`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      'Accept': 'text/html,application/xhtml+xml,*/*;q=0.9',
    }
  },
  // Attempt: Daraz discover API 
  {
    name: 'Daraz discover API',
    url: `https://www.daraz.pk/catalog/?ajax=true&isFirstRequest=true&q=${encodeURIComponent(query)}&page=1&_keyori=ss&from=input&spm=a2a0e.home.search.go.4ab44b5b1234`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
      'Referer': 'https://www.daraz.pk/',
    }
  },
];

for (const ap of approaches) {
  try {
    const r = await axios.get(ap.url, { headers: ap.headers, timeout: 15000, maxRedirects: 3 });
    const isPunish = String(r.data).includes('_____tmd_____');
    const type = typeof r.data;
    console.log(`\n[${ap.name}]`);
    console.log(`  Status: ${r.status} | Type: ${type} | Punish: ${isPunish}`);
    if (!isPunish && type === 'object') {
      console.log(`  Keys: ${Object.keys(r.data).join(', ')}`);
      const items = r.data?.mods?.listItems || r.data?.mainInfo?.listItems || [];
      console.log(`  Items: ${items.length}`);
      if (items.length > 0) console.log(`  Sample: ${JSON.stringify(items[0]).substring(0, 200)}`);
    } else if (!isPunish) {
      console.log(`  Response: ${String(r.data).substring(0, 200)}`);
    }
  } catch(e) {
    console.log(`\n[${ap.name}] ERROR: ${e.message}`);
  }
}
