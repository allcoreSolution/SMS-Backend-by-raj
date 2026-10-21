const express = require('express');
const router = express.Router();
const { getDueSlipHistory, deleteDueSlipBatch } = require('../controllers/dueSlipHistoryController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.use(protect);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (None)
 * @app_access Teacher App (None)
 */
router.get('/', checkPermission('manage_finance'), getDueSlipHistory);
router.delete('/:id', checkPermission('manage_finance'), deleteDueSlipBatch);

module.exports = router;
