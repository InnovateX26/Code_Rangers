import React from 'react';

function BankBalances({ accounts }) {
  if (!accounts || accounts.length === 0) return null;

  return (
    <div className="bank-balances-container">
      {accounts.map(acc => {
        const isCash = acc.id === 'cash';
        return (
          <div key={acc.id} className="glass-card bank-card" style={{ borderTop: `4px solid ${acc.color}`, background: isCash ? 'rgba(16, 185, 129, 0.05)' : undefined }}>
            <div className="bank-header">
              <span className="bank-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isCash ? '💵' : '🏦'} {acc.name}
              </span>
              {!isCash && <span className="bank-number">{acc.number}</span>}
            </div>
            <div className="bank-balance" style={{ color: isCash ? 'var(--accent-green)' : 'white' }}>
              ₹{acc.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <div className="bank-status" style={{ color: isCash ? 'var(--text-secondary)' : 'var(--accent-green)', fontSize: '12px' }}>
              {isCash ? 'Offline Wallet' : 'Live Updates • Protected'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BankBalances;
