import CategoryClient from '../components/CategoryClient';
import { fetchProductsForCategory } from '../../server/services/productFetcher';

export const metadata = {
  title: 'Wireless Earbuds Price in Pakistan 2026 — Best Deals from 50+ Stores | Flashi',
  description: 'Find the lowest wireless earbuds prices in Pakistan. Compare earbuds from JBL, Samsung, QCY, Audionic, Zero Lifestyle, Ronin & more across Daraz, PriceOye & 50+ stores. Budget earbuds from Rs. 800. Free price comparison on Flashi.pk',
  keywords: 'wireless earbuds price in pakistan, best earbuds under 2000, bluetooth earbuds pakistan, airpods price pakistan, jbl earbuds pakistan, samsung buds price pakistan, noise cancelling earbuds pakistan, gaming earbuds pakistan, zero lifestyle earbuds, ronin earbuds price, audionic earbuds pakistan, qcy earbuds pakistan, haylou earbuds, tws earbuds pakistan, budget earbuds pakistan',
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
  { name: 'Smart Watches', href: '/smart-watches', emoji: '' },
  { name: 'Mobile Accessories', href: '/mobile-accessories', emoji: '' },
  { name: 'Gaming Accessories', href: '/gaming-accessories', emoji: '' },
  { name: 'Chargers & Power Banks', href: '/chargers-power-banks', emoji: '' },
  { name: 'Fashion & Clothing', href: '/fashion-clothing', emoji: '' },
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

const popularBrands = [
  'JBL', 'Samsung', 'Apple AirPods', 'QCY', 'Audionic', 'Haylou',
  'Zero Lifestyle', 'Ronin', 'SoundPeats', 'Xiaomi', 'Baseus',
  'Anker', 'Sony', 'Nothing', 'Realme', 'OnePlus',
  'Edifier', 'Skullcandy', 'Lenovo', 'Havit',
];

const popularStores = [
  'Daraz', 'PriceOye', 'Mega.pk', 'Shophive', 'Naheed',
];

const seoKeywords = [
  'wireless earbuds price in pakistan',
  'best earbuds under 2000',
  'zero lifestyle earbuds price',
  'ronin earbuds pakistan',
  'jbl earbuds price pakistan',
  'samsung buds price',
  'airpods price in pakistan',
  'noise cancelling earbuds',
  'gaming earbuds pakistan',
  'budget TWS earbuds pakistan',
  'bluetooth earbuds under 3000',
  'audionic earbuds price',
];

const seoContent = `Compare wireless earbuds prices across Pakistan's top online stores on Flashi. Whether you're looking for budget TWS earbuds under Rs. 2,000, premium noise-cancelling earbuds from JBL and Samsung, or the latest Zero Lifestyle and Ronin earbuds — Flashi compares prices from Daraz, PriceOye, Mega.pk, Shophive and 50+ Pakistani stores instantly. Find the best deals on Apple AirPods, QCY, Audionic, Haylou, SoundPeats and more. Our price comparison engine updates daily so you always get the lowest price on wireless earbuds in Pakistan.`;

export default async function WirelessEarbudsPage() {
  const initialProducts = await fetchProductsForCategory(searchQueries);

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
      popularBrands={popularBrands}
      popularStores={popularStores}
      seoKeywords={seoKeywords}
      seoContent={seoContent}
      initialProducts={initialProducts}
    />
  );
}
