const express = require('express');
const router = express.Router();
const { searchDueFees, searchStudentDueFees } = require('../controllers/searchDueFeesController');
const { protect, checkPermission, checkStudentOrAdmin } = require('../middleware/authMiddleware');

router.use(protect);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (None)
 * @app_access Teacher App (view_students)
 */
router.get('/', checkPermission('manage_finance'), searchDueFees);
router.get('/student/my-dues', checkStudentOrAdmin, searchStudentDueFees);

module.exports = router;
