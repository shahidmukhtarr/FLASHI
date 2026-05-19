import './globals.css';
import './download.css';
import MobileBottomNav from './components/MobileBottomNav';
import DeviceDetector from './components/DeviceDetector';
import PullToRefresh from './components/PullToRefresh';
import AnnouncementBar from './components/AnnouncementBar';
import Script from 'next/script';
import { Suspense } from 'react';

// Initialize services on server startup (skip during build time)
const isBuild = process.env.npm_lifecycle_event === 'build' || process.env.NEXT_PHASE === 'phase-production-build' || (typeof process !== 'undefined' && process.argv && process.argv.some(arg => arg.includes('build') || arg.includes('export')));

if (typeof window === 'undefined' && !isBuild) {
  // Run bootstrap in background
  Promise.all([
    import('../server/services/db.js').then(m => m.initDb()),
    import('../server/services/scheduler.js').then(m => {
      if (!process.env.VERCEL) m.startScheduler();
    }),
    // Keep-alive: self-ping every 8 min so the server never idles out.
    // This ensures the mobile APK works even after a period of no user traffic.
    import('../server/services/keepAlive.js').then(m => m.startKeepAlive()),
  ]).catch(err => console.error('[Bootstrap] Startup failed:', err.message));
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata = {
  metadataBase: new URL('https://flashi.pk'),
  title: "Flashi - Pakistan's #1 Price Comparison Platform",
  description: 'Pakistan\'s best Price Comparison Platform. Compare prices from 50+ stores like Daraz, PriceOye, Mega.pk, Qeemat & PriceMeter. Find lowest prices on earbuds, mobile gadgets & more.',
  keywords: 'price comparison platform, price comparison pakistan, compare prices pakistan, pricemeter pakistan, qeemat pakistan, compareprice.pk, mega.pk, pricespy pakistan, online shopping pakistan, best deals pakistan',
  robots: 'index, follow',
  openGraph: {
    title: 'Compare Prices from 50+ Pakistani Stores — Earbuds, Smart Watches & More | Flashi',
    description: 'Find the lowest prices on earbuds, smart watches, chargers & gadgets in Pakistan. Compare across Daraz, PriceOye, Mega.pk & 50+ stores instantly.',
    images: ['/logo.png'],
    type: 'website',
    locale: 'en_PK',
    siteName: 'Flashi',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Flashi - Pakistan's #1 Price Comparison Platform",
    description: 'Find the lowest prices on earbuds, smart watches, chargers & gadgets. Compare across 50+ Pakistani stores.',
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

// JSON-LD Structured Data for SEO
function JsonLdSchema() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Flashi',
      url: 'https://flashi.pk',
      logo: 'https://flashi.pk/logo.png',
      description: "Pakistan's #1 price comparison platform. Compare prices from 50+ stores including Daraz, PriceOye, Mega.pk & more.",
      sameAs: ['https://www.instagram.com/flashi.pk/'],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        url: 'https://flashi.pk/contact',
        availableLanguage: ['English', 'Urdu'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Flashi',
      url: 'https://flashi.pk',
      description: 'Compare prices across 50+ Pakistani online stores',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://flashi.pk/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
    />
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLdSchema />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6296239062398160"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <Script
          src="/flashi-notifications.js"
          strategy="afterInteractive"
        />
      </head>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            var ua = navigator.userAgent;
            var isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua) || /Android.*wv/i.test(ua) || /FBAN|FBAV/i.test(ua);
            if (isWebView || window.Capacitor) {
              document.documentElement.classList.add('is-app');
            } else {
              document.documentElement.classList.add('is-browser');
            }

            // Register service worker for offline fallback
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function() {});
              });
            }
          })();
        `}} />
        <AnnouncementBar />
        <Suspense fallback={null}>
          <DeviceDetector />
        </Suspense>
        <PullToRefresh>
          {children}
        </PullToRefresh>
        <MobileBottomNav />
      </body>
    </html>
  );
}
