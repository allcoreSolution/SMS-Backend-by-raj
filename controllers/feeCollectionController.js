const FeeCollection = require('../models/FeeCollection');

exports.collectFee = async (req, res) => {
  try {
    const { student, feeGroup, amountPaid, fineAmount, discount, paymentMode, referenceNo, note } = req.body;
    
    // Generate a unique receipt number (e.g. REC-1708-1001)
    const count = await FeeCollection.countDocuments();
    const uniqueTime = Date.now().toString().slice(-4);
    const receiptNo = `REC-${uniqueTime}-${count + 1001}`;

    const receipt = await FeeCollection.create({
      receiptNo,
      student,
      feeGroup,
      amountPaid,
      fineAmount,
      discount: discount || null,
      paymentMode,
      referenceNo,
      note
    });

    res.status(201).json({ success: true, message: 'Fee collected successfully', data: receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeeReceipts = async (req, res) => {
  try {
    const receipts = await FeeCollection.find()
      .populate('student', 'firstName lastName aparId')
      .populate('feeGroup', 'name')
      .populate('discount', 'name amount discountType')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, count: receipts.length, data: receipts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyFeeReceipts = async (req, res) => {
  try {
    const studentId = req.query.studentId;
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId query param is required' });

    const receipts = await FeeCollection.find({ student: studentId })
      .populate('feeGroup', 'name term')
      .populate('discount', 'name amount discountType')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: receipts.length, data: receipts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeeReceiptById = async (req, res) => {
  try {
    const receipt = await FeeCollection.findById(req.params.id)
      .populate('student', 'firstName lastName aparId')
      .populate('feeGroup', 'name')
      .populate('discount', 'name amount discountType');
      
    if (!receipt) return res.status(404).json({ success: false, message: 'Fee receipt not found' });
    res.json({ success: true, data: receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFeeReceipt = async (req, res) => {
  try {
    const receipt = await FeeCollection.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!receipt) return res.status(404).json({ success: false, message: 'Fee receipt not found' });
    res.json({ success: true, data: receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFeeReceipt = async (req, res) => {
  try {
    const receipt = await FeeCollection.findByIdAndDelete(req.params.id);
    if (!receipt) return res.status(404).json({ success: false, message: 'Fee receipt not found' });
    res.json({ success: true, message: 'Fee receipt deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
