import React, { useState } from 'react';
import CategoryChart from './CategoryChart';
import TransactionFeed from './TransactionFeed';

function CategoriesPage({ stats, transactions }) {
  const [activeCategory, setActiveCategory] = useState(null);

  if (!stats?.categoryBreakdown) return null;

  // Filter transactions exactly to the selected category
  const filteredTxns = transactions?.filter(t => t.category === activeCategory) || [];

  return (
    <div className="glass-card page-card fade-in">
      <div className="page-header">
        <h2>📂 Spends by Category</h2>
        <p>Click any category to actively drill down into your purchases</p>
      </div>

      <div className="categories-grid">
        <div className="category-chart-wrapper">
           <CategoryChart stats={stats} />
        </div>

        <div className="category-details">
          <h3>Category Breakdown</h3>
          <p className="detail-subtitle">Interactive real-time categorization feed</p>
          
          <div className="category-detail-list">
            {stats.categoryBreakdown.map((cat, i) => {
              const isActive = activeCategory === cat.category;
              return (
                <div 
                  key={i} 
                  className={`cat-detail-card hover-lift ${isActive ? 'active' : ''}`} 
                  onClick={() => setActiveCategory(isActive ? null : cat.category)}
                  style={{ 
                    borderLeftColor: cat.color,
                    cursor: 'pointer',
                    background: isActive ? 'rgba(255,255,255,0.06)' : undefined,
                    boxShadow: isActive ? `0 0 20px ${cat.color}30` : undefined,
                    border: isActive ? `1px solid ${cat.color}` : '1px solid var(--glass-border)',
                    borderLeftWidth: isActive ? '4px' : '4px'
                  }}
                >
                  <div className="cat-detail-header">
                    <div className="cat-detail-title">
                       <span className="cat-detail-icon">{cat.icon}</span> 
                       {cat.category}
                    </div>
                    <div className="cat-detail-amount">₹{cat.total.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="cat-detail-meta">{cat.count} transactions automatically categorized</div>
                    <div style={{ fontSize: '10px', color: cat.color, fontWeight: 'bold', opacity: isActive ? 1 : 0.6 }}>{isActive ? 'VIEWING' : 'CLICK TO VIEW'} →</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {activeCategory && (
        <div className="interactive-drilldown slide-up" style={{ marginTop: '40px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px' }}>🧾 {activeCategory} Transactions</h3>
            <button className="btn-secondary" onClick={() => setActiveCategory(null)}>Close View</button>
          </div>
          
          {filteredTxns.length === 0 ? (
            <div className="empty-state center-align" style={{ padding: '40px' }}>
              <span style={{ fontSize: '32px' }}>📭</span>
              <p>No transactions found for {activeCategory}.</p>
            </div>
          ) : (
            <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '8px' }}>
               <TransactionFeed transactions={filteredTxns} newTxnIds={new Set()} />
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default CategoriesPage;
