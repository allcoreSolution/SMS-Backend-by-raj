const express = require('express');
const router = express.Router();
const { 
  getStats,
  addVehicle, getVehicles, updateVehicle, deleteVehicle, 
  addRoute, getRoutes, updateRoute, deleteRoute,
  getDrivers, addDriver, updateDriver, deleteDriver,
  getBoardingRegister, recordBoarding,
  getLiveTracking,
  updateVehicleGPS,
  getDriverAssignedData,
  getDriverTrips,
  startTrip,
  endTrip,
  recordStudentBoarding,
  submitInspection,
  reportIncident,
  getIncidents,
  getInspections,
  getTripHistory
} = require('../controllers/transportController');
const { protect } = require('../middleware/authMiddleware');

// Stats & Overview
router.get('/stats', getStats);

// Vehicles
router.get('/vehicles', getVehicles);
router.post('/vehicles', addVehicle);
router.put('/vehicles/:id', updateVehicle);
router.delete('/vehicles/:id', deleteVehicle);
router.put('/vehicles/:id/gps', updateVehicleGPS);

// Routes
router.get('/routes', getRoutes);
router.post('/routes', addRoute);
router.put('/routes/:id', updateRoute);
router.delete('/routes/:id', deleteRoute);

// Drivers
router.get('/drivers', getDrivers);
router.post('/drivers', addDriver);
router.put('/drivers/:id', updateDriver);
router.delete('/drivers/:id', deleteDriver);

// Boarding Register
router.get('/boarding', getBoardingRegister);
router.post('/boarding', recordBoarding);

// Live GPS Tracking & Real Ping
router.get('/live-tracking', getLiveTracking);
router.post('/gps-ping', updateVehicleGPS);

// Driver Mobile App Dedicated Endpoints
router.get('/driver/assigned', getDriverAssignedData);
router.get('/driver/trips', getDriverTrips);
router.post('/driver/trip/start', startTrip);
router.post('/driver/trip/end', endTrip);
router.post('/driver/boarding', recordStudentBoarding);
router.post('/driver/inspection', submitInspection);
router.post('/driver/incident', reportIncident);
router.post('/driver/sos', reportIncident);
router.post('/driver/gps-ping', updateVehicleGPS);

// Admin Monitoring & Reports
router.get('/incidents', getIncidents);
router.get('/inspections', getInspections);
router.get('/trips/history', getTripHistory);

module.exports = router;
