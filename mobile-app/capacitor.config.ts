import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flashi.app',
  appName: 'Flashi',
  webDir: 'www',

  // This is the key setting — the app loads your live website
  server: {
    url: 'https://flashi.pk',
    cleartext: true,
    // Allow navigation to external store links (Daraz, PriceOye, etc.)
    allowNavigation: [
      'flashi.pk',
      '*.flashi.pk',
      '*.daraz.pk',
      '*.priceoye.pk',
      '*.mega.pk',
      '*.google.com',
      '*.googleapis.com',
      '*.googlesyndication.com',
    ],
  },

  // Android-specific settings
  android: {
    // Allow mixed content (HTTP + HTTPS) if needed
    allowMixedContent: true,
    // Use a dark splash screen background to match the app theme
    backgroundColor: '#0a0a0a',
    // Handle back button like a browser
    // (go back in history instead of closing the app)
  },

  // iOS-specific settings
  ios: {
    backgroundColor: '#0a0a0a',
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scrollEnabled: true,
  },

  // Plugins configuration
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0a0a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0a',
    },
  },
};

export default config;
