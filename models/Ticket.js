const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Student/Parent/Staff
  category: { type: String, enum: ['IT', 'Transport', 'Academics', 'Hostel', 'Other'], required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'In-Progress', 'Resolved', 'Closed'], default: 'Open' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  attachmentUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
