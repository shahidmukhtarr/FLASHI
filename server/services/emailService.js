import nodemailer from 'nodemailer';

// ─── Shared Transporter (singleton) ────────────────────────────────────────────

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('[EmailService] Using configured SMTP server…');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    console.log('[EmailService] No SMTP configured. Creating Ethereal test account…');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    } catch (err) {
      console.error('[EmailService] Ethereal fallback failed, using stream transport.', err);
      transporter = nodemailer.createTransport({ streamTransport: true, newline: 'windows', logger: false });
    }
  }

  return transporter;
}

// ─── Helper: Send Mail ─────────────────────────────────────────────────────────

async function sendMail({ to, subject, html, text }) {
  try {
    const mail = await getTransporter();
    const info = await mail.sendMail({
      from: '"FLASHI" <no-reply@flashi.pk>',
      to,
      subject,
      html,
      text,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[EmailService] ✉️  Sent "${subject}" → ${to}`);
    if (previewUrl) console.log(`[EmailService] 🔗 Preview: ${previewUrl}`);
    return { success: true, previewUrl: previewUrl || null };
  } catch (error) {
    console.error(`[EmailService] ❌ Failed to send "${subject}" → ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

// ─── Base Layout ────────────────────────────────────────────────────────────────

function baseLayout(title, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#e0e0e6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f14;padding:30px 10px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#1a1a24;border-radius:16px;overflow:hidden;border:1px solid rgba(139,92,246,0.15);">
      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#6d28d9 0%,#8b5cf6 60%,#a78bfa 100%);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:2px;color:#fff;">⚡ FLASHI</h1>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:1px;">Pakistan's Smartest Price Comparison</p>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:36px 40px 28px;">
          ${bodyContent}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="padding:20px 40px 28px;border-top:1px solid rgba(139,92,246,0.12);text-align:center;">
          <p style="margin:0 0 8px;font-size:12px;color:#666;">© ${new Date().getFullYear()} FLASHI — <a href="https://www.flashi.pk" style="color:#8b5cf6;text-decoration:none;">www.flashi.pk</a></p>
          <p style="margin:0;font-size:11px;color:#555;">This is an automated message. Please do not reply to this email.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Reusable button ────────────────────────────────────────────────────────────

function ctaButton(label, href) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
  <tr><td style="background:linear-gradient(135deg,#6d28d9,#8b5cf6);border-radius:10px;padding:14px 36px;">
    <a href="${href}" style="color:#fff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:0.5px;">${label}</a>
  </td></tr>
</table>`;
}

// ─── 1. Welcome / Registration Email ────────────────────────────────────────────

export async function sendWelcomeEmail(email, name) {
  const firstName = (name || 'there').split(' ')[0];

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#fff;">Welcome to FLASHI, ${firstName}! 🎉</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#a0a0b0;line-height:1.7;">
      Your account has been created successfully. You're now part of Pakistan's smartest shopping community.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12121a;border-radius:12px;border:1px solid rgba(139,92,246,0.1);margin-bottom:24px;">
      <tr><td style="padding:24px;">
        <h3 style="margin:0 0 16px;font-size:16px;color:#8b5cf6;">Here's what you can do now:</h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#c0c0d0;">🔍</td>
            <td style="padding:8px 12px;font-size:14px;color:#c0c0d0;">Compare prices across Daraz, PriceOye, Mega.pk & more</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#c0c0d0;">🏷️</td>
            <td style="padding:8px 12px;font-size:14px;color:#c0c0d0;">Browse exclusive sales from top brands</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#c0c0d0;">⭐</td>
            <td style="padding:8px 12px;font-size:14px;color:#c0c0d0;">Upgrade to <strong style="color:#a78bfa;">Premium</strong> for real-time deal alerts</td>
          </tr>
        </table>
      </td></tr>
    </table>

    ${ctaButton('Start Shopping →', 'https://www.flashi.pk')}
  `;

  const text = `Welcome to FLASHI, ${firstName}!\n\nYour account has been created successfully.\n\nStart comparing prices at https://www.flashi.pk`;

  return sendMail({
    to: email,
    subject: `Welcome to FLASHI, ${firstName}! 🎉`,
    html: baseLayout('Welcome to FLASHI', body),
    text,
  });
}

// ─── 2. Subscription Request Submitted ──────────────────────────────────────────

export async function sendSubscriptionRequestEmail(email, name, phone, paymentRef) {
  const firstName = (name || 'there').split(' ')[0];

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#fff;">Subscription Request Received ⏳</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#a0a0b0;line-height:1.7;">
      Hi ${firstName}, we've received your FLASHI Premium subscription request. Our team will verify your payment shortly.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12121a;border-radius:12px;border:1px solid rgba(139,92,246,0.1);margin-bottom:24px;">
      <tr><td style="padding:24px;">
        <h3 style="margin:0 0 16px;font-size:16px;color:#8b5cf6;">Request Details</h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#888;width:140px;">Name</td>
            <td style="padding:6px 0;font-size:14px;color:#e0e0e6;font-weight:600;">${name}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#888;">Email</td>
            <td style="padding:6px 0;font-size:14px;color:#e0e0e6;font-weight:600;">${email}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#888;">Phone / WhatsApp</td>
            <td style="padding:6px 0;font-size:14px;color:#e0e0e6;font-weight:600;">${phone}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#888;">Payment Ref</td>
            <td style="padding:6px 0;font-size:14px;color:#e0e0e6;font-weight:600;">${paymentRef || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#888;">Plan</td>
            <td style="padding:6px 0;font-size:14px;color:#a78bfa;font-weight:700;">Premium — Rs. 500/month</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#888;">Status</td>
            <td style="padding:6px 0;">
              <span style="display:inline-block;background:#422006;color:#fbbf24;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:0.5px;">⏳ Pending Verification</span>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <p style="margin:0 0 8px;font-size:14px;color:#a0a0b0;line-height:1.6;">
      ⏱️ Your subscription will be activated within <strong style="color:#fff;">24 hours</strong> after payment verification.
    </p>
    <p style="margin:0;font-size:13px;color:#666;">
      Need help? Contact us at <a href="mailto:support@flashi.pk" style="color:#8b5cf6;text-decoration:none;">support@flashi.pk</a>
    </p>
  `;

  const text = `Hi ${firstName},\n\nWe've received your FLASHI Premium subscription request.\n\nPlan: Premium — Rs. 500/month\nStatus: Pending Verification\n\nYour subscription will be activated within 24 hours after payment verification.\n\nThank you!\n— FLASHI Team`;

  return sendMail({
    to: email,
    subject: `FLASHI Premium — Subscription Request Received ⏳`,
    html: baseLayout('Subscription Request Received', body),
    text,
  });
}

// ─── 3. Subscription Activated ──────────────────────────────────────────────────

export async function sendSubscriptionActiveEmail(email, name, expiresAt) {
  const firstName = (name || 'there').split(' ')[0];
  const expiryDate = expiresAt ? new Date(expiresAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#fff;">Your Premium is Active! ✨</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#a0a0b0;line-height:1.7;">
      Congratulations ${firstName}! Your FLASHI Premium subscription has been verified and activated.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,rgba(109,40,217,0.15),rgba(139,92,246,0.08));border-radius:12px;border:1px solid rgba(139,92,246,0.2);margin-bottom:24px;">
      <tr><td style="padding:24px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">🎖️</div>
        <h3 style="margin:0 0 4px;font-size:18px;color:#a78bfa;font-weight:700;">FLASHI Premium Member</h3>
        <p style="margin:0;font-size:13px;color:#888;">Valid until ${expiryDate}</p>
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12121a;border-radius:12px;border:1px solid rgba(139,92,246,0.1);margin-bottom:24px;">
      <tr><td style="padding:24px;">
        <h3 style="margin:0 0 16px;font-size:16px;color:#8b5cf6;">Your Premium Benefits:</h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#c0c0d0;">🔔</td>
            <td style="padding:8px 12px;font-size:14px;color:#c0c0d0;">Instant price drop notifications</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#c0c0d0;">🏷️</td>
            <td style="padding:8px 12px;font-size:14px;color:#c0c0d0;">Flash sale alerts from Limelight & Sapphire</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#c0c0d0;">🚀</td>
            <td style="padding:8px 12px;font-size:14px;color:#c0c0d0;">Early access to exclusive deals</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#c0c0d0;">📱</td>
            <td style="padding:8px 12px;font-size:14px;color:#c0c0d0;">WhatsApp & email deal alerts</td>
          </tr>
        </table>
      </td></tr>
    </table>

    ${ctaButton('Explore Deals Now →', 'https://www.flashi.pk/special-discounts')}
  `;

  const text = `Congratulations ${firstName}!\n\nYour FLASHI Premium subscription is now active.\nValid until: ${expiryDate}\n\nEnjoy instant price drop notifications, flash sale alerts, and early access to exclusive deals!\n\nExplore deals: https://www.flashi.pk/special-discounts\n\n— FLASHI Team`;

  return sendMail({
    to: email,
    subject: `🎉 Your FLASHI Premium is Now Active!`,
    html: baseLayout('Premium Activated', body),
    text,
  });
}
