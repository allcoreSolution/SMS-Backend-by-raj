const mongoose = require('mongoose');

// ======================== QUESTION SCHEMA ========================
const questionSchema = new mongoose.Schema({
  text: { type: String, default: '' },
  question: { type: String, default: '' }, // alias for text
  questionType: { 
    type: String, 
    enum: [
      'Multiple Choice - Single Answer', 
      'Multiple Choice - Multiple Answers', 
      'True / False', 
      'Short Answer', 
      'Fill in the Blanks',
      'MCQ',
      'Subjective',
      'True/False'
    ], 
    default: 'MCQ' 
  },
  options: [{ type: String }],
  correctOptionIndex: { type: Number, default: 0 },
  answer: { type: String, default: '' },
  marks: { type: Number, default: 1 },
  difficultyLevel: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass' },
  className: { type: String, default: '' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSubject' },
  subjectName: { type: String, default: '' },
  chapter: { type: String, default: '' },
  topic: { type: String, default: '' },
  explanation: { type: String, default: '' },
  status: { type: String, enum: ['Published', 'Draft'], default: 'Published' },
  usedCount: { type: Number, default: 0 }
}, { timestamps: true });

// Pre-save hook to ensure text/question, difficulty/difficultyLevel consistency
questionSchema.pre('save', function() {
  if (!this.text && this.question) this.text = this.question;
  if (!this.question && this.text) this.question = this.text;
  if (this.difficulty && !this.difficultyLevel) this.difficultyLevel = this.difficulty;
  if (this.difficultyLevel && !this.difficulty) this.difficulty = this.difficultyLevel;
});

// ======================== CHAPTER & TOPIC SCHEMA ========================
const chapterTopicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['chapter', 'topic', 'subtopic'], default: 'chapter' },
  subject: { type: String, required: true },
  academicClass: { type: String, default: '' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChapterTopic', default: null },
  questionsCount: { type: Number, default: 0 }
}, { timestamps: true });

// ======================== ONLINE EXAM SCHEMA ========================
const onlineExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  examType: { 
    type: String, 
    enum: ['Quiz', 'Term Test', 'Competitive Mock', 'Practice Assessment', 'General'], 
    default: 'Term Test' 
  },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass' },
  className: { type: String, default: 'All Classes' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSubject' },
  subjectName: { type: String, default: 'General' },
  questions: [questionSchema],
  durationMinutes: { type: Number, default: 60 },
  duration: { type: String, default: '60 min' },
  totalMarks: { type: Number, default: 50 },
  passingMarks: { type: Number, default: 20 },
  date: { type: String, default: '' },
  time: { type: String, default: '' },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  status: { type: String, enum: ['Live', 'Scheduled', 'Upcoming', 'Completed', 'Draft'], default: 'Live' },
  instructions: { type: String, default: 'Read all questions carefully. Time will automatically submit.' },
  isActive: { type: Boolean, default: true },
  autoPublishResults: { type: Boolean, default: true },
  shuffleQ: { type: Boolean, default: true },
  showResult: { type: Boolean, default: true },
  negativeMarking: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
  maxStudents: { type: Number, default: 30 }
}, { timestamps: true });

// Pre-save hook for onlineExam
onlineExamSchema.pre('save', function() {
  if (this.durationMinutes && !this.duration) {
    this.duration = `${this.durationMinutes} min`;
  }
});

// ======================== ONLINE EXAM RESULT SCHEMA ========================
const onlineExamResultSchema = new mongoose.Schema({
  onlineExam: { type: mongoose.Schema.Types.ObjectId, ref: 'OnlineExam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, default: '' },
  rollNo: { type: String, default: '' },
  className: { type: String, default: '' },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number, default: 0 },
  grade: { type: String, default: 'A' },
  status: { type: String, enum: ['Passed', 'Failed', 'Pass', 'Fail'], default: 'Passed' },
  photo: { type: String, default: '' },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId },
    questionText: { type: String },
    selectedOptionIndex: { type: Number },
    isCorrect: { type: Boolean }
  }],
  timeTakenMinutes: { type: Number, default: 30 },
  time: { type: String, default: '30 min' }
}, { timestamps: true });

const OnlineQuestion = mongoose.model('OnlineQuestion', questionSchema);
const ChapterTopic = mongoose.model('ChapterTopic', chapterTopicSchema);
const OnlineExam = mongoose.model('OnlineExam', onlineExamSchema);
const OnlineExamResult = mongoose.model('OnlineExamResult', onlineExamResultSchema);

module.exports = { 
  OnlineQuestion, 
  ChapterTopic, 
  OnlineExam, 
  OnlineExamResult 
};
