import Link from 'next/link';

export const metadata = {
  title: 'Blog & Buying Guides — Pakistan Gadgets & Price Comparison | Flashi',
  description: 'Expert buying guides, price comparisons & deals for Pakistani shoppers. Find the best gadgets, earbuds, smart watches, chargers & more at lowest prices. Updated weekly.',
  keywords: 'pakistan gadgets blog, buying guide pakistan, best earbuds pakistan, smart watch guide pakistan, price comparison guide',
  alternates: { canonical: 'https://flashi.pk/blog' },
  openGraph: {
    title: 'Blog & Buying Guides — Pakistan Gadgets | Flashi',
    description: 'Expert buying guides & price comparisons for Pakistani shoppers.',
    images: ['/logo.png'],
    type: 'website',
    locale: 'en_PK',
    siteName: 'Flashi',
  },
};

const articles = [
  {
    slug: 'best-earbuds-under-2000-pakistan',
    title: 'Best Earbuds Under Rs. 2,000 in Pakistan (2026) — Top 5 Picks',
    excerpt: 'Looking for great wireless earbuds without breaking the bank? We compared prices from 50+ Pakistani stores to find the best earbuds under Rs. 2,000 in 2026.',
    category: 'Wireless Earbuds',
    categoryHref: '/wireless-earbuds',
    emoji: '🎧',
    date: '2026-05-10',
    readTime: '5 min read',
  },
  {
    slug: 'best-smart-watch-under-3000-pakistan',
    title: 'Best Smart Watch Under Rs. 3,000 in Pakistan (2026) — Top 7 Picks',
    excerpt: 'Want a smart watch on a budget? We found the best smart watches under Rs. 3,000 in Pakistan with features like heart rate, step counter & notifications.',
    category: 'Smart Watches',
    categoryHref: '/smart-watches',
    emoji: '⌚',
    date: '2026-05-10',
    readTime: '6 min read',
  },
  {
    slug: 'daraz-vs-priceoye-better-deals',
    title: 'Daraz vs PriceOye: Where to Find Better Prices in Pakistan?',
    excerpt: 'Which platform gives better deals in Pakistan — Daraz or PriceOye? We compared prices on 20 popular products to find out. The results might surprise you.',
    category: 'Shopping Tips',
    categoryHref: '/',
    emoji: '🛒',
    date: '2026-05-10',
    readTime: '4 min read',
  },
  {
    slug: 'best-power-bank-under-3000-pakistan',
    title: 'Best Power Bank Under Rs. 3,000 in Pakistan (2026)',
    excerpt: 'Power cuts in Pakistan make a reliable power bank essential. Here are the best power banks under Rs. 3,000 that we found after comparing across 50+ stores.',
    category: 'Chargers & Power Banks',
    categoryHref: '/chargers-power-banks',
    emoji: '🔋',
    date: '2026-05-10',
    readTime: '5 min read',
  },
  {
    slug: 'how-to-compare-prices-online-pakistan',
    title: 'How to Compare Prices Online in Pakistan & Save Thousands',
    excerpt: 'Pakistani shoppers overpay by an average of Rs. 1,500 per purchase. Learn how to compare prices online and always get the best deal with this step-by-step guide.',
    category: 'Shopping Tips',
    categoryHref: '/',
    emoji: '💡',
    date: '2026-05-10',
    readTime: '4 min read',
  },
  {
    slug: 'best-gaming-mouse-under-3000-pakistan',
    title: 'Best Gaming Mouse Under Rs. 3,000 in Pakistan (2026)',
    excerpt: 'Level up your gaming without spending a fortune. We found the best budget gaming mice under Rs. 3,000 in Pakistan after comparing prices from 30+ stores.',
    category: 'Gaming Accessories',
    categoryHref: '/gaming-accessories',
    emoji: '🎮',
    date: '2026-05-10',
    readTime: '5 min read',
  },
];

export default function BlogPage() {
  return (
    <>
      {/* Blog Hero */}
      <section className="blog-hero">
        <div className="container">
          <div className="hero-badge" style={{ margin: '0 auto 1rem' }}>📰 Flashi Blog</div>
          <h1 className="blog-hero-title">Buying Guides & Price Comparisons</h1>
          <p className="blog-hero-desc">
            Expert guides to help Pakistani shoppers find the best deals on gadgets, earbuds, smart watches & more.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav className="category-breadcrumb" aria-label="Breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            <li><Link href="/">Home</Link></li>
            <li aria-current="page">Blog</li>
          </ol>
        </div>
      </nav>

      {/* Articles Grid */}
      <section className="blog-listing">
        <div className="container">
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '0.25rem' }}>
            Latest Articles
          </h2>
          <p style={{ color: 'var(--secondary-text)', fontSize: 'var(--font-size-sm)' }}>
            Updated weekly with fresh prices from Pakistan&apos;s top stores
          </p>
          <div className="blog-grid">
            {articles.map((article) => (
              <Link href={`/blog/${article.slug}`} key={article.slug} className="blog-card">
                <div className="blog-card-cover">{article.emoji}</div>
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span className="blog-card-category">{article.category}</span>
                    <span>·</span>
                    <span>{article.readTime}</span>
                    <span>·</span>
                    <time dateTime={article.date}>{new Date(article.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
                  </div>
                  <h2 className="blog-card-title">{article.title}</h2>
                  <p className="blog-card-excerpt">{article.excerpt}</p>
                  <span className="blog-card-read-more">Read More →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="category-cta">
        <div className="container">
          <div className="category-cta-card">
            <h2>Compare Prices Instantly</h2>
            <p>Search any product and find the lowest price from 50+ Pakistani stores in seconds.</p>
            <Link href="/" className="category-cta-btn">🔍 Start Comparing</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="category-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} FLASHI. All rights reserved. | <Link href="/">Home</Link> | <Link href="/privacy-policy">Privacy Policy</Link></p>
        </div>
      </footer>
    </>
  );
}
