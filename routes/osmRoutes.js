const express = require('express');
const router = express.Router();
const {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  evaluateSheet,
  moderateSheet
} = require('../controllers/osmController');

router.route('/')
  .get(getSessions)
  .post(createSession);

router.get('/sessions', getSessions);

router.route('/:id')
  .get(getSessionById)
  .put(updateSession)
  .delete(deleteSession);

router.post('/:id/evaluate-sheet', evaluateSheet);
router.post('/:id/moderate-sheet', moderateSheet);

module.exports = router;
