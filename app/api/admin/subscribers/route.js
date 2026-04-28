import { NextResponse } from 'next/server';
import { getAllSubscribers } from '../../../../server/services/db.js';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Optional: Add simple security if needed, or rely on internal/admin access
  // if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
  //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const subscribers = await getAllSubscribers();
    return NextResponse.json({ success: true, subscribers });
  } catch (error) {
    console.error('[Admin Subscribers API] Error:', error.message);
    return NextResponse.json({ success: false, error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
