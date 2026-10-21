const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, required: true },
  rollNumber: { type: String, default: '' },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date },
  durationMinutes: { type: Number, default: 0 }
}, { _id: true });

const liveClassSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  academicClass: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass' },
  className: { type: String, required: true, default: 'General' },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSection' },
  sectionName: { type: String, default: 'All' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSubject' },
  subjectName: { type: String, required: true, default: 'General' },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  teacherName: { type: String, required: true, default: 'School Faculty' },
  meetingUrl: { type: String, required: true },
  meetingId: { type: String, default: '' },
  passcode: { type: String, default: '' },
  provider: { 
    type: String, 
    default: 'Jitsi' 
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  durationMinutes: { type: Number, default: 45 },
  status: { 
    type: String, 
    enum: ['Live', 'Scheduled', 'Completed', 'Cancelled'], 
    default: 'Scheduled' 
  },
  attendeeCount: { type: Number, default: 0 },
  maxStudents: { type: Number, default: 60 },
  recordingUrl: { type: String, default: '' },
  attendees: [attendeeSchema]
}, { timestamps: true });

// Live Class Global & Provider Settings Schema
const liveClassSettingSchema = new mongoose.Schema({
  providers: {
    jitsi: {
      enabled: { type: Boolean, default: true },
      domain: { type: String, default: 'meet.jit.si' },
      appId: { type: String, default: '' },
      appSecret: { type: String, default: '' }
    },
    external: {
      enabled: { type: Boolean, default: true }
    },
    zoom: {
      enabled: { type: Boolean, default: false },
      accountId: { type: String, default: '' },
      clientId: { type: String, default: '' },
      clientSecret: { type: String, default: '' }
    },
    googleMeet: {
      enabled: { type: Boolean, default: false },
      clientId: { type: String, default: '' },
      clientSecret: { type: String, default: '' }
    }
  },
  defaultProvider: {
    type: String,
    default: 'jitsi'
  },
  general: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      autoRecord: false,
      muteOnEntry: true,
      allowChat: true,
      allowScreenShare: true,
      waitingRoom: false,
      defaultPlatform: 'Google Meet',
      defaultDuration: '45',
      reminderBefore: '15',
      maxParticipants: '50',
      defaultQuality: 'HD (720p)',
      timezone: 'Asia/Kolkata (IST)'
    }
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      autoRecord: true,
      waitingRoom: true,
      chatEnabled: true,
      raiseHand: true,
      screenShare: false,
      attendance: true,
      notifications: true,
      emailReminder: true,
      smsReminder: false,
      studentVideo: true,
      studentMic: false,
      breakoutRooms: false,
      pollsQuizzes: true,
      whiteBoard: true
    }
  }
}, { timestamps: true, strict: false });

const LiveClass = mongoose.model('LiveClass', liveClassSchema);
const LiveClassSetting = mongoose.model('LiveClassSetting', liveClassSettingSchema);

module.exports = {
  LiveClass,
  LiveClassSetting
};
