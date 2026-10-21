const mongoose = require('mongoose');

// ==========================================
// 1. CCTV CAMERA SCHEMA
// ==========================================
const cameraSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Camera name is required'],
      trim: true
    },
    code: {
      type: String,
      trim: true,
      default: ''
    },
    covers: {
      type: String,
      required: [true, 'Coverage location is required'],
      trim: true,
      default: 'Common area'
    },
    zone: {
      type: String,
      trim: true,
      default: '—'
    },
    parents: {
      type: String,
      enum: ['CAN VIEW', 'CLOSED'],
      default: 'CLOSED'
    },
    hours: {
      type: String,
      trim: true,
      default: '—'
    },
    eyeVisible: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Online', 'Offline', 'Maintenance'],
      default: 'Online'
    },
    ipAddress: {
      type: String,
      trim: true,
      default: '192.168.1.100'
    },
    port: {
      type: Number,
      default: 554
    },
    streamUrl: {
      type: String,
      trim: true,
      default: ''
    },
    resolution: {
      type: String,
      enum: ['720p HD', '1080p FHD', '2K QHD', '4K Ultra'],
      default: '1080p FHD'
    },
    fps: {
      type: Number,
      default: 30
    },
    bitrate: {
      type: String,
      default: '2048 kbps'
    },
    isRecording: {
      type: Boolean,
      default: true
    },
    thumbnailUrl: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Auto-sync eyeVisible with parents field
cameraSchema.pre('save', function () {
  this.eyeVisible = this.parents === 'CAN VIEW';
  if (!this.code) {
    this.code = 'CAM-' + Math.floor(100 + Math.random() * 900);
  }
});

// ==========================================
// 2. CCTV ACCESS AUDIT LOG SCHEMA
// ==========================================
const cctvAccessLogSchema = new mongoose.Schema(
  {
    camera: {
      type: String,
      required: [true, 'Camera name is required'],
      trim: true
    },
    cameraId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camera',
      default: null
    },
    viewer: {
      type: String,
      required: [true, 'Viewer name is required'],
      trim: true
    },
    userType: {
      type: String,
      enum: ['Parent', 'Staff', 'Admin', 'Security'],
      default: 'Parent'
    },
    child: {
      type: String,
      default: '-'
    },
    duration: {
      type: String,
      default: '10 mins'
    },
    durationSeconds: {
      type: Number,
      default: 600
    },
    ip: {
      type: String,
      default: '192.168.1.50'
    },
    isParent: {
      type: Boolean,
      default: true
    },
    started: {
      type: String,
      default: () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      }
    },
    endedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// ==========================================
// 3. CCTV PARENT POLICY SCHEMA
// ==========================================
const cctvPolicySchema = new mongoose.Schema(
  {
    allowViewLive: {
      type: Boolean,
      default: true
    },
    requirePolicyAccept: {
      type: Boolean,
      default: true
    },
    maxDailyMinutesPerParent: {
      type: Number,
      default: 60
    },
    watermarkViewerName: {
      type: Boolean,
      default: true
    },
    recordingRetentionDays: {
      type: Number,
      default: 30
    },
    defaultHours: {
      type: String,
      default: '08:00 – 17:00'
    },
    policyText: {
      type: String,
      default: 'Parent CCTV viewing is provided strictly for reassuring parents regarding classroom safety. Recording, screen-capturing, or sharing footage is strictly prohibited under school data safety guidelines.'
    }
  },
  { timestamps: true }
);

const Camera = mongoose.model('Camera', cameraSchema);
const CctvAccessLog = mongoose.model('CctvAccessLog', cctvAccessLogSchema);
const CctvPolicy = mongoose.model('CctvPolicy', cctvPolicySchema);

module.exports = {
  Camera,
  CctvAccessLog,
  CctvPolicy
};
