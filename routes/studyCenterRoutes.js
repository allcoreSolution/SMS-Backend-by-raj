const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSyllabus,
  createSyllabusUnit,
  updateSyllabusUnit,
  deleteSyllabusUnit,
  getClasswork,
  createClasswork,
  updateClasswork,
  deleteClasswork,
  getResources,
  createResource,
  updateResource,
  incrementResourceDownload,
  deleteResource,
  getHomework,
  createHomework,
  updateHomework,
  evaluateHomework,
  deleteHomework
} = require('../controllers/studyCenterController');
const { uploadAttachment } = require('../middleware/uploadMiddleware');

// 1. Dashboard Aggregate Stats
router.get('/stats', getDashboardStats);

// 2. Syllabus Routes
router.get('/syllabus', getSyllabus);
router.post('/syllabus', createSyllabusUnit);
router.put('/syllabus/:id', updateSyllabusUnit);
router.delete('/syllabus/:id', deleteSyllabusUnit);

// 3. Classwork & Logbook Routes
router.get('/classwork', getClasswork);
router.post('/classwork', uploadAttachment, createClasswork);
router.put('/classwork/:id', uploadAttachment, updateClasswork);
router.delete('/classwork/:id', deleteClasswork);

// 4. Learning Resources Routes
router.get('/resources', getResources);
router.post('/resources', uploadAttachment, createResource);
router.put('/resources/:id', uploadAttachment, updateResource);
router.post('/resources/:id/download', incrementResourceDownload);
router.delete('/resources/:id', deleteResource);

// 5. Homework & Assignments Routes
router.get('/homework', getHomework);
router.post('/homework', uploadAttachment, createHomework);
router.put('/homework/:id', uploadAttachment, updateHomework);
router.post('/homework/:id/evaluate', evaluateHomework);
router.delete('/homework/:id', deleteHomework);

module.exports = router;

