const FeeCollection = require('../models/FeeCollection');

exports.getOnlineTransactions = async (req, res) => {
  try {
    const transactions = await FeeCollection.find({ paymentMode: 'Online' })
      .populate('student', 'firstName lastName aparId')
      .populate('feeGroup', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
