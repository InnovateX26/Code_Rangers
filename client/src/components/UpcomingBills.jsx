import React from 'react';

function UpcomingBills() {
  const bills = [
    { id: 1, name: 'House Rent', amount: 15000, date: '5th Apr', icon: '🏠', status: 'Pending' },
    { id: 2, name: 'Netflix Premium', amount: 649, date: '12th Apr', icon: '🎬', status: 'Upcoming' },
    { id: 3, name: 'Electricity Board', amount: 1250, date: '15th Apr', icon: '⚡', status: 'Upcoming' },
    { id: 4, name: 'Spotify Duo', amount: 149, date: '18th Apr', icon: '🎵', status: 'Upcoming' }
  ];

  const totalDeductions = bills.reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="glass-card" style={{ padding: '24px', flex: 1, borderTop: '4px solid var(--accent-orange)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>🗓️ Upcoming Deductions</h3>
        <span style={{ fontSize: '13px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-orange)', padding: '4px 10px', borderRadius: '100px' }}>
          ₹{totalDeductions.toLocaleString('en-IN')} locked
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
         {bills.map(bill => (
           <div key={bill.id} className="hover-lift" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ width: '36px', height: '36px', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                 {bill.icon}
               </div>
               <div>
                 <div style={{ fontSize: '14px', fontWeight: '500' }}>{bill.name}</div>
                 <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Due {bill.date}</div>
               </div>
             </div>
             <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>₹{bill.amount.toLocaleString('en-IN')}</div>
               <div style={{ fontSize: '11px', color: bill.status === 'Pending' ? 'var(--accent-orange)' : 'var(--text-muted)' }}>{bill.status}</div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
}

// Export the internal total explicitly so siblings can use it
export const GET_UPCOMING_BILLS_TOTAL = () => 17048; 

export default UpcomingBills;
