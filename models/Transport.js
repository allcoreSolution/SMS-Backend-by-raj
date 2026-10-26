const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  vehicleModel: { type: String, required: true, default: 'Standard Bus' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  driverName: { type: String, default: '' },
  driverPhone: { type: String, default: '' },
  driverPassword: { type: String, default: 'Bus@123' },
  capacity: { type: Number, required: true, default: 40 },
  status: { type: String, enum: ['Active', 'Maintenance', 'Inactive', 'OnTrip'], default: 'Active' },
  imei: { type: String, default: '' },
  apiToken: { type: String, default: '' },
  liveTrackingEnabled: { type: Boolean, default: true },
  lastPing: { type: String, default: '2 mins' },
  fuelLevel: { type: Number, default: 85 }, // percentage
  speed: { type: Number, default: 0 }, // km/h
  currentLocation: {
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 },
    address: { type: String, default: 'Sector 12, Main Ring Road' },
    heading: { type: Number, default: 90 }
  },
  insuranceExpiry: { type: Date },
  fitnessExpiry: { type: Date },
  pucExpiry: { type: Date },
  note: { type: String, default: '' }
}, { timestamps: true });

const routeSchema = new mongoose.Schema({
  routeName: { type: String, required: true, trim: true },
  startPoint: { type: String, default: 'Terminal Depot' },
  endPoint: { type: String, default: 'School Campus Main Gate' },
  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  fare: { type: Number, default: 2400 },
  stops: [{
    stopName: { type: String, required: true },
    stopTime: { type: String, default: '07:30 AM' },
    pickupTime: { type: String, default: '07:30 AM' },
    dropTime: { type: String, default: '02:30 PM' },
    fare: { type: Number, default: 0 },
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 },
    studentsCount: { type: Number, default: 0 }
  }],
  students: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    studentName: { type: String },
    className: { type: String },
    stopName: { type: String },
    pickupPoint: { type: String },
    fareAmount: { type: Number }
  }],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

const driverSchema = new mongoose.Schema({
  driverId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  altMobile: { type: String, default: '' },
  licence: { type: String, required: true, uppercase: true, trim: true },
  licenceExpiry: { type: String, default: '31-12-2028' },
  bloodGroup: { type: String, default: 'O+' },
  emergency: { type: String, default: '' },
  address: { type: String, default: '' },
  assignedBus: { type: String, default: 'Unassigned' },
  status: { type: String, enum: ['Active', 'Suspended', 'Left'], default: 'Active' },
  joinedOn: { type: String, default: '01-04-2024' },
  leftOn: { type: String, default: '' },
  pin: { type: String, default: '1234' },
  photo: { type: String, default: '' },
  avatar: { type: String, default: '' },
  devices: { type: String, default: '1 enrolled' },
  lastSeen: { type: String, default: '10 mins ago' },
  note: { type: String, default: '' }
}, { timestamps: true });

const boardingSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  routeName: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  driverName: { type: String, default: 'Assigned Driver' },
  tripType: { type: String, enum: ['Morning Pickup', 'Afternoon Drop'], default: 'Morning Pickup' },
  status: { type: String, enum: ['Scheduled', 'Running', 'Completed'], default: 'Completed' },
  startTime: { type: String, default: '07:15 AM' },
  endTime: { type: String, default: '08:15 AM' },
  students: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    studentName: { type: String, required: true },
    className: { type: String, default: 'Class X' },
    stopName: { type: String, required: true },
    status: { type: String, enum: ['Boarded', 'Absent', 'Dropped'], default: 'Boarded' },
    boardedAt: { type: String, default: '07:35 AM' }
  }]
}, { timestamps: true });

const tripSchema = new mongoose.Schema({
  tripId: { type: String, required: true, unique: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  driverName: { type: String, default: '' },
  driverPhone: { type: String, default: '' },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  vehicleNumber: { type: String, required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  routeName: { type: String, required: true },
  tripType: { type: String, enum: ['Morning Pickup', 'Afternoon Drop', 'Special Event'], default: 'Morning Pickup' },
  status: { type: String, enum: ['Scheduled', 'Active', 'Completed', 'Cancelled', 'Delayed'], default: 'Scheduled' },
  date: { type: String, required: true }, // YYYY-MM-DD
  startedAt: { type: Date },
  endedAt: { type: Date },
  totalDistanceKm: { type: Number, default: 0 },
  startOdometer: { type: Number, default: 0 },
  endOdometer: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  currentStopIndex: { type: Number, default: 0 },
  stops: [{
    stopName: { type: String, required: true },
    scheduledTime: { type: String },
    actualArrivalTime: { type: Date },
    lat: { type: Number },
    lng: { type: Number },
    status: { type: String, enum: ['Pending', 'Reached', 'Skipped'], default: 'Pending' }
  }],
  students: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    studentName: { type: String, required: true },
    className: { type: String, default: '' },
    stopName: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Boarded', 'Dropped', 'Absent'], default: 'Pending' },
    timestamp: { type: Date }
  }],
  gpsTrail: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const inspectionSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  driverName: { type: String, default: '' },
  date: { type: String, required: true },
  type: { type: String, enum: ['Pre-Trip', 'Post-Trip'], default: 'Pre-Trip' },
  odometer: { type: Number, default: 0 },
  fuelLevel: { type: Number, default: 100 },
  checklist: {
    tyres: { type: Boolean, default: true },
    lights: { type: Boolean, default: true },
    brakes: { type: Boolean, default: true },
    fuel: { type: Boolean, default: true },
    wipers: { type: Boolean, default: true },
    firstAidKit: { type: Boolean, default: true },
    fireExtinguisher: { type: Boolean, default: true },
    emergencyDoor: { type: Boolean, default: true },
    cleanliness: { type: Boolean, default: true }
  },
  passed: { type: Boolean, default: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

const incidentSchema = new mongoose.Schema({
  type: { type: String, enum: ['SOS', 'Breakdown', 'Accident', 'Delay', 'RouteObstruction', 'Medical'], default: 'SOS' },
  vehicleNumber: { type: String, required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  driverName: { type: String, default: '' },
  routeName: { type: String, default: '' },
  location: {
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 },
    address: { type: String, default: '' }
  },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'High' },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Acknowledged', 'Resolved'], default: 'Active' },
  acknowledgedBy: { type: String, default: '' },
  resolvedAt: { type: Date }
}, { timestamps: true });

const driverAttendanceSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  driverEmpId: { type: String, required: true },
  driverName: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  status: { type: String, enum: ['Present', 'Late', 'Half-Day', 'On-Leave', 'Absent'], default: 'Present' },
  clockInTime: { type: Date },
  clockOutTime: { type: Date },
  clockInLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  clockOutLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  workingHours: { type: Number, default: 0 },
  device: { type: String, default: 'GPS-BUS-12' },
  method: { type: String, default: 'Biometric Face / Fingerprint' },
  depotName: { type: String, default: 'Greenwood Bus Depot Zone A' },
  geofenceStatus: { type: String, default: 'Geo-fence OK' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

const driverLeaveSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  driverEmpId: { type: String, required: true },
  driverName: { type: String, required: true },
  leaveType: { type: String, enum: ['Casual', 'Sick', 'Emergency', 'Annual'], default: 'Casual' },
  startDate: { type: String, required: true }, // YYYY-MM-DD
  endDate: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  reviewedBy: { type: String, default: '' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

// Performance indexes
driverSchema.index({ driverId: 1, mobile: 1 });
tripSchema.index({ tripId: 1, driverId: 1, status: 1, date: 1 });
boardingSchema.index({ date: 1, vehicleNumber: 1 });
inspectionSchema.index({ vehicleNumber: 1, date: 1 });
incidentSchema.index({ status: 1, vehicleNumber: 1 });
driverAttendanceSchema.index({ driverId: 1, date: 1 }, { unique: true });
driverLeaveSchema.index({ driverId: 1, startDate: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
const Route = mongoose.model('Route', routeSchema);
const Driver = mongoose.model('Driver', driverSchema);
const BoardingRegister = mongoose.model('BoardingRegister', boardingSchema);
const Trip = mongoose.model('Trip', tripSchema);
const VehicleInspection = mongoose.model('VehicleInspection', inspectionSchema);
const TransportIncident = mongoose.model('TransportIncident', incidentSchema);
const DriverAttendance = mongoose.model('DriverAttendance', driverAttendanceSchema);
const DriverLeave = mongoose.model('DriverLeave', driverLeaveSchema);

module.exports = { 
  Vehicle, 
  Route, 
  Driver, 
  BoardingRegister,
  Trip,
  VehicleInspection,
  TransportIncident,
  DriverAttendance,
  DriverLeave
};
