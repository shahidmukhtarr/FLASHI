const BASE_URL = 'https://flashi.pk';

export default function sitemap() {
  // Static pages
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/subscribe`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/special-discounts`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE_URL}/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  ];

  // Category pages — non-branded SEO landing pages
  const categoryPages = [
    { url: `${BASE_URL}/smart-watches`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/wireless-earbuds`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/chargers-power-banks`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/gaming-accessories`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/mobile-accessories`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  // Blog pages
  const blogPages = [
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/blog/best-earbuds-under-2000-pakistan`, lastModified: new Date('2026-05-10'), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/blog/best-smart-watch-under-3000-pakistan`, lastModified: new Date('2026-05-10'), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/blog/daraz-vs-priceoye-better-deals`, lastModified: new Date('2026-05-10'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/blog/best-power-bank-under-3000-pakistan`, lastModified: new Date('2026-05-10'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/blog/how-to-compare-prices-online-pakistan`, lastModified: new Date('2026-05-10'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/blog/best-gaming-mouse-under-3000-pakistan`, lastModified: new Date('2026-05-10'), changeFrequency: 'monthly', priority: 0.8 },
  ];

  return [...staticPages, ...categoryPages, ...blogPages];
}
