/**
 * 🤖 PayFlow AI Wealth Agent (SQL Version)
 * Proactively scans SQL records to identify savings and optimizations.
 */
const { Transaction, BankAccount, Budget } = require('./db');
const { Op } = require('sequelize');

class WealthAgent {
  constructor(broadcast) {
    this.broadcast = broadcast;
  }

  async audit() {
    console.log('🤖 AI Wealth Agent: Starting SQL Audit...');
    const insights = [];

    // 1. Detect Redundant Subscriptions (Case-insensitive merchant check)
    const subTxns = await Transaction.findAll({
      where: {
        [Op.or]: [
           { merchant: { [Op.like]: '%subscription%' } },
           { merchant: { [Op.like]: '%premium%' } }
        ]
      }
    });
    
    if (subTxns.length > 2) {
       const uniqueMerchants = [...new Set(subTxns.map(t => t.merchant))];
       insights.push({
         id: 'audit_subs',
         priority: 'medium',
         title: 'Subscription Bloat Detected',
         message: `You have ${uniqueMerchants.length} recurring subscriptions active. You could save ₹${Math.round(subTxns.reduce((s, t) => s + t.amount, 0) * 0.2)} by pruning unused ones.`,
         actionLabel: 'Review Subscriptions'
       });
    }

    // 2. High Burn Rate Detection
    const now = new Date();
    const today = now.getDate();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const budgets = await Budget.findAll();
    const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const monthSpent = await Transaction.sum('amount', {
       where: { 
         type: { [Op.ne]: 'credit' },
         timestamp: { [Op.gte]: thisMonth }
       }
    }) || 0;

    const projected = (monthSpent / today) * 30;
    if (projected > totalLimit * 1.1 && totalLimit > 0) {
      insights.push({
        id: 'budget_overrun',
        priority: 'high',
        title: 'Projected Budget Overrun',
        message: `At your current pace, you'll exceed your ₹${totalLimit} budget by ₹${Math.round(projected - totalLimit)}. Let's tighten Food & Shopping?`,
        actionLabel: 'Optimize Budget'
      });
    }

    // 3. Goal Suggestion
    const digitalAccounts = await BankAccount.findAll({ where: { isCash: false } });
    const digitalBal = digitalAccounts.reduce((s, a) => s + a.balance, 0);
    if (digitalBal > 20000) {
      insights.push({
        id: 'goal_savings',
        priority: 'low',
        title: 'Idle Cash Detected',
        message: 'You have ₹20K+ in your digital accounts. Move ₹5,000 into a 7.2% Fixed Deposit Goal?',
        actionLabel: 'Create Goal'
      });
    }

    if (insights.length > 0) {
      const bestInsight = insights.sort((a, b) => {
        const p = { high: 3, medium: 2, low: 1 };
        return p[b.priority] - p[a.priority];
      })[0];

      this.broadcast({
        type: 'agent_proposal',
        proposal: bestInsight
      });
    }
  }

  start(intervalMs = 60000) {
    setInterval(() => {
      this.audit();
    }, intervalMs);
  }
}

module.exports = WealthAgent;
