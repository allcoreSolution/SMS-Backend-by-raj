const express = require('express');
const router = express.Router();
const { createTicket, getTickets, updateTicketStatus, deleteTicket } = require('../controllers/ticketController');
const { uploadAttachment } = require('../middleware/uploadMiddleware');

router.post('/', uploadAttachment, createTicket);
router.get('/', getTickets);
router.put('/:id', updateTicketStatus);
router.delete('/:id', deleteTicket);

module.exports = router;
