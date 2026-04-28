import { getCurrentSubscriptionPrice } from '../../../../server/services/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const price = await getCurrentSubscriptionPrice();
    return NextResponse.json({ success: true, price });
  } catch (error) {
    console.error('[Price API Error]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch price' }, { status: 500 });
  }
}
