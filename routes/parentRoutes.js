const express = require('express');
const router = express.Router();
const {
  getParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent,
  getParentPortalDashboard,
  uploadStudentPhoto,
  updateStudentProfile,
  changeParentPassword,
  getStudentFeeLedger,
  getStudentTransactions,
  payStudentFee,
  getFeeReceipt,
  getStudentWhatsAppMessages,
  sendWhatsAppInquiry,
  getWhatsAppSettings,
  getStudentEmails,
  getEmailById,
  sendParentEmail,
  toggleStarEmail,
  toggleReadEmail,
  deleteEmail,
  restoreEmail,
  getEmailSettings,
  getSmtpConfig,
  saveSmtpConfig,
  getStudentTransport,
  simulateBusGPS,
  reportTransportIssue,
  getAllTransportRoutes,
  getStudentLibrary,
  requestBookReservation,
  requestNewBook,
  renewIssuedBook,
  payLibraryFine,
  getStudentHostel,
  applyHostelGatePass,
  submitHostelMaintenance,
  getStudentHealthDashboard,
  updateStudentMedicalProfile,
  sendNurseNote,
  getStudentDocuments,
  uploadStudentDocument,
  deleteStudentDocument,
  requestStudentCertificate,
  getSchoolVisitData,
  createVisitAppointment,
  cancelVisitAppointment,
  rescheduleVisitAppointment,
  verifyGatePass,
  getGatePassQRImage,
  getStudentLeaveDashboard,
  applyStudentLeave,
  withdrawStudentLeave
} = require('../controllers/parentController');
const { getGallery } = require('../controllers/galleryController');
const { uploadAttachment } = require('../middleware/uploadMiddleware');

// Portal Dashboard endpoints
router.get('/dashboard', getParentPortalDashboard);
router.get('/portal-dashboard', getParentPortalDashboard);

// Services & Resources: Transport Tracking endpoints
router.get('/transport', getStudentTransport);
router.post('/transport/ping', simulateBusGPS);
router.post('/transport/inquiry', reportTransportIssue);
router.get('/transport/routes', getAllTransportRoutes);

// Services & Resources: Library endpoints
router.get('/library', getStudentLibrary);
router.post('/library/reserve', requestBookReservation);
router.post('/library/request-title', requestNewBook);
router.post('/library/renew/:issueId', renewIssuedBook);
router.post('/library/pay-fine/:issueId', payLibraryFine);

// Services & Resources: Hostel endpoints
router.get('/hostel', getStudentHostel);
router.post('/hostel/gate-pass', applyHostelGatePass);
router.post('/hostel/maintenance', submitHostelMaintenance);

// Services & Resources: Health Records endpoints
router.get('/health', getStudentHealthDashboard);
router.put('/health/profile', updateStudentMedicalProfile);
router.post('/health/nurse-note', sendNurseNote);

// Services & Resources: Documents & Certificates endpoints
router.get('/documents', getStudentDocuments);
router.post('/documents/upload', uploadAttachment, uploadStudentDocument);
router.delete('/documents/:docId', deleteStudentDocument);
router.post('/documents/request-certificate', requestStudentCertificate);

// Services & Resources: Image Gallery endpoints
router.get('/gallery', getGallery);

// Services & Resources: School Visit (Walk-in & Appointments) endpoints
router.get('/school-visit', getSchoolVisitData);
router.post('/school-visit/appointment', createVisitAppointment);
router.put('/school-visit/appointment/:id/cancel', cancelVisitAppointment);
router.put('/school-visit/appointment/:id/reschedule', rescheduleVisitAppointment);
router.get('/school-visit/gate-pass/:passNumber/verify', verifyGatePass);
router.get('/school-visit/gate-pass/:passNumber/qr', getGatePassQRImage);

// Services & Resources: Student Leave Management endpoints
router.get('/leaves', getStudentLeaveDashboard);
router.post('/leaves/apply', uploadAttachment, applyStudentLeave);
router.delete('/leaves/:id', withdrawStudentLeave);

// Financial & Fee endpoints
router.get('/fee-ledger', getStudentFeeLedger);
router.get('/transactions', getStudentTransactions);
router.post('/pay-fee', payStudentFee);
router.get('/receipt/:id', getFeeReceipt);

// WhatsApp Communication endpoints
router.get('/whatsapp/messages', getStudentWhatsAppMessages);
router.post('/whatsapp/send', sendWhatsAppInquiry);
router.get('/whatsapp/settings', getWhatsAppSettings);

// Email / Mailbox Communication endpoints
router.get('/emails', getStudentEmails);
router.post('/emails/send', sendParentEmail);
router.get('/emails/settings', getEmailSettings);
router.get('/emails/smtp-config', getSmtpConfig);
router.post('/emails/smtp-config', saveSmtpConfig);
router.get('/emails/:id', getEmailById);
router.put('/emails/:id/star', toggleStarEmail);
router.put('/emails/:id/read', toggleReadEmail);
router.put('/emails/:id/restore', restoreEmail);
router.delete('/emails/:id', deleteEmail);

// Profile and Photo endpoints
router.post('/upload-student-photo', uploadStudentPhoto);
router.put('/student-profile/:id', updateStudentProfile);
router.put('/change-password', changeParentPassword);

router.route('/')
  .get(getParents)
  .post(createParent);

router.route('/:id')
  .get(getParentById)
  .put(updateParent)
  .delete(deleteParent);

module.exports = router;
