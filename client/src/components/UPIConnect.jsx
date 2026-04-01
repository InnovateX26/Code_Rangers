import React, { useState } from 'react';

function UPIConnect({ onConnect }) {
  const [isOpen, setIsOpen] = useState(false);

  const mockConnect = () => {
    onConnect();
    setIsOpen(false);
  };

  return (
    <>
      <button className="upi-filter-btn" onClick={() => setIsOpen(true)}>
        ➕ Connect App
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="glass-card modal-content" onClick={e => e.stopPropagation()}>
             <div className="modal-header">
                <h3>Connect a UPI App</h3>
                <button onClick={() => setIsOpen(false)} className="close-btn">×</button>
             </div>
             <p className="modal-desc">Select an app to authorize real-time transaction syncing.</p>

             <div className="app-connect-list">
               {['Google Pay', 'PhonePe', 'Paytm', 'Amazon Pay', 'BHIM'].map(app => (
                  <div key={app} className="app-connect-item" onClick={mockConnect}>
                     <div className="app-name">{app}</div>
                     <button className="btn-connect">Connect</button>
                  </div>
               ))}
             </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UPIConnect;
