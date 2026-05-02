import Link from 'next/link';
import SalesNavLink from '../components/SalesNavLink';

export const metadata = {
  title: 'Terms and Conditions - FLASHI | Pakistan\'s Smart Shopping Platform',
  description: 'Read the Terms and Conditions for using FLASHI — Pakistan\'s smart shopping and price comparison platform. Understand your rights and responsibilities when using our service.',
  keywords: 'flashi terms and conditions, flashi terms of service, flashi legal, flashi usage policy',
  robots: 'index, follow',
  openGraph: {
    title: 'Terms and Conditions - FLASHI',
    description: 'Terms and Conditions for using the FLASHI price comparison platform.',
    type: 'website',
    locale: 'en_PK',
    siteName: 'FLASHI',
  },
};

const LogoSVG = () => (
  <img src="/logo.png" alt="FLASHI" width="32" height="32" style={{ borderRadius: '6px', objectFit: 'cover' }} />
);

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing and using the FLASHI website (flashi.vercel.app) and its associated services, including our mobile application, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue use of our platform immediately.

These terms apply to all visitors, users, subscribers, and anyone who accesses or uses the FLASHI service. We reserve the right to update or modify these terms at any time without prior notice. Your continued use of the platform after any changes constitutes acceptance of the revised terms.`,
  },
  {
    id: 'services',
    title: '2. Description of Services',
    content: `FLASHI is a price comparison and smart shopping platform designed for Pakistani consumers. Our services include:

• **Price Comparison:** We aggregate product listings and pricing information from various online stores across Pakistan, including but not limited to Daraz, PriceOye, Mega.pk, Highfy, Limelight, Sapphire, and Stationers.pk.
• **Product Search:** Users can search for products by name or by pasting a product URL to find pricing across multiple stores.
• **Premium Subscription:** We offer a premium tier that provides access to exclusive sale alerts, special discounts, and additional features.
• **Blog & Content:** We publish educational articles, buying guides, and shopping tips on our blog to help users make informed purchasing decisions.
• **Mobile Application:** We provide an Android mobile application (APK) for convenient access to our services.

FLASHI does not sell products directly. We redirect users to third-party online stores where they can complete their purchases. We are not responsible for the products, services, or transactions conducted on third-party websites.`,
  },
  {
    id: 'accounts',
    title: '3. User Accounts',
    content: `To access certain features of FLASHI, you may be required to create a user account. When creating an account, you agree to:

• Provide accurate, current, and complete information during the registration process.
• Maintain and promptly update your account information to keep it accurate and complete.
• Maintain the security of your password and accept all risks of unauthorized access to your account.
• Immediately notify us if you discover or suspect any security breaches related to your account.

You are responsible for all activities that occur under your account. FLASHI reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent or abusive behavior.`,
  },
  {
    id: 'subscriptions',
    title: '4. Premium Subscriptions',
    content: `FLASHI offers a Premium subscription service with the following terms:

• **Pricing:** Subscription pricing is dynamic and may change based on the number of subscribers and promotional offers. The current price is displayed on our subscription page at the time of purchase.
• **Payment:** Payments for Premium subscriptions are processed manually through the methods described on our subscription page (e.g., JazzCash, Easypaisa, or bank transfer).
• **Activation:** Premium access is activated after payment verification by our team.
• **Refunds:** Subscription fees are generally non-refundable. Exceptions may be made at our sole discretion on a case-by-case basis.
• **Cancellation:** You may cancel your subscription at any time by contacting our support team. Access will continue until the end of your current billing period.

We reserve the right to modify subscription features, pricing, and terms at any time with reasonable notice to existing subscribers.`,
  },
  {
    id: 'intellectual-property',
    title: '5. Intellectual Property',
    content: `All content on the FLASHI platform, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, is the property of FLASHI or its content suppliers and is protected by applicable intellectual property laws.

• The FLASHI name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of FLASHI. You may not use such marks without our prior written permission.
• Product images, descriptions, and pricing information displayed on our platform are sourced from third-party stores and remain the property of their respective owners.
• Blog content and articles published on FLASHI are original works and may not be reproduced, distributed, or republished without our written consent.`,
  },
  {
    id: 'user-conduct',
    title: '6. User Conduct',
    content: `When using FLASHI, you agree not to:

• Use the platform for any unlawful purpose or in violation of any applicable laws or regulations.
• Attempt to interfere with, compromise the system integrity, or decipher any transmissions to or from the servers running our service.
• Use automated systems, bots, or scrapers to access the platform without our express written permission.
• Impersonate any person or entity, or falsely state or misrepresent your affiliation with a person or entity.
• Transmit any viruses, worms, defects, Trojan horses, or any items of a destructive nature through the platform.
• Harass, abuse, or harm other users of the platform.
• Use the service in a manner that could disable, overburden, damage, or impair the platform.`,
  },
  {
    id: 'pricing-disclaimer',
    title: '7. Price Comparison Disclaimer',
    content: `FLASHI strives to provide accurate and up-to-date pricing information. However, please note:

• **Accuracy:** Prices displayed on FLASHI are collected from third-party sources and may not always reflect the most current pricing. We recommend verifying the price on the merchant's website before making a purchase.
• **Availability:** Product availability is subject to the respective store's inventory. FLASHI does not guarantee that any product listed is currently in stock.
• **Currency:** All prices on FLASHI are displayed in Pakistani Rupees (PKR) unless otherwise stated.
• **Third-Party Transactions:** FLASHI is not a party to any transaction between you and a third-party store. Any issues related to product quality, delivery, returns, or refunds must be resolved directly with the respective store.
• **No Guarantee:** We do not guarantee that the prices shown are the lowest available prices in the market. Other sources not covered by our platform may offer different prices.`,
  },
  {
    id: 'third-party-links',
    title: '8. Third-Party Links & Advertisements',
    content: `The FLASHI platform contains links to third-party websites and may display advertisements from third-party ad networks. These links and advertisements are provided for your convenience and informational purposes only.

• We do not endorse, control, or assume responsibility for the content, privacy policies, or practices of any third-party websites or services.
• Your interactions with third-party websites, including any purchases or transactions, are solely between you and the third party.
• We are not responsible for any damage or loss caused or alleged to be caused by or in connection with the use of any third-party content, goods, or services.
• Advertisements displayed on FLASHI are served by third-party advertising networks. The display of an advertisement does not constitute endorsement of the advertiser or the product/service advertised.`,
  },
  {
    id: 'privacy',
    title: '9. Privacy & Data Protection',
    content: `Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.

By using FLASHI, you consent to the collection and use of information as described in our Privacy Policy. We encourage you to review our <a href="/privacy-policy">Privacy Policy</a> to understand our practices regarding your personal data.

We implement reasonable security measures to protect the information collected through our platform. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    id: 'limitation',
    title: '10. Limitation of Liability',
    content: `To the fullest extent permitted by applicable law:

• FLASHI provides its services on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied.
• FLASHI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses.
• Our total liability for any claims arising from or related to your use of the service shall not exceed the amount you paid to FLASHI (if any) during the twelve (12) months prior to the claim.
• FLASHI is not responsible for any losses or damages resulting from your reliance on pricing information, product descriptions, or any other content on the platform.`,
  },
  {
    id: 'indemnification',
    title: '11. Indemnification',
    content: `You agree to indemnify, defend, and hold harmless FLASHI, its founders, employees, and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, or expenses (including reasonable attorney's fees) arising from:

• Your use of and access to the FLASHI platform.
• Your violation of any term of these Terms and Conditions.
• Your violation of any third-party right, including any intellectual property, privacy, or proprietary right.
• Any claim that your use of the platform caused damage to a third party.`,
  },
  {
    id: 'termination',
    title: '12. Termination',
    content: `FLASHI reserves the right to suspend or terminate your access to the platform at any time, without prior notice, for conduct that we believe violates these Terms and Conditions or is harmful to other users, FLASHI, or third parties, or for any other reason at our sole discretion.

Upon termination, your right to use the service will immediately cease. If your account is terminated, we may delete any content or data associated with your account. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.`,
  },
  {
    id: 'governing-law',
    title: '13. Governing Law',
    content: `These Terms and Conditions shall be governed by and construed in accordance with the laws of Pakistan. Any disputes arising out of or relating to these terms or the FLASHI service shall be resolved through the courts of Pakistan.

By using FLASHI, you agree to submit to the personal jurisdiction of the courts located in Pakistan for the purpose of resolving any disputes.`,
  },
  {
    id: 'changes',
    title: '14. Changes to Terms',
    content: `We reserve the right to modify or replace these Terms and Conditions at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.

By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the platform.`,
  },
  {
    id: 'contact',
    title: '15. Contact Information',
    content: `If you have any questions about these Terms and Conditions, please contact us:

• **Website:** <a href="/contact">Contact Form</a>
• **Email:** flashideveloper@gmail.com
• **Platform:** FLASHI — flashi.vercel.app

We aim to respond to all inquiries within 24–48 hours during business days.`,
  },
];

export default function TermsAndConditionsPage() {
  return (
    <main>
      {/* Header */}
      <header className="header">
        <div className="container">
          <Link href="/" className="logo">
            <span className="logo-icon"><LogoSVG /></span>
            <span className="logo-text">FLASHI</span>
          </Link>
          <nav className="nav">
            <Link href="/" className="nav-link">Home</Link>
            <SalesNavLink className="nav-link" style={{ color: 'var(--primary)', fontWeight: 'bold' }} />
            <Link href="/blog" className="nav-link">Blog</Link>
            <Link href="/about" className="nav-link">About Us</Link>
            <Link href="/subscribe" className="nav-link" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Premium</Link>
            <Link href="/contact" className="nav-link contact-nav-link">Contact Us</Link>
          </nav>
          <Link href="/contact" className="contact-btn">Contact Us</Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, var(--bg-primary, #fff) 0%, var(--bg-secondary, #f8f9fa) 100%)',
        padding: '80px 0 60px',
        borderBottom: '1px solid var(--border-color, #eee)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="hero-badge" style={{ display: 'inline-block', marginBottom: '1rem' }}>📋 Legal</div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            marginBottom: '1.2rem',
            lineHeight: 1.15,
          }}>
            Terms \u0026 <span className="highlight-text">Conditions</span>
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary, #666)',
            maxWidth: '620px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Please read these terms carefully before using FLASHI. By using our platform, you agree to these terms.
          </p>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary, #999)',
            marginTop: '1rem',
          }}>
            Last Updated: May 2, 2026
          </p>
        </div>
      </section>

      {/* Quick Navigation */}
      <section style={{
        background: 'var(--bg-secondary, #f8f9fa)',
        padding: '30px 0',
        borderBottom: '1px solid var(--border-color, #eee)',
      }}>
        <div className="container">
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 700,
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-secondary, #666)',
          }}>
            Table of Contents
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '0.5rem',
          }}>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                style={{
                  display: 'block',
                  padding: '8px 14px',
                  color: 'var(--primary, #369632)',
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  borderRadius: '8px',
                  transition: 'background 0.2s',
                }}
              >
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section style={{ padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          {sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              style={{
                marginBottom: '3rem',
                scrollMarginTop: '100px',
              }}
            >
              <h2 style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                marginBottom: '1rem',
                color: 'var(--text-primary, #1a1a1a)',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--primary, #369632)',
                display: 'inline-block',
              }}>
                {section.title}
              </h2>
              <div
                style={{
                  color: 'var(--text-secondary, #555)',
                  lineHeight: 1.85,
                  fontSize: '1rem',
                  whiteSpace: 'pre-line',
                }}
                dangerouslySetInnerHTML={{ __html: section.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #369632 0%, #2d7a28 100%)',
        padding: '60px 0',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>
            Have Questions About Our Terms?
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
            We're here to help. Reach out to our team for clarification.
          </p>
          <Link href="/contact" style={{
            display: 'inline-block',
            background: '#fff',
            color: '#369632',
            padding: '14px 36px',
            borderRadius: '50px',
            fontWeight: 700,
            fontSize: '1rem',
            textDecoration: 'none',
          }}>
            Contact Us →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content" style={{ justifyContent: 'center' }}>
            <div className="footer-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div className="footer-logo-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="logo-icon"><LogoSVG /></span>
                <span className="logo-text">FLASHI</span>
              </div>
              <p className="footer-tagline" style={{ marginTop: '1rem' }}>Smarter price comparison for every shopper in Pakistan.</p>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/about" style={{ color: 'var(--text-secondary, #666)', textDecoration: 'none', fontSize: '0.9rem' }}>About Us</Link>
                <Link href="/blog" style={{ color: 'var(--text-secondary, #666)', textDecoration: 'none', fontSize: '0.9rem' }}>Blog</Link>
                <Link href="/contact" style={{ color: 'var(--text-secondary, #666)', textDecoration: 'none', fontSize: '0.9rem' }}>Contact Us</Link>
                <Link href="/privacy-policy" style={{ color: 'var(--text-secondary, #666)', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</Link>
                <Link href="/terms-and-conditions" style={{ color: 'var(--text-secondary, #666)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary, #369632)' }}>Terms & Conditions</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} FLASHI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
