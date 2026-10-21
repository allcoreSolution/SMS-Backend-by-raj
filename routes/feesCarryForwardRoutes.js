const express = require('express');
const router = express.Router();
const { carryForwardDues, getCarryForwardRecords } = require('../controllers/feesCarryForwardController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.use(protect);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (None)
 * @app_access Teacher App (None)
 */
router.get('/', checkPermission('manage_finance'), getCarryForwardRecords);
router.post('/', checkPermission('manage_finance'), carryForwardDues);

module.exports = router;

