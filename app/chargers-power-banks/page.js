import CategoryClient from '../components/CategoryClient';

export const metadata = {
  title: 'Chargers & Power Banks Price in Pakistan — Compare Best Deals | Flashi',
  description: 'Compare fast charger & power bank prices in Pakistan from 50+ online stores. Find 20000mAh power banks, 65W chargers, wireless chargers & USB-C cables at lowest prices. Updated daily on Flashi.pk',
  keywords: 'charger price in pakistan, power bank price pakistan, fast charger pakistan, 20000mah power bank, wireless charger pakistan, usb c cable pakistan, 65w charger price, iphone charger pakistan, samsung charger price',
  alternates: {
    canonical: 'https://flashi.pk/chargers-power-banks',
  },
  openGraph: {
    title: 'Chargers & Power Banks in Pakistan — Compare Prices from 50+ Stores | Flashi',
    description: 'Find the lowest prices on chargers & power banks in Pakistan. Compare across Daraz, PriceOye & more.',
    images: ['/logo.png'],
    type: 'website',
    locale: 'en_PK',
    siteName: 'Flashi',
    url: 'https://flashi.pk/chargers-power-banks',
  },
};

const searchQueries = ['power bank', 'fast charger', 'wireless charger', 'usb cable', 'charger'];

const faqs = [
  {
    question: 'What is the best power bank in Pakistan?',
    answer: 'Popular power bank brands in Pakistan include Anker, Baseus, Xiaomi, and Romoss. For most users, a 10000mAh power bank is sufficient for daily use, while 20000mAh is ideal for travel. Flashi compares prices across 50+ stores to find the cheapest option.',
  },
  {
    question: 'How much does a 20000mAh power bank cost in Pakistan?',
    answer: 'A 20000mAh power bank in Pakistan costs between Rs. 2,000 to Rs. 8,000 depending on the brand and features. Budget options from Romoss start around Rs. 2,500, while premium Anker models go up to Rs. 8,000.',
  },
  {
    question: 'Which fast charger is best for Samsung phones in Pakistan?',
    answer: 'Samsung phones support 25W or 45W fast charging. Original Samsung 25W chargers cost around Rs. 2,500-4,000. Compatible alternatives from Baseus and Anker offer 65W for similar prices. Compare all options on Flashi.',
  },
  {
    question: 'Is wireless charging available in Pakistan?',
    answer: 'Yes, wireless chargers are widely available in Pakistan for phones that support Qi wireless charging (iPhone 12+, Samsung S21+, etc.). Prices start from Rs. 1,500 for basic pads. Compare wireless charger prices across all Pakistani stores on Flashi.',
  },
  {
    question: 'Where to buy original chargers in Pakistan?',
    answer: 'Original chargers can be purchased from authorized brand stores, Daraz official stores, PriceOye, and Shophive. Be cautious of counterfeits. Flashi helps you find authorized sellers with the best prices across 50+ stores.',
  },
];

const relatedCategories = [
  { name: 'Mobile Accessories', href: '/mobile-accessories', emoji: '📱' },
  { name: 'Wireless Earbuds', href: '/wireless-earbuds', emoji: '🎧' },
  { name: 'Smart Watches', href: '/smart-watches', emoji: '⌚' },
  { name: 'Gaming Accessories', href: '/gaming-accessories', emoji: '🎮' },
];

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://flashi.pk' },
    { '@type': 'ListItem', position: 2, name: 'Chargers & Power Banks', item: 'https://flashi.pk/chargers-power-banks' },
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

export default function ChargersPowerBanksPage() {
  return (
    <CategoryClient
      categoryName="Chargers & Power Banks"
      categorySlug="chargers-power-banks"
      searchQueries={searchQueries}
      heroEmoji="🔌"
      heroDescription="Compare fast charger & power bank prices from Daraz, PriceOye, Mega.pk & 50+ Pakistani stores. Find the best deals on Anker, Baseus, Xiaomi & more. Budget power banks from Rs. 1,500."
      faqs={faqs}
      relatedCategories={relatedCategories}
      breadcrumbSchema={breadcrumbSchema}
      faqSchema={faqSchema}
    />
  );
}
