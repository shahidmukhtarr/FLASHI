import fs from 'fs';
const html = fs.readFileSync('olx_test.html', 'utf8');
const stateMatch = html.match(/window\.state\s*=\s*(\{[\s\S]+?\});/);

if (stateMatch) {
  try {
    const state = JSON.parse(stateMatch[1]);
    console.log('Keys in state:', Object.keys(state));
    if (state.ads) {
        const adsKeys = Object.keys(state.ads);
        console.log('Keys in state.ads:', adsKeys);
        if (state.ads.hits) {
            console.log('Ads hits length:', state.ads.hits.length);
            console.log('First ad hit:', JSON.stringify(state.ads.hits[0], null, 2).substring(0, 1000));
        }
    }
    // Check for another common place for hits
    if (state.categories) {
        console.log('Found categories');
    }
    
    // Search for any key that contains 'hits' and its path
    const hitPaths = [];
    function findHits(obj, path = 'state') {
        if (!obj || typeof obj !== 'object') return;
        if (Array.isArray(obj)) {
            obj.forEach((item, i) => findHits(item, `${path}[${i}]`));
            return;
        }
        for (const key in obj) {
            if (key === 'hits' && Array.isArray(obj[key])) {
                hitPaths.push({ path: `${path}.${key}`, length: obj[key].length, first: obj[key][0] });
            }
            findHits(obj[key], `${path}.${key}`);
        }
    }
    findHits(state);
    
    hitPaths.forEach(hp => {
        console.log(`Path: ${hp.path}, Length: ${hp.length}`);
        if (hp.length > 0) {
            hp.hitsArr = hp.path.split('.').reduce((o, i) => o[i], {state});
            console.log('--- Full First Hit ---');
            console.log(JSON.stringify(hp.hitsArr[0], null, 2));
        }
    });

  } catch (err) {
    console.log('JSON Parse Error:', err.message);
    // Maybe it's not pure JSON but JS object?
  }
} else {
  console.log('Not found');
}
