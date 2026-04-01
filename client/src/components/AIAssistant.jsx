import React, { useState, useRef, useEffect } from 'react';

function AIAssistant({ stats }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: 'Hi! I am your PayFlow Assistant. Ask me anything about your spending.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState([
    '📊 Predict my savings for this month',
    '🛡️ Run a deep fraud scan',
    '💰 What is my safe-to-spend buffer?',
    '💡 Suggest some investment ideas',
    '💸 How can I reduce my Food expenses?',
    '📅 Show my spending trends'
  ]);
  const recognitionRef = useRef(null);
  const endRef = useRef(null);

  // Generate dynamic suggestions based on data
  useEffect(() => {
    if (!stats) return;
    
    const newSuggestions = [];
    const { monthSpent, totalBalance, budgets } = stats;

    // Condition 1: Low balance
    if (totalBalance < 5000) {
      newSuggestions.push('How can I save money this week?');
    }
    
    // Condition 2: Over budget
    const overBudgetCat = Object.keys(budgets || {}).find(cat => budgets[cat].spent > budgets[cat].limit);
    if (overBudgetCat) {
      newSuggestions.push(`Why am I over budget in ${overBudgetCat}?`);
      newSuggestions.push(`How to reduce ${overBudgetCat} expenses?`);
    }

    // Condition 3: Safe to spend
    if (totalBalance > 10000) {
      newSuggestions.push('What is my safe-to-spend buffer?');
    }

    // Fallbacks
    if (newSuggestions.length < 3) {
      newSuggestions.push('Show my spending trends');
      newSuggestions.push('Predict my next big expense');
    }

    setSuggestions(newSuggestions.slice(0, 4));
  }, [stats]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSend(transcript);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [stats]);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = (userQuery) => {
    if (!userQuery.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userQuery }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateAIResponse(userQuery);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: reply }]);
      
      // Generate follow-up questions
      if (userQuery.toLowerCase().includes('spend') || userQuery.toLowerCase().includes('much')) {
        setSuggestions([
          'How can I reduce these expenses?',
          'What is my highest spending category?',
          'Where can I save more money?'
        ]);
      } else if (userQuery.toLowerCase().includes('budget')) {
        setSuggestions([
          'Show my budget breakdown',
          'Adjust my shopping limit',
          'Which category is safest?'
        ]);
      }
      
      setIsTyping(false);
    }, 1200);
  };

  const generateAIResponse = (query) => {
    const q = query.toLowerCase();
    if (!stats) return "I'm still syncing your data. Please try again in a moment.";

    if (q.includes('cash') || q.includes('wallet') || q.includes('physical')) {
      return `Your Physical Wallet (Cash) balance is ₹${stats.cashBalance?.toLocaleString('en-IN')}. Your digital bank balance is ₹${stats.digitalBalance?.toLocaleString('en-IN')}.`;
    }
    if (q.includes('bank') || q.includes('digital') || q.includes('account')) {
      const bankList = stats.bankAccounts?.filter(b => !b.isCash).map(b => `${b.name}: ₹${b.balance.toLocaleString('en-IN')}`).join(', ');
      return `You have ₹${stats.digitalBalance?.toLocaleString('en-IN')} across your digital accounts. Breakdown: ${bankList}.`;
    }

    if (q.includes('last') || q.includes('recent')) {
      const lastTxn = stats.transactions?.[0] || stats.transactions?.[stats.transactions.length - 1];
      if (lastTxn) {
        return `Your last transaction was ₹${lastTxn.amount} ${lastTxn.type === 'debit' ? 'to' : 'from'} ${lastTxn.merchant} using ${lastTxn.upiApp.name} on ${new Date(lastTxn.timestamp).toLocaleDateString()}.`;
      }
    }

    if (q.includes('budget') || q.includes('limit') || q.includes('exceed')) {
      const overBudget = Object.entries(stats.budgets || {})
        .filter(([_, data]) => data.spent > data.limit)
        .map(([cat, _]) => cat);
      
      if (overBudget.length > 0) {
        return `You have exceeded your budget in: ${overBudget.join(', ')}. You can click on the limits in the Budget Tracker to adjust them!`;
      }
      return "You are currently within all your budget limits. Great job! 👍";
    }

    const merchants = ['amazon', 'zomato', 'swiggy', 'uber', 'ola', 'netflix', 'spotify', 'flipkart'];
    const foundMerchant = merchants.find(m => q.includes(m));
    if (foundMerchant) {
      const catMap = { 'amazon': 'Shopping', 'zomato': 'Food & Dining', 'swiggy': 'Food & Dining', 'uber': 'Travel & Transport' };
      const category = catMap[foundMerchant];
      const data = stats.categoryBreakdown?.find(c => c.category === category);
      if (data) {
        return `You've spent approximately ₹${data.total.toLocaleString('en-IN')} on ${foundMerchant.charAt(0).toUpperCase() + foundMerchant.slice(1)} related services this month.`;
      }
    }

    if (q.includes('food') || q.includes('eating')) {
      const foodCategory = stats.categoryBreakdown?.find(c => c.category === 'Food & Dining');
      if (foodCategory) {
        return `You've spent ₹${foodCategory.total.toLocaleString('en-IN')} on Food & Dining so far. This includes orders from Zomato and Swiggy!`;
      }
    }

    if (q.includes('spent most') || q.includes('top category')) {
      if (stats.categoryBreakdown?.length > 0) {
        const top = stats.categoryBreakdown[0];
        return `Your biggest spending category is ${top.icon} ${top.category} at ₹${top.total.toLocaleString('en-IN')}.`;
      }
    }

    if (q.includes('total') || q.includes('how much')) {
      return `Your total tracked spending this month is ₹${stats.monthSpent.toLocaleString('en-IN')} across ${stats.monthCount} transactions.`;
    }

    if (q.includes('safe') || q.includes('fraud') || q.includes('suspicious')) {
       if (stats.fraudStats?.flaggedCount > 0) {
          return `I've flagged ${stats.fraudStats.flaggedCount} suspicious transactions. Check your feed for the 🚨 red badges.`;
       }
       return `Your transactions look safe! No high-risk fraud detected. ✅`;
    }

    return "I can help with spending details! Try: 'How much is in my physical wallet?', 'What was my last payment?', or 'Am I over budget?'";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSend(input);
  };

  return (
    <div className="glass-card page-card ai-page">
      <div className="page-header">
        <h2>🤖 AI Spending Assistant</h2>
        <p>Ask natural language questions about your transactions</p>
      </div>

      <div className="suggestions-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', padding: '0 4px' }}>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            className="suggestion-chip"
            onClick={() => handleSend(s)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid var(--accent-purple)',
              background: 'rgba(139, 92, 246, 0.1)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-bubble ${msg.role}`}>
              {msg.role === 'ai' && <div className="chat-avatar">🤖</div>}
              <div className="chat-text">{msg.text}</div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-bubble ai typing">
              <div className="chat-avatar">🤖</div>
              <div className="chat-text"><span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSubmit}>
          <button type="button" onClick={toggleVoice} style={{
             background: isListening ? 'var(--accent-red)' : 'rgba(255,255,255,0.1)', 
             border: 'none', color: 'white', padding: '8px 16px', borderRadius: '100px', cursor: 'pointer',
             display: 'flex', alignItems: 'center', gap: '8px',
             animation: isListening ? 'pulse 1.5s infinite' : 'none'
          }}>
             🎙️ {isListening ? 'Listening...' : ''}
          </button>
          <input 
            type="text" 
            placeholder="E.g. How much did I spend on Zomato this month?" 
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim() || isTyping}>
            Send ↗
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIAssistant;
