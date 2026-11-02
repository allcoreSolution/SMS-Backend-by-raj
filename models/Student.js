const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Basic Admission Info
  aparId: {
    type: String,
    required: [true, 'APAR ID is required'],
    unique: true,
    trim: true,
  },
  admissionNo: {
    type: String,
    trim: true,
    default: function() { return this.aparId; }
  },
  rollNo: {
    type: String,
    trim: true,
    default: '-',
  },
  firstName: {
    type: String,
    required: [true, 'First Name is required'],
    trim: true,
  },
  middleName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
    default: 'secret_access_24',
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other', 'Select'],
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of Birth is required'],
  },
  category: {
    type: String,
    trim: true,
    default: 'General',
  },
  house: {
    type: String,
    trim: true,
    default: 'Red',
  },
  religion: {
    type: String,
    trim: true,
    default: 'Hindu',
  },
  aadhaar: {
    type: String,
    trim: true,
  },
  caste: {
    type: String,
    trim: true,
  },
  subCaste: {
    type: String,
    trim: true,
  },
  placeOfBirth: {
    type: String,
    trim: true,
  },
  nationality: {
    type: String,
    default: 'Indian',
    trim: true,
  },
  bpl: {
    type: Boolean,
    default: false,
  },
  rte: {
    type: Boolean,
    default: false,
  },
  studentPhone: {
    type: String,
    trim: true,
  },
  studentEmail: {
    type: String,
    trim: true,
  },
  portalPassword: {
    type: String,
    default: 'School@1234',
    trim: true,
  },
  parentPassword: {
    type: String,
    default: 'secret_access_24',
    trim: true,
  },
  // Photos and Documents
  studentPhoto: {
    type: String, // file path / url
    default: null,
  },
  documents: [
    {
      documentName: {
        type: String,
        required: true,
      },
      fileUrl: {
        type: String,
        required: true,
      },
      fileType: {
        type: String,
        default: 'PDF'
      },
      fileSize: {
        type: String,
        default: '1.0 MB'
      },
      category: {
        type: String,
        default: 'General'
      },
      uploadDate: {
        type: Date,
        default: Date.now
      },
      uploadedBy: {
        type: String,
        default: 'Parent'
      },
      status: {
        type: String,
        default: 'Verified'
      },
      verifiedBy: {
        type: String,
        default: 'School Administration'
      },
      remarks: {
        type: String,
        default: ''
      }
    }
  ],
  // Physical and Medical details
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown',
  },
  height: {
    type: Number, // in cm
  },
  weight: {
    type: Number, // in kg
  },
  allergies: {
    type: String,
    trim: true,
    default: 'None',
  },
  medicalHistory: {
    type: String,
    trim: true,
  },
  // Parents Info
  fatherName: {
    type: String,
    trim: true,
    default: '',
  },
  fatherPhone: {
    type: String,
    trim: true,
    default: '',
  },
  motherName: {
    type: String,
    trim: true,
    default: '',
  },
  motherPhone: {
    type: String,
    trim: true,
    default: '',
  },
  // Status: Active, Inactive, Exited, On Hold
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Exited', 'On Hold'],
    default: 'Active',
  },
  // Academic & Relational Details
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicClass',
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicSection',
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  academicSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicSession',
  },
  electives: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicSubject'
  }],
  // Dynamic fields (for test1, test2 or any other extra fields)
  extraFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  schoolName: {
    type: String,
    trim: true,
  },
  schoolLogo: {
    type: String,
    trim: true,
  },
  schoolShortName: {
    type: String,
    trim: true,
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    index: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Student', studentSchema);
