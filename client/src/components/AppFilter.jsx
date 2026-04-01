import React from 'react';

function AppFilter({ breakdown, activeApp, setActiveApp }) {
  if (!breakdown || breakdown.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
      <button 
        className={`hover-lift ${activeApp === null ? 'btn-primary' : ''}`}
        onClick={() => setActiveApp(null)}
        style={{ 
          padding: '8px 16px', 
          borderRadius: '100px', 
          background: activeApp === null ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
          border: '1px solid var(--glass-border)',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          color: 'white'
        }}
      >
        🌟 All Transactions
      </button>

      {breakdown.map((app, i) => (
        <button 
          key={i}
          className={`hover-lift ${activeApp === app.code ? 'btn-primary' : ''}`}
          onClick={() => setActiveApp(activeApp === app.code ? null : app.code)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', 
            borderRadius: '100px', 
            background: activeApp === app.code ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)',
            border: '1px solid var(--glass-border)',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            color: 'white'
          }}
        >
           <span style={{ background: 'white', color: 'black', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
             {app.icon}
           </span>
           {app.name} {/* • ₹{app.total.toLocaleString('en-IN')} */}
        </button>
      ))}
    </div>
  );
}

export default AppFilter;
