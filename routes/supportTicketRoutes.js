const express = require('express');
const router = express.Router();
const { 
  getTickets, 
  getTicketById, 
  createTicket, 
  addReply, 
  updateTicketStatus, 
  seedSupportTickets,
  deleteTicket 
} = require('../controllers/supportTicketController');

router.get('/', getTickets);
router.post('/seed', seedSupportTickets);
router.get('/:id', getTicketById);
router.post('/', createTicket);
router.post('/:id/replies', addReply);
router.patch('/:id/status', updateTicketStatus);
router.delete('/:id', deleteTicket);

module.exports = router;
