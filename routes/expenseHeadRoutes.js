const express = require('express');
const router = express.Router();
const {
  getExpenseHeads,
  createExpenseHead,
  updateExpenseHead,
  deleteExpenseHead
} = require('../controllers/expenseHeadController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getExpenseHeads)
  .post(createExpenseHead);

router.route('/:id')
  .put(updateExpenseHead)
  .delete(deleteExpenseHead);

module.exports = router;
