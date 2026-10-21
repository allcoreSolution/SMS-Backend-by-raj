const express = require('express');
const router = express.Router();
const {
  assignFeeToStudent,
  getAssignedFees,
  getAssignedFeeById,
  getAssignedFeesByStudent,
  updateAssignedFee,
  deleteAssignedFee
} = require('../controllers/assignFeeController');
const { protect, checkPermission, checkStudentOrAdmin } = require('../middleware/authMiddleware');

router.use(protect);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (None)
 * @app_access Teacher App (None)
 */
router.route('/')
  .post(checkPermission('manage_finance'), assignFeeToStudent)
  .get(checkPermission('manage_finance'), getAssignedFees);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (None)
 * @app_access Teacher App (None)
 */
router.route('/:id')
  .get(checkPermission('manage_finance'), getAssignedFeeById)
  .put(checkPermission('manage_finance'), updateAssignedFee)
  .patch(checkPermission('manage_finance'), updateAssignedFee)
  .delete(checkPermission('manage_finance'), deleteAssignedFee);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (View own assigned fees)
 * @app_access Teacher App (None)
 */
router.get('/student/:studentId', checkStudentOrAdmin, getAssignedFeesByStudent);

module.exports = router;
