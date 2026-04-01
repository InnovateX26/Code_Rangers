// ===== DASHBOARD.JS =====

function renderDashboard() {
  // Balances
  const totalDebits = sumAmounts(getDebits());
  const totalCredits = sumAmounts(getCredits());
  const bankBal = 47500; // demo bank balance
  const cashBal = 1800;  // demo cash (after ATM)

  document.getElementById('total-balance').textContent = formatINR(bankBal + cashBal);
  document.getElementById('bank-balance').textContent = formatINR(bankBal);
  document.getElementById('cash-balance').textContent = formatINR(cashBal);

  // Today stats
  const todayTxns = getToday();
  const todayDebits = todayTxns.filter(t => t.type === 'debit');
  const todayCredits = todayTxns.filter(t => t.type === 'credit');
  document.getElementById('spent-today').textContent = formatINR(sumAmounts(todayDebits));
  document.getElementById('received-today').textContent = formatINR(sumAmounts(todayCredits));

  // This month
  const monthDebits = getThisMonth().filter(t => t.type === 'debit');
  document.getElementById('spent-month').textContent = formatINR(sumAmounts(monthDebits));

  // Subscriptions
  const subs = getSubscriptions();
  document.getElementById('subscriptions').textContent = formatINR(sumAmounts(subs));

  // Nudges
  renderNudges();

  // Micro leaks
  renderMicroLeaks();

  // Recent transactions (last 6)
  renderRecentTxns();
}

function renderNudges() {
  const container = document.getElementById('nudge-container');
  container.innerHTML = '';

  const nudges = [
    { msg: '🍕 You\'ve spent ₹' + sumAmounts(transactions.filter(t => t.merchant === 'Zomato' || t.merchant === 'Swiggy')) + ' on food delivery this month — consider cooking at home!', type: 'warn' },
    { msg: '🔁 ₹' + sumAmounts(getSubscriptions()) + ' auto-debited on subscriptions — some may be unused!', type: 'danger' },
    { msg: '☕ ' + transactions.filter(t => t.category === 'Food' && Math.abs(t.amount) <= 100).length + ' small chai/snack spends detected this week.', type: 'warn' },
  ];

  nudges.forEach((n, i) => {
    const div = document.createElement('div');
    div.className = 'nudge' + (n.type === 'danger' ? ' danger' : '');
    div.innerHTML = `<span>${n.msg}</span><span class="nudge-close" onclick="this.parentElement.remove()">✕</span>`;
    container.appendChild(div);
  });
}

function renderMicroLeaks() {
  const micros = getMicroSpends().slice(0, 8);
  const list = document.getElementById('micro-list');
  list.innerHTML = '';
  micros.forEach(t => {
    const div = document.createElement('div');
    div.className = 'micro-item';
    div.innerHTML = `<span>${t.icon} ${t.name}</span><span style="color:var(--danger);font-weight:600">${formatINR(Math.abs(t.amount))}</span>`;
    list.appendChild(div);
  });
  document.getElementById('micro-total').textContent = formatINR(sumAmounts(micros));
}

function renderRecentTxns() {
  const list = document.getElementById('recent-list');
  list.innerHTML = '';
  const recent = [...transactions].slice(0, 6);
  recent.forEach(t => {
    list.appendChild(createTxnItem(t, false));
  });
}

function createTxnItem(t, showRaw) {
  const div = document.createElement('div');
  div.className = 'txn-item';
  const iconBg = t.type === 'credit' ? 'rgba(0,229,160,0.12)' : 'rgba(255,107,53,0.1)';
  div.innerHTML = `
    <div class="txn-icon" style="background:${iconBg}">${t.icon}</div>
    <div class="txn-details">
      <div class="txn-name">${t.name}</div>
      <div class="txn-raw ${showRaw ? 'show' : ''}">${t.raw}</div>
      <div class="txn-meta-row">
        <span class="txn-cat">${t.category}</span>
        <span class="txn-date">${formatDate(t.date)}</span>
      </div>
    </div>
    <div class="txn-amount ${t.type}">${t.type === 'credit' ? '+' : '-'}${formatINR(Math.abs(t.amount))}</div>
  `;
  return div;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Init
renderDashboard();
