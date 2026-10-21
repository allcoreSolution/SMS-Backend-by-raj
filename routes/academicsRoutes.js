const express = require('express');
const router = express.Router();
const { 
  getAcademicDashboardStats,
  getAcademicTeachers,
  // Classes
  createClass, getClasses, updateClass, deleteClass, assignSectionToClass,
  // Sections
  createSection, getSections, updateSection, deleteSection,
  // Subjects
  createSubject, getSubjects, updateSubject, deleteSubject,
  // Sessions
  getSessions, createSession, updateSession, setCurrentSession, deleteSession,
  // Subject Assignments
  assignSubjectsToClass, assignSubjectsBulk,
  // Teacher Assignments
  getClassTeacherAssignments, assignClassTeacher, deleteClassTeacherAssignment,
  // Electives
  getStudentsForElectives, assignStudentElectives, bulkAssignElectives,
  // Period Sets
  getPeriodSets, createPeriodSet, updatePeriodSet, deletePeriodSet,
  // Timetable
  getTimetable, saveTimetableSlot, deleteTimetableSlot,
  // Promotion & Rollover
  getEligibleStudentsForPromotion, promoteStudents, executeYearEndRollover
} = require('../controllers/academicsController');

// Dashboard & Helpers
router.get('/dashboard-stats', getAcademicDashboardStats);
router.get('/teachers', getAcademicTeachers);

// Class Routes
router.get('/classes', getClasses);
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);
router.post('/classes/assign-section', assignSectionToClass);
router.post('/classes/:classId/assign-subjects', assignSubjectsToClass);
router.post('/classes/assign-subjects-bulk', assignSubjectsBulk);

// Section Routes
router.get('/sections', getSections);
router.post('/sections', createSection);
router.put('/sections/:id', updateSection);
router.delete('/sections/:id', deleteSection);

// Subject Routes
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

// Session Routes
router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.put('/sessions/:id', updateSession);
router.put('/sessions/:id/set-current', setCurrentSession);
router.delete('/sessions/:id', deleteSession);

// Class Teacher Assignment Routes
router.get('/class-teachers', getClassTeacherAssignments);
router.post('/class-teachers', assignClassTeacher);
router.delete('/class-teachers/:id', deleteClassTeacherAssignment);

// Elective Assignment Routes
router.get('/electives/students', getStudentsForElectives);
router.post('/electives/assign', assignStudentElectives);
router.post('/electives/bulk-assign', bulkAssignElectives);

// Period Set Routes
router.get('/periods', getPeriodSets);
router.post('/periods', createPeriodSet);
router.put('/periods/:id', updatePeriodSet);
router.delete('/periods/:id', deletePeriodSet);

// Timetable Routes
router.get('/timetable', getTimetable);
router.post('/timetable/save-slot', saveTimetableSlot);
router.delete('/timetable/slot/:id', deleteTimetableSlot);

// Promotion & Rollover Routes
router.get('/promote/eligible-students', getEligibleStudentsForPromotion);
router.post('/promote/execute', promoteStudents);
router.post('/rollover/execute', executeYearEndRollover);

module.exports = router;
