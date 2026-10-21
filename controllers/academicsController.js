const AcademicClass = require('../models/AcademicClass');
const AcademicSection = require('../models/AcademicSection');
const AcademicSubject = require('../models/AcademicSubject');
const AcademicSession = require('../models/AcademicSession');
const PeriodSet = require('../models/PeriodSet');
const Timetable = require('../models/Timetable');
const ClassTeacher = require('../models/ClassTeacher');
const Student = require('../models/Student');
const Staff = require('../models/Staff');

// ======================== DASHBOARD STATS ========================
exports.getAcademicDashboardStats = async (req, res, next) => {
  try {
    const [
      totalClasses,
      totalSections,
      totalSubjects,
      totalPeriodSets,
      totalTimetableSlots,
      currentSession,
      allSessions,
      classesWithSections,
      totalStudents,
      teachersCount
    ] = await Promise.all([
      AcademicClass.countDocuments({ status: 'active' }),
      AcademicSection.countDocuments({ status: 'active' }),
      AcademicSubject.countDocuments({ status: 'active' }),
      PeriodSet.countDocuments(),
      Timetable.countDocuments(),
      AcademicSession.findOne({ isCurrent: true }),
      AcademicSession.find().sort({ createdAt: -1 }),
      AcademicClass.find({ status: 'active' }).populate('sections').sort({ numericValue: 1 }),
      Student.countDocuments({ status: 'Active' }),
      Staff.countDocuments()
    ]);

    // Calculate students per class distribution
    const classDistribution = await Promise.all(
      classesWithSections.map(async (cls) => {
        const count = await Student.countDocuments({ classId: cls._id, status: 'Active' });
        return {
          name: cls.className,
          students: count,
          sectionsCount: cls.sections ? cls.sections.length : 0
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalClasses,
        totalSections,
        totalSubjects,
        totalPeriodSets,
        totalTimetableSlots,
        totalStudents,
        teachersCount,
        currentSession: currentSession || (allSessions.length > 0 ? allSessions[0] : null),
        classDistribution
      }
    });
  } catch (error) { next(error); }
};

// ======================== TEACHERS HELPER ========================
exports.getAcademicTeachers = async (req, res, next) => {
  try {
    const teachers = await Staff.find()
      .select('fullName staffId designation department email phone')
      .sort({ fullName: 1 });
    res.status(200).json({ success: true, count: teachers.length, data: teachers });
  } catch (error) { next(error); }
};

// ======================== CLASSES ========================
exports.createClass = async (req, res, next) => {
  try {
    const { className, numericValue, sections, classTeacher, assignedSubjects, status } = req.body;
    const newClass = await AcademicClass.create({
      className,
      numericValue: numericValue || 1,
      sections: sections || [],
      classTeacher: classTeacher || null,
      assignedSubjects: assignedSubjects || [],
      status: status || 'active'
    });
    const populated = await AcademicClass.findById(newClass._id)
      .populate('sections')
      .populate('classTeacher')
      .populate('assignedSubjects');
    res.status(201).json({ success: true, data: populated });
  } catch (error) { next(error); }
};

exports.getClasses = async (req, res, next) => {
  try {
    const classes = await AcademicClass.find()
      .populate('sections')
      .populate('classTeacher')
      .populate('assignedSubjects')
      .sort({ numericValue: 1 });

    // Attach live student counts
    const classesWithCount = await Promise.all(classes.map(async (cls) => {
      const studentCount = await Student.countDocuments({ classId: cls._id, status: 'Active' });
      const obj = cls.toObject();
      obj.enrolledCount = studentCount;
      return obj;
    }));

    res.status(200).json({ success: true, count: classesWithCount.length, data: classesWithCount });
  } catch (error) { next(error); }
};

exports.updateClass = async (req, res, next) => {
  try {
    const updated = await AcademicClass.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('sections')
      .populate('classTeacher')
      .populate('assignedSubjects');
    if (!updated) return res.status(404).json({ success: false, message: 'Class not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) { next(error); }
};

exports.deleteClass = async (req, res, next) => {
  try {
    const deleted = await AcademicClass.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Class not found' });
    res.status(200).json({ success: true, message: 'Class deleted successfully' });
  } catch (error) { next(error); }
};

exports.assignSectionToClass = async (req, res, next) => {
  try {
    const { classId, sectionId } = req.body;
    const academicClass = await AcademicClass.findById(classId);
    if (!academicClass) return res.status(404).json({ success: false, message: 'Class not found' });
    
    if (!academicClass.sections.includes(sectionId)) {
      academicClass.sections.push(sectionId);
      await academicClass.save();
    }
    const populated = await AcademicClass.findById(classId).populate('sections');
    res.status(200).json({ success: true, data: populated });
  } catch (error) { next(error); }
};

// ======================== SECTIONS ========================
exports.createSection = async (req, res, next) => {
  try {
    const newSection = await AcademicSection.create(req.body);
    res.status(201).json({ success: true, data: newSection });
  } catch (error) { next(error); }
};

exports.getSections = async (req, res, next) => {
  try {
    const sections = await AcademicSection.find().sort({ sectionName: 1 });
    
    // Attach live student counts
    const sectionsWithCount = await Promise.all(sections.map(async (sec) => {
      const studentCount = await Student.countDocuments({ sectionId: sec._id, status: 'Active' });
      const obj = sec.toObject();
      obj.enrolledCount = studentCount;
      return obj;
    }));

    res.status(200).json({ success: true, count: sectionsWithCount.length, data: sectionsWithCount });
  } catch (error) { next(error); }
};

exports.updateSection = async (req, res, next) => {
  try {
    const updated = await AcademicSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Section not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) { next(error); }
};

exports.deleteSection = async (req, res, next) => {
  try {
    const deleted = await AcademicSection.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Section not found' });
    res.status(200).json({ success: true, message: 'Section deleted successfully' });
  } catch (error) { next(error); }
};

// ======================== SUBJECTS ========================
exports.createSubject = async (req, res, next) => {
  try {
    const newSubject = await AcademicSubject.create(req.body);
    res.status(201).json({ success: true, data: newSubject });
  } catch (error) { next(error); }
};

exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await AcademicSubject.find().sort({ subjectName: 1 });
    res.status(200).json({ success: true, count: subjects.length, data: subjects });
  } catch (error) { next(error); }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const updated = await AcademicSubject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) { next(error); }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    const deleted = await AcademicSubject.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) { next(error); }
};

// ======================== SESSIONS ========================
exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await AcademicSession.find().sort({ startDate: -1 });
    
    // Attach enrolled student counts
    const sessionsWithStats = await Promise.all(sessions.map(async (sess) => {
      const studentCount = await Student.countDocuments({ academicSessionId: sess._id, status: 'Active' });
      const obj = sess.toObject();
      obj.studentsCount = studentCount || 0;
      return obj;
    }));

    res.status(200).json({ success: true, count: sessionsWithStats.length, data: sessionsWithStats });
  } catch (error) { next(error); }
};

exports.createSession = async (req, res, next) => {
  try {
    const { name, startDate, endDate, isCurrent, status, description } = req.body;
    
    // If setting as current, reset other sessions
    if (isCurrent) {
      await AcademicSession.updateMany({}, { isCurrent: false, status: 'Active' });
    }

    const newSession = await AcademicSession.create({
      name,
      startDate,
      endDate,
      isCurrent: isCurrent || false,
      status: isCurrent ? 'Current' : (status || 'Active'),
      description: description || ''
    });

    res.status(201).json({ success: true, data: newSession });
  } catch (error) { next(error); }
};

exports.updateSession = async (req, res, next) => {
  try {
    const { isCurrent } = req.body;
    if (isCurrent) {
      await AcademicSession.updateMany({ _id: { $ne: req.params.id } }, { isCurrent: false });
    }
    const updated = await AcademicSession.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Session not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) { next(error); }
};

exports.setCurrentSession = async (req, res, next) => {
  try {
    await AcademicSession.updateMany({}, { isCurrent: false, status: 'Active' });
    const current = await AcademicSession.findByIdAndUpdate(
      req.params.id,
      { isCurrent: true, status: 'Current' },
      { new: true }
    );
    if (!current) return res.status(404).json({ success: false, message: 'Session not found' });
    res.status(200).json({ success: true, data: current });
  } catch (error) { next(error); }
};

exports.deleteSession = async (req, res, next) => {
  try {
    const deleted = await AcademicSession.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Session not found' });
    res.status(200).json({ success: true, message: 'Session deleted successfully' });
  } catch (error) { next(error); }
};

// ======================== ASSIGN SUBJECTS ========================
exports.assignSubjectsToClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { subjectIds } = req.body;
    const updatedClass = await AcademicClass.findByIdAndUpdate(
      classId,
      { assignedSubjects: subjectIds },
      { new: true }
    ).populate('assignedSubjects');
    if (!updatedClass) return res.status(404).json({ success: false, message: 'Class not found' });
    res.status(200).json({ success: true, data: updatedClass });
  } catch (error) { next(error); }
};

exports.assignSubjectsBulk = async (req, res, next) => {
  try {
    const { assignments } = req.body; // { classId: [subjectId, ...] }
    const results = [];
    for (const [classId, subjectIds] of Object.entries(assignments)) {
      const updated = await AcademicClass.findByIdAndUpdate(
        classId,
        { assignedSubjects: subjectIds },
        { new: true }
      );
      if (updated) results.push(updated);
    }
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) { next(error); }
};

// ======================== CLASS TEACHERS ========================
exports.getClassTeacherAssignments = async (req, res, next) => {
  try {
    const assignments = await ClassTeacher.find()
      .populate('classId')
      .populate('sectionId')
      .populate('teacherId');
    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) { next(error); }
};

exports.assignClassTeacher = async (req, res, next) => {
  try {
    const { classId, sectionId, teacherId, academicSessionId } = req.body;
    
    // Upsert assignment for class & section
    const assignment = await ClassTeacher.findOneAndUpdate(
      { classId, sectionId },
      { teacherId, academicSessionId, status: 'active' },
      { new: true, upsert: true }
    )
      .populate('classId')
      .populate('sectionId')
      .populate('teacherId');

    // Also update classTeacher reference in AcademicClass
    await AcademicClass.findByIdAndUpdate(classId, { classTeacher: teacherId });

    res.status(200).json({ success: true, data: assignment });
  } catch (error) { next(error); }
};

exports.deleteClassTeacherAssignment = async (req, res, next) => {
  try {
    const deleted = await ClassTeacher.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.status(200).json({ success: true, message: 'Teacher assignment removed' });
  } catch (error) { next(error); }
};

// ======================== ELECTIVES ========================
exports.getStudentsForElectives = async (req, res, next) => {
  try {
    const { classId, sectionId } = req.query;
    const query = { status: 'Active' };
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;

    const students = await Student.find(query)
      .populate('classId')
      .populate('sectionId')
      .populate('electives')
      .select('firstName lastName admissionNo rollNo aparId classId sectionId electives')
      .sort({ firstName: 1 });

    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) { next(error); }
};

exports.assignStudentElectives = async (req, res, next) => {
  try {
    const { studentId, electiveIds } = req.body;
    const student = await Student.findByIdAndUpdate(
      studentId,
      { electives: electiveIds },
      { new: true }
    ).populate('electives');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(200).json({ success: true, data: student });
  } catch (error) { next(error); }
};

exports.bulkAssignElectives = async (req, res, next) => {
  try {
    const { assignments } = req.body; // [ { studentId, electiveIds: [] } ]
    const updated = [];
    for (const item of assignments) {
      const s = await Student.findByIdAndUpdate(
        item.studentId,
        { electives: item.electiveIds },
        { new: true }
      );
      if (s) updated.push(s);
    }
    res.status(200).json({ success: true, count: updated.length, message: 'Electives assigned successfully' });
  } catch (error) { next(error); }
};

// ======================== PERIOD SETS ========================
exports.getPeriodSets = async (req, res, next) => {
  try {
    const sets = await PeriodSet.find().populate('assignedClasses').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: sets.length, data: sets });
  } catch (error) { next(error); }
};

exports.createPeriodSet = async (req, res, next) => {
  try {
    const { name, isDefault, periods, assignedClasses } = req.body;
    if (isDefault) {
      await PeriodSet.updateMany({}, { isDefault: false });
    }
    const newSet = await PeriodSet.create({
      name,
      isDefault: isDefault || false,
      periods: periods || [],
      assignedClasses: assignedClasses || []
    });
    const populated = await PeriodSet.findById(newSet._id).populate('assignedClasses');
    res.status(201).json({ success: true, data: populated });
  } catch (error) { next(error); }
};

exports.updatePeriodSet = async (req, res, next) => {
  try {
    const { isDefault } = req.body;
    if (isDefault) {
      await PeriodSet.updateMany({ _id: { $ne: req.params.id } }, { isDefault: false });
    }
    const updated = await PeriodSet.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedClasses');
    if (!updated) return res.status(404).json({ success: false, message: 'Period set not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) { next(error); }
};

exports.deletePeriodSet = async (req, res, next) => {
  try {
    const deleted = await PeriodSet.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Period set not found' });
    res.status(200).json({ success: true, message: 'Period set deleted' });
  } catch (error) { next(error); }
};

// ======================== TIMETABLE ========================
exports.getTimetable = async (req, res, next) => {
  try {
    const { classId, sectionId } = req.query;
    const query = {};
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;

    const slots = await Timetable.find(query)
      .populate('classId')
      .populate('sectionId')
      .populate('subjectId')
      .populate('teacherId')
      .sort({ day: 1, periodNumber: 1 });

    res.status(200).json({ success: true, count: slots.length, data: slots });
  } catch (error) { next(error); }
};

exports.saveTimetableSlot = async (req, res, next) => {
  try {
    const { classId, sectionId, day, periodNumber, periodName, startTime, endTime, subjectId, teacherId, roomNumber } = req.body;
    
    const slot = await Timetable.findOneAndUpdate(
      { classId, sectionId, day, periodNumber },
      { periodName, startTime, endTime, subjectId, teacherId, roomNumber },
      { new: true, upsert: true }
    )
      .populate('subjectId')
      .populate('teacherId');

    res.status(200).json({ success: true, data: slot });
  } catch (error) { next(error); }
};

exports.deleteTimetableSlot = async (req, res, next) => {
  try {
    const deleted = await Timetable.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Slot not found' });
    res.status(200).json({ success: true, message: 'Slot deleted successfully' });
  } catch (error) { next(error); }
};

// ======================== PROMOTION & ROLLOVER ========================
exports.getEligibleStudentsForPromotion = async (req, res, next) => {
  try {
    const { classId, sectionId } = req.query;
    if (!classId) return res.status(400).json({ success: false, message: 'Class is required' });

    const query = { classId, status: 'Active' };
    if (sectionId) query.sectionId = sectionId;

    const students = await Student.find(query)
      .populate('classId')
      .populate('sectionId')
      .select('firstName lastName admissionNo rollNo aparId classId sectionId academicSessionId status')
      .sort({ firstName: 1 });

    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) { next(error); }
};

exports.promoteStudents = async (req, res, next) => {
  try {
    const { studentIds, targetClassId, targetSectionId, targetSessionId } = req.body;
    if (!studentIds || !studentIds.length || !targetClassId) {
      return res.status(400).json({ success: false, message: 'Students and target class are required' });
    }

    const updateFields = {
      classId: targetClassId,
      ...(targetSectionId && { sectionId: targetSectionId }),
      ...(targetSessionId && { academicSessionId: targetSessionId })
    };

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: updateFields }
    );

    res.status(200).json({
      success: true,
      message: `Successfully promoted ${result.modifiedCount} student(s)`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) { next(error); }
};

exports.executeYearEndRollover = async (req, res, next) => {
  try {
    const { mappings, targetSessionId } = req.body;
    // mappings: [ { fromClassId, fromSectionId, toClassId, toSectionId, action: 'promote'|'graduate'|'hold' } ]
    let promotedTotal = 0;
    let graduatedTotal = 0;

    for (const map of mappings) {
      const query = { classId: map.fromClassId, status: 'Active' };
      if (map.fromSectionId) query.sectionId = map.fromSectionId;

      if (map.action === 'graduate') {
        const resGrad = await Student.updateMany(query, { $set: { status: 'Exited' } });
        graduatedTotal += resGrad.modifiedCount;
      } else if (map.action === 'promote' && map.toClassId) {
        const updateData = {
          classId: map.toClassId,
          ...(map.toSectionId && { sectionId: map.toSectionId }),
          ...(targetSessionId && { academicSessionId: targetSessionId })
        };
        const resProm = await Student.updateMany(query, { $set: updateData });
        promotedTotal += resProm.modifiedCount;
      }
    }

    res.status(200).json({
      success: true,
      message: `Rollover complete: ${promotedTotal} promoted, ${graduatedTotal} graduated`,
      data: { promotedTotal, graduatedTotal }
    });
  } catch (error) { next(error); }
};
