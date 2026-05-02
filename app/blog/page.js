'use client';

import Link from 'next/link';
import SalesNavLink from '../components/SalesNavLink';


const LogoSVG = () => (
  <img src="/logo.png" alt="FLASHI" width="32" height="32" style={{ borderRadius: '6px', objectFit: 'cover' }} />
);

const blogPosts = [
  {
    slug: 'how-to-compare-prices-online-pakistan',
    title: 'How to Compare Prices Online in Pakistan: A Complete Guide',
    excerpt: 'Learn the best strategies for comparing prices across Pakistani e-commerce platforms like Daraz, PriceOye, and Mega.pk. Save thousands on every purchase with these expert tips.',
    category: 'Shopping Guide',
    date: 'April 28, 2026',
    readTime: '8 min read',
    icon: '🔍',
    color: '#369632',
  },
  {
    slug: 'best-smartphones-under-50000-pakistan',
    title: 'Best Smartphones Under Rs. 50,000 in Pakistan (2026)',
    excerpt: 'Looking for the best value smartphone in Pakistan? We compare prices and features of the top phones under Rs. 50,000 available on Daraz, PriceOye, and other leading stores.',
    category: 'Product Reviews',
    date: 'April 25, 2026',
    readTime: '10 min read',
    icon: '📱',
    color: '#6366f1',
  },
  {
    slug: 'online-shopping-safety-tips-pakistan',
    title: '10 Essential Online Shopping Safety Tips for Pakistani Shoppers',
    excerpt: 'Protect yourself from scams and fraud while shopping online in Pakistan. From verifying sellers to secure payment methods, here are 10 must-know safety tips.',
    category: 'Safety & Security',
    date: 'April 22, 2026',
    readTime: '7 min read',
    icon: '🛡️',
    color: '#ef4444',
  },
  {
    slug: 'daraz-vs-priceoye-which-is-better',
    title: 'Daraz vs PriceOye: Which Online Store Offers Better Deals?',
    excerpt: 'A comprehensive comparison of Pakistan\'s two biggest online marketplaces. We analyze pricing, product range, delivery speed, and customer service to help you decide.',
    category: 'Store Comparison',
    date: 'April 20, 2026',
    readTime: '9 min read',
    icon: '⚡',
    color: '#f59e0b',
  },
  {
    slug: 'save-money-online-shopping-pakistan',
    title: '15 Proven Ways to Save Money While Shopping Online in Pakistan',
    excerpt: 'Discover practical money-saving strategies for online shopping in Pakistan. From coupon codes to cashback offers, flash sales to price tracking — maximize your savings.',
    category: 'Money Saving',
    date: 'April 18, 2026',
    readTime: '12 min read',
    icon: '💰',
    color: '#10b981',
  },
  {
    slug: 'best-laptops-for-students-pakistan',
    title: 'Top 10 Best Laptops for Students in Pakistan (Budget-Friendly)',
    excerpt: 'Finding the perfect laptop for studies doesn\'t have to break the bank. We compare the best budget-friendly laptops available in Pakistan with price comparisons across stores.',
    category: 'Product Reviews',
    date: 'April 15, 2026',
    readTime: '11 min read',
    icon: '💻',
    color: '#8b5cf6',
  },
  {
    slug: 'understanding-flash-sales-pakistan',
    title: 'Understanding Flash Sales in Pakistan: How to Never Miss a Deal',
    excerpt: 'Flash sales on Daraz, Limelight, and Sapphire can save you up to 70%. Learn how these sales work, when they happen, and how to set up alerts so you never miss one.',
    category: 'Shopping Guide',
    date: 'April 12, 2026',
    readTime: '6 min read',
    icon: '🔔',
    color: '#ec4899',
  },
  {
    slug: 'ecommerce-growth-pakistan-2026',
    title: 'The Rise of E-Commerce in Pakistan: 2026 Trends & Statistics',
    excerpt: 'Pakistan\'s e-commerce sector is booming. Explore the latest trends, growth statistics, popular product categories, and what the future holds for online shopping in Pakistan.',
    category: 'Industry Insights',
    date: 'April 10, 2026',
    readTime: '9 min read',
    icon: '📊',
    color: '#0ea5e9',
  },
  {
    slug: 'how-price-comparison-engines-work',
    title: 'How Price Comparison Engines Like FLASHI Work Behind the Scenes',
    excerpt: 'Ever wondered how FLASHI instantly compares prices from multiple stores? Discover the technology behind price comparison engines and how they help you find the best deals.',
    category: 'Technology',
    date: 'April 8, 2026',
    readTime: '7 min read',
    icon: '⚙️',
    color: '#64748b',
  },
  {
    slug: 'best-fashion-brands-online-pakistan',
    title: 'Best Pakistani Fashion Brands to Shop Online: Sapphire, Limelight & More',
    excerpt: 'Explore Pakistan\'s top fashion brands available online. Compare prices for Sapphire, Limelight, Khaadi, and other premium brands across multiple platforms.',
    category: 'Fashion',
    date: 'April 5, 2026',
    readTime: '8 min read',
    icon: '👗',
    color: '#d946ef',
  },
  {
    slug: 'mobile-accessories-buying-guide-pakistan',
    title: 'Complete Mobile Accessories Buying Guide for Pakistan',
    excerpt: 'From power banks to screen protectors, earbuds to phone cases — this comprehensive guide helps you find the best mobile accessories at the lowest prices in Pakistan.',
    category: 'Buying Guide',
    date: 'April 3, 2026',
    readTime: '10 min read',
    icon: '🎧',
    color: '#14b8a6',
  },
  {
    slug: 'avoid-fake-products-online-pakistan',
    title: 'How to Spot and Avoid Fake Products When Shopping Online in Pakistan',
    excerpt: 'Counterfeit products are a growing concern in Pakistan\'s online marketplace. Learn how to identify fake products, verify authenticity, and protect your purchases.',
    category: 'Safety & Security',
    date: 'March 30, 2026',
    readTime: '8 min read',
    icon: '🚫',
    color: '#ef4444',
  },
  {
    slug: 'cashback-offers-pakistan-guide',
    title: 'Ultimate Guide to Cashback Offers and Rewards in Pakistan',
    excerpt: 'Get money back on every purchase! Discover the best cashback programs, bank offers, and reward systems available for online shoppers in Pakistan.',
    category: 'Money Saving',
    date: 'March 28, 2026',
    readTime: '7 min read',
    icon: '🎁',
    color: '#f97316',
  },
  {
    slug: 'kitchen-appliances-price-comparison-pakistan',
    title: 'Kitchen Appliances Price Comparison: Find the Best Deals in Pakistan',
    excerpt: 'From air fryers to blenders, microwaves to juicers — compare kitchen appliance prices across Daraz, PriceOye, and Mega.pk to find the best value for your home.',
    category: 'Product Reviews',
    date: 'March 25, 2026',
    readTime: '9 min read',
    icon: '🍳',
    color: '#84cc16',
  },
  {
    slug: 'why-prices-differ-across-stores-pakistan',
    title: 'Why the Same Product Has Different Prices Across Pakistani Stores',
    excerpt: 'Have you noticed the same phone or gadget priced differently on Daraz and PriceOye? Understand the economics behind price variations and how to use them to your advantage.',
    category: 'Industry Insights',
    date: 'March 22, 2026',
    readTime: '6 min read',
    icon: '🏷️',
    color: '#06b6d4',
  },
];

export default function BlogPage() {
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
            <Link href="/blog" className="nav-link" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Blog</Link>
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
          <div className="hero-badge" style={{ display: 'inline-block', marginBottom: '1rem' }}>📝 FLASHI Blog</div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            marginBottom: '1.2rem',
            lineHeight: 1.15,
          }}>
            Smart Shopping <span className="highlight-text">Tips & Guides</span>
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary, #666)',
            maxWidth: '620px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Expert advice, product reviews, and money-saving strategies to help you shop smarter across Pakistan's top online stores.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '2rem',
          }}>
            {blogPosts.map((post, index) => (
              <Link
                href={`/blog/${post.slug}`}
                key={post.slug}
                id={`blog-card-${index}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--bg-primary, #fff)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color, #eee)',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Card Top Accent */}
                <div style={{
                  height: '6px',
                  background: `linear-gradient(90deg, ${post.color}, ${post.color}88)`,
                }} />

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Category & Read Time */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <span style={{
                      background: `${post.color}15`,
                      color: post.color,
                      padding: '4px 12px',
                      borderRadius: '50px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}>
                      {post.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #999)' }}>
                      {post.readTime}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{post.icon}</span>
                    <h2 style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      lineHeight: 1.4,
                      margin: 0,
                      color: 'var(--text-primary, #1a1a1a)',
                    }}>
                      {post.title}
                    </h2>
                  </div>

                  {/* Excerpt */}
                  <p style={{
                    fontSize: '0.92rem',
                    color: 'var(--text-secondary, #666)',
                    lineHeight: 1.65,
                    margin: 0,
                    flex: 1,
                  }}>
                    {post.excerpt}
                  </p>

                  {/* Date & Read More */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1.2rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-color, #eee)',
                  }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #999)' }}>
                      {post.date}
                    </span>
                    <span style={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: post.color,
                    }}>
                      Read More →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #369632 0%, #2d7a28 100%)',
        padding: '60px 0',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>
            Ready to Start Saving?
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
            Put these tips into action — search any product and compare prices instantly.
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
          }}>
            Compare Prices Now →
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
