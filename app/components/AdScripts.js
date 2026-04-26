'use client';

import Script from 'next/script';

/**
 * 320x50 Mobile Banner Ad
 */
export function BannerAd() {
  return (
    <div className="ad-banner-container" style={{ minHeight: '50px', display: 'flex', justifyContent: 'center' }}>
      <Script
        id="ad-320x50-options"
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
 * Native Banner Ad
 */
export function NativeBannerAd() {
  return (
    <div className="ad-banner-container" style={{ display: 'flex', justifyContent: 'center' }}>
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
 * 300x250 Medium Rectangle Banner Ad
 */
export function Banner300x250Ad() {
  return (
    <div className="ad-banner-container" style={{ minHeight: '250px', display: 'flex', justifyContent: 'center' }}>
      <Script
        id="ad-300x250-options"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            atOptions = {
              'key' : '44c3b23d555bf918d9b280a4183c435d',
              'format' : 'iframe',
              'height' : 250,
              'width' : 300,
              'params' : {}
            };
          `,
        }}
      />
      <Script
        src="https://www.highperformanceformat.com/44c3b23d555bf918d9b280a4183c435d/invoke.js"
        strategy="afterInteractive"
      />
    </div>
  );
}

/**
 * 468x60 Banner Ad
 */
export function Banner468x60Ad() {
  return (
    <div className="ad-banner-container" style={{ minHeight: '60px', display: 'flex', justifyContent: 'center' }}>
      <Script
        id="ad-468x60-options"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            atOptions = {
              'key' : '2ff2feae0be05506088f391736342ca2',
              'format' : 'iframe',
              'height' : 60,
              'width' : 468,
              'params' : {}
            };
          `,
        }}
      />
      <Script
        src="https://www.highperformanceformat.com/2ff2feae0be05506088f391736342ca2/invoke.js"
        strategy="afterInteractive"
      />
    </div>
  );
}

/**
 * 160x300 Sidebar / Display Ad
 */
export function DisplayAd() {
  return (
    <div className="ad-display-container" style={{ minHeight: '300px', display: 'flex', justifyContent: 'center' }}>
      <Script
        id="ad-160x300-options"
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

