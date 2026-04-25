'use client';

import { useEffect } from 'react';

export default function DeviceDetector() {
  useEffect(() => {
    // Only run on client after hydration
    var ua = navigator.userAgent;
    var isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua) || /Android.*wv/i.test(ua) || /FBAN|FBAV/i.test(ua);
    
    if (isWebView) {
      document.documentElement.classList.add('is-app');
    } else {
      document.documentElement.classList.add('is-browser');
    }
  }, []);

  return null;
}
