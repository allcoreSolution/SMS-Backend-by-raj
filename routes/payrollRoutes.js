const express = require('express');
const router = express.Router();
const { generatePayslip, getPayslips, updatePayslip, deletePayslip } = require('../controllers/payrollController');

router.post('/generate', generatePayslip);
router.get('/', getPayslips);
router.put('/:id', updatePayslip);
router.delete('/:id', deletePayslip);

module.exports = router;
