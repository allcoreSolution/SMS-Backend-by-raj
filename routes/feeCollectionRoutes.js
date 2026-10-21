const express = require('express');
const router = express.Router();
const {
  collectFee,
  getFeeReceipts,
  getFeeReceiptById,
  updateFeeReceipt,
  deleteFeeReceipt,
  getMyFeeReceipts
} = require('../controllers/feeCollectionController');
const { protect, checkPermission, checkStudentOrAdmin } = require('../middleware/authMiddleware');
const FeeCollection = require('../models/FeeCollection');

// Custom helper to verify if student owns the receipt
const checkReceiptOwnerOrAdmin = async (req, res, next) => {
  if (req.user.role.name === 'Admin') return next();
  if (req.user.role.name === 'Teacher' && req.user.role.permissions.includes('view_students')) return next();

  try {
    const receipt = await FeeCollection.findById(req.params.id).populate('student');
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });

    if (req.user.role.name === 'Student' && receipt.student.studentEmail === req.user.email) {
      return next();
    }

    return res.status(403).json({ success: false, message: 'Forbidden: You do not own this receipt' });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

router.use(protect);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (None)
 * @app_access Teacher App (None)
 */
router.route('/')
  .post(checkPermission('manage_finance'), collectFee)
  .get(checkPermission('manage_finance'), getFeeReceipts);

// Student fetching their own receipts
router.get('/student/my-receipts', checkStudentOrAdmin, getMyFeeReceipts);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (View own receipt details)
 * @app_access Teacher App (None)
 */
router.route('/:id')
  .get(checkReceiptOwnerOrAdmin, getFeeReceiptById)
  .put(checkPermission('manage_finance'), updateFeeReceipt)
  .patch(checkPermission('manage_finance'), updateFeeReceipt)
  .delete(checkPermission('manage_finance'), deleteFeeReceipt);

module.exports = router;
