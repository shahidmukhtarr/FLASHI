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
  title: 'Flashi – Pakistan First Smart Shopping App.',
  description: "Search any product and instantly compare prices from Pakistan's top stores in one place..",
  keywords: 'price comparison app Pakistan, discount app Pakistan, food deals Pakistan, Flashi app,Flashi Pakistan',
  robots: 'index, follow',
  openGraph: {
    title: 'Flashi – Price Comparison App in Pakistan',
    description: 'Find the best deals and discounts near you with Flashi.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: 'https://flashi.pk/',
  },
  verification: {
    google: '-GfeIA9cVZ6cTozbh7fRZd3BDr4LvSkRnRV3_4rdjtw',
  },
  other: {
    'google-adsense-account': 'ca-pub-6296239062398160'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="-GfeIA9cVZ6cTozbh7fRZd3BDr4LvSkRnRV3_4rdjtw" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content="English" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6296239062398160" crossOrigin="anonymous"></script>
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
