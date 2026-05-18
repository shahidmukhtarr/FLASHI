'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import FavoriteButton from './FavoriteButton';

function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) return 'N/A';
  return `Rs. ${Math.round(Number(value)).toLocaleString('en-PK')}`;
}

export default function CategoryClient({
  categoryName,
  categorySlug,
  searchQueries,
  heroEmoji,
  heroDescription,
  faqs,
  relatedCategories,
  breadcrumbSchema,
  faqSchema,
  seoKeywords = [],
  popularBrands = [],
  popularStores = [],
  seoContent = '',
  initialProducts = [],
}) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [sortKey, setSortKey] = useState('price-asc');
  const [storeFilter, setStoreFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;

  useEffect(() => {
    if (initialProducts.length > 0) return;

    async function loadProducts() {
      setLoading(true);
      try {
        // Fetch ALL search queries in PARALLEL for instant loading
        const results = await Promise.all(
          searchQueries.map(q =>
            fetch(`/api/products?q=${encodeURIComponent(q)}&limit=1000`)
              .then(res => res.json())
              .catch(() => ({ products: [] }))
          )
        );

        // Merge and deduplicate
        const allProducts = [];
        const seen = new Set();
        for (const data of results) {
          if (data.products) {
            for (const p of data.products) {
              const key = `${p.title}-${p.store}-${p.price}`;
              if (!seen.has(key)) {
                seen.add(key);
                allProducts.push(p);
              }
            }
          }
        }
        setProducts(allProducts);
      } catch (err) {
        console.error('Failed to load category products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [searchQueries]);

  const availableStores = useMemo(() => {
    const stores = new Set(products.map(p => p.store).filter(Boolean));
    return Array.from(stores).sort();
  }, [products]);

  const sortedProducts = useMemo(() => {
    let list = [...products];
    if (storeFilter !== 'all') {
      list = list.filter(p => p.store === storeFilter);
    }
    
    switch (sortKey) {
      case 'price-asc':
        return list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
      case 'price-desc':
        return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case 'rating':
        return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      default:
        return list.sort((a, b) => {
          const imgA = a.image ? 1 : 0;
          const imgB = b.image ? 1 : 0;
          if (imgA !== imgB) return imgB - imgA;
          const scoreA = (a.rating || 0) * 5 + Math.min(a.reviewCount || 0, 50);
          const scoreB = (b.rating || 0) * 5 + Math.min(b.reviewCount || 0, 50);
          if (scoreA !== scoreB) return scoreB - scoreA;
          return (a.price ?? Infinity) - (b.price ?? Infinity);
        });
    }
  }, [products, sortKey, storeFilter]);

  const priceStats = useMemo(() => {
    const prices = products.map(p => p.price).filter(v => v != null && !isNaN(Number(v)));
    if (prices.length === 0) return null;
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  // Generate ItemList schema for SEO (shows product listings in Google)
  const itemListSchema = useMemo(() => {
    if (products.length === 0) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${categoryName} Prices in Pakistan`,
      description: heroDescription,
      url: `https://flashi.pk/${categorySlug}`,
      numberOfItems: products.length,
      itemListElement: sortedProducts.slice(0, 30).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: p.title,
          image: p.image || undefined,
          url: p.url,
          offers: {
            '@type': 'Offer',
            price: p.price,
            priceCurrency: 'PKR',
            availability: p.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: p.store,
            },
          },
        },
      })),
    };
  }, [products, sortedProducts, categoryName, categorySlug, heroDescription]);

  return (
    <>
      {/* Breadcrumb + FAQ + ItemList Schema — all rendered server-side for Google */}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}

      {/* Header with Back Button and Logo */}
      <header className="header">
        <div className="container" style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: 'rgba(46, 125, 50, 0.1)', 
              color: 'var(--primary)',
              border: 'none',
              cursor: 'pointer',
              marginRight: '15px',
              transition: 'all 0.2s'
            }}
            aria-label="Go back"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <Link href="/" className="logo" onClick={() => {
            sessionStorage.removeItem('flashi_search_cache');
            localStorage.removeItem('flashi_last_search');
            window.dispatchEvent(new Event('reset-home'));
          }}>
            <span className="logo-icon">
              <img src="/logo.png" alt="FLASHI" width="32" height="32" style={{ borderRadius: '6px', objectFit: 'cover' }} />
            </span>
            <span className="logo-text">FLASHI</span>
          </Link>
        </div>
      </header>

      {/* Breadcrumb Navigation — renders instantly */}
      <nav className="category-breadcrumb" aria-label="Breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            <li><Link href="/" onClick={() => {
              sessionStorage.removeItem('flashi_search_cache');
              localStorage.removeItem('flashi_last_search');
              window.dispatchEvent(new Event('reset-home'));
            }}>Home</Link></li>
            <li aria-current="page">{categoryName}</li>
          </ol>
        </div>
      </nav>

      {/* Hero Section — renders instantly, no API dependency */}
      <section 
        className="category-hero"
        style={
          {
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url("${
              {
                'wireless-earbuds': '/earbuds.jpg',
                'smart-watches': '/smartwatch.jpg',
                'chargers-power-banks': '/chargers and powerbanks.jpg',
                'gaming-accessories': '/gaming accessories.jpg',
                'mobile-accessories': '/mobile accessories.jpg',
                'fashion-clothing': '/cloths and fashion.jpg'
              }[categorySlug] || ''
            }")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }
        }
      >
        <div className="container">
          <div className="category-hero-content">
            <h1 className="category-hero-title">{categoryName} — Best Prices in Pakistan</h1>
            {priceStats && (
              <div className="category-price-summary">
                <span className="category-price-tag">
                  Prices from <strong>{formatPrice(priceStats.min)}</strong> to <strong>{formatPrice(priceStats.max)}</strong>
                </span>
                <span className="category-product-count">{products.length} products found</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SEO Keyword Prose — renders just below hero and above products */}
      {seoContent && (
        <section className="category-seo-section" style={{ padding: '2rem 0 0.5rem' }}>
          <div className="container">
            <div className="category-seo-prose" style={{ maxWidth: '1000px', textAlign: 'center', margin: '0 auto' }}>
              <p>{seoContent}</p>
            </div>
          </div>
        </section>
      )}

      {/* Product Grid */}
      <section className="category-products">
        <div className="container">
          <div className="category-controls">
            <div className="category-results-count">
              {loading ? 'Loading products...' : `${products.length} products from 50+ stores`}
            </div>
            <div className="sort-group" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label className="sort-label">Store</label>
                <select className="sort-select" value={storeFilter} onChange={e => { setStoreFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="all">All Popular Stores</option>
                  {availableStores.map(store => (
                    <option key={store} value={store}>{store}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label className="sort-label">Sort by</label>
                <select className="sort-select" value={sortKey} onChange={e => { setSortKey(e.target.value); setCurrentPage(1); }}>
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Best Rating</option>
              </select>
              </div>
            </div>
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
            <>
              <div className="products-grid">
                {sortedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((product, index) => (
                  <article className="product-card" key={`${product.id || product.title}-${index}`}>
                    <div className="store-badge" style={{ background: product.storeColor || '#6366f1' }}>
                      {product.store}
                    </div>
                    <FavoriteButton product={product} />
                    <div className="product-image-wrap">
                      {product.image ? (
                        <img src={product.image} alt={`${product.title} price in Pakistan`} className="product-image" loading="lazy" />
                      ) : (
                        <div className="product-image-placeholder">📦</div>
                      )}
                    </div>
                    <div className="product-info">
                      <a 
                        href={product.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="product-title"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(product.url, '_system') || window.open(product.url, '_blank');
                        }}
                      >
                        {product.title}
                      </a>
                      <div className="product-price-row">
                        <span className="product-price">{formatPrice(product.price)}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="product-original-price">{formatPrice(product.originalPrice)}</span>
                        )}
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
                        <a 
                          href={product.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="product-visit-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(product.url, '_system') || window.open(product.url, '_blank');
                          }}
                        >
                          Visit Store →
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {sortedProducts.length > ITEMS_PER_PAGE && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setCurrentPage(p => Math.max(p - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={currentPage === 1}
                    style={{
                      padding: '10px 22px', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: currentPage === 1 ? '#f1f5f9' : 'var(--gradient-primary)',
                      color: currentPage === 1 ? '#94a3b8' : '#fff',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold', fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    ← Previous
                  </button>
                  <span style={{ fontWeight: 700, color: 'var(--secondary-text)', fontSize: 'var(--font-size-sm)' }}>
                    Page {currentPage} of {Math.ceil(sortedProducts.length / ITEMS_PER_PAGE)}
                  </span>
                  <button
                    onClick={() => { setCurrentPage(p => Math.min(p + 1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE))); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={currentPage >= Math.ceil(sortedProducts.length / ITEMS_PER_PAGE)}
                    style={{
                      padding: '10px 22px', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: currentPage >= Math.ceil(sortedProducts.length / ITEMS_PER_PAGE) ? '#f1f5f9' : 'var(--gradient-primary)',
                      color: currentPage >= Math.ceil(sortedProducts.length / ITEMS_PER_PAGE) ? '#94a3b8' : '#fff',
                      cursor: currentPage >= Math.ceil(sortedProducts.length / ITEMS_PER_PAGE) ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold', fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* SEO Tags — visible to Google crawler, renders instantly at the bottom */}
      {(popularBrands.length > 0 || popularStores.length > 0) && (
        <section className="category-seo-section" style={{ padding: '3rem 0 1rem' }}>
          <div className="container">
            {popularBrands.length > 0 && (
              <div className="category-seo-tags">
                <h2 className="category-seo-tags-title">Popular {categoryName} Brands in Pakistan</h2>
                <div className="category-seo-tag-list">
                  {popularBrands.map(brand => (
                    <span key={brand} className="category-seo-tag">{brand}</span>
                  ))}
                </div>
              </div>
            )}
            {popularStores.length > 0 && (
              <div className="category-seo-tags" style={{ marginTop: '1rem' }}>
                <h3 className="category-seo-tags-title">Compare {categoryName} Prices From</h3>
                <div className="category-seo-tag-list">
                  {popularStores.map(store => (
                    <span key={store} className="category-seo-tag store-tag">{store}</span>
                  ))}
                </div>
              </div>
            )}
            {seoKeywords.length > 0 && (
              <div className="category-seo-tags" style={{ marginTop: '1rem' }}>
                <h3 className="category-seo-tags-title">Related Searches</h3>
                <div className="category-seo-tag-list">
                  {seoKeywords.map(kw => (
                    <span key={kw} className="category-seo-tag keyword-tag">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="category-cta">
        <div className="container">
          <div className="category-cta-card">
            <h2>Can&apos;t Find What You&apos;re Looking For?</h2>
            <p>Search any product by name or paste a URL to compare prices across 50+ Pakistani stores instantly.</p>
            <Link href="/" className="category-cta-btn">
              🔍 Search on Flashi
            </Link>
          </div>
        </div>
      </section>

      {/* Related Categories */}
      {relatedCategories && relatedCategories.length > 0 && (
        <section className="category-related">
          <div className="container">
            <h2>Related Categories</h2>
            <div className="category-related-grid">
              {relatedCategories.map(cat => (
                <Link href={cat.href} key={cat.href} className="category-related-card">
                  <span className="category-related-emoji">{cat.emoji}</span>
                  <span className="category-related-name">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section — renders instantly for Google */}
      {faqs && faqs.length > 0 && (
        <section className="category-faq">
          <div className="container">
            <h2>Frequently Asked Questions</h2>
            <div className="category-faq-list">
              {faqs.map((faq, i) => (
                <details key={i} className="category-faq-item">
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="category-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} FLASHI. All rights reserved. | <Link href="/" onClick={() => {
            sessionStorage.removeItem('flashi_search_cache');
            localStorage.removeItem('flashi_last_search');
            window.dispatchEvent(new Event('reset-home'));
          }}>Home</Link> | <Link href="/privacy-policy">Privacy Policy</Link></p>
        </div>
      </footer>
    </>
  );
}
