import React from 'react';

function NotificationPanel({ notifications, onClose, onClearAll }) {
  return (
    <div className="notification-backdrop" onClick={onClose}>
      <div className="notification-panel glass-card slide-left" onClick={e => e.stopPropagation()}>
        <div className="notification-header">
          <h3>Alerts & Insights</h3>
          <div className="notification-actions">
             {notifications.length > 0 && <button className="clear-btn text-blue" onClick={onClearAll}>Clear All</button>}
             <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>
        
        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="empty-notifications center-align">
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔔</div>
              <p style={{ color: 'var(--text-secondary)' }}>You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const Icon = notif.type === 'error' ? '🚨' : notif.type === 'warning' ? '⚠️' : '💡';
              const colorCode = notif.type === 'error' ? 'var(--accent-red)' : notif.type === 'warning' ? '#f59e0b' : 'var(--accent-blue)';
              
              return (
                <div key={notif.id} className="notification-item" style={{ borderLeft: `3px solid ${colorCode}` }}>
                  <div className="notification-icon">{Icon}</div>
                  <div className="notification-content">
                    <div className="notification-message">
                       {notif.count > 1 && <span className="notification-badge">{notif.count}x</span>}
                       {notif.message}
                    </div>
                    <div className="notification-time">
                       {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationPanel;
