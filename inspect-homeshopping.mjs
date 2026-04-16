import axios from 'axios';
import * as https from 'https';

const url = 'https://homeshopping.pk/api/catalog_system/pub/products/search?ft=iphone';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

try {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
    httpsAgent
  });
  console.log('Status:', response.status);
  console.log('Data type:', typeof response.data);
  if (typeof response.data === 'string') {
      console.log('Data start:', response.data.substring(0, 500));
  }
  console.log('Is Array:', Array.isArray(response.data));
  console.log('Length:', response.data.length);
  if (Array.isArray(response.data) && response.data.length > 0) {
    console.log('First item:', JSON.stringify(response.data[0]).substring(0, 500));
  }
} catch (err) {
  console.error('Error:', err.message);
  if (err.response) {
      console.log('Response status:', err.response.status);
      console.log('Response headers:', err.response.headers);
  }
}
