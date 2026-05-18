import CategoryClient from '../components/CategoryClient';
import { fetchProductsForCategory } from '../../server/services/productFetcher';

export const metadata = {
  title: 'Fashion & Clothing Prices in Pakistan 2026 — Lawn, Dresses, Shirts | Flashi',
  description: 'Compare fashion & clothing prices from Sapphire, Limelight, Nishat Linen, Outfitters, Khaadi & 50+ Pakistani stores. Find best deals on lawn suits, unstitched fabric, stitched pret, kurtas, dresses & more. Updated daily on Flashi.pk',
  keywords: 'lawn suit price in pakistan, unstitched lawn pakistan, stitched suit price pakistan, sapphire lawn 2026, limelight sale, nishat linen pret, outfitters pakistan, khaadi lawn, women clothing pakistan, kurti price pakistan, 3 piece suit price, 2 piece lawn suit, embroidered suit pakistan, chiffon dress pakistan, ready to wear pakistan, pret wear pakistan, summer lawn collection, winter collection pakistan, formal dress pakistan, casual wear pakistan, ladies dress online pakistan, girls lawn suit, cotton suit pakistan, printed lawn suit, designer lawn pakistan, branded clothing pakistan, fashion online pakistan',
  alternates: {
    canonical: 'https://flashi.pk/fashion-clothing',
  },
  openGraph: {
    title: 'Fashion & Clothing Prices in Pakistan — Compare Sapphire, Limelight, Nishat & More | Flashi',
    description: 'Compare lawn suits, dresses, kurtas & clothing prices from 50+ Pakistani fashion stores. Starting from Rs. 800.',
    images: ['/logo.png'],
    type: 'website',
    locale: 'en_PK',
    siteName: 'Flashi',
    url: 'https://flashi.pk/fashion-clothing',
  },
};

const searchQueries = [
  'lawn suit',
  'kurti',
  'unstitched',
  'stitched suit',
  'pret wear',
  'women dress',
  'shirt kurta',
  'embroidered suit',
  'cotton suit',
  '3 piece suit',
];

const faqs = [
  {
    question: 'Where to buy cheapest lawn suits online in Pakistan?',
    answer: 'Lawn suits in Pakistan are available from brands like Sapphire, Limelight, Nishat Linen, Khaadi, and Gul Ahmed. Prices vary significantly between stores — use Flashi to compare prices across 50+ stores and find the absolute lowest price on any lawn suit.',
  },
  {
    question: 'What is the difference between stitched and unstitched suits in Pakistan?',
    answer: 'Unstitched suits come as raw fabric (usually 2-piece or 3-piece with shirt, dupatta, and trouser fabric) that needs to be stitched by a tailor. Stitched/pret suits are ready-to-wear and come in standard sizes. Unstitched is usually cheaper and allows custom fitting, while stitched saves time.',
  },
  {
    question: 'Which are the best clothing brands in Pakistan?',
    answer: 'Top Pakistani clothing brands include Sapphire, Limelight, Nishat Linen, Khaadi, Gul Ahmed, Alkaram Studio, Sana Safinaz, Outfitters, J., and Bonanza Satrangi. For western wear, Outfitters and Levi\'s are popular. Compare prices across all brands on Flashi.',
  },
  {
    question: 'How much does a lawn suit cost in Pakistan in 2026?',
    answer: 'Lawn suit prices in Pakistan range from Rs. 800 for basic printed unstitched to Rs. 15,000+ for premium embroidered 3-piece suits from designer brands. Budget options from Limelight and local brands start around Rs. 1,200. Use Flashi to compare and find the best deals.',
  },
  {
    question: 'Can I buy Sapphire and Nishat Linen clothes online?',
    answer: 'Yes, both Sapphire (sapphireonline.pk) and Nishat Linen (nishatlinen.com) have official online stores with nationwide delivery. You can also find their products on Daraz. Flashi compares prices from all platforms so you get the lowest price.',
  },
  {
    question: 'What is pret wear?',
    answer: 'Pret wear (also called ready-to-wear) refers to factory-stitched clothing that comes in standard sizes (XS to XL). It\'s popular in Pakistan for everyday and casual wear. Brands like Limelight, Sapphire, and Outfitters offer extensive pret collections.',
  },
];

const relatedCategories = [
  { name: 'Wireless Earbuds', href: '/wireless-earbuds', emoji: '🎧' },
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
    { '@type': 'ListItem', position: 2, name: 'Fashion & Clothing', item: 'https://flashi.pk/fashion-clothing' },
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
  'Sapphire', 'Limelight', 'Nishat Linen', 'Khaadi', 'Gul Ahmed', 'Alkaram Studio',
  'Sana Safinaz', 'Outfitters', 'J. Junaid Jamshed', 'Bonanza Satrangi',
  'Maria.B', 'Edenrobe', 'Bareeze', 'Ethnic by Outfitters', 'Zellbury',
  'Ideas by Gul Ahmed', 'Cross Stitch', 'Agha Noor', 'Rang Rasiya', 'Warda',
];

const popularStores = [
  'Sapphire Online', 'Limelight', 'Nishat Linen', 'Outfitters', 'Stylo',
  'Daraz', 'Highfy', 'Naheed',
];

const seoKeywords = [
  'lawn suit price in pakistan',
  'unstitched lawn 2026',
  'sapphire lawn collection',
  'limelight sale collection',
  'nishat linen pret',
  'outfitters women clothing',
  'khaadi lawn 2026 price',
  'embroidered suits online',
  '3 piece suit pakistan',
  '2 piece lawn suit',
  'kurti price in pakistan',
  'cotton suit online pakistan',
  'chiffon dress pakistan',
  'ready to wear pakistan',
  'formal dress pakistan',
  'casual pret pakistan',
  'summer lawn collection 2026',
  'branded clothing online pakistan',
  'women dress online pakistan',
  'girls suit price pakistan',
];

const seoContent = `Compare fashion and clothing prices across Pakistan's top brands and stores on Flashi. Whether you're looking for unstitched lawn fabric, stitched pret wear, embroidered formal suits, or casual everyday kurtas — Flashi instantly compares prices from Sapphire, Limelight, Nishat Linen, Outfitters, Khaadi, Daraz, and 50+ Pakistani stores so you never overpay. Find the best deals on 2-piece and 3-piece lawn suits, cotton shirts, chiffon dresses, ready-to-wear kurtas, and designer clothing from the comfort of your home. Our price comparison engine updates daily with the latest collections and sale prices from every major fashion retailer in Pakistan.`;

export default async function FashionClothingPage() {
  const initialProducts = await fetchProductsForCategory(searchQueries);
  return (
    <CategoryClient
      categoryName="Fashion & Clothing"
      categorySlug="fashion-clothing"
      searchQueries={searchQueries}
      heroEmoji="👗"
      heroDescription="Compare fashion & clothing prices from Sapphire, Limelight, Nishat Linen, Outfitters & 50+ Pakistani stores. Find the best deals on lawn suits, kurtas, dresses, pret wear & more. Starting from Rs. 800."
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
