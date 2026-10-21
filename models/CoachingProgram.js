const mongoose = require('mongoose');

const coachingProgramSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ['Competitive Exams', 'STEM & Robotics', 'Language & Arts', 'Sports & Fitness', 'Academic Foundation'], 
    default: 'Competitive Exams' 
  },
  description: { type: String, required: true },
  targetClasses: { type: String, default: 'Class I - X' },
  instructor: {
    name: { type: String, required: true },
    designation: { type: String, default: 'Senior Mentor' },
    avatar: { type: String, default: '' }
  },
  schedule: { type: String, required: true }, // e.g. 'Tue, Thu, Sat • 04:30 PM - 06:00 PM'
  timing: { type: String, default: '04:30 PM - 06:00 PM' },
  mode: { type: String, enum: ['Campus Offline', 'Online Live', 'Hybrid'], default: 'Campus Offline' },
  venue: { type: String, default: 'Main Science & Innovation Block' },
  fees: { type: String, default: 'Included in Curriculum' },
  capacity: { type: Number, default: 35 },
  rating: { type: Number, default: 4.8 },
  features: [{ type: String }],
  enrolledStudents: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    studentName: { type: String },
    enrolledAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Active', 'Completed', 'Withdrawn'], default: 'Active' }
  }],
  status: { type: String, enum: ['Open for Enrollment', 'Ongoing', 'Completed'], default: 'Open for Enrollment' }
}, { timestamps: true });

module.exports = mongoose.model('CoachingProgram', coachingProgramSchema);
