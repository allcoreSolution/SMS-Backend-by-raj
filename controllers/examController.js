const { 
  Exam, 
  ExamSchedule, 
  ExamResult, 
  ExamType, 
  ExamGrade, 
  CocurricularArea,
  CocurricularGradeEntry,
  MarksheetUpload,
  AdmitCard
} = require('../models/Exam');
const Student = require('../models/Student');
const AcademicClass = require('../models/AcademicClass');
const AcademicSubject = require('../models/AcademicSubject');

// ======================== DASHBOARD STATS ========================
exports.getExamDashboardStats = async (req, res, next) => {
  try {
    const totalExams = await Exam.countDocuments();
    const upcomingExamsCount = await Exam.countDocuments({ startDate: { $gte: new Date() } });
    const ongoingExamsCount = await Exam.countDocuments({ status: 'Ongoing' });
    const publishedMarksheetsCount = await Exam.countDocuments({ publishResults: true });
    
    // Total marks results recorded vs total expected
    const totalResultsEntered = await ExamResult.countDocuments();
    const studentCount = await Student.countDocuments();
    const totalScheduled = await ExamSchedule.countDocuments();
    const totalPossibleResults = studentCount * Math.max(totalScheduled, 1);
    const marksEntryPercent = totalPossibleResults > 0 
      ? Math.min(Math.round((totalResultsEntered / totalPossibleResults) * 100), 100) 
      : 0;

    // Exam Type Distribution for Pie Chart
    const types = await ExamType.find().limit(6);
    const examTypeData = [];
    for (const t of types) {
      const count = await Exam.countDocuments({ examType: t.name });
      if (count > 0) {
        examTypeData.push({ name: t.name, value: count });
      }
    }

    // Schedule Timeline Data for Area Chart
    const schedules = await ExamSchedule.find().sort({ examDate: 1 }).limit(10);
    const scheduleDataMap = {};
    schedules.forEach(s => {
      const dateStr = new Date(s.examDate).toLocaleDateString([], { month: 'short', day: 'numeric' });
      scheduleDataMap[dateStr] = (scheduleDataMap[dateStr] || 0) + 1;
    });
    const examScheduleData = Object.keys(scheduleDataMap).map(d => ({ name: d, count: scheduleDataMap[d] }));

    // Attendance breakdown
    const presentCount = await ExamResult.countDocuments({ attendance: 'Present' });
    const absentCount = await ExamResult.countDocuments({ attendance: 'Absent' });
    const attendanceData = [
      { name: 'Present', value: presentCount },
      { name: 'Absent', value: absentCount }
    ];

    // Marks Entry Progress by Exam
    const allExams = await Exam.find().sort({ createdAt: -1 }).limit(5);
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
    const marksEntryProgress = [];
    for (let i = 0; i < allExams.length; i++) {
      const ex = allExams[i];
      const entered = await ExamResult.countDocuments({ exam: ex._id });
      const target = studentCount > 0 ? studentCount * 4 : 0;
      marksEntryProgress.push({
        name: ex.examName,
        current: entered,
        total: target,
        color: colors[i % colors.length]
      });
    }

    // Pass vs Fail Class Analytics
    const classes = await AcademicClass.find().limit(5);
    const passFailData = [];
    for (const cls of classes) {
      const passed = await ExamResult.countDocuments({ academicClass: cls._id, marksObtained: { $gte: 40 } });
      const failed = await ExamResult.countDocuments({ academicClass: cls._id, marksObtained: { $lt: 40 } });
      if (passed > 0 || failed > 0) {
        passFailData.push({
          name: cls.className || 'Class',
          passed: passed,
          failed: failed
        });
      }
    }

    // Operations Counts
    const examTypesCount = await ExamType.countDocuments();
    const gradesCount = await ExamGrade.countDocuments();
    const scheduledPapersCount = await ExamSchedule.countDocuments();
    const cocurricularCount = await CocurricularArea.countDocuments();

    // Recent & Upcoming Lists
    const recentExams = allExams.map(e => ({
      id: e._id,
      title: e.examName,
      date: `${new Date(e.startDate).toLocaleDateString()} - ${new Date(e.endDate).toLocaleDateString()}`,
      status: e.status
    }));

    const upcomingExams = await Exam.find({ startDate: { $gte: new Date() } }).limit(5);
    const upcomingExamsList = upcomingExams.map(e => ({
      id: e._id,
      title: e.examName,
      date: new Date(e.startDate).toLocaleDateString(),
      type: e.examType
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          examsThisSession: totalExams,
          upcomingExams: upcomingExamsCount,
          ongoingExams: ongoingExamsCount,
          marksEntryPercent,
          publishedMarksheets: publishedMarksheetsCount
        },
        scheduleData: examScheduleData,
        typeData: examTypeData,
        attendanceData,
        marksEntryProgress,
        passFailData,
        recentExams,
        upcomingExamsList,
        operations: [
          { label: 'Exam Types', count: examTypesCount || 6, key: 'types' },
          { label: 'Grade Scales', count: gradesCount || 7, key: 'grades' },
          { label: 'Scheduled Papers', count: scheduledPapersCount || 8, key: 'schedules' },
          { label: 'Cocurricular Areas', count: cocurricularCount || 5, key: 'cocurricular' }
        ]
      }
    });
  } catch (error) { next(error); }
};

// ======================== EXAM CRUD ========================
exports.getExams = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { examName: { $regex: search, $options: 'i' } },
        { examType: { $regex: search, $options: 'i' } },
        { session: { $regex: search, $options: 'i' } }
      ];
    }
    const exams = await Exam.find(query)
      .populate('academicClass', 'className')
      .populate('classes', 'className')
      .sort({ startDate: -1 });

    res.status(200).json({ success: true, count: exams.length, data: exams });
  } catch (error) { next(error); }
};

exports.getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('academicClass', 'className')
      .populate('classes', 'className');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    
    // Also fetch associated schedules
    const schedules = await ExamSchedule.find({ exam: exam._id })
      .populate('academicClass', 'className')
      .populate('subject', 'subjectName code')
      .sort({ examDate: 1 });

    res.status(200).json({ success: true, data: { ...exam.toObject(), schedules } });
  } catch (error) { next(error); }
};

exports.createExam = async (req, res, next) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (error) { next(error); }
};

exports.updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, data: exam });
  } catch (error) { next(error); }
};

exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    await ExamSchedule.deleteMany({ exam: req.params.id });
    await ExamResult.deleteMany({ exam: req.params.id });
    res.status(200).json({ success: true, message: 'Exam and associated schedules/results deleted' });
  } catch (error) { next(error); }
};

// ======================== EXAM TYPES ========================
exports.getExamTypes = async (req, res, next) => {
  try {
    const types = await ExamType.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: types.length, data: types });
  } catch (error) { next(error); }
};

exports.createExamType = async (req, res, next) => {
  try {
    const examType = await ExamType.create(req.body);
    res.status(201).json({ success: true, data: examType });
  } catch (error) { next(error); }
};

exports.updateExamType = async (req, res, next) => {
  try {
    const examType = await ExamType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!examType) return res.status(404).json({ success: false, message: 'Exam Type not found' });
    res.status(200).json({ success: true, data: examType });
  } catch (error) { next(error); }
};

exports.deleteExamType = async (req, res, next) => {
  try {
    const examType = await ExamType.findByIdAndDelete(req.params.id);
    if (!examType) return res.status(404).json({ success: false, message: 'Exam Type not found' });
    res.status(200).json({ success: true, message: 'Exam type deleted' });
  } catch (error) { next(error); }
};

// ======================== GRADES ========================
exports.getExamGrades = async (req, res, next) => {
  try {
    const grades = await ExamGrade.find().sort({ minPercentage: -1 });
    res.status(200).json({ success: true, count: grades.length, data: grades });
  } catch (error) { next(error); }
};

exports.createExamGrade = async (req, res, next) => {
  try {
    const grade = await ExamGrade.create(req.body);
    res.status(201).json({ success: true, data: grade });
  } catch (error) { next(error); }
};

exports.updateExamGrade = async (req, res, next) => {
  try {
    const grade = await ExamGrade.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!grade) return res.status(404).json({ success: false, message: 'Grade not found' });
    res.status(200).json({ success: true, data: grade });
  } catch (error) { next(error); }
};

exports.deleteExamGrade = async (req, res, next) => {
  try {
    const grade = await ExamGrade.findByIdAndDelete(req.params.id);
    if (!grade) return res.status(404).json({ success: false, message: 'Grade not found' });
    res.status(200).json({ success: true, message: 'Grade scale deleted' });
  } catch (error) { next(error); }
};

// ======================== COCURRICULAR AREAS ========================
exports.getCocurricularAreas = async (req, res, next) => {
  try {
    const areas = await CocurricularArea.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: areas.length, data: areas });
  } catch (error) { next(error); }
};

exports.createCocurricularArea = async (req, res, next) => {
  try {
    const area = await CocurricularArea.create(req.body);
    res.status(201).json({ success: true, data: area });
  } catch (error) { next(error); }
};

exports.deleteCocurricularArea = async (req, res, next) => {
  try {
    const area = await CocurricularArea.findByIdAndDelete(req.params.id);
    if (!area) return res.status(404).json({ success: false, message: 'Area not found' });
    res.status(200).json({ success: true, message: 'Cocurricular area deleted' });
  } catch (error) { next(error); }
};

// ======================== COCURRICULAR STUDENT GRADES ========================
exports.getCocurricularGrades = async (req, res, next) => {
  try {
    const { examId, className, section } = req.query;
    let query = {};
    if (examId) query.exam = examId;
    if (className) query.className = className;
    if (section && section !== 'All') query.section = section;

    const entries = await CocurricularGradeEntry.find(query).sort({ rollNo: 1 });
    res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (error) { next(error); }
};

exports.saveCocurricularGrades = async (req, res, next) => {
  try {
    const { examId, className, section, records } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Invalid records array' });
    }

    const savedRecords = [];
    for (const item of records) {
      const filter = {
        exam: examId || undefined,
        className: className || item.className,
        ...(item.studentId ? { student: item.studentId } : { rollNo: item.rollNo || item.roll, studentName: item.studentName || item.name })
      };

      const updateData = {
        exam: examId || undefined,
        student: item.studentId || undefined,
        studentName: item.studentName || item.name,
        rollNo: item.rollNo || item.roll,
        admissionNo: item.admissionNo || item.adm || '',
        className: className || item.className,
        section: section || item.section || 'A',
        grades: item.grades || {},
        remarks: item.remarks || ''
      };

      const doc = await CocurricularGradeEntry.findOneAndUpdate(
        filter,
        { $set: updateData },
        { upsert: true, new: true }
      );
      savedRecords.push(doc);
    }

    res.status(200).json({ success: true, count: savedRecords.length, data: savedRecords });
  } catch (error) { next(error); }
};

// ======================== DATESHEET / SCHEDULE ========================
exports.getExamSchedules = async (req, res, next) => {
  try {
    const { examId, classId } = req.query;
    let query = {};
    if (examId) query.exam = examId;
    if (classId) query.academicClass = classId;

    const schedules = await ExamSchedule.find(query)
      .populate('exam', 'examName session status')
      .populate('academicClass', 'className')
      .populate('subject', 'subjectName code')
      .sort({ examDate: 1 });

    res.status(200).json({ success: true, count: schedules.length, data: schedules });
  } catch (error) { next(error); }
};

exports.saveExamSchedule = async (req, res, next) => {
  try {
    const { exam, academicClass, subject, examDate, startTime, endTime, roomNo, maxMarks, passMarks } = req.body;
    let schedule = await ExamSchedule.findOne({ exam, academicClass, subject });
    if (schedule) {
      schedule.examDate = examDate;
      schedule.startTime = startTime || schedule.startTime;
      schedule.endTime = endTime || schedule.endTime;
      schedule.roomNo = roomNo || schedule.roomNo;
      schedule.maxMarks = maxMarks || schedule.maxMarks;
      schedule.passMarks = passMarks || schedule.passMarks;
      await schedule.save();
    } else {
      schedule = await ExamSchedule.create(req.body);
    }
    res.status(200).json({ success: true, data: schedule });
  } catch (error) { next(error); }
};

exports.deleteExamSchedule = async (req, res, next) => {
  try {
    const schedule = await ExamSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule entry not found' });
    res.status(200).json({ success: true, message: 'Schedule deleted' });
  } catch (error) { next(error); }
};

// ======================== MARKS ENTRY & RESULTS ========================
exports.getMarks = async (req, res, next) => {
  try {
    const { examId, classId, sectionId, subjectId, studentId } = req.query;
    let query = {};
    if (examId) query.exam = examId;
    if (classId) query.academicClass = classId;
    if (sectionId) query.academicSection = sectionId;
    if (subjectId) query.subject = subjectId;
    if (studentId) query.student = studentId;

    const results = await ExamResult.find(query)
      .populate('student', 'firstName lastName rollNo admissionNo')
      .populate('subject', 'subjectName code')
      .populate('exam', 'examName');

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) { next(error); }
};

exports.saveMarksBatch = async (req, res, next) => {
  try {
    let marksList = [];
    let exam = req.body?.exam;
    let subject = req.body?.subject;
    let academicClass = req.body?.academicClass;
    let academicSection = req.body?.academicSection;

    if (Array.isArray(req.body)) {
      marksList = req.body;
      if (marksList.length > 0) {
        exam = exam || marksList[0].exam;
        subject = subject || marksList[0].subject;
        academicClass = academicClass || marksList[0].academicClass;
        academicSection = academicSection || marksList[0].academicSection;
      }
    } else if (Array.isArray(req.body?.marksList)) {
      marksList = req.body.marksList;
    } else if (req.body?.student || req.body?.studentId) {
      marksList = [req.body];
    } else {
      return res.status(400).json({ success: false, message: 'Invalid marks data provided' });
    }

    // Load grading system to auto-determine grade
    const grades = await ExamGrade.find().sort({ minPercentage: -1 });

    const saved = [];
    for (const item of marksList) {
      const studentId = item.studentId || item.student || item.id;
      const targetExam = item.exam || exam;
      const targetSubject = item.subject || subject;
      if (!studentId || !targetExam || !targetSubject) continue;

      const marksObtained = Number(item.marksObtained != null ? item.marksObtained : item.marks) || 0;
      const maxMarks = Number(item.maxMarks) || 100;
      const percent = maxMarks > 0 ? (marksObtained / maxMarks) * 100 : 0;
      
      let assignedGrade = 'C';
      if (grades.length > 0) {
        for (const g of grades) {
          if (percent >= g.minPercentage && percent <= g.maxPercentage) {
            assignedGrade = g.name;
            break;
          }
        }
      } else {
        if (percent >= 90) assignedGrade = 'A1';
        else if (percent >= 80) assignedGrade = 'A2';
        else if (percent >= 70) assignedGrade = 'B1';
        else if (percent >= 60) assignedGrade = 'B2';
        else if (percent >= 50) assignedGrade = 'C1';
        else if (percent >= 40) assignedGrade = 'C2';
        else assignedGrade = 'D';
      }

      let existing = await ExamResult.findOne({
        exam: targetExam,
        student: studentId,
        subject: targetSubject
      });

      if (existing) {
        existing.marksObtained = marksObtained;
        existing.maxMarks = maxMarks;
        existing.grade = assignedGrade;
        existing.attendance = item.attendance || 'Present';
        existing.remarks = item.remarks || '';
        if (academicClass || item.academicClass) existing.academicClass = academicClass || item.academicClass;
        if (academicSection || item.academicSection) existing.academicSection = academicSection || item.academicSection;
        await existing.save();
        saved.push(existing);
      } else {
        const created = await ExamResult.create({
          exam: targetExam,
          student: studentId,
          subject: targetSubject,
          academicClass: academicClass || item.academicClass,
          academicSection: academicSection || item.academicSection,
          marksObtained,
          maxMarks,
          grade: assignedGrade,
          attendance: item.attendance || 'Present',
          remarks: item.remarks || ''
        });
        saved.push(created);
      }
    }

    res.status(200).json({ success: true, count: saved.length, data: saved });
  } catch (error) { next(error); }
};

// ======================== STUDENT MARKSHEET / REPORT CARD ========================
exports.getStudentMarksheet = async (req, res, next) => {
  try {
    const { studentId, examId } = req.query;
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId required' });

    const student = await Student.findById(studentId).populate('classId', 'className').populate('sectionId', 'sectionName');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    let query = { student: studentId };
    if (examId) query.exam = examId;

    const results = await ExamResult.find(query)
      .populate('subject', 'subjectName code')
      .populate('exam', 'examName session startDate endDate');

    let totalObtained = 0;
    let totalMax = 0;
    results.forEach(r => {
      totalObtained += Number(r.marksObtained) || 0;
      totalMax += Number(r.maxMarks) || 100;
    });

    const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
    let overallGrade = 'D';
    if (percentage >= 90) overallGrade = 'A1';
    else if (percentage >= 80) overallGrade = 'A2';
    else if (percentage >= 70) overallGrade = 'B1';
    else if (percentage >= 60) overallGrade = 'B2';
    else if (percentage >= 50) overallGrade = 'C1';
    else if (percentage >= 40) overallGrade = 'C2';

    res.status(200).json({
      success: true,
      data: {
        student,
        summary: {
          totalObtained,
          totalMax,
          percentage: Number(percentage),
          grade: overallGrade,
          resultStatus: percentage >= 33 ? 'Passed' : 'Needs Improvement'
        },
        subjects: results.map(r => ({
          subjectName: r.subject?.subjectName || 'Subject',
          code: r.subject?.code || 'SUB',
          marksObtained: r.marksObtained,
          maxMarks: r.maxMarks,
          grade: r.grade,
          attendance: r.attendance,
          remarks: r.remarks
        }))
      }
    });
  } catch (error) { next(error); }
};

// ======================== CLASS MARKSHEETS / BULK VIEW ========================
exports.getClassMarksheets = async (req, res, next) => {
  try {
    const { examId, classId, sectionId } = req.query;
    if (!examId || !classId) {
      return res.status(400).json({ success: false, message: 'examId and classId required' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const cls = await AcademicClass.findById(classId);
    const classNameStr = cls ? cls.className : 'Class';

    let studentQuery = {
      $or: [
        { classId: classId },
        { class: classNameStr }
      ]
    };
    if (sectionId) {
      studentQuery.sectionId = sectionId;
    }

    const students = await Student.find(studentQuery).sort({ rollNo: 1 });
    const studentIds = students.map(s => s._id);

    const results = await ExamResult.find({
      exam: examId,
      student: { $in: studentIds }
    }).populate('subject', 'subjectName code');

    // Group results by student
    const resultsByStudent = {};
    results.forEach(r => {
      const sid = r.student.toString();
      if (!resultsByStudent[sid]) resultsByStudent[sid] = [];
      resultsByStudent[sid].push(r);
    });

    const marksheets = students.map(s => {
      const sResults = resultsByStudent[s._id.toString()] || [];
      let totalObtained = 0;
      let totalMax = 0;
      sResults.forEach(r => {
        totalObtained += Number(r.marksObtained) || 0;
        totalMax += Number(r.maxMarks) || 100;
      });

      const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
      let grade = 'D';
      if (percentage >= 90) grade = 'A1';
      else if (percentage >= 80) grade = 'A2';
      else if (percentage >= 70) grade = 'B1';
      else if (percentage >= 60) grade = 'B2';
      else if (percentage >= 50) grade = 'C1';
      else if (percentage >= 40) grade = 'C2';

      const hasMarks = sResults.length > 0;
      const status = hasMarks ? (percentage >= 33 ? 'Passed' : 'Needs Improvement') : 'Pending';

      return {
        studentId: s._id,
        name: `${s.firstName} ${s.lastName || ''}`.trim(),
        roll: s.rollNo || s.admissionNo || '-',
        admissionNo: s.admissionNo || s.aparId || '',
        class: classNameStr,
        section: s.section || 'A',
        totalObtained,
        totalMax,
        percentage,
        grade,
        status,
        hasMarks,
        subjectCount: sResults.length,
        subjects: sResults.map(r => ({
          subjectName: r.subject?.subjectName || 'Subject',
          marksObtained: r.marksObtained,
          maxMarks: r.maxMarks,
          grade: r.grade,
          attendance: r.attendance,
          remarks: r.remarks
        }))
      };
    });

    res.status(200).json({ success: true, count: marksheets.length, data: marksheets, exam });
  } catch (error) { next(error); }
};

// ======================== ADMIT CARDS ========================
exports.getAdmitCards = async (req, res, next) => {
  try {
    const { examId, classId } = req.query;
    if (!examId || !classId) {
      return res.status(400).json({ success: false, message: 'examId and classId required' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const cls = await AcademicClass.findById(classId);
    const classNameStr = cls ? cls.className : 'Class';

    // 1. Check if Admit Cards were already generated in database
    let existingCards = await AdmitCard.find({ exam: examId, academicClass: classId }).sort({ rollNo: 1 });
    if (existingCards.length > 0) {
      return res.status(200).json({ success: true, count: existingCards.length, data: existingCards });
    }

    // 2. If not yet generated, auto-generate for students in this class
    const students = await Student.find({
      $or: [
        { classId: classId },
        { class: classNameStr }
      ]
    }).sort({ rollNo: 1 });

    let schedules = await ExamSchedule.find({ exam: examId, academicClass: classId })
      .populate('subject', 'subjectName code')
      .sort({ examDate: 1 });

    if (schedules.length === 0) {
      const defaultSubjects = await AcademicSubject.find().limit(5);
      const baseDate = exam.startDate ? new Date(exam.startDate) : new Date();
      schedules = defaultSubjects.map((sub, idx) => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + (idx * 2));
        return {
          examDate: d,
          subject: sub,
          startTime: '09:30 AM',
          endTime: '12:30 PM',
          roomNo: `Hall ${(idx % 3) + 1}`
        };
      });
    }

    const cardsToCreate = students.map(s => ({
      exam: examId,
      examName: exam.examName || exam.name,
      session: exam.session || '2026-2027',
      student: s._id,
      studentName: `${s.firstName} ${s.lastName || ''}`.trim(),
      academicClass: classId,
      className: classNameStr,
      section: s.sectionId || undefined,
      sectionName: s.section || 'A',
      rollNo: s.rollNo || '1',
      admissionNo: s.admissionNo || s.aparId || 'ADM-001',
      admitCardNo: `AC-${exam.session ? exam.session.slice(0, 4) : '2026'}-${s.rollNo || s.admissionNo || s._id.toString().slice(-4)}`,
      examCenter: 'Springdale Central Campus - Main Exam Block',
      roomNo: 'Examination Hall 1',
      instructions: '1. Carry this admit card to the examination hall daily.\n2. Arrive 30 minutes before the scheduled time.\n3. Electronic gadgets and smart watches are strictly prohibited.',
      timetable: schedules.map(sch => ({
        date: new Date(sch.examDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        subject: sch.subject?.subjectName || 'Subject',
        subjectCode: sch.subject?.code || 'SUB',
        time: `${sch.startTime} - ${sch.endTime}`,
        room: sch.roomNo
      })),
      status: 'Generated'
    }));

    let savedCards = [];
    if (cardsToCreate.length > 0) {
      savedCards = await AdmitCard.insertMany(cardsToCreate);
    }

    res.status(200).json({ success: true, count: savedCards.length, data: savedCards });
  } catch (error) { next(error); }
};

exports.updateAdmitCard = async (req, res, next) => {
  try {
    const card = await AdmitCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!card) return res.status(404).json({ success: false, message: 'Admit Card not found' });
    res.status(200).json({ success: true, data: card, message: 'Admit Card details updated successfully' });
  } catch (error) { next(error); }
};

exports.generateAdmitCardsBatch = async (req, res, next) => {
  try {
    const { examId, classId, examCenter, roomNo, instructions } = req.body;
    if (!examId || !classId) {
      return res.status(400).json({ success: false, message: 'examId and classId required' });
    }

    // Delete existing cards for this exam & class
    await AdmitCard.deleteMany({ exam: examId, academicClass: classId });

    // Fetch exam, class and students
    const exam = await Exam.findById(examId);
    const cls = await AcademicClass.findById(classId);
    const classNameStr = cls ? cls.className : 'Class';

    const students = await Student.find({
      $or: [{ classId: classId }, { class: classNameStr }]
    }).sort({ rollNo: 1 });

    const defaultSubjects = await AcademicSubject.find().limit(5);
    const baseDate = exam.startDate ? new Date(exam.startDate) : new Date();
    const schedules = defaultSubjects.map((sub, idx) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + (idx * 2));
      return {
        date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        subject: sub.subjectName,
        subjectCode: sub.code || 'SUB',
        time: '09:30 AM - 12:30 PM',
        room: roomNo || 'Hall 1'
      };
    });

    const cardsToCreate = students.map(s => ({
      exam: examId,
      examName: exam.examName || exam.name,
      session: exam.session || '2026-2027',
      student: s._id,
      studentName: `${s.firstName} ${s.lastName || ''}`.trim(),
      academicClass: classId,
      className: classNameStr,
      section: s.sectionId || undefined,
      sectionName: s.section || 'A',
      rollNo: s.rollNo || '1',
      admissionNo: s.admissionNo || s.aparId || 'ADM-001',
      admitCardNo: `AC-${exam.session ? exam.session.slice(0, 4) : '2026'}-${s.rollNo || s.admissionNo || s._id.toString().slice(-4)}`,
      examCenter: examCenter || 'Springdale Central Campus - Main Exam Block',
      roomNo: roomNo || 'Examination Hall 1',
      instructions: instructions || '1. Carry this admit card to the examination hall daily.\n2. Arrive 30 minutes before the scheduled time.\n3. Electronic gadgets and smart watches are strictly prohibited.',
      timetable: schedules,
      status: 'Generated'
    }));

    const savedCards = await AdmitCard.insertMany(cardsToCreate);
    res.status(200).json({ success: true, count: savedCards.length, data: savedCards });
  } catch (error) { next(error); }
};

exports.deleteAdmitCard = async (req, res, next) => {
  try {
    const card = await AdmitCard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: 'Admit Card not found' });
    res.status(200).json({ success: true, message: 'Admit Card removed successfully' });
  } catch (error) { next(error); }
};

// ======================== EDIT STUDENT MARKSHEET ========================
exports.updateStudentMarksheet = async (req, res, next) => {
  try {
    const { examId, studentId, academicClass, subjects } = req.body;
    if (!examId || !studentId || !Array.isArray(subjects)) {
      return res.status(400).json({ success: false, message: 'examId, studentId, and subjects array required' });
    }

    const grades = await ExamGrade.find().sort({ minPercentage: -1 });
    const updatedResults = [];

    for (const item of subjects) {
      if (!item.subjectId && !item.subject) continue;
      const subId = item.subjectId || item.subject;
      const marksObtained = Number(item.marksObtained) || 0;
      const maxMarks = Number(item.maxMarks) || 100;
      const percent = maxMarks > 0 ? (marksObtained / maxMarks) * 100 : 0;

      let assignedGrade = 'C';
      if (grades.length > 0) {
        for (const g of grades) {
          if (percent >= g.minPercentage && percent <= g.maxPercentage) {
            assignedGrade = g.name;
            break;
          }
        }
      } else {
        if (percent >= 90) assignedGrade = 'A1';
        else if (percent >= 80) assignedGrade = 'A2';
        else if (percent >= 70) assignedGrade = 'B1';
        else if (percent >= 60) assignedGrade = 'B2';
        else if (percent >= 50) assignedGrade = 'C1';
        else if (percent >= 40) assignedGrade = 'C2';
        else assignedGrade = 'D';
      }

      let existing = await ExamResult.findOne({
        exam: examId,
        student: studentId,
        subject: subId
      });

      if (existing) {
        existing.marksObtained = marksObtained;
        existing.maxMarks = maxMarks;
        existing.grade = assignedGrade;
        existing.attendance = item.attendance || 'Present';
        existing.remarks = item.remarks || '';
        if (academicClass) existing.academicClass = academicClass;
        await existing.save();
        updatedResults.push(existing);
      } else {
        const created = await ExamResult.create({
          exam: examId,
          student: studentId,
          subject: subId,
          academicClass: academicClass || undefined,
          marksObtained,
          maxMarks,
          grade: assignedGrade,
          attendance: item.attendance || 'Present',
          remarks: item.remarks || ''
        });
        updatedResults.push(created);
      }
    }

    res.status(200).json({ success: true, count: updatedResults.length, data: updatedResults, message: 'Marksheet updated successfully!' });
  } catch (error) { next(error); }
};

// ======================== UPLOADED MARKSHEETS ========================
exports.uploadMarksheet = async (req, res, next) => {
  try {
    const { 
      student, 
      studentName, 
      admissionNo, 
      academicClass, 
      className, 
      section, 
      sectionName, 
      exam, 
      examName, 
      docTitle, 
      fileName, 
      fileUrl, 
      fileSize, 
      uploadedBy, 
      remarks 
    } = req.body;

    if (!docTitle) {
      return res.status(400).json({ success: false, message: 'Document title is required' });
    }

    let finalStudentName = studentName;
    let finalAdmissionNo = admissionNo;
    let finalClassName = className;
    let finalSectionName = sectionName;
    let finalExamName = examName;

    if (student && (!finalStudentName || !finalAdmissionNo)) {
      const s = await Student.findById(student);
      if (s) {
        finalStudentName = finalStudentName || `${s.firstName} ${s.lastName || ''}`.trim();
        finalAdmissionNo = finalAdmissionNo || s.admissionNo || s.aparId;
      }
    }
    if (academicClass && !finalClassName) {
      const c = await AcademicClass.findById(academicClass);
      if (c) finalClassName = c.className;
    }
    if (exam && !finalExamName) {
      const ex = await Exam.findById(exam);
      if (ex) finalExamName = ex.examName || ex.name;
    }

    const newMarksheet = await MarksheetUpload.create({
      student: student || undefined,
      studentName: finalStudentName || 'Student',
      admissionNo: finalAdmissionNo || '',
      academicClass: academicClass || undefined,
      className: finalClassName || '',
      section: section || undefined,
      sectionName: finalSectionName || 'A',
      exam: exam || undefined,
      examName: finalExamName || 'General Exam',
      docTitle,
      fileName: fileName || `${docTitle.replace(/\s+/g, '_')}.pdf`,
      fileUrl: fileUrl || '/uploads/marksheets/sample_marksheet.pdf',
      fileSize: fileSize || '1.2 MB',
      uploadedBy: uploadedBy || 'Teacher Faculty',
      remarks: remarks || ''
    });

    res.status(201).json({ success: true, data: newMarksheet, message: 'Marksheet uploaded successfully' });
  } catch (error) { next(error); }
};

exports.updateUploadedMarksheet = async (req, res, next) => {
  try {
    const item = await MarksheetUpload.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Marksheet record not found' });
    res.status(200).json({ success: true, data: item, message: 'Marksheet record updated successfully' });
  } catch (error) { next(error); }
};

exports.getUploadedMarksheets = async (req, res, next) => {
  try {
    const { classId, sectionId, studentId, examId, search } = req.query;
    let query = {};
    if (classId) query.academicClass = classId;
    if (sectionId) query.section = sectionId;
    if (studentId) query.student = studentId;
    if (examId) query.exam = examId;
    if (search) {
      query.$or = [
        { docTitle: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { examName: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await MarksheetUpload.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) { next(error); }
};

exports.deleteUploadedMarksheet = async (req, res, next) => {
  try {
    const item = await MarksheetUpload.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Marksheet record not found' });
    res.status(200).json({ success: true, message: 'Uploaded marksheet removed' });
  } catch (error) { next(error); }
};
