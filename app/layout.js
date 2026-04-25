import './globals.css';
import MobileBottomNav from './components/MobileBottomNav';
import DeviceDetector from './components/DeviceDetector';
import { GlobalAdScript } from './components/AdScripts';
import Script from 'next/script';

// Initialize services on server startup (skip during build time)
const isBuild = process.env.npm_lifecycle_event === 'build' || process.env.NEXT_PHASE === 'phase-production-build' || (typeof process !== 'undefined' && process.argv && process.argv.some(arg => arg.includes('build') || arg.includes('export')));

if (typeof window === 'undefined' && !isBuild) {
  // Run bootstrap in background
  Promise.all([
    import('../server/services/db.js').then(m => m.initDb()),
    import('../server/services/scheduler.js').then(m => {
      if (!process.env.VERCEL) m.startScheduler();
    })
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
  title: 'Flashi – Pakistan First Smart Shopping App.',
  description: "Search any product and instantly compare prices from Pakistan's top stores in one place..",
  keywords: 'price comparison app Pakistan, discount app Pakistan, cheap shopping Pakistan, flashi app, flashi Pakistan, flashi, flashi Pakistan, flashi app, flashi pk, flashi deals, flashi discounts, flashi price comparison, flashi shopping app, flashi online deals Pakistan, flashi savings app',
  robots: 'index, follow',
  openGraph: {
    title: 'Flashi – Price Comparison App in Pakistan',
    description: 'Find the best deals and discounts with Flashi.',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6296239062398160" 
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <DeviceDetector />
        {children}
        <MobileBottomNav />
        <GlobalAdScript />
      </body>
    </html>
  );
}
