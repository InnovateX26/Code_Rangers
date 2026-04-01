import React, { useState } from 'react';

const MENU_ITEMS = [
  { id: 'overview', icon: '📊', label: 'Overview' },
  { id: 'transactions', icon: '💸', label: 'Transactions' },
  { id: 'categories', icon: '📂', label: 'Categories' },
  { id: 'ai', icon: '🤖', label: 'AI Assistant' }
];

function TopNav({ activeTab, onTabChange, onLogout, user, unreadCount, onToggleNotifications, onAddExpense }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="topnav">
      <div className="topnav-container">
        {/* Logo Section */}
        <div className="topnav-brand">
          <div className="logo topnav-logo">💳</div>
          <div className="topnav-title">PayFlow</div>
        </div>

        {/* Centered Navigation */}
        <nav className="topnav-menu">
          {MENU_ITEMS.map(item => (
            <button
              key={item.id}
              className={`topnav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <span className="topnav-icon">{item.icon}</span>
              <span className="topnav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Profile & Actions */}
        <div className="topnav-actions" style={{ position: 'relative' }}>
           <button 
             onClick={onAddExpense} 
             className="btn-primary hover-lift" 
             style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px' }}
           >
             <span style={{ fontSize: '16px' }}>+</span> Add
           </button>

           <button className="notification-bell-btn hover-lift" onClick={onToggleNotifications} style={{ marginLeft: '8px' }}>
             <span style={{ fontSize: '20px' }}>🔔</span>
             {unreadCount > 0 && <span className="notification-badge-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
           </button>
           
           <div 
             className="topnav-profile-badge" 
             style={{ cursor: 'pointer', transition: 'background 0.2s', background: isProfileOpen ? 'rgba(255,255,255,0.08)' : undefined }}
             onClick={() => setIsProfileOpen(!isProfileOpen)}
           >
             <div className="user-avatar-small">{user?.name ? user.name.charAt(0).toUpperCase() : '?'}</div>
             <span className="topnav-username">{user?.name?.split(' ')[0]}</span>
             <span style={{ fontSize: '10px', marginLeft: '4px' }}>▼</span>
           </div>

           {isProfileOpen && (
             <div className="profile-dropdown glass-card">
                <div style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{ fontWeight: '600' }}>{user?.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{user?.phone}</div>
                </div>
                <div style={{ padding: '8px' }}>
                  <button className="dropdown-item" onClick={() => { setIsProfileOpen(false); onTabChange('profile'); }}>
                    👤 Profile & Settings
                  </button>
                  <button className="dropdown-item text-red" onClick={onLogout} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px', paddingTop: '8px' }}>
                    🚪 Log Out
                  </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </header>
  );
}

export default TopNav;
