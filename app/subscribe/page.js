'use client';

import { useState, useEffect } from 'react';
import SalesNavLink from '../components/SalesNavLink';
import UserHeaderActions from '../components/UserHeaderActions';

export default function SubscribePage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', paymentRef: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: '', email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

        // Fetch subscription status
        fetch(`/api/subscription?email=${encodeURIComponent(parsed.email)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.status) setSubscriptionStatus(data.status);
          })
          .catch(console.error);

      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
  }, []);

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoginError(null);
    if (!loginForm.email || !loginForm.password) return;
    if (isRegisterMode && !loginForm.name) return;

    setLoginLoading(true);
    try {
      const endpoint = isRegisterMode ? '/api/register' : '/api/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();

      if (data.success) {
        if (isRegisterMode) {
          setIsRegisterMode(false);
          setLoginError(null);
          setLoginForm(prev => ({ ...prev, name: '' }));
          // Note: In this page we don't have showToast, we can use an alert or just rely on the UI change
          alert('Registration successful! Please login to continue.');
        } else {
          const userData = { full_name: data.user?.name || loginForm.name, email: loginForm.email };
          setUser(userData);
          localStorage.setItem('flashi_user', JSON.stringify(userData));
          setFormData(prev => ({ ...prev, name: userData.full_name, email: userData.email }));
          setShowLoginModal(false);

          // Fetch subscription status
          const statusRes = await fetch(`/api/subscription?email=${encodeURIComponent(userData.email)}`);
          const statusData = await statusRes.json();
          if (statusData.success) {
            setSubscriptionStatus(statusData.status);
          }
        }
      } else {
        throw new Error(data.error || (isRegisterMode ? 'Registration failed' : 'Login failed'));
      }
    } catch (error) {
      setLoginError(error.message);
      console.error(error.message);
    } finally {
      setLoginLoading(false);
    }
  }

  function signOut() {
    setUser(null);
    setSubscriptionStatus(null);
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
        setSubscriptionStatus('pending'); // Optimistically update status
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
              <img src="/logo.png" alt="FLASHI" width="32" height="32" style={{ borderRadius: '6px', objectFit: 'cover' }} />
            </span>
            <span className="logo-text">FLASHI</span>
          </a>
          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <a href="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</a>
            <SalesNavLink isAnchor className="nav-link" onClick={() => setMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'bold' }} />
            <a href="/#how-it-works" className="nav-link" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="/subscribe" className="nav-link" onClick={() => setMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Premium</a>
            <a href="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About Us</a>
            <a href="/contact" className="nav-link contact-nav-link" onClick={() => setMenuOpen(false)}>Contact Us</a>
          </nav>

          <UserHeaderActions onLogin={() => setShowLoginModal(true)} />
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

      {subscriptionStatus ? (
        <section className="sub-dashboard" style={{ padding: '60px 0', minHeight: '60vh' }}>
          <div className="container">
            <div className="sub-form-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                {subscriptionStatus === 'active' ? '✨' : '⏳'}
              </div>
              <h2 style={{ marginBottom: '10px', fontSize: '2rem' }}>
                {subscriptionStatus === 'active' ? 'You are a Premium Member!' : 'Verification Pending'}
              </h2>
              <p style={{ color: 'var(--secondary-text)', lineHeight: '1.6', marginBottom: '30px', fontSize: '1.1rem' }}>
                {subscriptionStatus === 'active'
                  ? 'Your subscription is active. You will now receive exclusive sale alerts, price drops, and early access notifications directly!'
                  : 'We have received your request and are currently verifying your bank transfer. Please allow up to 24 hours for activation.'}
              </p>

              <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', textAlign: 'left', marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '15px' }}>Subscription Details</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--secondary-text)' }}>Account:</span>
                  <strong>{user?.email}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--secondary-text)' }}>Status:</span>
                  <strong style={{
                    color: subscriptionStatus === 'active' ? 'var(--accent-success)' : '#eab308',
                    textTransform: 'capitalize'
                  }}>
                    {subscriptionStatus}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--secondary-text)' }}>Plan:</span>
                  <strong>FLASHI Premium (Rs. 500/mo)</strong>
                </div>
              </div>

              <a href="/" className="submit-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Back to Search
              </a>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Pricing Card */}
          <section className="sub-pricing">
            <div className="container">
              <div className="sub-pricing-card">
                <div className="sub-pricing-header">
                  <div className="sub-plan-badge">Most Popular</div>
                  <h2 className="sub-plan-name">Premium Plan</h2>
                  <div className="sub-price-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.5)', fontSize: '1.5rem', fontWeight: 600 }}>Rs. 1000</span>
                    <span className="sub-price-amount" style={{ color: 'var(--accent-warning)' }}>Rs. 500</span>
                    <span className="sub-price-period">/month</span>
                  </div>
                  <p className="sub-price-note">Rs 500 for first 10 users then Rs 1000</p>
                </div>

                <div className="sub-features-list">
                  <div className="sub-feature-item">
                    <span className="sub-feature-icon"></span>
                    <div>
                      <strong>Price Drop Notifications</strong>
                      <p>Get instant alerts when products you're watching drop in price across all stores</p>
                    </div>
                  </div>
                  <div className="sub-feature-item">
                    <span className="sub-feature-icon"></span>
                    <div>
                      <strong>Limelight & Sapphire Sale Alerts</strong>
                      <p>Be the first to know about flash sales, clearance events, and new collection launches</p>
                    </div>
                  </div>
                  <div className="sub-feature-item">
                    <span className="sub-feature-icon"></span>
                    <div>
                      <strong>Exclusive Deals & Discounts</strong>
                      <p>Curated deals from Daraz, PriceOye, Mega.pk, Shophive, Naheed, Highfy & more</p>
                    </div>
                  </div>
                  <div className="sub-feature-item">
                    <span className="sub-feature-icon"></span>
                    <div>
                      <strong>Early Access</strong>
                      <p>Get notified about deals before they go live — shop first, save more</p>
                    </div>
                  </div>
                  <div className="sub-feature-item">
                    <span className="sub-feature-icon"></span>
                    <div>
                      <strong>Notfication Updates Updates</strong>
                      <p>Choose how you want to receive your deal alerts </p>
                    </div>
                  </div>
                  <div className="sub-feature-item">
                    <span className="sub-feature-icon"></span>
                    <div>
                      <strong>Priority Support</strong>
                      <p>Get dedicated support and product tracking requests handled first</p>
                    </div>
                  </div>
                </div>

                <button
                  className="sub-cta-btn"
                  onClick={() => {
                    if (user) {
                      setShowPayment(true);
                      setTimeout(() => {
                        document.getElementById('payment')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  type="button"
                >
                  {user ? 'Subscribe Now — Rs. 500/month' : 'Login to Subscribe'}
                </button>
              </div>
            </div>
          </section>

          {/* Payment Section */}
          {showPayment && user && (
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
                        <span className="sub-bank-number">1774327143602</span>
                        <span className="sub-bank-holder">FLASHI Premium</span>
                      </div>
                      <button className="sub-copy-btn" onClick={() => { navigator.clipboard.writeText('1774327143602'); }} type="button">Copy</button>
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
                    <h3> Subscription Form</h3>
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
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone / WhatsApp Number *</label>
                        <input
                          type="tel"
                          placeholder="03XX-XXXXXXX"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Transaction ID / Payment Reference</label>
                        <input
                          type="text"
                          placeholder="e.g. TXN123456789 or screenshot ref"
                          value={formData.paymentRef}
                          onChange={(e) => setFormData({ ...formData, paymentRef: e.target.value })}
                        />
                      </div>
                      <button className="sub-submit-btn" type="submit" disabled={submitting}>
                        {submitting ? 'Submitting...' : ' Submit Subscription Request'}
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
                  <p>Transfer Rs. 500 via bank transfer to our UBL account. No credit card or app needed!</p>
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
                  <p>Note: You can't cancel once purchased. Contact us to cancel it. Thank you.</p>
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
        </>
      )}

      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>×</button>
            <h3>{isRegisterMode ? 'Create an Account' : 'Login to FLASHI'}</h3>
            <p>Save your favorite deals and get premium features.</p>
            {loginError && <div style={{ color: '#ef4444', marginBottom: '15px', padding: '10px', background: '#fef2f2', borderRadius: '4px', fontSize: '0.9rem', border: '1px solid #fca5a5' }}>{loginError}</div>}
            <form onSubmit={handleLoginSubmit}>
              {isRegisterMode && (
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={loginForm.name}
                    onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                  />
                </div>
              )}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
              <button className="submit-btn" type="submit" disabled={loginLoading} style={{ width: '100%', marginTop: 0 }}>
                {loginLoading ? 'Processing...' : isRegisterMode ? 'Sign Up' : 'Login'}
              </button>
              <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9rem' }}>
                {isRegisterMode ? 'Already have an account? ' : 'Need an account? '}
                <button 
                  type="button" 
                  onClick={() => { setIsRegisterMode(!isRegisterMode); setLoginError(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {isRegisterMode ? 'Login' : 'Sign Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
