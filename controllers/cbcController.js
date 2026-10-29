const CbcStrand = require('../models/CbcStrand');
const CbcAssessment = require('../models/CbcAssessment');

const DEFAULT_STRANDS = [
  {
    subject: 'English',
    strandName: 'Listening & Speaking',
    subStrands: [
      { name: 'Oral Presentation', outcome: 'Learner presents ideas clearly to an audience using appropriate vocal variety and vocabulary.', lvl4: 'Speaks with confidence, exceptional tone, and captivating engagement.', lvl3: 'Speaks clearly with appropriate pace and volume.', lvl2: 'Speaks with occasional hesitation, needing minor prompting.', lvl1: 'Struggles to articulate ideas audibly without constant guidance.' },
      { name: 'Active Listening & Dialogue', outcome: 'Learner actively listens to discussions and responds respectfully.', lvl4: 'Demonstrates deep empathy and builds constructively upon peers’ ideas.', lvl3: 'Listens attentively and responds appropriately.', lvl2: 'Occasionally loses focus during extended conversations.', lvl1: 'Needs constant redirection to remain focused.' }
    ]
  },
  {
    subject: 'English',
    strandName: 'Reading & Comprehension',
    subStrands: [
      { name: 'Fluency & Expression', outcome: 'Learner reads grade-level text with accuracy, expression, and pacing.', lvl4: 'Reads smoothly with natural inflection and self-corrects immediately.', lvl3: 'Reads grade-level passages accurately with good pace.', lvl2: 'Reads word-by-word with occasional pauses.', lvl1: 'Struggles with decoding words at grade level.' },
      { name: 'Critical Inferences', outcome: 'Learner infers character motivations and central themes.', lvl4: 'Identifies subtle nuances and provides compelling evidence.', lvl3: 'Identifies central themes accurately.', lvl2: 'Identifies obvious details but struggles with deeper inference.', lvl1: 'Cannot state the main idea without assistance.' }
    ]
  },
  {
    subject: 'Mathematics',
    strandName: 'Numbers & Operations',
    subStrands: [
      { name: 'Place Value & Estimation', outcome: 'Learner represents numbers up to 10,000 and rounds to nearest hundred.', lvl4: 'Applies place value concepts in real-world budgeting and multi-step tasks.', lvl3: 'Identifies place values and rounds numbers correctly.', lvl2: 'Understands place values with manipulatives.', lvl1: 'Confuses digit positions in multi-digit numbers.' },
      { name: 'Fractions & Decimals', outcome: 'Learner solves addition and subtraction of fractions with like denominators.', lvl4: 'Solves complex word problems converting fractions to decimals.', lvl3: 'Computes fraction sums accurately.', lvl2: 'Solves with visual bar models.', lvl1: 'Requires step-by-step assistance.' }
    ]
  },
  {
    subject: 'Science',
    strandName: 'Living Things & Environment',
    subStrands: [
      { name: 'Plant & Animal Adaptations', outcome: 'Learner investigates how flora and fauna survive in diverse biomes.', lvl4: 'Designs innovative models illustrating adaptation mechanisms.', lvl3: 'Explains specific adaptations accurately.', lvl2: 'Lists common animals but confuses specific adaptations.', lvl1: 'Cannot identify adaptation features.' },
      { name: 'Ecosystem Conservation', outcome: 'Learner outlines human impact on biodiversity and conservation strategies.', lvl4: 'Proposes actionable school sustainability initiatives.', lvl3: 'Describes key conservation practices.', lvl2: 'Understands recycling but cannot explain food webs.', lvl1: 'Unaware of conservation importance.' }
    ]
  }
];

const DEFAULT_ASSESSMENTS = [
  {
    assessmentName: 'Oral Poetry Recitation & Dialogue',
    subject: 'English',
    classGrade: 'Grade 3',
    section: 'A',
    taskType: 'Observation',
    strand: 'Listening & Speaking',
    subStrand: 'Oral Presentation',
    date: new Date(),
    maxRating: 4,
    scores: [
      { studentName: 'Aarav Sharma', rollNo: '01', rating: 4, remarks: 'Superb inflection and stage presence.' },
      { studentName: 'Priya Patel', rollNo: '02', rating: 3, remarks: 'Clear articulation, met all rubric requirements.' },
      { studentName: 'Rohan Gupta', rollNo: '03', rating: 3, remarks: 'Good volume, work on eye contact.' },
      { studentName: 'Ishita Singh', rollNo: '04', rating: 4, remarks: 'Exceptional expression and vocabulary.' },
      { studentName: 'Karan Malhotra', rollNo: '05', rating: 2, remarks: 'Approaching expectation; needs more rehearsal.' },
      { studentName: 'Ananya Verma', rollNo: '06', rating: 3, remarks: 'Very steady rhythm and clear speech.' }
    ]
  },
  {
    assessmentName: 'Ecosystem Diorama & Presentation',
    subject: 'Science',
    classGrade: 'Grade 3',
    section: 'A',
    taskType: 'Project',
    strand: 'Living Things & Environment',
    subStrand: 'Plant & Animal Adaptations',
    date: new Date(Date.now() - 3 * 86400000),
    maxRating: 4,
    scores: [
      { studentName: 'Aarav Sharma', rollNo: '01', rating: 3, remarks: 'Great diorama of desert biome.' },
      { studentName: 'Priya Patel', rollNo: '02', rating: 4, remarks: 'Outstanding creativity with recycled materials.' },
      { studentName: 'Rohan Gupta', rollNo: '03', rating: 2, remarks: 'Incomplete labels on organism food chain.' },
      { studentName: 'Ishita Singh', rollNo: '04', rating: 3, remarks: 'Accurate depiction of aquatic adaptations.' },
      { studentName: 'Karan Malhotra', rollNo: '05', rating: 2, remarks: 'Good effort, explain plant adaptations clearly.' },
      { studentName: 'Ananya Verma', rollNo: '06', rating: 4, remarks: 'Mastery of terrestrial biome concepts.' }
    ]
  }
];

// 1. Strands CRUD
exports.getStrands = async (req, res, next) => {
  try {
    const { subject } = req.query;
    const query = subject ? { subject } : {};
    const strands = await CbcStrand.find(query).sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: strands.length, data: strands });
  } catch (err) { next(err); }
};

exports.createStrand = async (req, res, next) => {
  try {
    const strand = await CbcStrand.create(req.body);
    res.status(201).json({ success: true, data: strand });
  } catch (err) { next(err); }
};

exports.updateStrand = async (req, res, next) => {
  try {
    const strand = await CbcStrand.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!strand) return res.status(404).json({ success: false, message: 'Strand not found' });
    res.status(200).json({ success: true, data: strand });
  } catch (err) { next(err); }
};

exports.deleteStrand = async (req, res, next) => {
  try {
    const strand = await CbcStrand.findById(req.params.id);
    if (!strand) return res.status(404).json({ success: false, message: 'Strand not found' });
    await strand.deleteOne();
    res.status(200).json({ success: true, message: 'Strand deleted successfully' });
  } catch (err) { next(err); }
};

// 2. Assessments CRUD
exports.getAssessments = async (req, res, next) => {
  try {
    const { classGrade, section, subject } = req.query;
    let query = {};
    if (classGrade) query.classGrade = classGrade;
    if (section) query.section = section;
    if (subject) query.subject = subject;

    const assessments = await CbcAssessment.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: assessments.length, data: assessments });
  } catch (err) { next(err); }
};

exports.createAssessment = async (req, res, next) => {
  try {
    const assessment = await CbcAssessment.create(req.body);
    res.status(201).json({ success: true, data: assessment });
  } catch (err) { next(err); }
};

exports.updateAssessment = async (req, res, next) => {
  try {
    const assessment = await CbcAssessment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    res.status(200).json({ success: true, data: assessment });
  } catch (err) { next(err); }
};

exports.deleteAssessment = async (req, res, next) => {
  try {
    const assessment = await CbcAssessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    await assessment.deleteOne();
    res.status(200).json({ success: true, message: 'Assessment deleted successfully' });
  } catch (err) { next(err); }
};

// 3. Stats & Overview
exports.getCbcStats = async (req, res, next) => {
  try {
    const strandsCount = await CbcStrand.countDocuments();
    const assessments = await CbcAssessment.find();
    
    let totalScoresRecorded = 0;
    let rating4Count = 0; // Exceeding
    let rating3Count = 0; // Meeting
    let rating2Count = 0; // Approaching
    let rating1Count = 0; // Below

    assessments.forEach(a => {
      (a.scores || []).forEach(s => {
        totalScoresRecorded++;
        if (s.rating === 4) rating4Count++;
        else if (s.rating === 3) rating3Count++;
        else if (s.rating === 2) rating2Count++;
        else if (s.rating === 1) rating1Count++;
      });
    });

    const proficiencyRate = totalScoresRecorded > 0
      ? Math.round(((rating4Count + rating3Count) / totalScoresRecorded) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        strandsCount: strandsCount || 0,
        assessmentsCount: assessments.length || 0,
        competenciesCount: 0,
        totalScoresRecorded,
        proficiencyRate,
        rubricBreakdown: {
          exceeding: rating4Count,
          meeting: rating3Count,
          approaching: rating2Count,
          below: rating1Count
        }
      }
    });
  } catch (err) { next(err); }
};
