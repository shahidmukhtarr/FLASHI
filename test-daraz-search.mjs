import axios from 'axios';

async function testDaraz() {
  const query = 'iPhone 15';
  const url = `https://www.daraz.pk/catalog/?ajax=true&isFirstRequest=true&q=${encodeURIComponent(query)}&page=1`;
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': `https://www.daraz.pk/catalog/?q=${encodeURIComponent(query)}`,
        'x-requested-with': 'XMLHttpRequest',
      },
      timeout: 10000,
    });
    
    console.log('Status code:', response.status);
    console.log('Content-Type:', response.headers['content-type']);
    if (typeof response.data === 'string') {
        console.log('Response string snippet:', response.data.slice(0, 1000));
    } else {
        console.log('Keys in JSON:', Object.keys(response.data));
        if (response.data.mods) {
            console.log('Items:', response.data.mods.listItems?.length);
        } else {
            console.log('No mods found');
            console.log(response.data);
        }
    }

  } catch (err) {
    if (err.response) {
       console.log('Status code:', err.response.status);
       console.log('Snippet:', typeof err.response.data === 'string' ? err.response.data.slice(0, 1000) : err.response.data);
    } else {
       console.log('Error:', err.message);
    }
  }
}
testDaraz();
