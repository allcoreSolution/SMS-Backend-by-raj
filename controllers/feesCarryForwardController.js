const AssignFee = require('../models/AssignFee');
const FeeCollection = require('../models/FeeCollection');
const FeeGroup = require('../models/FeeGroup');

const getExpectedAmount = (assignRecord) => {
  if (assignRecord.customAmount !== null && assignRecord.customAmount !== undefined) {
    return assignRecord.customAmount;
  }
  if (!assignRecord.feeGroup || !assignRecord.feeGroup.feeTypes) return 0;
  return assignRecord.feeGroup.feeTypes.reduce((sum, item) => sum + (item.amount || 0), 0);
};

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
      const assigned = await AssignFee.find({ student: studentId }).populate({
        path: 'feeGroup',
        populate: { path: 'feeTypes.feeType' }
      });
      const collections = await FeeCollection.find({ student: studentId });

      const totalAssigned = assigned.reduce((sum, r) => sum + getExpectedAmount(r), 0);
      const totalPaid = collections.reduce((sum, c) => sum + c.amountPaid, 0);
      const totalDue = Math.max(0, totalAssigned - totalPaid);

      if (totalDue > 0) {
        const existing = await AssignFee.findOne({ student: studentId, feeGroup: targetFeeGroupId });
        if (!existing) {
          await AssignFee.create({
            student: studentId,
            feeGroup: targetFeeGroupId,
            dueDate,
            customAmount: totalDue
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

exports.getCarryForwardRecords = async (req, res) => {
  try {
    const carryForwardFees = await AssignFee.find({ customAmount: { $gt: 0 } })
      .populate('student')
      .populate('feeGroup');
    res.json({ success: true, count: carryForwardFees.length, data: carryForwardFees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

