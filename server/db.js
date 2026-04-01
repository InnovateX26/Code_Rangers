const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'payflow.sqlite'),
  logging: false
});

// Models Definitions
const User = sequelize.define('User', {
  phone: { type: DataTypes.STRING, unique: true },
  name: { type: DataTypes.STRING },
  sessionToken: { type: DataTypes.STRING }
});

const BankAccount = sequelize.define('BankAccount', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING },
  number: { type: DataTypes.STRING },
  balance: { type: DataTypes.FLOAT },
  color: { type: DataTypes.STRING },
  isCash: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.STRING, primaryKey: true },
  upiAppCode: { type: DataTypes.STRING },
  upiAppName: { type: DataTypes.STRING },
  upiAppIcon: { type: DataTypes.STRING },
  upiAppColor: { type: DataTypes.STRING },
  merchant: { type: DataTypes.STRING },
  amount: { type: DataTypes.FLOAT },
  type: { type: DataTypes.STRING }, // debit/credit
  category: { type: DataTypes.STRING },
  categoryIcon: { type: DataTypes.STRING },
  categoryColor: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
  upiId: { type: DataTypes.STRING },
  timestamp: { type: DataTypes.DATE },
  referenceId: { type: DataTypes.STRING, unique: true },
  bankAccountId: { type: DataTypes.STRING },
  fraudRisk: { type: DataTypes.STRING },
  isManual: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Budget = sequelize.define('Budget', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  category: { type: DataTypes.STRING, unique: true },
  icon: { type: DataTypes.STRING },
  color: { type: DataTypes.STRING },
  limit: { type: DataTypes.FLOAT },
  spent: { type: DataTypes.FLOAT, defaultValue: 0 }
});

module.exports = { sequelize, User, BankAccount, Transaction, Budget };
