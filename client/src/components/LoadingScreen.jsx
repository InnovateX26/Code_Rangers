import React, { useState, useEffect } from 'react';

const seq = [
  "🔒 Establishing Secure 256-bit TLS connection...",
  "📡 Syncing Google Pay & PhonePe Ledgers...",
  "🤖 AI Parsing 40+ raw SMS transactions...",
  "🛡️ Running Fraud Anomaly Detection...",
  "✨ Building Personalized Fintech Dashboard..."
];

function LoadingScreen() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev < seq.length - 1 ? prev + 1 : prev));
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="layout-wrapper full-screen-scroll fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      
      <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '48px' }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', border: '4px solid rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', width: '100%', height: '100%', border: '4px solid var(--accent-blue)', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1.5s linear infinite' }}></div>
        <div style={{ fontSize: '40px', animation: 'pulse 2s infinite' }}>🤖</div>
      </div>
      
      <div style={{ width: '400px', maxWidth: '90vw', background: 'rgba(10, 10, 26, 0.8)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '16px', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
         <h2 style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>System Boot Sequence</h2>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {seq.map((text, i) => (
              <div 
                key={i} 
                style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '13px', 
                  color: i === step ? 'var(--accent-green)' : i < step ? 'var(--text-secondary)' : 'transparent',
                  opacity: i === step ? 1 : i < step ? 0.4 : 0,
                  transform: i <= step ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'all 0.3s ease'
                }}
              >
                 {i < step ? '✓ ' : i === step ? '> ' : ''}{text}
              </div>
            ))}
         </div>
      </div>

    </div>
  );
}

export default LoadingScreen;
