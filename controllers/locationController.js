const mongoose = require('mongoose');

// Temporary in-memory store for live bus coordinates, since GPS heavily hits the DB if saved every 5 seconds.
// In a production app, use Redis. We'll use a Map here for demonstration.
const busLocations = new Map(); 
// Key: driverId (String) or busNo (String), Value: { lat, lng, speed, updatedOn, busNo }

exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng, speed, busNo } = req.body;
    const driverId = req.user._id.toString();

    busLocations.set(driverId, {
      lat,
      lng,
      speed,
      busNo: busNo || req.user.busNo || 'Unknown-Bus',
      updatedOn: new Date()
    });

    res.json({ success: true, message: 'Location updated via GPS Telemetry' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLiveLocations = async (req, res) => {
  try {
    const activeBuses = Array.from(busLocations.values()).map((loc) => {
      return {
        lat: loc.lat,
        lng: loc.lng,
        speed: loc.speed,
        busNo: loc.busNo,
        updatedOn: loc.updatedOn
      };
    });

    res.json({ success: true, data: activeBuses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
