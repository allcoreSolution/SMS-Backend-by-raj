const express = require('express');
const router = express.Router();
const {
  getDueFees,
  getStudentDues,
  carryForwardDues,
  getDashboardStats,
  getTransactionsLedger
} = require('../controllers/financeReportController');
const { protect, checkPermission, checkStudentOrAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (None)
 * @app_access Teacher App (view_students)
 */
router.get('/due-fees', checkPermission('manage_finance', 'view_students'), getDueFees);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (View own dues)
 * @app_access Teacher App (None)
 */
router.get('/student-dues/:studentId', checkStudentOrAdmin, getStudentDues);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (None)
 * @app_access Teacher App (None)
 */
router.post('/carry-forward', checkPermission('manage_finance'), carryForwardDues);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (None)
 * @app_access Teacher App (None)
 */
router.get('/dashboard', checkPermission('manage_finance'), getDashboardStats);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (None)
 * @app_access Teacher App (None)
 */
router.get('/transactions', checkPermission('manage_finance'), getTransactionsLedger);

module.exports = router;
