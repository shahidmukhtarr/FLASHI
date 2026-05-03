import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../../server/services/db.js';
import { sendSubscriptionActiveEmail } from '../../../../server/services/emailService.js';

/**
 * POST /api/admin/activate-subscriber
 * Activates a single subscriber by email and sends them an activation email.
 * Body: { email: string }
 */
export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const client = getSupabaseClient();
  if (!client) {
    return NextResponse.json({ success: false, error: 'DB not initialized' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Fetch the subscriber
    const { data: subscribers, error: fetchError } = await client
      .from('subscribers')
      .select('id, email, name, status, created_at')
      .eq('email', email)
      .limit(1);

    if (fetchError) throw fetchError;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: false, error: 'Subscriber not found' }, { status: 404 });
    }

    const subscriber = subscribers[0];

    if (subscriber.status === 'active') {
      return NextResponse.json({ success: false, error: 'Subscriber is already active' }, { status: 400 });
    }

    // Activate: set status = 'active', expires_at = now + 30 days
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: updateError } = await client
      .from('subscribers')
      .update({
        status: 'active',
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', subscriber.id);

    if (updateError) throw updateError;

    console.log(`[ActivateSubscriber] Activated ${subscriber.email}`);

    // Send activation email
    try {
      const emailResult = await sendSubscriptionActiveEmail(subscriber.email, subscriber.name, expiresAt.toISOString());
      console.log(`[ActivateSubscriber] Activation email sent to ${subscriber.email}:`, emailResult);
    } catch (emailErr) {
      console.error(`[ActivateSubscriber] Activation email failed for ${subscriber.email}:`, emailErr.message);
      // Don't fail the activation if email fails — subscriber is still activated
    }

    return NextResponse.json({
      success: true,
      message: `Subscriber ${subscriber.email} activated successfully`,
      email: subscriber.email,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('[ActivateSubscriber] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
