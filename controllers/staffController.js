const Staff = require('../models/Staff');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { resolveTenant, isSameTenant } = require('../services/tenantResolver');

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

    // Sanitize reportingManager in createStaff
    if (!staffData.reportingManager || staffData.reportingManager === '' || staffData.reportingManager === 'null' || staffData.reportingManager === 'undefined' || !mongoose.Types.ObjectId.isValid(staffData.reportingManager)) {
      delete staffData.reportingManager;
    }

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

    // Map role string or default to Role ObjectId
    if (!staffData.role || !mongoose.Types.ObjectId.isValid(staffData.role)) {
      const Role = require('../models/Role');
      const targetRoleName = String(staffData.role || staffData.roleName || 'Staff').trim();
      let roleDoc = await Role.findOne({
        $or: [
          { name: targetRoleName },
          { name: new RegExp(`^${targetRoleName}$`, 'i') }
        ]
      });
      if (!roleDoc) {
        roleDoc = await Role.create({
          name: targetRoleName,
          description: `${targetRoleName} role`,
          permissions: ['view_staff']
        });
      }
      staffData.role = roleDoc._id;
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

    // 1. Resolve Tenant with Strict Multi-Tenant Enforcement
    let targetTenantId = null;
    let targetTenantDoc = null;

    // A. Check if the authenticated user has a tenant bound to their account
    const userTenant = req.user?.tenant ? (req.user.tenant._id || req.user.tenant) : null;
    
    // B. Check incoming tenant identifier from body or headers
    const incomingTenant = req.body.tenant || req.body.tenantId || req.body.schoolId || req.headers['x-tenant-id'] || req.tenantId;

    if (userTenant) {
      // User is scoped to a specific school tenant
      const resolvedUserTenant = await resolveTenant(userTenant);
      if (!resolvedUserTenant) {
        if (req.file) deleteFileFromDisk(`uploads/staffPhotos/${req.file.filename}`);
        return res.status(403).json({ success: false, message: 'Account is associated with an inactive or invalid school tenant.' });
      }

      // If an incoming tenant was also provided, verify it matches user's tenant (Cross-tenant protection)
      if (incomingTenant) {
        const resolvedIncoming = await resolveTenant(incomingTenant);
        if (!resolvedIncoming || String(resolvedIncoming.tenantId) !== String(resolvedUserTenant.tenantId)) {
          if (req.file) deleteFileFromDisk(`uploads/staffPhotos/${req.file.filename}`);
          return res.status(403).json({
            success: false,
            message: 'Cross-tenant registration prohibited: You cannot register staff for another school tenant.'
          });
        }
      }

      targetTenantId = resolvedUserTenant.tenantId;
      targetTenantDoc = resolvedUserTenant.tenant;
    } else {
      // User has no tenant bound (e.g. SuperAdmin or unauthenticated/internal caller)
      if (!incomingTenant) {
        if (req.file) deleteFileFromDisk(`uploads/staffPhotos/${req.file.filename}`);
        return res.status(400).json({
          success: false,
          message: 'Valid tenant is required for staff registration. None was provided.'
        });
      }

      const resolvedIncoming = await resolveTenant(incomingTenant);
      if (!resolvedIncoming) {
        if (req.file) deleteFileFromDisk(`uploads/staffPhotos/${req.file.filename}`);
        return res.status(400).json({
          success: false,
          message: `Invalid tenant identifier "${incomingTenant}". No corresponding active tenant exists.`
        });
      }

      targetTenantId = resolvedIncoming.tenantId;
      targetTenantDoc = resolvedIncoming.tenant;
    }

    // Assign the validated MongoDB ObjectId and school metadata
    staffData.tenant = targetTenantId;
    if (targetTenantDoc) {
      if (!staffData.schoolName) staffData.schoolName = targetTenantDoc.schoolName;
      if (!staffData.schoolLogo && targetTenantDoc.logoUrl) staffData.schoolLogo = targetTenantDoc.logoUrl;
      if (!staffData.schoolShortName && targetTenantDoc.subdomain) staffData.schoolShortName = targetTenantDoc.subdomain;
    }

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
    const rawTenant = req.user?.tenant || req.query.tenant || req.query.tenantId || req.headers['x-tenant-id'] || req.tenantId;
    if (rawTenant && !req.isDemoAdmin) {
      const resolved = await resolveTenant(rawTenant);
      if (resolved) {
        query.tenant = resolved.tenantId;
      } else if (mongoose.Types.ObjectId.isValid(rawTenant)) {
        query.tenant = new mongoose.Types.ObjectId(rawTenant);
      }
    }

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
      .populate('tenant', 'schoolName email subdomain')
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
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { staffId: req.params.id };

    const staff = await Staff.findOne(query)
      .populate('role', 'name permissions')
      .populate('tenant', 'schoolName email subdomain status')
      .populate('reportingManager', 'fullName staffId');

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    // Tenant isolation check
    if (req.user?.tenant) {
      const userTenantId = String(req.user.tenant._id || req.user.tenant);
      if (staff.tenant && String(staff.tenant._id || staff.tenant) !== userTenantId) {
        return res.status(403).json({ success: false, message: 'Access denied: Staff belongs to another school tenant.' });
      }
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
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { staffId: req.params.id };

    let staff = await Staff.findOne(query);

    if (!staff) {
      if (req.file) deleteFileFromDisk(`uploads/staffPhotos/${req.file.filename}`);
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    // Multi-tenant isolation for updates
    if (req.user?.tenant) {
      const userTenantId = String(req.user.tenant._id || req.user.tenant);
      if (staff.tenant && String(staff.tenant._id || staff.tenant) !== userTenantId) {
        if (req.file) deleteFileFromDisk(`uploads/staffPhotos/${req.file.filename}`);
        return res.status(403).json({ success: false, message: 'Access denied: Cannot update staff from another tenant.' });
      }
    }

    const staffData = { ...req.body };

    // Tenant update handling
    if (staffData.tenant || staffData.tenantId || staffData.schoolId) {
      const incoming = staffData.tenant || staffData.tenantId || staffData.schoolId;
      const resolved = await resolveTenant(incoming);
      if (!resolved) {
        if (req.file) deleteFileFromDisk(`uploads/staffPhotos/${req.file.filename}`);
        return res.status(400).json({ success: false, message: `Invalid tenant identifier "${incoming}".` });
      }
      if (req.user?.tenant) {
        const userTenantId = String(req.user.tenant._id || req.user.tenant);
        if (String(resolved.tenantId) !== userTenantId) {
          if (req.file) deleteFileFromDisk(`uploads/staffPhotos/${req.file.filename}`);
          return res.status(403).json({ success: false, message: 'Cross-tenant modification prohibited.' });
        }
      }
      staffData.tenant = resolved.tenantId;
    } else {
      delete staffData.tenant; // Do not overwrite existing tenant
    }

    // Sanitize reportingManager in updateStaff
    if (!staffData.reportingManager || staffData.reportingManager === '' || staffData.reportingManager === 'null' || staffData.reportingManager === 'undefined' || !mongoose.Types.ObjectId.isValid(staffData.reportingManager)) {
      staffData.reportingManager = null;
    }

    // Map role string or object to Role ObjectId
    if (staffData.role) {
      if (typeof staffData.role === 'object' && staffData.role._id) {
        staffData.role = staffData.role._id;
      } else if (typeof staffData.role === 'string') {
        const trimmed = staffData.role.trim();
        if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
          delete staffData.role;
        } else if (mongoose.Types.ObjectId.isValid(trimmed)) {
          staffData.role = new mongoose.Types.ObjectId(trimmed);
        } else {
          const Role = require('../models/Role');
          let roleDoc = await Role.findOne({
            $or: [
              { name: trimmed },
              { name: { $regex: new RegExp(`^${trimmed}$`, 'i') } }
            ]
          });
          if (!roleDoc) {
            roleDoc = await Role.create({ name: trimmed, description: `${trimmed} role` });
          }
          staffData.role = roleDoc._id;
        }
      }
    } else {
      delete staffData.role;
    }

    if (staffData.firstName && !staffData.fullName) {
      staffData.fullName = staffData.firstName;
    }

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

    staff = await Staff.findByIdAndUpdate(staff._id, staffData, {
      new: true,
      runValidators: true
    }).populate('role', 'name permissions').populate('reportingManager', 'fullName staffId');

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
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { staffId: req.params.id };

    const staff = await Staff.findOne(query);

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    // Multi-tenant isolation for delete
    if (req.user?.tenant) {
      const userTenantId = String(req.user.tenant._id || req.user.tenant);
      if (staff.tenant && String(staff.tenant._id || staff.tenant) !== userTenantId) {
        return res.status(403).json({ success: false, message: 'Access denied: Cannot delete staff from another tenant.' });
      }
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
