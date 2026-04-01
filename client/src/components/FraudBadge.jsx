import React from 'react';

function FraudBadge({ fraud }) {
  if (!fraud) return null;

  if (fraud.riskLevel === 'safe') {
     return <span className="fraud-badge safe" title="Verified Safe">✅ Safe</span>;
  }

  return (
    <span className={`fraud-badge ${fraud.riskLevel}`} title={fraud.recommendation}>
       {fraud.riskIcon} {fraud.riskScore} Risk
    </span>
  );
}

export default FraudBadge;
