// ─── AI Fraud Detection Engine ───
// Multi-factor scoring system that analyzes transactions for fraud risk
// Uses behavioral analysis, merchant verification, anomaly detection

const VERIFIED_MERCHANTS = new Set([
  'zomato', 'swiggy', 'dominos', 'pizza hut', 'mcdonalds', 'kfc', 'burger king',
  'subway', 'starbucks', 'cafe coffee day', 'haldirams', 'barbeque nation',
  'amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'snapdeal', 'nykaa',
  'tata cliq', 'reliance digital', 'croma', 'big bazaar', 'dmart',
  'uber', 'ola', 'rapido', 'irctc', 'makemytrip', 'goibibo', 'redbus',
  'netflix', 'hotstar', 'spotify', 'bookmyshow', 'pvr', 'inox',
  'jio', 'airtel', 'vi', 'bsnl', 'tata sky',
  'pharmeasy', 'netmeds', '1mg', 'apollo', 'practo',
  'bigbasket', 'blinkit', 'zepto', 'instamart', 'jiomart', 'dunzo',
  'udemy', 'coursera', 'unacademy', 'byju',
  'indian oil', 'hp petrol', 'bharat petroleum',
  'electricity bill', 'water bill', 'gas bill', 'broadband'
]);

const SUSPICIOUS_PATTERNS = [
  { pattern: /test|fake|fraud|hack|steal/i, weight: 90, reason: 'Suspicious keywords in merchant name' },
  { pattern: /xyz|abc|unknown|random/i, weight: 60, reason: 'Generic/unknown merchant name' },
  { pattern: /^[a-z]{1,3}$/i, weight: 70, reason: 'Very short merchant name (possible fake)' },
  { pattern: /\d{6,}/i, weight: 40, reason: 'Numeric ID-like merchant name' },
];

// Store recent transaction history for behavioral analysis
let transactionHistory = [];
const MAX_HISTORY = 1000;

function addToHistory(txn) {
  transactionHistory.push({
    amount: txn.amount,
    merchant: txn.merchant,
    timestamp: txn.timestamp,
    upiApp: txn.upiApp?.code
  });
  if (transactionHistory.length > MAX_HISTORY) {
    transactionHistory = transactionHistory.slice(-MAX_HISTORY);
  }
}

function getAverageAmount() {
  if (transactionHistory.length === 0) return 1000;
  const sum = transactionHistory.reduce((s, t) => s + t.amount, 0);
  return sum / transactionHistory.length;
}

function getRecentFrequency(windowMs = 60000) {
  const now = Date.now();
  return transactionHistory.filter(t => (now - new Date(t.timestamp).getTime()) < windowMs).length;
}

/**
 * AI Fraud Analysis Engine
 * Returns a fraud assessment with risk score, risk level, and detailed factors
 */
function analyzeFraud(transaction) {
  const factors = [];
  let riskScore = 0;

  // ─── Factor 1: Merchant Verification ───
  const merchantLower = transaction.merchant.toLowerCase();
  const isVerified = Array.from(VERIFIED_MERCHANTS).some(m => merchantLower.includes(m));
  
  if (isVerified) {
    factors.push({
      factor: 'Merchant Verification',
      status: 'pass',
      detail: 'Merchant is in verified database',
      score: 0
    });
  } else {
    riskScore += 25;
    factors.push({
      factor: 'Merchant Verification',
      status: 'warn',
      detail: 'Merchant not found in verified database',
      score: 25
    });
  }

  // ─── Factor 2: Suspicious Pattern Detection ───
  let patternMatch = false;
  for (const sp of SUSPICIOUS_PATTERNS) {
    if (sp.pattern.test(transaction.merchant)) {
      riskScore += sp.weight;
      factors.push({
        factor: 'Pattern Analysis',
        status: 'fail',
        detail: sp.reason,
        score: sp.weight
      });
      patternMatch = true;
      break;
    }
  }
  if (!patternMatch) {
    factors.push({
      factor: 'Pattern Analysis',
      status: 'pass',
      detail: 'No suspicious patterns detected',
      score: 0
    });
  }

  // ─── Factor 3: Amount Anomaly Detection ───
  const avgAmount = getAverageAmount();
  const amountRatio = transaction.amount / avgAmount;
  
  if (amountRatio > 5) {
    riskScore += 35;
    factors.push({
      factor: 'Amount Anomaly',
      status: 'fail',
      detail: `Amount ₹${transaction.amount} is ${amountRatio.toFixed(1)}x above average (₹${Math.round(avgAmount)})`,
      score: 35
    });
  } else if (amountRatio > 3) {
    riskScore += 15;
    factors.push({
      factor: 'Amount Anomaly',
      status: 'warn',
      detail: `Amount is ${amountRatio.toFixed(1)}x above average`,
      score: 15
    });
  } else {
    factors.push({
      factor: 'Amount Anomaly',
      status: 'pass',
      detail: `Amount within normal range (avg ₹${Math.round(avgAmount)})`,
      score: 0
    });
  }

  // ─── Factor 4: Velocity Check (rapid fire detection) ───
  const recentCount = getRecentFrequency(30000); // 30s window
  if (recentCount > 5) {
    riskScore += 30;
    factors.push({
      factor: 'Velocity Check',
      status: 'fail',
      detail: `${recentCount} transactions in last 30 seconds (unusual burst)`,
      score: 30
    });
  } else if (recentCount > 3) {
    riskScore += 10;
    factors.push({
      factor: 'Velocity Check',
      status: 'warn',
      detail: `${recentCount} transactions in last 30 seconds`,
      score: 10
    });
  } else {
    factors.push({
      factor: 'Velocity Check',
      status: 'pass',
      detail: 'Normal transaction frequency',
      score: 0
    });
  }

  // ─── Factor 5: Time-based Analysis ───
  const hour = new Date(transaction.timestamp).getHours();
  if (hour >= 1 && hour <= 5) {
    riskScore += 15;
    factors.push({
      factor: 'Time Analysis',
      status: 'warn',
      detail: 'Transaction during unusual hours (1AM-5AM)',
      score: 15
    });
  } else {
    factors.push({
      factor: 'Time Analysis',
      status: 'pass',
      detail: 'Transaction during normal business hours',
      score: 0
    });
  }

  // ─── Factor 6: Duplicate Merchant Check (same merchant rapid spending) ───
  const recentSameMerchant = transactionHistory.filter(t => {
    return t.merchant === transaction.merchant && 
           (Date.now() - new Date(t.timestamp).getTime()) < 120000; // 2 min window
  });
  
  if (recentSameMerchant.length > 2) {
    riskScore += 20;
    factors.push({
      factor: 'Duplicate Check',
      status: 'fail',
      detail: `${recentSameMerchant.length} payments to same merchant in 2 minutes`,
      score: 20
    });
  } else {
    factors.push({
      factor: 'Duplicate Check',
      status: 'pass',
      detail: 'No rapid duplicate payments detected',
      score: 0
    });
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  // Determine risk level
  let riskLevel, riskColor, riskIcon;
  if (riskScore <= 15) {
    riskLevel = 'safe';
    riskColor = '#10b981';
    riskIcon = '✅';
  } else if (riskScore <= 40) {
    riskLevel = 'low';
    riskColor = '#f59e0b';
    riskIcon = '⚠️';
  } else if (riskScore <= 70) {
    riskLevel = 'medium';
    riskColor = '#f97316';
    riskIcon = '🔶';
  } else {
    riskLevel = 'high';
    riskColor = '#ef4444';
    riskIcon = '🚨';
  }

  // Add to history for future analysis
  addToHistory(transaction);

  return {
    riskScore,
    riskLevel,
    riskColor,
    riskIcon,
    merchantVerified: isVerified,
    factors,
    recommendation: riskScore > 70 
      ? 'BLOCK — High fraud risk. Review immediately.'
      : riskScore > 40 
        ? 'REVIEW — Moderate risk detected. Manual verification recommended.'
        : riskScore > 15
          ? 'MONITOR — Minor anomalies detected. Continue monitoring.'
          : 'APPROVED — Transaction appears legitimate.',
    analyzedAt: new Date().toISOString()
  };
}

module.exports = { analyzeFraud, addToHistory, VERIFIED_MERCHANTS };
