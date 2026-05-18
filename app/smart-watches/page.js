import CategoryClient from '../components/CategoryClient';
import { fetchProductsForCategory } from '../../server/services/productFetcher';

export const metadata = {
  title: 'Smart Watch Price in Pakistan 2026 — Compare Lowest Prices | Flashi',
  description: 'Compare smart watch prices from Daraz, PriceOye & 50+ Pakistani stores. Find the best smart watch deals starting from Rs. 1,500. Budget smart watches, fitness bands & more. Updated daily on Flashi.pk',
  keywords: 'smart watch price in pakistan, best smart watch under 5000, cheapest smart watch pakistan, fitness band price pakistan, smart watch for girls pakistan, amazfit watch price, xiaomi smart watch pakistan, zero lifestyle smart watch, ronin smart watch, apple watch pakistan, samsung galaxy watch price',
  alternates: {
    canonical: 'https://flashi.pk/smart-watches',
  },
  openGraph: {
    title: 'Smart Watch Prices in Pakistan — Compare from 50+ Stores | Flashi',
    description: 'Find the best smart watch deals in Pakistan. Compare prices from Daraz, PriceOye & more. Starting from Rs. 1,500.',
    images: ['/logo.png'],
    type: 'website',
    locale: 'en_PK',
    siteName: 'Flashi',
    url: 'https://flashi.pk/smart-watches',
  },
};

const searchQueries = ['smart watch', 'fitness band', 'smartwatch', 'digital watch'];

const faqs = [
  {
    question: 'What is the cheapest smart watch in Pakistan?',
    answer: 'Budget smart watches in Pakistan start from around Rs. 1,500 to Rs. 3,000. Brands like Xiaomi, Amazfit, and Haylou offer affordable options. Use Flashi to compare prices across 50+ stores to find the absolute lowest price.',
  },
  {
    question: 'Which smart watch brand is best in Pakistan?',
    answer: 'Popular smart watch brands in Pakistan include Apple Watch, Samsung Galaxy Watch, Amazfit, Xiaomi Mi Band, and Haylou. For budget options, Amazfit and Xiaomi offer the best value. For premium features, Apple Watch and Samsung Galaxy Watch are top choices.',
  },
  {
    question: 'Where can I buy smart watches online in Pakistan?',
    answer: 'Smart watches are available on Daraz, PriceOye, Mega.pk, Shophive, and many other Pakistani online stores. Flashi lets you compare prices from all of these stores at once so you never overpay.',
  },
  {
    question: 'Are smart watches available with warranty in Pakistan?',
    answer: 'Yes, most official retailers on Daraz and PriceOye offer smart watches with manufacturer warranty. Always check warranty details before purchasing. Flashi helps you find authorized sellers with the best prices.',
  },
  {
    question: 'What features should I look for in a smart watch under Rs. 5,000?',
    answer: 'In the under Rs. 5,000 range, look for heart rate monitoring, step counting, sleep tracking, water resistance, notification support, and at least 7-day battery life. Brands like Amazfit GTS and Xiaomi Mi Band offer these features at budget prices.',
  },
];

const relatedCategories = [
  { name: 'Wireless Earbuds', href: '/wireless-earbuds', emoji: '🎧' },
  { name: 'Mobile Accessories', href: '/mobile-accessories', emoji: '📱' },
  { name: 'Chargers & Power Banks', href: '/chargers-power-banks', emoji: '🔌' },
  { name: 'Gaming Accessories', href: '/gaming-accessories', emoji: '🎮' },
  { name: 'Fashion & Clothing', href: '/fashion-clothing', emoji: '👗' },
];

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://flashi.pk' },
    { '@type': 'ListItem', position: 2, name: 'Smart Watches', item: 'https://flashi.pk/smart-watches' },
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

const popularBrands = [
  'Apple Watch', 'Samsung Galaxy Watch', 'Amazfit', 'Xiaomi Mi Band', 'Haylou',
  'Zero Lifestyle', 'Ronin', 'Fitbit', 'Huawei Watch', 'Realme Watch',
  'Noise', 'Fire-Boltt', 'Mibro', 'Kieslect', 'Colmi',
];

const popularStores = [
  'Daraz', 'PriceOye', 'Mega.pk', 'Shophive', 'Naheed',
];

const seoKeywords = [
  'smart watch price in pakistan',
  'best smart watch under 5000',
  'zero lifestyle smart watch',
  'ronin smart watch price',
  'apple watch price pakistan',
  'samsung galaxy watch price',
  'amazfit watch pakistan',
  'xiaomi mi band price',
  'fitness band under 3000',
  'smart watch for girls pakistan',
  'budget smartwatch pakistan',
  'heart rate monitor watch',
];

const seoContent = `Compare smart watch and fitness band prices across Pakistan's top online stores on Flashi. Whether you want a budget fitness tracker under Rs. 3,000 or a premium Apple Watch or Samsung Galaxy Watch — Flashi compares prices from Daraz, PriceOye, Mega.pk, Shophive and 50+ stores instantly. Find the best deals on Amazfit, Xiaomi Mi Band, Zero Lifestyle, Ronin, Haylou, and more. Updated daily with the latest prices so you always get the lowest price on smart watches in Pakistan.`;

export default async function SmartWatchesPage() {
  const initialProducts = await fetchProductsForCategory(searchQueries);
  return (
    <CategoryClient
      categoryName="Smart Watches"
      categorySlug="smart-watches"
      searchQueries={searchQueries}
      heroEmoji="⌚"
      heroDescription="Compare smart watch prices from Daraz, PriceOye, Mega.pk & 50+ Pakistani stores. Find the lowest prices on Amazfit, Xiaomi, Samsung, Apple Watch & more. Updated daily."
      faqs={faqs}
      relatedCategories={relatedCategories}
      breadcrumbSchema={breadcrumbSchema}
      faqSchema={faqSchema}
      popularBrands={popularBrands}
      popularStores={popularStores}
      seoKeywords={seoKeywords}
      seoContent={seoContent}
      initialProducts={initialProducts}
    />
  );
}
