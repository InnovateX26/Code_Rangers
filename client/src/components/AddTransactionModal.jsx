import React, { useState, useEffect } from 'react';

const UPI_APPS = [
  { code: 'gpay', name: 'Google Pay', icon: 'G' },
  { code: 'phonepe', name: 'PhonePe', icon: 'पे' },
  { code: 'paytm', name: 'Paytm', icon: 'P' },
  { code: 'bhim', name: 'BHIM UPI', icon: 'B' },
  { code: 'cash', name: 'Physical Cash', icon: '💵' } // Adding cash internally
];

function AddTransactionModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    source: 'cash', // Default to cash for manual
    category: ''
  });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:3001/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.merchant) return;

    setIsSubmitting(true);
    try {
      await fetch('http://localhost:3001/api/manual/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'debit' // Defaults to expense
        })
      });
      setFormData({ amount: '', merchant: '', source: 'cash', category: '' });
      onClose();
    } catch (err) {
      console.error('Failed to submit manual transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="notification-backdrop" onClick={onClose} style={{ zIndex: 9999 }}></div>
      <div className="glass-card slide-up" style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '400px', maxWidth: '90vw', padding: '30px', zIndex: 10000,
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>✍️ Add Expense</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Amount (₹)</label>
            <input 
              type="number" 
              className="text-input" 
              placeholder="0.00"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Merchant / Note</label>
            <input 
              type="text" 
              className="text-input" 
              placeholder="e.g. Rickshaw, Local Shop..."
              value={formData.merchant}
              onChange={e => setFormData({...formData, merchant: e.target.value})}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Source</label>
              <select 
                className="text-input" 
                value={formData.source}
                onChange={e => setFormData({...formData, source: e.target.value})}
                style={{ background: 'var(--bg-secondary)', color: 'white', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px' }}
              >
                {UPI_APPS.map(app => (
                  <option key={app.code} value={app.code}>{app.icon} {app.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Category</label>
              <select 
                className="text-input" 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                style={{ background: 'var(--bg-secondary)', color: 'white', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px' }}
              >
                <option value="">Auto-Detect</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat.name}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary hover-lift" disabled={isSubmitting} style={{ marginTop: '16px', borderRadius: '8px', padding: '14px' }}>
            {isSubmitting ? 'Saving...' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </>
  );
}

export default AddTransactionModal;
