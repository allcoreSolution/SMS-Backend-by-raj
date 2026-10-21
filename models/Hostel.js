const mongoose = require('mongoose');

// 1. Hostel Building Schema
const hostelSchema = new mongoose.Schema({
  hostelName: { 
    type: String, 
    required: [true, 'Hostel name is required'], 
    trim: true,
    unique: true 
  },
  type: { 
    type: String, 
    enum: ['Boys', 'Girls', 'Combined'], 
    default: 'Boys' 
  },
  wardenName: { 
    type: String, 
    trim: true, 
    default: 'Unassigned' 
  },
  wardenContact: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  address: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  intakeCapacity: { 
    type: Number, 
    default: 50 
  },
  description: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive'], 
    default: 'Active' 
  }
}, { timestamps: true });

// 2. Room Type Schema
const roomTypeSchema = new mongoose.Schema({
  roomType: { 
    type: String, 
    required: [true, 'Room type name is required'], 
    trim: true,
    unique: true 
  },
  description: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  costPerBed: { 
    type: Number, 
    default: 3000 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive'], 
    default: 'Active' 
  }
}, { timestamps: true });

// 3. Hostel Room Schema
const roomSchema = new mongoose.Schema({
  hostel: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hostel' 
  },
  hostelName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  roomNumber: { 
    type: String, 
    required: true, 
    trim: true 
  },
  roomType: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RoomType' 
  },
  roomTypeName: { 
    type: String, 
    default: 'Standard Non-AC' 
  },
  bedCapacity: { 
    type: Number, 
    required: true, 
    default: 4 
  },
  costPerBed: { 
    type: Number, 
    required: true, 
    default: 3000 
  },
  allocatedStudents: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' 
  }],
  status: { 
    type: String, 
    enum: ['Available', 'Partially Occupied', 'Full', 'Under Maintenance'], 
    default: 'Available' 
  },
  description: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

// 4. Hostel Bed Allocation Schema
const allocationSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  studentName: { 
    type: String, 
    required: true 
  },
  admissionNo: { 
    type: String, 
    default: '' 
  },
  className: { 
    type: String, 
    default: '' 
  },
  room: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'HostelRoom', 
    required: true 
  },
  roomNumber: { 
    type: String, 
    required: true 
  },
  hostel: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hostel' 
  },
  hostelName: { 
    type: String, 
    required: true 
  },
  bedNumber: { 
    type: String, 
    default: 'Bed 1' 
  },
  monthlyFee: { 
    type: Number, 
    default: 0 
  },
  allocationDate: { 
    type: Date, 
    default: Date.now 
  },
  vacateDate: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: ['Allocated', 'Vacated'], 
    default: 'Allocated' 
  },
  remarks: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

const Hostel = mongoose.models.Hostel || mongoose.model('Hostel', hostelSchema);
const RoomType = mongoose.models.RoomType || mongoose.model('RoomType', roomTypeSchema);
const HostelRoom = mongoose.models.HostelRoom || mongoose.model('HostelRoom', roomSchema);
const HostelAllocation = mongoose.models.HostelAllocation || mongoose.model('HostelAllocation', allocationSchema);

module.exports = {
  Hostel,
  RoomType,
  HostelRoom,
  HostelAllocation
};
