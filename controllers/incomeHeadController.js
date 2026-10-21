const IncomeHead = require('../models/IncomeHead');

exports.getIncomeHeads = async (req, res) => {
  try {
    const heads = await IncomeHead.find().sort({ createdAt: -1 });
    res.json({ success: true, count: heads.length, data: heads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createIncomeHead = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const head = await IncomeHead.create({ name, description, status: status || 'Active' });
    res.status(201).json({ success: true, data: head });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateIncomeHead = async (req, res) => {
  try {
    const head = await IncomeHead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!head) return res.status(404).json({ success: false, message: 'Income Head not found' });
    res.json({ success: true, data: head });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteIncomeHead = async (req, res) => {
  try {
    const head = await IncomeHead.findByIdAndDelete(req.params.id);
    if (!head) return res.status(404).json({ success: false, message: 'Income Head not found' });
    res.json({ success: true, message: 'Income Head deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
