const mongoose = require('mongoose');

// 1. Asset Category Schema
const assetCategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Category name is required'], 
    trim: true, 
    unique: true 
  },
  code: { 
    type: String, 
    trim: true 
  },
  depreciationMethod: { 
    type: String, 
    enum: ['Straight Line', 'Written Down Value'], 
    default: 'Straight Line' 
  },
  usefulLifeYears: { 
    type: Number, 
    default: 5 
  },
  depreciationRate: { 
    type: Number, 
    default: 20 
  },
  description: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive'], 
    default: 'Active' 
  }
}, { timestamps: true });

// 2. Fixed Asset Register Schema
const assetSchema = new mongoose.Schema({
  assetCode: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  assetName: { 
    type: String, 
    required: [true, 'Asset name is required'], 
    trim: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AssetCategory' 
  },
  brand: { 
    type: String, 
    default: '' 
  },
  modelNo: { 
    type: String, 
    default: '' 
  },
  serialNumber: { 
    type: String, 
    default: '' 
  },
  purchaseDate: { 
    type: Date, 
    default: Date.now 
  },
  cost: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  currentValue: { 
    type: Number, 
    default: 0 
  },
  quantity: { 
    type: Number, 
    default: 1 
  },
  available: { 
    type: Number, 
    default: 1 
  },
  location: { 
    type: String, 
    default: 'Main Campus' 
  },
  vendor: { 
    type: String, 
    default: '' 
  },
  invoiceNo: { 
    type: String, 
    default: '' 
  },
  warrantyExpiry: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Assigned', 'In Maintenance', 'Disposed', 'Lost'], 
    default: 'Active' 
  },
  condition: { 
    type: String, 
    enum: ['New', 'Good', 'Fair', 'Damaged'], 
    default: 'Good' 
  },
  allocatedTo: {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    staffName: { type: String, default: '' },
    department: { type: String, default: '' },
    allocationDate: { type: Date }
  },
  notes: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

// 3. Asset Allocation Schema
const assetAllocationSchema = new mongoose.Schema({
  asset: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Asset', 
    required: true 
  },
  assetCode: { 
    type: String, 
    required: true 
  },
  assetName: { 
    type: String, 
    required: true 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff' 
  },
  staffName: { 
    type: String, 
    required: true 
  },
  department: { 
    type: String, 
    default: 'Academics' 
  },
  role: { 
    type: String, 
    default: 'Teacher' 
  },
  issueDate: { 
    type: Date, 
    default: Date.now 
  },
  expectedReturnDate: { 
    type: Date 
  },
  returnDate: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: ['Issued', 'Returned'], 
    default: 'Issued' 
  },
  conditionOnIssue: { 
    type: String, 
    default: 'Good' 
  },
  conditionOnReturn: { 
    type: String 
  },
  remarks: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

// 4. Asset Maintenance Log Schema
const assetMaintenanceSchema = new mongoose.Schema({
  asset: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Asset', 
    required: true 
  },
  assetCode: { 
    type: String, 
    required: true 
  },
  assetName: { 
    type: String, 
    required: true 
  },
  maintenanceType: { 
    type: String, 
    enum: ['Routine Service', 'Repair', 'Calibration', 'Inspection', 'Software Update'], 
    default: 'Routine Service' 
  },
  serviceDate: { 
    type: Date, 
    default: Date.now 
  },
  completionDate: { 
    type: Date 
  },
  cost: { 
    type: Number, 
    default: 0 
  },
  vendor: { 
    type: String, 
    default: '' 
  },
  technician: { 
    type: String, 
    default: '' 
  },
  issueDescription: { 
    type: String, 
    required: true 
  },
  resolutionNotes: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['Scheduled', 'In Progress', 'Completed'], 
    default: 'In Progress' 
  }
}, { timestamps: true });

// 5. Asset Disposal Schema
const assetDisposalSchema = new mongoose.Schema({
  asset: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Asset', 
    required: true 
  },
  assetCode: { 
    type: String, 
    required: true 
  },
  assetName: { 
    type: String, 
    required: true 
  },
  disposalDate: { 
    type: Date, 
    default: Date.now 
  },
  disposalMethod: { 
    type: String, 
    enum: ['Sold', 'Scrapped', 'Donated', 'Write-off', 'Lost/Stolen'], 
    default: 'Scrapped' 
  },
  originalCost: { 
    type: Number, 
    default: 0 
  },
  saleValue: { 
    type: Number, 
    default: 0 
  },
  lossOrGain: { 
    type: Number, 
    default: 0 
  },
  reason: { 
    type: String, 
    required: true 
  },
  approvedBy: { 
    type: String, 
    default: 'School Administrator' 
  }
}, { timestamps: true });

// 6. Asset Physical Verification Audit Schema
const assetAuditSchema = new mongoose.Schema({
  auditTitle: { 
    type: String, 
    required: true 
  },
  auditDate: { 
    type: Date, 
    default: Date.now 
  },
  auditorName: { 
    type: String, 
    default: 'Internal Audit Committee' 
  },
  location: { 
    type: String, 
    default: 'All Campus Wings' 
  },
  totalAudited: { 
    type: Number, 
    default: 0 
  },
  verifiedCount: { 
    type: Number, 
    default: 0 
  },
  missingCount: { 
    type: Number, 
    default: 0 
  },
  damagedCount: { 
    type: Number, 
    default: 0 
  },
  remarks: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['Draft', 'In Progress', 'Completed'], 
    default: 'Completed' 
  }
}, { timestamps: true });

const AssetCategory = mongoose.models.AssetCategory || mongoose.model('AssetCategory', assetCategorySchema);
const Asset = mongoose.models.Asset || mongoose.model('Asset', assetSchema);
const AssetAllocation = mongoose.models.AssetAllocation || mongoose.model('AssetAllocation', assetAllocationSchema);
const AssetMaintenance = mongoose.models.AssetMaintenance || mongoose.model('AssetMaintenance', assetMaintenanceSchema);
const AssetDisposal = mongoose.models.AssetDisposal || mongoose.model('AssetDisposal', assetDisposalSchema);
const AssetAudit = mongoose.models.AssetAudit || mongoose.model('AssetAudit', assetAuditSchema);

module.exports = {
  AssetCategory,
  Asset,
  AssetAllocation,
  AssetMaintenance,
  AssetDisposal,
  AssetAudit
};
