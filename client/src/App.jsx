import React, { useState, useEffect, useRef, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import TopNav from './components/TopNav';
import OverviewPage from './components/OverviewPage';
import TransactionsPage from './components/TransactionsPage';
import CategoriesPage from './components/CategoriesPage';
import AIAssistant from './components/AIAssistant';
import NotificationPanel from './components/NotificationPanel';
import LoadingScreen from './components/LoadingScreen';
import AddTransactionModal from './components/AddTransactionModal';
import ProfilePage from './components/ProfilePage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('payflow_token'));
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [connected, setConnected] = useState(false);
  const [newTxnIds, setNewTxnIds] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const notificationHistory = useRef(new Map());

  const addNotification = useCallback((message, type = 'info') => {
    // Check if push notifications are enabled
    const pref = JSON.parse(localStorage.getItem('payflow_prefs') || '{}');
    if (pref.pushEnabled === false) return; // Mute notifications

    const now = Date.now();
    
    setNotifications(prev => {
      // Find similar recent notification to group
      const existingIdx = prev.findIndex(n => n.message === message);
      if (existingIdx !== -1) {
        const existing = prev[existingIdx];
        if (now - existing.timestamp < 300000) { // Group within 5 minutes
          const updatedList = [...prev];
          updatedList[existingIdx] = { ...existing, count: (existing.count || 1) + 1, timestamp: now };
          setUnreadCount(u => u + 1);
          return updatedList.sort((a,b) => b.timestamp - a.timestamp); // keep newest at top
        }
      }

      // Throttle completely exact matches within 5 seconds to prevent strict dupes
      if (existingIdx !== -1 && now - prev[existingIdx].timestamp < 5000) {
        return prev; 
      }

      const newNotif = { id: Math.random(), message, type, timestamp: now, count: 1 };
      setUnreadCount(u => u + 1);
      const updated = [newNotif, ...prev];
      return updated.slice(0, 50); // Keep max 50
    });
  }, []);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:3001/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setUser(data.user);
          setIsSimulating(true);
          setTimeout(() => setIsSimulating(false), 3800);
        } else {
          handleLogout();
        }
      })
      .catch(() => handleLogout());
    }
  }, [token]);

  const handleLogin = (user, token) => {
    localStorage.setItem('payflow_token', token);
    setToken(token);
    setUser(user);
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 3800);
  };

  const handleLogout = () => {
    localStorage.removeItem('payflow_token');
    setToken(null);
    setUser(null);
    if (wsRef.current) wsRef.current.close();
  };

  const connectWebSocket = useCallback(() => {
    if (!token) return;

    const wsUrl = `ws://${window.location.hostname}:3001`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'init') {
            const initialStats = msg.data.stats;
            setStats(initialStats);
            setTransactions(initialStats.recentTransactions || []);
          }

          if (msg.type === 'new_transaction') {
            const newTxn = msg.data.transaction;

            setTransactions(prev => {
              // Deduplicate if WebSocket connection happens twice due to StrictMode
              if (prev.some(t => t.id === newTxn.id)) return prev;
              const updated = [newTxn, ...prev];
              return updated.slice(0, 500);
            });

            setStats(msg.data.stats);

            setNewTxnIds(prev => {
              const next = new Set(prev);
              next.add(newTxn.id);
              return next;
            });

            setTimeout(() => {
              setNewTxnIds(prev => {
                const next = new Set(prev);
                next.delete(newTxn.id);
                return next;
              });
            }, 2000);
          }

          if (msg.type === 'smart_insight') {
            addNotification(msg.message, 'warning');
          }

          if (msg.type === 'fraud_alert') {
            addNotification(`⚠️ Fraud Alert: Suspicious transaction of ₹${msg.data.transaction.amount} at ${msg.data.transaction.merchant}`, 'error');
          }
          if (msg.type === 'budget_update') {
            setStats(prev => ({ ...prev, budgets: msg.budgets }));
          }
        } catch (err) {}
      };

      ws.onclose = () => {
        setConnected(false);
        if (token) reconnectTimer.current = setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => ws.close();
    } catch (err) {
      if (token) reconnectTimer.current = setTimeout(connectWebSocket, 3000);
    }
  }, [token]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connectWebSocket]);

  if (!token || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (isSimulating || !token || !user || !stats || !stats.forecasting) {
    return <LoadingScreen />;
  }

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'overview': 
        return <OverviewPage stats={stats} transactions={transactions} newTxnIds={newTxnIds} />;
      case 'transactions': 
        return <TransactionsPage transactions={transactions} newTxnIds={newTxnIds} />;
      case 'categories': 
        return <CategoriesPage stats={stats} transactions={transactions} />;
      case 'ai': 
        return <AIAssistant stats={stats} />;
      case 'profile': 
        return <ProfilePage user={user} />;
      default: 
        return <OverviewPage stats={stats} transactions={transactions} newTxnIds={newTxnIds} />;
    }
  };

  return (
    <div className="layout-wrapper full-screen-scroll">
      <TopNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout} 
        user={user} 
        unreadCount={unreadCount}
        onToggleNotifications={() => setIsPanelOpen(!isPanelOpen)}
        onAddExpense={() => setIsAddModalOpen(true)}
      />

      {isPanelOpen && <NotificationPanel 
        notifications={notifications} 
        onClose={() => setIsPanelOpen(false)} 
        onClearAll={() => { setNotifications([]); setUnreadCount(0); }}
        onMarkRead={() => setUnreadCount(0)}
      />}

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      <main className="main-centered-container">
        {renderActiveTab()}
      </main>

      <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? '🟢 Live Connected' : '🔴 Reconnecting...'}
      </div>
    </div>
  );
}

export default App;
