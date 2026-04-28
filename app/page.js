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
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
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
    const hasSeen = localStorage.getItem('flashi_premium_popup');
    if (!hasSeen) {
      const timer = setTimeout(() => setShowPremiumPopup(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

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

  function closePremiumPopup() {
    localStorage.setItem('flashi_premium_popup', 'true');
    setShowPremiumPopup(false);
  }

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

  async function fetchJson(url) {
    const response = await fetch(url);
    const text = await response.text();
    if (!response.ok) {
      let error = `HTTP ${response.status}`;
      try {
        const data = JSON.parse(text);
        error = data.error || data.message || error;
      } catch { }
      throw new Error(error);
    }
    return text ? JSON.parse(text) : {};
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
        // Filter out heavily discounted sale products (>50% off) from normal search — keep normal products with small discounts
        const filteredProducts = (data.products || []).filter(p => {
          if (!p.originalPrice || p.originalPrice <= p.price) return true;
          const discountPct = ((p.originalPrice - p.price) / p.originalPrice) * 100;
          return discountPct < 50;
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
                // Filter out heavily discounted sale products (>50% off) from normal search
                const newFiltered = (newData.products || []).filter(p => {
                  if (!p.originalPrice || p.originalPrice <= p.price) return true;
                  const discountPct = ((p.originalPrice - p.price) / p.originalPrice) * 100;
                  return discountPct < 50;
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
          setUser(userData);
          localStorage.setItem('flashi_user', JSON.stringify(userData));
          setShowLoginModal(false);
          showToast(`Welcome back, ${userData.full_name}!`, 'success');
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
          <img src="/logo.png" alt="FLASHI" width="80" height="80" style={{ borderRadius: '16px', marginBottom: '1.5rem', boxShadow: 'var(--shadow-md)' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary-text)' }}>Welcome to FLASHI</h1>
          <p style={{ color: 'var(--secondary-text)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Pakistan's smartest Smart Shopping platform</p>

          <button
            onClick={() => { setShowMobileSplash(false); setShowLoginModal(true); setIsRegisterMode(true); }}
            style={{ width: '100%', maxWidth: '300px', padding: '16px', background: 'var(--gradient-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem', cursor: 'pointer' }}
          >
            Create an Account
          </button>

          <button
            onClick={() => { setShowMobileSplash(false); setShowLoginModal(true); setIsRegisterMode(false); }}
            style={{ width: '100%', maxWidth: '300px', padding: '16px', background: 'white', color: 'var(--primary-text)', border: '2px solid var(--border-color)', borderRadius: 'var(--radius-full)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1.5rem', cursor: 'pointer' }}
          >
            Log In
          </button>

          <button
            onClick={() => {
              localStorage.setItem('flashi_skip_login', 'true');
              setShowMobileSplash(false);
            }}
            style={{ background: 'transparent', border: 'none', color: 'var(--secondary-text)', fontWeight: '600', textDecoration: 'underline', padding: '8px', cursor: 'pointer' }}
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
              <div className="hero-badge">Search smarter, shop better</div>
              <h1 className="hero-title">
                FLASHI - Find The Best Lowest Prices Across Pakistan.
              </h1>
              <p className="hero-subtitle">
                Search any product and instantly compare prices from Pakistan's top stores in one place.
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
                      <span className="price-range-value" style={{ color: '#588157' }}>
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-lg) 0' }}>
        <BannerAd />
      </div>

      {/* Native Banner Ad */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-md) 0' }}>
        <NativeBannerAd />
      </div>

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
          </div>
        </div>
      </section>

      {/* Display Ad */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-lg) 0' }}>
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

      <footer className="footer">
        <div className="container">
          <div className="footer-content" style={{ justifyContent: 'center' }}>
            <div className="footer-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div className="footer-logo-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="logo-icon">
                  <img src="/logo.png" alt="FLASHI" width="30" height="30" style={{ borderRadius: '6px' }} />
                </span>
                <span className="logo-text">FLASHI</span>
              </div>
              <p className="footer-tagline" style={{ marginTop: '1rem' }}>Smart Shopping for every shopper in Pakistan.</p>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                <a href="/about" style={{ color: 'var(--text-secondary, #666)', textDecoration: 'none', fontSize: '0.9rem' }}>About Us</a>
                <a href="/contact" style={{ color: 'var(--text-secondary, #666)', textDecoration: 'none', fontSize: '0.9rem' }}>Contact Us</a>
                <a href="/privacy-policy" style={{ color: 'var(--text-secondary, #666)', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</a>
              </div>
              <div className="social-links" style={{ marginTop: '1.2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <a href="https://www.instagram.com/flashipk/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: 'var(--text-secondary, #666)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E1306C'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary, #666)'}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} FLASHI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {showPremiumPopup && (
        <div className="modal-overlay" onClick={closePremiumPopup}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <button className="modal-close" onClick={closePremiumPopup}>×</button>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
            <h3>Upgrade to FLASHI Premium</h3>
            <p style={{ marginBottom: '24px', lineHeight: '1.6' }}>
              Get exclusive sale alerts from Limelight & Sapphire and price drop notifications across all stores!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="/subscribe" className="submit-btn" style={{ display: 'inline-block', textDecoration: 'none', width: '100%', padding: '12px 0' }}>
                Learn More
              </a>
              <button
                onClick={closePremiumPopup}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary, #666)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
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
