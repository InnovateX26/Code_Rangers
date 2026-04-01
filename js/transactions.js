/ ===== TRANSACTIONS.JS =====/

let activeCategory = 'all';
let showRaw = false;

function renderTransactions() {
  filterTransactions();
  document.getElementById('txn-meta').textContent =
    transactions.length + ' transactions · ' + formatINR(sumAmounts(getDebits())) + ' spent';
}

function filterTransactions() {
  const search = (document.getElementById('search-input')?.value || '').toLowerCase();
  let filtered = transactions;

  if (activeCategory !== 'all') {
    filtered = filtered.filter(t => t.category === activeCategory);
  }
  if (search) {
    filtered = filtered.filter(t =>
      t.name.toLowerCase().includes(search) ||
      t.raw.toLowerCase().includes(search) ||
      t.category.toLowerCase().includes(search)
    );
  }

  const list = document.getElementById('txn-full-list');
  const empty = document.getElementById('empty-state');
  list.innerHTML = '';

  if (filtered.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  // Group by date
  const groups = {};
  filtered.forEach(t => {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  });

  Object.keys(groups).sort((a, b) => b.localeCompare(a)).forEach(date => {
    // Date header
    const header = document.createElement('div');
    header.style.cssText = 'padding:14px 0 6px;font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px;border-top:1px solid var(--border);margin-top:4px';
    header.textContent = formatDateFull(date) + ' · ' + formatINR(sumAmounts(groups[date].filter(t => t.type === 'debit'))) + ' spent';
    list.appendChild(header);

    groups[date].forEach(t => list.appendChild(createTxnItem(t, showRaw)));
  });
}

function toggleRaw() {
  showRaw = document.getElementById('raw-toggle').checked;
  filterTransactions();
}

// Category chip clicks
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeCategory = chip.dataset.cat;
    filterTransactions();
  });
});

function formatDateFull(dateStr) {
  const d = new Date(dateStr);
  const today = new Date('2026-04-01');
  const yesterday = new Date('2026-03-31');
  if (dateStr === '2026-04-01') return 'Today';
  if (dateStr === '2026-03-31') return 'Yesterday';
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
}

// Init
renderTransactions();
