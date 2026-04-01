import React, { useState } from 'react';

function BudgetTracker({ budgets }) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [newLimit, setNewLimit] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', limit: '', icon: '📦' });

  if (!budgets) return null;

  const handleEdit = (category, currentLimit) => {
    setEditingCategory(category);
    setNewLimit(currentLimit);
  };

  const handleSave = async (category) => {
    try {
      const response = await fetch('http://localhost:3001/api/budgets/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, limit: parseFloat(newLimit) })
      });
      if (response.ok) {
        setEditingCategory(null);
      }
    } catch (err) {
      console.error('Failed to update budget:', err);
    }
  };

  const handleAddCategory = async () => {
    if (!newCat.name || !newCat.limit) return;
    try {
       const response = await fetch('http://localhost:3001/api/budgets/add', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ category: newCat.name, limit: parseFloat(newCat.limit), icon: newCat.icon })
       });
       if (response.ok) {
         setIsAdding(false);
         setNewCat({ name: '', limit: '', icon: '📦' });
       }
    } catch (err) {}
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Delete ${category} budget?`)) return;
    try {
      await fetch(`http://localhost:3001/api/budgets/${encodeURIComponent(category)}`, { method: 'DELETE' });
    } catch (err) {}
  };

  return (
    <div className="glass-card chart-box">
      <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>🎯 Smart Budget Tracker</span>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          style={{ 
            fontSize: '10px', background: 'var(--accent-purple)', color: 'white', 
            border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' 
          }}
        >
          {isAdding ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {isAdding && (
         <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--accent-purple)' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input 
                  placeholder="Category Name" 
                  value={newCat.name} 
                  onChange={e => setNewCat({...newCat, name: e.target.value})}
                  style={{ flex: 2, background: 'rgba(0,0,0,0.2)', border: '1px solid #333', color: 'white', padding: '4px', borderRadius: '4px', fontSize: '12px' }}
                />
                <input 
                  type="number" 
                  placeholder="Limit" 
                  value={newCat.limit} 
                  onChange={e => setNewCat({...newCat, limit: e.target.value})}
                  style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid #333', color: 'white', padding: '4px', borderRadius: '4px', fontSize: '12px' }}
                />
            </div>
            <button 
              onClick={handleAddCategory}
              style={{ width: '100%', background: 'var(--accent-blue)', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}
            >
              Create Budget
            </button>
         </div>
      )}

      <div className="budget-grid">
        {Object.entries(budgets).map(([category, data]) => {
          const percent = Math.min((data.spent / data.limit) * 100, 100);
          let rawColor = percent > 90 ? '239, 68, 68' : percent > 75 ? '245, 158, 11' : '16, 185, 129';
          const isEditing = editingCategory === category;
          
          return (
            <div key={category} className="budget-item" style={{ padding: '8px 0', position: 'relative' }}>
              <div className="budget-header">
                <span className="budget-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{data.icon || '📦'}</span>
                  {category}
                </span>
                <span className="budget-amounts">
                  ₹{data.spent.toLocaleString('en-IN')} / 
                  {isEditing ? (
                    <span style={{ display: 'inline-flex', gap: '4px', marginLeft: '4px' }}>
                      <input 
                        type="number" 
                        value={newLimit} 
                        onChange={(e) => setNewLimit(e.target.value)}
                        onBlur={() => handleSave(category)}
                        autoFocus
                        style={{ 
                          width: '60px', background: 'rgba(255,255,255,0.1)', 
                          border: '1px solid var(--accent-blue)', color: 'white',
                          borderRadius: '4px', padding: '2px 4px', fontSize: '12px'
                        }}
                      />
                    </span>
                  ) : (
                    <span 
                      onClick={() => handleEdit(category, data.limit)}
                      style={{ cursor: 'pointer', marginLeft: '4px', borderBottom: '1px dashed var(--text-muted)' }}
                      title="Click to edit limit"
                    >
                      ₹{data.limit.toLocaleString('en-IN')}
                    </span>
                  )}
                  <button 
                    onClick={() => handleDeleteCategory(category)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', marginLeft: '8px', cursor: 'pointer', fontSize: '12px', opacity: 0.5 }}
                  >
                    🗑️
                  </button>
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${percent}%`,
                    background: `rgb(${rawColor})`,
                    boxShadow: `0 0 10px rgba(${rawColor}, 0.5)`
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BudgetTracker;
