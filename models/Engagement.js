const mongoose = require('mongoose');

// ==========================================
// 1. CREATIVE TEMPLATE SCHEMA
// ==========================================
const creativeTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['Birthday Card', 'Festival Banner', 'Event Flyer', 'Announcement'],
      default: 'Birthday Card'
    },
    style: {
      type: String,
      default: 'balloon-blue',
      trim: true
    },
    title: {
      type: String,
      default: 'Happy Birthday!'
    },
    placeholder: {
      type: String,
      default: '[student_name]'
    },
    greetingText: {
      type: String,
      default: 'Wishing you a fantastic year filled with joy, success and learning!'
    },
    subText: {
      type: String,
      default: 'From Greenwood International School'
    },
    backgroundGradient: {
      type: String,
      default: 'from-blue-600 via-indigo-600 to-purple-700'
    },
    textColor: {
      type: String,
      default: '#ffffff'
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Active', 'Draft', 'Archived'],
      default: 'Active'
    },
    tags: [String]
  },
  { timestamps: true }
);

// ==========================================
// 2. FESTIVAL GREETING SCHEMA
// ==========================================
const festivalGreetingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Festival name is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Festival date is required']
    },
    region: {
      type: String,
      default: 'ALL'
    },
    greetingLine: {
      type: String,
      default: 'May this auspicious day bring health, peace, prosperity, and wisdom to you and your loved ones.'
    },
    cardTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreativeTemplate'
    },
    cardTemplateName: {
      type: String,
      default: 'Festive Gold'
    },
    targetAudience: {
      type: String,
      enum: ['All Users', 'Students', 'Staff', 'Parents'],
      default: 'All Users'
    },
    autoSend: {
      type: Boolean,
      default: true
    },
    isCustomDay: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Active Today', 'Sent', 'Passed'],
      default: 'Upcoming'
    },
    lastSentAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// ==========================================
// 3. BIRTHDAY GREETING LOG SCHEMA
// ==========================================
const birthdayLogSchema = new mongoose.Schema(
  {
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'personType'
    },
    personType: {
      type: String,
      enum: ['Student', 'Staff'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    sub: {
      type: String,
      default: 'Student'
    },
    dateOfBirth: {
      type: Date
    },
    age: {
      type: Number,
      default: 0
    },
    cardTemplateName: {
      type: String,
      default: 'Balloon Blue'
    },
    customMessage: {
      type: String
    },
    status: {
      type: String,
      enum: ['Pending', 'Sent', 'Scheduled'],
      default: 'Pending'
    },
    channel: {
      type: String,
      default: 'WhatsApp'
    },
    sentAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// ==========================================
// 4. ENGAGEMENT SETTINGS SCHEMA
// ==========================================
const engagementSettingsSchema = new mongoose.Schema(
  {
    studentBirthdayEnabled: {
      type: Boolean,
      default: true
    },
    studentBirthdayCard: {
      type: String,
      default: 'Balloon Blue'
    },
    studentBirthdayTime: {
      type: String,
      default: '08:00'
    },
    studentBirthdayChannels: {
      type: [String],
      default: ['WhatsApp', 'SMS', 'Mobile App Push']
    },
    staffBirthdayEnabled: {
      type: Boolean,
      default: true
    },
    staffBirthdayCard: {
      type: String,
      default: 'Bold Party'
    },
    staffBirthdayTime: {
      type: String,
      default: '08:30'
    },
    staffBirthdayChannels: {
      type: [String],
      default: ['WhatsApp', 'Email']
    },
    festivalGreetingsEnabled: {
      type: Boolean,
      default: true
    },
    festivalDefaultTime: {
      type: String,
      default: '07:30'
    },
    festivalChannels: {
      type: [String],
      default: ['WhatsApp', 'Mobile App Push']
    },
    notifyClassTeacher: {
      type: Boolean,
      default: true
    },
    principalSignatureText: {
      type: String,
      default: 'Principal & Faculty, Greenwood International School'
    }
  },
  { timestamps: true }
);

const CreativeTemplate = mongoose.model('CreativeTemplate', creativeTemplateSchema);
const FestivalGreeting = mongoose.model('FestivalGreeting', festivalGreetingSchema);
const BirthdayLog = mongoose.model('BirthdayLog', birthdayLogSchema);
const EngagementSettings = mongoose.model('EngagementSettings', engagementSettingsSchema);

module.exports = {
  CreativeTemplate,
  FestivalGreeting,
  BirthdayLog,
  EngagementSettings
};
