import { NextResponse } from 'next/server';
import { searchAllStores, scrapeRelevantCategoryPages } from '../../../../server/services/scraperEngine.js';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const limit = Number(url.searchParams.get('limit') || 20);

    const trimmedQuery = q.trim();

    if (trimmedQuery.length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 });
    }

    // Run scraping in parallel
    const [searchResults] = await Promise.allSettled([
      searchAllStores(trimmedQuery, limit),
      scrapeRelevantCategoryPages(trimmedQuery, 10),
    ]);

    const products = searchResults.status === 'fulfilled' ? searchResults.value.products : [];

    return NextResponse.json({ success: true, newScrapedCount: products?.length || 0 });
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Failed to live scrape' }, { status: 500 });
  }
}
