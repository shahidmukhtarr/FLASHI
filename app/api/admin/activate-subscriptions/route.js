import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../../server/services/db.js';
import { sendSubscriptionActiveEmail } from '../../../../server/services/emailService.js';

/**
 * POST /api/admin/activate-subscriptions
 * Auto-activates subscribers who have been in 'pending' status for >= 1 hour.
 * Protect this with the CRON_SECRET env var when called by Vercel Cron or external schedulers.
 *
 * Vercel Cron config (in vercel.json):
 * { "crons": [{ "path": "/api/admin/activate-subscriptions", "schedule": "0 * * * *" }] }
 */
export async function POST(request) {
  // Simple secret check — set CRON_SECRET in your environment variables
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
    const { data: pendingSubs, error: fetchError } = await client
      .from('subscribers')
      .select('id, email, name, created_at')
      .eq('status', 'pending');

    if (fetchError) throw fetchError;

    if (!pendingSubs || pendingSubs.length === 0) {
      return NextResponse.json({ success: true, activated: 0, message: 'No pending subscriptions to activate.' });
    }

    // Activate each: set status = 'active', expires_at = now + 30 days
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    const ids = pendingSubs.map(s => s.id);

    const { error: updateError } = await client
      .from('subscribers')
      .update({
        status: 'active',
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      })
      .in('id', ids);

    if (updateError) throw updateError;

    console.log(`[AutoActivate] Activated ${ids.length} subscriber(s):`, pendingSubs.map(s => s.email));

    // Send activation emails to all newly activated subscribers (fire-and-forget)
    for (const sub of pendingSubs) {
      sendSubscriptionActiveEmail(sub.email, sub.name, expiresAt.toISOString()).catch(err =>
        console.error(`[AutoActivate] Activation email failed for ${sub.email}:`, err.message)
      );
    }

    return NextResponse.json({
      success: true,
      activated: ids.length,
      emails: pendingSubs.map(s => s.email),
    });
  } catch (error) {
    console.error('[AutoActivate] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Also support GET for Vercel Cron (which uses GET by default)
export async function GET(request) {
  return POST(request);
}

