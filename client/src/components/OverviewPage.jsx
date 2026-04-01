import React from 'react';
import StatsCards from './StatsCards';
import SpendingTrend from './SpendingTrend';
import CategoryChart from './CategoryChart';
import TransactionFeed from './TransactionFeed';
import BankBalances from './BankBalances';
import BudgetTracker from './BudgetTracker';
import FinancialHealthWidget from './FinancialHealthWidget';
import AIRecommendations from './AIRecommendations';
import UpcomingBills from './UpcomingBills';
import LiquiditySplit from './LiquiditySplit';

function OverviewPage({ stats, transactions, newTxnIds }) {
  return (
    <div className="centered-page">
      <div className="page-header center-align">
        <h2>Dashboard Overview</h2>
        <p>A centered, high-level view of your financial ecosystem.</p>
      </div>

      {/* TOP: Summary Cards */}
      <div className="dashboard-section section-top stagger-fade-in stagger-1">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <BankBalances accounts={stats?.bankAccounts} />
          <LiquiditySplit accounts={stats?.bankAccounts} />
        </div>
        <StatsCards stats={stats} />
      </div>

      {/* AI INSIGHTS LAYER */}
      <div style={{ marginBottom: '30px' }}>
         <AIRecommendations stats={stats} />
      </div>

      {/* MIDDLE: Charts & Analytics Grid */}
      <div className="dashboard-section section-middle stagger-fade-in stagger-3">
         <h3 className="section-title">Analytics & Trends</h3>
         <div className="charts-grid-2col">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <FinancialHealthWidget forecasting={stats?.forecasting} />
               <UpcomingBills />
            </div>
            <div className="chart-box">
               <CategoryChart stats={stats} />
               <BudgetTracker budgets={stats?.budgets} />
            </div>
            <div className="chart-box">
               <SpendingTrend stats={stats} />
            </div>
         </div>
      </div>

      {/* BOTTOM: Transaction Feed */}
      <div className="dashboard-section section-bottom stagger-fade-in stagger-4">
         <h3 className="section-title">Live Transactions</h3>
         {/* We limit transactions shown on the overview page so it doesn't stretch forever */}
         <TransactionFeed 
            transactions={transactions.slice(0, 15)} 
            newTxnIds={newTxnIds} 
         />
         <div className="view-all-link">
            <span>View all transactions in the Transactions tab ↗</span>
         </div>
      </div>
    </div>
  );
}

export default OverviewPage;
