const express = require('express');
const router = express.Router();
const {
  register,
  login,
  createRole,
  getRoles,
} = require('../controllers/authController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (Admin / Roles management)
router.post('/roles', protect, checkPermission('manage_roles'), createRole);
router.get('/roles', protect, checkPermission('view_roles'), getRoles);

module.exports = router;
