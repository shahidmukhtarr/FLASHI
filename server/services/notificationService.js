import { getSupabaseClient } from './db.js';
import { sendMail, baseLayout, ctaButton } from './emailService.js';

// ─── HTML Email Builders ────────────────────────────────────────────────────────

function buildPriceDropEmail(name, query) {
  const firstName = (name || 'Subscriber').split(' ')[0];

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#fff;">📉 Price Drop Alert!</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#a0a0b0;line-height:1.7;">
      Hi ${firstName}, we spotted new price drops for <strong style="color:#a78bfa;">"${query}"</strong>!
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12121a;border-radius:12px;border:1px solid rgba(139,92,246,0.1);margin-bottom:24px;">
      <tr><td style="padding:24px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">💰</div>
        <h3 style="margin:0 0 8px;font-size:18px;color:#a78bfa;font-weight:700;">${query}</h3>
        <p style="margin:0;font-size:14px;color:#888;">Prices just dropped — grab the deal before it's gone!</p>
      </td></tr>
    </table>

    <p style="margin:0 0 8px;font-size:14px;color:#a0a0b0;line-height:1.6;">
      As a FLASHI Premium member, you're the first to know about these price drops. Check them out now!
    </p>

    ${ctaButton('View Price Drops →', `https://www.flashi.pk/?q=${encodeURIComponent(query)}`)}
  `;

  return {
    subject: `📉 FLASHI Alert: Price Drop on ${query}!`,
    html: baseLayout('Price Drop Alert', body),
    text: `Hi ${firstName},\n\nWe found new price drops for "${query}".\n\nCheck them out: https://www.flashi.pk/?q=${encodeURIComponent(query)}\n\n— FLASHI Team`,
  };
}

function buildSpecialSaleEmail(name, storeName) {
  const firstName = (name || 'Subscriber').split(' ')[0];

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#fff;">🛍️ Massive Sale at ${storeName}!</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#a0a0b0;line-height:1.7;">
      Hi ${firstName}, <strong style="color:#a78bfa;">${storeName}</strong> just launched a massive sale with up to 50% off on premium items!
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,rgba(109,40,217,0.15),rgba(139,92,246,0.08));border-radius:12px;border:1px solid rgba(139,92,246,0.2);margin-bottom:24px;">
      <tr><td style="padding:24px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">🔥</div>
        <h3 style="margin:0 0 4px;font-size:18px;color:#a78bfa;font-weight:700;">${storeName} Sale LIVE</h3>
        <p style="margin:0;font-size:13px;color:#888;">Up to 50% off — exclusive for FLASHI Premium members</p>
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12121a;border-radius:12px;border:1px solid rgba(139,92,246,0.1);margin-bottom:24px;">
      <tr><td style="padding:24px;">
        <h3 style="margin:0 0 16px;font-size:16px;color:#8b5cf6;">Why you'll love this:</h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#c0c0d0;">⚡</td>
            <td style="padding:8px 12px;font-size:14px;color:#c0c0d0;">Early access — you're seeing this before everyone else</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#c0c0d0;">🏷️</td>
            <td style="padding:8px 12px;font-size:14px;color:#c0c0d0;">Verified discounts, no fake markups</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#c0c0d0;">🛒</td>
            <td style="padding:8px 12px;font-size:14px;color:#c0c0d0;">Direct links to the best deals</td>
          </tr>
        </table>
      </td></tr>
    </table>

    ${ctaButton('Shop the Sale →', 'https://www.flashi.pk/special-discounts')}
  `;

  return {
    subject: `🛍️ FLASHI Exclusive: Massive Sale at ${storeName}!`,
    html: baseLayout('Special Sale Alert', body),
    text: `Hi ${firstName},\n\n${storeName} just launched a massive sale! Up to 50% off on premium items.\n\nView the deals: https://www.flashi.pk/special-discounts\n\n— FLASHI Team`,
  };
}

function buildGenericUpdateEmail(name) {
  const firstName = (name || 'Subscriber').split(' ')[0];

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#fff;">🎯 New Deals for You!</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#a0a0b0;line-height:1.7;">
      Hi ${firstName}, we have some fresh deals and updates waiting for you on FLASHI!
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12121a;border-radius:12px;border:1px solid rgba(139,92,246,0.1);margin-bottom:24px;">
      <tr><td style="padding:24px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">🎁</div>
        <h3 style="margin:0 0 8px;font-size:18px;color:#a78bfa;font-weight:700;">Fresh Deals Await</h3>
        <p style="margin:0;font-size:14px;color:#888;">New products and price drops across all stores</p>
      </td></tr>
    </table>

    ${ctaButton('Explore Deals →', 'https://www.flashi.pk')}
  `;

  return {
    subject: '🎯 FLASHI Premium — New Deals for You!',
    html: baseLayout('Premium Update', body),
    text: `Hi ${firstName},\n\nWe have some new updates and deals for you. Check out FLASHI!\n\nhttps://www.flashi.pk\n\n— FLASHI Team`,
  };
}

// ─── SMS/WhatsApp (mock) ────────────────────────────────────────────────────────

/**
 * Mocks sending an SMS/WhatsApp notification
 */
async function sendSmsNotification(phone, name, message) {
  console.log(`[Notification Service] 📱 Sending SMS/WhatsApp to ${name} (${phone})`);
  console.log(`Message:\n${message}\n`);
  
  // TODO: Integrate Twilio or similar service here
  // For now we simulate success
  return true;
}

// ─── Main: Notify Active Subscribers ────────────────────────────────────────────

/**
 * Notifies all active subscribers about new sales or price drops.
 */
export async function notifyActiveSubscribers(type, data) {
  const client = getSupabaseClient();
  if (!client) {
    console.error('[Notification Service] DB not initialized. Cannot fetch subscribers.');
    return;
  }

  try {
    const { data: activeSubs, error } = await client
      .from('subscribers')
      .select('id, email, name, phone')
      .eq('status', 'active');

    if (error) throw error;

    if (!activeSubs || activeSubs.length === 0) {
      console.log('[Notification Service] No active subscribers found to notify.');
      return;
    }

    console.log(`[Notification Service] Found ${activeSubs.length} active subscriber(s) to notify (type: ${type}).`);

    for (const sub of activeSubs) {
      // Build the branded HTML email
      let emailContent;
      let smsMessage = '';

      if (type === 'price_drop') {
        emailContent = buildPriceDropEmail(sub.name, data.query);
        smsMessage = `FLASHI Alert: Huge price drop spotted for ${data.query}! Visit FLASHI now to check it out.`;
      } else if (type === 'special_sale') {
        emailContent = buildSpecialSaleEmail(sub.name, data.storeName);
        smsMessage = `FLASHI Exclusive: Massive Sale at ${data.storeName}! Check it out now on the Special Discounts page.`;
      } else {
        emailContent = buildGenericUpdateEmail(sub.name);
        smsMessage = `FLASHI Premium Update: New deals are waiting for you!`;
      }

      // Send branded HTML email via the shared transport
      if (sub.email) {
        try {
          await sendMail({
            to: sub.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          });
        } catch (emailErr) {
          console.error(`[Notification Service] Email failed for ${sub.email}:`, emailErr.message);
        }
      }

      // Send SMS/WhatsApp notification
      if (sub.phone) {
        await sendSmsNotification(sub.phone, sub.name, smsMessage);
      }
    }

    console.log(`[Notification Service] ✅ Finished notifying ${activeSubs.length} subscriber(s).`);
  } catch (error) {
    console.error('[Notification Service] Error notifying subscribers:', error.message);
  }
}
