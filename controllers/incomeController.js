const Income = require('../models/Income');

exports.getIncomes = async (req, res) => {
  try {
    const { incomeHead, startDate, endDate, search } = req.query;
    let query = {};

    if (incomeHead) query.incomeHead = incomeHead;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const incomes = await Income.find(query)
      .populate('incomeHead', 'name description')
      .populate('bankAccount', 'accountTitle bankName accountNumber')
      .populate('recordedBy', 'username email')
      .sort({ date: -1, createdAt: -1 });

    res.json({ success: true, count: incomes.length, data: incomes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createIncome = async (req, res) => {
  try {
    const { 
      name, incomeHead, incomeHeadId, date, 
      amount, invoiceNumber, description, 
      paymentMode, bankAccount 
    } = req.body;

    const headId = incomeHeadId || incomeHead;
    if (!name || !headId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, income head, and amount are required' 
      });
    }

    const income = await Income.create({
      name,
      incomeHead: headId,
      date: date || new Date(),
      amount: Number(amount),
      invoiceNumber: invoiceNumber || `INC-${Date.now().toString().slice(-5)}`,
      description,
      paymentMode: paymentMode || 'Cash',
      bankAccount: bankAccount || null,
      recordedBy: req.user?._id
    });

    const populated = await Income.findById(income._id)
      .populate('incomeHead', 'name description')
      .populate('bankAccount', 'accountTitle bankName');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateIncome = async (req, res) => {
  try {
    const headId = req.body.incomeHeadId || req.body.incomeHead;
    const payload = { ...req.body };
    if (headId) payload.incomeHead = headId;

    const income = await Income.findByIdAndUpdate(req.params.id, payload, { new: true })
      .populate('incomeHead', 'name description')
      .populate('bankAccount', 'accountTitle bankName');

    if (!income) return res.status(404).json({ success: false, message: 'Income record not found' });
    res.json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findByIdAndDelete(req.params.id);
    if (!income) return res.status(404).json({ success: false, message: 'Income record not found' });
    res.json({ success: true, message: 'Income record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
