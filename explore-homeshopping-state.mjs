import fs from 'fs';
const html = fs.readFileSync('homeshopping_test_iphone.html', 'utf8');

// Actually let's just find the start and find the matching bracket
let state = null;
const startIndex = html.indexOf('__STATE__ = {');
if (startIndex !== -1) {
    console.log('Found __STATE__ start');
    // Simple naive JSON extractor
    let bracketCount = 0;
    let endIndex = -1;
    for (let i = html.indexOf('{', startIndex); i < html.length; i++) {
        if (html[i] === '{') bracketCount++;
        else if (html[i] === '}') {
            bracketCount--;
            if (bracketCount === 0) {
                endIndex = i;
                break;
            }
        }
    }
    if (endIndex !== -1) {
        const jsonStr = html.substring(html.indexOf('{', startIndex), endIndex + 1);
        try {
            state = JSON.parse(jsonStr);
        } catch (e) {
            console.log('JSON error:', e.message);
        }
    }
}

if (state) {
    console.log('State keys count:', Object.keys(state).length);
    
    // Find products
    const products = Object.keys(state).filter(k => k.startsWith('Product:'));
    console.log('Products found:', products.length);
    
    if (products.length > 0) {
        const firstProdKey = products[0];
        const prod = state[firstProdKey];
        console.log('First product keys:', Object.keys(prod));
        console.log('Product title:', prod.productName);
        console.log('Product link:', prod.linkText);
        
        // Look for price in items
        const items = prod.items || [];
        if (items.length > 0) {
            const itemRef = items[0].id; // usually a reference string like Item:123
            const item = state[itemRef];
            console.log('Item found:', !!item);
            
            if (item && item.sellers) {
                const sellerRef = item.sellers[0].id;
                const seller = state[sellerRef];
                console.log('Seller found:', !!seller);
                if (seller && seller.commertialOffer) {
                    const offerRef = seller.commertialOffer.id;
                    const offer = state[offerRef];
                    console.log('Offer Price:', offer ? offer.Price : 'not found');
                }
            }
        }
    }
} else {
    console.log('__STATE__ not parsed');
}
