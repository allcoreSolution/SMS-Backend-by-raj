const AssignFee = require('../models/AssignFee');

exports.assignFeeToStudent = async (req, res) => {
  try {
    const { student, studentIds, feeGroup, feeGroupId, dueDate, customAmount } = req.body;
    const targetGroupId = feeGroup || feeGroupId;
    
    if (!targetGroupId) {
      return res.status(400).json({ success: false, message: 'Fee group is required' });
    }

    const idsToAssign = Array.isArray(studentIds) && studentIds.length > 0 
      ? studentIds 
      : student ? [student] : [];

    if (idsToAssign.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one student is required' });
    }

    const results = [];
    for (const sId of idsToAssign) {
      const existing = await AssignFee.findOne({ student: sId, feeGroup: targetGroupId });
      if (!existing) {
        const created = await AssignFee.create({
          student: sId,
          feeGroup: targetGroupId,
          dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          customAmount: customAmount || null
        });
        results.push(created);
      }
    }

    res.status(201).json({ 
      success: true, 
      message: `Assigned fee to ${results.length} students`, 
      data: results 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssignedFees = async (req, res) => {
  try {
    const assigned = await AssignFee.find()
      .populate('student', 'firstName lastName aparId')
      .populate({
        path: 'feeGroup',
        populate: { path: 'feeTypes' }
      });
    res.json({ success: true, count: assigned.length, data: assigned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssignedFeeById = async (req, res) => {
  try {
    const assigned = await AssignFee.findById(req.params.id)
      .populate('student', 'firstName lastName aparId')
      .populate({
        path: 'feeGroup',
        populate: { path: 'feeTypes' }
      });
    if (!assigned) return res.status(404).json({ success: false, message: 'Assigned fee not found' });
    res.json({ success: true, data: assigned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssignedFeesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const assigned = await AssignFee.find({ student: studentId }).populate({
      path: 'feeGroup',
      populate: { path: 'feeTypes' }
    });
    res.json({ success: true, count: assigned.length, data: assigned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAssignedFee = async (req, res) => {
  try {
    const assigned = await AssignFee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!assigned) return res.status(404).json({ success: false, message: 'Assigned fee record not found' });
    res.json({ success: true, data: assigned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAssignedFee = async (req, res) => {
  try {
    const assigned = await AssignFee.findByIdAndDelete(req.params.id);
    if (!assigned) return res.status(404).json({ success: false, message: 'Assigned fee record not found' });
    res.json({ success: true, message: 'Assigned fee record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
