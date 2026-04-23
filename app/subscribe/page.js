'use client';

import { useState, useEffect } from 'react';

export default function SubscribePage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: '', email: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    // Check for payment return params in URL
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const paymentMsg = params.get('msg');
    if (paymentStatus) {
      if (paymentStatus === 'success') {
        setResult({ type: 'success', message: paymentMsg || 'Payment successful! Your subscription is now active.' });
        setSubscriptionStatus('active');
      } else {
        setResult({ type: 'error', message: paymentMsg || 'Payment was not completed. Please try again.' });
      }
      // Clean URL params
      window.history.replaceState({}, '', '/subscribe');
    }

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

        // Fetch subscription status
        const statusRes = await fetch(`/api/subscription?email=${encodeURIComponent(userData.email)}`);
        const statusData = await statusRes.json();
        if (statusData.success) {
          setSubscriptionStatus(statusData.status);
        }
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
    setSubscriptionStatus(null);
    localStorage.removeItem('flashi_user');
    setFormData(prev => ({ ...prev, name: '', email: '' }));
  }

  async function handlePayment(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !paymentMethod) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: paymentMethod,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Redirect to payment gateway using a hidden form POST
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.gatewayUrl;
        for (const [key, value] of Object.entries(data.fields)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
      } else {
        setResult({ type: 'error', message: data.error || 'Failed to initiate payment' });
        setSubmitting(false);
      }
    } catch {
      setResult({ type: 'error', message: 'Network error. Please try again.' });
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
                <path d="M 5 35 L 35 35 L 30 39 L 5 39 Z" fill="#222" />
                <path d="M 12 50 L 42 50 L 35 54 L 12 54 Z" fill="#222" />
                <path d="M 18 65 L 35 65 L 30 69 L 18 69 Z" fill="#222" />
                <path d="M 35 20 L 60 20 L 50 40 L 75 40 Q 82 40 80 50 L 70 70 L 40 70 Q 35 70 38 60 L 45 40 L 35 40 Z" fill="#369632" />
                <circle cx="48" cy="80" r="7" fill="#222" />
                <circle cx="48" cy="80" r="3" fill="#fff" />
                <circle cx="68" cy="80" r="7" fill="#222" />
                <circle cx="68" cy="80" r="3" fill="#fff" />
              </svg>
            </span>
            <span className="logo-text">FLASHI</span>
          </a>
          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <a href="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="/#how-it-works" className="nav-link" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="/subscribe" className="nav-link" onClick={() => setMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Premium</a>
            <a href="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About Us</a>
            <a href="/contact" className="nav-link contact-nav-link" onClick={() => setMenuOpen(false)}>Contact Us</a>
          </nav>

          <div className="header-actions">
            {user ? (
              <div className="user-profile-dropdown">
                <div className="user-avatar-fallback" title={user.full_name || user.email}>{user.full_name?.charAt(0).toUpperCase() || 'U'}</div>
                <div className="dropdown-content">
                  <div className="dropdown-user-info">
                    <strong>{user.full_name || 'User'}</strong>
                    <span>{user.email}</span>
                  </div>
                  <a href="/subscribe">My Subscription</a>
                  <button onClick={signOut}>Log Out</button>
                </div>
              </div>
            ) : (
              <button className="google-login-btn" onClick={() => setShowLoginModal(true)}>
                Login
              </button>
            )}
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
                  <div className="sub-price-wrap">
                    <span className="sub-price-amount">Rs. 500</span>
                    <span className="sub-price-period">/month</span>
                  </div>
                  <p className="sub-price-note">Simple bank transfer — no credit card needed</p>
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

          {/* Payment Section */}
          {showPayment && (
            <section className="sub-payment" id="payment">
              <div className="container">
                {result && (
                  <div className={`sub-alert ${result.type}`} style={{ maxWidth: '700px', margin: '0 auto 30px' }}>
                    {result.type === 'success' ? '✅' : '❌'} {result.message}
                  </div>
                )}

                {/* Step 1: Choose Payment Method */}
                <h3 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.5rem' }}>
                  💳 Choose Payment Method
                </h3>
                <div className="payment-methods-grid">
                  <button
                    type="button"
                    className={`payment-method-card ${paymentMethod === 'jazzcash' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('jazzcash')}
                  >
                    <div className="pm-icon" style={{ background: '#e31837', color: '#fff' }}>JC</div>
                    <strong>JazzCash</strong>
                    <span>Mobile Wallet</span>
                  </button>
                  <button
                    type="button"
                    className={`payment-method-card ${paymentMethod === 'easypaisa' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('easypaisa')}
                  >
                    <div className="pm-icon" style={{ background: '#39b54a', color: '#fff' }}>EP</div>
                    <strong>EasyPaisa</strong>
                    <span>Mobile Wallet</span>
                  </button>
                  <button
                    type="button"
                    className={`payment-method-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="pm-icon" style={{ background: '#1a1f71', color: '#fff' }}>💳</div>
                    <strong>Credit / Debit Card</strong>
                    <span>Visa / Mastercard</span>
                  </button>
                </div>

                {/* Step 2: Fill Details & Pay */}
                {paymentMethod && (
                  <div className="sub-form-card" style={{ maxWidth: '500px', margin: '40px auto 0' }}>
                    <h3 style={{ marginBottom: '20px' }}>📝 Your Details</h3>
                    <form className="sub-form" onSubmit={handlePayment}>
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
                      <button className="sub-submit-btn" type="submit" disabled={submitting}>
                        {submitting ? 'Redirecting to payment...' : `Pay Rs. 500 via ${paymentMethod === 'jazzcash' ? 'JazzCash' : paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'Card'}`}
                      </button>
                      <p className="sub-form-note">
                        You will be redirected to {paymentMethod === 'jazzcash' ? 'JazzCash' : paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'the payment'} gateway to complete your payment securely. Your subscription activates instantly after payment.
                      </p>
                    </form>
                  </div>
                )}
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
                  <p>Pay securely with JazzCash, EasyPaisa, or any Visa/Mastercard. Your subscription activates instantly!</p>
                </div>
                <div className="sub-faq-item">
                  <h4>When will my subscription be activated?</h4>
                  <p>Instantly after successful payment — no waiting, no manual verification needed.</p>
                </div>
                <div className="sub-faq-item">
                  <h4>What notifications will I receive?</h4>
                  <p>Price drop alerts, flash sale notifications from Limelight & Sapphire, and curated daily deals from all stores.</p>
                </div>
                <div className="sub-faq-item">
                  <h4>Can I cancel anytime?</h4>
                  <p>Yes! Your subscription runs for 30 days. Simply don&apos;t renew if you wish to cancel — no questions asked.</p>
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
                  onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
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
