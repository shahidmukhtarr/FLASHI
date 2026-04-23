import { NextResponse } from 'next/server';
import { queryStoredProducts } from '../../../server/services/db.js';
import { searchAllStores, scrapeRelevantCategoryPages } from '../../../server/services/scraperEngine.js';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const store = url.searchParams.get('store') || '';
    const sort = url.searchParams.get('sort') || 'created-desc';
    const limit = Number(url.searchParams.get('limit') || 100);
    const page = Number(url.searchParams.get('page') || 1);

    let trimmedQuery = q.trim();
    let targetStore = store;

    // Auto-detect store from query
    const storeKeywords = [
      { kw: 'daraz', name: 'Daraz' },
      { kw: 'priceoye', name: 'PriceOye' },
      { kw: 'mega.pk', name: 'Mega.pk' },
      { kw: 'mega', name: 'Mega.pk' },
      { kw: 'shophive', name: 'Shophive' },
      { kw: 'naheed', name: 'Naheed' },
      { kw: 'highfy', name: 'Highfy' },
      { kw: 'limelight', name: 'Limelight' },
      { kw: 'sapphire', name: 'Sapphire' },
      { kw: 'stationers', name: 'Stationers.pk' }
    ];

    const queryLower = trimmedQuery.toLowerCase();
    for (const item of storeKeywords) {
      if (queryLower.includes(item.kw)) {
        targetStore = item.name;
        // Remove the keyword from the query for better search
        const regex = new RegExp(`\\b${item.kw.replace('.', '\\.')}\\b`, 'gi');
        trimmedQuery = trimmedQuery.replace(regex, '').trim();
        break;
      }
    }

    if (!trimmedQuery) trimmedQuery = q.trim();

    // Step 1: Query what we already have in the DB
    const data = await queryStoredProducts({ q: trimmedQuery, store: targetStore, sort, limit: Math.min(limit, 200), page });

    // Step 2: If we have fewer than 30 results, tell the frontend to trigger a live background scrape
    const needsLiveScrape = trimmedQuery.length >= 2 && (data.products?.length ?? 0) < 30;
    data.needsLiveScrape = needsLiveScrape;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch products' }, { status: 500 });
  }
}
