'use client';

import { useState, useEffect } from 'react';

function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) return 'N/A';
  return `Rs. ${Math.round(Number(value)).toLocaleString('en-PK')}`;
}

const storesConfig = [
  {
    name: 'Limelight',
    url: 'https://www.limelight.pk/collections/sale',
    domain: 'limelight.pk',
    offer: 'Special Sale Collection'
  },
  {
    name: 'Sapphire',
    url: 'https://pk.sapphireonline.pk/collections/sale',
    domain: 'sapphireonline.pk',
    offer: 'Discounted Items'
  },
  {
    name: 'Daraz',
    url: 'https://www.daraz.pk/catalog/?q=sale&_keyori=ss&from=input&spm=a2a0e.searchlist.search.go.6a091e2c9n2w8F',
    domain: 'daraz.pk',
    offer: 'Flash Sales & Deals'
  },
  {
    name: 'Naheed',
    url: 'https://www.naheed.pk/special-offers?utm_source=website&utm_medium=onsalefloatingicon&utm_campaign=generic',
    domain: 'naheed.pk',
    offer: 'Special Offers'
  },
  {
    name: 'Highfy',
    url: 'https://highfy.pk/collections/flat-50-sku',
    domain: 'highfy.pk',
    offer: 'Flat 50% Off'
  }
];

export default function SalesClient() {
  const [selectedStore, setSelectedStore] = useState(null);
  const [productsCache, setProductsCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('flashi_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // Check premium status
        fetch(`/api/subscription?email=${encodeURIComponent(parsed.email)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.status === 'active') {
              setIsPremium(true);
            }
            setAuthChecking(false);
          })
          .catch(() => setAuthChecking(false));
      } catch (e) {
        setAuthChecking(false);
      }
    } else {
      setAuthChecking(false);
    }
  }, []);

  const handleStoreClick = async (store) => {
    setSelectedStore(store);

    if (productsCache[store.name]) {
      return; // Already fetched
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/sales?url=${encodeURIComponent(store.url)}`);
      const data = await res.json();
      if (data.success && data.products) {
        const sortedProducts = data.products.sort((a, b) => {
          const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) : 0;
          const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) : 0;
          return discountB - discountA;
        });
        setProductsCache(prev => ({ ...prev, [store.name]: sortedProducts }));
      }
    } catch (error) {
      console.error(`Failed to fetch sales for ${store.name}`, error);
      setProductsCache(prev => ({ ...prev, [store.name]: [] }));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedStore(null);
  };

  const currentProducts = selectedStore ? productsCache[selectedStore.name] : [];

  if (authChecking) {
    return (
      <section style={{ padding: '80px 0', background: 'var(--bg-primary, #fff)', textAlign: 'center' }}>
        <div className="container">
          <div className="live-loading-indicator" style={{ margin: '0 auto', justifyContent: 'center' }}>
            <span className="live-dot"></span>
            Verifying Premium Access...
          </div>
        </div>
      </section>
    );
  }

  if (!user || !isPremium) {
    return (
      <section style={{ padding: '100px 0', background: 'var(--bg-primary, #fff)', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
            Premium Members Only
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Access to our live Special Discounts & Sales feed is exclusively available to FLASHI Premium subscribers.
          </p>
          {!user ? (
            <a href="/" className="submit-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Login to Check Status
            </a>
          ) : (
            <a href="/subscribe" className="submit-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Upgrade to Premium
            </a>
          )}
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: '80px 0', background: 'var(--bg-primary, #fff)' }}>
      <div className="container">
        
        {!selectedStore ? (
          <>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Select a Store</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Click on any store below to instantly browse their active sale collection directly here.</p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {storesConfig.map(store => (
                <div 
                  key={store.name}
                  onClick={() => handleStoreClick(store)}
                  className="step-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '2.5rem 1.5rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${store.domain}&sz=128`} 
                    alt={store.name} 
                    style={{ width: '64px', height: '64px', marginBottom: '1rem', borderRadius: '50%' }} 
                  />
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', fontWeight: 700 }}>{store.name}</h3>
                  <div style={{
                    background: '#e8f5e9',
                    color: '#2e7d32',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}>
                    {store.offer}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  onClick={handleBack}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#334155'
                  }}
                >
                  ← Back to Stores
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${selectedStore.domain}&sz=64`} 
                    alt={selectedStore.name} 
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }} 
                  />
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>{selectedStore.name} Sale</h2>
                </div>
              </div>
              
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8f9fa', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.9rem' }}>
                  <span className="live-dot" style={{ display: 'inline-block', width: '8px', height: '8px', background: '#eab308', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                  Fetching latest products...
                </div>
              )}
            </div>

            {loading ? (
              <div className="loading-grid">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-btn"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="products-grid">
                {currentProducts?.map((product, index) => (
                  <article className="product-card" key={`${product.store}-${index}`}>
                    <div className="store-badge" style={{ background: product.storeColor || '#6366f1' }}>
                      {product.store}
                    </div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#ef4444',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        zIndex: 2,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    )}
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
                
                {currentProducts?.length === 0 && !loading && (
                  <div style={{ textAlign: 'center', padding: '4rem 0', gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No sale products found</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Check back later for new discounts and sales on {selectedStore.name}.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
