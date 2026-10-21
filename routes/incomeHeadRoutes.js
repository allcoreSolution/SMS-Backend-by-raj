const express = require('express');
const router = express.Router();
const {
  getIncomeHeads,
  createIncomeHead,
  updateIncomeHead,
  deleteIncomeHead
} = require('../controllers/incomeHeadController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getIncomeHeads)
  .post(createIncomeHead);

router.route('/:id')
  .put(updateIncomeHead)
  .delete(deleteIncomeHead);

module.exports = router;
