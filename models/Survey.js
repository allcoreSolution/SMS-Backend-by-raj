const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: { type: String },
  questionText: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Single choice', 'Multiple choice', 'Short text', 'Long text', 'Rating'], 
    default: 'Single choice' 
  },
  options: [{ type: String }],
  required: { type: Boolean, default: false }
}, { _id: false });

const surveySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  kind: { 
    type: String, 
    enum: ['Survey', 'Poll', 'Feedback form', 'Feedback Form'], 
    default: 'Survey' 
  },
  status: { 
    type: String, 
    enum: ['Draft', 'Published', 'Closed'], 
    default: 'Draft' 
  },
  targetAudience: { type: String, default: 'All' },
  targetRoles: [{ type: String }],
  whoCanRespond: { type: String, default: 'Internal (app / panel users)' },
  allowAnonymous: { type: Boolean, default: true },
  closesAt: { type: Date },
  expiresAt: { type: Date },
  questions: [questionSchema],
  responsesCount: { type: Number, default: 0 },
  responseRate: { type: Number, default: 0 },
  createdBy: { type: String, default: 'School Administrator' },
  tenantId: { type: String }
}, { timestamps: true });

const surveyResponseSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true, index: true },
  respondentName: { type: String, default: 'Anonymous' },
  respondentRole: { type: String, default: 'Parent' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: [{
    questionId: { type: String },
    questionText: { type: String },
    selectedOption: { type: String },
    selectedOptions: [{ type: String }],
    textAnswer: { type: String },
    rating: { type: Number }
  }]
}, { timestamps: true });

const feedbackSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
  surveyTitle: { type: String, default: 'Direct Parent / Student Feedback' },
  category: { 
    type: String, 
    enum: ['Transport', 'Canteen', 'Academic', 'Infrastructure', 'General', 'Library', 'Sports'], 
    default: 'General' 
  },
  priority: { 
    type: String, 
    enum: ['Urgent', 'High', 'Medium', 'Low'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['New', 'In progress', 'Actioned', 'Resolved', 'Dismissed'], 
    default: 'New' 
  },
  owner: { type: String, default: 'Unassigned' },
  submittedBy: { type: String, default: 'Parent' },
  details: { type: String, default: '' },
  resolutionNotes: { type: String, default: '' },
  flaggedDate: { type: Date, default: Date.now }
}, { timestamps: true });

const Survey = mongoose.model('Survey', surveySchema);
const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = { Survey, SurveyResponse, Feedback };
