const express = require('express');
const router = express.Router();
const commsWalletController = require('../controllers/commsWalletController');

// Summary & Quotas
router.get('/summary', commsWalletController.getWalletSummary);

// Transactions List
router.get('/transactions', commsWalletController.getTransactions);

// Recharge Wallet (Top-up)
router.post('/topup', commsWalletController.topupWallet);

// Update Wallet Alert Settings
router.put('/settings', commsWalletController.updateSettings);

// Deduct Usage (Debit)
router.post('/debit', commsWalletController.simulateDebit);

module.exports = router;
