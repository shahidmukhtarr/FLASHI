import crypto from 'crypto';

// ─── JazzCash Config ───
const JAZZCASH_URLS = {
  sandbox: 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/',
  production: 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/',
};

// ─── EasyPaisa Config ───
const EASYPAISA_URLS = {
  sandbox: 'https://easypaisa.com.pk/easypay/Index.jsf',
  production: 'https://easypay.easypaisa.com.pk/easypay/Index.jsf',
};

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

function formatJazzCashDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}${m}${d}${h}${min}${s}`;
}

export function generateTxnRef() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `FL${ts}${rand}`;
}

function generateJazzCashHash(fields, salt) {
  const sorted = Object.keys(fields)
    .filter(k => (k.startsWith('pp_') || k.startsWith('ppmpf_')) && fields[k] !== '')
    .sort();
  const str = salt + '&' + sorted.map(k => fields[k]).join('&');
  return crypto.createHmac('sha256', salt).update(str).digest('hex');
}

// ─── JazzCash Hosted Checkout ───
export function createJazzCashPayment({ txnRef, amount, email, name, phone, description }) {
  const env = process.env.JAZZCASH_ENVIRONMENT || 'sandbox';
  const salt = process.env.JAZZCASH_INTEGRITY_SALT || '';
  const now = new Date();
  const expiry = new Date(now.getTime() + 3600000);

  const fields = {
    pp_Version: '1.1',
    pp_TxnType: 'MWALLET',
    pp_Language: 'EN',
    pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID || '',
    pp_SubMerchantID: '',
    pp_Password: process.env.JAZZCASH_PASSWORD || '',
    pp_BankID: '',
    pp_ProductID: '',
    pp_TxnRefNo: txnRef,
    pp_Amount: String(amount * 100),
    pp_TxnCurrency: 'PKR',
    pp_TxnDateTime: formatJazzCashDate(now),
    pp_TxnExpiryDateTime: formatJazzCashDate(expiry),
    pp_BillReference: `FLASHI-${txnRef}`,
    pp_Description: description || 'FLASHI Premium Subscription',
    pp_ReturnURL: `${getBaseUrl()}/api/payment/return`,
    ppmpf_1: email || '',
    ppmpf_2: name || '',
    ppmpf_3: phone || '',
    ppmpf_4: '',
    ppmpf_5: '',
  };

  fields.pp_SecureHash = generateJazzCashHash(fields, salt);
  return { gatewayUrl: JAZZCASH_URLS[env] || JAZZCASH_URLS.sandbox, fields, txnRef };
}

export function verifyJazzCashResponse(data) {
  const salt = process.env.JAZZCASH_INTEGRITY_SALT || '';
  const received = data.pp_SecureHash;
  const copy = { ...data };
  delete copy.pp_SecureHash;
  const calculated = generateJazzCashHash(copy, salt);

  return {
    isValid: calculated.toLowerCase() === (received || '').toLowerCase(),
    isSuccess: data.pp_ResponseCode === '000',
    responseCode: data.pp_ResponseCode,
    responseMessage: data.pp_ResponseMessage,
    txnRefNo: data.pp_TxnRefNo,
    amount: data.pp_Amount ? Number(data.pp_Amount) / 100 : 0,
    email: data.ppmpf_1 || '',
  };
}

// ─── EasyPaisa Hosted Checkout ───
export function createEasyPaisaPayment({ txnRef, amount, email, phone }) {
  const env = process.env.EASYPAISA_ENVIRONMENT || 'sandbox';
  const storeId = process.env.EASYPAISA_STORE_ID || '';
  const hashKey = process.env.EASYPAISA_HASH_KEY || '';
  const expiry = new Date(Date.now() + 3600000);
  const expiryStr = formatJazzCashDate(expiry).replace(/(\d{8})(\d{6})/, '$1 $2');
  const postBackURL = `${getBaseUrl()}/api/payment/return`;

  const fields = {
    storeId,
    amount: String(amount),
    postBackURL,
    orderRefNum: txnRef,
    expiryDate: expiryStr,
    autoRedirect: '1',
    paymentMethod: 'MA_PAYMENT_METHOD',
    emailAddr: email || '',
    mobileNum: phone || '',
  };

  const hashInput = `${amount}${txnRef}${storeId}${postBackURL}${expiryStr}${hashKey}`;
  fields.merchantHashedReq = crypto.createHash('sha256').update(hashInput).digest('hex');

  return { gatewayUrl: EASYPAISA_URLS[env] || EASYPAISA_URLS.sandbox, fields, txnRef };
}

export function verifyEasyPaisaResponse(data) {
  return {
    isSuccess: data.status === '0000' || data.response_code === '0000',
    responseCode: data.status || data.response_code,
    orderRefNum: data.orderRefNumber || data.order_id,
    amount: data.amount ? Number(data.amount) : 0,
  };
}
