const LessonPlan = require('../models/LessonPlan');

exports.createPlan = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.title) {
      data.title = `${data.subjectName || 'Lesson Plan'} — ${data.className || 'General'}`;
    }
    if (!data.startDate) data.startDate = new Date();
    if (!data.endDate) {
      const end = new Date(data.startDate);
      end.setDate(end.getDate() + 6);
      data.endDate = end;
    }
    if (!data.objectives) {
      data.objectives = 'Demonstrate foundational comprehension of the core curriculum syllabus.';
    }

    const plan = await LessonPlan.create(data);
    res.status(201).json({ success: true, data: plan });
  } catch (error) { next(error); }
};

exports.getPlans = async (req, res, next) => {
  try {
    const { teacherId, classId, subjectId, status, className, search } = req.query;
    let query = {};
    if (teacherId) query.teacher = teacherId;
    if (classId) query.academicClass = classId;
    if (subjectId) query.subject = subjectId;
    if (status && status !== 'All' && status !== 'All statuses') query.status = status;
    if (className && className !== 'All' && className !== 'All classes') query.className = className;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { teacherName: { $regex: search, $options: 'i' } },
        { subjectName: { $regex: search, $options: 'i' } }
      ];
    }

    const plans = await LessonPlan.find(query)
      .populate('subject', 'subjectName code')
      .populate('teacher', 'firstName lastName')
      .sort({ startDate: -1 });
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) { next(error); }
};

exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await LessonPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.status(200).json({ success: true, data: plan });
  } catch (error) { next(error); }
};

exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await LessonPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.status(200).json({ success: true, message: 'Lesson Plan deleted successfully' });
  } catch (error) { next(error); }
};

