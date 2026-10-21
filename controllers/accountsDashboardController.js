const Income = require('../models/Income');
const Expense = require('../models/Expense');
const FeeCollection = require('../models/FeeCollection');
const BankAccount = require('../models/BankAccount');

exports.getAccountsDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Fee collections today & this month
    const feeCollectionsToday = await FeeCollection.find({
      createdAt: { $gte: startOfToday }
    });
    const feeCollectionsMonth = await FeeCollection.find({
      createdAt: { $gte: startOfMonth }
    });

    const feeTodaySum = feeCollectionsToday.reduce((sum, c) => sum + (c.amountPaid || 0), 0);
    const feeMonthSum = feeCollectionsMonth.reduce((sum, c) => sum + (c.amountPaid || 0), 0);

    // 2. Direct Incomes today & this month
    const incomesToday = await Income.find({
      date: { $gte: startOfToday }
    });
    const incomesMonth = await Income.find({
      date: { $gte: startOfMonth }
    });

    const incomeTodaySum = incomesToday.reduce((sum, inc) => sum + (inc.amount || 0), 0);
    const incomeMonthSum = incomesMonth.reduce((sum, inc) => sum + (inc.amount || 0), 0);

    // 3. Expenses this month
    const expensesMonth = await Expense.find({
      date: { $gte: startOfMonth }
    });
    const expenseMonthSum = expensesMonth.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // 4. Bank Accounts Cash & Bank Balance
    const bankAccounts = await BankAccount.find();
    let totalCashAndBank = 0;
    for (const acc of bankAccounts) {
      const accIncomes = await Income.find({ bankAccount: acc._id });
      const accExpenses = await Expense.find({ bankAccount: acc._id });
      const inSum = accIncomes.reduce((s, i) => s + (i.amount || 0), 0);
      const exSum = accExpenses.reduce((s, e) => s + (e.amount || 0), 0);
      totalCashAndBank += (acc.openingBalance || 0) + inSum - exSum;
    }

    // If no bank accounts, sum of all collections + incomes - expenses
    if (bankAccounts.length === 0) {
      const allCollections = await FeeCollection.find();
      const allIncomes = await Income.find();
      const allExpenses = await Expense.find();
      const colSum = allCollections.reduce((s, c) => s + (c.amountPaid || 0), 0);
      const incSum = allIncomes.reduce((s, i) => s + (i.amount || 0), 0);
      const expSum = allExpenses.reduce((s, e) => s + (e.amount || 0), 0);
      totalCashAndBank = Math.max(0, colSum + incSum - expSum);
    }

    // 5. 6-Months Chart Comparison (Month by Month)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const mIncomes = await Income.find({ date: { $gte: mStart, $lte: mEnd } });
      const mFee = await FeeCollection.find({ createdAt: { $gte: mStart, $lte: mEnd } });
      const mExpenses = await Expense.find({ date: { $gte: mStart, $lte: mEnd } });

      const mIncTotal = mIncomes.reduce((s, x) => s + (x.amount || 0), 0) + mFee.reduce((s, x) => s + (x.amountPaid || 0), 0);
      const mExpTotal = mExpenses.reduce((s, x) => s + (x.amount || 0), 0);

      chartData.push({
        month: monthNames[d.getMonth()],
        income: mIncTotal,
        expense: mExpTotal,
        net: mIncTotal - mExpTotal
      });
    }

    // 6. Recent Vouchers Feed (Combining Incomes and Expenses)
    const recentIncomes = await Income.find().populate('incomeHead', 'name').sort({ date: -1 }).limit(10);
    const recentExpenses = await Expense.find().populate('expenseHead', 'name').sort({ date: -1 }).limit(10);

    const vouchers = [
      ...recentIncomes.map(inc => ({
        id: inc._id,
        voucherNo: inc.invoiceNumber || `INC-${inc._id.toString().slice(-4)}`,
        type: 'INCOME',
        name: inc.name,
        category: inc.incomeHead?.name || 'General Income',
        amount: inc.amount,
        date: inc.date,
        paymentMode: inc.paymentMode || 'Cash'
      })),
      ...recentExpenses.map(exp => ({
        id: exp._id,
        voucherNo: exp.invoiceNumber || `EXP-${exp._id.toString().slice(-4)}`,
        type: 'EXPENSE',
        name: exp.name || exp.title || 'Expense Item',
        category: exp.expenseHead?.name || exp.category || 'General Expense',
        amount: exp.amount,
        date: exp.date,
        paymentMode: exp.paymentMode || 'Cash'
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

    res.json({
      success: true,
      stats: {
        todaysCollection: feeTodaySum + incomeTodaySum,
        monthIncome: feeMonthSum + incomeMonthSum,
        monthExpense: expenseMonthSum,
        cashAndBank: totalCashAndBank
      },
      chartData,
      recentVouchers: vouchers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
