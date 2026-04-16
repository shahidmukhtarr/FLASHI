import fs from 'fs';

const html = fs.readFileSync('olx_debug.html', 'utf8');
const startTag = 'window.state = ';
const startIndex = html.indexOf(startTag);
if (startIndex !== -1) {
  const jsonStart = startIndex + startTag.length;
  // Find the end of the JSON object. It ends with };
  // But there might be other }; inside.
  // Let's look for the first }; that is followed by a newline or <script.
  let jsonEnd = html.indexOf('};', jsonStart);
  while (jsonEnd !== -1) {
    try {
      const jsonStr = html.substring(jsonStart, jsonEnd + 1);
      const state = JSON.parse(jsonStr);
      const hits = state.search?.content?.hits || [];
      if (hits.length > 0) {
        console.log('Successfully parsed window.state and found hits!');
        console.log('Hits length:', hits.length);
        console.log('First hit keys:', Object.keys(hits[0]));
        console.log('First hit title:', hits[0].title);
        console.log('First hit price (from extraFields):', hits[0].extraFields?.price);
        break;
      }
    } catch (e) {
      // Not the right end point, try next };
      jsonEnd = html.indexOf('};', jsonEnd + 1);
    }
  }
} else {
  console.log('window.state not found.');
}
