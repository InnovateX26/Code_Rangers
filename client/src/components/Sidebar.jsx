import React from 'react';

const MENU_ITEMS = [
  { id: 'overview', icon: '📊', label: 'Overview' },
  { id: 'transactions', icon: '💸', label: 'Transactions' },
  { id: 'categories', icon: '📂', label: 'Categories' },
  { id: 'ai', icon: '🤖', label: 'AI Assistant' },
  { id: 'profile', icon: '👤', label: 'Profile' }
];

function Sidebar({ activeTab, onTabChange, onLogout, user }) {
  return (
    <div className="sidebar-nav">
      <div className="sidebar-header">
        <div className="logo sidebar-logo">💳</div>
        <div className="sidebar-title">PayFlow</div>
      </div>

      <nav className="sidebar-menu">
        {MENU_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-phone">{user.phone}</div>
          </div>
        </div>
        <button className="logout-btn sidebar-logout" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
