const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');

router.post('/register', alumniController.registerAlumni);
router.get('/list', alumniController.getAlumniList);
router.post('/events', alumniController.createEvent);

module.exports = router;