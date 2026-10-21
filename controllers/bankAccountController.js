const BankAccount = require('../models/BankAccount');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

exports.getBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find().sort({ createdAt: -1 });

    // For each bank account, dynamically recompute currentBalance from transactions
    const enriched = await Promise.all(accounts.map(async (acc) => {
      const incomes = await Income.find({ bankAccount: acc._id });
      const expenses = await Expense.find({ bankAccount: acc._id });

      const totalIncome = incomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);
      const totalExpense = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const balance = (acc.openingBalance || 0) + totalIncome - totalExpense;

      const obj = acc.toObject();
      obj.currentBalance = balance;
      return obj;
    }));

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBankAccount = async (req, res) => {
  try {
    const { 
      accountTitle, bankName, branchName, accountNumber, 
      ifscCode, accountType, openingBalance 
    } = req.body;

    if (!accountTitle || !bankName || !accountNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account title, bank name, and account number are required' 
      });
    }

    const initialBal = Number(openingBalance) || 0;
    const account = await BankAccount.create({
      accountTitle,
      bankName,
      branchName,
      accountNumber,
      ifscCode,
      accountType: accountType || 'Current',
      openingBalance: initialBal,
      currentBalance: initialBal
    });

    res.status(201).json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!account) return res.status(404).json({ success: false, message: 'Bank account not found' });
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findByIdAndDelete(req.params.id);
    if (!account) return res.status(404).json({ success: false, message: 'Bank account not found' });
    res.json({ success: true, message: 'Bank account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
