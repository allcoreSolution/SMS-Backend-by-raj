const express = require('express');
const router = express.Router();
const {
  getComplianceOverview,
  getSchoolProfile,
  updateSchoolProfile,
  getPacks,
  togglePackInstall,
  getFieldSettings,
  updateFieldSettings,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  getChecklist,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  runDataValidator,
  getGovernmentReports
} = require('../controllers/complianceController');

// 1. Overview & Metrics
router.get('/overview', getComplianceOverview);

// 2. School Profile
router.get('/school-profile', getSchoolProfile);
router.put('/school-profile', updateSchoolProfile);

// 3. Compliance Packs
router.get('/packs', getPacks);
router.post('/packs/toggle', togglePackInstall);

// 4. Field Settings
router.get('/field-settings', getFieldSettings);
router.put('/field-settings', updateFieldSettings);

// 5. Statutory Document Vault
router.get('/documents', getDocuments);
router.post('/documents', createDocument);
router.put('/documents/:id', updateDocument);
router.delete('/documents/:id', deleteDocument);

// 6. Compliance Checklist
router.get('/checklist', getChecklist);
router.post('/checklist', createChecklistItem);
router.put('/checklist/:id', updateChecklistItem);
router.delete('/checklist/:id', deleteChecklistItem);

// 7. Calendar Events
router.get('/calendar', getCalendarEvents);
router.post('/calendar', createCalendarEvent);
router.delete('/calendar/:id', deleteCalendarEvent);

// 8. Data Quality & Validator
router.get('/data-validator', runDataValidator);

// 9. Government Reports
router.get('/government-reports', getGovernmentReports);

module.exports = router;
