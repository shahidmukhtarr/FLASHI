import CategoryClient from '../components/CategoryClient';

export const metadata = {
  title: 'Gaming Accessories Price in Pakistan 2026 — Headsets, Mouse, Keyboards | Flashi',
  description: 'Compare gaming headset, mouse & keyboard prices in Pakistan. Budget gaming gear from Rs. 1,000. Find the best deals across Daraz, PriceOye & 50+ stores. PUBG controllers, RGB keyboards & more on Flashi.pk',
  keywords: 'gaming headset price in pakistan, gaming mouse pakistan, gaming keyboard price pakistan, pubg controller pakistan, budget gaming accessories, gaming chair pakistan, rgb keyboard under 5000, gaming mouse pad pakistan',
  alternates: {
    canonical: 'https://flashi.pk/gaming-accessories',
  },
  openGraph: {
    title: 'Gaming Accessories in Pakistan — Compare Prices from 50+ Stores | Flashi',
    description: 'Find the lowest prices on gaming headsets, mouse, keyboards & controllers in Pakistan.',
    images: ['/logo.png'],
    type: 'website',
    locale: 'en_PK',
    siteName: 'Flashi',
    url: 'https://flashi.pk/gaming-accessories',
  },
};

const searchQueries = ['gaming headset', 'gaming mouse', 'gaming keyboard', 'game controller', 'gaming pad'];

const faqs = [
  {
    question: 'What is the best budget gaming mouse in Pakistan?',
    answer: 'Popular budget gaming mice in Pakistan include Logitech G102, Redragon M601, and A4Tech Bloody A60. Prices start from Rs. 1,500 for basic gaming mice. Use Flashi to compare prices across 50+ stores.',
  },
  {
    question: 'Where to buy gaming accessories in Pakistan?',
    answer: 'Gaming accessories are available on Daraz, PriceOye, Mega.pk, Shophive, Czone, and local gaming shops. Online stores often have better prices. Compare all options at once with Flashi.',
  },
  {
    question: 'How much does a gaming headset cost in Pakistan?',
    answer: 'Gaming headsets in Pakistan range from Rs. 1,500 for budget options to Rs. 30,000+ for premium brands like HyperX and SteelSeries. Good mid-range options like Redragon and Fantech are available from Rs. 3,000-8,000.',
  },
  {
    question: 'What is the best PUBG controller for mobile in Pakistan?',
    answer: 'Popular PUBG mobile controllers in Pakistan include GameSir, iPega, and various trigger-style controllers. Prices range from Rs. 500 for basic triggers to Rs. 5,000 for full gamepad controllers. Compare all options on Flashi.',
  },
  {
    question: 'Is RGB keyboard worth buying in Pakistan?',
    answer: 'RGB mechanical keyboards add aesthetics and typing feel to your gaming setup. Budget RGB keyboards from Redragon and Fantech start at Rs. 3,000-5,000 in Pakistan. They are worth it if you game regularly or want an upgraded typing experience.',
  },
];

const relatedCategories = [
  { name: 'Wireless Earbuds', href: '/wireless-earbuds', emoji: '🎧' },
  { name: 'Smart Watches', href: '/smart-watches', emoji: '⌚' },
  { name: 'Mobile Accessories', href: '/mobile-accessories', emoji: '📱' },
  { name: 'Chargers & Power Banks', href: '/chargers-power-banks', emoji: '🔌' },
];

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://flashi.pk' },
    { '@type': 'ListItem', position: 2, name: 'Gaming Accessories', item: 'https://flashi.pk/gaming-accessories' },
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

export default function GamingAccessoriesPage() {
  return (
    <CategoryClient
      categoryName="Gaming Accessories"
      categorySlug="gaming-accessories"
      searchQueries={searchQueries}
      heroEmoji="🎮"
      heroDescription="Compare gaming headset, mouse, keyboard & controller prices from Daraz, PriceOye, Mega.pk & 50+ Pakistani stores. Budget gaming gear from Rs. 1,000. Level up your setup for less."
      faqs={faqs}
      relatedCategories={relatedCategories}
      breadcrumbSchema={breadcrumbSchema}
      faqSchema={faqSchema}
    />
  );
}
