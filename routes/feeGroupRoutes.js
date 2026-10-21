const express = require('express');
const router = express.Router();
const {
  createFeeGroup,
  getFeeGroups,
  getFeeGroupById,
  updateFeeGroup,
  deleteFeeGroup
} = require('../controllers/feeGroupController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.use(protect);
router.use(checkPermission('manage_finance'));

router.route('/')
  .post(createFeeGroup)
  .get(getFeeGroups);

router.route('/:id')
  .get(getFeeGroupById)
  .put(updateFeeGroup)
  .patch(updateFeeGroup)
  .delete(deleteFeeGroup);

module.exports = router;
