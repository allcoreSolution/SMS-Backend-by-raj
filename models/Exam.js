const mongoose = require('mongoose');

// ======================== EXAM SCHEMA ========================
const examSchema = new mongoose.Schema({
  examName: { type: String, trim: true }, // e.g. "Term 1 Examination", "Annual Board Exam"
  name: { type: String, trim: true }, // alias for examName
  examType: { type: String, default: 'Term Exam' }, // e.g. "Term Exam", "Unit Test", "Half-Yearly", "Annual"
  session: { type: String, default: '2026-2027' },
  appliesTo: { type: String, default: 'All Classes' },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass' },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Draft', 'Scheduled', 'Ongoing', 'Completed', 'Published'], 
    default: 'Scheduled' 
  },
  publishResults: { type: Boolean, default: false }
}, { timestamps: true });

examSchema.pre('save', function() {
  if (!this.examName && this.name) this.examName = this.name;
  if (!this.name && this.examName) this.name = this.examName;
});

// ======================== EXAM SCHEDULE (DATESHEET) ========================
const examScheduleSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSubject', required: true },
  examDate: { type: Date, required: true },
  startTime: { type: String, default: '09:30 AM' },
  endTime: { type: String, default: '12:30 PM' },
  roomNo: { type: String, default: 'Hall 1' },
  maxMarks: { type: Number, default: 100 },
  passMarks: { type: Number, default: 33 }
}, { timestamps: true });

// ======================== EXAM RESULT (MARKS) ========================
const examResultSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSubject', required: true },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass' },
  academicSection: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSection' },
  marksObtained: { type: Number, required: true },
  maxMarks: { type: Number, default: 100 },
  grade: { type: String, default: 'A' },
  attendance: { type: String, enum: ['Present', 'Absent', 'Exempt'], default: 'Present' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

// ======================== EXAM TYPE ========================
const examTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  abbreviation: { type: String, required: true, trim: true },
  description: { type: String, default: '' }
}, { timestamps: true });

// ======================== EXAM GRADE ========================
const examGradeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true }, // e.g. "A1", "A2", "B1"
  minPercentage: { type: Number, required: true },
  maxPercentage: { type: Number, required: true },
  gradePoint: { type: Number, default: 10 },
  description: { type: String, default: '' }
}, { timestamps: true });

// ======================== COCURRICULAR AREA ========================
const cocurricularAreaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, default: 'Visual & Performing Arts' },
  description: { type: String, default: '' }
}, { timestamps: true });

// ======================== COCURRICULAR STUDENT GRADE ========================
const cocurricularGradeEntrySchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, default: '' },
  rollNo: { type: String, default: '' },
  admissionNo: { type: String, default: '' },
  className: { type: String, default: '' },
  section: { type: String, default: 'A' },
  grades: { type: Map, of: String, default: {} }, // e.g. { 'Art & Craft': 'A', 'Physical Fitness': 'A+' }
  remarks: { type: String, default: '' }
}, { timestamps: true });

// ======================== MARKSHEET UPLOAD SCHEMA ========================
const marksheetUploadSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, default: '' },
  admissionNo: { type: String, default: '' },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass' },
  className: { type: String, default: '' },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSection' },
  sectionName: { type: String, default: '' },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  examName: { type: String, default: '' },
  docTitle: { type: String, required: true },
  fileName: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  fileSize: { type: String, default: '1.2 MB' },
  uploadedBy: { type: String, default: 'Teacher Faculty' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

// ======================== ADMIT CARD SCHEMA ========================
const admitCardSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  examName: { type: String, default: '' },
  session: { type: String, default: '2026-2027' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String, default: '' },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass' },
  className: { type: String, default: '' },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSection' },
  sectionName: { type: String, default: 'A' },
  rollNo: { type: String, default: '1' },
  admissionNo: { type: String, default: '' },
  admitCardNo: { type: String, default: '' },
  examCenter: { type: String, default: 'Main Examination Block' },
  roomNo: { type: String, default: 'Hall 1' },
  instructions: { 
    type: String, 
    default: '1. Carry this admit card to the examination hall daily.\n2. Arrive 30 minutes before the scheduled time.\n3. Electronic gadgets and smart watches are strictly prohibited.' 
  },
  timetable: [{
    date: { type: String, default: '' },
    subject: { type: String, default: '' },
    subjectCode: { type: String, default: '' },
    time: { type: String, default: '09:30 AM - 12:30 PM' },
    room: { type: String, default: 'Hall 1' }
  }],
  status: { type: String, enum: ['Generated', 'Issued', 'Blocked'], default: 'Generated' }
}, { timestamps: true });

const Exam = mongoose.model('Exam', examSchema);
const ExamSchedule = mongoose.model('ExamSchedule', examScheduleSchema);
const ExamResult = mongoose.model('ExamResult', examResultSchema);
const ExamType = mongoose.model('ExamType', examTypeSchema);
const ExamGrade = mongoose.model('ExamGrade', examGradeSchema);
const CocurricularArea = mongoose.model('CocurricularArea', cocurricularAreaSchema);
const CocurricularGradeEntry = mongoose.model('CocurricularGradeEntry', cocurricularGradeEntrySchema);
const MarksheetUpload = mongoose.model('MarksheetUpload', marksheetUploadSchema);
const AdmitCard = mongoose.model('AdmitCard', admitCardSchema);

module.exports = { 
  Exam, 
  ExamSchedule, 
  ExamResult, 
  ExamType, 
  ExamGrade, 
  CocurricularArea,
  CocurricularGradeEntry,
  MarksheetUpload,
  AdmitCard
};
