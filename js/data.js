// ===== DATA.JS — Demo Transaction Data =====
// Simulates real UPI SMS data parsed into smart labels

const BASE_TRANSACTIONS = [
  // Food
  { id:1, raw:'UPI/9283/PME*ZOM', name:'Zomato', merchant:'Zomato', category:'Food', icon:'🍕', amount:-349, date:'2026-04-01', type:'debit' },
  { id:2, raw:'UPI/6612/SWG*SWIGGY', name:'Swiggy', merchant:'Swiggy', category:'Food', icon:'🛵', amount:-220, date:'2026-04-01', type:'debit' },
  { id:3, raw:'UPI/7712/QSR*MCD', name:'McDonald\'s', merchant:'McDonald\'s', category:'Food', icon:'🍔', amount:-189, date:'2026-03-31', type:'debit' },
  { id:4, raw:'UPI/2201/CHAI*TAPRI', name:'Chai at Tapri', merchant:'Tapri Chai', category:'Food', icon:'☕', amount:-30, date:'2026-03-31', type:'debit' },
  { id:5, raw:'UPI/9982/CHAI*CCD', name:'Café Coffee Day', merchant:'CCD', category:'Food', icon:'☕', amount:-85, date:'2026-03-30', type:'debit' },
  { id:6, raw:'UPI/3312/ZOM*ORD', name:'Zomato', merchant:'Zomato', category:'Food', icon:'🍕', amount:-410, date:'2026-03-29', type:'debit' },
  { id:7, raw:'UPI/8822/CHAI*NESCAFE', name:'Nescafe Vending', merchant:'Nescafe', category:'Food', icon:'☕', amount:-20, date:'2026-03-29', type:'debit' },
  { id:8, raw:'UPI/5512/SWG*DLV', name:'Swiggy', merchant:'Swiggy', category:'Food', icon:'🛵', amount:-299, date:'2026-03-28', type:'debit' },

  // Transport
  { id:9,  raw:'UPI/4421/OLA*RIDE', name:'Ola Auto Ride', merchant:'Ola', category:'Transport', icon:'🚗', amount:-75, date:'2026-04-01', type:'debit' },
  { id:10, raw:'UPI/3311/UBER*CAB', name:'Uber Cab', merchant:'Uber', category:'Transport', icon:'🚕', amount:-120, date:'2026-03-31', type:'debit' },
  { id:11, raw:'UPI/9921/RAPIDO*BIKE', name:'Rapido Bike', merchant:'Rapido', category:'Transport', icon:'🏍️', amount:-40, date:'2026-03-30', type:'debit' },
  { id:12, raw:'UPI/1122/OLA*AUTO', name:'Ola Auto', merchant:'Ola', category:'Transport', icon:'🚗', amount:-55, date:'2026-03-28', type:'debit' },

  // Entertainment
  { id:13, raw:'UPI/7712/NFLX*SUB', name:'Netflix Subscription', merchant:'Netflix', category:'Subscriptions', icon:'🎬', amount:-649, date:'2026-04-01', type:'debit', isSub:true },
  { id:14, raw:'UPI/8831/SPTFY*SUB', name:'Spotify Premium', merchant:'Spotify', category:'Subscriptions', icon:'🎵', amount:-119, date:'2026-03-30', type:'debit', isSub:true },
  { id:15, raw:'UPI/5512/HOTSTR*SUB', name:'Hotstar Premium', merchant:'Hotstar', category:'Subscriptions', icon:'📺', amount:-299, date:'2026-03-29', type:'debit', isSub:true },
  { id:16, raw:'UPI/2231/BOOKMYSHW', name:'BookMyShow', merchant:'BookMyShow', category:'Entertainment', icon:'🎟️', amount:-450, date:'2026-03-27', type:'debit' },

  // Shopping
  { id:17, raw:'UPI/6612/AMZN*ORD', name:'Amazon Order', merchant:'Amazon', category:'Shopping', icon:'📦', amount:-799, date:'2026-03-31', type:'debit' },
  { id:18, raw:'UPI/9912/FLIPKRT*PAY', name:'Flipkart', merchant:'Flipkart', category:'Shopping', icon:'🛒', amount:-1299, date:'2026-03-28', type:'debit' },
  { id:19, raw:'UPI/3321/AJIO*ORD', name:'AJIO Fashion', merchant:'AJIO', category:'Shopping', icon:'👕', amount:-599, date:'2026-03-26', type:'debit' },

  // Health
  { id:20, raw:'UPI/2212/PHRMCY*NET', name:'Netmeds Pharmacy', merchant:'Netmeds', category:'Health', icon:'💊', amount:-340, date:'2026-03-30', type:'debit' },
  { id:21, raw:'UPI/8812/CULT*GYM', name:'Cult.fit Gym', merchant:'Cult.fit', category:'Health', icon:'🏋️', amount:-2499, date:'2026-04-01', type:'debit', isSub:true },

  // ATM
  { id:22, raw:'ATM WDL 9283 SBI ATM PATNA', name:'ATM Withdrawal', merchant:'SBI ATM', category:'ATM', icon:'🏧', amount:-2000, date:'2026-03-29', type:'debit' },
  { id:23, raw:'ATM WDL 7712 HDFC ATM', name:'ATM Withdrawal', merchant:'HDFC ATM', category:'ATM', icon:'🏧', amount:-1000, date:'2026-03-26', type:'debit' },

  // Received (Credits)
  { id:24, raw:'UPI/CREDIT/KUNDAR*SALARY', name:'Salary Received', merchant:'Employer', category:'Received', icon:'💰', amount:25000, date:'2026-04-01', type:'credit' },
  { id:25, raw:'UPI/P2P/9283/SUMIT', name:'Received from Sumit', merchant:'Sumit Suman', category:'Received', icon:'👤', amount:500, date:'2026-03-30', type:'credit' },
  { id:26, raw:'UPI/P2P/7712/PRANAV', name:'Received from Pranav', merchant:'Pranav Pandey', category:'Received', icon:'👤', amount:200, date:'2026-03-28', type:'credit' },

  // More micro spends
  { id:27, raw:'UPI/1121/CHAI*LOCAL', name:'Chai at Local Stall', merchant:'Local Stall', category:'Food', icon:'☕', amount:-15, date:'2026-03-30', type:'debit' },
  { id:28, raw:'UPI/9901/AUTOCHRG', name:'Auto Ride', merchant:'Auto', category:'Transport', icon:'🛺', amount:-50, date:'2026-03-27', type:'debit' },
  { id:29, raw:'UPI/3312/MEDPLUS', name:'MedPlus Pharmacy', merchant:'MedPlus', category:'Health', icon:'💊', amount:-95, date:'2026-03-27', type:'debit' },
  { id:30, raw:'UPI/7712/YT*PREMIUM', name:'YouTube Premium', merchant:'YouTube', category:'Subscriptions', icon:'▶️', amount:-189, date:'2026-03-25', type:'debit', isSub:true },
];

// Sync adds fresh transactions
const SYNC_ADDITIONS = [
  { id:101, raw:'UPI/9283/ZOM*NEW', name:'Zomato', merchant:'Zomato', category:'Food', icon:'🍕', amount:-319, date:'2026-04-01', type:'debit' },
  { id:102, raw:'UPI/5512/UBER*NEW', name:'Uber Ride', merchant:'Uber', category:'Transport', icon:'🚕', amount:-95, date:'2026-04-01', type:'debit' },
  { id:103, raw:'UPI/8831/AMZN*NEW', name:'Amazon Order', merchant:'Amazon', category:'Shopping', icon:'📦', amount:-449, date:'2026-04-01', type:'debit' },
  { id:104, raw:'UPI/P2P/MANJEET', name:'Received from Manjeet', merchant:'Manjeet Roy', category:'Received', icon:'👤', amount:300, date:'2026-04-01', type:'credit' },
];

// State
let transactions = [...BASE_TRANSACTIONS];
let syncCount = 0;

function syncData() {
  syncCount++;
  const btn = document.getElementById('sync-btn');
  if (btn) { btn.classList.add('syncing'); btn.disabled = true; }

  setTimeout(() => {
    if (syncCount === 1) {
      // Add sync additions
      SYNC_ADDITIONS.forEach(t => {
        if (!transactions.find(x => x.id === t.id)) {
          transactions.unshift(t);
        }
      });
    } else {
      // Subsequent syncs: tweak an amount slightly
      transactions = transactions.map(t => ({
        ...t,
        amount: t.type === 'debit' ? t.amount - Math.floor(Math.random() * 10) : t.amount
      }));
    }

    if (btn) { btn.classList.remove('syncing'); btn.disabled = false; }

    // Show toast
    showSyncToast();

    // Reload page data
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderTransactions === 'function') renderTransactions();
    if (typeof renderInsights === 'function') renderInsights();
  }, 1500);
}

function showSyncToast() {
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#00e5a0;color:#000;padding:12px 20px;border-radius:10px;font-family:var(--font-head);font-weight:700;font-size:13px;z-index:9999;animation:fadeUp 0.3s ease';
  toast.textContent = '✓ Synced ' + transactions.length + ' transactions';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function getToday() { return transactions.filter(t => t.date === '2026-04-01'); }
function getThisMonth() { return transactions.filter(t => t.date.startsWith('2026-04')); }
function getDebits() { return transactions.filter(t => t.type === 'debit'); }
function getCredits() { return transactions.filter(t => t.type === 'credit'); }
function getMicroSpends() { return getDebits().filter(t => Math.abs(t.amount) <= 100 && t.category !== 'ATM'); }
function getSubscriptions() { return transactions.filter(t => t.isSub); }

function sumAmounts(arr) { return arr.reduce((s, t) => s + Math.abs(t.amount), 0); }

function formatINR(n) {
  if (n >= 100000) return '₹' + (n/100000).toFixed(1) + 'L';
  if (n >= 1000) return '₹' + (n/1000).toFixed(1) + 'k';
  return '₹' + Math.abs(n).toLocaleString('en-IN');
}

function getCategoryIcon(cat) {
  const map = { Food:'🍔', Transport:'🚗', Entertainment:'🎬', Shopping:'🛒', Subscriptions:'🔁', Health:'💊', ATM:'🏧', Received:'💰' };
  return map[cat] || '💳';
}

function getCategoryColor(cat) {
  const map = {
    Food: '#ff6b35',
    Transport: '#0077ff',
    Entertainment: '#a855f7',
    Shopping: '#f59e0b',
    Subscriptions: '#ec4899',
    Health: '#10b981',
    ATM: '#6b7fa3',
    Received: '#00e5a0'
  };
  return map[cat] || '#6b7fa3';
}
