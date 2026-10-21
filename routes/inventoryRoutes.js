const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.post('/vendors', inventoryController.addVendor);
router.post('/items', inventoryController.addItem);
router.post('/issue', inventoryController.issueItem);

module.exports = router;