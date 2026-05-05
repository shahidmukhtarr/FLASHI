'use client';
import Link from 'next/link';
import SalesNavLink from '../components/SalesNavLink';
import blogPosts from './blogData';

const LogoSVG = () => (
  <img src="/logo.png" alt="FLASHI" width="32" height="32" style={{ borderRadius: '6px', objectFit: 'cover' }} />
);

export default function BlogGrid() {
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
            Expert advice on price comparison, online shopping deals, and money-saving strategies for Pakistan&apos;s top online stores — Daraz, PriceOye, Mega.pk & more.
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
