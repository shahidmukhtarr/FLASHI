import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../../server/services/db.js';

const TABLE = 'download_clicks';

async function ensureTable(client) {
  // Try to select — if table doesn't exist, we'll create it via a simple upsert approach
  const { error } = await client.from(TABLE).select('id').limit(1);
  if (error && error.code === '42P01') {
    // Table doesn't exist — we'll use a fallback key-value approach via a different table
    return false;
  }
  return true;
}

// GET — return total download count
export async function GET() {
  try {
    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ count: 0 });
    }

    // Try dedicated table first
    const { count, error } = await client
      .from(TABLE)
      .select('id', { count: 'exact' })
      .limit(1);

    if (error) {
      // Fallback: check app_meta table
      const { data } = await client
        .from('app_meta')
        .select('value')
        .eq('key', 'download_count')
        .single();
      return NextResponse.json({ count: data?.value ? parseInt(data.value) : 0 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    return NextResponse.json({ count: 0 });
  }
}

// POST — record a download click
export async function POST(request) {
  try {
    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ success: false, error: 'DB not configured' }, { status: 500 });
    }

    let body = {};
    try { body = await request.json(); } catch {}

    const record = {
      source: body.source || 'unknown',
      user_agent: request.headers.get('user-agent') || '',
      clicked_at: new Date().toISOString(),
    };

    // Try inserting into dedicated table
    const { error } = await client.from(TABLE).insert(record);

    if (error) {
      // Fallback: increment counter in app_meta
      const { data: existing } = await client
        .from('app_meta')
        .select('value')
        .eq('key', 'download_count')
        .single();

      const newCount = (existing?.value ? parseInt(existing.value) : 0) + 1;

      await client
        .from('app_meta')
        .upsert({ key: 'download_count', value: String(newCount) }, { onConflict: 'key' });

      return NextResponse.json({ success: true, count: newCount, fallback: true });
    }

    // Get updated count
    const { count } = await client
      .from(TABLE)
      .select('id', { count: 'exact' })
      .limit(1);

    return NextResponse.json({ success: true, count: count || 0 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
