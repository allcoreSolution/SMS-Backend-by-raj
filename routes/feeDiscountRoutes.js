const express = require('express');
const router = express.Router();
const {
  createFeeDiscount,
  getFeeDiscounts,
  getFeeDiscountById,
  updateFeeDiscount,
  deleteFeeDiscount
} = require('../controllers/feeDiscountController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.use(protect);
router.use(checkPermission('manage_finance'));

router.route('/')
  .post(createFeeDiscount)
  .get(getFeeDiscounts);

router.route('/:id')
  .get(getFeeDiscountById)
  .put(updateFeeDiscount)
  .patch(updateFeeDiscount)
  .delete(deleteFeeDiscount);

module.exports = router;
