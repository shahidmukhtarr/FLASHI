import Link from 'next/link';
import SalesNavLink from '../components/SalesNavLink';

export const metadata = {
  title: 'About Us - FLASHI | Pakistan\'s Price Comparison Engine',
  description: 'Learn about FLASHI — Pakistan\'s smartest price comparison platform. We help millions of Pakistani shoppers find the best deals across top stores like Daraz, PriceOye, Mega.pk, and more.',
  keywords: 'about flashi, flashi pakistan, price comparison pakistan, flashi team, about us, flashi about',
  robots: 'index, follow',
  openGraph: {
    title: 'About Us - FLASHI | Pakistan\'s Price Comparison Engine',
    description: 'Learn about FLASHI — Pakistan\'s smartest price comparison platform.',
    type: 'website',
    locale: 'en_PK',
    siteName: 'FLASHI',
  },
};

const LogoSVG = () => (
  <img src="/logo.png" alt="FLASHI" width="32" height="32" style={{ borderRadius: '6px', objectFit: 'cover' }} />
);

export default function AboutPage() {
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
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="hero-badge" style={{ display: 'inline-block', marginBottom: '1rem' }}>Our Story</div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            marginBottom: '1.2rem',
            lineHeight: 1.15,
          }}>
            About <span className="highlight-text">FLASHI</span>
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary, #666)',
            maxWidth: '620px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Pakistan's smartest price comparison engine — built to help every shopper make better, faster, smarter buying decisions.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
          }}>
            <div>
              <div className="hero-badge" style={{ display: 'inline-block', marginBottom: '1rem' }}>Our Mission</div>
              <h2 className="section-title" style={{ textAlign: 'left', margin: '0 0 1.2rem 0' }}>
                Smarter Shopping for <span className="highlight-text">Every Pakistani</span>
              </h2>
              <p style={{ color: 'var(--text-secondary, #666)', lineHeight: 1.8, marginBottom: '1rem', fontSize: '1.05rem' }}>
                FLASHI was born from a simple frustration — spending hours jumping between websites trying to find the best price for a product, only to regret not having checked one more store.
              </p>
              <p style={{ color: 'var(--text-secondary, #666)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                We built FLASHI to solve that. Our engine scans Pakistan's leading e-commerce platforms in real time, aggregates pricing data, and presents it all in one clean, fast interface — so you never overpay again.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Stores We Cover */}
      <section style={{
        background: 'var(--bg-secondary, #f8f9fa)',
        padding: '80px 0',
        borderTop: '1px solid var(--border-color, #eee)',
        borderBottom: '1px solid var(--border-color, #eee)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="hero-badge" style={{ display: 'inline-block', marginBottom: '1rem' }}>Coverage</div>
          <h2 className="section-title">Stores We <span className="highlight-text">Compare</span></h2>
          <p style={{ color: 'var(--text-secondary, #666)', marginBottom: '3rem', fontSize: '1.05rem' }}>
            We aggregate prices from Pakistan's most trusted online stores.
          </p>
          <div className="trust-logos" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            {['daraz.pk', 'priceoye.pk', 'mega.pk', 'highfy.pk'].map((domain) => (
              <div key={domain} className="trust-logo-card">
                <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`} alt={domain} className="brand-logo-img" />
                <span className="brand-logo-name">{domain.replace('.pk', '').charAt(0).toUpperCase() + domain.replace('.pk', '').slice(1)}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '2rem', color: 'var(--text-secondary, #666)', fontSize: '0.95rem' }}>
            More stores are being added continuously. <Link href="/contact" style={{ color: 'var(--primary, #369632)', textDecoration: 'none', fontWeight: 600 }}>Suggest a store →</Link>
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="hero-badge" style={{ display: 'inline-block', marginBottom: '1rem' }}>Our Values</div>
          <h2 className="section-title">What We <span className="highlight-text">Stand For</span></h2>
          <div className="steps-grid" style={{ marginTop: '3rem' }}>
            {[
              { num: '01', icon: '🎯', title: 'Accuracy First', desc: 'We strive for the most accurate, up-to-date pricing information possible, refreshing data continuously.' },
              { num: '02', icon: '🛡️', title: 'User Privacy', desc: 'Your searches are your business. We don\'t track or profile you for advertising targeting.' },
              { num: '03', icon: '🚀', title: 'Speed & Simplicity', desc: 'Our interface is designed to get you to the right answer as fast as possible — no clutter, no confusion.' },
            ].map((item) => (
              <div key={item.num} className="step-card" style={{ textAlign: 'left' }}>
                <div className="step-number">{item.num}</div>
                <div className="step-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #369632 0%, #2d7a28 100%)',
        padding: '70px 0',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>
            Ready to save on your next purchase?
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
            Search any product and compare prices across Pakistan's top stores — instantly.
          </p>
          <Link href="/" style={{
            display: 'inline-block',
            background: '#fff',
            color: '#369632',
            padding: '14px 36px',
            borderRadius: '50px',
            fontWeight: 700,
            fontSize: '1rem',
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}>
            Start Comparing →
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
