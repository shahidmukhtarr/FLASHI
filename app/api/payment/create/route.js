import { NextResponse } from 'next/server';
import { createJazzCashPayment, createEasyPaisaPayment, generateTxnRef } from '../../../../server/services/payment.js';
import { saveSubscription } from '../../../../server/services/db.js';

/**
 * POST /api/payment/create
 * Body: { method: 'jazzcash' | 'easypaisa' | 'card', name, email, phone }
 * Returns: { gatewayUrl, fields, txnRef } for frontend redirect
 */
export async function POST(request) {
  try {
    const { method, name, email, phone } = await request.json();

    if (!method || !email || !name) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const txnRef = generateTxnRef();
    const amount = 500; // Rs. 500

    // Save subscription as 'initiated' in DB
    await saveSubscription({
      email,
      name,
      phone,
      paymentMethod: method,
      paymentRef: txnRef,
      amount,
    });

    let paymentData;

    if (method === 'jazzcash') {
      paymentData = createJazzCashPayment({
        txnRef, amount, email, name, phone,
        description: 'FLASHI Premium Subscription',
      });
    } else if (method === 'easypaisa') {
      paymentData = createEasyPaisaPayment({
        txnRef, amount, email, phone,
      });
    } else if (method === 'card') {
      // For card payments, redirect to JazzCash with card type
      paymentData = createJazzCashPayment({
        txnRef, amount, email, name, phone,
        description: 'FLASHI Premium - Card Payment',
      });
      // Override TxnType to MIGS for card
      paymentData.fields.pp_TxnType = 'MIGS';
    } else {
      return NextResponse.json({ success: false, error: 'Invalid payment method' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      gatewayUrl: paymentData.gatewayUrl,
      fields: paymentData.fields,
      txnRef,
    });
  } catch (error) {
    console.error('[Payment Create Error]', error.message);
    return NextResponse.json({ success: false, error: 'Failed to create payment' }, { status: 500 });
  }
}
