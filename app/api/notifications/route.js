import { NextResponse } from 'next/server';

/**
 * GET /api/notifications?email=...
 * Returns a list of deal notifications for the logged-in user.
 * Generates 5 fresh notifications per day using rotating templates + real product data.
 */

const dealTemplates = [
  {
    icon: '🔥',
    type: 'flash_sale',
    titles: [
      '⚡ Flash Sale LIVE on {store}!',
      '🔥 {store} Flash Sale — Up to {discount}% OFF!',
      '💥 HURRY! {store} sale ends tonight!',
    ],
    bodies: [
      'Massive discounts on top products. Don\'t miss out — prices are dropping fast!',
      'Grab your favorite items before they sell out. Limited stock available!',
      'Your favorite brands are on sale right now. Shop before it\'s gone!',
    ],
  },
  {
    icon: '💰',
    type: 'price_drop',
    titles: [
      '📉 Price Drop Alert: {product}',
      '💰 {product} just got cheaper!',
      '🏷️ New lowest price on {product}!',
    ],
    bodies: [
      'Price dropped from Rs. {oldPrice} to Rs. {newPrice}. Save Rs. {savings} today!',
      'We found a better deal for you. Check the new price now!',
      'This is the lowest price we\'ve seen in 30 days. Don\'t wait!',
    ],
  },
  {
    icon: '🎯',
    type: 'deal_of_day',
    titles: [
      '🎯 Deal of the Day — {product}',
      '⭐ Today\'s Top Pick: {product}',
      '🏆 Best Deal Right Now: {product}',
    ],
    bodies: [
      'Handpicked just for you. This deal won\'t last long!',
      'Our top recommendation for today. Amazing value for money!',
      'Trending right now with thousands of happy buyers!',
    ],
  },
  {
    icon: '🛍️',
    type: 'store_sale',
    titles: [
      '🛍️ {store} Clearance Sale — Extra {discount}% OFF!',
      '🎪 {store} End of Season Sale is HERE!',
      '💎 Exclusive: {store} members-only deals!',
    ],
    bodies: [
      'Clearance prices on hundreds of items. Shop the best deals now!',
      'End of season means unbeatable prices. Stock up while you can!',
      'Premium members get early access. Check your exclusive deals!',
    ],
  },
  {
    icon: '🚨',
    type: 'limited_stock',
    titles: [
      '🚨 Almost Gone: {product}',
      '⏰ Last Chance: {product} selling fast!',
      '🔔 Only a few left: {product}!',
    ],
    bodies: [
      'Only {stock} items remaining at this price. Grab yours now!',
      'High demand alert — this product is flying off the shelves!',
      'Don\'t miss out. This deal expires in a few hours!',
    ],
  },
  {
    icon: '💪',
    type: 'motivation',
    titles: [
      '💪 You are stronger than you think!',
      '🌟 Keep going — you\'re closer than you feel!',
      '✨ Your effort today is building tomorrow!',
    ],
    bodies: [
      'Hard days don\'t last. Hard people do. Whatever you\'re going through right now — you have survived 100% of your worst days. Keep pushing! 🔥',
      'Tired? Rest. But don\'t quit. Every single step forward, no matter how small, is still progress. You\'ve got more in you than you know! 💫',
      'Growth is uncomfortable. That feeling you have right now? That\'s you becoming a better version of yourself. Trust the process. 🏆',
    ],
  },
  {
    icon: '🌅',
    type: 'hope',
    titles: [
      '🌅 Today holds something good for you!',
      '☀️ A fresh start is always possible!',
      '🌈 Don\'t give up — the best is yet to come!',
    ],
    bodies: [
      'Sometimes life feels heavy. But remember — storms don\'t last forever. The sun always rises again. You are not alone in this. Stay hopeful! ❤️',
      'You don\'t need to have everything figured out. Just take one step today. One small step is all it takes to change the direction of your life. 🚶',
      'The version of you that keeps going despite everything? That person is remarkable. Be proud of yourself for still being here, still trying. 💛',
    ],
  },
  {
    icon: '🔥',
    type: 'hustle',
    titles: [
      '🔥 Your mindset is your superpower!',
      '💎 Discipline today = freedom tomorrow!',
      '🚀 You are built for greatness!',
    ],
    bodies: [
      'Stop waiting for the "perfect time." The perfect time is NOW. Your future self is counting on the decisions you make today. Go be great! 🏅',
      'Nobody is coming to save you — and that\'s actually good news. Because YOU have everything you need inside you already. Rise up! 💥',
      'Every successful person you admire was once where you are right now. The only difference? They didn\'t stop. Neither should you. Keep going! 🦁',
    ],
  },
];

// Store-specific products to avoid mismatches like "Limelight Haier Inverter AC"
const storeProducts = {
  'Daraz': ['iPhone 16 Pro', 'Samsung Galaxy S24', 'AirPods Pro 2', 'Redmi Note 13 Pro', 'PS5 Slim', 'Infinix Note 40', 'TCL 55" 4K TV', 'Haier Inverter AC', 'Nike Air Max', 'JBL Charge 5'],
  'PriceOye': ['iPhone 16 Pro', 'Samsung Galaxy S24', 'AirPods Pro 2', 'Redmi Note 13 Pro', 'Infinix Note 40', 'Nothing Phone 2', 'Samsung Galaxy Watch 7', 'Sony WH-1000XM5'],
  'Mega.pk': ['HP Pavilion Laptop', 'Dell XPS 15', 'MacBook Air M3', 'Canon EOS R50', 'Logitech MX Master 3S', 'Anker PowerCore 20000', 'Apple Watch Ultra'],
  'Shophive': ['MacBook Air M3', 'iPad Air', 'Apple Watch Ultra', 'Sony WH-1000XM5', 'Canon EOS R50', 'HP Pavilion Laptop', 'Dell XPS 15'],
  'Limelight': ['Lawn Collection', 'Stitched Kurta', 'Premium Silk Dupatta', 'Winter Shawl', 'Ready-to-Wear Suit', 'Embroidered Dress'],
  'Sapphire': ['Unstitched Lawn', 'Ready-to-Wear Collection', 'Printed Shirt', 'Summer Cotton Suit', 'Designer Kurta', 'Premium Silk Dress'],
  'Naheed': ['Face Wash', 'Shampoo Bundle', 'Protein Powder', 'Baby Diapers Pack', 'Cooking Oil 5L', 'Green Tea Box'],
  'Highfy': ['Graphic T-Shirt', 'Denim Jeans', 'Sneakers', 'Hoodie', 'Polo Shirt', 'Casual Shorts'],
  'Stationers.pk': ['Art Supply Kit', 'Notebook Bundle', 'Pen Set', 'School Bag', 'Desk Organizer', 'Planner 2026'],
};

const stores = Object.keys(storeProducts);

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateDailyNotifications(email) {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const baseSeed = dayOfYear * 1000 + (email ? email.length * 7 : 0);

  const notifications = [];

  // Generate 5 notifications spread across the day
  const hours = [9, 11, 14, 17, 20]; // Morning, mid-morning, afternoon, evening, night

  for (let i = 0; i < 5; i++) {
    const seed = baseSeed + i * 137;
    const templateIdx = Math.floor(seededRandom(seed) * dealTemplates.length);
    const template = dealTemplates[templateIdx];

    const titleIdx = Math.floor(seededRandom(seed + 1) * template.titles.length);
    const bodyIdx = Math.floor(seededRandom(seed + 2) * template.bodies.length);
    const storeIdx = Math.floor(seededRandom(seed + 3) * stores.length);
    const store = stores[storeIdx];
    const products = storeProducts[store];
    const productIdx = Math.floor(seededRandom(seed + 4) * products.length);
    const product = products[productIdx];

    const discount = Math.floor(seededRandom(seed + 5) * 40) + 15; // 15-55%
    const oldPrice = (Math.floor(seededRandom(seed + 6) * 50) + 10) * 1000; // 10k-60k
    const savings = Math.floor(oldPrice * discount / 100);
    const newPrice = oldPrice - savings;
    const stock = Math.floor(seededRandom(seed + 7) * 10) + 2;

    let title = template.titles[titleIdx]
      .replace('{store}', store)
      .replace('{product}', product)
      .replace('{discount}', discount);

    let body = template.bodies[bodyIdx]
      .replace('{store}', store)
      .replace('{product}', product)
      .replace('{discount}', discount)
      .replace('{oldPrice}', oldPrice.toLocaleString())
      .replace('{newPrice}', newPrice.toLocaleString())
      .replace('{savings}', savings.toLocaleString())
      .replace('{stock}', stock);

    const notifDate = new Date(today);
    notifDate.setHours(hours[i], Math.floor(seededRandom(seed + 8) * 45), 0, 0);

    // Only include notifications that are in the past (already "sent")
    if (notifDate <= new Date()) {
      notifications.push({
        id: `notif_${dayOfYear}_${i}`,
        type: template.type,
        icon: template.icon,
        title,
        body,
        store,
        product,
        discount,
        timestamp: notifDate.toISOString(),
        read: false,
        actionUrl: ['motivation', 'hope', 'hustle'].includes(template.type)
          ? null
          : template.type === 'store_sale' || template.type === 'flash_sale'
            ? '/special-discounts'
            : `/?q=${encodeURIComponent(product)}`,
        store: ['motivation', 'hope', 'hustle'].includes(template.type) ? null : store,
      });
    }
  }

  // Also include yesterday's notifications (so there's always content)
  const yesterdaySeed = (dayOfYear - 1) * 1000 + (email ? email.length * 7 : 0);
  for (let i = 0; i < 5; i++) {
    const seed = yesterdaySeed + i * 137;
    const templateIdx = Math.floor(seededRandom(seed) * dealTemplates.length);
    const template = dealTemplates[templateIdx];
    const titleIdx = Math.floor(seededRandom(seed + 1) * template.titles.length);
    const bodyIdx = Math.floor(seededRandom(seed + 2) * template.bodies.length);
    const storeIdx = Math.floor(seededRandom(seed + 3) * stores.length);
    const store = stores[storeIdx];
    const products = storeProducts[store];
    const productIdx = Math.floor(seededRandom(seed + 4) * products.length);
    const product = products[productIdx];
    const discount = Math.floor(seededRandom(seed + 5) * 40) + 15;
    const oldPrice = (Math.floor(seededRandom(seed + 6) * 50) + 10) * 1000;
    const savings = Math.floor(oldPrice * discount / 100);
    const newPrice = oldPrice - savings;
    const stock = Math.floor(seededRandom(seed + 7) * 10) + 2;

    let title = template.titles[titleIdx]
      .replace('{store}', store).replace('{product}', product).replace('{discount}', discount);
    let body = template.bodies[bodyIdx]
      .replace('{store}', store).replace('{product}', product).replace('{discount}', discount)
      .replace('{oldPrice}', oldPrice.toLocaleString()).replace('{newPrice}', newPrice.toLocaleString())
      .replace('{savings}', savings.toLocaleString()).replace('{stock}', stock);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(hours[i], Math.floor(seededRandom(seed + 8) * 45), 0, 0);

    notifications.push({
      id: `notif_${dayOfYear - 1}_${i}`,
      type: template.type,
      icon: template.icon,
      title,
      body,
      store,
      product,
      discount,
      timestamp: yesterday.toISOString(),
      read: true,
      actionUrl: ['motivation', 'hope', 'hustle'].includes(template.type)
        ? null
        : template.type === 'store_sale' || template.type === 'flash_sale'
          ? '/special-discounts'
          : `/?q=${encodeURIComponent(product)}`,
      store: ['motivation', 'hope', 'hustle'].includes(template.type) ? null : store,
    });
  }

  return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const notifications = generateDailyNotifications(email);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
    });
  } catch (error) {
    console.error('[Notifications API] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
