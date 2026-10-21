const mongoose = require('mongoose');

// Ability Domain Schema for HPC (Awareness, Sensitivity, Creativity)
const abilityDomainSchema = new mongoose.Schema({
  level: { 
    type: String, 
    enum: ['Beginning', 'Developing', 'Proficient', 'Exemplary'], 
    default: 'Developing' 
  },
  scorePercent: { type: Number, default: 75 },
  selfAssessment: { type: String, default: '' },
  peerFeedback: { type: String, default: '' },
  teacherRemarks: { type: String, default: '' },
  descriptors: [{
    name: { type: String },
    rating: { type: Number, default: 3 } // 1 to 5 scale
  }]
}, { _id: false });

// HPC Activity Schema
const hpcActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Observation', 'Project', 'Inquiry', 'Group Discussion', 'Classroom Presentation'], 
    default: 'Project' 
  },
  className: { type: String, required: true },
  section: { type: String, default: 'A' },
  subject: { type: String, default: 'General / Experiential' },
  description: { type: String, default: '' },
  abilityFocus: { 
    type: String, 
    enum: ['Awareness', 'Sensitivity', 'Creativity', 'All Domains'], 
    default: 'All Domains' 
  },
  assessedLearnersCount: { type: Number, default: 0 },
  totalLearnersCount: { type: Number, default: 30 },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
  createdBy: { type: String, default: 'Teacher Admin' }
}, { timestamps: true });

// HPC Progress Card Schema
const hpcProgressCardSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, required: true },
  rollNo: { type: String, default: '01' },
  className: { type: String, required: true },
  section: { type: String, default: 'A' },
  academicYear: { type: String, default: '2026-2027' },
  term: { type: String, default: 'Term 1' },
  templateVersion: { type: String, default: 'HPC Standard v2.0 (Latest)' },
  status: { 
    type: String, 
    enum: ['Draft', 'Pending Evaluation', 'Reviewing Draft', 'Ready to Print', 'Published'], 
    default: 'Pending Evaluation' 
  },
  awareness: { 
    type: abilityDomainSchema, 
    default: () => ({
      level: 'Proficient',
      scorePercent: 80,
      selfAssessment: 'I keep my workspace organized and actively observe science experiments.',
      peerFeedback: 'Always attentive during group lab activities.',
      teacherRemarks: 'Demonstrates acute observation and hygiene habits.',
      descriptors: [
        { name: 'Self-Awareness & Body Posture', rating: 4 },
        { name: 'Observation & Scientific Curiosity', rating: 4 },
        { name: 'Task Focus & Persistence', rating: 4 }
      ]
    })
  },
  sensitivity: { 
    type: abilityDomainSchema, 
    default: () => ({
      level: 'Developing',
      scorePercent: 70,
      selfAssessment: 'I share art supplies with my classmates and listen to others.',
      peerFeedback: 'Helpful and kind to peers.',
      teacherRemarks: 'Shows growing empathy and collaboration in group projects.',
      descriptors: [
        { name: 'Empathy & Peer Kindness', rating: 4 },
        { name: 'Respect for Diversity & Environment', rating: 3 },
        { name: 'Team Collaboration & Sharing', rating: 4 }
      ]
    })
  },
  creativity: { 
    type: abilityDomainSchema, 
    default: () => ({
      level: 'Exemplary',
      scorePercent: 90,
      selfAssessment: 'I love inventing stories and drawing model solutions.',
      peerFeedback: 'Gives the best ideas in chart making.',
      teacherRemarks: 'Exceptional original thinking and problem solving approach.',
      descriptors: [
        { name: 'Original Idea Generation', rating: 5 },
        { name: 'Aesthetic Expression & Craft', rating: 4 },
        { name: 'Problem-Solving Agility', rating: 5 }
      ]
    })
  },
  parentFeedback: { type: String, default: 'Very happy with progress in school activities.' },
  generalTeacherSummary: { type: String, default: 'Bright, inquisitive student flourishing across all holistic domains.' },
  attendancePercentage: { type: Number, default: 94 },
  publishedAt: { type: Date }
}, { timestamps: true });

const HPCActivity = mongoose.model('HPCActivity', hpcActivitySchema);
const HPCProgressCard = mongoose.model('HPCProgressCard', hpcProgressCardSchema);

module.exports = {
  HPCActivity,
  HPCProgressCard
};
