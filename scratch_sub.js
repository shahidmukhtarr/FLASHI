import { saveSubscription, updateSubscriptionStatus } from './server/services/db.js';

async function test() {
  const email = 'test_subscriber@example.com';
  console.log('Creating subscriber...');
  await saveSubscription({
    name: 'Test User',
    email: email,
    phone: '03001234567',
  });
  
  console.log('Activating subscriber...');
  await updateSubscriptionStatus(email, 'active');
  console.log('Done!');
}

test().catch(console.error);
