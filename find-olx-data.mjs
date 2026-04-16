import fs from 'fs';

const html = fs.readFileSync('olx_debug.html', 'utf8');

// Search for script tags containing JSON
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/g;
let match;
let found = false;

while ((match = scriptRegex.exec(html)) !== null) {
  const content = match[1].trim();
  if (content.length > 5000) {
    console.log('Found large script tag, length:', content.length);
    // Check for common keys
    if (content.includes('"title":') && content.includes('"price":')) {
      console.log('Script tag contains "title" and "price"!');
      console.log('Sample:', content.substring(0, 1000));
      found = true;
    }
  }
}

if (!found) {
  console.log('Did not find large scripts with title/price via regex.');
  // Check for window.state again with more flexible regex
  const stateMatch = html.match(/window\.state\s*=\s*(\{[\s\S]+?\});/);
  if (stateMatch) {
    console.log('window.state found! Length:', stateMatch[0].length);
  } else {
    const dataMatch = html.match(/window\.__data\s*=\s*(\{[\s\S]+?\});/);
    if (dataMatch) {
        console.log('window.__data found! Length:', dataMatch[0].length);
    }
  }
}
