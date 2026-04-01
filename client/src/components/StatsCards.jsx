import React from 'react';
import LiquiditySplit from './LiquiditySplit';

function StatsCards({ stats }) {
  if (!stats) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card stat-card">
            <div className="stat-label">Loading...</div>
            <div className="stat-value" style={{ color: 'var(--text-muted)' }}>—</div>
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="stats-grid" id="stats-grid">
      <LiquiditySplit accounts={stats.bankAccounts} />

      <div className="glass-card stat-card" id="stat-today">
        <div className="stat-label">Today's Spending</div>
        <div className="stat-value blue">{formatCurrency(stats.todaySpent)}</div>
        <div className="stat-sub">{stats.todayCount} transactions</div>
      </div>

      <div className="glass-card stat-card" id="stat-month">
        <div className="stat-label">This Month</div>
        <div className="stat-value cyan">{formatCurrency(stats.monthSpent)}</div>
        <div className="stat-sub">{stats.monthCount} transactions</div>
      </div>

      <div className="glass-card stat-card" id="stat-total">
        <div className="stat-label">Total Tracked</div>
        <div className="stat-value orange">{formatCurrency(stats.totalSpent)}</div>
        <div className="stat-sub">{stats.totalCount} transactions</div>
      </div>

      <div className="glass-card stat-card" id="stat-apps">
        <div className="stat-label">Active UPI Apps</div>
        <div className="stat-value pink">{stats.appBreakdown?.length || 0}</div>
        <div className="stat-sub">connected apps</div>
      </div>
    </div>
  );
}

export default StatsCards;
