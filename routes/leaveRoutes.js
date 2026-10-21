const express = require('express');
const router = express.Router();
const { 
  applyLeave, 
  getLeaves, 
  getMyLeaves, 
  updateLeaveStatus, 
  deleteLeave,
  getLeaveTypes,
  createLeaveType,
  deleteLeaveType,
  approveLeave,
  rejectLeave
} = require('../controllers/leaveController');
const { uploadAttachment } = require('../middleware/uploadMiddleware');

// Conditional upload middleware that only invokes Multer if multipart/form-data
const conditionalUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.toLowerCase().includes('multipart/form-data')) {
    return uploadAttachment(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  }
  next();
};

// Base Leave routes
router.get('/', getLeaves);
router.post('/', conditionalUpload, applyLeave);
router.post('/apply', conditionalUpload, applyLeave);
router.get('/my-leaves', getMyLeaves);

// Leave Types
router.get('/types', getLeaveTypes);
router.post('/types', createLeaveType);
router.delete('/types/:id', deleteLeaveType);

// Approval & Status
router.patch('/:id/approve', approveLeave);
router.put('/:id/approve', approveLeave);
router.patch('/:id/reject', rejectLeave);
router.put('/:id/reject', rejectLeave);
router.put('/status/:id', updateLeaveStatus);

// Delete / Withdraw
router.delete('/:id', deleteLeave);

module.exports = router;
