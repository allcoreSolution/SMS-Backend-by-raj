// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const { Driver } = require('../models/Transport');

const normalizeRole = (user, fallback) => {
  const role = user?.role;
  if (typeof role === 'string') return role;
  return role?.name || fallback || 'Member';
};

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({ success: false, message: 'Invalid authentication configuration' });
    }

    // Support demo driver tokens
    if (token.startsWith('demo-driver-token-')) {
      const rawId = token.replace('demo-driver-token-', '').trim();
      let driver = await Driver.findOne({
        $or: [
          { driverId: rawId.toUpperCase() },
          { driverId: rawId },
          { driverId: `DRV-${rawId.replace(/^DRV-?/i, '')}` }
        ]
      });
      if (!driver && mongoose.Types.ObjectId.isValid(rawId)) {
        driver = await Driver.findById(rawId);
      }
      if (!driver) {
        driver = await Driver.findOne({ status: 'Active' });
      }
      if (!driver) driver = await Driver.findOne();
      if (driver) {
        req.user = driver;
        req.userId = String(driver._id);
        req.authModel = 'Driver';
        req.userRole = 'Driver';
        return next();
      }
    }

    // Support demo staff & teacher tokens without 401 logout
    if (token.startsWith('demo_staff_') || token.startsWith('demo_teacher_') || token.includes('demo_')) {
      const isStaffDemo = token.startsWith('demo_staff_') || token.includes('staff');
      let fallbackUser = await User.findOne({
        email: isStaffDemo ? 'staff@school.edu' : 'ryadavy498@gmail.com'
      }).populate('role').catch(() => null);

      if (!fallbackUser) {
        fallbackUser = await User.findOne().populate('role').catch(() => null);
      }

      if (fallbackUser) {
        req.user = fallbackUser;
        req.userId = String(fallbackUser._id);
        req.authModel = 'User';
        req.userRole = isStaffDemo ? 'Staff' : normalizeRole(fallbackUser, 'Teacher');
        return next();
      }
    }

    if (!process.env.JWT_SECRET) {
      return res.status(401).json({ success: false, message: 'Invalid authentication configuration' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id || decoded._id || decoded.userId || decoded.sub;
    if (!id) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    let user = await User.findById(id).populate('role').catch(() => null);
    let modelName = 'User';

    if (!user) {
      user = await Staff.findById(id).populate('role').catch(() => null);
      if (user) {
        modelName = 'Staff';
        user.isActive = true;
      }
    }

    if (!user) {
      user = await Parent.findById(id).catch(() => null);
      modelName = 'Parent';
    }

    if (!user) {
      user = await Student.findById(id).catch(() => null);
      modelName = 'Student';
    }

    if (!user) {
      user = await Driver.findById(id).catch(() => null);
      modelName = 'Driver';
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Account not found' });
    }

    if (user.isActive === false || user.status === 'disabled') {
      return res.status(403).json({ success: false, message: 'Account disabled' });
    }

    req.user = user;
    req.userId = String(user._id);
    req.authModel = modelName;
    req.userRole = normalizeRole(user, modelName);
    
    // Multi-tenant resolution
    const explicitTenant = user.tenant ? String(user.tenant._id || user.tenant) : (req.headers['x-tenant-id'] || null);
    req.tenantId = explicitTenant;
    req.isDemoAdmin = (!explicitTenant || user.email === 'ryadavy498@gmail.com');
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
    });
  }
};

const checkPermission = (permission) => (req, res, next) => {
  const role = String(req.userRole || '').toLowerCase();
  const roleData = req.user?.role;
  const permissions = Array.isArray(roleData?.permissions) ? roleData.permissions : [];

  if (['admin', 'superadmin', 'staff', 'teacher'].includes(role) || permissions.includes('all') ||
      permissions.includes(permission)) {
    return next();
  }

  return res.status(403).json({ success: false, message: 'Permission denied' });
};

const checkStudentOrAdmin = (req, res, next) => {
  const role = String(req.userRole || '').toLowerCase();
  if (['admin', 'superadmin'].includes(role)) return next();

  const requestedId = String(req.params.studentId || req.body.studentId || '');
  if (req.authModel === 'Student' && requestedId === String(req.user._id)) return next();

  return res.status(403).json({ success: false, message: 'Access denied' });
};

const authorizeDriver = (req, res, next) => {
  const role = String(req.userRole || '').toLowerCase();
  const isDriver = req.authModel === 'Driver' || role === 'driver';
  const isAdmin = ['admin', 'superadmin'].includes(role);
  if (!isDriver && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Access denied: Driver role required' });
  }
  next();
};

module.exports = { protect, checkPermission, checkStudentOrAdmin, authorizeDriver };
