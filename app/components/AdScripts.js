'use client';

import { useEffect, useRef } from 'react';

/**
 * Ad scripts that cause pop-unders and click-hijacking (like profitablecpmratenetwork and highperformanceformat)
 * have been removed. We are using safe Google AdSense placeholders instead, as AdSense 
 * is already configured in layout.js.
 */

export function NativeBannerAd() {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="ad-banner-container" style={{ textAlign: 'center', width: '100%', minHeight: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <ins className="adsbygoogle"
           ref={adRef}
           style={{ display: 'block', width: '100%' }}
           data-ad-client="ca-pub-6296239062398160"
           data-ad-slot="auto"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
}

export function BannerAd() {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="ad-banner-container" style={{ textAlign: 'center', width: '100%', minHeight: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <ins className="adsbygoogle"
           style={{ display: 'inline-block', width: '320px', height: '50px' }}
           data-ad-client="ca-pub-6296239062398160"
           data-ad-slot="auto"></ins>
    </div>
  );
}

export function DisplayAd() {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="ad-display-container" style={{ textAlign: 'center', width: '100%', minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <ins className="adsbygoogle"
           style={{ display: 'inline-block', width: '160px', height: '300px' }}
           data-ad-client="ca-pub-6296239062398160"
           data-ad-slot="auto"></ins>
    </div>
  );
}

