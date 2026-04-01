// ─── Real-time UPI App Integration Layer ───
// Simulates live connections to UPI apps and processes their transaction feeds
// In production, this would use actual UPI webhook endpoints / SMS parsing / bank APIs

const { v4: uuidv4 } = require('uuid');
const { categorize } = require('./categorizer');
const { generateMockSMS, parseSMS, generateSpamSMS } = require('./smsParser');

const APP_CONFIGS = {
  gpay: {
    name: 'Google Pay',
    code: 'gpay',
    color: '#4285F4',
    icon: '🔵',
    status: 'connected',
    lastSync: null,
    transactionCount: 0,
    webhookUrl: '/api/webhook/gpay',
    features: ['UPI Payments', 'Bill Pay', 'Rewards', 'Bank Transfer']
  },
  phonepe: {
    name: 'PhonePe',
    code: 'phonepe',
    color: '#5F259F',
    icon: '🟣',
    status: 'connected',
    lastSync: null,
    transactionCount: 0,
    webhookUrl: '/api/webhook/phonepe',
    features: ['UPI Payments', 'Insurance', 'Mutual Funds', 'Gold']
  },
  paytm: {
    name: 'Paytm',
    code: 'paytm',
    color: '#00BAF2',
    icon: '🔷',
    status: 'connected',
    lastSync: null,
    transactionCount: 0,
    webhookUrl: '/api/webhook/paytm',
    features: ['UPI Payments', 'Wallet', 'Paytm Mall', 'Movies']
  },
  bhim: {
    name: 'BHIM',
    code: 'bhim',
    color: '#00B386',
    icon: '🟢',
    status: 'connected',
    lastSync: null,
    transactionCount: 0,
    webhookUrl: '/api/webhook/bhim',
    features: ['UPI Payments', 'QR Scan', 'Bill Pay']
  },
  amazonpay: {
    name: 'Amazon Pay',
    code: 'amazonpay',
    color: '#FF9900',
    icon: '🟠',
    status: 'connected',
    lastSync: null,
    transactionCount: 0,
    webhookUrl: '/api/webhook/amazonpay',
    features: ['UPI Payments', 'Shopping', 'Cashback', 'Rewards']
  }
};

// Real-time data feeds from each app (simulated)
const APP_SPECIFIC_MERCHANTS = {
  gpay: [
    { name: 'Zomato - Chicken Biryani', min: 199, max: 799 },
    { name: 'Netflix Subscription', min: 149, max: 649 },
    { name: 'Uber Ride', min: 89, max: 450 },
    { name: 'BigBasket Groceries', min: 300, max: 3000 },
    { name: 'Electricity Bill', min: 500, max: 3000 },
    { name: 'Google One Storage', min: 130, max: 650 },
  ],
  phonepe: [
    { name: 'Swiggy - Dinner Order', min: 150, max: 650 },
    { name: 'Flipkart - Fashion', min: 399, max: 4999 },
    { name: 'Ola Auto', min: 49, max: 250 },
    { name: 'Jio Recharge', min: 149, max: 999 },
    { name: 'Apollo Pharmacy', min: 100, max: 2000 },
    { name: 'PhonePe Mutual Fund SIP', min: 500, max: 10000 },
  ],
  paytm: [
    { name: 'Dominos Pizza', min: 299, max: 899 },
    { name: 'Amazon - Electronics', min: 499, max: 15999 },
    { name: 'Rapido Bike', min: 30, max: 150 },
    { name: 'Airtel Broadband', min: 499, max: 1499 },
    { name: 'BookMyShow - Movie', min: 200, max: 800 },
    { name: 'Paytm Wallet Topup', min: 100, max: 5000 },
  ],
  bhim: [
    { name: 'Starbucks Coffee', min: 250, max: 650 },
    { name: 'Indian Oil Petrol', min: 500, max: 3000 },
    { name: 'IRCTC Train Ticket', min: 200, max: 2500 },
    { name: 'Water Bill', min: 200, max: 1500 },
  ],
  amazonpay: [
    { name: 'Amazon - Electronics', min: 499, max: 15999 },
    { name: 'Myntra - Clothing', min: 599, max: 3999 },
    { name: 'Zepto Groceries', min: 100, max: 1500 },
    { name: 'Spotify Premium', min: 119, max: 179 },
    { name: 'Amazon Prime', min: 299, max: 1499 },
  ]
};

/**
 * Generate a transaction from a specific UPI app
 */
function generateAppTransaction(appCode) {
  const config = APP_CONFIGS[appCode];
  if (!config) return null;

  const merchants = APP_SPECIFIC_MERCHANTS[appCode] || [];
  if (merchants.length === 0) return null;

  const merchant = merchants[Math.floor(Math.random() * merchants.length)];
  let amount = Math.floor(Math.random() * (merchant.max - merchant.min + 1)) + merchant.min;
  // 🔒 Strict Hackathon / Demo Realism: Most under 1000, absolute max 5000
  amount = Math.min(amount, 5000); 
  if (amount > 1000 && Math.random() > 0.3) amount = Math.floor(Math.random() * 800) + 100;
  
  const catInfo = categorize(merchant.name);

  config.lastSync = new Date().toISOString();
  config.transactionCount++;

  // 🤖 Simulate SMS Interception 35% of the time
  const smsRoll = Math.random();
  let rawSMS = null;
  let parsed = null;
  let finalMerchant = merchant.name;
  let finalAmount = amount;
  let finalType = 'debit';

  if (smsRoll < 0.35) {
    const smsTypeRoll = Math.random();
    
    if (smsTypeRoll < 0.3) {
      // Spam
      rawSMS = generateSpamSMS(merchant.name);
      parsed = parseSMS(rawSMS);
    } else if (smsTypeRoll < 0.5) {
      // Credit
      const creditMerchant = "Refund / Salary";
      rawSMS = generateMockSMS(amount * 3, creditMerchant, "XXXX", true);
      parsed = parseSMS(rawSMS);
    } else {
      // Debit
      rawSMS = generateMockSMS(amount, merchant.name, "XXXX", false);
      parsed = parseSMS(rawSMS);
    }

    if (parsed.isSpam) {
      console.log(`🛑 [SMS FILTER] Dropped Spam SMS: "${rawSMS.substring(0, 40)}..."`);
      return null;
    }

    finalMerchant = parsed.parsedData.merchant;
    finalAmount = parsed.parsedData.amount;
    finalType = parsed.parsedData.type || 'debit';
  }

  return {
    id: uuidv4(),
    upiApp: { name: config.name, code: config.code, color: config.color, icon: config.icon },
    merchant: finalMerchant,
    amount: finalAmount,
    type: finalType,
    category: catInfo.category,
    categoryIcon: catInfo.icon,
    categoryColor: catInfo.color,
    status: 'success',
    upiId: `user@${config.code}`,
    timestamp: new Date().toISOString(),
    referenceId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000),
    source: rawSMS ? 'sms_intercept' : 'live_integration',
    rawSMS: rawSMS
  };
}

/**
 * Get integration status for all apps
 */
function getIntegrationStatus() {
  return Object.values(APP_CONFIGS).map(app => ({
    name: app.name,
    code: app.code,
    color: app.color,
    icon: app.icon,
    status: app.status,
    lastSync: app.lastSync,
    transactionCount: app.transactionCount,
    webhookUrl: app.webhookUrl,
    features: app.features
  }));
}

/**
 * Connect/disconnect an app
 */
function toggleAppConnection(appCode) {
  const config = APP_CONFIGS[appCode];
  if (!config) return null;
  
  config.status = config.status === 'connected' ? 'disconnected' : 'connected';
  console.log(`${config.icon} ${config.name} ${config.status === 'connected' ? 'connected ✅' : 'disconnected ❌'}`);
  return config;
}

/**
 * Start real-time feed from all connected apps
 * Each app generates transactions at slightly different intervals to look realistic 
 */
function startLiveFeeds(onTransaction) {
  const timers = [];
  
  Object.keys(APP_CONFIGS).forEach((appCode, index) => {
    // Stagger start times and intervals per app
    const baseInterval = 180000 + (index * 60000); // 3-8 minutes
    
    const timer = setInterval(() => {
      const config = APP_CONFIGS[appCode];
      if (config.status === 'connected') {
        const txn = generateAppTransaction(appCode);
        if (txn) {
          onTransaction(txn);
        }
      }
    }, baseInterval + Math.floor(Math.random() * 60000));

    timers.push(timer);
  });

  console.log('📡 Live UPI feeds started for all connected apps');
  return timers;
}

module.exports = { 
  getIntegrationStatus, 
  toggleAppConnection, 
  startLiveFeeds, 
  generateAppTransaction,
  APP_CONFIGS 
};
