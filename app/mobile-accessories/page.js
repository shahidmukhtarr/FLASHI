import CategoryClient from '../components/CategoryClient';

export const metadata = {
  title: 'Mobile Accessories Price in Pakistan — Covers, Chargers, Cables | Flashi',
  description: 'Find cheapest mobile accessories in Pakistan. Compare phone covers, screen protectors, cables, ring lights & more from 50+ stores. Budget accessories from Rs. 200. Updated prices daily on Flashi.pk',
  keywords: 'mobile accessories pakistan, phone cover price pakistan, screen protector pakistan, phone holder car pakistan, ring light price pakistan, mobile stand pakistan, otg cable pakistan, selfie stick pakistan, pop socket pakistan',
  alternates: {
    canonical: 'https://flashi.pk/mobile-accessories',
  },
  openGraph: {
    title: 'Mobile Accessories in Pakistan — Compare Prices from 50+ Stores | Flashi',
    description: 'Find the cheapest mobile accessories in Pakistan. Covers, screen protectors, cables & more.',
    images: ['/logo.png'],
    type: 'website',
    locale: 'en_PK',
    siteName: 'Flashi',
    url: 'https://flashi.pk/mobile-accessories',
  },
};

const searchQueries = ['mobile cover', 'screen protector', 'phone holder', 'ring light', 'mobile stand', 'phone case'];

const faqs = [
  {
    question: 'Where to buy cheap mobile accessories in Pakistan?',
    answer: 'The cheapest mobile accessories in Pakistan can be found on Daraz, AliExpress, and local shops. However, prices vary a lot between sellers. Use Flashi to compare prices across 50+ Pakistani stores and find the absolute lowest price.',
  },
  {
    question: 'How much does a phone screen protector cost in Pakistan?',
    answer: 'Screen protectors in Pakistan cost between Rs. 100 for basic plastic protectors to Rs. 1,500 for premium tempered glass. Most popular phone models have options in the Rs. 200-500 range. Compare prices on Flashi to get the best deal.',
  },
  {
    question: 'Which phone cases are best for protection in Pakistan?',
    answer: 'For best protection, look for silicone cases with raised edges, hybrid armor cases, or rugged cases from brands like Spigen, Nillkin, or OtterBox. Budget options start from Rs. 200. Compare all options across Pakistani stores on Flashi.',
  },
  {
    question: 'Are ring lights worth buying for content creation?',
    answer: 'Yes, ring lights are essential for TikTok, YouTube, and video calls. Budget ring lights in Pakistan start from Rs. 500 for small clip-on models, while professional 10-18 inch ring lights with tripod cost Rs. 1,500-5,000.',
  },
  {
    question: 'What mobile accessories do I need for my new phone?',
    answer: 'Essential mobile accessories include a protective case (Rs. 200-2,000), screen protector (Rs. 200-800), fast charger (Rs. 1,000-3,000), and a car phone holder (Rs. 300-1,500). Use Flashi to compare prices for all of these.',
  },
];

const relatedCategories = [
  { name: 'Chargers & Power Banks', href: '/chargers-power-banks', emoji: '🔌' },
  { name: 'Wireless Earbuds', href: '/wireless-earbuds', emoji: '🎧' },
  { name: 'Smart Watches', href: '/smart-watches', emoji: '⌚' },
  { name: 'Gaming Accessories', href: '/gaming-accessories', emoji: '🎮' },
];

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://flashi.pk' },
    { '@type': 'ListItem', position: 2, name: 'Mobile Accessories', item: 'https://flashi.pk/mobile-accessories' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
};

export default function MobileAccessoriesPage() {
  return (
    <CategoryClient
      categoryName="Mobile Accessories"
      categorySlug="mobile-accessories"
      searchQueries={searchQueries}
      heroEmoji="📱"
      heroDescription="Compare mobile accessory prices from Daraz, PriceOye, Mega.pk & 50+ Pakistani stores. Find the best deals on phone covers, screen protectors, ring lights, cables & more. Starting from Rs. 200."
      faqs={faqs}
      relatedCategories={relatedCategories}
      breadcrumbSchema={breadcrumbSchema}
      faqSchema={faqSchema}
    />
  );
}
