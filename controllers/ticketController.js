const Ticket = require('../models/Ticket');
const fs = require('fs');
const path = require('path');

const deleteFileFromDisk = (relativePath) => {
  if (!relativePath) return;
  const absolutePath = path.join(__dirname, '..', relativePath);
  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== 'ENOENT') console.error(`Failed to delete file: ${absolutePath}`, err);
  });
};

exports.createTicket = async (req, res, next) => {
  try {
    const ticketData = { ...req.body };
    if (req.file) {
      ticketData.attachmentUrl = `uploads/documents/${req.file.filename}`;
    }
    const ticket = await Ticket.create(ticketData);
    res.status(201).json({ success: true, data: ticket });
  } catch (error) { 
    if (req.file) deleteFileFromDisk(`uploads/documents/${req.file.filename}`);
    next(error); 
  }
};

exports.getTickets = async (req, res, next) => {
  try {
    const { status, category, raisedBy } = req.query;
    let query = {};
    if(status) query.status = status;
    if(category) query.category = category;
    if(raisedBy) query.raisedBy = raisedBy;

    const tickets = await Ticket.find(query)
      .populate('raisedBy assignedTo', 'name firstName lastName email role')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) { next(error); }
};

exports.updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;
    let updateFields = {};
    if (status) updateFields.status = status;
    if (assignedTo) updateFields.assignedTo = assignedTo;

    const ticket = await Ticket.findByIdAndUpdate(id, updateFields, { new: true });
    res.status(200).json({ success: true, data: ticket });
  } catch (error) { next(error); }
};

exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    
    if (ticket.attachmentUrl) {
      deleteFileFromDisk(ticket.attachmentUrl);
    }
    
    await ticket.deleteOne();
    res.status(200).json({ success: true, message: 'Ticket deleted successfully' });
  } catch(error) { next(error); }
};
