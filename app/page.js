'use client';


import { useEffect, useMemo, useState } from 'react';
import SalesNavLink from './components/SalesNavLink';
import UserHeaderActions from './components/UserHeaderActions';
import { BannerAd, NativeBannerAd, DisplayAd } from './components/AdScripts';

const API_BASE = '/api';
const popularQueries = [
  'iPhone 15 Pro Max',
  'Samsung S24 Ultra',
  'Infinix Note 40',
  'Redmi Note 13',
  'Power Bank',
];

const LIVE_WAIT_MESSAGE = 'Gathering Information Please Wait For Few Seconds...';
const DB_WAIT_MESSAGE = 'Gathering Information Please Wait For Few Seconds...';

function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) return 'N/A';
  return `Rs. ${Math.round(Number(value)).toLocaleString('en-PK')}`;
}

function sortProducts(products, sortKey) {
  const list = [...products];

  switch (sortKey) {
    case 'price-asc':
      return list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    case 'price-desc':
      return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case 'rating':
      return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case 'reviews':
      return list.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    case 'recommended':
    default:
      // Recommended: Prioritize products with images, better ratings, and more reviews
      // Also avoid putting extremely cheap items (potential bait/scam) at the very top
      return list.sort((a, b) => {
        // 1. Has image
        const imgA = a.image ? 1 : 0;
        const imgB = b.image ? 1 : 0;
        if (imgA !== imgB) return imgB - imgA;

        // 2. Penalize very low prices (potential bait) - assuming anything under 100 is suspicious for shoes/electronics
        // We only do this if it's not a known accessory query
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        const suspiciousA = priceA < 100 ? 1 : 0;
        const suspiciousB = priceB < 100 ? 1 : 0;
        if (suspiciousA !== suspiciousB) return suspiciousA - suspiciousB;

        // 3. Rating & Review weight
        const scoreA = (a.rating || 0) * 5 + Math.min(a.reviewCount || 0, 50);
        const scoreB = (b.rating || 0) * 5 + Math.min(b.reviewCount || 0, 50);
        if (scoreA !== scoreB) return scoreB - scoreA;

        // 4. Default to price ascending if everything else is equal
        return priceA - priceB;
      });
  }
}

function getPriceStats(products) {
  const prices = products.map((product) => product.price).filter((value) => value != null && !Number.isNaN(Number(value)));
  if (prices.length === 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max, savings: max - min };
}

function toastClass(type) {
  return `toast ${type}`;
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState('price-asc');
  const [view, setView] = useState('grid');
  const [meta, setMeta] = useState('');
  const [toast, setToast] = useState(null);

  const [searchMode, setSearchMode] = useState('db');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: '', email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [showMobileSplash, setShowMobileSplash] = useState(false);

  const sortedProducts = useMemo(() => sortProducts(products, sortKey), [products, sortKey]);
  const priceStats = useMemo(() => getPriceStats(sortedProducts), [sortedProducts]);


  useEffect(() => {
    // Check local storage for user
    const storedUser = localStorage.getItem('flashi_user');
    const skippedLogin = localStorage.getItem('flashi_skip_login');
    let isUserLoggedIn = false;

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        isUserLoggedIn = true;
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }

    // Check if we should show mobile splash
    if (window.innerWidth <= 768 && !isUserLoggedIn && !skippedLogin) {
      setShowMobileSplash(true);
    }
  }, []);


  useEffect(() => {
    const handleOpenLogin = () => {
      setShowMobileSplash(false);
      setShowLoginModal(true);
    };

    window.addEventListener('open-login-modal', handleOpenLogin);

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const login = params.get('login');
    if (q) {
      setQuery(q);
      handleSearch(q, false);
    }
    if (login === 'true') {
      handleOpenLogin();
    }

    return () => window.removeEventListener('open-login-modal', handleOpenLogin);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function showToast(message, type = 'info') {
    setToast({ message, type });
  }

  function trackDownload(source = 'main') {
    try {
      fetch('/api/admin/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      }).catch(() => { });
    } catch { }
  }

  async function fetchJson(url) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      if (!response.ok) {
        // 502/503/504 happen when the server is cold-starting or having issues
        if (response.status >= 502 && response.status <= 504) {
          throw new Error('Internet Connection Timed Out');
        }
        let error = `HTTP ${response.status}`;
        try {
          const data = JSON.parse(text);
          error = data.error || data.message || error;
        } catch { }
        throw new Error(error);
      }
      return text ? JSON.parse(text) : {};
    } catch (error) {
      // Catch network-level failures (e.g. TypeError: Failed to fetch)
      if (error.name === 'TypeError' || error.message.includes('Failed to fetch') || error.message.includes('network')) {
        throw new Error('Internet Connection Timed Out');
      }
      throw error;
    }
  }

  async function handleSearch(value = query, pushHistory = true) {
    const searchTerm = value.trim();
    if (!searchTerm) {
      showToast('Please enter a product name or URL', 'warning');
      return;
    }

    if (searchTerm.length < 2) {
      showToast('Search query must be at least 2 characters', 'warning');
      return;
    }

    const isUrl = searchTerm.startsWith('http://') || searchTerm.startsWith('https://');
    setLoading(true);
    setLiveLoading(false);
    setStatusMessage(isUrl ? 'Fetching product details...' : DB_WAIT_MESSAGE);
    setProducts([]);
    setMeta('');

    setSearchMode(isUrl ? 'url' : 'db');

    if (pushHistory) {
      const url = new URL(window.location);
      url.searchParams.set('q', searchTerm);
      window.history.pushState({}, '', url.toString());
    }

    try {
      if (isUrl) {
        const data = await fetchJson(`${API_BASE}/product?url=${encodeURIComponent(searchTerm)}`);
        if (data.error) throw new Error(data.error);
        const productsList = [data.product, ...(data.alternatives || [])].filter(Boolean);
        setProducts(productsList);
        setMeta(data.product?.title ? `Product details for "${data.product.title}"` : 'Product lookup result');
      } else {
        const data = await fetchJson(`${API_BASE}/products?q=${encodeURIComponent(searchTerm)}&limit=1000`);
        // Filter out discounted sale products (>15% off) from normal search — these are premium-only
        const filteredProducts = (data.products || []).filter(p => {
          const parsePrice = (val) => {
            if (typeof val === 'number') return val;
            if (!val || typeof val !== 'string') return NaN;
            return Number(val.replace(/[^0-9.]/g, ''));
          };
          const price = parsePrice(p.price);
          const origPrice = parsePrice(p.originalPrice);
          if (isNaN(origPrice) || isNaN(price) || origPrice <= price) return true;
          const discountPct = ((origPrice - price) / origPrice) * 100;
          return discountPct < 15;
        });
        setProducts(filteredProducts);
        setMeta(`${data.total || 0} result${data.total === 1 ? '' : 's'}`);

        if (data.needsLiveScrape) {
          setLiveLoading(true);
          setStatusMessage(LIVE_WAIT_MESSAGE);
          // Fire and forget live scrape, then refetch
          fetch(`${API_BASE}/products/live?q=${encodeURIComponent(searchTerm)}&limit=50`)
            .then(res => res.json())
            .then(async (liveData) => {
              if (liveData.success) {
                // Re-fetch products to get the newly added items
                const newData = await fetchJson(`${API_BASE}/products?q=${encodeURIComponent(searchTerm)}&limit=1000`);
                // Filter out discounted sale products (>15% off) from normal search — premium-only
                const newFiltered = (newData.products || []).filter(p => {
                  const parsePrice = (val) => {
                    if (typeof val === 'number') return val;
                    if (!val || typeof val !== 'string') return NaN;
                    return Number(val.replace(/[^0-9.]/g, ''));
                  };
                  const price = parsePrice(p.price);
                  const origPrice = parsePrice(p.originalPrice);
                  if (isNaN(origPrice) || isNaN(price) || origPrice <= price) return true;
                  const discountPct = ((origPrice - price) / origPrice) * 100;
                  return discountPct < 15;
                });
                setProducts(newFiltered);
                setMeta(`${newFiltered.length} result${newFiltered.length === 1 ? '' : 's'}`);
              }
            })
            .catch(console.error)
            .finally(() => {
              setLiveLoading(false);
              setStatusMessage('');
            });
        }
      }


    } catch (error) {
      console.error('Search error:', error);
      showToast(error.message || 'Search failed. Please try again.', 'error');
      setStatusMessage('');
    } finally {
      setLoading(false);
    }
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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      showToast('Thank you for your message! We will get back to you soon.', 'success');
      setContactForm({ name: '', email: '', subject: 'General Inquiry', message: '' });
    } catch (error) {
      console.error('Contact error:', error);
      showToast(error.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

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
          showToast('Registration successful! Please login to continue.', 'success');
          setLoginForm(prev => ({ ...prev, name: '' }));
        } else {
          const userData = { full_name: data.user?.name || loginForm.name, email: loginForm.email };
          localStorage.setItem('flashi_user', JSON.stringify(userData));
          window.location.reload();
        }
      } else {
        throw new Error(data.error || (isRegisterMode ? 'Registration failed' : 'Login failed'));
      }
    } catch (error) {
      setLoginError(error.message);
      showToast(error.message, 'error');
    } finally {
      setLoginLoading(false);
    }
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem('flashi_user');
    localStorage.setItem('flashi_skip_login', 'true');
    showToast('Logged out successfully', 'success');
  }





  function handleHintClick(value) {
    setQuery(value);
    handleSearch(value);
  }

  return (
    <main>
      {showMobileSplash && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'var(--primary-bg)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <img src="/logo.png" alt="FLASHI" width="80" height="80" style={{ borderRadius: '20px', marginBottom: '1.5rem', boxShadow: '0 12px 40px rgba(46, 125, 50, 0.2)', animation: 'splashLogo 0.6s cubic-bezier(0.16, 1, 0.3, 1) both' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary-text)', animation: 'splashFade 0.6s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both' }}>Welcome to FLASHI</h1>
          <p style={{ color: 'var(--secondary-text)', marginBottom: '2.5rem', fontSize: '1.1rem', animation: 'splashFade 0.6s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}>Pakistan's smartest Smart Shopping platform</p>

          <button
            onClick={() => { setShowMobileSplash(false); setShowLoginModal(true); setIsRegisterMode(true); }}
            style={{ width: '100%', maxWidth: '300px', padding: '16px', background: 'var(--gradient-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem', cursor: 'pointer', boxShadow: '0 8px 25px rgba(46, 125, 50, 0.3)', animation: 'splashFade 0.6s 0.4s cubic-bezier(0.16, 1, 0.3, 1) both' }}
          >
            Create an Account
          </button>

          <button
            onClick={() => { setShowMobileSplash(false); setShowLoginModal(true); setIsRegisterMode(false); }}
            style={{ width: '100%', maxWidth: '300px', padding: '16px', background: 'var(--secondary-bg)', color: 'var(--primary-text)', border: '2px solid var(--border-color)', borderRadius: 'var(--radius-full)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1.5rem', cursor: 'pointer', animation: 'splashFade 0.6s 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}
          >
            Log In
          </button>

          <button
            onClick={() => {
              localStorage.setItem('flashi_skip_login', 'true');
              setShowMobileSplash(false);
            }}
            style={{ background: 'transparent', border: 'none', color: 'var(--secondary-text)', fontWeight: '600', textDecoration: 'underline', padding: '8px', cursor: 'pointer', animation: 'splashFade 0.6s 0.6s cubic-bezier(0.16, 1, 0.3, 1) both' }}
          >
            Continue without login
          </button>
        </div>
      )}

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
            <a href="#how-it-works" className="nav-link" onClick={() => setMenuOpen(false)}>How It Works</a>
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

      <section className="hero" id="hero">
        <div className="container">
          <div className="hero-layout">
            <div className="hero-content">
              <div className="hero-badge">🇵🇰 Pakistan's #1 Price Comparison Platform</div>
              <h1 className="hero-title">
                FLASHI - Find Lowest Prices Across Online Pakistani Stores.
              </h1>
              <p className="hero-subtitle">
                Search any product — from phones to fashion — and find the lowest price from Daraz, PriceOye, Limelight, Sapphire & more. Trusted by 500+ smart shoppers across Pakistan.
              </p>

              <div className="search-container" id="search-container">
                <div className="search-box" id="search-box">
                  <div className="search-icon" id="search-icon">🔎</div>
                  <input
                    type="text"
                    id="search-input"
                    className="search-input"
                    placeholder="Search product or paste any URL..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                  />
                  <button className="search-btn" type="button" onClick={() => handleSearch()} disabled={loading}>
                    Search
                  </button>
                </div>
                <div className="search-hints">
                  <span className="search-hint-label">Popular:</span>
                  {popularQueries.map((item) => (
                    <button key={item} className="search-hint" type="button" onClick={() => handleHintClick(item)}>
                      {item}
                    </button>
                  ))}
                </div>


                <div className="trust-section">
                  <div className="trust-label"><h2>Most Popular Stores</h2></div>
                  <div className="trust-logos">
                    <div className="trust-logo-card">
                      <img src="https://www.google.com/s2/favicons?domain=daraz.pk&sz=128" alt="Daraz" className="brand-logo-img" />
                      <span className="brand-logo-name">Daraz</span>
                    </div>
                    <div className="trust-logo-card">
                      <img src="https://www.google.com/s2/favicons?domain=priceoye.pk&sz=128" alt="PriceOye" className="brand-logo-img" />
                      <span className="brand-logo-name">PriceOye</span>
                    </div>
                    <div className="trust-logo-card">
                      <img src="https://www.google.com/s2/favicons?domain=mega.pk&sz=128" alt="Mega.pk" className="brand-logo-img" />
                      <span className="brand-logo-name">Mega.pk</span>
                    </div>
                    <div className="trust-logo-card">
                      <img src="https://www.google.com/s2/favicons?domain=highfy.pk&sz=128" alt="Highfy" className="brand-logo-img" />
                      <span className="brand-logo-name">Highfy</span>
                    </div>
                    <div className="trust-logo-card">
                      <img src="https://www.google.com/s2/favicons?domain=limelight.pk&sz=128" alt="Limelight" className="brand-logo-img" />
                      <span className="brand-logo-name">Limelight</span>
                    </div>
                    <div className="trust-logo-card">
                      <img src="https://www.google.com/s2/favicons?domain=sapphireonline.pk&sz=128" alt="Sapphire" className="brand-logo-img" />
                      <span className="brand-logo-name">Sapphire</span>
                    </div>
                    <div className="trust-logo-card">
                      <img src="https://www.google.com/s2/favicons?domain=stationers.pk&sz=128" alt="Stationers.pk" className="brand-logo-img" />
                      <span className="brand-logo-name">Stationers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Social Proof Bar ═══ */}
      <section className="social-proof" id="social-proof">
        <div className="container">
          <div className="social-proof-grid">
            <div className="sp-item">
              <span className="sp-value">500+</span>
              <span className="sp-label">Active Users</span>
            </div>
            <div className="sp-divider" />
            <div className="sp-item">
              <span className="sp-value">50+</span>
              <span className="sp-label">Stores Compared</span>
            </div>
            <div className="sp-divider" />
            <div className="sp-item">
              <div className="sp-stars">★★★★★</div>
              <span className="sp-value">4.8/5</span>
              <span className="sp-label">User Rating</span>
            </div>
            <div className="sp-divider" />
            <div className="sp-item">
              <span className="sp-value">Rs. 2.5M+</span>
              <span className="sp-label">Saved by Users</span>
            </div>
          </div>
        </div>
      </section>

      {toast && (
        <div id="toast-container">
          <div className={toastClass(toast.type)}>{toast.message}</div>
        </div>
      )}

      {loading ? (
        <section className="loading-section">
          <div className="container">
            <div className="loading-info" style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>
              <div className="live-loading-indicator" style={{ margin: '0 auto', justifyContent: 'center' }}>
                <span className="live-dot"></span>
                {statusMessage}
              </div>
            </div>
            <div className="loading-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line short"></div>
                  <div className="skeleton-btn"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        products.length > 0 && (
          <section className="results-section" id="results-section">
            <div className="container">
              <div className="results-header" id="results-header">
                <div className="results-info">
                  <h2 className="results-title">Results for "{query}"</h2>
                  <p className="results-meta">
                    {meta}
                    {(loading || liveLoading) && statusMessage && (
                      <span className="live-loading-indicator">
                        <span className="live-dot"></span>
                        {statusMessage}
                      </span>
                    )}
                  </p>
                </div>
                <div className="results-controls">
                  <div className="sort-group">
                    <label className="sort-label">Sort by</label>
                    <select className="sort-select" value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
                      <option value="recommended">Recommended</option>
                      <option value="price-asc">Price: Low → High</option>
                      <option value="price-desc">Price: High → Low</option>
                      <option value="rating">Best Rating</option>
                      <option value="reviews">Most Reviews</option>
                    </select>
                  </div>
                  <div className="view-toggle">
                    <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} type="button" onClick={() => setView('grid')}>
                      Grid
                    </button>
                    <button className={`view-btn ${view === 'list' ? 'active' : ''}`} type="button" onClick={() => setView('list')}>
                      List
                    </button>
                  </div>
                </div>
              </div>

              {priceStats && (
                <div className="price-range-bar">
                  <div className="price-range-header">
                    <span className="price-range-label">Price Range</span>
                    <div className="price-range-values">
                      <span className="price-range-value price-low">Lowest: {formatPrice(priceStats.min)}</span>
                      <span className="price-range-value price-high">Highest: {formatPrice(priceStats.max)}</span>
                      <span className="price-range-value" style={{ color: '#2e7d32' }}>
                        Save up to {formatPrice(priceStats.savings)}
                      </span>
                    </div>
                  </div>
                  <div className="price-bar-track">
                    <div className="price-bar-fill" style={{ width: '100%' }}></div>
                  </div>
                </div>
              )}

              <div className={`products-grid ${view === 'list' ? 'list-view' : ''}`}>
                {sortedProducts.map((product, index) => (
                  <article
                    className={`product-card ${priceStats?.min === product.price ? 'cheapest' : ''}`}
                    key={`${product.id}-${index}`}>
                    <div className="store-badge" style={{ background: product.storeColor || '#6366f1' }}>
                      {product.store}
                    </div>
                    <div className="product-image-wrap">
                      {product.image ? (
                        <img src={product.image} alt={product.title} className="product-image" />
                      ) : (
                        <div className="product-image-placeholder">📱</div>
                      )}
                    </div>
                    <div className="product-info">
                      <a href={product.url} target="_blank" rel="noreferrer" className="product-title">
                        {product.title}
                      </a>
                      <div className="product-price-row">
                        <span className="product-price">{formatPrice(product.price)}</span>
                        {product.originalPrice && product.originalPrice > product.price ? (
                          <span className="product-original-price">{formatPrice(product.originalPrice)}</span>
                        ) : null}
                      </div>
                      <div className="product-footer">
                        <div className="product-footer-top">
                          <span className="product-store-name">
                            <span className="product-store-dot" style={{ background: product.storeColor || '#6366f1' }}></span>
                            {product.store}
                          </span>
                          <span className={product.inStock !== false ? 'stock-badge in-stock' : 'stock-badge out-of-stock'}>
                            {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <a href={product.url} target="_blank" rel="noreferrer" className="product-visit-btn">
                          Visit Store →
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )
      )}


      {/* Ad Banner */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-md) 0 0' }}>
        <BannerAd />
      </div>

      {/* Native Banner Ad */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-sm) 0' }}>
        <NativeBannerAd />
      </div>


      {/* ═══ App Screenshots Section ═══ */}
      <section className="screenshots-section" id="app-preview">
        <div className="container">
          <div className="section-header-center">
            <div className="hero-badge">📱 See It In Action</div>
            <h2 className="section-title">A Smarter Way to <span className="highlight-text">Shop Pakistan</span></h2>
            <p className="section-subtitle">Search once, compare prices from every major store — all in one beautiful interface.</p>
          </div>
          <div className="screenshots-container">
            <img
              src="/flashi-app-preview.png"
              alt="FLASHI App - Compare prices across Pakistani stores"
              className="screenshot-mockup"
              loading="lazy"
            />
          </div>
          <div className="screenshot-features">
            <div className="ss-feature">
              <span className="ss-feature-icon">🔍</span>
              <span>Search any product</span>
            </div>
            <div className="ss-feature">
              <span className="ss-feature-icon">📊</span>
              <span>Side-by-side comparison</span>
            </div>
            <div className="ss-feature">
              <span className="ss-feature-icon">💰</span>
              <span>Instant savings</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ APK Download Section ═══ */}
      <section className="app-download-section" id="download-app">
        <div className="container">
          <div className="app-download-card">
            <div className="app-download-left">
              <div className="app-download-icon-wrap">
                <img src="/logo.png" alt="FLASHI App" className="app-download-icon" />
                <div className="app-download-ripple" />
              </div>
              <div className="app-download-text">
                <div className="app-download-eyebrow">📱 Mobile App</div>
                <h2 className="app-download-title">Get FLASHI on Your Phone</h2>
                <p className="app-download-desc">
                  Shop smarter on the go. Search and compare prices from Pakistan's top stores — right from your pocket.
                </p>
                <ul className="app-download-features">
                  <li><span className="app-feat-check">✓</span> Compare prices instantly</li>
                  <li><span className="app-feat-check">✓</span> Works offline after first load</li>
                  <li><span className="app-feat-check">✓</span> Premium sale alerts</li>
                  <li><span className="app-feat-check">✓</span> No Play Store needed</li>
                </ul>
              </div>
            </div>
            <div className="app-download-right">
              <a
                href="/flashi-mobile.apk"
                download="FLASHI.apk"
                className="apk-download-btn"
                id="main-apk-download"
                onClick={() => trackDownload('main-section')}
              >
                <svg className="apk-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <div className="apk-btn-text">
                  <span className="apk-btn-label">Download APK</span>
                  <span className="apk-btn-sub">Android · Free · v1.0</span>
                </div>
              </a>
              <p className="app-download-note">
                Enable "Install from unknown sources" in Android Settings after downloading.
              </p>
              <div className="app-download-stats">
                <div className="app-stat">
                  <span className="app-stat-num">50+</span>
                  <span className="app-stat-label">Stores</span>
                </div>
                <div className="app-stat-divider" />
                <div className="app-stat">
                  <span className="app-stat-num">Free</span>
                  <span className="app-stat-label">Always</span>
                </div>
                <div className="app-stat-divider" />
                <div className="app-stat">
                  <span className="app-stat-num">🇵🇰</span>
                  <span className="app-stat-label">Pakistan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="container">
          <h2 className="section-title">How <span className="highlight-text">FLASHI</span> Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">🔍</div>
              <h3>Search any product</h3>
              <p>Type a product name or paste a URL to instantly find price matches.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">⚡</div>
              <h3>Compare prices</h3>
              <p>See the best prices from multiple stores and choose the lowest offer.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">🛒</div>
              <h3>Shop the best deal</h3>
              <p>Click through to your chosen store and save money on every purchase.</p>
            </div>
            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-icon">🔔</div>
              <h3>Get sale alerts</h3>
              <p>Upgrade to Premium and never miss a flash sale or price drop again.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Premium Pricing Section ═══ */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="section-header-center">
            <div className="hero-badge">💎 Go Premium</div>
            <h2 className="section-title">Unlock <span className="highlight-text">Exclusive Deals</span> Others Miss</h2>
            <p className="section-subtitle">Premium members save 3x more with early access to flash sales and price drops from Limelight, Sapphire & more.</p>
          </div>
          <div className="pricing-grid">
            {/* Free Plan */}
            <div className="pricing-card">
              <div className="pricing-header">
                <div className="pricing-name">Free</div>
                <div className="pricing-price">Rs. 0<span className="pricing-period">/forever</span></div>
                <p className="pricing-tagline">Great for casual shoppers</p>
              </div>
              <ul className="pricing-features">
                <li className="pricing-feature">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Search & compare across 50+ stores
                </li>
                <li className="pricing-feature">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Paste URL price lookup
                </li>
                <li className="pricing-feature">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Mobile app access
                </li>
                <li className="pricing-feature disabled">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  Flash sale alerts
                </li>
                <li className="pricing-feature disabled">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  Exclusive Limelight & Sapphire deals
                </li>
              </ul>
              <a href="/" className="pricing-btn pricing-btn-outline">Start Free</a>
            </div>

            {/* Premium Plan */}
            <div className="pricing-card popular">
              <div className="pricing-badge">🔥 MOST POPULAR</div>
              <div className="pricing-header">
                <div className="pricing-name">Premium</div>
                <div className="pricing-price">Rs. 250<span className="pricing-period">/month</span></div>
                <p className="pricing-tagline">For serious deal hunters</p>
              </div>
              <ul className="pricing-features">
                <li className="pricing-feature">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Everything in Free
                </li>
                <li className="pricing-feature">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Exclusive flash sale alerts
                </li>
                <li className="pricing-feature">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Limelight & Sapphire sale access
                </li>
                <li className="pricing-feature">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Email price drop notifications
                </li>
                <li className="pricing-feature">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Priority WhatsApp support
                </li>
              </ul>
              <a href="/subscribe" className="pricing-btn">Get Premium →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Display Ad */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-sm) 0' }}>
        <DisplayAd />
      </div>

      <section className="contact-section" id="contact">
        <div className="container">
          <div className="contact-layout">
            <div className="contact-info-plus">
              <div className="hero-badge">Get in touch</div>
              <h2 className="section-title" style={{ textAlign: 'left', margin: '0 0 var(--spacing-md) 0' }}>
                We'd love to hear <span className="highlight-text">your feedback</span>
              </h2>
              <p className="contact-desc">
                Have a question about FLASHI? Want to suggest a new store or report a bug?
                Our team is here to help you get the best out of your shopping experience.
              </p>
              <div className="contact-features">
                <div className="contact-feature">
                  <div className="cf-icon">📮</div>
                  <div className="cf-text">
                    <h4>Direct Feedback</h4>
                    <p>Your suggestions help us improve FLASHI every day.</p>
                  </div>
                </div>
                <div className="contact-feature">
                  <div className="cf-icon">⚡</div>
                  <div className="cf-text">
                    <h4>Fast Response</h4>
                    <p>We typically reply within 24 hours of receiving your message.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name</label>
                    <input
                      type="text"
                      placeholder="Ahmed"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="ahmed@gmail.com"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select
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
                  <label>Message</label>
                  <textarea
                    rows="4"
                    placeholder="Tell us what's on your mind..."
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  ></textarea>
                </div>
                <button className="submit-btn" type="submit" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer" style={{ borderTop: '1px solid var(--border-color)', padding: 'var(--spacing-2xl) 0' }}>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="/" className="logo">
                <span className="logo-icon">
                  <img src="/logo.png" alt="FLASHI" width="32" height="32" style={{ borderRadius: '6px' }} />
                </span>
                <span className="logo-text">FLASHI</span>
              </a>
              <p className="footer-desc" style={{ marginTop: 'var(--spacing-md)', color: 'var(--secondary-text)', fontSize: 'var(--font-size-sm)' }}>
                Pakistan's smarter shopping companion. Compare prices across all major stores and never overpay again.
              </p>
              <div className="social-links" style={{ marginTop: '1.2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <a href="https://www.instagram.com/flashipk/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-link">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              </div>
            </div>
            <div className="footer-links-col">
              <h4 className="footer-title">Platform</h4>
              <ul className="footer-links">
                <li><a href="/">Home</a></li>
                <li><a href="/special-discounts">Sale Alerts</a></li>
                <li><a href="/subscribe">Premium</a></li>
                <li><a href="/flashi-mobile.apk" download onClick={() => trackDownload('footer')}>Download App</a></li>
              </ul>
            </div>
            <div className="footer-links-col">
              <h4 className="footer-title">Support</h4>
              <ul className="footer-links">
                <li><a href="/contact">Contact Us</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/about">About Us</a></li>
              </ul>
            </div>
            <div className="footer-links-col">
              <h4 className="footer-title">Legal</h4>
              <ul className="footer-links">
                <li><a href="/privacy-policy">Privacy Policy</a></li>
                <li><a href="/terms-and-conditions">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} FLASHI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ═══ Floating WhatsApp Button ═══ */}
      <a
        href="https://wa.me/923194781148?text=Hi%20FLASHI!%20I%20need%20help%20with%20price%20comparison."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Chat on WhatsApp"
        id="whatsapp-support"
      >
        <svg viewBox="0 0 32 32" width="30" height="30" fill="white">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.9 15.9 0 0 0 16.004 32C24.826 32 32 24.826 32 16.004S24.826 0 16.004 0zm9.334 22.618c-.39 1.1-1.932 2.014-3.166 2.28-.846.18-1.95.324-5.668-1.218-4.762-1.974-7.826-6.804-8.064-7.118-.228-.314-1.928-2.568-1.928-4.898s1.218-3.476 1.652-3.952c.434-.476.948-.594 1.264-.594.314 0 .632.002.908.016.292.016.684-.11 1.07.816.39.94 1.326 3.232 1.442 3.466.118.234.196.508.04.82-.158.314-.236.508-.472.784-.234.274-.494.612-.706.822-.234.234-.478.49-.206.96s1.208 1.994 2.594 3.228c1.782 1.588 3.282 2.082 3.75 2.316.468.234.742.196 1.014-.118.274-.314 1.176-1.372 1.49-1.844.314-.472.632-.392 1.064-.234.434.156 2.724 1.284 3.19 1.518.468.234.78.352.896.548.118.196.118 1.138-.272 2.238z" />
        </svg>
      </a>



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
