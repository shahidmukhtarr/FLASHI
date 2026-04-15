import { NextResponse } from 'next/server';
import { scrapeAllCategoryLinks } from '../../../../server/services/scraperEngine.js';
import { CATEGORY_PAGE_CONFIG } from '../../../../server/services/categoryLinks.js';

// Track in-memory state for the running job
let seedRunning = false;
let lastSeedResult = null;

export async function GET() {
  return NextResponse.json({
    status: seedRunning ? 'running' : 'idle',
    totalCategories: CATEGORY_PAGE_CONFIG.length,
    lastResult: lastSeedResult,
  });
}

export async function POST(request) {
  if (seedRunning) {
    return NextResponse.json(
      { error: 'Category seed is already running. Check GET /api/admin/seed-categories for status.' },
      { status: 409 }
    );
  }

  let limitPerCategory = 30;
  try {
    const body = await request.json();
    if (body?.limitPerCategory) {
      limitPerCategory = Math.max(1, Math.min(50, Number(body.limitPerCategory) || 30));
    }
  } catch {}

  // Run in background — don't await so the HTTP response returns immediately
  seedRunning = true;
  scrapeAllCategoryLinks({ limitPerCategory })
    .then((result) => {
      lastSeedResult = result;
      seedRunning = false;
      console.log(`[SeedCategories] Completed: ${result.totalProducts} products from ${result.successCount}/${result.total} categories`);
    })
    .catch((err) => {
      seedRunning = false;
      lastSeedResult = { error: err?.message, timestamp: new Date().toISOString() };
      console.error('[SeedCategories] Failed:', err?.message);
    });

  return NextResponse.json({
    status: 'started',
    message: `Seeding ${CATEGORY_PAGE_CONFIG.length} category URLs in the background. Each will scrape up to ${limitPerCategory} products.`,
    totalCategories: CATEGORY_PAGE_CONFIG.length,
    timestamp: new Date().toISOString(),
  });
}
