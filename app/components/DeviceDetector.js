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

  // ─── External Link Interceptor (for mobile app) ────────────────────────
  // When running inside the Capacitor WebView, intercept taps on external
  // store links (target="_blank") and open them in the device's system
  // browser. This way the user can naturally press the phone's back/recents
  // button to return to the FLASHI app.
  useEffect(() => {
    function isInApp() {
      return document.documentElement.classList.contains('is-app');
    }

    // Domains that should stay inside the WebView (our own site)
    const internalDomains = ['flashi.pk', 'www.flashi.pk', 'localhost'];

    function isExternalUrl(href) {
      try {
        const url = new URL(href, window.location.origin);
        const hostname = url.hostname.toLowerCase();
        // Internal if it's our own domain
        if (internalDomains.some(d => hostname === d || hostname.endsWith('.' + d))) {
          return false;
        }
        // Google ad/analytics domains should stay internal
        if (hostname.endsWith('.google.com') || hostname.endsWith('.googleapis.com') || hostname.endsWith('.googlesyndication.com')) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    }

    function handleLinkClick(e) {
      if (!isInApp()) return; // Only intercept in mobile app

      // Walk up from the clicked element to find the nearest <a> tag
      let target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      if (!target || !target.href) return;

      const href = target.href;

      // Only intercept external links
      if (!isExternalUrl(href)) return;

      // Prevent the default navigation inside the WebView
      e.preventDefault();
      e.stopPropagation();

      // Open in system browser via window.open
      // Capacitor will route this to the external browser since the domain
      // is NOT in allowNavigation
      window.open(href, '_system');
    }

    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, []);

  return null;
}
