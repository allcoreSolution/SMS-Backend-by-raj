const {
  CreativeTemplate,
  FestivalGreeting,
  BirthdayLog,
  EngagementSettings
} = require('../models/Engagement');
const Student = require('../models/Student');
const Staff = require('../models/Staff');

// Helper: Calculate turning age and days remaining until next birthday
const getBirthdayMeta = (dob, now = new Date()) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  // Birthday this year
  let nextBday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
  
  // Set today start of day
  const todayStart = new Date(currentYear, currentMonth, currentDay);
  
  // If birthday already passed this year (before today)
  if (nextBday < todayStart) {
    nextBday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
  }

  const diffTime = nextBday.getTime() - todayStart.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const turningAge = nextBday.getFullYear() - birthDate.getFullYear();

  let whenStr = '';
  let category = 'upcoming';

  if (diffDays === 0) {
    whenStr = 'Today!';
    category = 'today';
  } else if (diffDays === 1) {
    whenStr = 'Tomorrow';
    category = 'next-7-days';
  } else if (diffDays <= 7) {
    whenStr = `in ${diffDays} days`;
    category = 'next-7-days';
  } else if (birthDate.getMonth() === currentMonth) {
    whenStr = `in ${diffDays} days`;
    category = 'this-month';
  } else {
    whenStr = `in ${diffDays} days`;
    category = 'upcoming';
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${birthDate.getDate()} ${months[birthDate.getMonth()]}`;

  return {
    diffDays,
    when: whenStr,
    category,
    age: turningAge,
    formattedDate
  };
};

// ==========================================
// 1. BIRTHDAY MANAGER DASHBOARD
// ==========================================
exports.getBirthdayDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();

    const [students, staffMembers, logs] = await Promise.all([
      Student.find().select('firstName lastName dateOfBirth classId sectionId admissionNo aparId studentPhoto studentPhone phone').populate('classId sectionId'),
      Staff.find().select('fullName dateOfBirth department designation staffId phone photo'),
      BirthdayLog.find({
        createdAt: {
          $gte: new Date(now.getFullYear(), 0, 1),
          $lte: new Date(now.getFullYear(), 11, 31)
        }
      })
    ]);

    const logMap = {};
    logs.forEach(l => {
      const key = `${l.personType}-${l.personId || l.name}`;
      logMap[key] = l;
    });

    const birthdayRecords = [];

    // Process Students
    students.forEach(st => {
      if (!st.dateOfBirth) return;
      const meta = getBirthdayMeta(st.dateOfBirth, now);
      if (!meta) return;

      const className = st.classId?.name || (st.classId?.className ? `Class ${st.classId.className}` : '');
      const secName = st.sectionId?.name || st.sectionId?.sectionName || '';
      const sub = className ? `${className} ${secName}`.trim() : 'Class V A';

      const studentName = `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student';
      const key = `Student-${st._id}`;
      const log = logMap[key];

      birthdayRecords.push({
        id: `STU-${st._id}`,
        personId: st._id,
        personType: 'Student',
        name: studentName,
        sub,
        phone: st.phone || '',
        date: meta.formattedDate,
        rawDate: st.dateOfBirth,
        age: meta.age,
        when: meta.when,
        diffDays: meta.diffDays,
        category: meta.category,
        status: log ? `Sent (${log.cardTemplateName || 'Balloon Blue'})` : '—',
        isSent: !!log
      });
    });

    // Process Staff
    staffMembers.forEach(sf => {
      if (!sf.dateOfBirth) return;
      const meta = getBirthdayMeta(sf.dateOfBirth, now);
      if (!meta) return;

      const sub = sf.designation || sf.department || 'Faculty';
      const key = `Staff-${sf._id}`;
      const log = logMap[key];

      birthdayRecords.push({
        id: `STF-${sf._id}`,
        personId: sf._id,
        personType: 'Staff',
        name: sf.fullName || 'Staff Member',
        sub,
        phone: sf.phone || '',
        date: meta.formattedDate,
        rawDate: sf.dateOfBirth,
        age: meta.age,
        when: meta.when,
        diffDays: meta.diffDays,
        category: meta.category,
        status: log ? `Sent (${log.cardTemplateName || 'Bold Party'})` : '—',
        isSent: !!log
      });
    });

    // Sort by diffDays ascending (nearest first)
    birthdayRecords.sort((a, b) => a.diffDays - b.diffDays);

    const todayBirthdays = birthdayRecords.filter(b => b.category === 'today');
    const next7DaysBirthdays = birthdayRecords.filter(b => b.diffDays <= 7);
    const thisMonthBirthdays = birthdayRecords.filter(b => {
      if (!b.rawDate) return false;
      return new Date(b.rawDate).getMonth() === currentMonth;
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          todayCount: todayBirthdays.length,
          next7DaysCount: next7DaysBirthdays.length,
          thisMonthCount: thisMonthBirthdays.length,
          totalBirthdays: birthdayRecords.length
        },
        today: todayBirthdays,
        next7Days: next7DaysBirthdays,
        thisMonth: thisMonthBirthdays,
        all: birthdayRecords
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.sendBirthdayGreeting = async (req, res, next) => {
  try {
    const {
      personId,
      personType,
      name,
      sub,
      age,
      cardTemplateName,
      customMessage,
      channel
    } = req.body;

    const log = await BirthdayLog.create({
      personId: personId || undefined,
      personType: personType || 'Student',
      name: name || 'Student / Staff',
      sub: sub || '',
      age: Number(age) || 0,
      cardTemplateName: cardTemplateName || 'Balloon Blue',
      customMessage: customMessage || 'Wishing you a very Happy Birthday! Have a wonderful year ahead.',
      status: 'Sent',
      channel: channel || 'WhatsApp',
      sentAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: `Birthday greeting card "${cardTemplateName}" sent successfully to ${name}!`,
      data: log
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. CREATIVE TEMPLATES CRUD
// ==========================================
exports.getCreatives = async (req, res, next) => {
  try {
    const { type, q } = req.query;
    let query = { status: { $ne: 'Archived' } };

    if (type && type !== 'All') {
      if (type === 'Birthday') query.type = 'Birthday Card';
      else if (type === 'Festival') query.type = 'Festival Banner';
      else query.type = type;
    }

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { style: { $regex: q, $options: 'i' } }
      ];
    }

    const creatives = await CreativeTemplate.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: creatives.length, data: creatives });
  } catch (error) {
    next(error);
  }
};

exports.addCreative = async (req, res, next) => {
  try {
    const {
      name,
      type,
      style,
      title,
      placeholder,
      greetingText,
      subText,
      backgroundGradient,
      textColor
    } = req.body;

    const creative = await CreativeTemplate.create({
      name: name || 'New Creative Card',
      type: type || 'Birthday Card',
      style: style || 'balloon-blue',
      title: title || 'HAPPY BIRTHDAY',
      placeholder: placeholder || '[student_name]',
      greetingText: greetingText || 'Let the celebrations begin!',
      subText: subText || 'From Greenwood International School',
      backgroundGradient: backgroundGradient || 'from-indigo-600 to-purple-700',
      textColor: textColor || '#ffffff',
      status: 'Active'
    });

    res.status(201).json({ success: true, data: creative });
  } catch (error) {
    next(error);
  }
};

exports.updateCreative = async (req, res, next) => {
  try {
    const creative = await CreativeTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!creative) return res.status(404).json({ success: false, message: 'Template not found' });
    res.status(200).json({ success: true, data: creative });
  } catch (error) {
    next(error);
  }
};

exports.deleteCreative = async (req, res, next) => {
  try {
    const creative = await CreativeTemplate.findById(req.params.id);
    if (!creative) return res.status(404).json({ success: false, message: 'Template not found' });
    await creative.deleteOne();
    res.status(200).json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. FESTIVAL GREETINGS & CUSTOM DAYS
// ==========================================
exports.getFestivals = async (req, res, next) => {
  try {
    const festivals = await FestivalGreeting.find().sort({ date: 1 });
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const formattedFestivals = festivals.map(fest => {
      const fDate = new Date(fest.date);
      const fDateStart = new Date(fDate.getFullYear(), fDate.getMonth(), fDate.getDate());
      const diffDays = Math.round((fDateStart - todayStart) / (1000 * 60 * 60 * 24));

      let whenStr = '';
      if (diffDays === 0) whenStr = 'Today!';
      else if (diffDays === 1) whenStr = 'Tomorrow';
      else if (diffDays > 1) whenStr = `in ${diffDays} days`;
      else whenStr = 'Passed';

      const dateStr = `${fDate.getDate()} ${months[fDate.getMonth()]} ${fDate.getFullYear()}`;

      return {
        ...fest.toObject(),
        formattedDate: dateStr,
        when: whenStr,
        diffDays
      };
    });

    res.status(200).json({ success: true, count: formattedFestivals.length, data: formattedFestivals });
  } catch (error) {
    next(error);
  }
};

exports.addCustomDay = async (req, res, next) => {
  try {
    const {
      name,
      date,
      region,
      greetingLine,
      cardTemplateName,
      targetAudience,
      autoSend
    } = req.body;

    const festival = await FestivalGreeting.create({
      name,
      date: date ? new Date(date) : new Date(),
      region: region || 'ALL',
      greetingLine: greetingLine || 'Wishing all our students, teachers and families a wonderful and inspiring day.',
      cardTemplateName: cardTemplateName || 'Festive Gold',
      targetAudience: targetAudience || 'All Users',
      autoSend: autoSend !== undefined ? autoSend : true,
      isCustomDay: true,
      status: 'Upcoming'
    });

    res.status(201).json({ success: true, data: festival });
  } catch (error) {
    next(error);
  }
};

exports.updateFestival = async (req, res, next) => {
  try {
    const festival = await FestivalGreeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!festival) return res.status(404).json({ success: false, message: 'Festival not found' });
    res.status(200).json({ success: true, data: festival });
  } catch (error) {
    next(error);
  }
};

exports.deleteFestival = async (req, res, next) => {
  try {
    const festival = await FestivalGreeting.findById(req.params.id);
    if (!festival) return res.status(404).json({ success: false, message: 'Festival not found' });
    await festival.deleteOne();
    res.status(200).json({ success: true, message: 'Festival removed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.sendFestivalGreeting = async (req, res, next) => {
  try {
    const { festivalId, customGreeting, audience } = req.body;
    const festival = await FestivalGreeting.findById(festivalId);
    if (!festival) return res.status(404).json({ success: false, message: 'Festival not found' });

    festival.lastSentAt = new Date();
    festival.status = 'Sent';
    if (customGreeting) festival.greetingLine = customGreeting;
    if (audience) festival.targetAudience = audience;
    await festival.save();

    res.status(200).json({
      success: true,
      message: `Festival wish for "${festival.name}" sent to ${audience || festival.targetAudience}!`,
      data: festival
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. AUTO-SEND SETTINGS (GET & UPDATE)
// ==========================================
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await EngagementSettings.findOne();
    if (!settings) {
      settings = await EngagementSettings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await EngagementSettings.findOne();
    if (!settings) {
      settings = await EngagementSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.status(200).json({ success: true, message: 'Engagement auto-send settings saved', data: settings });
  } catch (error) {
    next(error);
  }
};
