const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');
const { categorize, getAllCategories } = require('./categorizer');
const { analyzeFraud } = require('./fraudDetector');
const { sendOTP, verifyOTP, validateSession, logout, getProfile } = require('./auth');
const { getIntegrationStatus, toggleAppConnection, startLiveFeeds } = require('./upiIntegration');
const WealthAgent = require('./agent');

// ─── Config ───
const PORT = 3001;
const { sequelize, User, BankAccount, Transaction, Budget } = require('./db');

// Enable database sync on start
sequelize.sync().then(() => console.log('📂 SQL Database Connected & Synced'));

// ─── Express Setup ───
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// ════════════════════════════════════════
// ─── AUTHENTICATION Routes ───
// ════════════════════════════════════════

app.post('/api/auth/send-otp', (req, res) => {
  const result = sendOTP(req.body.phone);
  res.json(result);
});

app.post('/api/auth/verify-otp', (req, res) => {
  const result = verifyOTP(req.body.phone, req.body.otp, req.body.name);
  res.json(result);
});

app.get('/api/auth/validate', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const session = validateSession(token);
  if (session) {
    res.json({ valid: true, user: session.user });
  } else {
    res.json({ valid: false });
  }
});

// ─── WebSocket Setup ───
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', async (ws) => {
  clients.add(ws);
  console.log(`🔌 Client connected (${clients.size} total)`);

  const txns = await Transaction.findAll({ limit: 50, order: [['timestamp', 'DESC']] });
  const stats = await getStats();

  ws.send(JSON.stringify({
    type: 'init',
    data: {
      transactions: txns,
      stats: stats
    }
  }));

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`🔌 Client disconnected (${clients.size} total)`);
  });
});

function broadcast(message) {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}

// ─── Transaction Processing with Fraud Detection ───
async function isDuplicate(txn) {
  const existing = await Transaction.findOne({ where: { referenceId: txn.referenceId } });
  return !!existing;
}

async function processTransaction(txn) {
  if (await isDuplicate(txn)) {
    console.log(`⚠️  Duplicate transaction ignored: ${txn.referenceId}`);
    return null;
  }

  // 🤖 AI Fraud Analysis
  const fraudResult = analyzeFraud(txn);
  txn.fraudRisk = fraudResult.riskLevel;

  // Pick a random bank account if not specified
  if (!txn.bankAccountId) {
    const bankAccounts = await BankAccount.findAll({ where: { isCash: false } });
    const randomBank = bankAccounts[Math.floor(Math.random() * bankAccounts.length)];
    txn.bankAccountId = randomBank.id;
    txn.bankAccountName = randomBank.name;
    txn.bankAccountNumber = randomBank.number;
  }

  // Adjust Balance natively
  const bank = await BankAccount.findByPk(txn.bankAccountId);
  if (bank) {
    if (txn.type === 'credit') {
      bank.balance += txn.amount;
    } else {
      bank.balance -= txn.amount;
    }
    await bank.save();
  }

  // 🔄 UI Compatibility Transform
  const frontendTxn = {
    ...txn,
    upiApp: {
      name: txn.upiAppName,
      code: txn.upiAppCode,
      icon: txn.upiAppIcon,
      color: txn.upiAppColor
    },
    fraud: {
      riskLevel: txn.fraudRisk,
      riskColor: txn.fraudRisk === 'safe' ? '#10b981' : txn.fraudRisk === 'low' ? '#f59e0b' : '#ef4444',
      riskIcon: txn.fraudRisk === 'safe' ? '✅' : '🚨'
    }
  };

  // 🔄 Special Logic: If it's an "ATM Withdrawal", transfer from Digital to Cash
  if (txn.merchant.toLowerCase().includes('atm withdrawal') || txn.merchant.toLowerCase().includes('cash withdrawal')) {
    const cashWallet = await BankAccount.findOne({ where: { isCash: true } });
    if (cashWallet && txn.bankAccountId !== cashWallet.id) {
      cashWallet.balance += txn.amount;
      await cashWallet.save();
      frontendTxn.isTransfer = true;
    }
  }

  // Track Budget Burn Rate (Only for debits)
  if (txn.type !== 'credit') {
    const b = await Budget.findOne({ where: { category: txn.category } });
    if (b) {
      b.spent += txn.amount;
      await b.save();
      
      // Proactive AI Insight
      if (b.spent > b.limit) {
        broadcast({ type: 'smart_insight', message: `🚨 AI Alert: You have exceeded your ₹${b.limit} budget for ${txn.category}!` });
      } else if (b.spent / b.limit > 0.8) {
        broadcast({ type: 'smart_insight', message: `⚠️ AI Warning: You've used 80% of your ${txn.category} budget.` });
      }
    }
  }

  // Store
  await Transaction.create({ ...txn, timestamp: new Date(txn.timestamp) });

  const stats = await getStats();

  // Log
  console.log(`${txn.type === 'credit' ? '💚' : '💰'} ${txn.upiApp.name} | ${txn.type === 'credit' ? '+' : '-'}₹${txn.amount} to ${txn.merchant}`);

  // Broadcast
  broadcast({
    type: 'new_transaction',
    data: {
      transaction: frontendTxn,
      stats: stats
    }
  });

  return frontendTxn;
}

// ─── Stats Calculator ───
const { Op } = require('sequelize');

async function getStats() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthTxns = await Transaction.findAll({
    where: { timestamp: { [Op.gte]: thisMonth } }
  });

  const todayTxns = await Transaction.findAll({
    where: { timestamp: { [Op.gte]: today } }
  });

  // Category Breakdown
  const categoryBreakdown = {};
  monthTxns.filter(t => t.type !== 'credit').forEach(t => {
    if (!categoryBreakdown[t.category]) {
      categoryBreakdown[t.category] = { category: t.category, icon: t.categoryIcon, color: t.categoryColor, total: 0, count: 0 };
    }
    categoryBreakdown[t.category].total += t.amount;
    categoryBreakdown[t.category].count++;
  });

  // App Breakdown
  const appBreakdown = {};
  monthTxns.forEach(t => {
    const key = t.upiAppCode;
    if (!appBreakdown[key]) {
      appBreakdown[key] = { code: t.upiAppCode, name: t.upiAppName, icon: t.upiAppIcon, total: 0, count: 0 };
    }
    appBreakdown[key].total += t.amount;
    appBreakdown[key].count++;
  });

  // Daily Spending (Last 7 days)
  const dailySpending = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    
    const dayTotal = monthTxns
      .filter(t => t.type !== 'credit' && new Date(t.timestamp) >= dayStart && new Date(t.timestamp) < dayEnd)
      .reduce((sum, t) => sum + t.amount, 0);

    dailySpending.push({
      date: dayStart.toISOString().split('T')[0],
      label: dayStart.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      total: dayTotal
    });
  }

  const bankAccounts = await BankAccount.findAll();
  const digitalBal = bankAccounts.filter(b => !b.isCash).reduce((s, b) => s + b.balance, 0);
  const cashBal = bankAccounts.filter(b => b.isCash).reduce((s, b) => s + b.balance, 0);
  const totalBal = digitalBal + cashBal;

  const monthSpent = monthTxns.filter(t => t.type !== 'credit').reduce((s, t) => s + t.amount, 0);
  const todaySpent = todayTxns.filter(t => t.type !== 'credit').reduce((s, t) => s + t.amount, 0);

  const budgets = await Budget.findAll();
  const budgetObj = {};
  budgets.forEach(b => {
    budgetObj[b.category] = { limit: b.limit, spent: b.spent, icon: b.icon, color: b.color };
  });

  const burnRate = monthSpent / Math.max(1, now.getDate());
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const predictedSpend = burnRate * daysInMonth;
  
  const totalMonthlyLimit = Object.values(budgetObj).reduce((s, b) => s + b.limit, 0);
  const remainingGlobalBudget = Math.max(0, totalMonthlyLimit - monthSpent);

  // Formatting helper for transactions (nested structure)
  const formatTxns = (txns) => txns.map(t => ({
    ...t.toJSON(),
    upiApp: { name: t.upiAppName, code: t.upiAppCode, icon: t.upiAppIcon, color: t.upiAppColor },
    fraud: { riskLevel: t.fraudRisk, riskColor: t.fraudRisk === 'safe' ? '#10b981' : '#ef4444', riskIcon: t.fraudRisk === 'safe' ? '✅' : '🚨' }
  }));

  return {
    todaySpent,
    monthSpent,
    totalSpent: monthSpent,
    todayCount: todayTxns.length,
    monthCount: monthTxns.length,
    categoryBreakdown: Object.values(categoryBreakdown).sort((a,b) => b.total - a.total),
    appBreakdown: Object.values(appBreakdown).sort((a,b) => b.total - a.total),
    dailySpending,
    bankAccounts,
    digitalBalance: digitalBal,
    cashBalance: cashBal,
    totalBalance: totalBal,
    budgets: budgetObj,
    forecasting: {
      burnRate: Math.round(burnRate),
      healthScore: Math.round(Math.max(0, 100 - (monthSpent / 50000) * 100)),
      totalMonthlyLimit,
      remainingGlobalBudget,
      forecastedBalance: Math.max(0, totalBal - (predictedSpend - monthSpent))
    },
    fraudStats: {
      flaggedCount: monthTxns.filter(t => t.fraudRisk !== 'safe').length,
      totalScanned: monthTxns.length
    },
    recentTransactions: formatTxns(monthTxns.slice(-20))
  };
}

// ════════════════════════════════════════
// ─── AUTH API Routes ───
// ════════════════════════════════════════

app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });
  const result = sendOTP(phone);
  res.json(result);
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp, name } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });
  const result = verifyOTP(phone, otp, name);
  if (result.success) {
    res.json(result);
  } else {
    res.status(401).json(result);
  }
});

app.get('/api/auth/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = validateSession(token);
  if (!session) return res.status(401).json({ error: 'Invalid or expired session' });
  res.json({ user: session.user });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) logout(token);
  res.json({ success: true });
});

app.get('/api/auth/validate', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = validateSession(token);
  if (!session) return res.status(401).json({ valid: false });
  res.json({ valid: true, user: session.user });
});

// ════════════════════════════════════════
// ─── FRAUD API Routes ───
// ════════════════════════════════════════

app.post('/api/fraud/analyze', (req, res) => {
  const { merchant, amount, upiApp } = req.body;
  if (!merchant || !amount) return res.status(400).json({ error: 'merchant and amount are required' });
  
  const mockTxn = {
    merchant,
    amount: parseFloat(amount),
    upiApp: { code: upiApp || 'gpay' },
    timestamp: new Date().toISOString()
  };
  
  const result = analyzeFraud(mockTxn);
  res.json(result);
});

app.get('/api/fraud/stats', (req, res) => {
  const stats = getStats();
  res.json(stats.fraudStats);
});

// ════════════════════════════════════════
// ─── UPI INTEGRATION Routes ───
// ════════════════════════════════════════

app.get('/api/integrations', (req, res) => {
  res.json(getIntegrationStatus());
});

app.post('/api/integrations/:appCode/toggle', (req, res) => {
  const result = toggleAppConnection(req.params.appCode);
  if (!result) return res.status(404).json({ error: 'App not found' });
  res.json(result);
  // Broadcast integration status update
  broadcast({ type: 'integration_update', data: getIntegrationStatus() });
});

// ════════════════════════════════════════
// ─── EXISTING TRANSACTION Routes ───
// ════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/api/transactions', (req, res) => {
  let txns = [...db.transactions].reverse();
  if (req.query.app && req.query.app !== 'all') {
    txns = txns.filter(t => t.upiApp.code === req.query.app);
  }
  if (req.query.category) {
    txns = txns.filter(t => t.category === req.query.category);
  }
  if (req.query.risk) {
    txns = txns.filter(t => t.fraud && t.fraud.riskLevel === req.query.risk);
  }
  const limit = parseInt(req.query.limit) || 50;
  txns = txns.slice(0, limit);
  res.json({ transactions: txns, total: txns.length });
});

app.get('/api/stats', (req, res) => {
  res.json(getStats());
});

app.get('/api/categories', (req, res) => {
  res.json(getAllCategories());
});
 
app.post('/api/budgets/update', async (req, res) => {
  const { category, limit } = req.body;
  if (!category || limit === undefined) return res.status(400).json({ error: 'category and limit are required' });
  
  const b = await Budget.findOne({ where: { category } });
  if (b) {
    b.limit = parseFloat(limit);
    await b.save();
    
    const allBudgets = await Budget.findAll();
    const budgetObj = {};
    allBudgets.forEach(b => budgetObj[b.category] = { limit: b.limit, spent: b.spent, icon: b.icon, color: b.color });
    
    broadcast({ type: 'budget_update', budgets: budgetObj });
    res.json({ success: true, budget: b });
  } else {
    res.status(404).json({ error: 'Category not found in budgets' });
  }
});

app.post('/api/budgets/add', async (req, res) => {
  const { category, limit, icon, color } = req.body;
  if (!category || limit === undefined) return res.status(400).json({ error: 'category and limit are required' });
  
  try {
    const b = await Budget.create({
      category,
      limit: parseFloat(limit),
      icon: icon || '📦',
      color: color || '#94a3b8'
    });
    
    const allBudgets = await Budget.findAll();
    const budgetObj = {};
    allBudgets.forEach(b => budgetObj[b.category] = { limit: b.limit, spent: b.spent, icon: b.icon, color: b.color });
    
    broadcast({ type: 'budget_update', budgets: budgetObj });
    res.json({ success: true, budget: b });
  } catch (err) {
    res.status(400).json({ error: 'Category already exists or invalid data' });
  }
});

app.delete('/api/budgets/:category', async (req, res) => {
  const { category } = req.params;
  const deleted = await Budget.destroy({ where: { category } });
  
  if (deleted) {
    const allBudgets = await Budget.findAll();
    const budgetObj = {};
    allBudgets.forEach(b => budgetObj[b.category] = { limit: b.limit, spent: b.spent, icon: b.icon, color: b.color });
    
    broadcast({ type: 'budget_update', budgets: budgetObj });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

app.post('/api/transactions/ingest', (req, res) => {
  const { merchant, amount, upiApp, type } = req.body;
  if (!merchant || !amount) {
    return res.status(400).json({ error: 'merchant and amount are required' });
  }

  const catInfo = categorize(merchant);
  const { UPI_APPS } = require('./simulator');
  const upi = UPI_APPS.find(a => a.code === upiApp) || UPI_APPS[0];

  const txn = {
    id: require('uuid').v4(),
    upiApp: upi,
    merchant,
    amount: parseFloat(amount),
    type: type || 'debit',
    category: catInfo.category,
    categoryIcon: catInfo.icon,
    categoryColor: catInfo.color,
    status: 'success',
    upiId: `user@${upi.code}`,
    timestamp: new Date().toISOString(),
    referenceId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000)
  };

  processTransaction(txn);
  res.json({ success: true, transaction: txn });
});

app.post('/api/manual/ingest', (req, res) => {
  const { merchant, amount, source, type, category } = req.body;
  if (!merchant || !amount || !source) {
    return res.status(400).json({ error: 'merchant, amount, and source are required' });
  }

  const { UPI_APPS } = require('./simulator');
  const upi = source === 'cash' 
    ? { code: 'cash', name: 'Physical Wallet', icon: '💵', color: '#10b981' } 
    : (UPI_APPS.find(a => a.code === source) || UPI_APPS[0]);

  let catInfo = { category: 'Other', icon: '📝', color: '#94a3b8' };
  if (category) {
    const allCats = getAllCategories();
    const found = allCats.find(c => c.name === category);
    if (found) catInfo = { category: found.name, icon: found.icon, color: found.color };
  } else {
    catInfo = categorize(merchant);
  }

  const txn = {
    id: require('uuid').v4(),
    upiApp: upi,
    merchant,
    amount: parseFloat(amount),
    type: type || 'debit',
    category: catInfo.category,
    categoryIcon: catInfo.icon,
    categoryColor: catInfo.color,
    status: 'success',
    upiId: source === 'cash' ? 'manual@cash' : `manual@${upi.code}`,
    timestamp: new Date().toISOString(),
    referenceId: 'MANUAL' + Date.now() + Math.floor(Math.random() * 1000),
    isManual: true,
    bankAccountId: source === 'cash' ? 'cash' : undefined // force it to hit Cash DB Wallet
  };

  processTransaction(txn);
  res.json({ success: true, transaction: txn });
});

// ─── Start Server ───
server.listen(PORT, async () => {
  console.log(`🚀 PayFlow Server running on http://localhost:${PORT}`);
  console.log(`🌐 Public URL: http://localhost:5173`);
  
  // Initialize default bank account if empty
  const count = await BankAccount.count();
  if (count === 0) {
    await BankAccount.create({ id: 'b1', name: 'HDFC Bank', number: 'XXXX 4410', balance: 24500, color: '#1d4ed8' });
    await BankAccount.create({ id: 'b2', name: 'SBI', number: 'XXXX 9002', balance: 8200, color: '#0369a1' });
    await BankAccount.create({ id: 'cash', name: 'Physical Cash', number: 'Wallet', balance: 1500, color: '#10b981', isCash: true });
  }

  // Initialize default budgets if empty
  const bCount = await Budget.count();
  if (bCount === 0) {
    const defaults = [
      { category: 'Food & Dining', limit: 4000, icon: '🍕', color: '#ef4444' },
      { category: 'Shopping', limit: 3000, icon: '🛍️', color: '#ec4899' },
      { category: 'Travel & Transport', limit: 2000, icon: '🚗', color: '#3b82f6' },
      { category: 'Bills & Utilities', limit: 5000, icon: '⚡', color: '#eab308' }
    ];
    for (const b of defaults) await Budget.create(b);
  }

  // Start live UPI integration feeds (replaces basic simulator)
  startLiveFeeds((txn) => {
    processTransaction(txn);
  });

  // Start AI Wealth Agent
  const agent = new WealthAgent(broadcast);
  agent.start(60000); // Audit every 60 seconds
});
