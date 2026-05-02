import Link from 'next/link';
import { notFound } from 'next/navigation';
import blogPosts from '../blogData';

/* ── Static params for SSG ── */
export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

/* ── Dynamic metadata ── */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: 'Post Not Found - FLASHI Blog' };
  return {
    title: `${post.title} - FLASHI Blog`,
    description: post.excerpt,
    keywords: `${post.category}, flashi, pakistan, online shopping, ${post.slug.replace(/-/g, ', ')}`,
    robots: 'index, follow',
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      locale: 'en_PK',
      siteName: 'FLASHI',
    },
  };
}

const LogoSVG = () => (
  <img src="/logo.png" alt="FLASHI" width="32" height="32" style={{ borderRadius: '6px', objectFit: 'cover' }} />
);

export default async function BlogPostPage({ params }) {
  console.log('Incoming params:', params);
  const resolvedParams = await params;
  console.log('Resolved params:', resolvedParams);
  const slug = resolvedParams?.slug;
  const post = blogPosts.find((p) => p.slug === slug);
  console.log('Found post:', post ? 'Yes' : 'No', 'for slug:', slug);
  if (!post) notFound();

  /* Pick 3 related posts (same category first, then others) */
  const related = [
    ...blogPosts.filter((p) => p.slug !== slug && p.category === post.category),
    ...blogPosts.filter((p) => p.slug !== slug && p.category !== post.category),
  ].slice(0, 3);

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
            <Link href="/blog" className="nav-link" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Blog</Link>
            <Link href="/about" className="nav-link">About Us</Link>
            <Link href="/subscribe" className="nav-link" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Premium</Link>
            <Link href="/contact" className="nav-link contact-nav-link">Contact Us</Link>
          </nav>
          <Link href="/contact" className="contact-btn">Contact Us</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--bg-primary, #fff) 0%, var(--bg-secondary, #f8f9fa) 100%)',
        padding: '80px 0 50px',
        borderBottom: '1px solid var(--border-color, #eee)',
      }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <Link href="/blog" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: 'var(--text-secondary, #666)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1.2rem',
          }}>
            ← Back to Blog
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{
              background: `${post.color}15`, color: post.color,
              padding: '5px 14px', borderRadius: '50px', fontSize: '0.82rem', fontWeight: 600,
            }}>
              {post.category}
            </span>
            <span style={{ color: 'var(--text-secondary, #999)', fontSize: '0.85rem' }}>{post.date}</span>
            <span style={{ color: 'var(--text-secondary, #999)', fontSize: '0.85rem' }}>·</span>
            <span style={{ color: 'var(--text-secondary, #999)', fontSize: '0.85rem' }}>{post.readTime}</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800,
            lineHeight: 1.2, marginBottom: '1.2rem',
          }}>
            <span style={{ marginRight: '0.5rem' }}>{post.icon}</span>
            {post.title}
          </h1>

          <p style={{
            fontSize: '1.15rem', color: 'var(--text-secondary, #666)',
            lineHeight: 1.7, maxWidth: '700px',
          }}>
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Article Body */}
      <section style={{ padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          {/* Top accent bar */}
          <div style={{
            height: '4px', width: '60px', borderRadius: '2px',
            background: `linear-gradient(90deg, ${post.color}, ${post.color}88)`,
            marginBottom: '2.5rem',
          }} />

          {post.content.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '2.5rem' }}>
              <h2 style={{
                fontSize: '1.45rem', fontWeight: 700, marginBottom: '0.8rem',
                color: 'var(--text-primary, #1a1a1a)', lineHeight: 1.3,
              }}>
                {section.heading}
              </h2>
              <p style={{
                fontSize: '1.05rem', lineHeight: 1.85,
                color: 'var(--text-secondary, #444)',
              }}>
                {section.body}
              </p>
            </div>
          ))}

          {/* CTA Box */}
          <div style={{
            background: `linear-gradient(135deg, ${post.color}10, ${post.color}05)`,
            border: `1px solid ${post.color}25`,
            borderRadius: '16px', padding: '2rem', textAlign: 'center',
            marginTop: '3rem',
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.6rem' }}>
              Ready to start saving?
            </h3>
            <p style={{ color: 'var(--text-secondary, #666)', marginBottom: '1.2rem', fontSize: '1rem' }}>
              Compare prices across Pakistan&apos;s top stores instantly with FLASHI.
            </p>
            <Link href="/" style={{
              display: 'inline-block', padding: '12px 32px', borderRadius: '50px',
              background: post.color, color: '#fff', textDecoration: 'none',
              fontWeight: 700, fontSize: '0.95rem',
            }}>
              Compare Prices Now →
            </Link>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {related.length > 0 && (
        <section style={{
          background: 'var(--bg-secondary, #f8f9fa)', padding: '60px 0',
          borderTop: '1px solid var(--border-color, #eee)',
        }}>
          <div className="container">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>
              Related Articles
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}>
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} style={{
                  display: 'flex', flexDirection: 'column',
                  background: 'var(--bg-primary, #fff)', borderRadius: '14px',
                  border: '1px solid var(--border-color, #eee)', overflow: 'hidden',
                  textDecoration: 'none', color: 'inherit',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}>
                  <div style={{
                    height: '5px',
                    background: `linear-gradient(90deg, ${r.color}, ${r.color}88)`,
                  }} />
                  <div style={{ padding: '1.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <span style={{
                        background: `${r.color}15`, color: r.color,
                        padding: '3px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600,
                      }}>
                        {r.category}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #999)' }}>{r.readTime}</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.5rem' }}>
                      <span style={{ marginRight: '0.4rem' }}>{r.icon}</span>
                      {r.title}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #666)', lineHeight: 1.5, margin: 0 }}>
                      {r.excerpt}
                    </p>
                    <span style={{ display: 'inline-block', marginTop: '0.8rem', fontSize: '0.88rem', fontWeight: 600, color: r.color }}>
                      Read More →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
