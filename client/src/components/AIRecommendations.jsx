import React from 'react';
import { GET_UPCOMING_BILLS_TOTAL } from './UpcomingBills';

function AIRecommendations({ stats }) {
  if (!stats?.budgets) return null;

  const insights = [];
  const budgets = stats.budgets;

  // 1. Check for high burn rate
  Object.keys(budgets).forEach(cat => {
    const b = budgets[cat];
    if (b.spent > 0 && b.spent / b.limit > 0.7) {
      const remaining = b.limit - b.spent;
      if (remaining > 0) {
        insights.push({
          icon: '📉',
          title: `High ${cat} Spending detected.`,
          desc: `You only have ₹${remaining.toLocaleString('en-IN')} left. Try cooking at home to save ₹${Math.floor(remaining * 0.4).toLocaleString('en-IN')} this week.`
        });
      } else {
        insights.push({
          icon: '🚨',
          title: `${cat} Budget Exceeded!`,
          desc: `You have overspent by ₹${Math.abs(remaining).toLocaleString('en-IN')}. AI recommends locking non-essential transactions immediately.`
        });
      }
    }
  });

  // 2. Safe spending buffers
  let totalLimit = 0;
  let totalSpent = 0;
  Object.values(budgets).forEach(b => {
    totalLimit += b.limit;
    totalSpent += b.spent;
  });

  if (totalLimit > 0) {
    const upcomingDeductions = GET_UPCOMING_BILLS_TOTAL();
    const globalRem = totalLimit - totalSpent;
    const safeBuffer = globalRem - upcomingDeductions;
    
    if (safeBuffer > 2000) {
      insights.push({
        icon: '🛡️',
        title: 'Safe-to-Spend Balance',
        desc: `After ₹${upcomingDeductions.toLocaleString('en-IN')} in upcoming bills, you have a safe buffer of ₹${safeBuffer.toLocaleString('en-IN')}. AI suggests sweeping 20% into investments.`
      });
    } else if (safeBuffer <= 0) {
      insights.push({
        icon: '⚠️',
        title: 'Low Safe Balance!',
        desc: `Upcoming bills (₹${upcomingDeductions.toLocaleString('en-IN')}) exceed your remaining budget buffer. Pause non-essential spending!`
      });
    }
  }

  // 3. Fallback insights
  if (insights.length < 3) {
    insights.push({
      icon: '✨',
      title: 'Automated Savings Mode',
      desc: 'Connect your primary UPI app, and PayFlow will automatically sweep rounded-up change into investments.'
    });
  }

  // Keep top 3 insights
  const finalInsights = insights.slice(0, 3);

  return (
    <div className="glass-card stagger-fade-in stagger-2" style={{ padding: '24px', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--accent-purple)', background: 'var(--gradient-card)' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 60%)', filter: 'blur(30px)' }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>AI Wealth Advisory</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {finalInsights.map((insight, idx) => (
             <div key={idx} className="hover-lift" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '24px', background: 'var(--bg-primary)', padding: '8px', borderRadius: '8px' }}>{insight.icon}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>{insight.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{insight.desc}</div>
                  </div>
                </div>
             </div>
          ))}
        </div>
    </div>
  );
}

export default AIRecommendations;
