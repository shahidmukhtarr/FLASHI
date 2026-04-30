import { NextResponse } from 'next/server';

export async function GET() {
  // Lazily import keep-alive status so this endpoint never crashes
  let keepAlive = null;
  try {
    const ka = await import('../../../server/services/keepAlive.js');
    keepAlive = ka.getKeepAliveStatus();
  } catch (_) {
    // Module not yet loaded — that's fine
  }

  return NextResponse.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    keepAlive,
  });
}

