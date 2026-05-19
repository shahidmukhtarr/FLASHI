#!/usr/bin/env node
import 'dotenv/config';
import { scrapeAllCategoryLinks } from '../server/services/scraperEngine.js';
import { initDb } from '../server/services/db.js';

async function main() {
  console.log('🚀 Starting full category seeding...');
  try {
    await initDb(); // Ensures DB is ready and credentials are valid
    const result = await scrapeAllCategoryLinks({ limitPerCategory: 30 });
    console.log('\n✅ Seeding finished');
    console.table({
      totalCategories: result.total,
      succeeded:      result.successCount,
      failed:         result.failCount,
      productsSaved:  result.totalSaved,
    });
  } catch (e) {
    console.error('❌ Seeding crashed:', e);
    process.exit(1);
  }
}

main();
