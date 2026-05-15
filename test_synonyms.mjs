const SYNONYMS = {
  'unstitched': ['fabric', 'unstitched suit', 'lawn fabric', 'suit', 'printed suit', '2 piece', '3 piece', 'pack suit'],
  'lawn': ['lawn suit', 'lawn shirt', 'lawn fabric', 'cotton lawn', 'suit', 'printed suit', '2 piece', '3 piece'],
  'shoes': ['footwear', 'sneakers', 'sandals', 'trainers', 'slippers', 'khussa', 'heels', 'pumps', 'wedges'],
  'sneakers': ['shoes', 'trainers', 'footwear', 'sneaker'],
  'heels': ['pumps', 'wedges', 'stiletto', 'court shoes', 'shoes'],
  'pret': ['ready to wear', 'stitched', 'pret wear', 'suit', 'kurti', 'kurta'],
  'suit': ['2 piece', '3 piece', 'two piece', 'three piece', 'set', 'shirt', 'kurta', 'pack suit', 'printed suit'],
};

const testCases = [
  { query: 'women unstitched',    title: '3 Piece - Digital Printed Suit - 42601485' },
  { query: 'nishat lawn',         title: '2 Piece - Printed Suit - 42601035' },
  { query: 'women shoes',         title: 'Maroon Sneaker For Ladies WN6205' },
  { query: 'ladies heels',        title: 'Block Heel Court Shoes WN5001' },
  { query: 'outfitters shirt',    title: 'Checkered Shirt' },
  { query: 'stylo shoes',         title: 'Olive Casual Sneaker WN6204' },
  { query: 'women pret',          title: '2 Piece - Printed Suit - 42601035' },
  { query: 'men kurta',           title: 'Relaxed Fit Trousers' },   // should fail - trousers not a kurta
];

const FILLER = new Set(['the','a','an','for','in','of','and','with','new','buy','online','price','best','top','pk','care','home']);

function getWordVariants(word) {
  return [word, ...(SYNONYMS[word] || [])];
}

function doesMatch(word, normTitle) {
  return getWordVariants(word).some(v => normTitle.includes(v));
}

testCases.forEach(tc => {
  const norm = tc.title.toLowerCase().replace(/[-_/,.()'']/g, ' ').replace(/\s+/g, ' ').trim();
  const qWords = tc.query.toLowerCase().replace(/[-_/,.()'']/g, ' ').split(' ').filter(w => w.length > 1);
  const significant = qWords.filter(w => !FILLER.has(w));
  const matched = significant.filter(w => doesMatch(w, norm));
  const pass = matched.length >= Math.max(1, Math.ceil(significant.length / 2));
  const icon = pass ? 'PASS' : 'FAIL';
  console.log(`[${icon}] "${tc.query}" -> "${tc.title}" | matched ${matched.length}/${significant.length} words`);
});
