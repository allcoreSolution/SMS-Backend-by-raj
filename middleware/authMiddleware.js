// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
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
    if (!token || !process.env.JWT_SECRET) {
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

  if (['admin', 'superadmin'].includes(role) || permissions.includes('all') ||
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

module.exports = { protect, checkPermission, checkStudentOrAdmin };
