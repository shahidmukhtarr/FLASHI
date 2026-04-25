import { NextResponse } from 'next/server';
import { notifyActiveSubscribers } from '../../../../server/services/notificationService.js';

/**
 * POST /api/admin/send-notifications
 * Manually trigger notifications to all active premium subscribers.
 * 
 * Body: { type: 'special_sale', data: { storeName: 'Limelight' } }
 *    or { type: 'price_drop', data: { query: 'iPhone 15' } }
 */
export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type) {
      return NextResponse.json({ success: false, error: 'Notification type is required' }, { status: 400 });
    }

    // This runs asynchronously so we don't block the response
    notifyActiveSubscribers(type, data || {}).catch(err => {
      console.error('[Admin] Error in background notification task:', err.message);
    });

    return NextResponse.json({ success: true, message: 'Notifications have been queued and are sending in the background.' });
  } catch (error) {
    console.error('[Admin] Error sending notifications:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
