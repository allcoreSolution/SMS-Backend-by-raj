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
  refreshToken,
  logout,
  getActiveDriversList
} = require('../controllers/authController');
const { verifyQR } = require('../controllers/driverController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/drivers', getActiveDriversList);
router.get('/verify-qr', verifyQR);
router.post('/verify-qr', verifyQR);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Roles management
router.post('/roles', createRole);
router.get('/roles', getRoles);

module.exports = router;
