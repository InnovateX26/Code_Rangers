import React, { useState } from 'react';
import TransactionFeed from './TransactionFeed';
import UPIAppFilter from './UPIAppFilter';
import UPIConnect from './UPIConnect';

function TransactionsPage({ transactions, newTxnIds }) {
  const [selectedApp, setSelectedApp] = useState('all');

  const filteredTransactions = selectedApp === 'all'
    ? transactions
    : transactions.filter(t => t.upiApp.code === selectedApp);

  return (
    <div className="glass-card page-card">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2>💸 All Transactions</h2>
          <p>Live stream of every payment tracked by PayFlow</p>
        </div>
        <UPIConnect onConnect={() => alert('App connection simulated!')} />
      </div>

      <div style={{ marginBottom: '20px' }}>
         <UPIAppFilter selected={selectedApp} onSelect={setSelectedApp} />
      </div>

      <div className="transactions-list-container full-height-scroll">
         <TransactionFeed transactions={filteredTransactions} newTxnIds={newTxnIds} />
      </div>
    </div>
  );
}

export default TransactionsPage;
