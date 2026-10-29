const { Survey, SurveyResponse, Feedback } = require('../models/Survey');

// Predefined professional templates
const SURVEY_TEMPLATES = [
  {
    id: 'tmpl-parent-satisfaction',
    title: 'Term 1 Parent Satisfaction & Review',
    description: 'Gather feedback on academic progress, teacher communication, campus safety, and school infrastructure.',
    kind: 'Survey',
    targetAudience: 'Parent',
    targetRoles: ['Parent'],
    questions: [
      {
        id: 'q1',
        questionText: 'How satisfied are you with your child’s academic progress this term?',
        type: 'Rating',
        options: ['1', '2', '3', '4', '5'],
        required: true
      },
      {
        id: 'q2',
        questionText: 'How would you rate the frequency and clarity of school-parent communications?',
        type: 'Single choice',
        options: ['Excellent', 'Good', 'Adequate', 'Needs Improvement'],
        required: true
      },
      {
        id: 'q3',
        questionText: 'Which school facilities do you feel have improved most this academic year?',
        type: 'Multiple choice',
        options: ['Library & Reading Rooms', 'Sports & Grounds', 'Science & Computer Labs', 'Classroom Tech / Smart Boards', 'Canteen & Cleanliness'],
        required: false
      },
      {
        id: 'q4',
        questionText: 'Any specific suggestions or areas where the administration can better support your child?',
        type: 'Long text',
        options: [],
        required: false
      }
    ]
  },
  {
    id: 'tmpl-student-wellbeing',
    title: 'Student Well-being & School Climate Pulse',
    description: 'Quick check-in on student mental health, safety, peer interactions, and extracurricular balance.',
    kind: 'Survey',
    targetAudience: 'Student',
    targetRoles: ['Student'],
    questions: [
      {
        id: 'q1',
        questionText: 'Do you feel supported and encouraged by your teachers at school?',
        type: 'Single choice',
        options: ['Always', 'Most of the time', 'Sometimes', 'Rarely'],
        required: true
      },
      {
        id: 'q2',
        questionText: 'How manageable is your daily homework and study schedule?',
        type: 'Single choice',
        options: ['Very manageable', 'Manageable', 'Somewhat stressful', 'Overwhelming'],
        required: true
      },
      {
        id: 'q3',
        questionText: 'Rate how safe and included you feel in school activities:',
        type: 'Rating',
        options: ['1', '2', '3', '4', '5'],
        required: true
      }
    ]
  },
  {
    id: 'tmpl-transport-audit',
    title: 'School Transport & Bus Safety Audit',
    description: 'Assess bus arrival punctuality, driver behavior, cleanliness, and route convenience.',
    kind: 'Feedback form',
    targetAudience: 'Parent',
    targetRoles: ['Parent', 'Student'],
    questions: [
      {
        id: 'q1',
        questionText: 'Is the morning school bus pickup punctual at your stop?',
        type: 'Single choice',
        options: ['Always on time', 'Delayed 5-10 mins occasionally', 'Frequently delayed'],
        required: true
      },
      {
        id: 'q2',
        questionText: 'Rate the safety and helpfulness of the bus driver & conductor:',
        type: 'Rating',
        options: ['1', '2', '3', '4', '5'],
        required: true
      },
      {
        id: 'q3',
        questionText: 'Share any route or boarding feedback:',
        type: 'Long text',
        options: [],
        required: false
      }
    ]
  },
  {
    id: 'tmpl-teacher-pulse',
    title: 'Teacher Curriculum & Resource Satisfaction',
    description: 'Feedback from academic faculty on teaching resources, lesson planning tools, and admin support.',
    kind: 'Survey',
    targetAudience: 'Teacher',
    targetRoles: ['Teacher', 'Academic Master'],
    questions: [
      {
        id: 'q1',
        questionText: 'Are digital classroom smartboards and lab resources adequate for your syllabus?',
        type: 'Single choice',
        options: ['Fully adequate', 'Mostly adequate', 'Need upgrades', 'Inadequate'],
        required: true
      },
      {
        id: 'q2',
        questionText: 'Rate admin response time for classroom equipment or leave requests:',
        type: 'Rating',
        options: ['1', '2', '3', '4', '5'],
        required: true
      }
    ]
  },
  {
    id: 'tmpl-canteen-poll',
    title: 'Quick Poll: Canteen Healthy Snack Options',
    description: '1-minute community vote on new seasonal menu items.',
    kind: 'Poll',
    targetAudience: 'All',
    targetRoles: ['Student', 'Teacher', 'Parent'],
    questions: [
      {
        id: 'q1',
        questionText: 'Which healthy snack would you most like to see added to the canteen?',
        type: 'Single choice',
        options: ['Fresh Fruit Bowls & Juices', 'Baked Whole-Wheat Rolls', 'Corn & Sprout Chaat', 'Smoothies & Shakes'],
        required: true
      }
    ]
  }
];

// Helper to seed demo data if collection is completely empty
const seedSampleSurveysIfEmpty = async () => {
  return;
  try {
    const count = await Survey.countDocuments();
    if (count === 0) {
      await Survey.create([
        {
          title: 'Parent Satisfaction (Term 1)',
          description: 'Comprehensive quarterly feedback from parents on academics, safety, and activities.',
          kind: 'Survey',
          status: 'Published',
          targetAudience: 'Parent',
          targetRoles: ['Parent'],
          whoCanRespond: 'Internal (app / panel users)',
          closesAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          questions: SURVEY_TEMPLATES[0].questions,
          responsesCount: 142,
          responseRate: 88,
          createdBy: 'School Administrator'
        },
        {
          title: 'Student Digital Learning & AI Tools Pulse',
          description: 'Short poll on smartboard and computer lab usage across classes 8 to 12.',
          kind: 'Poll',
          status: 'Published',
          targetAudience: 'Student',
          targetRoles: ['Student'],
          whoCanRespond: 'Internal (app / panel users)',
          closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          questions: [
            {
              id: 'q1',
              questionText: 'How often do you use digital learning aids in science & maths classes?',
              type: 'Single choice',
              options: ['Every class', '2-3 times a week', 'Once a week', 'Never'],
              required: true
            }
          ],
          responsesCount: 89,
          responseRate: 92,
          createdBy: 'Academic Incharge'
        },
        {
          title: 'Annual Sports Day Event Suggestions',
          description: 'Draft survey to gather game preferences before finalizing sports day schedule.',
          kind: 'Survey',
          status: 'Draft',
          targetAudience: 'All',
          targetRoles: ['Student', 'Teacher', 'Parent'],
          whoCanRespond: 'Public link (anyone)',
          questions: [
            {
              id: 'q1',
              questionText: 'Which track and field events should have parent-teacher friendly relays?',
              type: 'Multiple choice',
              options: ['100m Dash', '4x100m Mixed Relay', 'Tug of War', 'Lemon & Spoon Race', 'Badminton Doubles'],
              required: true
            }
          ],
          responsesCount: 0,
          responseRate: 0,
          createdBy: 'Sports Coordinator'
        }
      ]);
    }

    const fbCount = await Feedback.countDocuments();
    if (fbCount === 0) {
      await Feedback.create([
        {
          title: 'Follow up: Transport delays raised on Route 4',
          surveyTitle: 'Parent Satisfaction (Term 1)',
          category: 'Transport',
          priority: 'High',
          status: 'New',
          owner: 'Transport Manager',
          submittedBy: 'Parent (Class 4-B)',
          details: 'Parent reported morning bus delayed 20 minutes continuously for 3 days.',
          flaggedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Canteen food temperature & freshness concern',
          surveyTitle: 'Parent Satisfaction (Term 1)',
          category: 'Canteen',
          priority: 'Urgent',
          status: 'In progress',
          owner: 'Head of School',
          submittedBy: 'Teacher & Student Council',
          details: 'Food warmers in Block B cafeteria need temperature recalibration.',
          flaggedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Appreciation: Parents praised extended library reading hours',
          surveyTitle: 'Parent Satisfaction (Term 1)',
          category: 'Library',
          priority: 'Low',
          status: 'Actioned',
          owner: 'Librarian',
          submittedBy: 'Parent (Class 10-A)',
          details: 'Commendation for weekend digital catalog borrowing facility.',
          flaggedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      ]);
    }
  } catch (err) {
    console.error('Error auto-seeding sample surveys:', err);
  }
};

// Seed on module boot
// seedSampleSurveysIfEmpty();

// ==============================================================
// SURVEY CONTROLLERS
// ==============================================================

// GET /api/surveys
exports.getSurveys = async (req, res, next) => {
  try {
    const { status, kind, targetAudience, search } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (kind && kind !== 'All') {
      query.kind = new RegExp(kind, 'i');
    }
    if (targetAudience && targetAudience !== 'All') {
      query.targetAudience = targetAudience;
    }
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const surveys = await Survey.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: surveys.length, data: surveys });
  } catch (error) { next(error); }
};

// GET /api/surveys/stats
exports.getSurveyStats = async (req, res, next) => {
  try {
    const totalSurveys = await Survey.countDocuments();
    const publishedSurveys = await Survey.countDocuments({ status: 'Published' });
    const draftSurveys = await Survey.countDocuments({ status: 'Draft' });
    const closedSurveys = await Survey.countDocuments({ status: 'Closed' });

    // Aggregate responses
    const allSurveys = await Survey.find({}, 'responsesCount responseRate');
    const totalResponses = allSurveys.reduce((sum, s) => sum + (s.responsesCount || 0), 0);
    const avgResponseRate = allSurveys.length > 0 
      ? Math.round(allSurveys.reduce((sum, s) => sum + (s.responseRate || 0), 0) / allSurveys.length) 
      : 84;

    const openFeedbacks = await Feedback.countDocuments({ status: { $in: ['New', 'In progress'] } });
    const totalFeedbacks = await Feedback.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalSurveys,
        publishedSurveys,
        draftSurveys,
        closedSurveys,
        totalResponses,
        avgResponseRate: avgResponseRate || 84,
        openFeedbacks,
        totalFeedbacks
      }
    });
  } catch (error) { next(error); }
};

// GET /api/surveys/templates
exports.getTemplates = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, count: SURVEY_TEMPLATES.length, data: SURVEY_TEMPLATES });
  } catch (error) { next(error); }
};

// GET /api/surveys/:id
exports.getSurveyById = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    res.status(200).json({ success: true, data: survey });
  } catch (error) { next(error); }
};

// POST /api/surveys
exports.createSurvey = async (req, res, next) => {
  try {
    const { title, description, kind, status, targetAudience, targetRoles, whoCanRespond, closesAt, questions } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Survey title is required' });
    }

    const newSurvey = await Survey.create({
      title,
      description: description || '',
      kind: kind || 'Survey',
      status: status || 'Published',
      targetAudience: targetAudience || 'All',
      targetRoles: targetRoles || ['All'],
      whoCanRespond: whoCanRespond || 'Internal (app / panel users)',
      closesAt: closesAt ? new Date(closesAt) : null,
      questions: questions || [],
      responsesCount: 0,
      responseRate: 0,
      createdBy: req.body.createdBy || 'School Administrator'
    });

    res.status(201).json({ success: true, message: 'Survey created successfully', data: newSurvey });
  } catch (error) { next(error); }
};

// PUT /api/surveys/:id
exports.updateSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    res.status(200).json({ success: true, message: 'Survey updated successfully', data: survey });
  } catch (error) { next(error); }
};

// PATCH /api/surveys/:id/status
exports.updateSurveyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['Draft', 'Published', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status is required (Draft, Published, Closed)' });
    }
    const survey = await Survey.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    res.status(200).json({ success: true, message: `Survey marked as ${status}`, data: survey });
  } catch (error) { next(error); }
};

// POST /api/surveys/:id/duplicate
exports.duplicateSurvey = async (req, res, next) => {
  try {
    const original = await Survey.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    const duplicated = await Survey.create({
      title: `${original.title} (Copy)`,
      description: original.description,
      kind: original.kind,
      status: 'Draft',
      targetAudience: original.targetAudience,
      targetRoles: original.targetRoles,
      whoCanRespond: original.whoCanRespond,
      closesAt: original.closesAt,
      questions: original.questions,
      responsesCount: 0,
      responseRate: 0,
      createdBy: 'School Administrator'
    });
    res.status(201).json({ success: true, message: 'Survey duplicated as draft', data: duplicated });
  } catch (error) { next(error); }
};

// DELETE /api/surveys/:id
exports.deleteSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findByIdAndDelete(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    // Cascade delete responses and feedback linked to this survey
    await SurveyResponse.deleteMany({ surveyId: req.params.id });
    await Feedback.deleteMany({ surveyId: req.params.id });

    res.status(200).json({ success: true, message: 'Survey and its responses removed successfully' });
  } catch (error) { next(error); }
};

// ==============================================================
// RESPONSE CONTROLLERS
// ==============================================================

// POST /api/surveys/:id/responses or POST /api/surveys/submit
exports.submitResponse = async (req, res, next) => {
  try {
    const surveyId = req.params.id || req.body.surveyId;
    const { answers, respondentName, respondentRole, userId } = req.body;

    if (!surveyId) {
      return res.status(400).json({ success: false, message: 'Survey ID is required' });
    }

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const response = await SurveyResponse.create({
      surveyId,
      respondentName: respondentName || 'Anonymous',
      respondentRole: respondentRole || 'Parent',
      userId: userId || null,
      answers: answers || []
    });

    // Increment responsesCount
    survey.responsesCount = (survey.responsesCount || 0) + 1;
    // Calculate simulated or updated response rate
    survey.responseRate = Math.min(100, Math.round((survey.responsesCount / (survey.responsesCount + 10)) * 100));
    await survey.save();

    res.status(201).json({ success: true, message: 'Response recorded successfully! Thank you.', data: response });
  } catch (error) { next(error); }
};

// GET /api/surveys/:id/responses
exports.getSurveyResponses = async (req, res, next) => {
  try {
    const { id } = req.params;
    const survey = await Survey.findById(id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const responses = await SurveyResponse.find({ surveyId: id }).sort({ createdAt: -1 });

    // Aggregate answers breakdown per question
    const questionAnalytics = (survey.questions || []).map(q => {
      const breakdown = {};
      let totalAnswers = 0;
      let ratingSum = 0;
      let ratingCount = 0;

      responses.forEach(r => {
        const ans = (r.answers || []).find(a => a.questionId === q.id || a.questionText === q.questionText);
        if (ans) {
          totalAnswers++;
          if (ans.selectedOption) {
            breakdown[ans.selectedOption] = (breakdown[ans.selectedOption] || 0) + 1;
          }
          if (Array.isArray(ans.selectedOptions)) {
            ans.selectedOptions.forEach(opt => {
              breakdown[opt] = (breakdown[opt] || 0) + 1;
            });
          }
          if (ans.rating) {
            ratingSum += ans.rating;
            ratingCount++;
          }
        }
      });

      return {
        questionId: q.id,
        questionText: q.questionText,
        type: q.type,
        options: q.options,
        totalAnswers,
        breakdown,
        averageRating: ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : null
      };
    });

    res.status(200).json({
      success: true,
      surveyTitle: survey.title,
      totalResponses: responses.length,
      data: responses,
      analytics: questionAnalytics
    });
  } catch (error) { next(error); }
};

// ==============================================================
// FEEDBACK TRIAGE CONTROLLERS
// ==============================================================

// GET /api/surveys/feedbacks
exports.getFeedbacks = async (req, res, next) => {
  try {
    const { status, priority, category, search } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { details: { $regex: search.trim(), $options: 'i' } },
        { surveyTitle: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const feedbacks = await Feedback.find(query).sort({ flaggedDate: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (error) { next(error); }
};

// POST /api/surveys/feedbacks
exports.createFeedback = async (req, res, next) => {
  try {
    const { title, surveyId, surveyTitle, category, priority, status, owner, submittedBy, details } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Feedback title is required' });
    }

    const newFeedback = await Feedback.create({
      title,
      surveyId: surveyId || null,
      surveyTitle: surveyTitle || 'Direct Feedback Entry',
      category: category || 'General',
      priority: priority || 'Medium',
      status: status || 'New',
      owner: owner || 'Unassigned',
      submittedBy: submittedBy || 'Parent',
      details: details || '',
      flaggedDate: new Date()
    });

    res.status(201).json({ success: true, message: 'Feedback item logged successfully', data: newFeedback });
  } catch (error) { next(error); }
};

// PATCH /api/surveys/feedbacks/:id
exports.updateFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback item not found' });
    }
    res.status(200).json({ success: true, message: 'Feedback updated successfully', data: feedback });
  } catch (error) { next(error); }
};

// DELETE /api/surveys/feedbacks/:id
exports.deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback item not found' });
    }
    res.status(200).json({ success: true, message: 'Feedback item deleted successfully' });
  } catch (error) { next(error); }
};
