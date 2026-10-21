const express = require('express');
const router = express.Router();
const { 
  getCoachingModules, 
  enrollInCoaching, 
  withdrawFromCoaching 
} = require('../controllers/coachingController');

router.get('/', getCoachingModules);
router.post('/enroll', enrollInCoaching);
router.post('/withdraw', withdrawFromCoaching);

module.exports = router;
