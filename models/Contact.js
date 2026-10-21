const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['Staff', 'Teacher', 'Parent', 'Student', 'Emergency', 'Administration', 'Vendor', 'Other'], 
    default: 'Parent' 
  },
  role: { type: String, default: 'Contact' },
  email: { type: String, trim: true },
  notes: { type: String },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
  isFavorite: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
