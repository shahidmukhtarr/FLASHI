import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  const pUrl = 'https://pk.sapphireonline.pk/clothing/ready-to-wear/rtw-3-pc-suit-3sfs26hmv311'; // Assuming a typical URL
  // wait, from the scraperEngine, `getProductDetails(url)` is called with whatever `isLikelyProductLink` accepted.
  // Sapphire URLs are like `https://pk.sapphireonline.pk/clothing/ready-to-wear/rtw-3-pc-suit-3sfs26hmv311.html`
  const links = ['https://pk.sapphireonline.pk/clothing/ready-to-wear/rtw-3-pc-suit-3sfs26hmv311.html'];
  const pRes = await axios.get(links[0], { headers: { 'User-Agent': 'Mozilla/5.0' }});
  const _$ = cheerio.load(pRes.data);
  
  const imgs = [];
  _$('img').each((i, el) => {
     imgs.push(_$(el).attr('src'));
  });
  console.log('All image srcs:', imgs.filter(i => i && i.includes('JPG')));
}
test().catch(console.error);
