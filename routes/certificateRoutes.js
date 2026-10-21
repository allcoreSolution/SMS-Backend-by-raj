const express = require('express');
const router = express.Router();
const {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  autoGenerateCertificate,
  bulkAutoGenerateCertificates,
  getIssuedCertificates,
  updateIssuedCertificate,
  deleteIssuedCertificate,
  getCertificateStats,
  issueCertificate,
  getCertificates,
  updateCertificate,
  deleteCertificate
} = require('../controllers/certificateController');

// 1. Templates Management
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);

// 2. Auto-Generation Endpoints
router.post('/generate', autoGenerateCertificate);
router.post('/bulk-generate', bulkAutoGenerateCertificates);

// 3. Issued Archive Endpoints
router.get('/issued', getIssuedCertificates);
router.put('/issued/:id', updateIssuedCertificate);
router.delete('/issued/:id', deleteIssuedCertificate);
router.get('/stats', getCertificateStats);

// 4. Backward Compatibility
router.post('/issue', issueCertificate);
router.get('/', getCertificates);
router.put('/:id', updateCertificate);
router.delete('/:id', deleteCertificate);

module.exports = router;
