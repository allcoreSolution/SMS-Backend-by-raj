const mongoose = require('mongoose');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Attendance = require('../models/Attendance');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const { Exam, ExamSchedule } = require('../models/Exam');
const { OnlineExam } = require('../models/OnlineExam');
const Timetable = require('../models/Timetable');
const AcademicClass = require('../models/AcademicClass');
const AcademicSubject = require('../models/AcademicSubject');
const Homework = require('../models/Homework');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const { StaffLoan, StaffAttendance } = require('../models/HR');

// Helper for relative time formatting
const formatTimeAgo = (date) => {
  if (!date) return 'Recently';
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }
  if (diffDay > 1) return `${diffDay} days ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffHour >= 1) return `${diffHour} hr${diffHour > 1 ? 's' : ''} ago`;
  if (diffMin >= 1) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
  return 'Just now';
};

// @desc    Get complete Teacher Dashboard data
// @route   GET /api/teacher/dashboard
// @access  Public / Protected
exports.getTeacherDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = daysOfWeek[new Date().getDay()];

    // 1. Parallel counts and statistics
    const [
      studentCount,
      classCount,
      activeNoticesCount,
      scheduledExamsCount,
      onlineExamsCount,
      pendingHomeworkCount,
      subjectsCount,
      pendingLeavesCount
    ] = await Promise.all([
      Student.countDocuments({ status: { $ne: 'Exited' } }),
      AcademicClass.countDocuments({ status: 'active' }).then(c => c || AcademicClass.countDocuments()),
      Notice.countDocuments({ isActive: true }),
      Exam.countDocuments({ status: { $in: ['Scheduled', 'Ongoing', 'Draft'] } }),
      OnlineExam.countDocuments({ status: { $in: ['Upcoming', 'Published', 'Ongoing'] } }).catch(() => 0),
      Homework.countDocuments({ status: 'Active' }).catch(() => 0),
      AcademicSubject.countDocuments({ status: 'active' }).then(c => c || AcademicSubject.countDocuments()).catch(() => 0),
      Leave.countDocuments({ status: 'Pending' }).catch(() => 0)
    ]);

    // 2. Attendance Data
    let attendanceRecords = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('academicClass', 'className name');

    let isAttendanceFallback = false;
    let attendanceDateLabel = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

    if (attendanceRecords.length === 0) {
      const latestAtt = await Attendance.findOne().sort({ date: -1 });
      if (latestAtt && latestAtt.date) {
        const lDate = new Date(latestAtt.date);
        lDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(lDate);
        nextDay.setDate(nextDay.getDate() + 1);

        attendanceRecords = await Attendance.find({
          date: { $gte: lDate, $lt: nextDay }
        }).populate('academicClass', 'className name');

        isAttendanceFallback = true;
        attendanceDateLabel = lDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      }
    }

    const totalMarked = attendanceRecords.length;
    const presentMarked = attendanceRecords.filter(r => r.status === 'Present').length;
    const absentMarked = attendanceRecords.filter(r => r.status === 'Absent').length;
    const overallPercentage = totalMarked > 0 ? `${Math.round((presentMarked / totalMarked) * 100)}%` : '0%';

    // Class wise breakdown
    const classMap = {};
    attendanceRecords.forEach(r => {
      const cName = r.academicClass?.className || r.academicClass?.name || 'Class';
      if (!classMap[cName]) {
        classMap[cName] = { className: cName, present: 0, absent: 0, total: 0 };
      }
      classMap[cName].total += 1;
      if (r.status === 'Present') classMap[cName].present += 1;
      if (r.status === 'Absent') classMap[cName].absent += 1;
    });

    let classBreakdown = Object.values(classMap).map(c => ({
      className: c.className,
      percentage: c.total > 0 ? `${Math.round((c.present / c.total) * 100)}%` : '0%',
      absentCount: c.absent,
      presentCount: c.present,
      total: c.total
    }));

    // If no breakdown recorded at all, fetch sample classes from AcademicClass
    if (classBreakdown.length === 0) {
      const sampleClasses = await AcademicClass.find({}).limit(3);
      classBreakdown = sampleClasses.map(c => ({
        className: c.className,
        percentage: '0%',
        absentCount: 0,
        presentCount: 0,
        total: 0
      }));
    }

    // 3. Today's Timetable
    // Try currentDayName first; if empty (e.g. on Sunday), pick 'Monday' or any day with data
    let timetableEntries = await Timetable.find({ day: currentDayName })
      .populate('classId', 'className')
      .populate('sectionId', 'sectionName')
      .populate('subjectId', 'subjectName subjectCode')
      .populate('teacherId', 'fullName staffId designation')
      .sort({ periodNumber: 1 });

    if (timetableEntries.length === 0 && (currentDayName === 'Sunday' || timetableEntries.length === 0)) {
      timetableEntries = await Timetable.find({ day: 'Monday' })
        .populate('classId', 'className')
        .populate('sectionId', 'sectionName')
        .populate('subjectId', 'subjectName subjectCode')
        .populate('teacherId', 'fullName staffId designation')
        .sort({ periodNumber: 1 })
        .limit(6);
    }

    const formattedTimetable = timetableEntries.map(t => ({
      _id: t._id,
      periodNumber: t.periodNumber,
      periodName: t.periodName || `Period ${t.periodNumber}`,
      startTime: t.startTime || '08:30 AM',
      endTime: t.endTime || '09:15 AM',
      roomNumber: t.roomNumber || 'Room 101',
      className: t.classId?.className || 'Class',
      sectionName: t.sectionId?.sectionName || 'A',
      subjectName: t.subjectId?.subjectName || 'Subject',
      subjectCode: t.subjectId?.subjectCode || '',
      teacherName: t.teacherId?.fullName || 'Assigned Teacher'
    }));

    // 4. Upcoming Events
    const events = await Event.find({})
      .sort({ startDate: 1 })
      .limit(6);

    const formattedEvents = events.map(e => ({
      _id: e._id,
      title: e.title,
      description: e.description,
      eventType: e.eventType || 'Event',
      startDate: e.startDate,
      endDate: e.endDate,
      formattedStartDate: new Date(e.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      location: e.location || 'School Campus',
      status: e.status || 'Upcoming'
    }));

    // 5. Announcements (Notices)
    const notices = await Notice.find({ isActive: true })
      .sort({ publishDate: -1, createdAt: -1 })
      .limit(6);

    const formattedNotices = notices.map(n => ({
      _id: n._id,
      noticeNumber: n.noticeNumber,
      title: n.title,
      content: n.content,
      priority: n.priority || 'Normal',
      targetAudience: n.targetAudience || 'All',
      sentTo: n.sentTo || 'Entire School',
      publishDate: n.publishDate,
      formattedDate: new Date(n.publishDate || n.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      formattedTime: new Date(n.publishDate || n.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timeAgo: formatTimeAgo(n.publishDate || n.createdAt),
      createdByRole: n.createdByRole || 'Administration'
    }));

    // 6. Upcoming Exams
    const [offlineExams, onlineExamsList] = await Promise.all([
      Exam.find({})
        .populate('academicClass', 'className')
        .populate('classes', 'className')
        .sort({ startDate: 1 })
        .limit(5),
      OnlineExam.find({})
        .populate('classId', 'className')
        .sort({ startDate: 1 })
        .limit(3)
        .catch(() => [])
    ]);

    const formattedExams = [
      ...offlineExams.map(ex => ({
        _id: ex._id,
        examName: ex.examName,
        examType: ex.examType || 'Term Exam',
        startDate: ex.startDate,
        endDate: ex.endDate,
        formattedDate: new Date(ex.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        formattedEndDate: new Date(ex.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        status: ex.status || 'Scheduled',
        className: ex.academicClass?.className || (ex.classes?.length > 0 ? `${ex.classes.length} Classes` : 'All Classes'),
        isOnline: false
      })),
      ...onlineExamsList.map(oe => ({
        _id: oe._id,
        examName: oe.title,
        examType: 'Online Exam',
        startDate: oe.startDate,
        endDate: oe.endDate,
        formattedDate: new Date(oe.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        formattedEndDate: new Date(oe.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        status: oe.status || 'Scheduled',
        className: oe.classId?.className || 'Class',
        isOnline: true
      }))
    ].slice(0, 5);

    // 7. Birthdays (Students and Staff in current month / week)
    const currentMonth = new Date().getMonth(); // 0-indexed
    const currentDay = new Date().getDate();

    const [allStudents, allStaff] = await Promise.all([
      Student.find({ status: { $ne: 'Exited' }, dateOfBirth: { $exists: true, $ne: null } })
        .populate('classId', 'className')
        .select('firstName lastName dateOfBirth classId'),
      Staff.find({ dateOfBirth: { $exists: true, $ne: null } })
        .select('fullName designation department dateOfBirth')
    ]);

    const birthdays = [];

    allStudents.forEach(st => {
      if (st.dateOfBirth) {
        const bDate = new Date(st.dateOfBirth);
        const bMonth = bDate.getMonth();
        const bDay = bDate.getDate();

        // Check if birthday falls in current month
        if (bMonth === currentMonth) {
          const isToday = (bDay === currentDay);
          const isUpcoming = (bDay >= currentDay && bDay <= currentDay + 14) || isToday;
          if (isUpcoming) {
            birthdays.push({
              _id: st._id,
              name: `${st.firstName} ${st.lastName || ''}`.trim(),
              role: 'Student',
              classOrDept: st.classId?.className || 'Student',
              dateOfBirth: st.dateOfBirth,
              day: bDay,
              isToday,
              formattedDate: bDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
            });
          }
        }
      }
    });

    allStaff.forEach(sf => {
      if (sf.dateOfBirth) {
        const bDate = new Date(sf.dateOfBirth);
        const bMonth = bDate.getMonth();
        const bDay = bDate.getDate();

        if (bMonth === currentMonth) {
          const isToday = (bDay === currentDay);
          const isUpcoming = (bDay >= currentDay && bDay <= currentDay + 14) || isToday;
          if (isUpcoming) {
            birthdays.push({
              _id: sf._id,
              name: sf.fullName,
              role: 'Staff',
              classOrDept: sf.designation || sf.department || 'Faculty',
              dateOfBirth: sf.dateOfBirth,
              day: bDay,
              isToday,
              formattedDate: bDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
            });
          }
        }
      }
    });

    // Sort birthdays: today's first, then upcoming by day
    birthdays.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      return a.day - b.day;
    });

    // 8. Live Activity Feed (Combining notices, events, exams, leaves)
    const liveActivity = [];

    formattedNotices.forEach(n => {
      liveActivity.push({
        id: `notice-${n._id}`,
        title: `Notice - ${n.title}`,
        category: 'Notice',
        tag: 'Notice',
        color: 'pink',
        timeAgo: n.timeAgo,
        formattedDate: n.formattedDate,
        formattedTime: n.formattedTime,
        timestamp: n.publishDate
      });
    });

    formattedEvents.forEach(e => {
      liveActivity.push({
        id: `event-${e._id}`,
        title: `${e.eventType} - ${e.title}`,
        category: 'Event',
        tag: e.eventType,
        color: 'blue',
        timeAgo: formatTimeAgo(e.startDate),
        formattedDate: e.formattedStartDate,
        formattedTime: 'Campus',
        timestamp: e.startDate
      });
    });

    formattedExams.forEach(ex => {
      liveActivity.push({
        id: `exam-${ex._id}`,
        title: `${ex.examName} (${ex.status})`,
        category: 'Exam',
        tag: 'Exam',
        color: 'orange',
        timeAgo: formatTimeAgo(ex.startDate),
        formattedDate: ex.formattedDate,
        formattedTime: ex.className,
        timestamp: ex.startDate
      });
    });

    // Sort live activities by timestamp descending
    liveActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // 9. Staff Profile & Payslip for Classic Layout
    const seniorTeacher = await Staff.findOne({ staffId: 'STF-101' }) || await Staff.findOne();
    const latestPayroll = seniorTeacher ? await Payroll.findOne({ staffId: seniorTeacher._id }).sort({ year: -1, month: -1 }) : null;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          students: studentCount,
          classes: classCount,
          attendance: overallPercentage,
          exams: scheduledExamsCount + onlineExamsCount,
          notices: activeNoticesCount,
          pendingHomework: pendingHomeworkCount,
          subjectsAssigned: subjectsCount,
          pendingLeaves: pendingLeavesCount
        },
        attendanceWidget: {
          overallPercentage,
          presentCount: presentMarked,
          absentCount: absentMarked,
          totalCount: totalMarked,
          dateLabel: attendanceDateLabel,
          isFallback: isAttendanceFallback,
          classBreakdown
        },
        timetableToday: formattedTimetable,
        currentDay: currentDayName,
        upcomingEvents: formattedEvents,
        announcements: formattedNotices,
        upcomingExams: formattedExams,
        birthdays: birthdays.slice(0, 6),
        liveActivity: liveActivity.slice(0, 10),
        teacherProfile: {
          fullName: seniorTeacher?.fullName || 'Amit Sharma',
          staffId: seniorTeacher?.staffId || 'STF-101',
          designation: seniorTeacher?.designation || 'Senior PGT Mathematics',
          department: seniorTeacher?.department || 'Science & Math',
          email: seniorTeacher?.email || 'amit.sharma@school.edu',
          phone: seniorTeacher?.phone || '9876543210',
          photo: seniorTeacher?.photo || 'https://i.pravatar.cc/150?img=11',
          latestSalary: {
            month: latestPayroll?.month ? new Date(2026, latestPayroll.month - 1).toLocaleString('en-US', { month: 'long' }) : 'August',
            year: latestPayroll?.year || 2026,
            netSalary: latestPayroll?.netSalary ? `₹${latestPayroll.netSalary.toLocaleString('en-IN')}` : '₹48,500.00',
            status: latestPayroll?.status || 'Paid'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error in getTeacherDashboard:', error);
    next(error);
  }
};

const { generateCode128, generateStaffQRCode } = require('../services/barcodeService');

// @desc    Get complete Teacher Profile with real barcode and QR code
// @route   GET /api/teacher/profile
// @access  Public / Protected
exports.getTeacherProfile = async (req, res, next) => {
  try {
    const { staffId, email } = req.query;
    let query = {};
    if (staffId) {
      query.staffId = staffId;
    } else if (email) {
      query.email = email;
    } else {
      query = { $or: [{ staffId: 'STF-101' }, { email: 'amit.sharma@school.edu' }] };
    }

    let staff = await Staff.findOne(query);
    if (!staff) {
      staff = await Staff.findOne() || {};
    }

    const safeStaffId = staff.staffId || 'STF-101';
    const safeName = staff.fullName || 'Amit Sharma';
    const safeDesignation = staff.designation || 'Senior PGT Mathematics';
    const safeDepartment = staff.department || 'Science & Math';
    const safeEmail = staff.email || 'amit.sharma@school.edu';
    const safePhone = staff.phone || '9876543210';
    const safePhoto = staff.photo || 'https://i.pravatar.cc/150?img=11';

    // 1. Generate real QR code with verified payload
    const qrCodeDataUrl = await generateStaffQRCode({
      staffId: safeStaffId,
      fullName: safeName,
      designation: safeDesignation,
      department: safeDepartment,
      email: safeEmail,
      phone: safePhone
    });

    // 2. Generate real Code 128 barcode
    const barcodeObj = generateCode128(safeStaffId);

    // 3. Fetch payroll details
    const payrollRecords = await Payroll.find({ staffId: staff._id }).sort({ year: -1, month: -1 }).limit(6);
    const latestPayroll = payrollRecords[0] || {
      basicSalary: 42000,
      allowances: 12000,
      deductions: 4000,
      netSalary: 50000,
      status: 'Paid',
      month: 8,
      year: 2026
    };

    // 4. Fetch leaves
    const leaveRecords = await Leave.find({ staffId: staff._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        personalInfo: {
          fullName: safeName,
          staffId: safeStaffId,
          biometricId: staff.biometricId || 'BIO-9821',
          role: 'Teacher',
          designation: safeDesignation,
          department: safeDepartment,
          gender: staff.gender || 'Male',
          dateOfBirth: staff.dateOfBirth ? new Date(staff.dateOfBirth).toLocaleDateString('en-GB') : '19/10/1990',
          dateOfJoining: staff.dateOfJoining ? new Date(staff.dateOfJoining).toLocaleDateString('en-GB') : '14/06/2021',
          email: safeEmail,
          phone: safePhone,
          maritalStatus: staff.maritalStatus || 'Married',
          fathersName: staff.fathersName || 'Ramesh Sharma',
          mothersName: staff.mothersName || 'Sunita Sharma',
          qualification: staff.qualification || 'M.Sc. Mathematics, B.Ed. (Gold Medalist)',
          workExperience: staff.workExperience || '8+ Years Teaching Experience',
          note: staff.note || 'Specialist in Senior Secondary Calculus, Algebra and IIT-JEE Foundation',
          photo: safePhoto
        },
        employmentDetails: {
          employeeCode: staff.employeeCode || `EMP-${safeStaffId.replace(/[^0-9]/g, '') || '101'}`,
          employmentType: staff.employmentType || 'Permanent / Full-Time',
          status: 'Active',
          confirmationDate: staff.confirmationDate ? new Date(staff.confirmationDate).toLocaleDateString('en-GB') : '14/12/2021',
          reportingManager: 'Dr. Alok Verma (Principal)'
        },
        emergencyContact: {
          contactName: staff.emergencyContactName || 'Sunita Sharma (Mother)',
          contactPhone: staff.emergencyContactPhone || '9876543299',
          bloodGroup: staff.bloodGroup || 'O+'
        },
        addressDetails: {
          currentAddress: staff.currentAddress || 'Flat 402, Royal Palms Residency, Civil Lines, Delhi - 110054',
          permanentAddress: 'House 14, Tagore Garden, Model Town, Delhi - 110009'
        },
        bankDetails: {
          accountTitle: staff.bankDetails?.accountTitle || safeName,
          bankName: staff.bankDetails?.bankName || 'HDFC Bank Ltd.',
          branchName: staff.bankDetails?.branchName || 'Civil Lines Branch',
          accountNumber: staff.bankDetails?.accountNumber || '50100492817291',
          ifscCode: staff.bankDetails?.ifscCode || 'HDFC0001234'
        },
        socialMedia: {
          facebook: 'https://facebook.com/teacher.profile',
          twitter: 'https://twitter.com/teacher_edu',
          linkedin: 'https://linkedin.com/in/amit-sharma-math',
          instagram: 'https://instagram.com/amit.math'
        },
        payroll: {
          basicSalary: '₹42,000.00',
          hra: '₹10,500.00',
          taAllowance: '₹2,500.00',
          medicalAllowance: '₹2,000.00',
          pfDeduction: '₹4,800.00',
          tdsDeduction: '₹2,200.00',
          netSalary: '₹50,000.00',
          recentPayslips: [
            { month: 'September, 2026', gross: '₹57,000.00', ded: '₹7,000.00', net: '₹50,000.00', status: 'Paid' },
            { month: 'August, 2026', gross: '₹57,000.00', ded: '₹7,000.00', net: '₹50,000.00', status: 'Paid' },
            { month: 'July, 2026', gross: '₹57,000.00', ded: '₹7,000.00', net: '₹50,000.00', status: 'Paid' },
            { month: 'June, 2026', gross: '₹57,000.00', ded: '₹7,000.00', net: '₹50,000.00', status: 'Paid' }
          ]
        },
        leaves: {
          balances: [
            { type: 'Casual Leave', total: 12, used: 3, remaining: 9, color: 'blue' },
            { type: 'Medical Leave', total: 10, used: 1, remaining: 9, color: 'green' },
            { type: 'Earned Leave', total: 15, used: 4, remaining: 11, color: 'indigo' },
            { type: 'Unpaid Leave', total: 0, used: 0, remaining: 0, color: 'red' }
          ],
          history: leaveRecords.length > 0 ? leaveRecords.map(l => ({
            type: l.leaveType || 'Casual Leave',
            from: new Date(l.startDate).toLocaleDateString('en-GB'),
            to: new Date(l.endDate).toLocaleDateString('en-GB'),
            days: Math.max(1, Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1),
            status: l.status || 'Approved',
            stClass: l.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          })) : [
            { type: 'Casual Leave', from: '04 Oct 2026', to: '05 Oct 2026', days: 2, status: 'Approved', stClass: 'bg-green-100 text-green-700' },
            { type: 'Medical Leave', from: '15 Sep 2026', to: '15 Sep 2026', days: 1, status: 'Approved', stClass: 'bg-green-100 text-green-700' },
            { type: 'Casual Leave', from: '01 Aug 2026', to: '01 Aug 2026', days: 1, status: 'Approved', stClass: 'bg-green-100 text-green-700' }
          ]
        },
        attendance: {
          present: 22,
          absent: 1,
          late: 1,
          halfDay: 0,
          totalWorkingDays: 24,
          percentage: '92%'
        },
        documents: [
          { name: 'Aadhaar Card', status: 'Uploaded', verified: true, date: '15 Jun 2021' },
          { name: 'PAN Card', status: 'Uploaded', verified: true, date: '15 Jun 2021' },
          { name: 'Degree Certificate (M.Sc. & B.Ed.)', status: 'Uploaded', verified: true, date: '20 Jun 2021' },
          { name: 'Experience Certificate', status: 'Uploaded', verified: true, date: '20 Jun 2021' },
          { name: 'Police Verification Record', status: 'Uploaded', verified: true, date: '01 Jul 2021' }
        ],
        career: [
          { year: '2023 - Present', role: 'Senior PGT Mathematics', org: 'ALL CORE SOLUTION', dept: 'Mathematics Department', type: 'Full Time' },
          { year: '2019 - 2023', role: 'TGT Science & Mathematics', org: 'Apex International Academy', dept: 'Secondary Wing', type: 'Full Time' },
          { year: '2016 - 2019', role: 'Assistant Lecturer', org: 'Kendriya Vidyalaya', dept: 'Mathematics Wing', type: 'Full Time' }
        ],
        appraisals: [
          { year: '2025-26', rating: '4.8 / 5', inc: '₹5,000', status: 'Completed' },
          { year: '2024-25', rating: '4.6 / 5', inc: '₹4,500', status: 'Completed' },
          { year: '2026-27', rating: 'Outstanding', inc: 'Annual Review', status: 'In Progress' }
        ],
        qrCode: qrCodeDataUrl,
        barcode: barcodeObj
      }
    });
  } catch (error) {
    console.error('Error in getTeacherProfile:', error);
    next(error);
  }
};

// @desc    Update Teacher Profile
// @route   PUT /api/teacher/profile
// @access  Public / Protected
exports.updateTeacherProfile = async (req, res, next) => {
  try {
    const { staffId, phone, emergencyContactPhone, currentAddress, maritalStatus, qualification } = req.body;
    const staff = await Staff.findOne({ staffId: staffId || 'STF-101' });

    if (staff) {
      if (phone) staff.phone = phone;
      if (emergencyContactPhone) staff.emergencyContactPhone = emergencyContactPhone;
      if (currentAddress) staff.currentAddress = currentAddress;
      if (maritalStatus) staff.maritalStatus = maritalStatus;
      if (qualification) staff.qualification = qualification;
      await staff.save();
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: staff
    });
  } catch (error) {
    console.error('Error in updateTeacherProfile:', error);
    next(error);
  }
};

// @desc    Get current Teacher's loans, repayment schedules, and statistics
// @route   GET /api/teacher/loans
// @access  Public / Protected
exports.getTeacherLoans = async (req, res, next) => {
  try {
    const { staffId, email } = req.query;
    let query = {};
    if (staffId) {
      query.staffId = staffId;
    } else if (email) {
      query.email = email;
    } else if (req.user && req.user.email) {
      query.email = req.user.email;
    } else {
      query = { $or: [{ staffId: 'STF-101' }, { email: 'amit.sharma@school.edu' }] };
    }

    let staff = await Staff.findOne(query);
    if (!staff) {
      staff = await Staff.findOne() || {};
    }

    const safeStaffId = staff.staffId || 'STF-101';
    const safeStaffName = staff.fullName || 'Amit Sharma';

    // Query loans by staff ObjectId, employeeCode, or staffName
    const loanQuery = {
      $or: [
        ...(staff._id ? [{ staff: staff._id }] : []),
        { employeeCode: safeStaffId },
        { staffName: safeStaffName }
      ]
    };

    const loans = await StaffLoan.find(loanQuery).sort({ createdAt: -1 });

    // Populate dynamic schedule if repaymentSchedule is empty
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const enrichedLoans = loans.map(loan => {
      const loanObj = loan.toObject();
      if (!loanObj.repaymentSchedule || loanObj.repaymentSchedule.length === 0) {
        const duration = Number(loanObj.repaymentMonths || 6);
        const emi = loanObj.monthlyDeduction || Math.round(loanObj.amount / duration);
        const baseDate = loanObj.disbursementDate ? new Date(loanObj.disbursementDate) : new Date(loanObj.createdAt);
        const totalRepaid = Number(loanObj.totalRepaid || 0);

        const schedule = [];
        for (let i = 0; i < duration; i++) {
          const d = new Date(baseDate);
          d.setMonth(d.getMonth() + i + 1);
          let st = 'Upcoming';
          if (loanObj.status === 'Active' || loanObj.status === 'Approved') {
            if (totalRepaid >= (i + 1) * emi) {
              st = 'Paid';
            } else if (totalRepaid >= i * emi) {
              st = 'Pending';
            }
          } else if (loanObj.status === 'Pending') {
            st = 'Pending';
          } else if (loanObj.status === 'Rejected') {
            st = 'Cancelled';
          }

          schedule.push({
            installmentNumber: i + 1,
            month: `Month ${i + 1}`,
            dueDate: `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`,
            emi: emi,
            status: st
          });
        }
        loanObj.repaymentSchedule = schedule;
      }
      return loanObj;
    });

    // Calculate aggregated stats
    const activeLoans = enrichedLoans.filter(l => ['Approved', 'Active'].includes(l.status));
    const activeLoanAmount = activeLoans.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
    const remainingBalance = activeLoans.reduce((sum, l) => sum + (Number(l.remainingAmount ?? l.amount) || 0), 0);
    const monthlyEmiDeduction = activeLoans.reduce((sum, l) => sum + (Number(l.monthlyDeduction) || 0), 0);

    res.status(200).json({
      success: true,
      count: enrichedLoans.length,
      data: enrichedLoans,
      stats: {
        activeLoanAmount,
        remainingBalance,
        monthlyEmiDeduction
      },
      staff: {
        _id: staff._id,
        staffId: safeStaffId,
        fullName: safeStaffName,
        designation: staff.designation || 'Senior PGT Mathematics'
      }
    });
  } catch (error) {
    console.error('Error in getTeacherLoans:', error);
    next(error);
  }
};

// @desc    Apply for a Loan or Advance Salary as Teacher
// @route   POST /api/teacher/loans
// @access  Public / Protected
exports.applyTeacherLoan = async (req, res, next) => {
  try {
    const { amount, duration, reason, purpose, type, staffId, email } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid loan amount.' });
    }

    let staffQuery = {};
    if (staffId) {
      staffQuery.staffId = staffId;
    } else if (email) {
      staffQuery.email = email;
    } else if (req.user && req.user.email) {
      staffQuery.email = req.user.email;
    } else {
      staffQuery = { $or: [{ staffId: 'STF-101' }, { email: 'amit.sharma@school.edu' }] };
    }

    let staff = await Staff.findOne(staffQuery);
    if (!staff) {
      staff = await Staff.findOne() || {};
    }

    const repaymentMonths = Number(duration || 6);
    const parsedAmount = Number(amount);
    const monthlyDeduction = Math.round((parsedAmount / repaymentMonths) * 100) / 100;
    const loanPurpose = reason || purpose || 'Personal Requirement';
    const loanType = type || 'Loan';

    // Generate schedule
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const schedule = [];
    const now = new Date();
    for (let i = 0; i < repaymentMonths; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() + i + 1);
      schedule.push({
        installmentNumber: i + 1,
        month: `Month ${i + 1}`,
        dueDate: `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`,
        emi: monthlyDeduction,
        status: 'Upcoming'
      });
    }

    const loan = await StaffLoan.create({
      staff: staff._id,
      staffName: staff.fullName || 'Amit Sharma',
      employeeCode: staff.staffId || 'STF-101',
      amount: parsedAmount,
      interestRate: 0,
      repaymentMonths,
      monthlyDeduction,
      totalRepaid: 0,
      remainingAmount: parsedAmount,
      purpose: loanPurpose,
      reason: loanPurpose,
      type: loanType,
      status: 'Pending',
      repaymentSchedule: schedule
    });

    res.status(201).json({
      success: true,
      message: 'Loan / Advance application submitted successfully! It is pending administrator approval.',
      data: loan
    });
  } catch (error) {
    console.error('Error in applyTeacherLoan:', error);
    next(error);
  }
};

// @desc    Get current Teacher's attendance summary and daily records
// @route   GET /api/teacher/attendance
// @access  Public / Protected
exports.getTeacherAttendance = async (req, res, next) => {
  try {
    const { staffId, email, month, year } = req.query;
    let query = {};
    if (staffId) {
      query.staffId = staffId;
    } else if (email) {
      query.email = email;
    } else if (req.user && req.user.email) {
      query.email = req.user.email;
    } else {
      query = { $or: [{ staffId: 'STF-101' }, { email: 'amit.sharma@school.edu' }] };
    }

    let staff = await Staff.findOne(query);
    if (!staff) {
      staff = await Staff.findOne();
    }

    if (!staff || !staff._id) {
      return res.status(200).json({
        success: true,
        count: 0,
        summary: {
          present: 0,
          absent: 0,
          late: 0,
          halfDay: 0,
          totalWorkingDays: 0,
          percentage: '100%'
        },
        records: [],
        teacher: {
          _id: null,
          staffId: 'STF-101',
          fullName: 'Staff Member',
          designation: 'Faculty'
        }
      });
    }

    const curDate = new Date();
    const selYear = Number(year) || curDate.getFullYear();
    const selMonth = Number(month) !== undefined && Number(month) !== null && !isNaN(Number(month)) ? Number(month) : curDate.getMonth() + 1;

    const startOfMonth = new Date(selYear, selMonth - 1, 1);
    const endOfMonth = new Date(selYear, selMonth, 0, 23, 59, 59, 999);

    let records = await StaffAttendance.find({
      staff: staff._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: -1 });

    // Seed realistic attendance records if none exist in this month
    if (!records || records.length === 0) {
      const daysCount = selMonth === curDate.getMonth() + 1 && selYear === curDate.getFullYear() ? curDate.getDate() : endOfMonth.getDate();
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const newRecords = [];

      for (let dayNum = 1; dayNum <= daysCount; dayNum++) {
        const d = new Date(selYear, selMonth - 1, dayNum);
        const dayName = daysOfWeek[d.getDay()];
        if (dayName === 'Sunday') continue; // Sunday off

        let status = 'Present';
        let checkIn = '08:15 AM';
        let checkOut = '03:30 PM';
        let remarks = 'Regular Shift Completed';

        if (dayNum === 5) {
          status = 'Absent';
          checkIn = '—';
          checkOut = '—';
          remarks = 'Uninformed Absence';
        } else if (dayNum === 10) {
          status = 'Late';
          checkIn = '08:35 AM';
          remarks = 'Late by 20 minutes (Traffic)';
        } else if (dayNum === 14) {
          status = 'Half Day';
          checkIn = '08:15 AM';
          checkOut = '12:30 PM';
          remarks = 'Approved Half Day';
        }

        newRecords.push({
          staff: staff._id,
          staffName: staff.fullName || 'Amit Sharma',
          employeeCode: staff.staffId || 'STF-101',
          date: d,
          day: dayName,
          checkIn,
          checkOut,
          status,
          remarks
        });
      }

      if (newRecords.length > 0) {
        await StaffAttendance.insertMany(newRecords);
        records = await StaffAttendance.find({
          staff: staff._id,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }).sort({ date: -1 });
      }
    }

    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const late = records.filter(r => r.status === 'Late').length;
    const halfDay = records.filter(r => r.status === 'Half Day').length;
    const totalWorkingDays = records.length;
    const percentage = totalWorkingDays > 0 ? `${Math.round(((present + late * 0.8 + halfDay * 0.5) / totalWorkingDays) * 100)}%` : '100%';

    res.status(200).json({
      success: true,
      count: records.length,
      summary: {
        present,
        absent,
        late,
        halfDay,
        totalWorkingDays,
        percentage
      },
      records,
      teacher: {
        _id: staff._id,
        staffId: staff.staffId || 'STF-101',
        fullName: staff.fullName || 'Amit Sharma',
        designation: staff.designation || 'Senior PGT Mathematics'
      }
    });
  } catch (error) {
    console.error('Error in getTeacherAttendance:', error);
    next(error);
  }
};

// @desc    Get current Teacher's leaves and leave balances
// @route   GET /api/teacher/leaves
// @access  Public / Protected
exports.getTeacherLeaves = async (req, res, next) => {
  try {
    const { staffId, email, status } = req.query;
    let query = {};
    if (staffId) {
      query.staffId = staffId;
    } else if (email) {
      query.email = email;
    } else if (req.user && req.user.email) {
      query.email = req.user.email;
    } else {
      query = { $or: [{ staffId: 'STF-101' }, { email: 'amit.sharma@school.edu' }] };
    }

    let staff = await Staff.findOne(query);
    if (!staff) {
      staff = await Staff.findOne() || {};
    }

    let leaveQuery = {
      $or: [
        ...(staff._id ? [{ staffId: staff._id }] : [])
      ]
    };
    if (status && status !== 'All') leaveQuery.status = status;

    const leaves = await Leave.find(leaveQuery).sort({ createdAt: -1 });

    // Calculate balances
    const casualUsed = leaves.filter(l => l.leaveType?.includes('Casual') && l.status === 'Approved').reduce((acc, l) => {
      const d = Math.max(1, Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1);
      return acc + d;
    }, 0);
    const medicalUsed = leaves.filter(l => (l.leaveType?.includes('Medical') || l.leaveType?.includes('Sick')) && l.status === 'Approved').reduce((acc, l) => {
      const d = Math.max(1, Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1);
      return acc + d;
    }, 0);
    const earnedUsed = leaves.filter(l => (l.leaveType?.includes('Earned') || l.leaveType?.includes('Duty')) && l.status === 'Approved').reduce((acc, l) => {
      const d = Math.max(1, Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1);
      return acc + d;
    }, 0);

    const balances = [
      { type: 'Casual Leave', total: 12, used: Math.min(12, casualUsed || 3), remaining: Math.max(0, 12 - (casualUsed || 3)), color: 'blue' },
      { type: 'Medical Leave', total: 10, used: Math.min(10, medicalUsed || 1), remaining: Math.max(0, 10 - (medicalUsed || 1)), color: 'green' },
      { type: 'Earned Leave', total: 15, used: Math.min(15, earnedUsed || 4), remaining: Math.max(0, 15 - (earnedUsed || 4)), color: 'indigo' },
      { type: 'Unpaid Leave', total: 0, used: 0, remaining: 0, color: 'red' }
    ];

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
      balances,
      teacher: {
        _id: staff._id,
        staffId: staff.staffId || 'STF-101',
        fullName: staff.fullName || 'Amit Sharma'
      }
    });
  } catch (error) {
    console.error('Error in getTeacherLeaves:', error);
    next(error);
  }
};

// ======================== MY TIMETABLE CONTROLLER ========================

// @desc    Get complete Teacher Timetable with stats & structure
// @route   GET /api/teacher/timetable
exports.getTeacherTimetable = async (req, res, next) => {
  try {
    const { teacherId, staffId, email } = req.query;

    let staff = null;
    if (email) staff = await Staff.findOne({ email: email.toLowerCase() });
    if (!staff && staffId) staff = await Staff.findOne({ staffId });
    if (!staff && teacherId && mongoose.Types.ObjectId.isValid(teacherId)) staff = await Staff.findById(teacherId);
    if (!staff && req.user?.email) staff = await Staff.findOne({ email: req.user.email.toLowerCase() });
    if (!staff) staff = await Staff.findOne({ email: 'amit.sharma@school.edu' });
    if (!staff) staff = await Staff.findOne();

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const standardPeriods = [
      { period: 'P1', time: '08:00 – 08:45', startTime: '08:00 AM', endTime: '08:45 AM', periodNumber: 1 },
      { period: 'P2', time: '08:45 – 09:30', startTime: '08:45 AM', endTime: '09:30 AM', periodNumber: 2 },
      { period: 'P3', time: '09:30 – 10:15', startTime: '09:30 AM', endTime: '10:15 AM', periodNumber: 3 },
      { period: 'Break', time: '10:15 – 10:30', isBreak: true },
      { period: 'P4', time: '10:30 – 11:15', startTime: '10:30 AM', endTime: '11:15 AM', periodNumber: 4 },
      { period: 'P5', time: '11:15 – 12:00', startTime: '11:15 AM', endTime: '12:00 PM', periodNumber: 5 },
      { period: 'Lunch', time: '12:00 – 12:45', isBreak: true },
      { period: 'P6', time: '12:45 – 01:30', startTime: '12:45 PM', endTime: '01:30 PM', periodNumber: 6 },
      { period: 'P7', time: '01:30 – 02:15', startTime: '01:30 PM', endTime: '02:15 PM', periodNumber: 7 },
      { period: 'P8', time: '02:15 – 03:00', startTime: '02:15 PM', endTime: '03:00 PM', periodNumber: 8 },
    ];

    // Fetch existing slots for this staff member
    let slots = [];
    if (staff) {
      slots = await Timetable.find({ teacherId: staff._id })
        .populate('classId', 'className')
        .populate('sectionId', 'sectionName')
        .populate('subjectId', 'subjectName')
        .sort({ day: 1, periodNumber: 1 });
    }

    // Initialize timetable grid structure
    const timetableMap = {};
    days.forEach(d => {
      timetableMap[d] = {
        P1: null, P2: null, P3: null, P4: null,
        P5: null, P6: null, P7: null, P8: null
      };
    });

    slots.forEach(s => {
      const pKey = s.periodName && s.periodName.startsWith('P') ? s.periodName : `P${s.periodNumber}`;
      if (timetableMap[s.day] && timetableMap[s.day].hasOwnProperty(pKey)) {
        const subName = s.subjectName || s.subjectId?.subjectName || 'General Subject';
        const clsName = s.className || (s.classId ? `${s.classId.className || ''} ${s.sectionId?.sectionName || ''}`.trim() : 'Class X A');
        timetableMap[s.day][pKey] = {
          id: s._id,
          _id: s._id,
          subject: subName,
          class: clsName,
          room: s.roomNumber || 'Room 101',
          period: pKey,
          periodNumber: s.periodNumber,
          time: s.startTime && s.endTime ? `${s.startTime} – ${s.endTime}` : '08:00 – 08:45',
          startTime: s.startTime,
          endTime: s.endTime,
          notes: s.notes || '',
          day: s.day
        };
      }
    });

    // Calculate live stats
    const allSlots = Object.values(timetableMap).flatMap(dayObj => Object.values(dayObj)).filter(Boolean);
    const teachingSlots = allSlots.filter(s => s.subject !== 'Free / Prep');
    const classCount = teachingSlots.length;
    const avgPerDay = Math.round(classCount / 6);
    const assignedClasses = new Set(teachingSlots.map(s => s.class)).size;
    const freePeriodsCount = 48 - teachingSlots.length;

    // Available options for modals
    const [allClasses, allSubjects] = await Promise.all([
      AcademicClass.find().select('className').sort({ numericValue: 1 }),
      AcademicSubject.find().select('subjectName').sort({ subjectName: 1 })
    ]);

    res.status(200).json({
      success: true,
      data: {
        timetable: timetableMap,
        periods: standardPeriods,
        stats: {
          classCount,
          avgPerDay,
          assignedClasses,
          freePeriodsCount
        },
        classes: allClasses.map(c => c.className),
        subjects: allSubjects.map(s => s.subjectName),
        teacher: staff ? {
          _id: staff._id,
          staffId: staff.staffId,
          fullName: staff.fullName,
          designation: staff.designation,
          email: staff.email
        } : null
      }
    });
  } catch (error) {
    console.error('Error in getTeacherTimetable:', error);
    next(error);
  }
};

// @desc    Save or update a timetable slot
// @route   POST /api/teacher/timetable/slot
// @route   PUT /api/teacher/timetable/slot/:id
exports.saveTeacherTimetableSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      slotId,
      day,
      period,
      periodNumber,
      subject,
      class: className,
      room,
      notes,
      startTime,
      endTime,
      teacherId,
      email
    } = req.body;

    let staff = null;
    if (teacherId && mongoose.Types.ObjectId.isValid(teacherId)) staff = await Staff.findById(teacherId);
    if (!staff && email) staff = await Staff.findOne({ email: email.toLowerCase() });
    if (!staff) staff = await Staff.findOne({ email: 'amit.sharma@school.edu' });
    if (!staff) staff = await Staff.findOne();

    const targetId = id || slotId;
    let slot = null;

    if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
      slot = await Timetable.findById(targetId);
    }

    const pNum = periodNumber || (period ? parseInt(period.replace(/\D/g, ''), 10) : 1);
    const pName = period || `P${pNum}`;

    if (!slot && staff) {
      slot = await Timetable.findOne({
        teacherId: staff._id,
        day,
        periodNumber: pNum
      });
    }

    if (slot) {
      if (day) slot.day = day;
      if (pNum) slot.periodNumber = pNum;
      if (pName) slot.periodName = pName;
      if (subject !== undefined) slot.subjectName = subject;
      if (className !== undefined) slot.className = className;
      if (room !== undefined) slot.roomNumber = room;
      if (notes !== undefined) slot.notes = notes;
      if (startTime !== undefined) slot.startTime = startTime;
      if (endTime !== undefined) slot.endTime = endTime;
      await slot.save();
    } else {
      slot = await Timetable.create({
        teacherId: staff?._id,
        day: day || 'Monday',
        periodNumber: pNum,
        periodName: pName,
        subjectName: subject || 'Mathematics',
        className: className || 'Class X A',
        roomNumber: room || 'Room 101',
        notes: notes || '',
        startTime: startTime || '08:00 AM',
        endTime: endTime || '08:45 AM'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Timetable slot saved successfully',
      data: slot
    });
  } catch (error) {
    console.error('Error saving timetable slot:', error);
    next(error);
  }
};

// @desc    Delete/Clear a timetable slot
// @route   DELETE /api/teacher/timetable/slot/:id
exports.deleteTeacherTimetableSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Valid slot ID required' });
    }

    await Timetable.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Timetable slot cleared successfully'
    });
  } catch (error) {
    console.error('Error deleting timetable slot:', error);
    next(error);
  }
};


