'use client';

import { useEffect } from 'react';

export default function DeviceDetector() {
  useEffect(() => {
    // Only run on client after hydration
    const detect = () => {
      var ua = navigator.userAgent;
      var isWebView = 
        /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua) || 
        /Android.*wv/i.test(ua) || 
        /FBAN|FBAV/i.test(ua) ||
        window.Capacitor ||
        window.webkit?.messageHandlers?.capacitor;
      
      if (isWebView) {
        document.documentElement.classList.add('is-app');
        document.documentElement.classList.remove('is-browser');
      } else {
        document.documentElement.classList.add('is-browser');
        document.documentElement.classList.remove('is-app');
      }
    };

    detect();
    // Re-detect after a short delay in case Capacitor or other markers are injected late
    setTimeout(detect, 500);
    setTimeout(detect, 2000);
  }, []);

  return null;
}
