import React from 'react';

function FinancialHealthWidget({ forecasting }) {
  if (!forecasting) return null;

  const { healthScore, burnRate, forecastedBalance, totalMonthlyLimit, remainingGlobalBudget } = forecasting;
  
  // Health Colors
  let healthColor = healthScore > 80 ? 'var(--accent-green)' : healthScore > 50 ? '#f59e0b' : 'var(--accent-red)';
  let healthLabel = healthScore > 80 ? 'Excellent' : healthScore > 50 ? 'Fair' : 'Needs Attention';

  const formatAmount = val => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="glass-card chart-box" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', background: `conic-gradient(${healthColor} ${healthScore}%, rgba(255,255,255,0.05) 0)` }}>
          <div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', bottom: '8px', background: 'var(--bg-card)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800' }}>
            {healthScore}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Financial Health</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: healthColor }}>{healthLabel}</div>
        </div>
      </div>

      <div style={{ flex: 1, margin: '0 40px', padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
         <div style={{ fontSize: '13px', color: 'var(--accent-blue)', fontWeight: '600', marginBottom: '4px' }}>AI Monthly Advisory</div>
         <div style={{ fontSize: '15px' }}>
            You can safely spend <span style={{ fontWeight: '800', color: 'white' }}>{formatAmount(remainingGlobalBudget)}</span> more this month across your {formatAmount(totalMonthlyLimit)} budgeted categories.
         </div>
      </div>

      <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Daily Burn Rate</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatAmount(burnRate)}</div>
        </div>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>EOM Forecast</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatAmount(forecastedBalance)}</div>
        </div>
      </div>

    </div>
  );
}

export default FinancialHealthWidget;
