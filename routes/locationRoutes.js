const express = require('express');
const router = express.Router();
const { updateLocation, getLiveLocations } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Ensure all routes are protected

// Driver updates their location
router.post('/update', updateLocation);

// Parents/Admin view active buses
router.get('/live', getLiveLocations);

module.exports = router;
