const Assessment = require('../models/Assessment');

// Helper to calculate grade from percentage
const getGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

// Seed sample assessments if collection is empty
const DEFAULT_ASSESSMENTS = [
  {
    title: 'Unit 3: Quadratic Equations & Roots Quiz',
    type: 'Quiz',
    classSec: 'Class 10-A',
    subject: 'Mathematics',
    totalMarks: 25,
    passingMarks: 10,
    date: new Date('2026-09-18'),
    recurrence: 'Weekly',
    conductedVia: 'Paper / Pen',
    instructions: 'Time limit 40 minutes. No calculators allowed.',
    status: 'Published',
    sittings: 1,
    entries: [
      { studentName: 'Aarav Sharma', rollNo: '101', admissionNo: 'ADM-2024-01', marksObtained: 24, maxMarks: 25, percentage: 96, grade: 'A+', status: 'Present', teacherRemarks: 'Exceptional working on quadratic formula!' },
      { studentName: 'Diya Patel', rollNo: '102', admissionNo: 'ADM-2024-02', marksObtained: 22, maxMarks: 25, percentage: 88, grade: 'A', status: 'Present', teacherRemarks: 'Very good accuracy.' },
      { studentName: 'Rohan Verma', rollNo: '103', admissionNo: 'ADM-2024-03', marksObtained: 19, maxMarks: 25, percentage: 76, grade: 'B+', status: 'Present', teacherRemarks: 'Minor algebraic slip on Q3.' },
      { studentName: 'Ananya Iyer', rollNo: '104', admissionNo: 'ADM-2024-04', marksObtained: 23, maxMarks: 25, percentage: 92, grade: 'A+', status: 'Present', teacherRemarks: 'Clean derivations.' },
      { studentName: 'Kabir Mehta', rollNo: '105', admissionNo: 'ADM-2024-05', marksObtained: 15, maxMarks: 25, percentage: 60, grade: 'B', status: 'Present', teacherRemarks: 'Needs revision on discriminant.' },
      { studentName: 'Ishaan Gupta', rollNo: '106', admissionNo: 'ADM-2024-06', marksObtained: 0, maxMarks: 25, percentage: 0, grade: 'F', status: 'Absent', teacherRemarks: 'Medical leave.' }
    ],
    stats: {
      averageScore: 20.6,
      highestScore: 24,
      lowestScore: 15,
      passPercentage: 100,
      totalAppeared: 5
    }
  },
  {
    title: 'Weekly Physics Test: Optics & Ray Diagrams',
    type: 'Unit Test',
    classSec: 'Class 10-A',
    subject: 'Physics',
    totalMarks: 30,
    passingMarks: 12,
    date: new Date('2026-09-22'),
    recurrence: 'Weekly',
    conductedVia: 'Paper / Pen',
    instructions: 'Draw ray diagrams with ruler and sharp pencil.',
    status: 'Published',
    sittings: 1,
    entries: [
      { studentName: 'Aarav Sharma', rollNo: '101', admissionNo: 'ADM-2024-01', marksObtained: 28, maxMarks: 30, percentage: 93.3, grade: 'A+', status: 'Present', teacherRemarks: 'Perfect convex mirror diagrams.' },
      { studentName: 'Diya Patel', rollNo: '102', admissionNo: 'ADM-2024-02', marksObtained: 26, maxMarks: 30, percentage: 86.7, grade: 'A', status: 'Present', teacherRemarks: 'Clear focal distance labeling.' },
      { studentName: 'Rohan Verma', rollNo: '103', admissionNo: 'ADM-2024-03', marksObtained: 21, maxMarks: 30, percentage: 70, grade: 'B+', status: 'Present', teacherRemarks: 'Good attempt on refraction index.' },
      { studentName: 'Ananya Iyer', rollNo: '104', admissionNo: 'ADM-2024-04', marksObtained: 29, maxMarks: 30, percentage: 96.7, grade: 'A+', status: 'Present', teacherRemarks: 'Flawless performance.' },
      { studentName: 'Kabir Mehta', rollNo: '105', admissionNo: 'ADM-2024-05', marksObtained: 18, maxMarks: 30, percentage: 60, grade: 'B', status: 'Present', teacherRemarks: 'Practice sign conventions.' },
      { studentName: 'Ishaan Gupta', rollNo: '106', admissionNo: 'ADM-2024-06', marksObtained: 22, maxMarks: 30, percentage: 73.3, grade: 'B+', status: 'Present', teacherRemarks: 'Steady progress.' }
    ],
    stats: {
      averageScore: 24,
      highestScore: 29,
      lowestScore: 18,
      passPercentage: 100,
      totalAppeared: 6
    }
  },
  {
    title: 'Periodic English Grammar & Creative Writing Check',
    type: 'Periodic Test',
    classSec: 'Class 9-B',
    subject: 'English',
    totalMarks: 20,
    passingMarks: 8,
    date: new Date('2026-09-25'),
    recurrence: 'Bi-weekly',
    conductedVia: 'Paper / Pen',
    instructions: 'Section A: Active-Passive Voice, Section B: Short Story Writing.',
    status: 'Evaluated',
    sittings: 1,
    entries: [
      { studentName: 'Sanya Mirza', rollNo: '201', admissionNo: 'ADM-2024-11', marksObtained: 18, maxMarks: 20, percentage: 90, grade: 'A+', status: 'Present', teacherRemarks: 'Creative expression and wide vocabulary.' },
      { studentName: 'Devansh Joshi', rollNo: '202', admissionNo: 'ADM-2024-12', marksObtained: 15, maxMarks: 20, percentage: 75, grade: 'B+', status: 'Present', teacherRemarks: 'Good story structure.' },
      { studentName: 'Meera Rao', rollNo: '203', admissionNo: 'ADM-2024-13', marksObtained: 17, maxMarks: 20, percentage: 85, grade: 'A', status: 'Present', teacherRemarks: 'Well written dialogue.' },
      { studentName: 'Yashwardhan Roy', rollNo: '204', admissionNo: 'ADM-2024-14', marksObtained: 13, maxMarks: 20, percentage: 65, grade: 'B', status: 'Present', teacherRemarks: 'Check preposition usage.' }
    ],
    stats: {
      averageScore: 15.75,
      highestScore: 18,
      lowestScore: 13,
      passPercentage: 100,
      totalAppeared: 4
    }
  },
  {
    title: 'Chemical Reactions & Balancing Equations Quiz',
    type: 'Quiz',
    classSec: 'Class 10-A',
    subject: 'Chemistry',
    totalMarks: 25,
    passingMarks: 10,
    date: new Date('2026-09-28'),
    recurrence: 'Weekly',
    conductedVia: 'Online Quiz',
    instructions: 'Quick-fire 20 MCQs and 5 equation balancing steps.',
    status: 'Scheduled',
    sittings: 1,
    entries: [],
    stats: {
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passPercentage: 0,
      totalAppeared: 0
    }
  },
  {
    title: 'Python Functions & Data Structures Lab Evaluation',
    type: 'Practical',
    classSec: 'Class 11-A',
    subject: 'Computer Science',
    totalMarks: 50,
    passingMarks: 20,
    date: new Date('2026-10-02'),
    recurrence: 'Monthly',
    conductedVia: 'Lab / Practical',
    instructions: 'Live code review and execution on school lab machines.',
    status: 'Evaluated',
    sittings: 1,
    entries: [
      { studentName: 'Kunal Singhania', rollNo: '301', admissionNo: 'ADM-2024-21', marksObtained: 47, maxMarks: 50, percentage: 94, grade: 'A+', status: 'Present', teacherRemarks: 'Clean modular code and unit tests.' },
      { studentName: 'Rhea Kapoor', rollNo: '302', admissionNo: 'ADM-2024-22', marksObtained: 42, maxMarks: 50, percentage: 84, grade: 'A', status: 'Present', teacherRemarks: 'Good algorithmic efficiency.' },
      { studentName: 'Tanmay Bhatt', rollNo: '303', admissionNo: 'ADM-2024-23', marksObtained: 38, maxMarks: 50, percentage: 76, grade: 'B+', status: 'Present', teacherRemarks: 'Minor bug in recursion base case.' }
    ],
    stats: {
      averageScore: 42.3,
      highestScore: 47,
      lowestScore: 38,
      passPercentage: 100,
      totalAppeared: 3
    }
  }
];

// 1. GET ALL ASSESSMENTS
exports.getAssessments = async (req, res) => {
  try {


    const { type, classSec, subject, status, search } = req.query;
    let query = {};

    if (type && type !== 'All') query.type = type;
    if (classSec && classSec !== 'All') query.classSec = { $regex: classSec, $options: 'i' };
    if (subject && subject !== 'All') query.subject = { $regex: subject, $options: 'i' };
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { classSec: { $regex: search, $options: 'i' } }
      ];
    }

    const list = await Assessment.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error('Error in getAssessments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET ASSESSMENT BY ID
exports.getAssessmentById = async (req, res) => {
  try {
    const item = await Assessment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. CREATE ASSESSMENT
exports.createAssessment = async (req, res) => {
  try {
    const { title, type, classSec, subject, totalMarks, passingMarks, date, recurrence, conductedVia, instructions } = req.body;
    
    if (!title || !classSec || !subject) {
      return res.status(400).json({ success: false, message: 'Title, Class, and Subject are required.' });
    }

    // Default roster generation if none provided
    const defaultStudents = [
      { studentName: 'Aarav Sharma', rollNo: '101', admissionNo: 'ADM-2024-01' },
      { studentName: 'Diya Patel', rollNo: '102', admissionNo: 'ADM-2024-02' },
      { studentName: 'Rohan Verma', rollNo: '103', admissionNo: 'ADM-2024-03' },
      { studentName: 'Ananya Iyer', rollNo: '104', admissionNo: 'ADM-2024-04' },
      { studentName: 'Kabir Mehta', rollNo: '105', admissionNo: 'ADM-2024-05' },
      { studentName: 'Ishaan Gupta', rollNo: '106', admissionNo: 'ADM-2024-06' }
    ];

    const maxM = Number(totalMarks) || 25;
    const initialEntries = (req.body.entries && req.body.entries.length > 0)
      ? req.body.entries 
      : defaultStudents.map(s => ({
          studentName: s.studentName,
          rollNo: s.rollNo,
          admissionNo: s.admissionNo,
          marksObtained: 0,
          maxMarks: maxM,
          percentage: 0,
          grade: 'F',
          status: 'Present',
          teacherRemarks: ''
        }));

    const newAssessment = await Assessment.create({
      title,
      type: type || 'Quiz',
      classSec,
      subject,
      totalMarks: maxM,
      passingMarks: Number(passingMarks) || Math.round(maxM * 0.4),
      date: date ? new Date(date) : new Date(),
      recurrence: recurrence || 'One-off',
      conductedVia: conductedVia || 'Paper / Pen',
      instructions: instructions || '',
      status: 'Scheduled',
      sittings: 1,
      entries: initialEntries,
      stats: {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passPercentage: 0,
        totalAppeared: 0
      }
    });

    res.status(201).json({ success: true, data: newAssessment });
  } catch (error) {
    console.error('Error in createAssessment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. UPDATE ASSESSMENT
exports.updateAssessment = async (req, res) => {
  try {
    const updated = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. DELETE ASSESSMENT
exports.deleteAssessment = async (req, res) => {
  try {
    const item = await Assessment.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    res.status(200).json({ success: true, message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. SAVE MARKS / EVALUATE
exports.saveMarks = async (req, res) => {
  try {
    const { entries, publish } = req.body;
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    if (!Array.isArray(entries)) {
      return res.status(400).json({ success: false, message: 'Entries array is required' });
    }

    let totalMarksSum = 0;
    let presentCount = 0;
    let passCount = 0;
    let highest = 0;
    let lowest = assessment.totalMarks;

    const processedEntries = entries.map(item => {
      const marks = Number(item.marksObtained) || 0;
      const maxM = assessment.totalMarks || 25;
      const isPresent = item.status !== 'Absent';
      const pct = maxM > 0 ? Math.round((marks / maxM) * 1000) / 10 : 0;
      const grade = isPresent ? getGrade(pct) : 'F';

      if (isPresent) {
        totalMarksSum += marks;
        presentCount++;
        if (marks >= assessment.passingMarks) passCount++;
        if (marks > highest) highest = marks;
        if (marks < lowest) lowest = marks;
      }

      return {
        ...item,
        marksObtained: marks,
        maxMarks: maxM,
        percentage: pct,
        grade,
        status: item.status || 'Present',
        teacherRemarks: item.teacherRemarks || ''
      };
    });

    const avg = presentCount > 0 ? Math.round((totalMarksSum / presentCount) * 10) / 10 : 0;
    const passPct = presentCount > 0 ? Math.round((passCount / presentCount) * 100) : 0;

    assessment.entries = processedEntries;
    assessment.stats = {
      averageScore: avg,
      highestScore: presentCount > 0 ? highest : 0,
      lowestScore: presentCount > 0 ? lowest : 0,
      passPercentage: passPct,
      totalAppeared: presentCount
    };
    assessment.status = publish ? 'Published' : 'Evaluated';

    await assessment.save();
    res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    console.error('Error in saveMarks:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. PUBLISH ASSESSMENT
exports.publishAssessment = async (req, res) => {
  try {
    const item = await Assessment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    item.status = 'Published';
    await item.save();
    res.status(200).json({ success: true, message: 'Assessment published to students & parents', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. OVERALL STATS & SUMMARY
exports.getAssessmentStats = async (req, res) => {
  try {
    const list = await Assessment.find();
    const totalAssessments = list.length;
    const publishedCount = list.filter(a => a.status === 'Published').length;
    const evaluatedCount = list.filter(a => a.status === 'Evaluated').length;
    const scheduledCount = list.filter(a => a.status === 'Scheduled').length;

    let totalAvgSum = 0;
    let avgCount = 0;
    list.forEach(a => {
      if (a.stats && a.stats.averageScore > 0 && a.totalMarks > 0) {
        totalAvgSum += (a.stats.averageScore / a.totalMarks) * 100;
        avgCount++;
      }
    });

    const overallAveragePercentage = avgCount > 0 ? Math.round(totalAvgSum / avgCount) : 78;

    res.status(200).json({
      success: true,
      data: {
        totalAssessments,
        publishedCount,
        evaluatedCount,
        scheduledCount,
        overallAveragePercentage,
        totalSittings: list.reduce((acc, curr) => acc + (curr.sittings || 1), 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. STUDENT PROGRESS REPORT
exports.getStudentReport = async (req, res) => {
  try {
    const { studentName, classSec } = req.query;
    if (!studentName) {
      return res.status(400).json({ success: false, message: 'studentName query parameter is required' });
    }

    const assessments = await Assessment.find({
      ...(classSec && classSec !== 'All' ? { classSec: { $regex: classSec, $options: 'i' } } : {}),
      'entries.studentName': { $regex: studentName, $options: 'i' }
    }).sort({ date: 1 });

    const reportEntries = [];
    assessments.forEach(ass => {
      const found = ass.entries.find(e => e.studentName.toLowerCase().includes(studentName.toLowerCase()));
      if (found) {
        reportEntries.push({
          assessmentId: ass._id,
          title: ass.title,
          type: ass.type,
          subject: ass.subject,
          classSec: ass.classSec,
          date: ass.date,
          marksObtained: found.marksObtained,
          maxMarks: found.maxMarks || ass.totalMarks,
          percentage: found.percentage,
          grade: found.grade,
          status: found.status,
          teacherRemarks: found.teacherRemarks
        });
      }
    });

    const totalTests = reportEntries.length;
    const avgScore = totalTests > 0 
      ? Math.round(reportEntries.reduce((acc, c) => acc + c.percentage, 0) / totalTests) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        studentName,
        classSec: classSec || (reportEntries[0] ? reportEntries[0].classSec : 'General'),
        totalTests,
        averagePercentage: avgScore,
        history: reportEntries
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. RANK LIST
exports.getRankList = async (req, res) => {
  try {
    const { classSec, assessmentId } = req.query;
    
    if (assessmentId) {
      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) {
        return res.status(404).json({ success: false, message: 'Assessment not found' });
      }

      const sortedEntries = [...assessment.entries]
        .filter(e => e.status !== 'Absent')
        .sort((a, b) => b.marksObtained - a.marksObtained)
        .map((entry, index) => ({
          rank: index + 1,
          studentName: entry.studentName,
          rollNo: entry.rollNo,
          admissionNo: entry.admissionNo,
          marksObtained: entry.marksObtained,
          maxMarks: entry.maxMarks || assessment.totalMarks,
          percentage: entry.percentage,
          grade: entry.grade,
          status: entry.status
        }));

      return res.status(200).json({
        success: true,
        scope: 'Single Assessment',
        assessmentTitle: assessment.title,
        data: sortedEntries
      });
    }

    // Cumulative Rank for Class
    const query = classSec && classSec !== 'All' ? { classSec: { $regex: classSec, $options: 'i' } } : {};
    const assessments = await Assessment.find(query);

    const studentMap = {};

    assessments.forEach(ass => {
      ass.entries.forEach(entry => {
        if (!studentMap[entry.studentName]) {
          studentMap[entry.studentName] = {
            studentName: entry.studentName,
            rollNo: entry.rollNo || '',
            admissionNo: entry.admissionNo || '',
            classSec: ass.classSec,
            totalMarksObtained: 0,
            totalMaxMarks: 0,
            testsAttended: 0
          };
        }

        if (entry.status !== 'Absent') {
          studentMap[entry.studentName].totalMarksObtained += entry.marksObtained;
          studentMap[entry.studentName].totalMaxMarks += (entry.maxMarks || ass.totalMarks);
          studentMap[entry.studentName].testsAttended++;
        }
      });
    });

    const rankList = Object.values(studentMap)
      .map(s => {
        const pct = s.totalMaxMarks > 0 ? Math.round((s.totalMarksObtained / s.totalMaxMarks) * 1000) / 10 : 0;
        return {
          ...s,
          percentage: pct,
          grade: getGrade(pct)
        };
      })
      .sort((a, b) => b.percentage - a.percentage)
      .map((item, idx) => ({
        rank: idx + 1,
        ...item
      }));

    res.status(200).json({
      success: true,
      scope: 'Overall Class Cumulative',
      data: rankList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
