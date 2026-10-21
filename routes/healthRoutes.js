const express = require('express');
const router = express.Router();
const {
  // Staff Health Records
  getMyStaffHealthRecord,
  createVisitRecord,
  updateVisitRecord,
  deleteVisitRecord,
  addVaccination,
  updateVaccination,
  deleteVaccination,
  addMedication,
  updateMedication,
  deleteMedication,
  updateMedicalProfile,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,

  // Student Health Records (Legacy)
  getHealthRecords,
  getStudentHealth,
  updateHealthRecord,
  deleteHealthRecord
} = require('../controllers/healthController');

// Staff / Teacher Health Record Endpoints (specific paths FIRST)
router.get('/my-records', getMyStaffHealthRecord);

// Medical Visit Records
router.post('/records', createVisitRecord);
router.put('/records/:id', updateVisitRecord);
router.delete('/records/:id', deleteVisitRecord);

// Vaccinations
router.post('/vaccinations', addVaccination);
router.put('/vaccinations/:id', updateVaccination);
router.delete('/vaccinations/:id', deleteVaccination);

// Medications
router.post('/medications', addMedication);
router.put('/medications/:id', updateMedication);
router.delete('/medications/:id', deleteMedication);

// Medical Profile
router.put('/medical-profile', updateMedicalProfile);

// Emergency Contacts
router.post('/emergency-contacts', addEmergencyContact);
router.put('/emergency-contacts/:id', updateEmergencyContact);
router.delete('/emergency-contacts/:id', deleteEmergencyContact);

// Base Student Records
router.route('/')
  .get(getHealthRecords)
  .post(updateHealthRecord);

// Parametric Student Record by ID
router.route('/:id')
  .get(getStudentHealth)
  .delete(deleteHealthRecord);

module.exports = router;
