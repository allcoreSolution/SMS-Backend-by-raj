const Staff = require('../models/Staff');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Helper to delete file from disk
const deleteFileFromDisk = (relativePath) => {
  if (!relativePath) return;
  const absolutePath = path.join(__dirname, '..', relativePath);
  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error(`Failed to delete file: ${absolutePath}`, err);
    }
  });
};

// @desc    Create a new staff member
// @route   POST /api/staff
// @access  Private (requires create_staff permission)
const createStaff = async (req, res) => {
  try {
    const staffData = { ...req.body };

    // Check if Staff ID or Email already exists
    if (!staffData.staffId || !staffData.email) {
      // If staffId is missing, try using employeeCode
      if (staffData.employeeCode) staffData.staffId = staffData.employeeCode;
      else return res.status(400).json({ success: false, message: 'Staff ID and Email are required' });
    }

    // Default missing fields required by Schema
    if (!staffData.designation) staffData.designation = staffData.roleName || staffData.role || 'Staff';
    if (!staffData.gender) staffData.gender = 'Select';
    if (staffData.firstName && !staffData.fullName) staffData.fullName = staffData.firstName;

    // Map role string to Role ObjectId
    if (staffData.role && !mongoose.Types.ObjectId.isValid(staffData.role)) {
      const Role = require('../models/Role');
      const roleDoc = await Role.findOne({ name: staffData.role });
      if (roleDoc) staffData.role = roleDoc._id;
      else return res.status(400).json({ success: false, message: `Role '${staffData.role}' not found in database.` });
    }

    const exists = await Staff.findOne({ $or: [{ staffId: staffData.staffId }, { email: staffData.email }] });
    if (exists) {
      // Clean up uploaded file since creation failed
      if (req.file) {
        deleteFileFromDisk(`uploads/staffPhotos/${req.file.filename}`);
      }
      return res.status(400).json({ success: false, message: `Staff with ID ${staffData.staffId} or Email ${staffData.email} already exists` });
    }

    // Handle photo
    if (req.file) {
      staffData.photo = `uploads/staffPhotos/${req.file.filename}`;
    }

    // Parse Bank Details if sent as JSON string
    if (typeof staffData.bankDetails === 'string') {
      try {
        staffData.bankDetails = JSON.parse(staffData.bankDetails);
      } catch (e) {
        // do nothing, let mongoose handle invalid data
      }
    }

    // Parse Extra JSON fields (Statutory IDs, Social Media, Additional Info)
    const jsonFields = ['statutoryIds', 'socialMedia', 'additionalInfo'];
    jsonFields.forEach(field => {
      if (typeof staffData[field] === 'string') {
        try {
          staffData[field] = JSON.parse(staffData[field]);
        } catch (e) {
          // ignore parsing error
        }
      }
    });

    const staff = await Staff.create(staffData);

    return res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: staff
    });
  } catch (error) {
    console.error(error);
    if (req.file) {
      deleteFileFromDisk(`uploads/staffPhotos/${req.file.filename}`);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Private (requires view_staff permission)
const getStaffs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, designation, employmentType } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { staffId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) query.department = department;
    if (designation) query.designation = designation;
    if (employmentType) query.employmentType = employmentType;

    const skipIndex = (page - 1) * limit;
    const total = await Staff.countDocuments(query);
    const staffs = await Staff.find(query)
      .populate('role', 'name')
      .populate('reportingManager', 'fullName staffId')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skipIndex);

    return res.json({
      success: true,
      count: staffs.length,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      },
      data: staffs
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single staff member
// @route   GET /api/staff/:id
// @access  Private (requires view_staff permission)
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('role', 'name permissions')
      .populate('reportingManager', 'fullName staffId');

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    return res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a staff member
// @route   PUT / PATCH /api/staff/:id
// @access  Private (requires update_staff permission)
const updateStaff = async (req, res) => {
  try {
    let staff = await Staff.findById(req.params.id);

    if (!staff) {
      if (req.file) deleteFileFromDisk(`uploads/staffPhotos/${req.file.filename}`);
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const staffData = { ...req.body };

    // Prevent changing Staff ID or Email to an existing one
    if ((staffData.staffId && staffData.staffId !== staff.staffId) || 
        (staffData.email && staffData.email !== staff.email)) {
      const exists = await Staff.findOne({
        $or: [
          { staffId: staffData.staffId, _id: { $ne: staff._id } },
          { email: staffData.email, _id: { $ne: staff._id } }
        ]
      });
      if (exists) {
        if (req.file) deleteFileFromDisk(`uploads/staffPhotos/${req.file.filename}`);
        return res.status(400).json({ success: false, message: 'Staff ID or Email is already in use' });
      }
    }

    // Handle photo updates
    if (req.file) {
      if (staff.photo) deleteFileFromDisk(staff.photo);
      staffData.photo = `uploads/staffPhotos/${req.file.filename}`;
    }

    // Parse Bank Details if sent as JSON string
    if (typeof staffData.bankDetails === 'string') {
      try {
        staffData.bankDetails = JSON.parse(staffData.bankDetails);
      } catch (e) {
        // ignore
      }
    }

    // Parse Extra JSON fields
    const jsonFields = ['statutoryIds', 'socialMedia', 'additionalInfo'];
    jsonFields.forEach(field => {
      if (typeof staffData[field] === 'string') {
        try {
          staffData[field] = JSON.parse(staffData[field]);
        } catch (e) {
          // ignore
        }
      }
    });

    staff = await Staff.findByIdAndUpdate(req.params.id, staffData, {
      new: true,
      runValidators: true
    });

    return res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: staff
    });
  } catch (error) {
    console.error(error);
    if (req.file) deleteFileFromDisk(`uploads/staffPhotos/${req.file.filename}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a staff member
// @route   DELETE /api/staff/:id
// @access  Private (requires delete_staff permission)
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    // Delete photo from disk
    if (staff.photo) {
      deleteFileFromDisk(staff.photo);
    }

    await staff.deleteOne();

    return res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createStaff,
  getStaffs,
  getStaffById,
  updateStaff,
  deleteStaff
};
