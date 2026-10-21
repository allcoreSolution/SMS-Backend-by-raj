const ExpenseHead = require('../models/ExpenseHead');

exports.getExpenseHeads = async (req, res) => {
  try {
    const heads = await ExpenseHead.find().sort({ createdAt: -1 });
    res.json({ success: true, count: heads.length, data: heads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createExpenseHead = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const head = await ExpenseHead.create({ name, description, status: status || 'Active' });
    res.status(201).json({ success: true, data: head });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateExpenseHead = async (req, res) => {
  try {
    const head = await ExpenseHead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!head) return res.status(404).json({ success: false, message: 'Expense Head not found' });
    res.json({ success: true, data: head });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteExpenseHead = async (req, res) => {
  try {
    const head = await ExpenseHead.findByIdAndDelete(req.params.id);
    if (!head) return res.status(404).json({ success: false, message: 'Expense Head not found' });
    res.json({ success: true, message: 'Expense Head deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
