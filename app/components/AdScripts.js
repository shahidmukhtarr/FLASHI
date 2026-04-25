'use client';

import Script from 'next/script';

/**
 * Global ad scripts that load once across the entire app.
 * These are interstitial/popunder type ads that don't need a container.
 */
export function GlobalAdScripts() {
  return (
    <>
      {/* Ad Network Script 1 - Interstitial */}
      <Script
        src="https://pl29259898.profitablecpmratenetwork.com/da/34/67/da3467791ecc369dd5a78e779e9a982b.js"
        strategy="afterInteractive"
      />
      {/* Ad Network Script 2 - Interstitial */}
      <Script
        src="https://pl29259900.profitablecpmratenetwork.com/b5/29/6a/b5296a8c4b5616cae2f5d00468942169.js"
        strategy="afterInteractive"
      />
    </>
  );
}

/**
 * Banner Ad component (320x50) - place this where you want a banner ad to appear.
 * Best used between content sections (e.g. below search results, between product rows).
 */
export function BannerAd() {
  return (
    <div className="ad-banner-container">
      <Script
        id="ad-banner-options"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            atOptions = {
              'key' : '4f6441b13ebcdcae2e0ed7b1c5828ada',
              'format' : 'iframe',
              'height' : 50,
              'width' : 320,
              'params' : {}
            };
          `,
        }}
      />
      <Script
        src="https://www.highperformanceformat.com/4f6441b13ebcdcae2e0ed7b1c5828ada/invoke.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
