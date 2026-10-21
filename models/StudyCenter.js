const mongoose = require('mongoose');

// 1. Syllabus Unit & Topics Schema
const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In-Progress', 'Covered'], default: 'Pending' },
  completedDate: { type: Date }
}, { _id: true });

const syllabusUnitSchema = new mongoose.Schema({
  unitNumber: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  className: { type: String, required: true, default: 'Class X' },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass' },
  subjectName: { type: String, required: true, default: 'Mathematics' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSubject' },
  topics: [topicSchema],
  periodsEstimated: { type: Number, default: 8 },
  periodsTaken: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'In-Progress', 'Completed'], default: 'In-Progress' },
  completionPct: { type: Number, default: 0 },
  learningObjectives: { type: String, default: '' },
  referenceBooks: { type: String, default: '' }
}, { timestamps: true });

// 2. Daily Classwork & Teacher Logbook Schema
const classworkLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['Classwork', 'Logbook', 'Assignment'], default: 'Classwork' },
  className: { type: String, required: true, default: 'Class X' },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass' },
  sectionName: { type: String, default: 'Section A' },
  subjectName: { type: String, required: true, default: 'Mathematics' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSubject' },
  period: { type: Number, default: 1 },
  teacherName: { type: String, required: true, default: 'Faculty' },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  topicTaught: { type: String, required: true },
  classworkSummary: { type: String, required: true },
  homeworkAssigned: { type: String, default: '' },
  attendanceCount: { type: Number, default: 35 },
  totalStudents: { type: Number, default: 40 },
  attachments: [{ type: String }]
}, { timestamps: true });

// 3. Learning Resources / Study Material Schema
const studyResourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  className: { type: String, required: true, default: 'Class X' },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass' },
  subjectName: { type: String, required: true, default: 'Mathematics' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSubject' },
  materialType: { 
    type: String, 
    enum: ['PDF', 'Video', 'Doc', 'E-Book', 'Audio', 'Link'], 
    default: 'PDF' 
  },
  fileUrl: { type: String, required: true },
  fileSize: { type: String, default: '1.5 MB' },
  authorTeacher: { type: String, default: 'Academic Faculty' },
  downloadsCount: { type: Number, default: 0 },
  tags: [{ type: String }]
}, { timestamps: true });

// 4. Homework & Assignments Schema
const studentSubmissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, required: true },
  rollNumber: { type: String, default: '' },
  submissionDate: { type: Date, default: Date.now },
  marksObtained: { type: Number, default: null },
  remarks: { type: String, default: '' },
  status: { type: String, enum: ['Submitted', 'Evaluated', 'Pending'], default: 'Submitted' }
}, { _id: true });

const homeworkAssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  className: { type: String, required: true, default: 'Class X' },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass' },
  sectionName: { type: String, default: 'Section A' },
  subjectName: { type: String, required: true, default: 'Mathematics' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSubject' },
  teacherName: { type: String, default: 'Faculty' },
  assignDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, default: 20 },
  status: { type: String, enum: ['Active', 'Closed', 'Evaluated'], default: 'Active' },
  fileUrl: { type: String, default: '' },
  submissions: [studentSubmissionSchema],
  submissionCount: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 40 }
}, { timestamps: true });

const SyllabusUnit = mongoose.model('SyllabusUnit', syllabusUnitSchema);
const ClassworkLog = mongoose.model('ClassworkLog', classworkLogSchema);
const StudyResource = mongoose.model('StudyResource', studyResourceSchema);
const HomeworkAssignment = mongoose.model('HomeworkAssignment', homeworkAssignmentSchema);

module.exports = {
  SyllabusUnit,
  ClassworkLog,
  StudyResource,
  HomeworkAssignment
};
