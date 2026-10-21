const express = require('express');
const router = express.Router();
const { addBranch, getBranches, updateBranch, deleteBranch } = require('../controllers/branchController');

router.post('/', addBranch);
router.get('/', getBranches);
router.put('/:id', updateBranch);
router.delete('/:id', deleteBranch);

module.exports = router;
