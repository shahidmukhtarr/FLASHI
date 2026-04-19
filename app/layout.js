import './globals.css';

// Initialize services on server startup (skip during build time)
const isBuild = process.env.npm_lifecycle_event === 'build' || process.env.NEXT_PHASE === 'phase-production-build' || (typeof process !== 'undefined' && process.argv && process.argv.some(arg => arg.includes('build') || arg.includes('export')));

if (typeof window === 'undefined' && !isBuild) {
  import('../server/services/db.js').then(({ initDb }) => {
    initDb().catch(err => {
      console.error('[Bootstrap] Database initialization failed:', err.message);
    });
  });

  import('../server/services/scheduler.js').then(({ startScheduler }) => {
    if (!process.env.VERCEL) {
      startScheduler();
      console.log('[Bootstrap] Background scheduler started.');
    } else {
      console.log('[Bootstrap] Scheduler disabled in Vercel environment.');
    }
  });
}

export const metadata = {
  title: 'FLASHI — Price Comparison',
  description: "Search Pakistan's top stores, view saved product data, and manage scraper runs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
