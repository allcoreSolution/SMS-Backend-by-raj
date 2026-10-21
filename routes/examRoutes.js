const express = require('express');
const router = express.Router();
const {
  getExamDashboardStats,
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getExamTypes,
  createExamType,
  updateExamType,
  deleteExamType,
  getExamGrades,
  createExamGrade,
  updateExamGrade,
  deleteExamGrade,
  getCocurricularAreas,
  createCocurricularArea,
  deleteCocurricularArea,
  getCocurricularGrades,
  saveCocurricularGrades,
  getExamSchedules,
  saveExamSchedule,
  deleteExamSchedule,
  getMarks,
  saveMarksBatch,
  getStudentMarksheet,
  getClassMarksheets,
  updateStudentMarksheet,
  getAdmitCards,
  updateAdmitCard,
  generateAdmitCardsBatch,
  deleteAdmitCard,
  uploadMarksheet,
  getUploadedMarksheets,
  updateUploadedMarksheet,
  deleteUploadedMarksheet
} = require('../controllers/examController');

// Dashboard
router.get('/dashboard-stats', getExamDashboardStats);

// Exam Types
router.get('/types', getExamTypes);
router.post('/types', createExamType);
router.put('/types/:id', updateExamType);
router.delete('/types/:id', deleteExamType);

// Grades
router.get('/grades', getExamGrades);
router.post('/grades', createExamGrade);
router.put('/grades/:id', updateExamGrade);
router.delete('/grades/:id', deleteExamGrade);

// Cocurricular
router.get('/cocurricular', getCocurricularAreas);
router.post('/cocurricular', createCocurricularArea);
router.delete('/cocurricular/:id', deleteCocurricularArea);
router.get('/cocurricular-grades', getCocurricularGrades);
router.post('/cocurricular-grades', saveCocurricularGrades);

// Schedules / Datesheet
router.get('/schedules', getExamSchedules);
router.post('/schedules', saveExamSchedule);
router.delete('/schedules/:id', deleteExamSchedule);

// Marks Entry
router.get('/marks', getMarks);
router.post('/marks', saveMarksBatch);

// Marksheet & Admit Cards
router.get('/marksheet', getStudentMarksheet);
router.put('/marksheet/student', updateStudentMarksheet);
router.get('/class-marksheets', getClassMarksheets);

// Admit Cards Full CRUD
router.get('/admit-cards', getAdmitCards);
router.post('/admit-cards/generate', generateAdmitCardsBatch);
router.put('/admit-cards/:id', updateAdmitCard);
router.patch('/admit-cards/:id', updateAdmitCard);
router.delete('/admit-cards/:id', deleteAdmitCard);

// Uploaded Marksheets
router.get('/uploaded-marksheets', getUploadedMarksheets);
router.post('/upload-marksheet', uploadMarksheet);
router.put('/uploaded-marksheets/:id', updateUploadedMarksheet);
router.patch('/uploaded-marksheets/:id', updateUploadedMarksheet);
router.delete('/uploaded-marksheets/:id', deleteUploadedMarksheet);

// Exams Core CRUD
router.get('/', getExams);
router.post('/', createExam);
router.get('/:id', getExamById);
router.put('/:id', updateExam);
router.patch('/:id', updateExam);
router.delete('/:id', deleteExam);

// Backward Compatibility aliases
router.get('/exam-schedule', getExams);
router.post('/exam-schedule', createExam);
router.get('/results', getMarks);
router.post('/results', saveMarksBatch);

module.exports = router;
