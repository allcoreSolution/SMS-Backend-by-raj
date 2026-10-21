const mongoose = require('mongoose');

const topicItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, default: 'Syllabus' }, // Syllabus or Additional
  status: { type: String, enum: ['Pending', 'In-Progress', 'Covered', 'Not Covered'], default: 'Pending' }
}, { _id: true });

const lessonPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  teacherName: { type: String, default: 'Teacher' },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass' },
  className: { type: String, default: '' },
  sectionName: { type: String, default: 'Section A' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSubject' },
  subjectName: { type: String, default: '' },
  topic: { type: String },
  subTopics: [{ type: String }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  weekLabel: { type: String },
  periods: { type: Number, default: 4 },
  chapters: [{ type: String }],
  objectives: { type: String, required: true },
  teachingMethods: [{ type: String }],
  teachingAids: [{ type: String }],
  resources: { type: String, default: '' },
  topicsList: [topicItemSchema],
  homework: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Draft', 'Pending HOD', 'Pending Principal', 'Approved', 'Needs Revision', 'Completed', 'Pending', 'In-Progress'], 
    default: 'Draft' 
  },
  reviewNotes: { type: String, default: '' },
  coveragePct: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('LessonPlan', lessonPlanSchema);
