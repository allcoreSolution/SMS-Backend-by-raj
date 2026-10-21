const express = require('express');
const router = express.Router();
const {
  generateChallan,
  getFeeChallans,
  getFeeChallansByStudent,
  getFeeChallanByNo,
  updateChallan,
  markChallanPaid,
  deleteChallan
} = require('../controllers/feeChallanController');
const { protect, checkPermission, checkStudentOrAdmin } = require('../middleware/authMiddleware');
const FeeChallan = require('../models/FeeChallan');

// Custom helper to verify if student owns the challan they want to view
const checkChallanOwnerOrAdmin = async (req, res, next) => {
  const roleName = req.user?.role?.name || req.user?.role || '';
  if (roleName === 'Admin' || roleName === 'SuperAdmin') return next();
  if (roleName === 'Teacher' && req.user.role?.permissions?.includes('view_students')) return next();
  
  try {
    const idOrNo = req.params.challanNo;
    const isObjectId = idOrNo && idOrNo.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId 
      ? { $or: [{ _id: idOrNo }, { challanNo: idOrNo }] }
      : { challanNo: idOrNo };

    const challan = await FeeChallan.findOne(query).populate('student');
    if (!challan) return res.status(404).json({ success: false, message: 'Challan not found' });
    
    if (roleName === 'Student' && challan.student?.studentEmail === req.user?.email) {
      return next();
    }
    
    return next();
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// All routes require authentication
router.use(protect);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (None)
 * @app_access Teacher App (None)
 */
router.route('/')
  .post(checkPermission('manage_finance'), generateChallan)
  .get(checkPermission('manage_finance'), getFeeChallans);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (None)
 * @app_access Teacher App (None)
 */
router.route('/:id')
  .put(checkPermission('manage_finance'), updateChallan)
  .delete(checkPermission('manage_finance'), deleteChallan);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (None)
 * @app_access Teacher App (None)
 */
router.patch('/:challanNo/pay', checkPermission('manage_finance'), markChallanPaid);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (View own challans)
 * @app_access Teacher App (None)
 */
router.get('/student/:studentId', checkStudentOrAdmin, getFeeChallansByStudent);

/**
 * @app_access Admin App (manage_finance)
 * @app_access Student App (View own challan details)
 * @app_access Teacher App (None)
 */
router.get('/:challanNo', checkChallanOwnerOrAdmin, getFeeChallanByNo);

module.exports = router;
