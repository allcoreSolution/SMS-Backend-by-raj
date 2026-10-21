const Expense = require('../models/Expense');
const fs = require('fs');
const path = require('path');

const deleteFileFromDisk = (relativePath) => {
  if (!relativePath) return;
  const absolutePath = path.join(__dirname, '..', relativePath);
  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== 'ENOENT') console.error(`Failed to delete file: ${absolutePath}`, err);
  });
};

exports.addExpense = async (req, res, next) => {
  try {
    const expenseData = { ...req.body };
    const headId = expenseData.expenseHeadId || expenseData.expenseHead;
    if (headId) {
      expenseData.expenseHead = headId;
    }
    if (!expenseData.title && expenseData.name) {
      expenseData.title = expenseData.name;
    }
    if (!expenseData.name && expenseData.title) {
      expenseData.name = expenseData.title;
    }
    if (expenseData.amount) {
      expenseData.amount = Number(expenseData.amount);
    }
    if (!expenseData.invoiceNumber) {
      expenseData.invoiceNumber = `EXP-${Date.now().toString().slice(-5)}`;
    }
    if (req.user) {
      expenseData.recordedBy = req.user._id;
    }

    if (req.file) {
      expenseData.receiptUrl = `uploads/documents/${req.file.filename}`;
    }

    const expense = await Expense.create(expenseData);
    const populated = await Expense.findById(expense._id)
      .populate('expenseHead', 'name description')
      .populate('bankAccount', 'accountTitle bankName');

    res.status(201).json({ success: true, data: populated });
  } catch (error) { 
    if (req.file) deleteFileFromDisk(`uploads/documents/${req.file.filename}`);
    next(error); 
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    const { category, expenseHead, startDate, endDate, search } = req.query;
    let query = {};
    if (category) query.category = category;
    if (expenseHead) query.expenseHead = expenseHead;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const expenses = await Expense.find(query)
      .populate('expenseHead', 'name description')
      .populate('bankAccount', 'accountTitle bankName')
      .populate('recordedBy', 'username email')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: expenses.length, data: expenses });
  } catch (error) { next(error); }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    const headId = payload.expenseHeadId || payload.expenseHead;
    if (headId) payload.expenseHead = headId;
    if (payload.name && !payload.title) payload.title = payload.name;

    const expense = await Expense.findByIdAndUpdate(req.params.id, payload, { new: true })
      .populate('expenseHead', 'name description')
      .populate('bankAccount', 'accountTitle bankName');

    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (error) { next(error); }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    
    if (expense.receiptUrl) {
      deleteFileFromDisk(expense.receiptUrl);
    }
    
    await expense.deleteOne();
    res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch(error) { next(error); }
};
