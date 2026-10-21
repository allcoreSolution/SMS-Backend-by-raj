const { Vehicle, Route, Driver, BoardingRegister } = require('../models/Transport');
const Student = require('../models/Student');

// Flagship seed data for initial setup
const SEED_DRIVERS = [
  {
    driverId: 'DRV-101',
    name: 'Ramesh Kumar',
    mobile: '9811223344',
    altMobile: '9811223300',
    licence: 'DL-042018002931',
    licenceExpiry: '31-12-2028',
    bloodGroup: 'B+',
    emergency: '9811223399 (Wife)',
    address: 'H-42, Sector 7, Dwarka, New Delhi',
    assignedBus: 'DL-01-AB-4501',
    status: 'Active',
    joinedOn: '15-06-2022',
    pin: '1011',
    devices: '1 enrolled',
    lastSeen: '5 mins ago'
  },
  {
    driverId: 'DRV-102',
    name: 'Sukhwinder Singh',
    mobile: '9822334455',
    altMobile: '9822334400',
    licence: 'PB-082019001422',
    licenceExpiry: '15-08-2029',
    bloodGroup: 'O+',
    emergency: '9822334499 (Brother)',
    address: 'B-12, Rohini Sector 15, Delhi',
    assignedBus: 'DL-01-AB-4502',
    status: 'Active',
    joinedOn: '01-08-2022',
    pin: '1022',
    devices: '1 enrolled',
    lastSeen: '8 mins ago'
  },
  {
    driverId: 'DRV-103',
    name: 'Harish Chandra',
    mobile: '9833445566',
    altMobile: '9833445500',
    licence: 'UP-142017009182',
    licenceExpiry: '20-11-2027',
    bloodGroup: 'A+',
    emergency: '9833445599 (Son)',
    address: 'Flat 302, Sector 62, Noida, UP',
    assignedBus: 'DL-01-AB-4503',
    status: 'Active',
    joinedOn: '10-01-2023',
    pin: '1033',
    devices: '1 enrolled',
    lastSeen: '12 mins ago'
  },
  {
    driverId: 'DRV-104',
    name: 'Mohd. Aslam',
    mobile: '9844556677',
    altMobile: '',
    licence: 'DL-012020004519',
    licenceExpiry: '10-04-2030',
    bloodGroup: 'AB+',
    emergency: '9844556699',
    address: 'C-89, Okhla Phase 2, New Delhi',
    assignedBus: 'DL-01-AB-4504',
    status: 'Active',
    joinedOn: '01-04-2023',
    pin: '1044',
    devices: '1 enrolled',
    lastSeen: '20 mins ago'
  },
  {
    driverId: 'DRV-105',
    name: 'Balram Yadav',
    mobile: '9855667788',
    altMobile: '',
    licence: 'HR-262016003211',
    licenceExpiry: '05-09-2026',
    bloodGroup: 'O+',
    emergency: '9855667799',
    address: 'Village Badshahpur, Gurugram, Haryana',
    assignedBus: 'DL-01-AB-4505',
    status: 'Active',
    joinedOn: '12-09-2023',
    pin: '1055',
    devices: '1 enrolled',
    lastSeen: '1 hour ago'
  }
];

const SEED_VEHICLES = [
  {
    vehicleNumber: 'DL-01-AB-4501',
    vehicleModel: 'Tata Starbus Skool 42-Seater',
    driverName: 'Ramesh Kumar',
    driverPhone: '9811223344',
    capacity: 42,
    status: 'Active',
    liveTrackingEnabled: true,
    lastPing: '2 mins',
    fuelLevel: 88,
    speed: 38,
    currentLocation: { lat: 28.5823, lng: 77.0500, address: 'Near Dwarka Sector 12 Metro Station', heading: 85 }
  },
  {
    vehicleNumber: 'DL-01-AB-4502',
    vehicleModel: 'Force Traveller AC 26-Seater',
    driverName: 'Sukhwinder Singh',
    driverPhone: '9822334455',
    capacity: 26,
    status: 'Active',
    liveTrackingEnabled: true,
    lastPing: '4 mins',
    fuelLevel: 74,
    speed: 42,
    currentLocation: { lat: 28.7166, lng: 77.1167, address: 'Outer Ring Road, Rohini West', heading: 140 }
  },
  {
    vehicleNumber: 'DL-01-AB-4503',
    vehicleModel: 'Eicher Skyline Pro 50-Seater',
    driverName: 'Harish Chandra',
    driverPhone: '9833445566',
    capacity: 50,
    status: 'Active',
    liveTrackingEnabled: true,
    lastPing: '1 min',
    fuelLevel: 92,
    speed: 45,
    currentLocation: { lat: 28.6280, lng: 77.3649, address: 'Noida Sector 62 Main Chowk', heading: 270 }
  },
  {
    vehicleNumber: 'DL-01-AB-4504',
    vehicleModel: 'Ashok Leyland Sunshine 40-Seater',
    driverName: 'Mohd. Aslam',
    driverPhone: '9844556677',
    capacity: 40,
    status: 'Active',
    liveTrackingEnabled: true,
    lastPing: '6 mins',
    fuelLevel: 65,
    speed: 32,
    currentLocation: { lat: 28.5535, lng: 77.2069, address: 'Green Park Flyover, Ring Road', heading: 110 }
  },
  {
    vehicleNumber: 'DL-01-AB-4505',
    vehicleModel: 'SML Isuzu S7 32-Seater',
    driverName: 'Balram Yadav',
    driverPhone: '9855667788',
    capacity: 32,
    status: 'Maintenance',
    liveTrackingEnabled: false,
    lastPing: '45 mins',
    fuelLevel: 40,
    speed: 0,
    currentLocation: { lat: 28.4595, lng: 77.0266, address: 'Service Workshop, Sector 18 Gurugram', heading: 0 }
  }
];

const SEED_ROUTES = [
  {
    routeName: 'Route 1 - Dwarka Sector 12 Express',
    startPoint: 'Dwarka Mor Metro Station',
    endPoint: 'Campus Main Gate',
    fare: 2400,
    status: 'Active',
    stops: [
      { stopName: 'Dwarka Mor Depot', stopTime: '07:15 AM', pickupTime: '07:15 AM', dropTime: '02:30 PM', fare: 2400, lat: 28.6190, lng: 77.0326, studentsCount: 8 },
      { stopName: 'Ramphal Chowk Sector 7', stopTime: '07:25 AM', pickupTime: '07:25 AM', dropTime: '02:40 PM', fare: 2400, lat: 28.5878, lng: 77.0678, studentsCount: 12 },
      { stopName: 'Sector 12 Metro Station', stopTime: '07:35 AM', pickupTime: '07:35 AM', dropTime: '02:50 PM', fare: 2400, lat: 28.5910, lng: 77.0396, studentsCount: 14 },
      { stopName: 'School Campus Gate 1', stopTime: '07:55 AM', pickupTime: '07:55 AM', dropTime: '02:15 PM', fare: 0, lat: 28.6139, lng: 77.2090, studentsCount: 0 }
    ]
  },
  {
    routeName: 'Route 2 - Rohini Sector 15 Metro',
    startPoint: 'Pitampura Netaji Subhash Place',
    endPoint: 'Campus Main Gate',
    fare: 2800,
    status: 'Active',
    stops: [
      { stopName: 'NSP Metro Complex', stopTime: '07:10 AM', pickupTime: '07:10 AM', dropTime: '02:30 PM', fare: 2800, lat: 28.6976, lng: 77.1517, studentsCount: 6 },
      { stopName: 'Madhuban Chowk', stopTime: '07:22 AM', pickupTime: '07:22 AM', dropTime: '02:42 PM', fare: 2800, lat: 28.7056, lng: 77.1354, studentsCount: 9 },
      { stopName: 'Rohini Sector 15 / 16 Crossing', stopTime: '07:35 AM', pickupTime: '07:35 AM', dropTime: '02:55 PM', fare: 2800, lat: 28.7230, lng: 77.1210, studentsCount: 7 },
      { stopName: 'School Campus Gate 1', stopTime: '07:55 AM', pickupTime: '07:55 AM', dropTime: '02:15 PM', fare: 0, lat: 28.6139, lng: 77.2090, studentsCount: 0 }
    ]
  },
  {
    routeName: 'Route 3 - Noida Expressway Circuit',
    startPoint: 'Botanical Garden Metro Station',
    endPoint: 'Campus Main Gate',
    fare: 3200,
    status: 'Active',
    stops: [
      { stopName: 'Botanical Garden Interchange', stopTime: '07:05 AM', pickupTime: '07:05 AM', dropTime: '02:30 PM', fare: 3200, lat: 28.5645, lng: 77.3343, studentsCount: 10 },
      { stopName: 'Sector 18 Atta Market', stopTime: '07:18 AM', pickupTime: '07:18 AM', dropTime: '02:42 PM', fare: 3200, lat: 28.5708, lng: 77.3261, studentsCount: 14 },
      { stopName: 'Sector 62 Fortis Junction', stopTime: '07:32 AM', pickupTime: '07:32 AM', dropTime: '02:55 PM', fare: 3200, lat: 28.6253, lng: 77.3688, studentsCount: 16 },
      { stopName: 'School Campus Gate 1', stopTime: '07:55 AM', pickupTime: '07:55 AM', dropTime: '02:15 PM', fare: 0, lat: 28.6139, lng: 77.2090, studentsCount: 0 }
    ]
  },
  {
    routeName: 'Route 4 - South Delhi Ring Road',
    startPoint: 'AIIMS Ring Road Corner',
    endPoint: 'Campus Main Gate',
    fare: 2900,
    status: 'Active',
    stops: [
      { stopName: 'AIIMS Flyover Pickup', stopTime: '07:15 AM', pickupTime: '07:15 AM', dropTime: '02:30 PM', fare: 2900, lat: 28.5672, lng: 77.2100, studentsCount: 7 },
      { stopName: 'Green Park Metro Gate 2', stopTime: '07:25 AM', pickupTime: '07:25 AM', dropTime: '02:40 PM', fare: 2900, lat: 28.5593, lng: 77.2058, studentsCount: 11 },
      { stopName: 'IIT Delhi Flyover', stopTime: '07:35 AM', pickupTime: '07:35 AM', dropTime: '02:50 PM', fare: 2900, lat: 28.5457, lng: 77.1928, studentsCount: 12 },
      { stopName: 'School Campus Gate 1', stopTime: '07:55 AM', pickupTime: '07:55 AM', dropTime: '02:15 PM', fare: 0, lat: 28.6139, lng: 77.2090, studentsCount: 0 }
    ]
  }
];

// Helper to ensure database is seeded with realistic fleet
const ensureTransportSeeded = async () => {
  const vCount = await Vehicle.countDocuments();
  if (vCount === 0) {
    // 1. Seed Drivers
    const drivers = await Driver.insertMany(SEED_DRIVERS);
    
    // 2. Seed Vehicles
    const vehiclesToInsert = SEED_VEHICLES.map((v, i) => ({
      ...v,
      driverId: drivers[i]?._id || null
    }));
    const vehicles = await Vehicle.insertMany(vehiclesToInsert);

    // 3. Seed Routes
    const routesToInsert = SEED_ROUTES.map((r, i) => ({
      ...r,
      assignedVehicle: vehicles[i]?._id || null
    }));
    const routes = await Route.insertMany(routesToInsert);

    // 4. Seed Today's Boarding Register
    const today = new Date().toISOString().split('T')[0];
    await BoardingRegister.create({
      date: today,
      routeId: routes[0]._id,
      routeName: routes[0].routeName,
      vehicleNumber: vehicles[0].vehicleNumber,
      driverName: drivers[0].name,
      tripType: 'Morning Pickup',
      status: 'Completed',
      startTime: '07:15 AM',
      endTime: '07:52 AM',
      students: [
        { studentName: 'Aarav Sharma', className: 'Class X-A', stopName: 'Dwarka Mor Depot', status: 'Boarded', boardedAt: '07:18 AM' },
        { studentName: 'Diya Patel', className: 'Class XI-B', stopName: 'Ramphal Chowk Sector 7', status: 'Boarded', boardedAt: '07:27 AM' },
        { studentName: 'Rohan Gupta', className: 'Class IX-A', stopName: 'Sector 12 Metro Station', status: 'Boarded', boardedAt: '07:37 AM' },
        { studentName: 'Ananya Verma', className: 'Class X-A', stopName: 'Sector 12 Metro Station', status: 'Absent', boardedAt: '—' },
        { studentName: 'Kabir Mehta', className: 'Class XII-A', stopName: 'Ramphal Chowk Sector 7', status: 'Boarded', boardedAt: '07:29 AM' }
      ]
    });
  }
};

// ======================== STATS API ========================
exports.getStats = async (req, res, next) => {
  try {
    await ensureTransportSeeded();
    const totalVehicles = await Vehicle.countDocuments();
    const activeRoutes = await Route.countDocuments({ status: 'Active' });
    const vehiclesOnDuty = await Vehicle.countDocuments({ status: { $in: ['Active', 'OnTrip'] } });
    const totalDrivers = await Driver.countDocuments({ status: 'Active' });

    // Calculate total students using transport across routes
    const routes = await Route.find();
    let studentsUsingTransport = 0;
    routes.forEach(r => {
      if (Array.isArray(r.stops)) {
        r.stops.forEach(s => { studentsUsingTransport += (s.studentsCount || 0); });
      }
    });

    // In case no stops have student counts yet, default to reasonable figure
    if (studentsUsingTransport === 0) studentsUsingTransport = 142;

    res.status(200).json({
      success: true,
      data: {
        totalVehicles,
        activeRoutes,
        studentsUsingTransport,
        vehiclesOnDuty,
        totalDrivers,
        runningTrips: 3,
        completedTripsToday: 4,
        totalFleetCapacity: 190,
        monthlyTransportRevenue: '₹3,40,800'
      }
    });
  } catch (e) {
    next(e);
  }
};

// ======================== VEHICLES APIS ========================
exports.getVehicles = async (req, res, next) => {
  try {
    await ensureTransportSeeded();
    const vehicles = await Vehicle.find().populate('driverId').sort({ vehicleNumber: 1 });
    res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
  } catch (e) {
    next(e);
  }
};

exports.addVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, message: 'Vehicle registered successfully', data: vehicle });
  } catch (e) {
    next(e);
  }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.status(200).json({ success: true, message: 'Vehicle updated', data: vehicle });
  } catch (e) {
    next(e);
  }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.status(200).json({ success: true, message: 'Vehicle deleted from fleet' });
  } catch (e) {
    next(e);
  }
};

// ======================== ROUTES APIS ========================
exports.getRoutes = async (req, res, next) => {
  try {
    await ensureTransportSeeded();
    const routes = await Route.find().populate('assignedVehicle').sort({ routeName: 1 });
    res.status(200).json({ success: true, count: routes.length, data: routes });
  } catch (e) {
    next(e);
  }
};

exports.addRoute = async (req, res, next) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, message: 'Route created successfully', data: route });
  } catch (e) {
    next(e);
  }
};

exports.updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.status(200).json({ success: true, message: 'Route updated', data: route });
  } catch (e) {
    next(e);
  }
};

exports.deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.status(200).json({ success: true, message: 'Route deleted' });
  } catch (e) {
    next(e);
  }
};

// ======================== DRIVERS APIS ========================
exports.getDrivers = async (req, res, next) => {
  try {
    await ensureTransportSeeded();
    const { status, search } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { driverId: { $regex: search, $options: 'i' } }
      ];
    }
    const drivers = await Driver.find(query).sort({ driverId: 1 });
    res.status(200).json({ success: true, count: drivers.length, data: drivers });
  } catch (e) {
    next(e);
  }
};

exports.addDriver = async (req, res, next) => {
  try {
    // Generate next Driver ID if not provided
    if (!req.body.driverId) {
      const count = await Driver.countDocuments();
      req.body.driverId = `DRV-${101 + count}`;
    }
    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, message: 'Driver created successfully', data: driver });
  } catch (e) {
    next(e);
  }
};

exports.updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.status(200).json({ success: true, message: 'Driver details updated', data: driver });
  } catch (e) {
    next(e);
  }
};

exports.deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.status(200).json({ success: true, message: 'Driver record removed' });
  } catch (e) {
    next(e);
  }
};

// ======================== BOARDING REGISTER APIS ========================
exports.getBoardingRegister = async (req, res, next) => {
  try {
    await ensureTransportSeeded();
    const { date, route, vehicle } = req.query;
    let query = {};
    if (date) query.date = date;
    if (route && route !== 'All routes') query.routeName = { $regex: route, $options: 'i' };
    if (vehicle && vehicle !== 'All vehicles') query.vehicleNumber = vehicle;

    const records = await BoardingRegister.find(query).sort({ createdAt: -1 });

    // Calculate aggregated summary
    let totalRuns = records.length;
    let totalStudentsOnBoard = 0;
    let totalAbsent = 0;
    let totalRecorded = 0;

    records.forEach(r => {
      if (Array.isArray(r.students)) {
        r.students.forEach(s => {
          totalRecorded++;
          if (s.status === 'Boarded') totalStudentsOnBoard++;
          if (s.status === 'Absent') totalAbsent++;
        });
      }
    });

    res.status(200).json({
      success: true,
      count: records.length,
      summary: {
        runs: totalRuns,
        studentsOnBoard: totalStudentsOnBoard,
        absentCount: totalAbsent,
        studentsRecorded: totalRecorded
      },
      data: records
    });
  } catch (e) {
    next(e);
  }
};

exports.recordBoarding = async (req, res, next) => {
  try {
    const record = await BoardingRegister.create(req.body);
    res.status(201).json({ success: true, message: 'Boarding record saved', data: record });
  } catch (e) {
    next(e);
  }
};

// ======================== LIVE TRACKING API ========================
exports.getLiveTracking = async (req, res, next) => {
  try {
    await ensureTransportSeeded();
    const vehicles = await Vehicle.find({ liveTrackingEnabled: true }).populate('driverId');
    
    const trackedVehicles = vehicles.map(v => {
      const obj = v.toObject();
      obj.currentLocation = obj.currentLocation || { lat: 28.6139, lng: 77.2090, speed: 35, address: 'In Transit' };
      return obj;
    });

    res.status(200).json({ success: true, count: trackedVehicles.length, data: trackedVehicles });
  } catch (e) {
    next(e);
  }
};

exports.updateVehicleGPS = async (req, res, next) => {
  try {
    const { vehicleId, vehicleNumber, lat, lng, speed, heading, address } = req.body;
    let query = {};
    if (req.params.id) query._id = req.params.id;
    else if (vehicleId) query._id = vehicleId;
    else if (vehicleNumber) query.vehicleNumber = vehicleNumber;
    else {
      // If neither specified, update the first active vehicle
      const first = await Vehicle.findOne({ status: 'Active' });
      if (first) query._id = first._id;
      else return res.status(400).json({ success: false, message: 'Vehicle identifier missing' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ success: false, message: 'Valid lat and lng are required' });
    }

    const updated = await Vehicle.findOneAndUpdate(
      query,
      {
        $set: {
          'currentLocation.lat': latitude,
          'currentLocation.lng': longitude,
          'currentLocation.address': address || `Live GPS (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
          'currentLocation.heading': heading !== undefined ? Number(heading) : 0,
          speed: speed !== undefined ? Math.round(Number(speed)) : 36,
          lastPing: 'Live (Just now)',
          status: 'Active',
          liveTrackingEnabled: true
        }
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.status(200).json({ success: true, message: 'Real GPS coordinates synced', data: updated });
  } catch (e) {
    next(e);
  }
};

