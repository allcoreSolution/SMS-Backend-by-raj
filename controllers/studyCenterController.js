const {
  SyllabusUnit,
  ClassworkLog,
  StudyResource,
  HomeworkAssignment
} = require('../models/StudyCenter');
const { LiveClass } = require('../models/LiveClass');

// Helper to auto-seed initial Study Center records if empty
const autoSeedStudyCenterIfEmpty = async () => {
  return;

  // 1. Seed Syllabus Units
  await SyllabusUnit.insertMany([
    {
      unitNumber: 1,
      title: 'Chapter 1: Real Numbers & Fundamental Theorem of Arithmetic',
      className: 'Class X',
      subjectName: 'Mathematics',
      periodsEstimated: 8,
      periodsTaken: 8,
      status: 'Completed',
      completionPct: 100,
      learningObjectives: 'Master Euclid lemma, prime factorisation uniqueness, and proofs of irrationality for √2, √3, √5.',
      topics: [
        { name: 'Introduction to Real Numbers', status: 'Covered', completedDate: new Date('2026-08-05') },
        { name: 'Fundamental Theorem of Arithmetic', status: 'Covered', completedDate: new Date('2026-08-08') },
        { name: 'Revisiting Irrational Numbers', status: 'Covered', completedDate: new Date('2026-08-12') },
        { name: 'Decimal Expansions of Rational Numbers', status: 'Covered', completedDate: new Date('2026-08-15') }
      ]
    },
    {
      unitNumber: 2,
      title: 'Chapter 2: Polynomials & Geometric Meaning of Zeroes',
      className: 'Class X',
      subjectName: 'Mathematics',
      periodsEstimated: 10,
      periodsTaken: 7,
      status: 'In-Progress',
      completionPct: 70,
      learningObjectives: 'Understand algebraic zeroes, parabolic graphs of quadratics, and relationship between zeroes and coefficients.',
      topics: [
        { name: 'Geometrical Meaning of Zeroes', status: 'Covered', completedDate: new Date('2026-08-20') },
        { name: 'Relationship between Zeroes & Coefficients', status: 'Covered', completedDate: new Date('2026-08-25') },
        { name: 'Division Algorithm for Polynomials', status: 'In-Progress' },
        { name: 'Cubic Polynomial Applications', status: 'Pending' }
      ]
    },
    {
      unitNumber: 3,
      title: 'Chapter 3: Pair of Linear Equations in Two Variables',
      className: 'Class X',
      subjectName: 'Mathematics',
      periodsEstimated: 12,
      periodsTaken: 2,
      status: 'In-Progress',
      completionPct: 20,
      learningObjectives: 'Solve simultaneous linear equations using graphical, substitution, elimination, and cross-multiplication methods.',
      topics: [
        { name: 'Graphical Method of Solution', status: 'Covered', completedDate: new Date('2026-09-02') },
        { name: 'Algebraic Substitution Method', status: 'In-Progress' },
        { name: 'Elimination Method', status: 'Pending' },
        { name: 'Cross-Multiplication Method', status: 'Pending' },
        { name: 'Word Problems & Practical Modeling', status: 'Pending' }
      ]
    },
    {
      unitNumber: 1,
      title: 'Unit 1: Chemical Reactions & Equations',
      className: 'Class X',
      subjectName: 'Science',
      periodsEstimated: 9,
      periodsTaken: 9,
      status: 'Completed',
      completionPct: 100,
      learningObjectives: 'Balance chemical equations, identify exothermic/endothermic, redox, corrosion, and rancidity phenomena.',
      topics: [
        { name: 'Balancing Chemical Equations', status: 'Covered', completedDate: new Date('2026-08-07') },
        { name: 'Types of Chemical Reactions', status: 'Covered', completedDate: new Date('2026-08-14') },
        { name: 'Corrosion and Rancidity Prevention', status: 'Covered', completedDate: new Date('2026-08-21') }
      ]
    },
    {
      unitNumber: 2,
      title: 'Unit 2: Life Processes — Nutrition, Respiration & Transport',
      className: 'Class X',
      subjectName: 'Science',
      periodsEstimated: 14,
      periodsTaken: 9,
      status: 'In-Progress',
      completionPct: 65,
      learningObjectives: 'Comprehensive understanding of autotrophic/heterotrophic nutrition, aerobic respiration, human heart circulation, and nephron excretion.',
      topics: [
        { name: 'Autotrophic & Heterotrophic Nutrition', status: 'Covered', completedDate: new Date('2026-08-28') },
        { name: 'Respiration & ATP Generation', status: 'Covered', completedDate: new Date('2026-09-04') },
        { name: 'Transportation in Humans & Plants', status: 'In-Progress' },
        { name: 'Excretion & Kidney Nephron Mechanics', status: 'Pending' }
      ]
    },
    {
      unitNumber: 1,
      title: 'Prose Chapter 1: The Last Lesson by Alphonse Daudet',
      className: 'Class XII',
      subjectName: 'English',
      periodsEstimated: 6,
      periodsTaken: 6,
      status: 'Completed',
      completionPct: 100,
      learningObjectives: 'Analyze themes of linguistic chauvinism, patriotic identity, character study of M. Hamel and little Franz.',
      topics: [
        { name: 'Historical Context: Franco-Prussian War', status: 'Covered', completedDate: new Date('2026-08-10') },
        { name: 'Textual Reading & Vocabulary Analysis', status: 'Covered', completedDate: new Date('2026-08-14') },
        { name: 'Character Sketch: M. Hamel', status: 'Covered', completedDate: new Date('2026-08-18') },
        { name: 'Long Answer Question Practice', status: 'Covered', completedDate: new Date('2026-08-22') }
      ]
    }
  ]);

  // 2. Seed Classwork Logs
  await ClassworkLog.insertMany([
    {
      date: new Date(),
      className: 'Class X',
      sectionName: 'Section A',
      subjectName: 'Mathematics',
      period: 2,
      teacherName: 'Amit Sharma',
      topicTaught: 'Elimination Method for Linear Equations',
      classworkSummary: 'Solved NCERT Exercise 3.4 Q1 (i, ii, iii) on board. Guided students on equating coefficients before addition/subtraction.',
      homeworkAssigned: 'Complete Exercise 3.4 Q2 word problems (items 1 to 3) in fair copy.',
      attendanceCount: 38,
      totalStudents: 42
    },
    {
      date: new Date(),
      className: 'Class X',
      sectionName: 'Section B',
      subjectName: 'Science',
      period: 3,
      teacherName: 'Priya Singh',
      topicTaught: 'Human Circulatory System & Double Circulation',
      classworkSummary: 'Demonstrated 3D anatomical heart diagram. Discussed differences between arteries, veins, and capillaries.',
      homeworkAssigned: 'Draw a neatly labeled diagram of the human heart showing internal valves.',
      attendanceCount: 35,
      totalStudents: 40
    },
    {
      date: new Date(Date.now() - 86400000),
      className: 'Class IX',
      sectionName: 'Section A',
      subjectName: 'English',
      period: 1,
      teacherName: 'Rajesh Kumar',
      topicTaught: 'The Fun They Had - Isaac Asimov',
      classworkSummary: 'Read pages 5-8 aloud. Group debate on robotic mechanical teachers vs human interactive classrooms.',
      homeworkAssigned: 'Write a 150-word diary entry imagining Margie’s reaction to the real printed book.',
      attendanceCount: 36,
      totalStudents: 38
    },
    {
      date: new Date(Date.now() - 172800000),
      className: 'Class IX',
      sectionName: 'Section B',
      subjectName: 'Social Sciences',
      period: 4,
      teacherName: 'Sneha Desai',
      topicTaught: 'The French Revolution - The Outbreak of the Revolution',
      classworkSummary: 'Covered Estates General meeting on 5 May 1789, Tennis Court Oath, and the storming of the Bastille.',
      homeworkAssigned: 'Prepare a timeline chart from 1789 to 1794 highlighting major revolutionary milestones.',
      attendanceCount: 34,
      totalStudents: 39
    }
  ]);

  // 3. Seed Study Resources
  await StudyResource.insertMany([
    {
      title: 'Class 10 Mathematics Complete Formula Handbook',
      description: 'Quick revision sheets covering Quadratic formulas, AP equations, Trigonometric identities, and Surface Area theorems.',
      className: 'Class X',
      subjectName: 'Mathematics',
      materialType: 'PDF',
      fileUrl: 'https://archive.org/download/ncert-math-grade-10-formula-sheet/formula_handbook.pdf',
      fileSize: '3.2 MB',
      authorTeacher: 'Amit Sharma',
      downloadsCount: 142,
      tags: ['Board Exam', 'Formula Sheet', 'Revision']
    },
    {
      title: 'Human Heart Circulation & Systemic Loop 3D Animated Video',
      description: 'High-definition conceptual 3D render explaining oxygenated blood flow, pulmonary cycle, and systolic blood pressure.',
      className: 'Class X',
      subjectName: 'Science',
      materialType: 'Video',
      fileUrl: 'https://www.youtube.com/watch?v=ruM4XuhxUrs',
      fileSize: 'Video Stream',
      authorTeacher: 'Priya Singh',
      downloadsCount: 98,
      tags: ['Life Processes', 'Biology', '3D Visual']
    },
    {
      title: 'NCERT Class 10 Chemistry Balanced Equations & Color Changes',
      description: 'Complete listing of all precipitate colors, gas evolutions, and redox pairings across Term 1 syllabus.',
      className: 'Class X',
      subjectName: 'Science',
      materialType: 'PDF',
      fileUrl: 'https://archive.org/download/chemistry-reactions-grade10/chemical_reactions.pdf',
      fileSize: '1.8 MB',
      authorTeacher: 'Priya Singh',
      downloadsCount: 115,
      tags: ['Chemistry', 'Reactions', 'Lab Notes']
    },
    {
      title: 'Class 9 Physics Laws of Motion & Friction Solved Numericals',
      description: '25 step-by-step solved sample questions on Newton’s 2nd law F=ma, conservation of momentum, and friction coefficients.',
      className: 'Class IX',
      subjectName: 'Physics',
      materialType: 'Doc',
      fileUrl: 'https://archive.org/download/grade9-physics-numericals/laws_of_motion.docx',
      fileSize: '890 KB',
      authorTeacher: 'Amit Sharma',
      downloadsCount: 76,
      tags: ['Physics', 'Numericals', 'Solved Examples']
    },
    {
      title: 'English Flamingo & Vistas Core Question Bank with Model Answers',
      description: 'Character sketches, value-based analysis, and critical appreciation notes for CBSE Class 12 English.',
      className: 'Class XII',
      subjectName: 'English',
      materialType: 'E-Book',
      fileUrl: 'https://archive.org/download/english-core-grade12-question-bank/flamingo_vistas.pdf',
      fileSize: '4.5 MB',
      authorTeacher: 'Rajesh Kumar',
      downloadsCount: 130,
      tags: ['Literature', 'Model Answers', 'CBSE']
    }
  ]);

  // 4. Seed Homework Assignments
  await HomeworkAssignment.insertMany([
    {
      title: 'Maths Worksheet: Quadratic Roots & Discriminant Analysis',
      description: 'Solve all questions from Worksheet #4. Determine the nature of roots using D = b² - 4ac and find solutions using quadratic formula.',
      className: 'Class X',
      sectionName: 'Section A',
      subjectName: 'Mathematics',
      teacherName: 'Amit Sharma',
      dueDate: new Date(Date.now() + 86400000 * 2),
      totalMarks: 20,
      status: 'Active',
      submissionCount: 28,
      totalStudents: 38,
      submissions: [
        { studentName: 'Aarav Mehta', rollNumber: '1001', submissionDate: new Date(), marks: 19, remarks: 'Excellent step-by-step working', status: 'Evaluated' },
        { studentName: 'Diya Patel', rollNumber: '1002', submissionDate: new Date(), marks: 18, remarks: 'Minor calculation slip in Q3', status: 'Evaluated' },
        { studentName: 'Kabir Sharma', rollNumber: '1005', submissionDate: new Date(), marks: 20, remarks: 'Flawless graphical representation', status: 'Evaluated' },
        { studentName: 'Ananya Verma', rollNumber: '1008', submissionDate: new Date(), marks: null, remarks: 'Awaiting grading', status: 'Submitted' }
      ]
    },
    {
      title: 'Science Lab Assignment: Heart Anatomy & Valve Functions',
      description: 'Draw and label the 4 chambers of human heart. Explain how tricuspid and bicuspid valves prevent backflow of blood.',
      className: 'Class X',
      sectionName: 'Section B',
      subjectName: 'Science',
      teacherName: 'Priya Singh',
      dueDate: new Date(Date.now() + 86400000 * 3),
      totalMarks: 15,
      status: 'Active',
      submissionCount: 22,
      totalStudents: 35,
      submissions: [
        { studentName: 'Rohan Gupta', rollNumber: '1012', submissionDate: new Date(), marks: 14, remarks: 'Very clear diagram', status: 'Evaluated' },
        { studentName: 'Ishaan Reddy', rollNumber: '1015', submissionDate: new Date(), marks: null, remarks: 'Submitted on time', status: 'Submitted' }
      ]
    },
    {
      title: 'English Essay: The Impact of Technological Classrooms',
      description: 'Write a persuasive essay comparing AI-assisted self-study portals with traditional classroom interactions (250 words).',
      className: 'Class IX',
      sectionName: 'Section A',
      subjectName: 'English',
      teacherName: 'Rajesh Kumar',
      dueDate: new Date(Date.now() - 86400000),
      totalMarks: 25,
      status: 'Closed',
      submissionCount: 34,
      totalStudents: 36,
      submissions: [
        { studentName: 'Meera Nair', rollNumber: '901', submissionDate: new Date(Date.now() - 86400000), marks: 23, remarks: 'Compelling arguments and good vocabulary', status: 'Evaluated' }
      ]
    }
  ]);
};

// 1. Dashboard Aggregate Stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    await autoSeedStudyCenterIfEmpty();

    const [
      syllabusCount,
      completedSyllabus,
      resourceCount,
      pdfCount,
      videoCount,
      docCount,
      ebookCount,
      homeworkCount,
      activeHomework,
      recentHomework,
      liveClasses
    ] = await Promise.all([
      SyllabusUnit.countDocuments(),
      SyllabusUnit.countDocuments({ status: 'Completed' }),
      StudyResource.countDocuments(),
      StudyResource.countDocuments({ materialType: 'PDF' }),
      StudyResource.countDocuments({ materialType: 'Video' }),
      StudyResource.countDocuments({ materialType: 'Doc' }),
      StudyResource.countDocuments({ materialType: 'E-Book' }),
      HomeworkAssignment.countDocuments(),
      HomeworkAssignment.countDocuments({ status: 'Active' }),
      HomeworkAssignment.find().sort({ createdAt: -1 }).limit(5),
      LiveClass.find({ status: { $in: ['Live', 'Scheduled'] } }).sort({ startTime: 1 }).limit(4)
    ]);

    // Live classes count
    const liveClassesCount = await LiveClass.countDocuments({ status: 'Live' });

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          syllabusUnits: syllabusCount,
          completedUnits: completedSyllabus,
          studyMaterials: resourceCount,
          materialBreakdown: {
            pdf: pdfCount,
            video: videoCount,
            doc: docCount,
            ebook: ebookCount
          },
          activeHomework,
          totalHomework: homeworkCount,
          liveNow: liveClassesCount,
          scheduledLive: liveClasses.length
        },
        recentHomework,
        upcomingLiveClasses: liveClasses,
        submissionAnalytics: [
          { className: 'Class X', ratePct: 82, avgMarks: 18.5 },
          { className: 'Class IX', ratePct: 78, avgMarks: 17.2 },
          { className: 'Class VIII', ratePct: 85, avgMarks: 19.0 },
          { className: 'Class XII', ratePct: 91, avgMarks: 21.4 }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Syllabus Controller Methods
exports.getSyllabus = async (req, res, next) => {
  try {
    await autoSeedStudyCenterIfEmpty();
    const { className, subjectName, search } = req.query;
    let query = {};
    if (className && className !== 'All' && className !== 'All Classes') {
      const cls = className.replace('Class ', '').split('-')[0].trim();
      query.$or = [
        { className: className },
        { className: new RegExp(cls, 'i') }
      ];
    }
    if (subjectName && subjectName !== 'All') {
      query.subjectName = new RegExp(subjectName, 'i');
    }
    if (search && search.trim() !== '') {
      const s = search.trim();
      const sRegex = new RegExp(s, 'i');
      const searchCond = [
        { title: sRegex },
        { subjectName: sRegex },
        { learningObjectives: sRegex },
        { 'topics.name': sRegex }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchCond }];
        delete query.$or;
      } else {
        query.$or = searchCond;
      }
    }

    const units = await SyllabusUnit.find(query).sort({ unitNumber: 1 });
    res.status(200).json({ success: true, count: units.length, data: units });
  } catch (error) {
    next(error);
  }
};

exports.createSyllabusUnit = async (req, res, next) => {
  try {
    const unit = await SyllabusUnit.create(req.body);
    res.status(201).json({ success: true, message: 'Syllabus unit added successfully', data: unit });
  } catch (error) {
    next(error);
  }
};

exports.updateSyllabusUnit = async (req, res, next) => {
  try {
    const updated = await SyllabusUnit.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Syllabus unit not found' });
    res.status(200).json({ success: true, message: 'Syllabus unit updated', data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteSyllabusUnit = async (req, res, next) => {
  try {
    const deleted = await SyllabusUnit.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Syllabus unit not found' });
    res.status(200).json({ success: true, message: 'Syllabus unit deleted' });
  } catch (error) {
    next(error);
  }
};

// 3. Classwork & Logbook Controller Methods
exports.getClasswork = async (req, res, next) => {
  try {
    await autoSeedStudyCenterIfEmpty();
    const { className, subjectName, date, search, type } = req.query;
    let query = {};
    if (className && className !== 'All' && className !== 'All Classes') {
      const cls = className.replace('Class ', '').split('-')[0].trim();
      query.$or = [
        { className: className },
        { className: new RegExp(cls, 'i') }
      ];
    }
    if (subjectName && subjectName !== 'All') {
      query.subjectName = new RegExp(subjectName, 'i');
    }
    if (type && type !== 'All') {
      query.type = type;
    }
    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    if (search && search.trim() !== '') {
      const s = search.trim();
      const searchConditions = [
        { topicTaught: { $regex: s, $options: 'i' } },
        { classworkSummary: { $regex: s, $options: 'i' } },
        { homeworkAssigned: { $regex: s, $options: 'i' } },
        { teacherName: { $regex: s, $options: 'i' } },
        { subjectName: { $regex: s, $options: 'i' } },
        { className: { $regex: s, $options: 'i' } },
        { sectionName: { $regex: s, $options: 'i' } }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const logs = await ClassworkLog.find(query).sort({ date: -1, period: 1 });
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

exports.createClasswork = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.attachments = [`uploads/documents/${req.file.filename}`];
    } else if (typeof data.attachments === 'string') {
      try {
        data.attachments = JSON.parse(data.attachments);
      } catch {
        data.attachments = data.attachments ? [data.attachments] : [];
      }
    }
    if (!data.teacherName) data.teacherName = req.user?.name || 'Faculty Member';
    if (!data.type) data.type = 'Classwork';

    const log = await ClassworkLog.create(data);
    res.status(201).json({ success: true, message: 'Classwork log entry saved', data: log });
  } catch (error) {
    next(error);
  }
};

exports.updateClasswork = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.attachments = [`uploads/documents/${req.file.filename}`];
    }
    const updated = await ClassworkLog.findByIdAndUpdate(req.params.id, { $set: data }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Log entry not found' });
    res.status(200).json({ success: true, message: 'Classwork log updated', data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteClasswork = async (req, res, next) => {
  try {
    const deleted = await ClassworkLog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Log entry not found' });
    res.status(200).json({ success: true, message: 'Classwork log deleted' });
  } catch (error) {
    next(error);
  }
};

// 4. Learning Resources Controller Methods
exports.getResources = async (req, res, next) => {
  try {
    await autoSeedStudyCenterIfEmpty();
    const { className, subjectName, materialType, search } = req.query;
    let query = {};
    if (className && className !== 'All' && className !== 'All Classes') {
      const cls = className.replace('Class ', '').trim();
      query.$or = [
        { className: className },
        { className: { $regex: cls, $options: 'i' } }
      ];
    }
    if (subjectName && subjectName !== 'All') query.subjectName = subjectName;
    if (materialType && materialType !== 'All') query.materialType = materialType;

    if (search && search.trim() !== '') {
      const s = search.trim();
      const searchConditions = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { authorTeacher: { $regex: s, $options: 'i' } },
        { tags: { $in: [new RegExp(s, 'i')] } }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const resources = await StudyResource.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    next(error);
  }
};

exports.createResource = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.fileUrl = `uploads/documents/${req.file.filename}`;
      data.fileSize = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;
    }
    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    const resource = await StudyResource.create(data);
    res.status(201).json({ success: true, message: 'Study material uploaded successfully', data: resource });
  } catch (error) {
    next(error);
  }
};

exports.updateResource = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.fileUrl = `uploads/documents/${req.file.filename}`;
      data.fileSize = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;
    }
    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    const updated = await StudyResource.findByIdAndUpdate(req.params.id, { $set: data }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.status(200).json({ success: true, message: 'Study resource updated', data: updated });
  } catch (error) {
    next(error);
  }
};

exports.incrementResourceDownload = async (req, res, next) => {
  try {
    const updated = await StudyResource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadsCount: 1 } },
      { new: true }
    );
    res.status(200).json({ success: true, downloadsCount: updated ? updated.downloadsCount : 0 });
  } catch (error) {
    next(error);
  }
};

exports.deleteResource = async (req, res, next) => {
  try {
    const deleted = await StudyResource.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.status(200).json({ success: true, message: 'Study resource deleted' });
  } catch (error) {
    next(error);
  }
};

// 5. Homework Assignments Controller Methods
exports.getHomework = async (req, res, next) => {
  try {
    await autoSeedStudyCenterIfEmpty();
    const { className, sectionName, subjectName, status, search } = req.query;
    let query = {};
    if (className && className !== 'All' && className !== 'All Classes') {
      const cls = className.replace('Class ', '').trim();
      query.$or = [
        { className: className },
        { className: { $regex: cls, $options: 'i' } }
      ];
    }
    if (sectionName && sectionName !== 'All') query.sectionName = sectionName;
    if (subjectName && subjectName !== 'All') query.subjectName = subjectName;
    if (status && status !== 'All') query.status = status;

    if (search && search.trim() !== '') {
      const s = search.trim();
      const searchConditions = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { subjectName: { $regex: s, $options: 'i' } },
        { teacherName: { $regex: s, $options: 'i' } }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const homeworks = await HomeworkAssignment.find(query).sort({ dueDate: -1 });
    res.status(200).json({ success: true, count: homeworks.length, data: homeworks });
  } catch (error) {
    next(error);
  }
};

exports.createHomework = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.fileUrl = `uploads/documents/${req.file.filename}`;
    }
    if (!data.teacherName) data.teacherName = req.user?.name || 'Faculty Member';
    const hw = await HomeworkAssignment.create(data);
    res.status(201).json({ success: true, message: 'Homework assignment created', data: hw });
  } catch (error) {
    next(error);
  }
};

exports.updateHomework = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.fileUrl = `uploads/documents/${req.file.filename}`;
    }
    const updated = await HomeworkAssignment.findByIdAndUpdate(req.params.id, { $set: data }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Homework not found' });
    res.status(200).json({ success: true, message: 'Homework assignment updated', data: updated });
  } catch (error) {
    next(error);
  }
};

exports.evaluateHomework = async (req, res, next) => {
  try {
    const { studentName, rollNumber, marksObtained, remarks } = req.body;
    const hw = await HomeworkAssignment.findById(req.params.id);
    if (!hw) return res.status(404).json({ success: false, message: 'Homework not found' });

    // Check if submission already exists for this roll number
    const existing = hw.submissions.find(s => s.rollNumber === rollNumber || s.studentName === studentName);
    if (existing) {
      existing.marksObtained = marksObtained !== undefined ? marksObtained : existing.marksObtained;
      existing.remarks = remarks !== undefined ? remarks : existing.remarks;
      existing.status = 'Evaluated';
    } else {
      hw.submissions.push({
        studentName: studentName || 'Student',
        rollNumber: rollNumber || 'N/A',
        marksObtained: marksObtained || null,
        remarks: remarks || '',
        status: 'Evaluated'
      });
    }
    hw.submissionCount = hw.submissions.length;
    await hw.save();

    res.status(200).json({ success: true, message: 'Submission evaluated successfully', data: hw });
  } catch (error) {
    next(error);
  }
};

exports.deleteHomework = async (req, res, next) => {
  try {
    const deleted = await HomeworkAssignment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Homework not found' });
    res.status(200).json({ success: true, message: 'Homework assignment deleted' });
  } catch (error) {
    next(error);
  }
};
