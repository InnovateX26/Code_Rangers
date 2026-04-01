import React, { useState, useEffect } from 'react';

function ProfilePage({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [linkedApps, setLinkedApps] = useState({
    'Google Pay': true,
    'PhonePe': true,
    'Paytm': false,
    'Amazon Pay': true,
    'BHIM': false
  });
  const [prefs, setPrefs] = useState({
    pushEnabled: true,
    realtimeSync: true,
    weeklyDigest: true
  });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', phone: user.phone || '' });
    }
    const savedPrefs = localStorage.getItem('payflow_prefs');
    if (savedPrefs) setPrefs(JSON.parse(savedPrefs));
  }, [user]);

  if (!user) return null;

  const handleSave = () => {
    setIsEditing(false);
    // Persist mock edits to localStorage for the session
    const updatedUser = { ...user, name: formData.name, phone: formData.phone };
    localStorage.setItem('cached_user', JSON.stringify(updatedUser));
    localStorage.setItem('payflow_prefs', JSON.stringify(prefs));
    // In a real app we'd dispatch context or lift state. App.jsx reads from localStorage on load.
    // For this prototype, force reload to reflect name change in TopNav globally:
    window.location.reload(); 
  };

  const toggleApp = (app) => {
    if (!isEditing) return;
    setLinkedApps(prev => ({ ...prev, [app]: !prev[app] }));
  };

  const togglePref = (key) => {
    if (!isEditing) return;
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="centered-page fade-in">
      <div className="page-header center-align" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>👤 User Profile</h2>
          <p>Manage your account, settings, and linked UPI apps</p>
        </div>
        {isEditing ? (
          <div style={{display:'flex', gap:'12px'}}>
             <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
             <button className="btn-primary" onClick={handleSave}>Save Changes</button>
          </div>
        ) : (
          <button className="btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
        )}
      </div>

      <div className="profile-container">
        <div className="glass-card profile-card" style={{ transition: 'all 0.3s ease', transform: isEditing ? 'translateY(-5px)' : 'none', boxShadow: isEditing ? '0 12px 30px rgba(99,102,241,0.2)' : 'var(--glass-shadow)' }}>
           <div className="profile-avatar-large">
             {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
           </div>
           
           {isEditing ? (
             <div style={{ width: '100%', maxWidth: '300px', margin: '0 auto', textAlign: 'left' }}>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Full Name</label>
               <input 
                 className="text-input" 
                 value={formData.name} 
                 onChange={e => setFormData({ ...formData, name: e.target.value })} 
                 style={{ marginBottom: '16px' }} 
               />
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Phone Number</label>
               <input 
                 className="text-input" 
                 value={formData.phone} 
                 onChange={e => setFormData({ ...formData, phone: e.target.value })} 
               />
             </div>
           ) : (
             <>
               <h3 className="profile-name">{formData.name}</h3>
               <p className="profile-phone">{formData.phone}</p>
             </>
           )}
           
           <div className="profile-status badge-safe" style={{ marginTop: '24px' }}>
             ✅ Account Verified & Active
           </div>
        </div>

        <div className="glass-card linked-apps-card">
           <h3>Mobile & Linked Apps</h3>
           <p className="detail-subtitle mb-20">{isEditing ? 'Click an app to toggle its connection.' : 'The platforms PayFlow is currently monitoring for you.'}</p>

           <div className="linked-app-list">
              {Object.entries(linkedApps).map(([app, isLinked]) => (
                 <div 
                   key={app} 
                   className="linked-app-item" 
                   onClick={() => toggleApp(app)}
                   style={{ 
                     cursor: isEditing ? 'pointer' : 'default',
                     opacity: isLinked ? 1 : 0.4,
                     border: isEditing ? '1px dashed var(--glass-border)' : '1px solid var(--glass-border)',
                     transition: 'all 0.2s ease'
                   }}
                 >
                    <div className="linked-app-name">
                       <span className="linked-check">{isLinked ? '✅' : '❌'}</span> {app}
                    </div>
                    <span className="linked-status" style={{ color: isLinked ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                      {isLinked ? 'Connected' : 'Disconnected'}
                    </span>
                 </div>
              ))}
           </div>
        </div>

        <div className="glass-card settings-card" style={{ gridColumn: '1 / -1' }}>
           <h3>Preferences & Alerts</h3>
           <div className="settings-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div className="setting-item">
                 <div>
                   <div className="setting-title">Push Notifications & Sounds</div>
                   <div className="setting-desc">Get alerted on high-risk transactions. Uncheck to mute.</div>
                 </div>
                 <div className={`toggle-switch ${prefs.pushEnabled ? 'active' : ''}`} onClick={() => togglePref('pushEnabled')} style={{ cursor: isEditing ? 'pointer' : 'not-allowed', opacity: isEditing ? 1 : 0.6 }}></div>
              </div>

              <div className="setting-item">
                 <div>
                   <div className="setting-title">Real-time Feed Sync</div>
                   <div className="setting-desc">Stream transactions the second they happen.</div>
                 </div>
                 <div className={`toggle-switch ${prefs.realtimeSync ? 'active' : ''}`} onClick={() => togglePref('realtimeSync')} style={{ cursor: isEditing ? 'pointer' : 'not-allowed', opacity: isEditing ? 1 : 0.6 }}></div>
              </div>

              <div className="setting-item">
                 <div>
                   <div className="setting-title">Weekly AI Digest</div>
                   <div className="setting-desc">Let AI send you a weekly breakdown of spending.</div>
                 </div>
                 <div className={`toggle-switch ${prefs.weeklyDigest ? 'active' : ''}`} onClick={() => togglePref('weeklyDigest')} style={{ cursor: isEditing ? 'pointer' : 'not-allowed', opacity: isEditing ? 1 : 0.6 }}></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
