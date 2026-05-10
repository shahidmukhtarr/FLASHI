import CategoryClient from '../components/CategoryClient';

export const metadata = {
  title: 'Wireless Earbuds Price in Pakistan 2026 — Best Deals from 50+ Stores | Flashi',
  description: 'Find the lowest wireless earbuds prices in Pakistan. Compare earbuds from JBL, Samsung, QCY, Audionic & more across Daraz, PriceOye & 50+ stores. Budget earbuds from Rs. 800. Free price comparison on Flashi.pk',
  keywords: 'wireless earbuds price in pakistan, best earbuds under 2000, bluetooth earbuds pakistan, airpods price pakistan, jbl earbuds pakistan, samsung buds price pakistan, noise cancelling earbuds pakistan, gaming earbuds pakistan',
  alternates: {
    canonical: 'https://flashi.pk/wireless-earbuds',
  },
  openGraph: {
    title: 'Wireless Earbuds Prices in Pakistan — Compare 50+ Stores | Flashi',
    description: 'Compare wireless earbuds prices across Daraz, PriceOye & more. Budget earbuds from Rs. 800.',
    images: ['/logo.png'],
    type: 'website',
    locale: 'en_PK',
    siteName: 'Flashi',
    url: 'https://flashi.pk/wireless-earbuds',
  },
};

const searchQueries = ['wireless earbuds', 'bluetooth earbuds', 'airpods', 'earbuds', 'TWS'];

const faqs = [
  {
    question: 'What are the best earbuds under Rs. 2,000 in Pakistan?',
    answer: 'The best earbuds under Rs. 2,000 in Pakistan include QCY T13, Haylou GT1, and various Audionic models. These offer decent sound quality, Bluetooth 5.0+, and 4-6 hours battery life. Use Flashi to compare prices across all stores.',
  },
  {
    question: 'Are AirPods available in Pakistan?',
    answer: 'Yes, Apple AirPods are available in Pakistan through Daraz, PriceOye, and authorized Apple resellers. Prices vary significantly between stores, so using Flashi to compare is recommended. Both original and compatible alternatives are available.',
  },
  {
    question: 'Which wireless earbuds have the best battery life?',
    answer: 'For best battery life in Pakistan, look at Samsung Galaxy Buds FE (up to 30 hours with case), QCY T13 (40 hours with case), and JBL Tune 130NC (40 hours with case). Budget options like Haylou GT series also offer 20+ hours total.',
  },
  {
    question: 'Where to buy original wireless earbuds in Pakistan?',
    answer: 'Original wireless earbuds can be bought from authorized sellers on Daraz, PriceOye, Mega.pk, and Shophive. Always check seller ratings and warranty information. Flashi helps you compare prices from verified stores.',
  },
  {
    question: 'What is the difference between TWS and wireless earbuds?',
    answer: 'TWS (True Wireless Stereo) earbuds are a type of wireless earbuds with no wire connecting the two earpieces. All TWS are wireless, but not all wireless earbuds are TWS — some have a neckband. TWS earbuds are more popular in Pakistan due to convenience.',
  },
];

const relatedCategories = [
  { name: 'Smart Watches', href: '/smart-watches', emoji: '⌚' },
  { name: 'Mobile Accessories', href: '/mobile-accessories', emoji: '📱' },
  { name: 'Gaming Accessories', href: '/gaming-accessories', emoji: '🎮' },
  { name: 'Chargers & Power Banks', href: '/chargers-power-banks', emoji: '🔌' },
];

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://flashi.pk' },
    { '@type': 'ListItem', position: 2, name: 'Wireless Earbuds', item: 'https://flashi.pk/wireless-earbuds' },
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

export default function WirelessEarbudsPage() {
  return (
    <CategoryClient
      categoryName="Wireless Earbuds"
      categorySlug="wireless-earbuds"
      searchQueries={searchQueries}
      heroEmoji="🎧"
      heroDescription="Compare wireless earbuds prices from Daraz, PriceOye, Mega.pk & 50+ Pakistani stores. Find the best deals on JBL, Samsung, AirPods, QCY & more. Budget earbuds from Rs. 800."
      faqs={faqs}
      relatedCategories={relatedCategories}
      breadcrumbSchema={breadcrumbSchema}
      faqSchema={faqSchema}
    />
  );
}
