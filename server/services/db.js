import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const TABLE_NAME = 'products';

let supabase = null;

export function getSupabaseClient() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn('[DB] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment. DB functionality disabled.');
      return null;
    }

    supabase = createClient(url, key, {
      auth: { persistSession: false },
      db: { schema: 'public' },
    });
  }

  return supabase;
}

function createProductId(product) {
  const idSource = `${product.url || ''}|${product.store || ''}`;
  return crypto.createHash('md5').update(idSource).digest('hex');
}

function normalizeProduct(rawProduct, sourceQuery = '') {
  const product = {
    title: String(rawProduct.title || '').trim(),
    store: String(rawProduct.store || '').trim(),
    url: String(rawProduct.url || '').trim(),
    image: rawProduct.image || '',
    price: rawProduct.price != null ? Number(rawProduct.price) : null,
    originalPrice: rawProduct.originalPrice != null ? Number(rawProduct.originalPrice) : null,
    rating: rawProduct.rating != null ? Number(rawProduct.rating) : null,
    reviewCount: Number(rawProduct.reviewCount) || 0,
    inStock: rawProduct.inStock !== false,
    storeColor: rawProduct.storeColor || '',
    sourceQuery: String(sourceQuery || '').trim(),
    scrapedAt: new Date().toISOString(),
  };

  return {
    ...product,
    id: createProductId(product),
  };
}

function toDbRow(product) {
  return {
    id: product.id,
    title: product.title,
    store: product.store,
    url: product.url,
    image: product.image,
    price: product.price,
    original_price: product.originalPrice,
    rating: product.rating,
    review_count: product.reviewCount,
    in_stock: product.inStock,
    store_color: product.storeColor,
    source_query: product.sourceQuery,
    scraped_at: product.scrapedAt,
  };
}

function fromDbRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    store: row.store,
    url: row.url,
    image: row.image,
    price: row.price,
    originalPrice: row.original_price,
    rating: row.rating,
    reviewCount: row.review_count,
    inStock: row.in_stock,
    storeColor: row.store_color,
    sourceQuery: row.source_query,
    scrapedAt: row.scraped_at,
    createdAt: row.created_at,
  };
}

export async function initDb() {
  const client = getSupabaseClient();
  const { error } = await client.from(TABLE_NAME).select('id').limit(1);

  if (error) {
    console.error('[DB] Supabase init failed:', error.message);
    throw new Error('Supabase initialization failed. Ensure the products table exists and the service key is valid.');
  }
}

export async function saveProducts(products = [], sourceQuery = '') {
  if (!Array.isArray(products) || products.length === 0) {
    return { newCount: 0, updatedCount: 0 };
  }

  const normalizedProducts = [];

  for (const rawProduct of products) {
    if (!rawProduct || !rawProduct.url || !rawProduct.store) continue;
    normalizedProducts.push(normalizeProduct(rawProduct, sourceQuery));
  }

  if (normalizedProducts.length === 0) {
    return { newCount: 0, updatedCount: 0 };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { newCount: 0, updatedCount: 0 };
  }

  const ids = normalizedProducts.map(product => product.id);
  const { data: existingRows, error: fetchError } = await client
    .from(TABLE_NAME)
    .select('id, scraped_at')
    .in('id', ids);

  if (fetchError) {
    throw fetchError;
  }

  const existingMap = new Map(existingRows?.map(row => [row.id, new Date(row.scraped_at)]) || []);

  const toUpsert = [];
  let newCount = 0;
  let updatedCount = 0;

  // Deduplicate products by ID before generating upsert payload to prevent
  // "ON CONFLICT DO UPDATE command cannot affect row a second time"
  const dedupedProducts = new Map();
  for (const product of normalizedProducts) {
    if (!dedupedProducts.has(product.id)) {
        dedupedProducts.set(product.id, product);
    }
  }

  for (const product of dedupedProducts.values()) {
    const existingScrapedAt = existingMap.get(product.id);
    if (!existingScrapedAt) {
      newCount += 1;
      toUpsert.push(toDbRow(product));
    } else {
      updatedCount += 1;
      if (new Date(product.scrapedAt) > existingScrapedAt) {
        toUpsert.push(toDbRow(product));
      }
    }
  }

  if (toUpsert.length > 0) {
    const { error: upsertError } = await client
      .from(TABLE_NAME)
      .upsert(toUpsert, { onConflict: 'id' });

    if (upsertError) {
      throw upsertError;
    }
  }

  return { newCount, updatedCount };
}

export async function queryStoredProducts(options = {}) {
  const {
    q = '',
    store = '',
    sort = 'created-desc',
    page = 1,
    limit = 50,
  } = options;

  const safeLimit = Number(limit) || 50;
  const safePage = Number(page) || 1;
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit - 1;

  const client = getSupabaseClient();
  if (!client) {
    return {
      total: 0,
      page: safePage,
      limit: safeLimit,
      products: [],
    };
  }

  let query = client.from(TABLE_NAME).select('*', { count: 'exact' });

  // OLX was removed from supported stores; keep legacy rows hidden from all product queries.
  query = query.not('store', 'ilike', 'olx');

  if (q.trim().length > 0) {
    // Split into meaningful words, ignoring very short filler words
    const stopwords = new Set(['a', 'an', 'the', 'for', 'of', 'in', 'on', 'at', 'to', 'by']);
    const words = q.trim().split(/\s+/).filter(w => w.length > 1 && !stopwords.has(w.toLowerCase()));

    if (words.length === 0) {
      // Fallback: use original query as single phrase
      const searchValue = `%${q.trim().replace(/%/g, '\\%')}%`;
      query = query.or(`title.ilike.${searchValue},source_query.ilike.${searchValue}`);
    } else {
      // Flexible matching:
      // 1. All words must match the title (AND logic)
      // 2. OR the source_query matches the search term (useful for products saved during this specific search)
      const titleConditions = words.map(w => `title.ilike.%${w.replace(/%/g, '\\%')}%`).join(',');
      const sourceQueryValue = `%${q.trim().replace(/%/g, '\\%')}%`;
      
      query = query.or(`and(${titleConditions}),source_query.ilike.${sourceQueryValue}`);
    }
  }

  if (store.trim().length > 0) {
    query = query.eq('store', store.trim());
  }

  switch (sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
    case 'reviews':
      query = query.order('review_count', { ascending: false });
      break;
    case 'store':
      query = query.order('store', { ascending: true });
      break;
    case 'created-asc':
      query = query.order('scraped_at', { ascending: true });
      break;
    case 'created-desc':
    default:
      query = query.order('scraped_at', { ascending: false });
      break;
  }

  let data, error, count;
  try {
    ({ data, error, count } = await query.range(start, end));
  } catch (e) {
    throw e;
  }

  if (error) {
    console.log('[DB] Query error:', error.message);
    throw error;
  }

  // Deduplicate by URL — same product scraped multiple times should appear once
  const seen = new Set();
  const dedupedData = (data || []).filter(row => {
    if (String(row?.store || '').toLowerCase() === 'olx') return false;
    if (!row.url || seen.has(row.url)) return false;
    seen.add(row.url);
    return true;
  });

  return {
    total: dedupedData.length,
    page: safePage,
    limit: safeLimit,
    products: dedupedData.map(fromDbRow),
  };
}

export async function getDbStats() {
  const client = getSupabaseClient();

  const { data: totalData, error: totalError, count: totalCount } = await client
    .from(TABLE_NAME)
    .select('id', { count: 'exact' })
    .limit(1);

  if (totalError) {
    throw totalError;
  }

  // Get unique stores by selecting all, then deduplicating in JS
  // (Supabase JS SDK doesn't support .distinct() as a chained method)
  const { data: storeRows, error: storeError } = await client
    .from(TABLE_NAME)
    .select('store')
    .order('store', { ascending: true });

  if (storeError) {
    throw storeError;
  }

  const uniqueStores = [...new Set((storeRows || []).map(r => r.store).filter(Boolean))].sort();

  const { data: latestRows, error: latestError } = await client
    .from(TABLE_NAME)
    .select('scraped_at')
    .order('scraped_at', { ascending: false })
    .limit(1);

  if (latestError) {
    throw latestError;
  }

  const latestScrape = latestRows?.[0]?.scraped_at || null;

  const subscriberCount = await getSubscriberCount();
  const currentPrice = await getCurrentSubscriptionPrice();

  return {
    totalProducts: totalCount ?? (totalData?.length ?? 0),
    totalStores: uniqueStores.length,
    stores: uniqueStores,
    latestScrape: latestScrape ? new Date(latestScrape).toISOString() : null,
    subscriberCount,
    currentPrice,
  };
}

export async function getAllSubscribers() {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[DB] getAllSubscribers error:', error.message);
    throw error;
  }
  return data || [];
}

// ─── Subscription Management ───

export async function saveSubscription(data) {
  const client = getSupabaseClient();
  if (!client) return { error: 'Database not initialized' };

  const row = {
    email: data.email,
    name: data.name || '',
    phone: data.phone || '',
    payment_method: data.paymentMethod || 'bank_transfer',
    payment_ref: data.paymentRef || '',
    amount: data.amount,
    status: 'pending',
    created_at: new Date().toISOString(),
    expires_at: null,
  };

  // If user already has a subscription, update it
  const { data: existing } = await client
    .from('subscribers')
    .select('id')
    .eq('email', data.email)
    .limit(1);

  if (existing && existing.length > 0) {
    const { error } = await client
      .from('subscribers')
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq('email', data.email);
    if (error) throw error;
    return { success: true, isUpdate: true };
  }

  const { error } = await client.from('subscribers').insert([row]);
  if (error) throw error;
  return { success: true, isUpdate: false };
}

export async function getSubscriptionByEmail(email) {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('subscribers')
    .select('*')
    .eq('email', email)
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const sub = data[0];
  // Check if subscription is expired
  if (sub.status === 'active' && sub.expires_at && new Date(sub.expires_at) < new Date()) {
    // Auto-expire
    await client.from('subscribers').update({ status: 'expired' }).eq('id', sub.id);
    sub.status = 'expired';
  }

  return sub;
}

export async function updateSubscriptionStatus(email, status, durationDays = 30) {
  const client = getSupabaseClient();
  if (!client) return { error: 'Database not initialized' };

  const updates = { status, updated_at: new Date().toISOString() };
  if (status === 'active') {
    const expires = new Date();
    expires.setDate(expires.getDate() + durationDays);
    updates.expires_at = expires.toISOString();
  }

  const { error } = await client
    .from('subscribers')
    .update(updates)
    .eq('email', email);

  if (error) throw error;
  return { success: true };
}

export async function getSubscriberCount() {
  const client = getSupabaseClient();
  if (!client) return 0;

  // We count only confirmed or active subscribers? 
  // User said "first 10 users", usually implies first 10 who signed up/paid.
  // Let's count all entries in subscribers for now, or maybe only active ones.
  // Given it's a "first 10" promo, let's count all who at least requested.
  const { count, error } = await client
    .from('subscribers')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('[DB] getSubscriberCount error:', error.message);
    return 0;
  }
  return count || 0;
}

export async function getCurrentSubscriptionPrice() {
  const count = await getSubscriberCount();
  return count < 10 ? 250 : 500;
}

export async function saveUser(name, email, password) {
  const client = getSupabaseClient();
  if (!client) return { error: 'Database not initialized' };

  // Check if user exists
  const { data: existing, error: checkError } = await client
    .from('users')
    .select('*')
    .eq('email', email)
    .limit(1);

  if (checkError) {
    console.error('[DB] saveUser check error:', checkError.message);
    return { error: `Database error: ${checkError.message}` };
  }

  if (existing && existing.length > 0) {
    return { error: 'User already exists' };
  }

  // Use a simple hash for password
  const password_hash = password ? crypto.createHash('sha256').update(password).digest('hex') : '';

  // Insert new user
  const { data, error } = await client
    .from('users')
    .insert([{ name, email, password_hash, created_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) {
    console.error('[DB] saveUser insert error:', error.message);
    return { error: `Registration failed: ${error.message}. Ensure columns 'email' and 'name' exist in the 'users' table.` };
  }

  if (data && data.password_hash) delete data.password_hash;
  return data;
}

export async function authenticateUser(email, password) {
  const client = getSupabaseClient();
  if (!client) return { error: 'Database not initialized' };

  const { data: existing, error } = await client
    .from('users')
    .select('*')
    .eq('email', email)
    .limit(1);

  if (error) {
    console.error('[DB] authenticateUser error:', error.message);
    return { error: `Database error: ${error.message}` };
  }

  if (!existing || existing.length === 0) {
    return { error: 'Invalid email or password' };
  }

  const user = existing[0];
  
  if (user.password_hash) {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password_hash !== hash) {
      return { error: 'Invalid email or password' };
    }
    delete user.password_hash;
  }

  return user;
}

export async function saveContactMessage(messageData) {
  const client = getSupabaseClient();
  if (!client) return { error: 'Database not initialized' };

  const { data, error } = await client
    .from('contact_messages')
    .insert([
      {
        name: messageData.name,
        email: messageData.email,
        subject: messageData.subject,
        message: messageData.message,
        created_at: new Date().toISOString(),
      }
    ]);

  if (error) {
    console.error('[DB] Contact save error:', error.message);
    throw error;
  }

  return { success: true, data };
}

export async function getSubscriptionStatus(email) {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('subscribers')
    .select('status')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0].status;
}
