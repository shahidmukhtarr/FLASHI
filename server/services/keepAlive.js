/**
 * keepAlive.js
 * Self-pinging keep-alive service.
 *
 * Many free/standard hosting tiers (Render, Railway, Fly.io, etc.) spin down
 * an instance after ~15 minutes of inactivity.  When the mobile APK then tries
 * to reach the API it times out before the cold-start completes, giving the
 * appearance that the app "doesn't work".
 *
 * This module runs a recurring setInterval entirely on the server.  Every
 * KEEP_ALIVE_INTERVAL_MS milliseconds it makes an HTTP GET to the app's own
 * /api/health endpoint, which is enough to keep the process alive and prevent
 * the platform from evicting it.
 *
 * No external services, no cron dashboards — pure Node.js.
 */

const KEEP_ALIVE_INTERVAL_MS =
  parseInt(process.env.KEEP_ALIVE_INTERVAL_MS, 10) || 8 * 60 * 1000; // 8 minutes default

// Resolve the base URL at runtime so we always hit the right host
function getBaseUrl() {
  // Production: set via env
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  // Vercel preview deployments expose this automatically
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // Render / Railway / Fly typically set PORT
  const port = process.env.PORT || 3000;
  return `http://localhost:${port}`;
}

let _intervalId = null;
let _pingCount = 0;
let _lastPingAt = null;
let _lastPingStatus = null;

async function ping() {
  const url = `${getBaseUrl()}/api/health`;
  try {
    // Use native fetch (Node 18+) — no extra dependency needed
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'FlashiKeepAlive/1.0', 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(10_000), // 10 s timeout
    });

    _pingCount++;
    _lastPingAt = new Date().toISOString();
    _lastPingStatus = res.status;

    if (res.ok) {
      console.log(`[KeepAlive] ✅ Ping #${_pingCount} → ${url} — ${res.status} OK`);
    } else {
      console.warn(`[KeepAlive] ⚠️  Ping #${_pingCount} → ${url} — unexpected status ${res.status}`);
    }
  } catch (err) {
    // Don't crash — just log.  A transient network hiccup during startup is normal.
    console.warn(`[KeepAlive] ❌ Ping failed: ${err.message}`);
    _lastPingStatus = 'error';
  }
}

export function startKeepAlive() {
  // Only run on the server, never during builds, never on Vercel (serverless — no persistent process)
  if (typeof window !== 'undefined') return;
  if (process.env.VERCEL) {
    console.log('[KeepAlive] Skipped — running on Vercel (serverless, keep-alive not needed)');
    return;
  }
  if (process.env.NEXT_PHASE === 'phase-production-build') return;

  // Guard against double-registration (Next.js dev mode hot-reload)
  if (globalThis.__keepAliveStarted) return;
  globalThis.__keepAliveStarted = true;

  console.log(`[KeepAlive] 🚀 Starting keep-alive pinger every ${KEEP_ALIVE_INTERVAL_MS / 60_000} minutes → ${getBaseUrl()}/api/health`);

  // First ping: delay 15 s to let the server finish booting before self-calling
  setTimeout(() => ping(), 15_000);

  _intervalId = setInterval(() => ping(), KEEP_ALIVE_INTERVAL_MS);
}

export function stopKeepAlive() {
  if (_intervalId) {
    clearInterval(_intervalId);
    _intervalId = null;
    globalThis.__keepAliveStarted = false;
    console.log('[KeepAlive] Stopped.');
  }
}

export function getKeepAliveStatus() {
  return {
    running: !!_intervalId,
    pingCount: _pingCount,
    lastPingAt: _lastPingAt,
    lastPingStatus: _lastPingStatus,
    intervalMinutes: KEEP_ALIVE_INTERVAL_MS / 60_000,
    targetUrl: `${getBaseUrl()}/api/health`,
  };
}
