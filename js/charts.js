// ===== CHARTS.JS =====

let weeklyChartInst = null;
let categoryChartInst = null;

function renderCharts() {
  renderWeeklyChart();
  renderCategoryChart();
}

function renderWeeklyChart() {
  const ctx = document.getElementById('weeklyChart');
  if (!ctx) return;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = [820, 1450, 310, 990, 1200, 2100, 680];

  if (weeklyChartInst) weeklyChartInst.destroy();
  weeklyChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        label: 'Spent (₹)',
        data: data,
        backgroundColor: 'rgba(0,229,160,0.2)',
        borderColor: '#00e5a0',
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(0,229,160,0.4)',
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => '₹' + ctx.raw } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7fa3', font: { family: 'DM Sans' } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7fa3', callback: v => '₹' + v, font: { family: 'DM Sans' } } }
      }
    }
  });
}

function renderCategoryChart() {
  const ctx = document.getElementById('categoryChart');
  if (!ctx) return;

  const categories = ['Food', 'Shopping', 'Transport', 'Subscriptions', 'Health', 'ATM'];
  const catData = categories.map(cat => sumAmounts(transactions.filter(t => t.category === cat && t.type === 'debit')));
  const colors = categories.map(c => getCategoryColor(c));

  if (categoryChartInst) categoryChartInst.destroy();
  categoryChartInst = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        data: catData,
        backgroundColor: colors.map(c => c + '99'),
        borderColor: colors,
        borderWidth: 2,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.label + ': ₹' + ctx.raw } }
      }
    }
  });
}

// Init on dashboard
if (document.getElementById('weeklyChart')) renderCharts();
