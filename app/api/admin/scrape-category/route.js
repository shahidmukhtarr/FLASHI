import { NextResponse } from 'next/server';
import { scrapeCategoryUrl } from '../../../../server/services/scraperEngine.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const urls = Array.isArray(body?.urls)
      ? body.urls.map((url) => String(url || '').trim()).filter(Boolean)
      : [];
    const limitPerUrl = Math.max(1, Math.min(50, Number(body?.limitPerUrl) || 20));

    if (urls.length === 0) {
      return NextResponse.json({ error: 'Provide one or more category page URLs to scrape.' }, { status: 400 });
    }

    const results = [];
    let totalSaved = 0;
    let totalUpdated = 0;
    let totalValidProducts = 0;

    for (const url of urls) {
      try {
        const result = await scrapeCategoryUrl(url, limitPerUrl);
        totalSaved += result.savedCount;
        totalUpdated += result.updatedCount;
        totalValidProducts += result.validProducts;
        results.push({ url, status: 'success', ...result });
      } catch (error) {
        results.push({ url, status: 'failed', error: error?.message || 'Category scrape failed' });
      }
    }

    return NextResponse.json({
      success: true,
      totalUrls: urls.length,
      totalSaved,
      totalUpdated,
      totalValidProducts,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Category scraper failed' }, { status: 500 });
  }
}
