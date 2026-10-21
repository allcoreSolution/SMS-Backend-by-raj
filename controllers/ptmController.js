const PTM = require('../models/PTM');
let Student;
try {
  Student = require('../models/Student');
} catch (e) {
  Student = null;
}

// Create new meeting
exports.requestMeeting = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.title) data.title = 'Parent-Teacher Meeting';
    if (!data.meetingDate) data.meetingDate = new Date();

    // Auto-generate roster if requested and none provided
    if (data.buildRoster && (!data.roster || data.roster.length === 0) && Student) {
      try {
        let filter = {};
        if (data.className && data.className !== 'Whole school' && data.className !== 'All Classes') {
          filter.className = data.className;
        }
        const dbStudents = await Student.find(filter).limit(50);
        if (dbStudents && dbStudents.length > 0) {
          data.roster = dbStudents.map((s, idx) => ({
            studentId: s._id.toString(),
            name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || `Student ${idx + 1}`,
            roll: s.rollNo || `ADM-${100 + idx}`,
            className: s.className || data.className || 'General',
            guardianName: s.fatherName || s.guardianName || 'Guardian',
            phone: s.mobileNumber || s.phone || `9876500${100 + idx}`,
            slot: '--',
            notified: '--',
            attendance: 'Pending',
            remarks: '',
            tags: [],
            followUpNeeded: false
          }));
        }
      } catch (err) {
        console.warn('Could not auto-generate roster from Student model:', err.message);
      }
    }

    const meeting = await PTM.create(data);
    res.status(201).json({ success: true, data: meeting });
  } catch (error) { next(error); }
};

// Get all meetings with filters
exports.getMeetings = async (req, res, next) => {
  try {
    const { teacherId, studentId, status, scope, className, from, to, search } = req.query;
    let query = {};
    if (studentId) {
      let student = null;
      if (Student) {
        try {
          student = await Student.findById(studentId).populate('classId');
        } catch (e) {}
      }
      const studentClass = student?.classId?.className || '';
      const studentFullName = student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : '';

      query.$or = [
        { studentId: studentId },
        { 'roster.studentId': studentId },
        ...(studentFullName ? [{ 'roster.name': { $regex: studentFullName, $options: 'i' } }] : []),
        { scope: 'Whole school' },
        { scope: 'All Classes' },
        ...(studentClass ? [{ className: studentClass }] : [])
      ];
    }
    if (status && status !== 'All' && status !== 'All statuses') query.status = status;
    if (scope && scope !== 'All' && scope !== 'All classes') query.scope = scope;
    if (className && className !== 'All') query.className = className;
    if (from || to) {
      query.meetingDate = {};
      if (from) query.meetingDate.$gte = new Date(from);
      if (to) query.meetingDate.$lte = new Date(to);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const meetings = await PTM.find(query)
      .populate('teacherId', 'firstName lastName')
      .populate('studentId', 'firstName lastName rollNo')
      .sort({ meetingDate: -1 });

    res.status(200).json({ success: true, count: meetings.length, data: meetings });
  } catch (error) { next(error); }
};

// Get single meeting by ID
exports.getMeetingById = async (req, res, next) => {
  try {
    const meeting = await PTM.findById(req.params.id)
      .populate('teacherId', 'firstName lastName')
      .populate('studentId', 'firstName lastName rollNo');
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    res.status(200).json({ success: true, data: meeting });
  } catch (error) { next(error); }
};

// Update meeting
exports.updateMeeting = async (req, res, next) => {
  try {
    const meeting = await PTM.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    res.status(200).json({ success: true, data: meeting });
  } catch (error) { next(error); }
};

// Delete meeting
exports.deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await PTM.findByIdAndDelete(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    res.status(200).json({ success: true, message: 'Meeting deleted successfully' });
  } catch (error) { next(error); }
};

// Update specific attendee in meeting roster
exports.updateAttendee = async (req, res, next) => {
  try {
    const { id, attendeeId } = req.params;
    const meeting = await PTM.findById(id);
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

    const attendee = meeting.roster.id(attendeeId) || meeting.roster.find(r => r.studentId === attendeeId);
    if (!attendee) return res.status(404).json({ success: false, message: 'Attendee not found' });

    Object.assign(attendee, req.body);
    await meeting.save();

    res.status(200).json({ success: true, data: meeting });
  } catch (error) { next(error); }
};

// Record bulk attendance for meeting roster
exports.recordBulkAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, studentIds } = req.body; // status: 'Present' | 'Absent' | 'Pending'
    const meeting = await PTM.findById(id);
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

    meeting.roster.forEach(r => {
      if (!studentIds || studentIds.includes(r._id.toString()) || studentIds.includes(r.studentId)) {
        r.attendance = status;
      }
    });

    await meeting.save();
    res.status(200).json({ success: true, data: meeting });
  } catch (error) { next(error); }
};

// Follow-ups endpoints
exports.getFollowUps = async (req, res, next) => {
  try {
    const meetings = await PTM.find({ 'followUps.0': { $exists: true } });
    let allFollowUps = [];
    meetings.forEach(m => {
      if (m.followUps && m.followUps.length) {
        m.followUps.forEach(f => {
          allFollowUps.push({
            ...f.toObject(),
            meetingId: m._id,
            meetingTitle: m.title
          });
        });
      }
    });
    res.status(200).json({ success: true, count: allFollowUps.length, data: allFollowUps });
  } catch (error) { next(error); }
};

exports.addFollowUp = async (req, res, next) => {
  try {
    const { meetingId, student, actionPlan, assignee, due, priority, status } = req.body;
    let meeting;
    if (meetingId) {
      meeting = await PTM.findById(meetingId);
    }
    if (!meeting) {
      meeting = await PTM.findOne();
    }
    if (!meeting) {
      meeting = await PTM.create({
        title: 'General Follow-ups',
        meetingDate: new Date(),
        scope: 'Whole school'
      });
    }

    meeting.followUps.push({
      student,
      meeting: meeting.title,
      actionPlan,
      assignee: assignee || 'Class Teacher',
      due: due || '',
      priority: priority || 'Medium',
      status: status || 'Open'
    });

    await meeting.save();
    res.status(201).json({ success: true, data: meeting.followUps[meeting.followUps.length - 1] });
  } catch (error) { next(error); }
};

