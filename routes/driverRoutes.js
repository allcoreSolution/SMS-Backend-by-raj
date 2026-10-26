const express = require('express');
const router = express.Router();
const { 
  getDriverMe,
  getDriverProfile,
  updateDriverProfile,
  getDriverDashboard,
  getAssignedVehicle,
  getAssignedRoutes,
  getStudentsRoster,
  getDriverTrips,
  getTripDetails,
  startTrip,
  endTrip,
  getTripHistory,
  getTripBoarding,
  recordBoarding,
  scanQR,
  updateGPS,
  getTripLocation,
  submitInspection,
  getInspections,
  reportIncident,
  getIncidents,
  getIncidentDetails,
  getNotifications,
  markNotificationRead,
  getAttendance,
  markAttendance,
  getLeaves,
  applyLeave,
  changeDriverPassword,
  uploadDriverPhoto
} = require('../controllers/driverController');
const { protect, authorizeDriver } = require('../middleware/authMiddleware');

// All /api/driver endpoints require valid token and driver authorization
router.use(protect, authorizeDriver);

// 1. Identity & Profile & Security
router.get('/me', getDriverMe);
router.get('/profile', getDriverProfile);
router.patch('/profile', updateDriverProfile);
router.post('/photo', uploadDriverPhoto);
router.post('/avatar', uploadDriverPhoto);
router.post('/change-password', changeDriverPassword);
router.put('/change-password', changeDriverPassword);
router.post('/change-pin', changeDriverPassword);

// 2. Dashboard
router.get('/dashboard', getDriverDashboard);

// 3. Vehicle & Routes & Roster
router.get('/vehicle', getAssignedVehicle);
router.get('/routes', getAssignedRoutes);
router.get('/students', getStudentsRoster);

// 4. Trips
router.get('/trips', getDriverTrips);
router.get('/trips/:tripId', getTripDetails);
router.post('/trips/start', startTrip);
router.post('/trips/:tripId/start', startTrip);
router.post('/trips/end', endTrip);
router.post('/trips/:tripId/end', endTrip);
router.get('/trip-history', getTripHistory);

// 5. Boarding & QR
router.get('/trips/:tripId/boarding', getTripBoarding);
router.post('/trips/:tripId/boarding', recordBoarding);
router.post('/boarding', recordBoarding);
router.patch('/trips/:tripId/boarding/:boardingId', recordBoarding);
router.post('/trips/:tripId/scan-qr', scanQR);
router.post('/scan-qr', scanQR);

// 6. GPS
router.post('/gps', updateGPS);
router.get('/trips/:tripId/location', getTripLocation);

// 7. Inspections
router.post('/inspections', submitInspection);
router.get('/inspections', getInspections);

// 8. Incidents & SOS
router.post('/incidents', reportIncident);
router.post('/sos', reportIncident);
router.get('/incidents', getIncidents);
router.get('/incidents/:incidentId', getIncidentDetails);

// 9. Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:notificationId/read', markNotificationRead);

// 10. Attendance & Leaves
router.get('/attendance', getAttendance);
router.post('/attendance', markAttendance);
router.get('/leaves', getLeaves);
router.get('/leave', getLeaves);
router.post('/leaves', applyLeave);
router.post('/leave', applyLeave);

module.exports = router;
