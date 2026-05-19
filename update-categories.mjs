import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const pages = [
  'app/smart-watches/page.js',
  'app/mobile-accessories/page.js',
  'app/gaming-accessories/page.js',
  'app/chargers-power-banks/page.js',
  'app/fashion-clothing/page.js'
];

for (const p of pages) {
  let content = fs.readFileSync(p, 'utf-8');
  
  if (content.includes('initialProducts')) continue;

  // No change
  content = content.replace(
    "import CategoryClient from '../components/CategoryClient';", 
    "import CategoryClient from '../components/CategoryClient';\nimport { fetchProductsForCategory } from '../../server/services/productFetcher';"
  );

  // Make async and fetch
  content = content.replace(
    /export default function (\w+)\(\) \{/,
    "export default async function $1() {\n  const initialProducts = await fetchProductsForCategory(searchQueries);"
  );

  // Add prop to CategoryClient
  content = content.replace(
    "seoContent={seoContent}",
    "seoContent={seoContent}\n      initialProducts={initialProducts}"
  );

  fs.writeFileSync(p, content);
  console.log('Updated', p);
}
