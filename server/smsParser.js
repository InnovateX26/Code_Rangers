const { v4: uuidv4 } = require('uuid');

const SMS_TEMPLATES = [
  "Dear Customer, Rs. {amount} has been debited from your A/c ending {acc} on {date} towards {merchant}. Ref No: {ref}",
  "Txn Alert: INR {amount} debited from your A/c {acc} on {date} for {merchant}. Avail Bal: Rs. {bal}",
  "Your A/c {acc} is debited with Rs {amount} on {date} by UPI/REQ/{merchant}. Ref: {ref}",
  "Alert: You have spent Rs. {amount} via {acc} at {merchant} on {date}."
];

const INCOME_TEMPLATES = [
  "Dear Customer, Rs. {amount} has been credited to your A/c {acc} on {date} towards {merchant}. Ref: {ref}",
  "Txn Alert: INR {amount} credited to A/c {acc} on {date} by {merchant}. Avail Bal: Rs. {bal}",
  "Salary of Rs. {amount} credited to your A/c {acc} on {date} by {merchant}. Ref: {ref}"
];

const SPAM_TEMPLATES = [
  "NEVER SHARE your OTP {ref} for login. Regards, Bank.",
  "Mega SALE! Get 50% off on all items at {merchant}. Shop now!",
  "Your pre-approved personal loan of Rs {bal} is ready. Apply now!",
  "Promo Alert: Use code {ref} for free shipping at {merchant}.",
  "Dear User, your login OTP is {ref}. Expires in 10 mins."
];

const NOISE_KEYWORDS = ['otp', 'login code', '50% off', 'sale', 'promo', 'discount', 'buy 1 get 1', 'free shipping', 'insurance', 'loan', 'pre-approved'];

function generateMockSMS(amount, merchant, accountLast4, isCredit = false) {
  const templateList = isCredit ? INCOME_TEMPLATES : SMS_TEMPLATES;
  const template = templateList[Math.floor(Math.random() * templateList.length)];
  const dateStr = new Date().toLocaleDateString('en-GB');
  const refId = uuidv4().split('-')[0].toUpperCase().substring(0, 6);
  
  return template
    .replace('{amount}', amount.toFixed(2))
    .replace('{merchant}', merchant)
    .replace('{acc}', accountLast4)
    .replace('{date}', dateStr)
    .replace('{bal}', (Math.random() * 50000 + 10000).toFixed(2))
    .replace('{ref}', refId);
}

function generateSpamSMS(merchant) {
  const template = SPAM_TEMPLATES[Math.floor(Math.random() * SPAM_TEMPLATES.length)];
  return template
    .replace('{merchant}', merchant)
    .replace('{bal}', '5,00,000')
    .replace('{ref}', Math.floor(100000 + Math.random() * 900000));
}

function parseSMS(smsText) {
  // 1. SPAM FILTER
  const lowerText = smsText.toLowerCase();
  for (let word of NOISE_KEYWORDS) {
    if (lowerText.includes(word)) {
      return { isSpam: true, rawSMS: smsText };
    }
  }
  
  // Regex heuristics to find Amount, Merchant, and Account
  
  // Find Amount
  const amountMatch = smsText.match(/(?:Rs\.?|INR)\s*([\d,]+\.?\d*)/i) || smsText.match(/spent\s(?:Rs\.?|INR)\s*([\d,]+\.?\d*)/i);
  let amount = 0;
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // Find Account
  const accMatch = smsText.match(/(?:A\/c\w* ending|A\/c|a\/c)\s+(\w+)/i) || smsText.match(/via\s+(\w+)/i);
  const account = accMatch ? accMatch[1] : 'Unknown';

  // Find Merchant
  const merchantMatch = smsText.match(/(?:towards|for|by(?: UPI\/REQ\/)?|at)\s+([^.]+)/i);
  let merchant = merchantMatch ? merchantMatch[1].trim() : 'Unknown Merchant';
  merchant = merchant.replace(/\s+Ref.*/i, '').trim();

  // Detect Credit vs Debit
  let type = 'debit';
  if (lowerText.includes('credited') || lowerText.includes('deposited') || lowerText.includes('refund')) {
    type = 'credit';
  }

  return {
    isSMS: true,
    isSpam: false,
    rawSMS: smsText,
    parsedData: {
      amount,
      merchant,
      accountLast4: account,
      type
    }
  };
}

module.exports = {
  generateMockSMS,
  generateSpamSMS,
  parseSMS
};
