'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';

/**
 * Native Banner Ad - renders into a specific container div.
 * Place between content sections.
 */
export function NativeBannerAd() {
  return (
    <div className="ad-banner-container">
      <Script
        src="https://pl29259901.profitablecpmratenetwork.com/0abb0d7144a4d3736f57681dd82e13b5/invoke.js"
        strategy="afterInteractive"
        async
        data-cfasync="false"
      />
      <div id="container-0abb0d7144a4d3736f57681dd82e13b5"></div>
    </div>
  );
}

/**
 * Small Banner Ad (320x50 iframe) - compact horizontal banner.
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

/**
 * Sidebar / Display Ad (160x300 iframe) - taller display ad.
 * Good for sidebars or between content blocks.
 */
export function DisplayAd() {
  return (
    <div className="ad-display-container">
      <Script
        id="ad-display-options"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            atOptions = {
              'key' : '633652bcf6cdc2e81243dc897969d8fc',
              'format' : 'iframe',
              'height' : 300,
              'width' : 160,
              'params' : {}
            };
          `,
        }}
      />
      <Script
        src="https://www.highperformanceformat.com/633652bcf6cdc2e81243dc897969d8fc/invoke.js"
        strategy="afterInteractive"
      />
    </div>
  );
}

/**
 * Global interstitial ad script - loads once in the layout.
 */
export function GlobalAdScript() {
  return (
    <Script
      src="https://pl29259900.profitablecpmratenetwork.com/b5/29/6a/b5296a8c4b5616cae2f5d00468942169.js"
      strategy="afterInteractive"
    />
  );
}
