import fs from 'fs';

const html = fs.readFileSync('olx_debug.html', 'utf8');
const match = html.match(/window\.state\s*=\s*(\{[\s\S]+?\});/);
if (match) {
  const state = JSON.parse(match[1]);
  const hits = state.search?.content?.hits || [];
  console.log('Hits length:', hits.length);
  if (hits.length > 0) {
    const hit = hits[0];
    console.log('Hit keys:', Object.keys(hit));
    console.log('Hit title:', hit.title);
    console.log('Hit price:', hit.price);
    console.log('Hit extraFields.price:', hit.extraFields?.price);
    console.log('Hit slug:', hit.slug);
  }
}
