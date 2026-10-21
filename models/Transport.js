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

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
const Route = mongoose.model('Route', routeSchema);
const Driver = mongoose.model('Driver', driverSchema);
const BoardingRegister = mongoose.model('BoardingRegister', boardingSchema);

module.exports = { Vehicle, Route, Driver, BoardingRegister };
