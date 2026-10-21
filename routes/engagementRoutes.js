const express = require('express');
const router = express.Router();
const {
  getBirthdayDashboard,
  sendBirthdayGreeting,
  getCreatives,
  addCreative,
  updateCreative,
  deleteCreative,
  getFestivals,
  addCustomDay,
  updateFestival,
  deleteFestival,
  sendFestivalGreeting,
  getSettings,
  updateSettings
} = require('../controllers/engagementController');

// 1. Birthday Manager
router.get('/birthdays', getBirthdayDashboard);
router.post('/birthdays/send', sendBirthdayGreeting);

// 2. Creatives & Templates
router.get('/creatives', getCreatives);
router.post('/creatives', addCreative);
router.put('/creatives/:id', updateCreative);
router.delete('/creatives/:id', deleteCreative);

// 3. Festival Greetings
router.get('/festivals', getFestivals);
router.post('/festivals', addCustomDay);
router.put('/festivals/:id', updateFestival);
router.delete('/festivals/:id', deleteFestival);
router.post('/festivals/send', sendFestivalGreeting);

// 4. Auto-Send Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
