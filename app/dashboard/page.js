'use client';

import { useState, useEffect } from 'react';
import SalesNavLink from '../components/SalesNavLink';
import UserHeaderActions from '../components/UserHeaderActions';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(500);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Fetch current price
    fetch('/api/subscription/price')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCurrentPrice(data.price);
      })
      .catch(console.error);

    const storedUser = localStorage.getItem('flashi_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);

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
    } else {
      window.location.href = '/';
    }

    const storedFavs = localStorage.getItem('flashi_favorites');
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {}
    }
    
    const handleFavChange = () => {
      try {
        const favs = JSON.parse(localStorage.getItem('flashi_favorites') || '[]');
        setFavorites(favs);
      } catch (e) {}
    };
    window.addEventListener('favorites_changed', handleFavChange);
    return () => window.removeEventListener('favorites_changed', handleFavChange);

  }, []);

  const handleLogout = () => {
    localStorage.removeItem('flashi_user');
    window.location.href = '/';
  };

  const removeFromFavorites = (url) => {
    try {
      let favs = JSON.parse(localStorage.getItem('flashi_favorites') || '[]');
      favs = favs.filter(f => f.url !== url);
      localStorage.setItem('flashi_favorites', JSON.stringify(favs));
      window.dispatchEvent(new Event('favorites_changed'));
    } catch (e) {}
  };

  if (!user) return null;

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
            <a href="/subscribe" className="nav-link" onClick={() => setMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Premium</a>
          </nav>
          <UserHeaderActions />
          <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </header>

      <section style={{ padding: '40px 0', minHeight: '80vh', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
            <h1 style={{ fontSize: '2.5rem', margin: 0 }}>My Dashboard</h1>
            <button onClick={handleLogout} style={{ background: 'var(--accent-error)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Logout
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {/* General Info */}
            <div style={{ background: 'var(--bg-secondary)', padding: '25px', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                👤 General Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <span style={{ color: 'var(--secondary-text)' }}>Username:</span>
                  <strong>{user?.full_name || user?.name || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}>
                  <span style={{ color: 'var(--secondary-text)' }}>Email:</span>
                  <strong>{user?.email}</strong>
                </div>
              </div>
            </div>

            {/* Plan Details */}
            <div style={{ background: 'var(--bg-secondary)', padding: '25px', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                💎 Plan Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <span style={{ color: 'var(--secondary-text)' }}>Current Plan:</span>
                  <strong>{subscriptionStatus ? 'FLASHI Premium' : 'Free Plan'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <span style={{ color: 'var(--secondary-text)' }}>Status:</span>
                  <strong style={{
                    color: subscriptionStatus === 'active' ? 'var(--accent-success)' : (subscriptionStatus === 'pending' ? '#eab308' : 'var(--secondary-text)'),
                    textTransform: 'capitalize'
                  }}>
                    {subscriptionStatus || 'Inactive'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}>
                  <span style={{ color: 'var(--secondary-text)' }}>Price:</span>
                  <strong>Rs. {currentPrice}/mo</strong>
                </div>
              </div>
              {!subscriptionStatus && (
                <a href="/subscribe" style={{ display: 'block', textAlign: 'center', background: 'var(--gradient-primary)', color: 'white', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', marginTop: '15px' }}>
                  Upgrade to Premium
                </a>
              )}
            </div>
          </div>

          {/* Favorite Products */}
          <div style={{ background: 'var(--bg-secondary)', padding: '25px', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              ❤️ Favorite Products
            </h3>
            {favorites.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--secondary-text)' }}>
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>🛒</div>
                <p>You haven't saved any favorite products yet.</p>
                <a href="/" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold' }}>Browse products</a>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {favorites.map((fav, i) => (
                  <div key={i} style={{ background: 'var(--bg-primary)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <button 
                      onClick={() => removeFromFavorites(fav.url)}
                      style={{ position: 'absolute', top: '8px', right: '8px', background: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', color: '#ef4444', zIndex: 2 }}
                      title="Remove"
                    >
                      ×
                    </button>
                    <div style={{ height: '160px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '10px' }}>
                      <img src={fav.image} alt={fav.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ padding: '15px' }}>
                      <div style={{ fontSize: '12px', color: fav.storeColor || 'var(--primary)', fontWeight: 'bold', marginBottom: '6px' }}>{fav.store}</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '10px' }}>{fav.title}</div>
                      <div style={{ color: 'var(--accent-warning)', fontWeight: 'bold', fontSize: '16px' }}>Rs. {fav.price?.toLocaleString()}</div>
                      <a href={fav.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '6px', marginTop: '15px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>View Deal</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>
    </main>
  );
}
