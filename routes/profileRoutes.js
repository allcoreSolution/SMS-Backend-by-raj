const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  updatePreferences,
  clearActivityLog
} = require('../controllers/profileController');

// All profile operations require authentication
router.use(protect);

router.route('/me')
  .get(getProfile)
  .put(updateProfile);

router.route('/avatar')
  .post(uploadAvatar)
  .delete(deleteAvatar);

router.put('/password', changePassword);
router.put('/preferences', updatePreferences);
router.delete('/activity', clearActivityLog);

module.exports = router;
