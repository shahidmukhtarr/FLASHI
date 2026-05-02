'use client';

import { useState } from 'react';
import Link from 'next/link';
import SalesNavLink from '../components/SalesNavLink';

const LogoSVG = () => (
  <img src="/logo.png" alt="FLASHI" width="32" height="32" style={{ borderRadius: '6px', objectFit: 'cover' }} />
);

export default function ContactPage() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  function showToast(message, type = 'info') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  }

  async function handleContactSubmit(e) {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send message');
      showToast('Thank you! We\'ll get back to you within 24 hours.', 'success');
      setContactForm({ name: '', email: '', subject: 'General Inquiry', message: '' });
    } catch (error) {
      showToast(error.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      {toast && (
        <div id="toast-container">
          <div className={`toast ${toast.type}`}>{toast.message}</div>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="container">
          <Link href="/" className="logo">
            <span className="logo-icon"><LogoSVG /></span>
            <span className="logo-text">FLASHI</span>
          </Link>
          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <Link href="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
            <SalesNavLink className="nav-link" onClick={() => setMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'bold' }} />
            <Link href="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About Us</Link>
            <Link href="/subscribe" className="nav-link" onClick={() => setMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Premium</Link>
            <Link href="/contact" className="nav-link contact-nav-link" onClick={() => setMenuOpen(false)}>Contact Us</Link>
          </nav>
          <Link href="/contact" className="contact-btn">Contact Us</Link>
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
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
          <div className="hero-badge" style={{ display: 'inline-block', marginBottom: '1rem' }}>Get In Touch</div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            marginBottom: '1.2rem',
            lineHeight: 1.15,
          }}>
            Contact <span className="highlight-text">FLASHI</span>
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary, #666)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Have a question, suggestion, or want to report a bug? We'd love to hear from you. Our team typically responds within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-section" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="container">
          <div className="contact-layout">
            {/* Info Side */}
            <div className="contact-info-plus">
              <div className="hero-badge" style={{ display: 'inline-block' }}>We're here</div>
              <h2 className="section-title" style={{ textAlign: 'left', margin: '1rem 0 var(--spacing-md) 0' }}>
                We'd love to hear <span className="highlight-text">your feedback</span>
              </h2>
              <p className="contact-desc">
                Whether you want to suggest a new store, report a pricing issue, or just say hello — we're all ears. FLASHI is built for Pakistani shoppers and your feedback directly shapes what we build next.
              </p>
              <div className="contact-features">
                <div className="contact-feature">
                  <div className="cf-icon">📮</div>
                  <div className="cf-text">
                    <h3>Direct Feedback</h3>
                    <p>Your suggestions help us improve FLASHI every day.</p>
                  </div>
                </div>
                <div className="contact-feature">
                  <div className="cf-icon">⚡</div>
                  <div className="cf-text">
                    <h3>Fast Response</h3>
                    <p>We typically reply within 24 hours of receiving your message.</p>
                  </div>
                </div>
                <div className="contact-feature">
                  <div className="cf-icon">🛒</div>
                  <div className="cf-text">
                    <h3>Store Suggestions</h3>
                    <p>Know a great Pakistani store we should cover? Let us know!</p>
                  </div>
                </div>
                <div className="contact-feature">
                  <div className="cf-icon">🤝</div>
                  <div className="cf-text">
                    <h3>Partnerships</h3>
                    <p>Interested in partnering with FLASHI? We'd love to connect.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="contact-form-container">
              <form className="contact-form" onSubmit={handleContactSubmit} id="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact-name">Your Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Ahmed Khan"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-email">Email Address</label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="ahmed@gmail.com"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="contact-subject">Subject</label>
                  <select
                    id="contact-subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  >
                    <option>General Inquiry</option>
                    <option>Store Suggestion</option>
                    <option>Bug Report</option>
                    <option>Feedback</option>
                    <option>Partnership</option>
                    <option>Services</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    rows="5"
                    placeholder="Tell us what's on your mind..."
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  ></textarea>
                </div>
                <button className="submit-btn" type="submit" id="contact-submit" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Strip */}
      <section style={{
        background: 'var(--bg-secondary, #f8f9fa)',
        padding: '70px 0',
        borderTop: '1px solid var(--border-color, #eee)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">Frequently Asked <span className="highlight-text">Questions</span></h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '3rem',
            textAlign: 'left',
          }}>
            {[
              { q: 'Is FLASHI free to use?', a: 'Yes! FLASHI is completely free for all shoppers. We never charge you to compare prices.' },
              { q: 'How often are prices updated?', a: 'Prices are refreshed in real time whenever you search. Our live scraper fetches the latest data directly from each store.' },
              { q: 'Can I suggest a new store?', a: 'Absolutely! Use the contact form above, select "Store Suggestion", and tell us which store you want added.' },
              { q: 'Do you store my personal data?', a: 'We don\'t require accounts. Anonymous search queries may be cached temporarily for performance. Read our Privacy Policy for full details.' },
            ].map((faq) => (
              <div key={faq.q} className="step-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-primary, #111)' }}>{faq.q}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary, #666)', fontSize: '0.95rem', lineHeight: 1.65 }}>{faq.a}</p>
              </div>
            ))}
          </div>
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
                <Link href="/terms-and-conditions" style={{ color: 'var(--text-secondary, #666)', textDecoration: 'none', fontSize: '0.9rem' }}>Terms & Conditions</Link>
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
