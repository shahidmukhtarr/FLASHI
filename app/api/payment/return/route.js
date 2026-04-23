import { NextResponse } from 'next/server';
import { verifyJazzCashResponse, verifyEasyPaisaResponse } from '../../../../server/services/payment.js';
import { updateSubscriptionStatus, getSubscriptionByEmail } from '../../../../server/services/db.js';
import { getSupabaseClient } from '../../../../server/services/db.js';

/**
 * POST /api/payment/return
 * Handles both user redirect-back and webhook callbacks from JazzCash / EasyPaisa.
 * Verifies the payment signature and auto-activates the subscription.
 */
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      data = Object.fromEntries(new URLSearchParams(text));
    } else {
      data = await request.json();
    }

    console.log('[Payment Return] Received:', JSON.stringify(data).substring(0, 500));

    let paymentResult;
    let email = '';

    // Detect which gateway sent the callback
    if (data.pp_TxnRefNo) {
      // JazzCash response
      paymentResult = verifyJazzCashResponse(data);
      email = paymentResult.email;
    } else if (data.orderRefNumber || data.order_id) {
      // EasyPaisa response
      paymentResult = verifyEasyPaisaResponse(data);
      // Look up email from txn ref in DB
      const txnRef = paymentResult.orderRefNum;
      const client = getSupabaseClient();
      if (client && txnRef) {
        const { data: sub } = await client
          .from('subscribers')
          .select('email')
          .eq('payment_ref', txnRef)
          .limit(1);
        if (sub?.[0]) email = sub[0].email;
      }
    } else {
      console.log('[Payment Return] Unknown gateway response format');
      return redirectToSubscribe('error', 'Unknown payment response');
    }

    if (paymentResult.isSuccess) {
      // Auto-activate the subscription
      if (email) {
        await updateSubscriptionStatus(email, 'active', 30);
        console.log(`[Payment] ✅ Subscription activated for ${email}`);
      }
      return redirectToSubscribe('success', 'Payment successful! Your subscription is now active.');
    } else {
      console.log(`[Payment] ❌ Payment failed: ${paymentResult.responseCode} - ${paymentResult.responseMessage || ''}`);
      return redirectToSubscribe('failed', paymentResult.responseMessage || 'Payment was not completed');
    }
  } catch (error) {
    console.error('[Payment Return Error]', error.message);
    return redirectToSubscribe('error', 'Something went wrong processing your payment');
  }
}

// Also handle GET (some gateways redirect via GET)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  if (Object.keys(params).length > 0 && (params.pp_TxnRefNo || params.orderRefNumber)) {
    // Convert GET params to the same format and process
    const fakeRequest = {
      headers: { get: () => 'application/json' },
      json: async () => params,
    };
    return POST(fakeRequest);
  }

  // No payment params — just redirect to subscribe
  return redirectToSubscribe('', '');
}

function redirectToSubscribe(status, message) {
  const params = new URLSearchParams();
  if (status) params.set('payment', status);
  if (message) params.set('msg', message);
  const url = `/subscribe${params.toString() ? '?' + params.toString() : ''}`;

  return NextResponse.redirect(new URL(url, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'), {
    status: 303,
  });
}
