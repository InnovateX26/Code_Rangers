import React from 'react';

function LiquiditySplit({ accounts }) {
  if (!accounts || accounts.length === 0) return null;

  let totalDigital = 0;
  let totalCash = 0;

  accounts.forEach(acc => {
    if (acc.id === 'cash') {
      totalCash += acc.balance;
    } else {
      totalDigital += acc.balance;
    }
  });

  const total = totalDigital + totalCash;
  if (total === 0) return null;

  const digitalPct = (totalDigital / total) * 100;
  const cashPct = (totalCash / total) * 100;

  return (
    <div className="glass-card stat-card" style={{ padding: '16px', gridColumn: 'span 2' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Liquidity Split</div>
        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>Total: ₹{total.toLocaleString('en-IN')}</div>
      </div>
      
      <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: `${digitalPct}%`, height: '100%', background: 'var(--accent-blue)', transition: 'width 0.5s ease' }} title={`Digital: ₹${totalDigital.toLocaleString()}`}></div>
        <div style={{ width: `${cashPct}%`, height: '100%', background: 'var(--accent-green)', transition: 'width 0.5s ease' }} title={`Cash: ₹${totalCash.toLocaleString()}`}></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)' }}></div>
          Digital: <span style={{ color: 'white', fontWeight: 'bold' }}>₹{totalDigital.toLocaleString('en-IN')}</span> ({digitalPct.toFixed(1)}%)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}></div>
          Cash: <span style={{ color: 'white', fontWeight: 'bold' }}>₹{totalCash.toLocaleString('en-IN')}</span> ({cashPct.toFixed(1)}%)
        </div>
      </div>
    </div>
  );
}

export default LiquiditySplit;
