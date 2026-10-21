const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');

const cleanObjectId = (val) => {
  if (!val) return null;
  if (typeof val === 'object' && val._id) val = val._id;
  const str = String(val).trim();
  return mongoose.Types.ObjectId.isValid(str) ? str : null;
};

exports.markAttendance = async (req, res, next) => {
  try {
    const Student = require('../models/Student');
    // Determine if it's a bulk operation (array of attendance records) or a single record
    let records = [];
    if (Array.isArray(req.body)) {
      records = req.body;
    } else if (req.body && Array.isArray(req.body.records)) {
      records = req.body.records;
    } else if (req.body && Array.isArray(req.body.attendanceRecords)) {
      records = req.body.attendanceRecords;
    } else if (req.body && typeof req.body === 'object') {
      records = [req.body];
    }

    const savedRecords = [];
    
    for (const record of records) {
      if (!record) continue;
      const studentId = cleanObjectId(record.student || record.studentId || record._id);
      if (!studentId) continue;

      let finalClass = cleanObjectId(record.academicClass || record.classId || record.class);
      let finalSection = cleanObjectId(record.section || record.sectionId);
      
      // Auto-fallback from Student record if class or section is missing
      if ((!finalClass || !finalSection) && mongoose.Types.ObjectId.isValid(studentId)) {
        try {
          const studentDoc = await Student.findById(studentId).select('classId sectionId');
          if (studentDoc) {
            if (!finalClass && studentDoc.classId) finalClass = cleanObjectId(studentDoc.classId);
            if (!finalSection && studentDoc.sectionId) finalSection = cleanObjectId(studentDoc.sectionId);
          }
        } catch (e) {
          // ignore lookup error
        }
      }

      const targetDate = new Date(record.date || Date.now());
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      let attendance = await Attendance.findOne({
        student: studentId,
        date: { $gte: targetDate, $lt: nextDay }
      });
      
      const newStatus = record.status || 'Present';
      const newRemarks = record.remarks !== undefined ? record.remarks : (record.remark !== undefined ? record.remark : '');

      if (attendance) {
        attendance.status = newStatus;
        if (newRemarks !== undefined) attendance.remarks = newRemarks;
        if (finalClass) attendance.academicClass = finalClass;
        attendance.section = finalSection || null;
        await attendance.save();
        savedRecords.push(attendance);
      } else {
        const created = await Attendance.create({
          student: studentId,
          date: targetDate,
          status: newStatus,
          academicClass: finalClass || null,
          section: finalSection || null,
          remarks: newRemarks
        });
        savedRecords.push(created);
      }
    }
    
    res.status(200).json({ success: true, count: savedRecords.length, data: savedRecords });
  } catch (error) { next(error); }
};

exports.getAttendanceByClass = async (req, res, next) => {
  try {
    const { classId, sectionId, date, startDate, endDate } = req.query;
    let query = {};
    if (classId && mongoose.Types.ObjectId.isValid(classId)) query.academicClass = classId;
    if (sectionId && mongoose.Types.ObjectId.isValid(sectionId)) query.section = sectionId;
    
    // Support either single date or date range
    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const nextDay = new Date(startOfDay);
        nextDay.setDate(nextDay.getDate() + 1);
        query.date = { $gte: startOfDay, $lt: nextDay };
    } else if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(query)
        .populate('student', 'firstName lastName aparId studentPhoto rollNo')
        .sort({ date: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) { next(error); }
};

exports.getStudentAttendance = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const { month, year, startDate, endDate } = req.query;
        let query = { student: studentId };

        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else if (month && year) {
            const startStr = `${year}-${month.toString().padStart(2, '0')}-01`;
            const endStr = new Date(year, month, 0).toISOString().split('T')[0];
            query.date = { $gte: new Date(startStr), $lte: new Date(endStr) };
        }

        const records = await Attendance.find(query).sort({ date: 1 });
        res.status(200).json({ success: true, count: records.length, data: records });
    } catch (error) { next(error); }
};

exports.deleteAttendance = async (req, res, next) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id);
        if (!attendance) return res.status(404).json({ success: false, message: 'Attendance record not found' });
        res.status(200).json({ success: true, message: 'Record deleted successfully' });
    } catch (error) { next(error); }
};

exports.getQRScanLogs = async (req, res, next) => {
    try {
        const QRScanLog = require('../models/QRScanLog');
        const logs = await QRScanLog.find({}).sort({ time: -1 }).limit(100);
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) { next(error); }
};

exports.getQRAttendanceReport = async (req, res, next) => {
    try {
        const records = await Attendance.find({})
            .populate('student', 'firstName lastName aparId')
            .populate('academicClass', 'className')
            .sort({ date: -1 })
            .limit(100);
            
        // Map to expected frontend format
        const formatted = records.map(r => ({
            id: r._id,
            date: r.date ? r.date.toISOString().split('T')[0] : '',
            name: r.student ? `${r.student.firstName || ''} ${r.student.lastName || ''}`.trim() : 'Unknown',
            type: 'Student', // hardcoded as Student for now as per Attendance schema
            classDesig: r.academicClass ? r.academicClass.className : 'N/A',
            admStaffId: r.student ? r.student.aparId || 'N/A' : 'N/A',
            in: '08:00 AM', // Mocked time as Attendance schema doesn't store exact IN/OUT yet
            out: '02:00 PM',
            duration: '6h 0m',
            status: r.status
        }));
        
        res.status(200).json({ success: true, count: formatted.length, data: formatted });
    } catch (error) { next(error); }
};

exports.recordQRScan = async (req, res, next) => {
    try {
        const QRScanLog = require('../models/QRScanLog');
        const { 
            code,
            targetName,
            targetType = 'Student',
            classDesig = 'Class 10A',
            location = 'Main Gate',
            device = 'Webcam Kiosk',
            mode = 'QR',
            direction = 'IN'
        } = req.body;

        const outcome = 'Accepted';
        const resultReason = `Marked ${direction} Successfully`;

        const log = await QRScanLog.create({
            time: new Date(),
            outcome,
            resultReason,
            operator: 'Scan Station',
            targetName: targetName || code || 'Candidate',
            targetType,
            mode,
            location,
            device
        });

        res.status(200).json({
            success: true,
            message: `Punch ${direction} recorded successfully`,
            data: {
                log,
                direction,
                time: new Date().toLocaleTimeString()
            }
        });
    } catch (error) { next(error); }
};

exports.getAttendanceSummary = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find attendance records for today
        let records = await Attendance.find({
            date: { $gte: today, $lt: tomorrow }
        }).populate('academicClass', 'className name');

        let isLatestFallback = false;
        // If no attendance marked today, fall back to the most recent date with attendance
        if (records.length === 0) {
            const latestRecord = await Attendance.findOne().sort({ date: -1 });
            if (latestRecord) {
                const latestDate = new Date(latestRecord.date);
                latestDate.setHours(0, 0, 0, 0);
                const nextDay = new Date(latestDate);
                nextDay.setDate(nextDay.getDate() + 1);
                records = await Attendance.find({
                    date: { $gte: latestDate, $lt: nextDay }
                }).populate('academicClass', 'className name');
                isLatestFallback = true;
            }
        }

        const totalMarked = records.length;
        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const late = records.filter(r => r.status === 'Late').length;
        const halfDay = records.filter(r => r.status === 'Half-Day').length;
        const percentage = totalMarked > 0 ? `${Math.round((present / totalMarked) * 100)}%` : '0%';

        // Class wise breakdown
        const classMap = {};
        records.forEach(r => {
            const cName = r.academicClass?.className || r.academicClass?.name || 'General';
            if (!classMap[cName]) {
                classMap[cName] = { className: cName, present: 0, absent: 0, total: 0 };
            }
            classMap[cName].total += 1;
            if (r.status === 'Present') classMap[cName].present += 1;
            if (r.status === 'Absent') classMap[cName].absent += 1;
        });

        const classBreakdown = Object.values(classMap).map(c => ({
            className: c.className,
            percentage: c.total > 0 ? `${Math.round((c.present / c.total) * 100)}%` : '0%',
            absentCount: c.absent,
            presentCount: c.present,
            total: c.total
        }));

        res.status(200).json({
            success: true,
            data: {
                totalMarked,
                present,
                absent,
                late,
                halfDay,
                percentage,
                classBreakdown,
                isLatestFallback
            }
        });
    } catch (error) { next(error); }
};
