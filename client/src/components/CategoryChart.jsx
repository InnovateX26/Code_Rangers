import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function CategoryChart({ stats }) {
  if (!stats || !stats.categoryBreakdown || stats.categoryBreakdown.length === 0) {
    return (
      <div className="glass-card chart-card" id="category-chart">
        <div className="chart-title">📊 Category Breakdown</div>
        <div className="empty-state">
          <p className="empty-state-text">No data yet</p>
        </div>
      </div>
    );
  }

  const data = stats.categoryBreakdown.map(cat => ({
    name: `${cat.icon} ${cat.category}`,
    value: cat.total,
    color: cat.color,
    icon: cat.icon,
    category: cat.category,
    count: cat.count
  }));

  const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(17,17,40,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '13px',
          color: '#fff'
        }}>
          <div style={{ fontWeight: 700 }}>{item.icon} {item.category}</div>
          <div style={{ color: item.color, fontWeight: 600, marginTop: 4 }}>
            {formatCurrency(item.value)}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
            {item.count} transactions
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card chart-card" id="category-chart">
      <div className="chart-title">📊 Category Breakdown</div>
      
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="category-list">
        {data.slice(0, 6).map((cat, i) => (
          <div key={i} className="category-item">
            <span className="category-dot" style={{ background: cat.color }}></span>
            <span className="category-name">{cat.icon} {cat.category}</span>
            <span className="category-amount">{formatCurrency(cat.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryChart;
