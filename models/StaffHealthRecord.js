const mongoose = require('mongoose');

const visitRecordSchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, 'Date is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Visit type is required'],
    trim: true,
    default: 'General Checkup'
  },
  doctor: {
    type: String,
    trim: true,
    default: 'Dr. Medical Officer'
  },
  hospital: {
    type: String,
    trim: true,
    default: 'City Clinic'
  },
  bp: {
    type: String,
    trim: true,
    default: '—'
  },
  weight: {
    type: String,
    trim: true,
    default: '—'
  },
  temp: {
    type: String,
    trim: true,
    default: '—'
  },
  sugar: {
    type: String,
    trim: true,
    default: '—'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Normal', 'Attention', 'Treated', 'Pending'],
    default: 'Normal'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const vaccinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vaccine name is required'],
    trim: true
  },
  date: {
    type: String,
    trim: true,
    default: ''
  },
  due: {
    type: String,
    trim: true,
    default: '—'
  },
  status: {
    type: String,
    enum: ['Done', 'Due Soon', 'Overdue'],
    default: 'Done'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true
  },
  dosage: {
    type: String,
    trim: true,
    default: '1 tablet daily'
  },
  since: {
    type: String,
    trim: true,
    default: ''
  },
  until: {
    type: String,
    trim: true,
    default: 'Ongoing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true
  },
  rel: {
    type: String,
    trim: true,
    default: 'Family'
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const staffHealthRecordSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  fullName: {
    type: String,
    trim: true,
    default: ''
  },
  records: [visitRecordSchema],
  vaccinations: [vaccinationSchema],
  medications: [medicationSchema],
  medicalProfile: {
    bloodGroup: { type: String, default: 'B+' },
    allergies: { type: String, default: 'None' },
    chronicConditions: { type: String, default: 'None' },
    surgeries: { type: String, default: 'None' },
    disability: { type: String, default: 'None' },
    insurance: { type: String, default: 'Star Health — #SH-20261234' }
  },
  emergencyContacts: [emergencyContactSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('StaffHealthRecord', staffHealthRecordSchema);
