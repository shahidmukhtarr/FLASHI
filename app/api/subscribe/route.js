import { NextResponse } from 'next/server';
import { saveSubscription, getSubscriptionByEmail } from '../../../server/services/db.js';
import { sendSubscriptionRequestEmail } from '../../../server/services/emailService.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, paymentRef } = body;

    if (!email || !name || !phone) {
      return NextResponse.json({ error: 'Name, email, and phone number are required' }, { status: 400 });
    }

    const result = await saveSubscription({
      name,
      email,
      phone,
      paymentMethod: 'bank_transfer',
      paymentRef: paymentRef || '',
      amount: 500,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Send subscription request confirmation email (fire-and-forget)
    sendSubscriptionRequestEmail(email, name, phone, paymentRef).catch(err =>
      console.error('[Subscribe API] Subscription request email failed:', err.message)
    );

    return NextResponse.json({
      success: true,
      message: result.isUpdate
        ? 'Your subscription request has been updated. We will verify your payment shortly.'
        : 'Subscription request submitted! We will verify your payment and activate your account within 24 hours.',
    });
  } catch (error) {
    console.error('[Subscribe API] Error:', error.message);
    return NextResponse.json({ error: 'Failed to process subscription. Please try again.' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const subscription = await getSubscriptionByEmail(email);

    if (!subscription) {
      return NextResponse.json({ subscribed: false, status: 'none' });
    }

    return NextResponse.json({
      subscribed: subscription.status === 'active',
      status: subscription.status,
      expiresAt: subscription.expires_at,
    });
  } catch (error) {
    console.error('[Subscribe API] Status check error:', error.message);
    return NextResponse.json({ error: 'Failed to check subscription status' }, { status: 500 });
  }
}
