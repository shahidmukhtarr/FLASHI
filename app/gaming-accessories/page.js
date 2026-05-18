import CategoryClient from '../components/CategoryClient';
import { fetchProductsForCategory } from '../../server/services/productFetcher';

export const metadata = {
  title: 'Gaming Accessories Price in Pakistan 2026 — Headsets, Mouse, Keyboards | Flashi',
  description: 'Compare gaming headset, mouse & keyboard prices in Pakistan. Budget gaming gear from Rs. 1,000. Find the best deals across Daraz, PriceOye & 50+ stores on Flashi.pk',
  keywords: 'gaming headset price in pakistan, gaming mouse pakistan, gaming keyboard price pakistan, pubg controller pakistan, rgb keyboard under 5000',
  alternates: { canonical: 'https://flashi.pk/gaming-accessories' },
  openGraph: {
    title: 'Gaming Accessories in Pakistan — Compare Prices from 50+ Stores | Flashi',
    description: 'Find the lowest prices on gaming headsets, mouse, keyboards & controllers in Pakistan.',
    images: ['/logo.png'], type: 'website', locale: 'en_PK', siteName: 'Flashi',
    url: 'https://flashi.pk/gaming-accessories',
  },
};

const searchQueries = ['gaming headset', 'gaming mouse', 'gaming keyboard', 'game controller', 'gaming pad'];

const faqs = [
  { question: 'What is the best budget gaming mouse in Pakistan?', answer: 'Popular budget gaming mice include Logitech G102, Redragon M601, and A4Tech Bloody A60. Prices start from Rs. 1,500. Use Flashi to compare prices across 50+ stores.' },
  { question: 'Where to buy gaming accessories in Pakistan?', answer: 'Gaming accessories are available on Daraz, PriceOye, Mega.pk, Shophive, Czone, and local gaming shops. Compare all options at once with Flashi.' },
  { question: 'How much does a gaming headset cost in Pakistan?', answer: 'Gaming headsets range from Rs. 1,500 for budget to Rs. 30,000+ for premium brands like HyperX and SteelSeries. Mid-range options from Redragon and Fantech cost Rs. 3,000-8,000.' },
  { question: 'What is the best PUBG controller for mobile?', answer: 'Popular PUBG controllers include GameSir, iPega, and trigger-style controllers. Prices range from Rs. 500 for triggers to Rs. 5,000 for full gamepads.' },
  { question: 'Is RGB keyboard worth buying?', answer: 'Budget RGB keyboards from Redragon and Fantech start at Rs. 3,000-5,000. Worth it if you game regularly or want an upgraded typing experience.' },
];

const relatedCategories = [
  { name: 'Wireless Earbuds', href: '/wireless-earbuds', emoji: '🎧' },
  { name: 'Smart Watches', href: '/smart-watches', emoji: '⌚' },
  { name: 'Mobile Accessories', href: '/mobile-accessories', emoji: '📱' },
  { name: 'Chargers & Power Banks', href: '/chargers-power-banks', emoji: '🔌' },
  { name: 'Fashion & Clothing', href: '/fashion-clothing', emoji: '👗' },
];

const breadcrumbSchema = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://flashi.pk' },
    { '@type': 'ListItem', position: 2, name: 'Gaming Accessories', item: 'https://flashi.pk/gaming-accessories' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
};

export default async function GamingAccessoriesPage() {
  const initialProducts = await fetchProductsForCategory(searchQueries);
  return (
    <CategoryClient
      categoryName="Gaming Accessories"
      categorySlug="gaming-accessories"
      searchQueries={searchQueries}
      heroEmoji="🎮"
      heroDescription="Compare gaming headset, mouse, keyboard & controller prices from Daraz, PriceOye, Mega.pk & 50+ Pakistani stores. Budget gaming gear from Rs. 1,000."
      faqs={faqs}
      relatedCategories={relatedCategories}
      breadcrumbSchema={breadcrumbSchema}
      faqSchema={faqSchema}
      popularBrands={['Logitech', 'Redragon', 'Razer', 'HyperX', 'SteelSeries', 'Fantech', 'A4Tech Bloody', 'Corsair', 'GameSir']}
      popularStores={['Daraz', 'PriceOye', 'Mega.pk', 'Shophive', 'Czone']}
      seoKeywords={['gaming mouse price pakistan', 'gaming headset under 5000', 'mechanical keyboard pakistan', 'rgb keyboard price', 'pubg controller pakistan', 'gaming chair pakistan', 'logitech g102 price', 'budget gaming setup pakistan']}
      seoContent="Compare gaming accessories prices across Pakistan's top stores on Flashi. Find the lowest prices on gaming headsets, mice, keyboards, controllers and chairs from Logitech, Redragon, Razer, HyperX, Fantech and more. Budget gaming gear from Rs. 1,000."
    />
  );
}
