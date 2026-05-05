import BlogGrid from './BlogGrid';

/* ── SEO Metadata ── */
export const metadata = {
  title: 'FLASHI Blog | Price Comparison Tips & Online Shopping Guides Pakistan',
  description: 'Expert shopping guides, price comparison tips, product reviews and money-saving strategies for online shoppers in Pakistan. Compare prices on Daraz, PriceOye, Mega.pk & more.',
  keywords: 'price comparison Pakistan blog, online shopping tips Pakistan, Daraz deals, PriceOye vs Daraz, best prices Pakistan, save money online shopping Pakistan, flash sales Pakistan',
  robots: 'index, follow',
  openGraph: {
    title: 'FLASHI Blog | Smart Shopping Tips & Price Comparison Guides',
    description: 'Expert advice on finding the lowest prices across Pakistani online stores — Daraz, PriceOye, Mega.pk, Sapphire, Limelight & more.',
    type: 'website',
    locale: 'en_PK',
    siteName: 'FLASHI',
    url: 'https://flashi.pk/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FLASHI Blog | Price Comparison Tips Pakistan',
    description: 'Expert shopping guides to help you find the lowest prices in Pakistan.',
  },
  alternates: {
    canonical: 'https://flashi.pk/blog',
  },
};

export default function BlogPage() {
  return <BlogGrid />;
}
