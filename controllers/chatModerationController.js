const {
  ChatModerationSetting,
  ModeratedConversation,
  ModerationReport
} = require('../models/ChatModeration');

// Initial seed conversations if database collection is empty
const INITIAL_CONVERSATIONS = [
  {
    conversationId: 'CONV-1001',
    teacherName: 'Amit Sharma',
    withUserName: 'Anil Verma',
    studentName: 'Kabir Singh',
    type: 'Parent',
    className: 'Nursery - A',
    section: 'A',
    startedAt: new Date(Date.now() - 15 * 86400000),
    lastMsg: 'Message removed by Administrator for Safety Compliance',
    lastActivity: '2 days ago',
    lastActivityAt: new Date(Date.now() - 2 * 86400000),
    isLocked: false,
    lockReason: '',
    flagCount: 1,
    severity: 'Warning',
    messages: [
      {
        messageId: 'M-101',
        sender: 'Anil Verma',
        senderRole: 'Parent',
        content: 'Hello Sir, is Kabir doing well in class activities today?',
        timestamp: new Date(Date.now() - 2 * 86400000 - 3600000 * 4)
      },
      {
        messageId: 'M-102',
        sender: 'Amit Sharma',
        senderRole: 'Teacher',
        content: 'Hello Mr. Verma, yes he participated enthusiastically in the rhyme competition.',
        timestamp: new Date(Date.now() - 2 * 86400000 - 3600000 * 3)
      },
      {
        messageId: 'M-103',
        sender: 'Amit Sharma',
        senderRole: 'Teacher',
        content: 'Message removed by Administrator for Safety Compliance',
        originalContent: 'Please call me directly on my private WhatsApp 9899001122 for further private notes.',
        isAuditRemoved: true,
        removedBy: 'Super Admin',
        removedReason: 'Sharing unverified personal phone numbers violates child safety & school policy.',
        removedAt: new Date(Date.now() - 2 * 86400000 - 3600000 * 2),
        isFlagged: true,
        flagReason: 'Personal contact number shared',
        timestamp: new Date(Date.now() - 2 * 86400000 - 3600000 * 2)
      },
      {
        messageId: 'M-104',
        sender: 'Anil Verma',
        senderRole: 'Parent',
        content: 'Understood, we will stick to official ERP channel. Thank you.',
        timestamp: new Date(Date.now() - 2 * 86400000)
      }
    ],
    adminNotes: [
      {
        author: 'Chief Moderator',
        note: 'Teacher advised regarding policy on personal contact sharing. Message redacted.',
        createdAt: new Date(Date.now() - 2 * 86400000)
      }
    ]
  },
  {
    conversationId: 'CONV-1002',
    teacherName: 'Amit Sharma',
    withUserName: 'Dhruv Agarwal',
    studentName: 'Dhruv Agarwal',
    type: 'Student',
    className: 'Class 10 - B',
    section: 'B',
    startedAt: new Date(Date.now() - 10 * 86400000),
    lastMsg: 'Yes Dhruv, upload it on the study center portal before 5 PM.',
    lastActivity: '1 day ago',
    lastActivityAt: new Date(Date.now() - 86400000),
    isLocked: false,
    lockReason: '',
    flagCount: 0,
    severity: 'Normal',
    messages: [
      {
        messageId: 'M-201',
        sender: 'Dhruv Agarwal',
        senderRole: 'Student',
        content: 'Hi sir, can we submit the physics practical report tomorrow morning?',
        timestamp: new Date(Date.now() - 86400000 - 7200000)
      },
      {
        messageId: 'M-202',
        sender: 'Amit Sharma',
        senderRole: 'Teacher',
        content: 'Yes Dhruv, upload it on the study center portal before 5 PM.',
        timestamp: new Date(Date.now() - 86400000)
      }
    ],
    adminNotes: []
  },
  {
    conversationId: 'CONV-1003',
    teacherName: 'Amit Sharma',
    withUserName: 'Karan Shukla',
    studentName: 'Karan Shukla',
    type: 'Student',
    className: 'Class 10 - B',
    section: 'B',
    startedAt: new Date(Date.now() - 7 * 86400000),
    lastMsg: 'Channel locked pending investigation into sports meet argument.',
    lastActivity: '3 days ago',
    lastActivityAt: new Date(Date.now() - 3 * 86400000),
    isLocked: true,
    lockReason: 'Inappropriate language and dispute regarding sports team captaincy.',
    lockedAt: new Date(Date.now() - 3 * 86400000),
    lockedBy: 'Vice Principal',
    flagCount: 2,
    severity: 'Critical',
    messages: [
      {
        messageId: 'M-301',
        sender: 'Karan Shukla',
        senderRole: 'Student',
        content: 'Why was I removed from the football captain list? This is unfair!',
        timestamp: new Date(Date.now() - 3 * 86400000 - 14400000)
      },
      {
        messageId: 'M-302',
        sender: 'Amit Sharma',
        senderRole: 'Teacher',
        content: 'Selection was made based on discipline records and practice attendance Karan.',
        timestamp: new Date(Date.now() - 3 * 86400000 - 10800000)
      },
      {
        messageId: 'M-303',
        sender: 'Karan Shukla',
        senderRole: 'Student',
        content: 'Message removed by Administrator for Safety Compliance',
        originalContent: 'You are an idiot and you biased everyone against me!',
        isAuditRemoved: true,
        removedBy: 'Automated AI Filter',
        removedReason: 'Harassment & Inappropriate Language detected.',
        removedAt: new Date(Date.now() - 3 * 86400000 - 7200000),
        isFlagged: true,
        flagReason: 'Profanity & disrespect towards faculty',
        timestamp: new Date(Date.now() - 3 * 86400000 - 7200000)
      }
    ],
    adminNotes: [
      {
        author: 'Disciplinary Committee',
        note: 'Channel quarantined. Meeting scheduled with parents on Friday.',
        createdAt: new Date(Date.now() - 3 * 86400000)
      }
    ]
  },
  {
    conversationId: 'CONV-1004',
    teacherName: 'Neha Gupta',
    withUserName: 'Rohan Mehra',
    studentName: 'Rohan Mehra',
    type: 'Student',
    className: 'Class 8 - A',
    section: 'A',
    startedAt: new Date(Date.now() - 5 * 86400000),
    lastMsg: 'Thank you ma\'am, I will revise chapter 4 today.',
    lastActivity: '4 hours ago',
    lastActivityAt: new Date(Date.now() - 14400000),
    isLocked: false,
    lockReason: '',
    flagCount: 0,
    severity: 'Normal',
    messages: [
      {
        messageId: 'M-401',
        sender: 'Neha Gupta',
        senderRole: 'Teacher',
        content: 'Your English essay was well structured Rohan. Keep it up!',
        timestamp: new Date(Date.now() - 28800000)
      },
      {
        messageId: 'M-402',
        sender: 'Rohan Mehra',
        senderRole: 'Student',
        content: 'Thank you ma\'am, I will revise chapter 4 today.',
        timestamp: new Date(Date.now() - 14400000)
      }
    ],
    adminNotes: []
  },
  {
    conversationId: 'CONV-1005',
    teacherName: 'Neha Gupta',
    withUserName: 'Sunita Mehra',
    studentName: 'Rohan Mehra',
    type: 'Parent',
    className: 'Class 8 - A',
    section: 'A',
    startedAt: new Date(Date.now() - 6 * 86400000),
    lastMsg: 'I will attend the PTM around 11:30 AM.',
    lastActivity: 'Yesterday',
    lastActivityAt: new Date(Date.now() - 86400000),
    isLocked: false,
    lockReason: '',
    flagCount: 0,
    severity: 'Normal',
    messages: [
      {
        messageId: 'M-501',
        sender: 'Neha Gupta',
        senderRole: 'Teacher',
        content: 'Dear Mrs. Mehra, please confirm your attendance slot for the upcoming PTM.',
        timestamp: new Date(Date.now() - 129600000)
      },
      {
        messageId: 'M-502',
        sender: 'Sunita Mehra',
        senderRole: 'Parent',
        content: 'I will attend the PTM around 11:30 AM.',
        timestamp: new Date(Date.now() - 86400000)
      }
    ],
    adminNotes: []
  },
  {
    conversationId: 'CONV-1006',
    teacherName: 'Rajesh Verma',
    withUserName: 'Priya Sharma',
    studentName: 'Aarav Sharma',
    type: 'Parent',
    className: 'Class 9 - C',
    section: 'C',
    startedAt: new Date(Date.now() - 8 * 86400000),
    lastMsg: 'Fee slip receipt confirmed. Thank you Sir.',
    lastActivity: '5 hours ago',
    lastActivityAt: new Date(Date.now() - 18000000),
    isLocked: false,
    lockReason: '',
    flagCount: 0,
    severity: 'Normal',
    messages: [
      {
        messageId: 'M-601',
        sender: 'Rajesh Verma',
        senderRole: 'Teacher',
        content: 'Reminder: Term 2 examination admit cards will be issued from Monday.',
        timestamp: new Date(Date.now() - 36000000)
      },
      {
        messageId: 'M-602',
        sender: 'Priya Sharma',
        senderRole: 'Parent',
        content: 'Fee slip receipt confirmed. Thank you Sir.',
        timestamp: new Date(Date.now() - 18000000)
      }
    ],
    adminNotes: []
  }
];

const INITIAL_REPORTS = [
  {
    reportId: 'REP-801',
    conversationId: 'CONV-1003',
    studentName: 'Karan Shukla',
    teacherName: 'Amit Sharma',
    reportedBy: 'Amit Sharma',
    reporterRole: 'Teacher',
    reason: 'Abusive message regarding sports squad selection.',
    severity: 'Critical',
    status: 'Pending',
    actionTaken: 'Channel quarantined pending parental meeting.',
    createdAt: new Date(Date.now() - 3 * 86400000)
  },
  {
    reportId: 'REP-802',
    conversationId: 'CONV-1001',
    studentName: 'Kabir Singh',
    teacherName: 'Amit Sharma',
    reportedBy: 'Automated AI Filter',
    reporterRole: 'Automated AI Filter',
    reason: 'Personal mobile number shared over direct chat.',
    severity: 'Medium',
    status: 'Resolved',
    actionTaken: 'Message redacted from transcript. Teacher issued policy compliance warning.',
    resolvedAt: new Date(Date.now() - 2 * 86400000),
    resolvedBy: 'Super Admin',
    createdAt: new Date(Date.now() - 2 * 86400000)
  }
];

// Helper to seed initial data
const seedModerationData = async () => {
  return;
  try {
    const convCount = await ModeratedConversation.countDocuments();
    if (convCount === 0) {
      await ModeratedConversation.create(INITIAL_CONVERSATIONS);
    }

    const reportCount = await ModerationReport.countDocuments();
    if (reportCount === 0) {
      await ModerationReport.create(INITIAL_REPORTS);
    }

    const settingCount = await ChatModerationSetting.countDocuments();
    if (settingCount === 0) {
      await ChatModerationSetting.create({
        chatEnabled: true,
        teacherStudentEnabled: true,
        teacherParentEnabled: true,
        studentStudentEnabled: false,
        restrictedHours: { enabled: false, startTime: '08:00', endTime: '18:00' },
        autoFilterProfanity: true,
        blockPhoneNumbers: true,
        notificationEmail: 'safety@greenwood.edu'
      });
    }
  } catch (err) {
    console.error('Error seeding chat moderation data:', err);
  }
};
// seedModerationData();

// ==============================================================
// 1. POLICY & SETTINGS CONTROLLERS
// ==============================================================
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await ChatModerationSetting.findOne();
    if (!settings) {
      settings = await ChatModerationSetting.create({
        chatEnabled: true,
        teacherStudentEnabled: true,
        teacherParentEnabled: true,
        studentStudentEnabled: false
      });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) { next(error); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await ChatModerationSetting.findOne();
    if (!settings) {
      settings = new ChatModerationSetting();
    }

    const {
      chatEnabled,
      teacherStudentEnabled,
      teacherParentEnabled,
      studentStudentEnabled,
      restrictedHours,
      autoFilterProfanity,
      blockPhoneNumbers,
      flaggedKeywords,
      notificationEmail
    } = req.body;

    if (chatEnabled !== undefined) settings.chatEnabled = Boolean(chatEnabled);
    if (teacherStudentEnabled !== undefined) settings.teacherStudentEnabled = Boolean(teacherStudentEnabled);
    if (teacherParentEnabled !== undefined) settings.teacherParentEnabled = Boolean(teacherParentEnabled);
    if (studentStudentEnabled !== undefined) settings.studentStudentEnabled = Boolean(studentStudentEnabled);
    if (restrictedHours !== undefined) settings.restrictedHours = restrictedHours;
    if (autoFilterProfanity !== undefined) settings.autoFilterProfanity = Boolean(autoFilterProfanity);
    if (blockPhoneNumbers !== undefined) settings.blockPhoneNumbers = Boolean(blockPhoneNumbers);
    if (flaggedKeywords !== undefined) settings.flaggedKeywords = flaggedKeywords;
    if (notificationEmail !== undefined) settings.notificationEmail = notificationEmail;

    await settings.save();
    res.status(200).json({
      success: true,
      message: 'Chat moderation policy updated successfully',
      data: settings
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 2. CONVERSATIONS SURVEILLANCE & DRILL-DOWN
// ==============================================================
exports.getConversations = async (req, res, next) => {
  try {
    const {
      search,
      teacher,
      student,
      type,
      status, // 'all', 'active', 'locked', 'flagged'
      severity
    } = req.query;

    const query = {};

    if (type && type !== 'All') {
      query.type = type;
    }

    if (status === 'locked') {
      query.isLocked = true;
    } else if (status === 'active') {
      query.isLocked = false;
    } else if (status === 'flagged') {
      query.flagCount = { $gt: 0 };
    }

    if (severity && severity !== 'All') {
      query.severity = severity;
    }

    if (teacher) {
      query.teacherName = { $regex: teacher, $options: 'i' };
    }

    if (student) {
      query.studentName = { $regex: student, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { teacherName: { $regex: search, $options: 'i' } },
        { withUserName: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { className: { $regex: search, $options: 'i' } },
        { lastMsg: { $regex: search, $options: 'i' } }
      ];
    }

    let conversations = await ModeratedConversation.find(query).sort({ lastActivityAt: -1 });

    // No auto-seeding

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) { next(error); }
};

exports.getConversationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await ModeratedConversation.findOne({
      $or: [{ conversationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) { next(error); }
};

// ==============================================================
// 3. MODERATION ACTIONS (LOCK / UNLOCK / REDACT / RESTORE)
// ==============================================================
exports.toggleLockConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isLocked, reason, lockedBy } = req.body;

    const conversation = await ModeratedConversation.findOne({
      $or: [{ conversationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const nextLocked = isLocked !== undefined ? Boolean(isLocked) : !conversation.isLocked;
    conversation.isLocked = nextLocked;

    if (nextLocked) {
      conversation.lockReason = reason || 'Quarantined by Administrator for policy violation.';
      conversation.lockedAt = new Date();
      conversation.lockedBy = lockedBy || 'Admin';
      conversation.severity = conversation.severity === 'Normal' ? 'Warning' : conversation.severity;
    } else {
      conversation.lockReason = '';
      conversation.lockedAt = null;
      conversation.lockedBy = null;
    }

    await conversation.save();

    res.status(200).json({
      success: true,
      message: `Conversation ${nextLocked ? 'Locked' : 'Unlocked'} successfully`,
      data: conversation
    });
  } catch (error) { next(error); }
};

exports.redactMessage = async (req, res, next) => {
  try {
    const { id, messageId } = req.params;
    const { reason, removedBy } = req.body;

    const conversation = await ModeratedConversation.findOne({
      $or: [{ conversationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const msg = conversation.messages.find(m => m.messageId === messageId || m._id.toString() === messageId);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found in conversation' });
    }

    if (!msg.isAuditRemoved) {
      msg.originalContent = msg.content;
      msg.content = 'Message removed by Administrator for Safety Compliance';
      msg.isAuditRemoved = true;
      msg.removedBy = removedBy || 'Moderator';
      msg.removedReason = reason || 'Violated student communication guidelines.';
      msg.removedAt = new Date();
      msg.isFlagged = true;
      msg.flagReason = reason || 'Redacted message';
      conversation.flagCount = (conversation.flagCount || 0) + 1;
      conversation.severity = 'Warning';
    }

    conversation.lastMsg = msg.content;
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Message redacted for safety audit',
      data: conversation
    });
  } catch (error) { next(error); }
};

exports.restoreMessage = async (req, res, next) => {
  try {
    const { id, messageId } = req.params;

    const conversation = await ModeratedConversation.findOne({
      $or: [{ conversationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const msg = conversation.messages.find(m => m.messageId === messageId || m._id.toString() === messageId);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found in conversation' });
    }

    if (msg.isAuditRemoved && msg.originalContent) {
      msg.content = msg.originalContent;
      msg.isAuditRemoved = false;
      msg.removedBy = null;
      msg.removedReason = null;
      msg.removedAt = null;
      msg.isFlagged = false;
      conversation.flagCount = Math.max(0, (conversation.flagCount || 1) - 1);
    }

    conversation.lastMsg = msg.content;
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Message content restored',
      data: conversation
    });
  } catch (error) { next(error); }
};

exports.addAdminNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note, author } = req.body;

    if (!note) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    const conversation = await ModeratedConversation.findOne({
      $or: [{ conversationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    conversation.adminNotes.push({
      author: author || 'Administrator',
      note,
      createdAt: new Date()
    });

    await conversation.save();

    res.status(201).json({
      success: true,
      message: 'Internal moderation note recorded',
      data: conversation
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 4. INCIDENT REPORTS & COMPLAINTS TRIAGE
// ==============================================================
exports.getReports = async (req, res, next) => {
  try {
    const { status, severity } = req.query;
    const query = {};

    if (status && status !== 'All') query.status = status;
    if (severity && severity !== 'All') query.severity = severity;

    let reports = await ModerationReport.find(query).sort({ createdAt: -1 });

    // No auto-seeding

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) { next(error); }
};

exports.resolveReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status, actionTaken, resolvedBy } = req.body;

    const report = await ModerationReport.findOne({
      $or: [{ reportId }, { _id: reportId.match(/^[0-9a-fA-F]{24}$/) ? reportId : null }]
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report incident not found' });
    }

    report.status = status || 'Resolved';
    report.actionTaken = actionTaken || report.actionTaken;
    report.resolvedAt = new Date();
    report.resolvedBy = resolvedBy || 'Administrator';

    await report.save();

    res.status(200).json({
      success: true,
      message: `Report marked as ${report.status}`,
      data: report
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 5. STATS & METRICS
// ==============================================================
exports.getStats = async (req, res, next) => {
  try {
    const [allConvs, reports, setting] = await Promise.all([
      ModeratedConversation.find(),
      ModerationReport.find(),
      ChatModerationSetting.findOne()
    ]);

    const totalConversations = allConvs.length;
    const lockedConversations = allConvs.filter(c => c.isLocked).length;
    const activeConversations = totalConversations - lockedConversations;
    const flaggedCount = allConvs.reduce((acc, c) => acc + (c.flagCount || 0), 0);
    const pendingReports = reports.filter(r => r.status === 'Pending').length;

    // Safety Compliance Score (100 minus penalty for pending incidents/flags)
    const penalty = Math.min(25, (pendingReports * 5) + (lockedConversations * 3));
    const safetyIndex = Math.max(75, 100 - penalty);

    res.status(200).json({
      success: true,
      data: {
        totalConversations,
        activeConversations,
        lockedConversations,
        flaggedCount,
        pendingReports,
        safetyIndex,
        isMasterEnabled: setting?.chatEnabled ?? true
      }
    });
  } catch (error) { next(error); }
};
