import axios from 'axios';

async function testOlxApi() {
  try {
    const url = 'https://www.olx.com.pk/api/relevance/v4/search?query=iphone-15&limit=10&location=1000001';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      }
    });
    console.log('API Success!');
    console.log(`Found ${response.data.data?.length} results`);
    if(response.data.data?.length > 0) {
      console.log('Sample:', response.data.data[0].title, response.data.data[0].price);
    }
  } catch (e) {
    console.error('API Error:', e.message);
  }
}
testOlxApi();
