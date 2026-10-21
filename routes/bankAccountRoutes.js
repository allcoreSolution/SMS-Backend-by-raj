const express = require('express');
const router = express.Router();
const {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount
} = require('../controllers/bankAccountController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getBankAccounts)
  .post(createBankAccount);

router.route('/:id')
  .put(updateBankAccount)
  .delete(deleteBankAccount);

module.exports = router;
