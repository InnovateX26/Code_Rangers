// ─── UPI Transaction Simulator ───
// Generates realistic UPI transactions from multiple apps

const { v4: uuidv4 } = require('uuid');
const { categorize } = require('./categorizer');

const UPI_APPS = [
  { name: 'Google Pay', code: 'gpay', color: '#4285F4', icon: '🔵' },
  { name: 'PhonePe', code: 'phonepe', color: '#5F259F', icon: '🟣' },
  { name: 'Paytm', code: 'paytm', color: '#00BAF2', icon: '🔷' },
  { name: 'BHIM', code: 'bhim', color: '#00B386', icon: '🟢' },
  { name: 'Amazon Pay', code: 'amazonpay', color: '#FF9900', icon: '🟠' }
];

const MERCHANTS = [
  // Food & Dining
  { name: 'Zomato - Chicken Biryani', minAmount: 199, maxAmount: 799 },
  { name: 'Zomato - Pizza Order', minAmount: 249, maxAmount: 999 },
  { name: 'Swiggy - Dinner Order', minAmount: 150, maxAmount: 650 },
  { name: 'Dominos Pizza', minAmount: 299, maxAmount: 899 },
  { name: 'Starbucks Coffee', minAmount: 250, maxAmount: 650 },
  { name: 'McDonalds', minAmount: 149, maxAmount: 499 },
  { name: 'Cafe Coffee Day', minAmount: 120, maxAmount: 380 },
  { name: 'Haldirams', minAmount: 200, maxAmount: 1200 },
  
  // Shopping
  { name: 'Amazon - Electronics', minAmount: 499, maxAmount: 15999 },
  { name: 'Flipkart - Fashion', minAmount: 399, maxAmount: 4999 },
  { name: 'Myntra - Clothing', minAmount: 599, maxAmount: 3999 },
  { name: 'Big Bazaar', minAmount: 500, maxAmount: 5000 },
  { name: 'Reliance Digital', minAmount: 999, maxAmount: 29999 },
  
  // Travel
  { name: 'Uber Ride', minAmount: 89, maxAmount: 450 },
  { name: 'Ola Auto', minAmount: 49, maxAmount: 250 },
  { name: 'Rapido Bike', minAmount: 30, maxAmount: 150 },
  { name: 'Indian Oil Petrol', minAmount: 500, maxAmount: 3000 },
  { name: 'IRCTC Train Ticket', minAmount: 200, maxAmount: 2500 },
  
  // Entertainment
  { name: 'Netflix Subscription', minAmount: 149, maxAmount: 649 },
  { name: 'Spotify Premium', minAmount: 119, maxAmount: 179 },
  { name: 'BookMyShow - Movie', minAmount: 200, maxAmount: 800 },
  { name: 'Hotstar Subscription', minAmount: 299, maxAmount: 1499 },
  
  // Bills
  { name: 'Jio Recharge', minAmount: 149, maxAmount: 999 },
  { name: 'Airtel Broadband', minAmount: 499, maxAmount: 1499 },
  { name: 'Electricity Bill', minAmount: 500, maxAmount: 3000 },
  
  // Health
  { name: 'Apollo Pharmacy', minAmount: 100, maxAmount: 2000 },
  { name: 'PharmEasy Order', minAmount: 150, maxAmount: 1500 },
  
  // Groceries
  { name: 'BigBasket Groceries', minAmount: 300, maxAmount: 3000 },
  { name: 'Blinkit - Quick Delivery', minAmount: 99, maxAmount: 999 },
  { name: 'Zepto Groceries', minAmount: 100, maxAmount: 1500 },
];

function generateTransaction() {
  const app = UPI_APPS[Math.floor(Math.random() * UPI_APPS.length)];
  const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
  const amount = Math.floor(Math.random() * (merchant.maxAmount - merchant.minAmount + 1)) + merchant.minAmount;
  const catInfo = categorize(merchant.name);

  return {
    id: uuidv4(),
    upiApp: app,
    merchant: merchant.name,
    amount: amount,
    type: 'debit',
    category: catInfo.category,
    categoryIcon: catInfo.icon,
    categoryColor: catInfo.color,
    status: 'success',
    upiId: `user@${app.code}`,
    timestamp: new Date().toISOString(),
    referenceId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000)
  };
}

function startSimulator(onTransaction, intervalMs = 4000) {
  console.log('🚀 UPI Transaction Simulator started');
  console.log('   Generating transactions every', intervalMs / 1000, 'seconds');
  
  // Fire first transaction immediately
  const firstTxn = generateTransaction();
  onTransaction(firstTxn);
  
  // Then continue at intervals (randomized between 2-8 seconds)
  const timer = setInterval(() => {
    const txn = generateTransaction();
    onTransaction(txn);
  }, intervalMs + Math.floor(Math.random() * 4000) - 2000);

  return timer;
}

module.exports = { generateTransaction, startSimulator, UPI_APPS };
