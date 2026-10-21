const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ticketCode: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    default: 'Technical Issue' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Normal', 'Medium', 'High', 'Urgent', 'Critical'], 
    default: 'Normal' 
  },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'], 
    default: 'Open' 
  },
  schoolId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant', 
    required: false 
  },
  schoolName: { 
    type: String, 
    default: 'Apex International Academy' 
  },
  contactName: {
    type: String,
    default: 'School Administrator'
  },
  contactEmail: { 
    type: String, 
    default: 'admin@apexinstitute.edu.in' 
  },
  contactPhone: { 
    type: String, 
    default: '+91 98765 43210' 
  },
  attachmentUrl: { 
    type: String 
  },
  attachments: [{
    name: { type: String },
    url: { type: String },
    size: { type: String }
  }],
  assignedAgent: {
    name: { type: String, default: 'Priya Sharma' },
    role: { type: String, default: 'Senior Support Lead' },
    avatar: { type: String, default: '' }
  },
  replies: [{
    sender: { type: String, required: true },
    senderRole: { type: String, default: 'Client' },
    senderAvatar: { type: String },
    message: { type: String, required: true },
    attachmentUrl: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Pre-save hook to generate ticketCode if not provided
supportTicketSchema.pre('save', function() {
  if (!this.ticketCode) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.ticketCode = `TKT-${randomNum}`;
  }
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
