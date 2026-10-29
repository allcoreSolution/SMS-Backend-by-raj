const mongoose = require('mongoose');
const Leave = require('../models/Leave');
const Staff = require('../models/Staff');
const Student = require('../models/Student');
const { LeaveType } = require('../models/HR');
const fs = require('fs');
const path = require('path');

const deleteFileFromDisk = (relativePath) => {
  if (!relativePath) return;
  const absolutePath = path.join(__dirname, '..', relativePath);
  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== 'ENOENT') console.error(`Failed to delete file: ${absolutePath}`, err);
  });
};

// @desc    Apply for Leave (Staff / Student)
// @route   POST /api/leaves or POST /api/leaves/apply
exports.applyLeave = async (req, res, next) => {
  try {
    const leaveData = { ...req.body };
    if (req.file) {
      leaveData.attachmentUrl = `uploads/documents/${req.file.filename}`;
    }

    // Default applicantType to 'Staff'
    if (!leaveData.applicantType) {
      leaveData.applicantType = 'Staff';
    }

    // Clean invalid or empty string ObjectIds so Mongoose doesn't crash with CastError
    if (!leaveData.staffId || leaveData.staffId === '' || !mongoose.Types.ObjectId.isValid(leaveData.staffId)) {
      delete leaveData.staffId;
    }
    if (!leaveData.studentId || leaveData.studentId === '' || !mongoose.Types.ObjectId.isValid(leaveData.studentId)) {
      delete leaveData.studentId;
    }
    if (!leaveData.reviewedBy || leaveData.reviewedBy === '' || !mongoose.Types.ObjectId.isValid(leaveData.reviewedBy)) {
      delete leaveData.reviewedBy;
    }

    // Resolve staffId if applicant is Staff and staffId is not provided
    if (leaveData.applicantType === 'Staff' && !leaveData.staffId) {
      let staff = null;
      if (req.user && req.user.email) {
        staff = await Staff.findOne({ email: req.user.email });
      }
      if (!staff && leaveData.employeeCode) {
        staff = await Staff.findOne({ staffId: leaveData.employeeCode });
      }
      if (!staff) {
        staff = await Staff.findOne();
      }
      if (staff) {
        leaveData.staffId = staff._id;
      }
    }

    // Safe fallbacks so missing reason or dates will never break submission
    if (!leaveData.reason || typeof leaveData.reason !== 'string' || leaveData.reason.trim() === '') {
      leaveData.reason = 'Personal Requirement / Medical Leave';
    }
    if (!leaveData.startDate || leaveData.startDate === '') {
      leaveData.startDate = new Date();
    }
    if (!leaveData.endDate || leaveData.endDate === '') {
      leaveData.endDate = new Date(new Date(leaveData.startDate).getTime() + 86400000);
    }
    if (!leaveData.leaveType || leaveData.leaveType === '') {
      leaveData.leaveType = 'Casual Leave (CL)';
    }

    const leave = await Leave.create(leaveData);
    res.status(201).json({ success: true, message: 'Leave application submitted successfully!', data: leave });
  } catch (error) { 
    console.error('Error in applyLeave:', error);
    if (req.file) deleteFileFromDisk(`uploads/documents/${req.file.filename}`);
    next(error); 
  }
};

// @desc    Get All Leaves
// @route   GET /api/leaves
exports.getLeaves = async (req, res, next) => {
  try {
    const { status, applicantType, staffId, studentId } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (applicantType && applicantType !== 'All') query.applicantType = applicantType;
    if (staffId && mongoose.Types.ObjectId.isValid(staffId)) query.staffId = staffId;
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) query.studentId = studentId;

    const leaves = await Leave.find(query)
      .populate('staffId', 'fullName staffId designation department email phone')
      .populate('studentId', 'firstName lastName rollNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) { next(error); }
};

// @desc    Get Current User Leaves
// @route   GET /api/leaves/my-leaves
exports.getMyLeaves = async (req, res, next) => {
  try {
    const { studentId, staffId, status } = req.query;
    let query = {};
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) query.studentId = studentId;
    if (staffId && mongoose.Types.ObjectId.isValid(staffId)) {
      query.staffId = staffId;
    } else {
      let staff = null;
      if (req.user && req.user.email) {
        staff = await Staff.findOne({ email: req.user.email });
      }
      if (!staff) {
        staff = await Staff.findOne();
      }
      if (staff) {
        query.staffId = staff._id;
      }
    }
    if (status && status !== 'All') query.status = status;
    
    const leaves = await Leave.find(query)
      .populate('staffId', 'fullName staffId designation department')
      .populate('studentId', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) { next(error); }
};

// @desc    Get Leave Types
// @route   GET /api/leaves/types
exports.getLeaveTypes = async (req, res, next) => {
  try {
    let types = await LeaveType.find().sort({ name: 1 });
    if (!types || types.length === 0) {
      const defaultTypes = [
        { name: 'Casual Leave (CL)', maxDaysPerYear: 12, description: 'Casual leave for personal matters' },
        { name: 'Medical Leave (ML)', maxDaysPerYear: 10, description: 'Leave for medical issues' },
        { name: 'Earned Leave (EL)', maxDaysPerYear: 15, description: 'Earned privilege leave' },
        { name: 'Duty Leave (DL)', maxDaysPerYear: 10, description: 'Official duty leave' },
        { name: 'Maternity/Paternity', maxDaysPerYear: 90, description: 'Parental leave' },
        { name: 'Unpaid Leave', maxDaysPerYear: 0, description: 'Leave without pay' }
      ];
      types = defaultTypes;
    }
    res.status(200).json({ success: true, count: types.length, data: types });
  } catch (error) { next(error); }
};

// @desc    Create Leave Type
// @route   POST /api/leaves/types
exports.createLeaveType = async (req, res, next) => {
  try {
    const type = await LeaveType.create(req.body);
    res.status(201).json({ success: true, data: type });
  } catch (error) { next(error); }
};

// @desc    Delete Leave Type
// @route   DELETE /api/leaves/types/:id
exports.deleteLeaveType = async (req, res, next) => {
  try {
    const type = await LeaveType.findByIdAndDelete(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Leave type not found' });
    res.status(200).json({ success: true, message: 'Leave type deleted successfully' });
  } catch (error) { next(error); }
};

// @desc    Approve Leave
// @route   PATCH /api/leaves/:id/approve
exports.approveLeave = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved', remarks: remarks || 'Approved by Administrator' },
      { new: true }
    );
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    res.status(200).json({ success: true, data: leave });
  } catch (error) { next(error); }
};

// @desc    Reject Leave
// @route   PATCH /api/leaves/:id/reject
exports.rejectLeave = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected', remarks: remarks || 'Rejected by Administrator' },
      { new: true }
    );
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    res.status(200).json({ success: true, data: leave });
  } catch (error) { next(error); }
};

// @desc    Update Leave Status
// @route   PUT /api/leaves/status/:id
exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const leave = await Leave.findByIdAndUpdate(id, { status, remarks }, { new: true });
    res.status(200).json({ success: true, data: leave });
  } catch (error) { next(error); }
};

// @desc    Delete / Withdraw Leave
// @route   DELETE /api/leaves/:id
exports.deleteLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    
    if (leave.attachmentUrl) {
      deleteFileFromDisk(leave.attachmentUrl);
    }
    
    await leave.deleteOne();
    res.status(200).json({ success: true, message: 'Leave deleted successfully' });
  } catch (error) { next(error); }
};
