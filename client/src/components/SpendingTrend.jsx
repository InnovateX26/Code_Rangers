import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function SpendingTrend({ stats }) {
  if (!stats || !stats.dailySpending || stats.dailySpending.length === 0) {
    return (
      <div className="glass-card chart-card" id="spending-trend">
        <div className="chart-title">📈 7-Day Spending</div>
        <div className="empty-state">
          <p className="empty-state-text">No data yet</p>
        </div>
      </div>
    );
  }

  const data = stats.dailySpending;

  const formatCurrency = (val) => {
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(17,17,40,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '13px',
          color: '#fff'
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
          <div style={{ color: '#6366f1', fontWeight: 700 }}>
            ₹{payload[0].value.toLocaleString('en-IN')}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card chart-card" id="spending-trend">
      <div className="chart-title">📈 7-Day Spending</div>

      <div className="spending-chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="total"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SpendingTrend;
