'use client';

import { useState, useEffect } from 'react';

export default function SubscribePage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', paymentRef: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: '', email: '' });
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('flashi_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setFormData(prev => ({
          ...prev,
          name: prev.name || parsed.full_name || '',
          email: prev.email || parsed.email || ''
        }));
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
  }, []);

  async function handleLoginSubmit(e) {
    e.preventDefault();
    if (!loginForm.name || !loginForm.email) return;
    
    setLoginLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      
      if (data.success) {
        const userData = { full_name: loginForm.name, email: loginForm.email };
        setUser(userData);
        localStorage.setItem('flashi_user', JSON.stringify(userData));
        setFormData(prev => ({ ...prev, name: userData.full_name, email: userData.email }));
        setShowLoginModal(false);
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoginLoading(false);
    }
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem('flashi_user');
    setFormData(prev => ({ ...prev, name: '', email: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ type: 'success', message: data.message });
        setFormData({ name: '', email: '', phone: '', paymentRef: '' });
      } else {
        setResult({ type: 'error', message: data.error || 'Something went wrong' });
      }
    } catch {
      setResult({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <header className="header">
        <div className="container">
          <a href="/" className="logo">
            <span className="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="30" height="30">
                <path d="M 5 35 L 35 35 L 30 39 L 5 39 Z" fill="#222"/>
                <path d="M 12 50 L 42 50 L 35 54 L 12 54 Z" fill="#222"/>
                <path d="M 18 65 L 35 65 L 30 69 L 18 69 Z" fill="#222"/>
                <path d="M 35 20 L 60 20 L 50 40 L 75 40 Q 82 40 80 50 L 70 70 L 40 70 Q 35 70 38 60 L 45 40 L 35 40 Z" fill="#369632"/>
                <circle cx="48" cy="80" r="7" fill="#222"/>
                <circle cx="48" cy="80" r="3" fill="#fff"/>
                <circle cx="68" cy="80" r="7" fill="#222"/>
                <circle cx="68" cy="80" r="3" fill="#fff"/>
              </svg>
            </span>
            <span className="logo-text">FLASHI</span>
          </a>
          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <a href="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#how-it-works" className="nav-link" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="/subscribe" className="nav-link" onClick={() => setMenuOpen(false)} style={{color: 'var(--primary)', fontWeight: 'bold'}}>Premium</a>
            <a href="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About Us</a>
            <a href="/contact" className="nav-link contact-nav-link" onClick={() => setMenuOpen(false)}>Contact Us</a>
          </nav>

          <div className="header-actions">
            <a href="/contact" className="contact-btn">Contact Us</a>
          </div>
          <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="sub-hero">
        <div className="container">
          <div className="sub-hero-badge">✨ FLASHI Premium</div>
          <h1 className="sub-hero-title">
            Never Miss a <span className="sub-highlight">Deal</span> Again
          </h1>
          <p className="sub-hero-subtitle">
            Get exclusive price drop alerts, sale notifications from Limelight & Sapphire, 
            and early access to the best deals across all stores — delivered straight to you.
          </p>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="sub-pricing">
        <div className="container">
          <div className="sub-pricing-card">
            <div className="sub-pricing-header">
              <div className="sub-plan-badge">Most Popular</div>
              <h2 className="sub-plan-name">Premium Plan</h2>
              <div className="sub-price-wrap">
                <span className="sub-price-amount">Rs. 500</span>
                <span className="sub-price-period">/month</span>
              </div>
              <p className="sub-price-note">Simple bank transfer — no credit card needed</p>
            </div>
            
            <div className="sub-features-list">
              <div className="sub-feature-item">
                <span className="sub-feature-icon">🔔</span>
                <div>
                  <strong>Price Drop Notifications</strong>
                  <p>Get instant alerts when products you're watching drop in price across all stores</p>
                </div>
              </div>
              <div className="sub-feature-item">
                <span className="sub-feature-icon">🏷️</span>
                <div>
                  <strong>Limelight & Sapphire Sale Alerts</strong>
                  <p>Be the first to know about flash sales, clearance events, and new collection launches</p>
                </div>
              </div>
              <div className="sub-feature-item">
                <span className="sub-feature-icon">📊</span>
                <div>
                  <strong>Exclusive Deals & Discounts</strong>
                  <p>Curated deals from Daraz, PriceOye, Mega.pk, Shophive, Naheed, Highfy & more</p>
                </div>
              </div>
              <div className="sub-feature-item">
                <span className="sub-feature-icon">⚡</span>
                <div>
                  <strong>Early Access</strong>
                  <p>Get notified about deals before they go live — shop first, save more</p>
                </div>
              </div>
              <div className="sub-feature-item">
                <span className="sub-feature-icon">📱</span>
                <div>
                  <strong>WhatsApp/Email Updates</strong>
                  <p>Choose how you want to receive your deal alerts — WhatsApp, email, or both</p>
                </div>
              </div>
              <div className="sub-feature-item">
                <span className="sub-feature-icon">🛡️</span>
                <div>
                  <strong>Priority Support</strong>
                  <p>Get dedicated support and product tracking requests handled first</p>
                </div>
              </div>
            </div>

            <button 
              className="sub-cta-btn" 
              onClick={() => setShowPayment(true)}
              type="button"
            >
              Subscribe Now — Rs. 500/month
            </button>
          </div>
        </div>
      </section>

      {/* Payment & Subscription Form */}
      {showPayment && (
        <section className="sub-payment" id="payment">
          <div className="container">
            <div className="sub-payment-layout">
              {/* Bank Details */}
              <div className="sub-bank-details">
                <h3>💳 Payment Details</h3>
                <p className="sub-bank-note">Transfer Rs. 500 to the following account, then fill the form with your transaction details.</p>
                
                <div className="sub-bank-card">
                  <div className="sub-bank-logo">🏛️</div>
                  <div className="sub-bank-info">
                    <strong>UBL</strong>
                    <span className="sub-bank-number">XXXX-XXXXXXXXXXX</span>
                    <span className="sub-bank-holder">FLASHI Premium</span>
                  </div>
                  <button className="sub-copy-btn" onClick={() => {navigator.clipboard.writeText('XXXXXXXXXXXXXXX'); }} type="button">Copy</button>
                </div>

                <div className="sub-bank-steps">
                  <h4>How it works:</h4>
                  <ol>
                    <li>Transfer <strong>Rs. 500</strong> to the account above</li>
                    <li>Note down your <strong>Transaction ID / Reference</strong></li>
                    <li>Fill the form with your details</li>
                    <li>We verify & activate within <strong>24 hours</strong></li>
                  </ol>
                </div>
              </div>

              {/* Subscription Form */}
              <div className="sub-form-container">
                <h3>📝 Subscription Form</h3>
                {result && (
                  <div className={`sub-alert ${result.type}`}>
                    {result.type === 'success' ? '✅' : '❌'} {result.message}
                  </div>
                )}
                <form className="sub-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="Your full name" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input 
                      type="email" 
                      placeholder="your@email.com" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone / WhatsApp Number *</label>
                    <input 
                      type="tel" 
                      placeholder="03XX-XXXXXXX" 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Transaction ID / Payment Reference</label>
                    <input 
                      type="text" 
                      placeholder="e.g. TXN123456789 or screenshot ref" 
                      value={formData.paymentRef}
                      onChange={(e) => setFormData({...formData, paymentRef: e.target.value})}
                    />
                  </div>
                  <button className="sub-submit-btn" type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : '🚀 Submit Subscription Request'}
                  </button>
                  <p className="sub-form-note">
                    Your subscription will be activated within 24 hours after payment verification.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="sub-faq">
        <div className="container">
          <h2 className="section-title">Frequently Asked <span className="sub-highlight">Questions</span></h2>
          <div className="sub-faq-grid">
            <div className="sub-faq-item">
              <h4>How do I pay?</h4>
              <p>Simply transfer Rs. 500 to our JazzCash, EasyPaisa, or bank account. No credit card needed!</p>
            </div>
            <div className="sub-faq-item">
              <h4>When will my subscription be activated?</h4>
              <p>Within 24 hours of payment verification. You'll receive a confirmation via email/WhatsApp.</p>
            </div>
            <div className="sub-faq-item">
              <h4>What notifications will I receive?</h4>
              <p>Price drop alerts, flash sale notifications from Limelight & Sapphire, and curated daily deals from all stores.</p>
            </div>
            <div className="sub-faq-item">
              <h4>Can I cancel anytime?</h4>
              <p>Yes! Your subscription runs for 30 days. Simply don't renew if you wish to cancel — no questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} FLASHI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>×</button>
            <h3>Login to FLASHI</h3>
            <p>Save your favorite deals and get premium features.</p>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  required 
                  value={loginForm.name}
                  onChange={(e) => setLoginForm({...loginForm, name: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  required 
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                />
              </div>
              <button className="submit-btn" type="submit" disabled={loginLoading} style={{ width: '100%', marginTop: 0 }}>
                {loginLoading ? 'Logging in...' : 'Login / Register'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
