const Student = require('../models/Student');
const AssignFee = require('../models/AssignFee');
const FeeCollection = require('../models/FeeCollection');
const FeeGroup = require('../models/FeeGroup');

// Helper: Calculate expected fee amount for an Assigned Fee Group
const getExpectedAmount = (assignRecord) => {
  if (assignRecord.customAmount !== null && assignRecord.customAmount !== undefined) {
    return assignRecord.customAmount;
  }
  if (!assignRecord.feeGroup || !assignRecord.feeGroup.feeTypes) return 0;
  return assignRecord.feeGroup.feeTypes.reduce((sum, item) => sum + (item.amount || 0), 0);
};

// @desc    Get all students with outstanding due fees
// @route   GET /api/finance-reports/due-fees
// @access  Admin App (manage_finance) / Teacher App (view_students)
exports.getDueFees = async (req, res) => {
  try {
    // 1. Fetch all assigned fees and populate student & feeGroup details
    const assignedFees = await AssignFee.find()
      .populate('student', 'firstName lastName aparId studentEmail studentPhone')
      .populate({
        path: 'feeGroup',
        populate: { path: 'feeTypes.feeType' }
      });

    // 2. Fetch all payments (collections)
    const collections = await FeeCollection.find();

    const studentMap = {};

    // Process assigned fees
    assignedFees.forEach(record => {
      if (!record.student) return;
      const studentId = record.student._id.toString();
      const expected = getExpectedAmount(record);

      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          student: record.student,
          totalAssigned: 0,
          totalPaid: 0,
          totalDue: 0,
          groups: []
        };
      }

      studentMap[studentId].totalAssigned += expected;
      studentMap[studentId].groups.push({
        feeGroupId: record.feeGroup._id,
        name: record.feeGroup.name,
        expected,
        paid: 0,
        due: expected,
        dueDate: record.dueDate
      });
    });

    // Process payments
    collections.forEach(payment => {
      const studentId = payment.student.toString();
      const groupId = payment.feeGroup.toString();

      if (studentMap[studentId]) {
        studentMap[studentId].totalPaid += payment.amountPaid;
        
        // Find the group and update paid/due
        const groupObj = studentMap[studentId].groups.find(g => g.feeGroupId.toString() === groupId);
        if (groupObj) {
          groupObj.paid += payment.amountPaid;
          groupObj.due = Math.max(0, groupObj.expected - groupObj.paid);
        }
      }
    });

    // Calculate final dues and filter out students with 0 dues
    const results = Object.values(studentMap).map(item => {
      item.totalDue = Math.max(0, item.totalAssigned - item.totalPaid);
      return item;
    }).filter(item => item.totalDue > 0);

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific student dues details
// @route   GET /api/finance-reports/student-dues/:studentId
// @access  Student App (view own dues) / Admin App
exports.getStudentDues = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Fetch assigned fees
    const assignedFees = await AssignFee.find({ student: studentId })
      .populate({
        path: 'feeGroup',
        populate: { path: 'feeTypes.feeType' }
      });

    // Fetch collections
    const collections = await FeeCollection.find({ student: studentId })
      .populate('feeGroup', 'name')
      .populate('discount', 'name amount discountType');

    const groups = assignedFees.map(record => {
      const expected = getExpectedAmount(record);
      
      // Calculate how much has been paid for this group
      const groupPayments = collections.filter(c => c.feeGroup._id.toString() === record.feeGroup._id.toString());
      const paid = groupPayments.reduce((sum, p) => sum + p.amountPaid, 0);
      const due = Math.max(0, expected - paid);

      return {
        feeGroup: {
          _id: record.feeGroup._id,
          name: record.feeGroup.name,
          feeTypes: record.feeGroup.feeTypes
        },
        expected,
        paid,
        due,
        dueDate: record.dueDate
      };
    });

    const totalAssigned = groups.reduce((sum, g) => sum + g.expected, 0);
    const totalPaid = groups.reduce((sum, g) => sum + g.paid, 0);
    const totalDue = Math.max(0, totalAssigned - totalPaid);

    res.json({
      success: true,
      data: {
        totalAssigned,
        totalPaid,
        totalDue,
        groups,
        paymentsHistory: collections
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Carry forward due balances of students to next session
// @route   POST /api/finance-reports/carry-forward
// @access  Admin App (manage_finance)
exports.carryForwardDues = async (req, res) => {
  try {
    const { studentIds, targetFeeGroupId, dueDate } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || !targetFeeGroupId || !dueDate) {
      return res.status(400).json({ success: false, message: 'studentIds array, targetFeeGroupId, and dueDate are required' });
    }

    const targetGroup = await FeeGroup.findById(targetFeeGroupId);
    if (!targetGroup) return res.status(404).json({ success: false, message: 'Target Fee Group not found' });

    let count = 0;

    for (const studentId of studentIds) {
      // Calculate dues for this student
      const assigned = await AssignFee.find({ student: studentId }).populate({
        path: 'feeGroup',
        populate: { path: 'feeTypes.feeType' }
      });
      const collections = await FeeCollection.find({ student: studentId });

      const totalAssigned = assigned.reduce((sum, r) => sum + getExpectedAmount(r), 0);
      const totalPaid = collections.reduce((sum, c) => sum + c.amountPaid, 0);
      const totalDue = Math.max(0, totalAssigned - totalPaid);

      if (totalDue > 0) {
        // Check if already assigned in next plan
        const existing = await AssignFee.findOne({ student: studentId, feeGroup: targetFeeGroupId });
        if (!existing) {
          await AssignFee.create({
            student: studentId,
            feeGroup: targetFeeGroupId,
            dueDate,
            customAmount: totalDue // Dues carried forward as custom total amount
          });
          count++;
        }
      }
    }

    res.json({ success: true, message: `Successfully carried forward dues for ${count} students` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard metrics for Finance Officer
// @route   GET /api/finance-reports/dashboard
// @access  Admin App (manage_finance)
exports.getDashboardStats = async (req, res) => {
  try {
    // Expected Revenue
    const assigned = await AssignFee.find().populate({
      path: 'feeGroup',
      populate: { path: 'feeTypes.feeType' }
    });
    const totalExpected = assigned.reduce((sum, r) => sum + getExpectedAmount(r), 0);

    // Paid, Fine, Discount metrics
    const collections = await FeeCollection.find().populate('discount');
    const totalCollected = collections.reduce((sum, c) => sum + c.amountPaid, 0);
    const totalFines = collections.reduce((sum, c) => sum + c.fineAmount, 0);

    let totalDiscount = 0;
    collections.forEach(c => {
      if (c.discount) {
        if (c.discount.discountType === 'Percentage') {
          totalDiscount += (totalExpected * c.discount.amount) / 100;
        } else {
          totalDiscount += c.discount.amount;
        }
      }
    });

    const totalDue = Math.max(0, totalExpected - totalCollected);

    // Breakdown by payment mode
    const paymentModeBreakdown = { Cash: 0, Cheque: 0, Online: 0, DD: 0 };
    collections.forEach(c => {
      if (paymentModeBreakdown[c.paymentMode] !== undefined) {
        paymentModeBreakdown[c.paymentMode] += c.amountPaid;
      }
    });

    // Recent payments (limit to 5)
    const recentPayments = await FeeCollection.find()
      .populate('student', 'firstName lastName aparId')
      .populate('feeGroup', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalExpected,
        totalCollected,
        totalDue,
        totalFines,
        totalDiscount,
        paymentModeBreakdown,
        recentPayments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get transactions ledger report
// @route   GET /api/finance-reports/transactions
// @access  Admin App (manage_finance)
exports.getTransactionsLedger = async (req, res) => {
  try {
    const transactions = await FeeCollection.find()
      .populate('student', 'firstName lastName aparId')
      .populate('feeGroup', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
