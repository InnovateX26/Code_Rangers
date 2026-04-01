const fs = require('fs');
const path = require('path');
const { sequelize, User, BankAccount, Transaction, Budget } = require('./db');

const DB_FILE = path.join(__dirname, 'payflow-data.json');

async function migrate() {
  try {
    await sequelize.sync({ force: true });
    console.log('🔄 SQLite Database Synced');

    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      console.log(`📦 Migrating ${data.transactions?.length || 0} transactions...`);

      // 1. Bank Accounts
      if (data.bank_accounts) {
        for (const b of data.bank_accounts) {
          await BankAccount.create({
            id: b.id, name: b.name, number: b.number, balance: b.balance, color: b.color, isCash: b.isCash || false
          });
        }
      }

      // 2. Budgets
      if (data.userBudgets) {
        const cats = {
          'Food & Dining': { icon: '🍔', color: '#f59e0b' },
          'Shopping': { icon: '🛍️', color: '#ec4899' },
          'Travel & Transport': { icon: '🚕', color: '#10b981' },
          'Bills & Utilities': { icon: '💡', color: '#3b82f6' },
          'Entertainment': { icon: '🎬', color: '#8b5cf6' },
          'Health & Wellness': { icon: '🏥', color: '#ef4444' }
        };

        for (const [cat, b] of Object.entries(data.userBudgets)) {
          await Budget.create({
            category: cat,
            icon: cats[cat]?.icon || '📦',
            color: cats[cat]?.color || '#94a3b8',
            limit: b.limit,
            spent: b.spent
          });
        }
      }

      // 3. Transactions
      if (data.transactions) {
        for (const t of data.transactions) {
          try {
            await Transaction.create({
              upiAppCode: t.upiApp.code,
              upiAppName: t.upiApp.name,
              upiAppIcon: t.upiApp.icon,
              upiAppColor: t.upiApp.color,
              merchant: t.merchant,
              amount: t.amount,
              type: t.type,
              category: t.category,
              categoryIcon: t.categoryIcon,
              categoryColor: t.categoryColor,
              status: t.status,
              upiId: t.upiId,
              timestamp: new Date(t.timestamp),
              referenceId: t.referenceId,
              bankAccountId: t.bankAccountId,
              fraudRisk: t.fraud?.riskLevel || 'safe',
              isManual: t.isManual || false
            });
          } catch (err) { /* ignore duplicates or minor errors */ }
        }
      }

      console.log('✅ Migration Successful!');
    }
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  }
}

if (require.main === module) {
  migrate().then(() => process.exit(0));
}

module.exports = migrate;
