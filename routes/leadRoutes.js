const express = require('express');
const router = express.Router();
const { 
  createLead, 
  getLeads, 
  getLeadStats,
  seedSampleLeads,
  updateLeadStatus, 
  convertLeadToStudent,
  deleteLead 
} = require('../controllers/leadController');

router.get('/stats', getLeadStats);
router.post('/seed', seedSampleLeads);
router.post('/', createLead);
router.get('/', getLeads);
router.put('/:id', updateLeadStatus);
router.patch('/:id', updateLeadStatus);
router.post('/:id/convert', convertLeadToStudent);
router.delete('/:id', deleteLead);

module.exports = router;

