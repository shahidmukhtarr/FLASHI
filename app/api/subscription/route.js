import { getSubscriptionStatus } from '../../../server/services/db.js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const status = await getSubscriptionStatus(email);
    
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('[Subscription GET Error]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch status' }, { status: 500 });
  }
}
