const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSubject' },
  materialType: { type: String, enum: ['PDF', 'Video', 'Audio', 'Doc'], required: true },
  fileUrl: { type: String, required: true }, // AWS S3 link or local path
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
