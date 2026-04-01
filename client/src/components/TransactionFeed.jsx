import React from 'react';
import FraudBadge from './FraudBadge';

function TransactionFeed({ transactions, newTxnIds }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    // Check if it's today
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth();
    
    return isToday ? `Today, ${timeStr}` : `${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${timeStr}`;
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="glass-card feed-card" id="transaction-feed">
        <div className="feed-header">
          <span className="feed-title">💰 Live Transactions</span>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📡</div>
          <p className="empty-state-text">Waiting for transactions...</p>
          <p className="empty-state-text" style={{ marginTop: '4px', fontSize: '12px' }}>
            Simulator will start generating transactions shortly
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card feed-card" id="transaction-feed">
      <div className="feed-header">
        <span className="feed-title">💰 Live Transactions</span>
        <span className="feed-count">{transactions.length} shown</span>
      </div>

      <div className="transaction-list">
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className={`txn-item ${newTxnIds.has(txn.id) ? 'new' : ''}`}
            id={`txn-${txn.id}`}
            style={{ 
               borderColor: txn.fraud && txn.fraud.riskLevel !== 'safe' 
                   ? txn.fraud.riskColor + '40' 
                   : undefined 
            }}
          >
            <div
              className="txn-app-icon"
              style={{ background: `${txn.upiApp.color}20` }}
            >
              {txn.upiApp.icon}
            </div>

            <div className="txn-details">
              <div className="txn-merchant" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 {txn.merchant}
                 <FraudBadge fraud={txn.fraud} />
              </div>
              <div className="txn-meta">
                <span className="txn-app-name">{txn.upiApp.name}</span>
                <span
                  className="txn-category-tag"
                  style={{
                    background: `${txn.categoryColor}20`,
                    color: txn.categoryColor,
                    border: `1px solid ${txn.categoryColor}30`
                  }}
                >
                  {txn.categoryIcon} {txn.category}
                </span>
                <span className="txn-time">{formatTime(txn.timestamp)}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
               <div className="txn-amount" style={{ 
                  color: txn.type === 'credit' ? 'var(--accent-green)' : 'var(--text-primary)',
                  fontWeight: '700', fontSize: '15px'
               }}>
                 {txn.type === 'debit' ? '-' : '+'}₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </div>
               <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                 <span style={{ color: 'var(--accent-green)' }}>●</span> Success
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TransactionFeed;
