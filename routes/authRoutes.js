const express = require('express');
const router = express.Router();
const {
  register,
  login,
  createRole,
  getRoles,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require('../controllers/authController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Protected routes (Admin / Roles management)
router.post('/roles', protect, checkPermission('manage_roles'), createRole);
router.get('/roles', protect, checkPermission('view_roles'), getRoles);

module.exports = router;
