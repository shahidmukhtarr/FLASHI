import { getSupabaseClient } from './db.js';

import nodemailer from 'nodemailer';

// Global transporter for Ethereal email
let testAccount = null;
let transporter = null;

async function getTransporter() {
  if (!transporter) {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log('[Notification Service] Using configured SMTP server...');
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.log('[Notification Service] No SMTP configured. Creating Ethereal test account...');
      try {
        testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (err) {
        console.error('[Notification Service] Could not create Ethereal account. Using dummy transport.', err);
        // Fallback dummy transporter to prevent crashes
        transporter = nodemailer.createTransport({
            streamTransport: true,
            newline: 'windows',
            logger: false
        });
      }
    }
  }
  return transporter;
}

/**
 * Sends an email notification using Nodemailer
 */
async function sendEmailNotification(email, name, subject, message) {
  try {
    const mailTransporter = await getTransporter();
    
    const info = await mailTransporter.sendMail({
      from: '"FLASHI Premium" <no-reply@flashi.pk>',
      to: email,
      subject: subject,
      text: message,
    });

    console.log(`[Notification Service] 📧 Email sent to ${name} (${email})`);
    console.log(`[Notification Service] 🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return true;
  } catch (error) {
    console.error(`[Notification Service] Failed to send email to ${email}:`, error.message);
    return false;
  }
}

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

    console.log(`[Notification Service] Found ${activeSubs.length} active subscribers to notify.`);

    for (const sub of activeSubs) {
      let subject = '';
      let message = '';
      let smsMessage = '';

      if (type === 'price_drop') {
        subject = `FLASHI Alert: Price Drop on ${data.query}!`;
        message = `Hi ${sub.name || 'Subscriber'},\n\nWe found new price drops for your watched item: "${data.query}".\n\nCheckout FLASHI now to grab the deal before it expires!`;
        smsMessage = `FLASHI Alert: Huge price drop spotted for ${data.query}! Visit FLASHI now to check it out.`;
      } else if (type === 'special_sale') {
        subject = `FLASHI Exclusive: Massive Sale at ${data.storeName}!`;
        message = `Hi ${sub.name || 'Subscriber'},\n\n${data.storeName} just launched a massive sale! Up to 50% off on premium items.\n\nVisit our Special Discounts page to view the products directly:\nhttps://flashi.pk/special-discounts`;
        smsMessage = `FLASHI Exclusive: Massive Sale at ${data.storeName}! Check it out now on the Special Discounts page.`;
      } else {
        subject = 'FLASHI Premium Update';
        message = `Hi ${sub.name || 'Subscriber'},\n\nWe have some new updates and deals for you. Check out FLASHI!`;
        smsMessage = `FLASHI Premium Update: New deals are waiting for you!`;
      }

      // Send the notifications
      if (sub.email) await sendEmailNotification(sub.email, sub.name, subject, message);
      if (sub.phone) await sendSmsNotification(sub.phone, sub.name, smsMessage);
    }
  } catch (error) {
    console.error('[Notification Service] Error notifying subscribers:', error.message);
  }
}
