const express = require('express');
const router = express.Router();
const { 
  requestMeeting, 
  getMeetings, 
  getMeetingById, 
  updateMeeting, 
  deleteMeeting,
  updateAttendee,
  recordBulkAttendance,
  getFollowUps,
  addFollowUp
} = require('../controllers/ptmController');

router.get('/follow-ups', getFollowUps);
router.post('/follow-ups', addFollowUp);

router.post('/', requestMeeting);
router.get('/', getMeetings);
router.get('/:id', getMeetingById);
router.put('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);

router.patch('/:id/roster/:attendeeId', updateAttendee);
router.post('/:id/roster/bulk-attendance', recordBulkAttendance);

module.exports = router;

