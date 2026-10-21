const mongoose = require('mongoose');

const academicSectionSchema = new mongoose.Schema({
  sectionName: {
    type: String, // e.g., "A", "B", "Rose", "Blue"
    required: true,
    trim: true,
    unique: true
  },
  capacity: {
    type: Number,
    default: 40 // Default student capacity per section
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

const AcademicSection = mongoose.models.AcademicSection || mongoose.model('AcademicSection', academicSectionSchema);
if (!mongoose.models.Section) {
  mongoose.model('Section', academicSectionSchema);
}

module.exports = AcademicSection;
