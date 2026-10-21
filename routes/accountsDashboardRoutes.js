const express = require('express');
const router = express.Router();
const { getAccountsDashboard } = require('../controllers/accountsDashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getAccountsDashboard);

module.exports = router;
