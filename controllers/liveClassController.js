const { LiveClass, LiveClassSetting } = require('../models/LiveClass');
const Staff = require('../models/Staff');
const AcademicClass = require('../models/AcademicClass');

// Seed helper if no classes exist
const autoSeedClassesIfEmpty = async () => {
  const count = await LiveClass.countDocuments();
  if (count > 0) return;

  const now = new Date();
  const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30);
  const tomorrowMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0);
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 11, 0);
  const twoDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 14, 0);

  const defaultClasses = [
    {
      title: 'Quadratic Equations & Board Problem Practice',
      description: 'NCERT Chapter 4 key questions, factoring quadratic polynomials, and graphical methods.',
      className: 'Class X',
      sectionName: 'Section A',
      subjectName: 'Mathematics',
      teacherName: 'Amit Sharma',
      provider: 'Jitsi',
      meetingUrl: 'https://meet.jit.si/school-erp-math-class10-algebra',
      meetingId: '821 4410 2931',
      passcode: 'MATH10',
      startTime: new Date(now.getTime() - 15 * 60000), // Started 15 mins ago
      durationMinutes: 60,
      status: 'Live',
      attendeeCount: 34,
      maxStudents: 50,
      attendees: [
        { studentName: 'Aarav Mehta', rollNumber: '1001', joinedAt: new Date(now.getTime() - 14 * 60000) },
        { studentName: 'Diya Patel', rollNumber: '1002', joinedAt: new Date(now.getTime() - 12 * 60000) },
        { studentName: 'Kabir Sharma', rollNumber: '1005', joinedAt: new Date(now.getTime() - 10 * 60000) },
        { studentName: 'Ananya Verma', rollNumber: '1008', joinedAt: new Date(now.getTime() - 8 * 60000) }
      ]
    },
    {
      title: 'Human Circulatory System & Double Circulation',
      description: 'Interactive 3D diagram review of the human heart, systemic loop, and pulmonary artery.',
      className: 'Class X',
      sectionName: 'Section B',
      subjectName: 'Science & Biology',
      teacherName: 'Priya Singh',
      provider: 'Zoom',
      meetingUrl: 'https://zoom.us/j/9482941042',
      meetingId: '948 2941 042',
      passcode: 'BIO2026',
      startTime: new Date(now.getTime() - 5 * 60000), // Started 5 mins ago
      durationMinutes: 45,
      status: 'Live',
      attendeeCount: 28,
      maxStudents: 45,
      attendees: [
        { studentName: 'Rohan Gupta', rollNumber: '1012', joinedAt: new Date(now.getTime() - 4 * 60000) },
        { studentName: 'Ishaan Reddy', rollNumber: '1015', joinedAt: new Date(now.getTime() - 3 * 60000) }
      ]
    },
    {
      title: 'Shakespeare’s Julius Caesar Act III Discussion',
      description: 'Mark Antony speech analysis, rhetoric devices, and essay formulation.',
      className: 'Class IX',
      sectionName: 'Section A',
      subjectName: 'English Literature',
      teacherName: 'Rajesh Kumar',
      provider: 'GoogleMeet',
      meetingUrl: 'https://meet.google.com/abc-wxyz-efg',
      meetingId: 'abc-wxyz-efg',
      passcode: '',
      startTime: tomorrowMorning,
      durationMinutes: 40,
      status: 'Scheduled',
      attendeeCount: 0,
      maxStudents: 40
    },
    {
      title: 'Python Data Structures: Lists & Dictionaries',
      description: 'Live coding session solving list indexing, nested dictionaries, and sorting.',
      className: 'Class XI',
      sectionName: 'Section Science',
      subjectName: 'Computer Science',
      teacherName: 'Vikram Malhotra',
      provider: 'Jitsi',
      meetingUrl: 'https://meet.jit.si/school-erp-cs-python-class11',
      meetingId: '772 1049 881',
      passcode: 'PYTHON',
      startTime: new Date(now.getTime() + 180 * 60000), // 3 hours from now
      durationMinutes: 50,
      status: 'Scheduled',
      attendeeCount: 0,
      maxStudents: 40
    },
    {
      title: 'French Revolution: Reign of Terror & Impact',
      description: 'Historical cause analysis, timeline review, and map marking exercise.',
      className: 'Class IX',
      sectionName: 'Section B',
      subjectName: 'Social Sciences',
      teacherName: 'Sneha Desai',
      provider: 'Jitsi',
      meetingUrl: 'https://meet.jit.si/school-erp-history-class9',
      meetingId: '621 9901 224',
      passcode: '',
      startTime: yesterday,
      durationMinutes: 45,
      status: 'Completed',
      attendeeCount: 38,
      maxStudents: 42,
      recordingUrl: 'https://archive.org/details/school-erp-demo-recording-french-revolution'
    },
    {
      title: 'Newtonian Laws of Motion & Friction Experiments',
      description: 'Free body diagrams, incline plane friction problems, and real-world examples.',
      className: 'Class IX',
      sectionName: 'Section A',
      subjectName: 'Physics',
      teacherName: 'Amit Sharma',
      provider: 'Zoom',
      meetingUrl: 'https://zoom.us/j/8204918239',
      meetingId: '820 4918 239',
      passcode: 'PHYSICS',
      startTime: twoDaysAgo,
      durationMinutes: 60,
      status: 'Completed',
      attendeeCount: 35,
      maxStudents: 40,
      recordingUrl: 'https://archive.org/details/school-erp-demo-physics-mechanics'
    }
  ];

  await LiveClass.insertMany(defaultClasses);
};

// 1. Get Live Classes with Filtering and Search
exports.getLiveClasses = async (req, res, next) => {
  try {
    await autoSeedClassesIfEmpty();

    const { status, search, className, sectionId, provider } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (className) {
      query.className = new RegExp(className, 'i');
    }

    if (provider && provider !== 'All') {
      query.provider = provider;
    }

    if (search && search.trim() !== '') {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { subjectName: { $regex: s, $options: 'i' } },
        { teacherName: { $regex: s, $options: 'i' } },
        { className: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } }
      ];
    }

    // Sort order: Live first, then Scheduled upcoming, then Completed/Cancelled
    const classes = await LiveClass.find(query)
      .populate('hostId', 'fullName email designation')
      .populate('subject', 'subjectName')
      .populate('academicClass', 'className')
      .sort({ status: -1, startTime: -1 });

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get Live Class Dashboard Stats
exports.getLiveClassStats = async (req, res, next) => {
  try {
    await autoSeedClassesIfEmpty();

    const total = await LiveClass.countDocuments();
    const liveNow = await LiveClass.countDocuments({ status: 'Live' });
    const scheduled = await LiveClass.countDocuments({ status: 'Scheduled' });
    const completed = await LiveClass.countDocuments({ status: 'Completed' });
    const cancelled = await LiveClass.countDocuments({ status: 'Cancelled' });

    // Aggregate total student attendance
    const attendanceAgg = await LiveClass.aggregate([
      { $group: { _id: null, totalAttendees: { $sum: '$attendeeCount' } } }
    ]);
    const totalAttendees = attendanceAgg.length > 0 ? attendanceAgg[0].totalAttendees : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        liveNow,
        scheduled,
        completed,
        cancelled,
        totalAttendees
      }
    });
  } catch (error) {
    next(error);
  }
};

const mongoose = require('mongoose');
const AcademicSection = require('../models/AcademicSection');
const AcademicSubject = require('../models/AcademicSubject');

const isValidObjectId = (id) => id && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);

const normalizeProvider = (input) => {
  const p = (input || '').toString().trim();
  if (/meet|google/i.test(p)) return 'GoogleMeet';
  if (/zoom/i.test(p)) return 'Zoom';
  if (/team/i.test(p)) return 'Teams';
  if (/jitsi/i.test(p)) return 'Jitsi';
  if (/external/i.test(p)) return 'External';
  if (/custom/i.test(p)) return 'Custom';
  return 'Jitsi';
};

// 3. Schedule New Live Class
exports.scheduleLiveClass = async (req, res, next) => {
  try {
    let {
      title,
      description,
      className,
      sectionName,
      subjectName,
      teacherName,
      academicClass,
      section,
      subject,
      hostId,
      provider,
      platform,
      meetingUrl,
      meetingId,
      passcode,
      startTime,
      date,
      time,
      durationMinutes,
      duration,
      maxStudents = 60
    } = req.body;

    let resolvedStartTime = startTime;
    if (!resolvedStartTime && date && time) {
      resolvedStartTime = `${date}T${time}:00`;
    }

    if (!title || !resolvedStartTime) {
      return res.status(400).json({
        success: false,
        message: 'Title and Start Time (or Date and Time) are required to schedule a live class'
      });
    }

    // Sanitize ObjectIds
    academicClass = isValidObjectId(academicClass) ? academicClass : undefined;
    section = isValidObjectId(section) ? section : undefined;
    subject = isValidObjectId(subject) ? subject : undefined;
    hostId = isValidObjectId(hostId) ? hostId : undefined;

    // Lookup names if not provided
    if (academicClass && (!className || className === 'General' || className === 'Academic')) {
      try {
        const clsDoc = await AcademicClass.findById(academicClass);
        if (clsDoc) className = clsDoc.className;
      } catch (_) {}
    }

    if (section && (!sectionName || sectionName === 'All')) {
      try {
        const secDoc = await AcademicSection.findById(section);
        if (secDoc) sectionName = secDoc.sectionName;
      } catch (_) {}
    }

    if (subject && (!subjectName || subjectName === 'General')) {
      try {
        const subDoc = await AcademicSubject.findById(subject);
        if (subDoc) subjectName = subDoc.subjectName;
      } catch (_) {}
    }

    if (hostId && (!teacherName || teacherName === 'School Faculty')) {
      try {
        const staffDoc = await Staff.findById(hostId);
        if (staffDoc) teacherName = staffDoc.fullName || staffDoc.name;
      } catch (_) {}
    }

    const resolvedProvider = normalizeProvider(provider || platform || 'Jitsi');

    // Auto-generate meeting URL if missing
    let resolvedMeetingUrl = (meetingUrl || '').trim();
    let resolvedMeetingId = (meetingId || '').trim();
    const sanitizedTitle = (title || 'live-class')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const randomSuffix = Math.random().toString(36).substring(2, 8);

    if (!resolvedMeetingUrl) {
      if (resolvedProvider === 'GoogleMeet') {
        const gMeetCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
        resolvedMeetingUrl = `https://meet.google.com/${gMeetCode}`;
        resolvedMeetingId = gMeetCode;
      } else if (resolvedProvider === 'Zoom') {
        const zoomId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        resolvedMeetingUrl = `https://zoom.us/j/${zoomId}`;
        resolvedMeetingId = zoomId;
      } else if (resolvedProvider === 'Teams') {
        resolvedMeetingUrl = `https://teams.live.com/meet/${Math.random().toString(36).substring(2, 10)}`;
        resolvedMeetingId = `teams-${randomSuffix}`;
      } else {
        resolvedMeetingUrl = `https://meet.jit.si/school-erp-${sanitizedTitle}-${randomSuffix}`;
        resolvedMeetingId = `jitsi-${randomSuffix}`;
      }
    }

    const durationVal = Number(durationMinutes) || Number(duration) || 45;

    const newClass = await LiveClass.create({
      title,
      description: description || '',
      className: className || 'General',
      sectionName: sectionName || 'All',
      subjectName: subjectName || 'General',
      teacherName: teacherName || 'School Faculty',
      academicClass,
      section,
      subject,
      hostId,
      provider: resolvedProvider,
      meetingUrl: resolvedMeetingUrl,
      meetingId: resolvedMeetingId,
      passcode: passcode || '',
      startTime: new Date(resolvedStartTime),
      durationMinutes: durationVal,
      maxStudents: Number(maxStudents) || 60,
      status: 'Scheduled'
    });

    res.status(201).json({
      success: true,
      message: 'Live class scheduled successfully',
      data: newClass
    });
  } catch (error) {
    next(error);
  }
};

// 4. Get Single Live Class by ID
exports.getLiveClassById = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id)
      .populate('hostId', 'fullName email designation phone')
      .populate('subject', 'subjectName')
      .populate('academicClass', 'className');

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    res.status(200).json({ success: true, data: liveClass });
  } catch (error) {
    next(error);
  }
};

// 5. Update Live Class
exports.updateLiveClass = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // Sanitize ObjectIds
    if ('academicClass' in updateData) {
      updateData.academicClass = isValidObjectId(updateData.academicClass) ? updateData.academicClass : undefined;
      if (updateData.academicClass && !updateData.className) {
        try {
          const clsDoc = await AcademicClass.findById(updateData.academicClass);
          if (clsDoc) updateData.className = clsDoc.className;
        } catch (_) {}
      }
    }

    if ('section' in updateData) {
      updateData.section = isValidObjectId(updateData.section) ? updateData.section : undefined;
      if (updateData.section && !updateData.sectionName) {
        try {
          const secDoc = await AcademicSection.findById(updateData.section);
          if (secDoc) updateData.sectionName = secDoc.sectionName;
        } catch (_) {}
      }
    }

    if ('subject' in updateData) {
      updateData.subject = isValidObjectId(updateData.subject) ? updateData.subject : undefined;
      if (updateData.subject && !updateData.subjectName) {
        try {
          const subDoc = await AcademicSubject.findById(updateData.subject);
          if (subDoc) updateData.subjectName = subDoc.subjectName;
        } catch (_) {}
      }
    }

    if ('hostId' in updateData) {
      updateData.hostId = isValidObjectId(updateData.hostId) ? updateData.hostId : undefined;
    }

    if (updateData.platform || updateData.provider) {
      updateData.provider = normalizeProvider(updateData.platform || updateData.provider);
    }

    if (updateData.date && updateData.time) {
      updateData.startTime = new Date(`${updateData.date}T${updateData.time}:00`);
    } else if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime);
    }

    if (updateData.duration) {
      updateData.durationMinutes = Number(updateData.duration) || updateData.durationMinutes || 45;
    }

    const updated = await LiveClass.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Live class updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// 6. Delete Live Class
exports.deleteLiveClass = async (req, res, next) => {
  try {
    const deleted = await LiveClass.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Live class removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// 7. Update Status (Start Live, Complete, Cancel)
exports.updateLiveClassStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Live', 'Scheduled', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const updateFields = { status };
    if (status === 'Completed') {
      updateFields.endTime = new Date();
    }

    const updated = await LiveClass.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    res.status(200).json({
      success: true,
      message: `Live class status updated to ${status}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// 8. Join Live Class (Log Attendance)
exports.joinLiveClass = async (req, res, next) => {
  try {
    const { studentName = 'Teacher Host', rollNumber = 'STAFF' } = req.body;
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    // Add attendee record
    liveClass.attendees.push({
      studentName,
      rollNumber,
      joinedAt: new Date()
    });
    liveClass.attendeeCount = liveClass.attendees.length;

    await liveClass.save();

    res.status(200).json({
      success: true,
      message: 'Joined live class session',
      meetingUrl: liveClass.meetingUrl,
      attendeeCount: liveClass.attendeeCount
    });
  } catch (error) {
    next(error);
  }
};

// 9. Get Live Class Settings
exports.getLiveClassSettings = async (req, res, next) => {
  try {
    let settings = await LiveClassSetting.findOne();
    if (!settings) {
      settings = await LiveClassSetting.create({
        providers: {
          jitsi: { enabled: true, domain: 'meet.jit.si', appId: '', appSecret: '' },
          external: { enabled: true },
          zoom: { enabled: false, accountId: '', clientId: '', clientSecret: '' },
          googleMeet: { enabled: false, clientId: '', clientSecret: '' }
        },
        defaultProvider: 'jitsi',
        general: {
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
        },
        settings: {
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
      });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// 10. Update Live Class Settings
exports.updateLiveClassSettings = async (req, res, next) => {
  try {
    let settings = await LiveClassSetting.findOne();
    if (!settings) {
      settings = new LiveClassSetting(req.body);
    } else {
      if (req.body.providers) settings.providers = { ...settings.providers, ...req.body.providers };
      if (req.body.defaultProvider) settings.defaultProvider = req.body.defaultProvider;
      if (req.body.general) settings.general = { ...settings.general, ...req.body.general };
      if (req.body.settings) settings.settings = { ...settings.settings, ...req.body.settings };

      // Also merge any flat keys if frontend sent flat settings
      const flatSettingsKeys = [
        'autoRecord', 'waitingRoom', 'chatEnabled', 'raiseHand', 'screenShare',
        'attendance', 'notifications', 'emailReminder', 'smsReminder', 'studentVideo',
        'studentMic', 'breakoutRooms', 'pollsQuizzes', 'whiteBoard'
      ];
      const flatGeneralKeys = [
        'defaultPlatform', 'defaultDuration', 'reminderBefore', 'maxParticipants',
        'defaultQuality', 'timezone'
      ];

      const currentSettings = settings.settings || {};
      const currentGeneral = settings.general || {};

      flatSettingsKeys.forEach(key => {
        if (key in req.body) currentSettings[key] = req.body[key];
      });
      flatGeneralKeys.forEach(key => {
        if (key in req.body) currentGeneral[key] = req.body[key];
      });

      settings.settings = currentSettings;
      settings.general = currentGeneral;
      settings.markModified('settings');
      settings.markModified('general');
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Live class provider settings saved successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};
