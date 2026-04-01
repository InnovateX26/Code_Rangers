import React from 'react';

const UPI_APPS = [
  { code: 'all', name: 'All Apps', icon: '📱' },
  { code: 'gpay', name: 'Google Pay', icon: '🔵' },
  { code: 'phonepe', name: 'PhonePe', icon: '🟣' },
  { code: 'paytm', name: 'Paytm', icon: '🔷' },
  { code: 'bhim', name: 'BHIM', icon: '🟢' },
  { code: 'cash', name: 'Cash', icon: '💵' },
  { code: 'amazonpay', name: 'Amazon Pay', icon: '🟠' }
];

function UPIAppFilter({ selected, onSelect }) {
  return (
    <div className="upi-filter" id="upi-filter">
      {UPI_APPS.map(app => (
        <button
          key={app.code}
          className={`upi-filter-btn ${selected === app.code ? 'active' : ''}`}
          onClick={() => onSelect(app.code)}
          id={`filter-${app.code}`}
        >
          <span>{app.icon}</span>
          {app.name}
        </button>
      ))}
    </div>
  );
}

export default UPIAppFilter;
