const express = require('express');
const router = express.Router();
const {
  createStaff,
  getStaffs,
  getStaffById,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController');
const { uploadStaffPhoto } = require('../middleware/uploadMiddleware');
const { optionalProtect } = require('../middleware/authMiddleware');

// Attach optionalProtect so token/user context is available when provided
router.use(optionalProtect);

// Staff CRUD operations
router.route('/')
  .post(uploadStaffPhoto, createStaff)
  .get(getStaffs);

router.route('/:id')
  .get(getStaffById)
  .put(uploadStaffPhoto, updateStaff)
  .patch(uploadStaffPhoto, updateStaff)
  .delete(deleteStaff);

module.exports = router;
