const express = require('express');
const router = express.Router();
const {
  createFeeType,
  getFeeTypes,
  getFeeTypeById,
  updateFeeType,
  deleteFeeType
} = require('../controllers/feeTypeController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.use(protect);
router.use(checkPermission('manage_finance'));

router.route('/')
  .post(createFeeType)
  .get(getFeeTypes);

router.route('/:id')
  .get(getFeeTypeById)
  .put(updateFeeType)
  .patch(updateFeeType)
  .delete(deleteFeeType);

module.exports = router;
