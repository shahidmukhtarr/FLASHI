import { searchAllStores, scrapeAllCategoryLinks } from './scraperEngine.js';
import { delay } from '../utils/helpers.js';

const defaultQueries = [
  // Smartphones
  'iPhone 15',
  'iPhone 16',
  'Samsung Galaxy S24',
  'Infinix Note',
  'Redmi Note',
  // Mobile Accessories
  'Power bank',
  'Fast charger',
  'Air case cover',
  // Smartwatches
  'Apple Watch',
  'Samsung Galaxy Watch',
  'Zero Lifestyle smartwatch',
  'itel Smartwatch',
  // Audio
  'AirPods',
  'Audionic Airbud',
  'Sony WH-1000XM5',
  'Mi True Wireless',
  // TVs
  'TCL 4K LED TV',
  'Haier Smart TV',
  'Samsung Crystal UHD',
  'Sony Bravia',
  // Gaming
  'PlayStation 5',
  'Xbox Series X',
  'Nintendo Switch',
  // Laptops
  'HP Pavilion',
  'HP Victus',
  'Dell Latitude',
  'MacBook Air M3',
  // PC Peripherals
  'Mechanical keyboard',
  'Gaming mouse Logitech',
  'Gaming monitor',
  // Legacy
  'Wireless headphones',
  'Canon DSLR',
];

const QUERY_CSV = process.env.SCRAPER_QUERIES || defaultQueries.join(',');
const JOB_QUERIES = QUERY_CSV.split(',').map(q => q.trim()).filter(Boolean);
const INTERVAL_MINUTES = parseInt(process.env.SCRAPER_INTERVAL_MINUTES, 10) || 180;
const INTERVAL_MS = Math.max(INTERVAL_MINUTES, 30) * 60 * 1000; // Minimum 30 minutes enforced

// How many queries to run before pausing for a cooldown
const BATCH_SIZE = parseInt(process.env.SCRAPER_BATCH_SIZE, 10) || 5;
// Cooldown between batches (ms) — lets the event loop breathe and GC run
const BATCH_COOLDOWN_MS = parseInt(process.env.SCRAPER_BATCH_COOLDOWN_MS, 10) || 10000;
// Delay between individual queries within a batch (ms)
const QUERY_DELAY_MS = parseInt(process.env.SCRAPER_QUERY_DELAY_MS, 10) || 5000;
// Max memory usage percentage before aborting (0-1)
const MAX_MEMORY_PERCENT = 0.80;

let lastRun = null;
let nextRun = null;
let isRunning = false;
let intervalId = null;
let lastRunResult = null;

export function getSchedulerStatus() {
  return {
    isRunning,
    lastRun: lastRun ? lastRun.toISOString() : null,
    nextRun: nextRun ? nextRun.toISOString() : null,
    intervalMinutes: INTERVAL_MINUTES,
    queries: JOB_QUERIES,
    lastRunResult,
  };
}

/**
 * Check if memory usage is dangerously high.
 * Returns true if it's safe to continue, false if we should abort.
 */
function isMemorySafe() {
  try {
    const mem = process.memoryUsage();
    const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
    const rssMB = Math.round(mem.rss / 1024 / 1024);

    // Abort if RSS exceeds 512 MB (safe limit for most hosting)
    const RSS_LIMIT_MB = parseInt(process.env.SCRAPER_MAX_RSS_MB, 10) || 512;
    if (rssMB > RSS_LIMIT_MB) {
      console.warn(`[Scheduler] ⚠️ Memory WARNING: RSS=${rssMB}MB exceeds limit of ${RSS_LIMIT_MB}MB. Aborting to prevent crash.`);
      return false;
    }

    // Also check heap usage ratio
    if (heapTotalMB > 0 && (mem.heapUsed / mem.heapTotal) > MAX_MEMORY_PERCENT) {
      console.warn(`[Scheduler] ⚠️ Memory WARNING: Heap ${heapUsedMB}/${heapTotalMB}MB (${Math.round((mem.heapUsed / mem.heapTotal) * 100)}%). Aborting to prevent OOM.`);
      return false;
    }

    return true;
  } catch {
    // If we can't check memory, assume safe (don't block scraping)
    return true;
  }
}

/**
 * Force garbage collection if available (Node --expose-gc flag).
 * Otherwise just wait a bit to let the event loop process pending work.
 */
async function tryGarbageCollect() {
  if (global.gc) {
    try {
      global.gc();
    } catch { /* ignore */ }
  }
  // Always yield the event loop for a moment
  await delay(100);
}

let runCount = 0;

async function runQueryList() {
  const results = [];
  runCount++;
  let aborted = false;

  console.log(`[Scheduler] Run #${runCount}: Processing ${JOB_QUERIES.length} queries in batches of ${BATCH_SIZE}`);

  for (let i = 0; i < JOB_QUERIES.length; i++) {
    const query = JOB_QUERIES[i];

    // Memory safety check before each query
    if (!isMemorySafe()) {
      console.warn(`[Scheduler] ⛔ Aborting remaining queries at #${i + 1}/${JOB_QUERIES.length} due to high memory.`);
      aborted = true;
      break;
    }

    try {
      const result = await searchAllStores(query, 10);
      const scrapedCount = result.products?.length ?? 0;
      const savedCount = result.savedCount ?? 0;
      const updatedCount = result.updatedCount ?? 0;

      console.log(`[Scheduler] [${i + 1}/${JOB_QUERIES.length}] Query "${query}": scraped=${scrapedCount}, saved=${savedCount}, updated=${updatedCount}`);

      results.push({
        query,
        scraped: scrapedCount,
        saved: savedCount,
        updated: updatedCount,
        stores: result.storesSearched,
        errors: result.storeErrors,
      });
    } catch (err) {
      // Isolate per-query errors — never let one bad query kill the whole run
      console.error(`[Scheduler] [${i + 1}/${JOB_QUERIES.length}] Query "${query}" FAILED: ${err.message}`);
      results.push({ query, error: err.message });
    }

    // Delay between queries
    await delay(QUERY_DELAY_MS);

    // Batch cooldown: after every BATCH_SIZE queries, pause longer + try GC
    if ((i + 1) % BATCH_SIZE === 0 && i + 1 < JOB_QUERIES.length) {
      console.log(`[Scheduler] Batch cooldown after ${i + 1} queries (${BATCH_COOLDOWN_MS}ms)...`);
      await tryGarbageCollect();
      await delay(BATCH_COOLDOWN_MS);
    }
  }

  // Category seed: every N runs (default 8), also do a full category refresh
  // Skip if memory is already high
  const seedEvery = parseInt(process.env.SCRAPER_SEED_CATEGORIES_EVERY, 10) || 8;
  if (!aborted && (runCount % seedEvery === 0) && isMemorySafe()) {
    console.log(`[Scheduler] Run #${runCount}: Triggering category seed (every ${seedEvery} runs)`);
    try {
      const seedResult = await scrapeAllCategoryLinks({ limitPerCategory: 15 });
      console.log(`[Scheduler] Category seed done: ${seedResult.successCount}/${seedResult.total} categories, ${seedResult.totalSaved} new products`);
      results.push({ type: 'category_seed', successCount: seedResult.successCount, totalSaved: seedResult.totalSaved });
    } catch (err) {
      console.error(`[Scheduler] Category seed failed: ${err.message}`);
    }
  } else if (aborted) {
    console.log(`[Scheduler] Skipping category seed — run was aborted due to memory pressure.`);
  }

  return { results, aborted };
}

export async function runBackgroundScrape() {
  if (isRunning) {
    return { status: 'already_running', message: 'Background scrape already in progress' };
  }

  console.log('[Scheduler] ▶ Background scrape started');

  isRunning = true;
  lastRun = new Date();
  nextRun = new Date(lastRun.getTime() + INTERVAL_MS);

  try {
    const { results, aborted } = await runQueryList();
    const totalScraped = results.reduce((sum, item) => sum + (item.scraped || 0), 0);
    const totalSaved = results.reduce((sum, item) => sum + (item.saved || 0), 0);
    const totalUpdated = results.reduce((sum, item) => sum + (item.updated || 0), 0);

    const runResult = {
      status: aborted ? 'partial' : 'completed',
      results,
      totalScraped,
      totalSaved,
      totalUpdated,
      aborted,
      timestamp: new Date().toISOString(),
    };

    lastRunResult = runResult;

    console.log(`[Scheduler] ✅ Background scrape ${aborted ? 'PARTIALLY' : 'FULLY'} finished: queries=${results.length}, scraped=${totalScraped}, saved=${totalSaved}, updated=${totalUpdated}`);

    // Try to free memory after a big run
    await tryGarbageCollect();

    return {
      ...runResult,
      lastRun: lastRun.toISOString(),
      nextRun: nextRun.toISOString(),
    };
  } catch (err) {
    const runResult = {
      status: 'failed',
      error: err.message,
      timestamp: new Date().toISOString(),
    };

    lastRunResult = runResult;

    console.error(`[Scheduler] ❌ Background scrape failed: ${err.message}`);
    return {
      ...runResult,
      lastRun: lastRun.toISOString(),
      nextRun: nextRun.toISOString(),
    };
  } finally {
    isRunning = false;
  }
}

export function startScheduler() {
  if (intervalId) return;
  // Prevent duplicate schedulers in Next.js dev mode (layout compiles per-page)
  if (globalThis.__schedulerStarted) return;
  globalThis.__schedulerStarted = true;

  nextRun = new Date(Date.now() + INTERVAL_MS);
  console.log(`[Scheduler] 🕒 Scheduler started — runs every ${INTERVAL_MINUTES} min. Next: ${nextRun.toISOString()}`);
  console.log(`[Scheduler]    Config: batchSize=${BATCH_SIZE}, queryDelay=${QUERY_DELAY_MS}ms, batchCooldown=${BATCH_COOLDOWN_MS}ms`);

  intervalId = setInterval(async () => {
    console.log(`[Scheduler] ⏰ Scheduled scrape triggered at ${new Date().toISOString()}`);
    await runBackgroundScrape();
  }, INTERVAL_MS);

  if (process.env.SCRAPER_RUN_ON_START === 'true') {
    // Delay initial run by 30 seconds to let the server fully boot first
    console.log('[Scheduler] Will run initial scrape in 30s (SCRAPER_RUN_ON_START=true)');
    setTimeout(() => {
      runBackgroundScrape().catch(err => console.error('[Scheduler] Initial run failed:', err.message));
    }, 30000);
  }
}
