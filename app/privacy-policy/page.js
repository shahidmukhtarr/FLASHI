import Link from 'next/link';
import SalesNavLink from '../components/SalesNavLink';

export const metadata = {
  title: 'Privacy Policy - FLASHI | Your Privacy Matters',
  description: 'Read the FLASHI Privacy Policy. Learn how we collect, use, and protect your information when you use our price comparison service in Pakistan.',
  keywords: 'flashi privacy policy, flashi data protection, flashi privacy, price comparison privacy',
  robots: 'index, follow',
  openGraph: {
    title: 'Privacy Policy - FLASHI | Your Privacy Matters',
    description: 'Read the FLASHI Privacy Policy. Learn how we collect, use, and protect your information.',
    type: 'website',
    locale: 'en_PK',
    siteName: 'FLASHI',
  },
};

const LogoSVG = () => (
  <img src="/logo.png" alt="FLASHI" width="32" height="32" style={{ borderRadius: '6px', objectFit: 'cover' }} />
);

const lastUpdated = 'April 22, 2026';

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `Welcome to FLASHI ("we," "our," or "us"). FLASHI is a price comparison platform that aggregates publicly available product pricing data from various Pakistani e-commerce stores to help consumers make informed purchasing decisions.

This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website flashi.pk (the "Site"). Please read this Privacy Policy carefully. By using the Site, you agree to the collection and use of information in accordance with this policy.`,
  },
  {
    id: 'information-we-collect',
    title: '2. Information We Collect',
    content: null,
    subsections: [
      {
        title: '2.1 Information You Provide',
        items: [
          'Contact form submissions: name, email address, subject, and message content when you voluntarily fill out our contact form.',
          'We do not require you to create an account or register to use FLASHI.',
        ],
      },
      {
        title: '2.2 Automatically Collected Information',
        items: [
          'Search queries: the product names or URLs you search for on the Site.',
          'Usage data: pages visited, time spent on pages, referring URLs, and interaction patterns.',
          'Device information: browser type and version, operating system, device type.',
          'IP address and approximate geographic location.',
          'Cookies and similar tracking technologies (see Section 5).',
        ],
      },
      {
        title: '2.3 Information from Third Parties',
        items: [
          'We aggregate publicly available product data (names, prices, images, stock status, and URLs) from third-party e-commerce websites including but not limited to Daraz, PriceOye, Mega.pk, and Highfy.',
          'This data relates to products, not to individual users.',
        ],
      },
    ],
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    items: [
      'To operate and maintain the price comparison service.',
      'To respond to your inquiries and contact form submissions.',
      'To improve our Site, features, and user experience.',
      'To analyze usage patterns and optimize performance.',
      'To detect, prevent, and address technical issues or abuse.',
      'To comply with legal obligations.',
    ],
  },
  {
    id: 'advertising',
    title: '4. Advertising & Third-Party Services',
    content: `We use Google AdSense to display advertisements on our Site. Google AdSense may use cookies and web beacons to serve ads based on your prior visits to our Site or other websites on the Internet.

Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our Site and/or other sites on the Internet. You may opt out of personalized advertising by visiting Google's Ads Settings (https://adssettings.google.com).

For more information about how Google collects and processes data, please visit Google's Privacy & Terms page (https://policies.google.com/technologies/partner-sites).`,
  },
  {
    id: 'cookies',
    title: '5. Cookies & Tracking Technologies',
    content: `We use cookies and similar tracking technologies to track activity on our Site and hold certain information.

Types of cookies we use:`,
    items: [
      'Essential cookies: Required for the operation of the Site, such as session management.',
      'Analytics cookies: Help us understand how visitors interact with the Site by collecting and reporting information anonymously.',
      'Advertising cookies: Used by Google AdSense to serve relevant advertisements. These cookies track your browsing habits to deliver ads tailored to your interests.',
    ],
    postContent: 'You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, some features of the Site may not function properly without cookies.',
  },
  {
    id: 'data-sharing',
    title: '6. Data Sharing & Disclosure',
    content: 'We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information with our business partners and advertisers.',
    items: [
      'With service providers who assist in operating our Site (hosting, analytics).',
      'With Google AdSense for the purpose of serving advertisements.',
      'When required by law or to protect our rights.',
      'In connection with a merger, acquisition, or sale of assets (you would be notified).',
    ],
  },
  {
    id: 'data-security',
    title: '7. Data Security',
    content: `We adopt appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information stored on our Site.

However, please be aware that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.`,
  },
  {
    id: 'data-retention',
    title: '8. Data Retention',
    items: [
      'Contact form data is retained only as long as necessary to respond to your inquiry and for internal record-keeping.',
      'Search query data may be cached temporarily for performance optimization and is not linked to personal identifiers.',
      'Analytics data is retained in accordance with our analytics provider\'s retention policies.',
    ],
  },
  {
    id: 'your-rights',
    title: '9. Your Rights',
    content: 'You have the following rights regarding your personal data:',
    items: [
      'Right to access: You may request a copy of the personal information we hold about you.',
      'Right to correction: You may request that we correct any inaccurate personal data.',
      'Right to deletion: You may request that we delete your personal data where there is no compelling reason for its continued processing.',
      'Right to opt-out: You may opt out of personalized advertising through Google\'s Ads Settings.',
    ],
    postContent: 'To exercise any of these rights, please contact us using the information provided below.',
  },
  {
    id: 'children',
    title: '10. Children\'s Privacy',
    content: 'Our Site is not intended for children under the age of 13. We do not knowingly collect personal identification information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us so that we can take necessary actions.',
  },
  {
    id: 'external-links',
    title: '11. Links to External Sites',
    content: 'Our Site contains links to external e-commerce websites (stores). These links are provided for your convenience to help you find and purchase products at the best prices. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to review the privacy policy of every site you visit.',
  },
  {
    id: 'changes',
    title: '12. Changes to This Privacy Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this page.

You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.`,
  },
  {
    id: 'contact',
    title: '13. Contact Us',
    content: 'If you have any questions about this Privacy Policy, please contact us:',
    items: [
      'Through our Contact Form: Visit the Contact Us page on our website.',
      'Website: flashi.pk',
    ],
  },
];

export default function PrivacyPolicyPage() {
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
        textAlign: 'center',
      }}>
        <div className="container">
          <div className="hero-badge" style={{ display: 'inline-block', marginBottom: '1rem' }}>Legal</div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            marginBottom: '1.2rem',
            lineHeight: 1.15,
          }}>
            Privacy <span className="highlight-text">Policy</span>
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary, #666)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Your privacy is important to us. This policy outlines how FLASHI collects, uses, and protects your information.
          </p>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary, #999)',
            marginTop: '1.5rem',
            fontWeight: 500,
          }}>
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Table of Contents */}
      <section style={{ padding: '50px 0 0' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <div style={{
            background: 'var(--bg-secondary, #f8f9fa)',
            border: '1px solid var(--border-color, #eee)',
            borderRadius: '16px',
            padding: '2rem',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary, #111)' }}>
              📑 Table of Contents
            </h2>
            <nav style={{ columns: 2, columnGap: '2rem' }}>
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  style={{
                    display: 'block',
                    color: 'var(--primary, #369632)',
                    textDecoration: 'none',
                    padding: '4px 0',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    breakInside: 'avoid',
                  }}
                >
                  {sec.title}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section style={{ padding: '50px 0 80px' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          {sections.map((sec) => (
            <article key={sec.id} id={sec.id} style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                marginBottom: '1rem',
                color: 'var(--text-primary, #111)',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--border-color, #eee)',
              }}>
                {sec.title}
              </h2>

              {sec.content && (
                <div style={{ color: 'var(--text-secondary, #444)', lineHeight: 1.85, fontSize: '1rem', whiteSpace: 'pre-line', marginBottom: sec.items || sec.subsections ? '1rem' : 0 }}>
                  {sec.content}
                </div>
              )}

              {sec.subsections && sec.subsections.map((sub) => (
                <div key={sub.title} style={{ marginBottom: '1.2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary, #222)' }}>
                    {sub.title}
                  </h3>
                  <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary, #444)', lineHeight: 1.85 }}>
                    {sub.items.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '0.4rem' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}

              {sec.items && !sec.subsections && (
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary, #444)', lineHeight: 1.85 }}>
                  {sec.items.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '0.4rem' }}>{item}</li>
                  ))}
                </ul>
              )}

              {sec.postContent && (
                <p style={{ color: 'var(--text-secondary, #444)', lineHeight: 1.85, marginTop: '1rem' }}>
                  {sec.postContent}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #369632 0%, #2d7a28 100%)',
        padding: '60px 0',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>
            Questions about our privacy practices?
          </h2>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, marginBottom: '2rem' }}>
            We're happy to answer any questions you may have.
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
                <Link href="/contact" style={{ color: 'var(--text-secondary, #666)', textDecoration: 'none', fontSize: '0.9rem' }}>Contact Us</Link>
                <Link href="/privacy-policy" style={{ color: 'var(--text-secondary, #666)', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</Link>
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
