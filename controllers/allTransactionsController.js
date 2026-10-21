const FeeCollection = require('../models/FeeCollection');
const Student = require('../models/Student');
const AcademicClass = require('../models/AcademicClass');

exports.getAllTransactions = async (req, res) => {
  try {
    const { from, to, limit } = req.query;
    const query = {};

    if (from || to) {
      query.paymentDate = {};
      if (from) query.paymentDate.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.paymentDate.$lte = toDate;
      }
    }

    let q = FeeCollection.find(query)
      .populate({
        path: 'student',
        select: 'firstName lastName aparId studentPhone studentEmail classId sectionId',
        populate: { path: 'classId', select: 'className' }
      })
      .populate('feeGroup', 'name')
      .populate('discount', 'name amount discountType')
      .sort({ createdAt: -1 });

    if (limit && !isNaN(limit)) {
      q = q.limit(parseInt(limit));
    }

    const transactions = await q;

    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
