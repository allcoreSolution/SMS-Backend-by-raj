const express = require('express');
const router = express.Router();
const { 
  addExpense, 
  getExpenses, 
  updateExpense, 
  deleteExpense 
} = require('../controllers/expenseController');
const { uploadAttachment } = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', uploadAttachment, addExpense);
router.get('/', getExpenses);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
