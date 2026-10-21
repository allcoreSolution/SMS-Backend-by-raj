const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getComplaintById,
  addComplaint,
  updateComplaint,
  deleteComplaint
} = require('../controllers/frontOfficeController');

router.get('/', getComplaints);
router.post('/', addComplaint);
router.get('/:id', getComplaintById);
router.put('/:id', updateComplaint);
router.patch('/:id', updateComplaint);
router.delete('/:id', deleteComplaint);

module.exports = router;
