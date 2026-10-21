const { 
  Visitor, 
  Complaint, 
  AdmissionEnquiry, 
  PostalRecord, 
  GatePass, 
  CampusWorker 
} = require('../models/FrontOffice');

// ======================== DASHBOARD STATS ========================
exports.getFrontOfficeDashboardStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalEnquiries,
      pendingEnquiries,
      followedUpEnquiries,
      admittedEnquiries,
      totalVisitors,
      visitorsOnCampus,
      totalGatePasses,
      activeGatePasses,
      openComplaints,
      resolvedComplaints,
      totalPostalRecords,
      activeCampusWorkers,
      recentEnquiries,
      recentVisitors,
      recentGatePasses,
      allEnquiries,
      allComplaints
    ] = await Promise.all([
      AdmissionEnquiry.countDocuments(),
      AdmissionEnquiry.countDocuments({ status: 'Pending' }),
      AdmissionEnquiry.countDocuments({ status: 'Followed-up' }),
      AdmissionEnquiry.countDocuments({ status: 'Admitted' }),
      Visitor.countDocuments(),
      Visitor.countDocuments({ status: 'On Campus' }),
      GatePass.countDocuments(),
      GatePass.countDocuments({ status: { $in: ['Approved', 'Out'] } }),
      Complaint.countDocuments({ status: { $in: ['Open', 'In-Progress'] } }),
      Complaint.countDocuments({ status: 'Resolved' }),
      PostalRecord.countDocuments(),
      CampusWorker.countDocuments({ state: 'Active' }),
      AdmissionEnquiry.find().sort({ createdAt: -1 }).limit(5),
      Visitor.find().sort({ createdAt: -1 }).limit(5),
      GatePass.find().sort({ createdAt: -1 }).limit(5),
      AdmissionEnquiry.find(),
      Complaint.find()
    ]);

    // Aggregate sources for enquiries chart
    const sourceMap = {};
    allEnquiries.forEach(e => {
      sourceMap[e.source] = (sourceMap[e.source] || 0) + 1;
    });
    const enquirySourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

    // Aggregate complaint types for chart
    const complaintMap = {};
    allComplaints.forEach(c => {
      complaintMap[c.complaintType] = (complaintMap[c.complaintType] || 0) + 1;
    });
    const complaintTypeData = Object.entries(complaintMap).map(([name, value]) => ({ name, value }));

    res.status(200).json({
      success: true,
      data: {
        totalEnquiries,
        pendingEnquiries,
        followedUpEnquiries,
        admittedEnquiries,
        totalVisitors,
        visitorsOnCampus,
        totalGatePasses,
        activeGatePasses,
        openComplaints,
        resolvedComplaints,
        totalPostalRecords,
        activeCampusWorkers,
        recentEnquiries,
        recentVisitors,
        recentGatePasses,
        enquirySourceData,
        complaintTypeData
      }
    });
  } catch (error) { next(error); }
};

// ======================== ADMISSION ENQUIRIES ========================
exports.getEnquiries = async (req, res, next) => {
  try {
    const { status, classApplied, search } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (classApplied && classApplied !== 'All') query.classApplied = classApplied;
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    const enquiries = await AdmissionEnquiry.find(query).sort({ enquiryDate: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: enquiries.length, data: enquiries });
  } catch (error) { next(error); }
};

exports.getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await AdmissionEnquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) { next(error); }
};

exports.createEnquiry = async (req, res, next) => {
  try {
    const enquiry = await AdmissionEnquiry.create(req.body);
    res.status(201).json({ success: true, data: enquiry });
  } catch (error) { next(error); }
};

exports.updateEnquiry = async (req, res, next) => {
  try {
    const enquiry = await AdmissionEnquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) { next(error); }
};

exports.deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await AdmissionEnquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) { next(error); }
};

// ======================== VISITOR BOOK ========================
exports.getVisitors = async (req, res, next) => {
  try {
    const { status, purpose, search } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (purpose && purpose !== 'All') query.purpose = purpose;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { meetingWith: { $regex: search, $options: 'i' } },
        { badgeNumber: { $regex: search, $options: 'i' } }
      ];
    }
    const visitors = await Visitor.find(query).sort({ inTime: -1 });
    res.status(200).json({ success: true, count: visitors.length, data: visitors });
  } catch (error) { next(error); }
};

exports.getVisitorById = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor record not found' });
    res.status(200).json({ success: true, data: visitor });
  } catch (error) { next(error); }
};

exports.addVisitor = async (req, res, next) => {
  try {
    const count = await Visitor.countDocuments();
    const badgeNumber = req.body.badgeNumber || `VB-2026-${String(count + 1).padStart(3, '0')}`;
    const visitor = await Visitor.create({ ...req.body, badgeNumber });
    res.status(201).json({ success: true, data: visitor });
  } catch (error) { next(error); }
};

exports.updateVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor record not found' });
    res.status(200).json({ success: true, data: visitor });
  } catch (error) { next(error); }
};

exports.checkoutVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { outTime: new Date(), status: 'Checked Out' },
      { new: true }
    );
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor record not found' });
    res.status(200).json({ success: true, data: visitor, message: 'Visitor checked out successfully' });
  } catch (error) { next(error); }
};

exports.deleteVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor record not found' });
    res.status(200).json({ success: true, message: 'Visitor record deleted' });
  } catch (error) { next(error); }
};

// ======================== COMPLAINTS ========================
const autoSeedTeacherComplaints = async () => {
  try {
    const count = await Complaint.countDocuments({ subject: { $exists: true, $ne: '' } });
    if (count > 0) return;

    const defaultTeacherComplaints = [
      {
        subject: 'Student misbehaviour in class',
        category: 'Student Behaviour',
        complaintType: 'Student Behaviour',
        against: 'Rohit Sharma (Class X A)',
        date: new Date('2026-09-02'),
        status: 'Pending',
        priority: 'High',
        description: 'Student was repeatedly disturbing the class during the lecture on polynomials.',
        complainantName: 'Amit Sharma',
        assignedTo: 'Discipline In-Charge'
      },
      {
        subject: 'Incomplete homework submission',
        category: 'Academics',
        complaintType: 'Academics',
        against: 'Multiple Students (Class IX B)',
        date: new Date('2026-09-01'),
        status: 'In Review',
        priority: 'Medium',
        description: 'More than 10 students failed to submit their homework on time for the third consecutive week.',
        complainantName: 'Amit Sharma',
        assignedTo: 'Academic Coordinator'
      },
      {
        subject: 'Classroom projector not working',
        category: 'Infrastructure',
        complaintType: 'Infrastructure',
        against: 'Maintenance Dept.',
        date: new Date('2026-08-30'),
        status: 'Resolved',
        priority: 'Low',
        description: 'The projector in Room 204 has not been working for 3 days affecting teaching quality.',
        complainantName: 'Amit Sharma',
        assignedTo: 'Maintenance Dept.',
        actionTaken: 'Replaced projector bulb and HDMI cable.'
      },
      {
        subject: 'Parent complaint about exam paper',
        category: 'Exam / Assessment',
        complaintType: 'Exam / Assessment',
        against: 'Parent of Aanya Gupta',
        date: new Date('2026-08-28'),
        status: 'Resolved',
        priority: 'High',
        description: 'Parent raised concern that exam paper was out of syllabus for certain sections.',
        complainantName: 'Priya Singh',
        assignedTo: 'Examination Committee',
        actionTaken: 'Committee reviewed questions and awarded compensatory marks.'
      },
      {
        subject: 'Attendance discrepancy',
        category: 'Attendance',
        complaintType: 'Attendance',
        against: 'Admin Department',
        date: new Date('2026-08-27'),
        status: 'Pending',
        priority: 'Medium',
        description: 'Student attendance marked incorrectly for last 3 days due to system error.',
        complainantName: 'Amit Sharma',
        assignedTo: 'Admin Department'
      }
    ];

    await Complaint.insertMany(defaultTeacherComplaints);
  } catch (err) {
    console.error('autoSeedTeacherComplaints error:', err);
  }
};

exports.getComplaints = async (req, res, next) => {
  try {
    await autoSeedTeacherComplaints();

    const { status, complaintType, category, search, priority } = req.query;
    let query = {};

    if (status && status !== 'All') {
      if (status === 'Pending') {
        query.status = { $in: ['Pending', 'Open'] };
      } else if (status === 'In Review') {
        query.status = { $in: ['In Review', 'In-Progress'] };
      } else if (status === 'Resolved') {
        query.status = 'Resolved';
      } else {
        query.status = status;
      }
    }

    if (complaintType && complaintType !== 'All') {
      query.$or = [{ complaintType }, { category: complaintType }];
    }

    if (category && category !== 'All') {
      query.$or = [{ category }, { complaintType: category }];
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (search && search.trim() !== '') {
      const s = search.trim();
      query.$or = [
        { subject: { $regex: s, $options: 'i' } },
        { complainantName: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { against: { $regex: s, $options: 'i' } },
        { complaintType: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } },
        { assignedTo: { $regex: s, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(query).sort({ date: -1, createdAt: -1 });

    // Ensure subject and category are cleanly filled for older records
    const normalized = complaints.map(c => {
      const doc = c.toObject();
      if (!doc.subject) {
        doc.subject = doc.complaintType ? `${doc.complaintType} Issue` : 'Complaint Statement';
      }
      if (!doc.category || doc.category === 'Other') {
        doc.category = doc.complaintType || 'Other';
      }
      if (!doc.complaintType || doc.complaintType === 'Other') {
        doc.complaintType = doc.category || 'Other';
      }
      if (!doc.against) {
        doc.against = doc.assignedTo || 'Administration';
      }
      return doc;
    });

    res.status(200).json({ success: true, count: normalized.length, data: normalized });
  } catch (error) { next(error); }
};

exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.status(200).json({ success: true, data: complaint });
  } catch (error) { next(error); }
};

exports.addComplaint = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.complainantName) {
      data.complainantName = data.teacherName || data.reportedByName || 'Staff Faculty';
    }
    if (!data.complaintType && data.category) {
      data.complaintType = data.category;
    }
    if (!data.category && data.complaintType) {
      data.category = data.complaintType;
    }
    if (!data.subject && data.description) {
      data.subject = data.description.substring(0, 50);
    }
    if (!data.status) {
      data.status = 'Pending';
    }
    if (!data.date) {
      data.date = new Date();
    }
    const complaint = await Complaint.create(data);
    res.status(201).json({ success: true, message: 'Complaint registered successfully', data: complaint });
  } catch (error) { next(error); }
};

exports.updateComplaint = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (updateData.category && !updateData.complaintType) {
      updateData.complaintType = updateData.category;
    }
    if (updateData.complaintType && !updateData.category) {
      updateData.category = updateData.complaintType;
    }
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.status(200).json({ success: true, message: 'Complaint updated successfully', data: complaint });
  } catch (error) { next(error); }
};

exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.status(200).json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) { next(error); }
};

// ======================== POSTAL RECORDS ========================
exports.getPostalRecords = async (req, res, next) => {
  try {
    const { type, search } = req.query;
    let query = {};
    if (type && type !== 'All') query.type = type;
    if (search) {
      query.$or = [
        { referenceNo: { $regex: search, $options: 'i' } },
        { fromTitle: { $regex: search, $options: 'i' } },
        { toTitle: { $regex: search, $options: 'i' } }
      ];
    }
    const records = await PostalRecord.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) { next(error); }
};

exports.getPostalRecordById = async (req, res, next) => {
  try {
    const record = await PostalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.status(200).json({ success: true, data: record });
  } catch (error) { next(error); }
};

exports.addPostalRecord = async (req, res, next) => {
  try {
    const record = await PostalRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) { next(error); }
};

exports.updatePostalRecord = async (req, res, next) => {
  try {
    const record = await PostalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.status(200).json({ success: true, data: record });
  } catch (error) { next(error); }
};

exports.deletePostalRecord = async (req, res, next) => {
  try {
    const record = await PostalRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.status(200).json({ success: true, message: 'Postal record deleted' });
  } catch (error) { next(error); }
};

// ======================== GATE PASSES ========================
exports.getGatePasses = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { passNo: { $regex: search, $options: 'i' } },
        { personName: { $regex: search, $options: 'i' } },
        { classSection: { $regex: search, $options: 'i' } }
      ];
    }
    const passes = await GatePass.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: passes.length, data: passes });
  } catch (error) { next(error); }
};

exports.getGatePassById = async (req, res, next) => {
  try {
    const pass = await GatePass.findById(req.params.id);
    if (!pass) return res.status(404).json({ success: false, message: 'Gate pass not found' });
    res.status(200).json({ success: true, data: pass });
  } catch (error) { next(error); }
};

exports.createGatePass = async (req, res, next) => {
  try {
    const count = await GatePass.countDocuments();
    const passNo = req.body.passNo || `GP/2026/${String(count + 1).padStart(5, '0')}`;
    const pass = await GatePass.create({ ...req.body, passNo });
    res.status(201).json({ success: true, data: pass });
  } catch (error) { next(error); }
};

exports.updateGatePass = async (req, res, next) => {
  try {
    const pass = await GatePass.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pass) return res.status(404).json({ success: false, message: 'Gate pass not found' });
    res.status(200).json({ success: true, data: pass });
  } catch (error) { next(error); }
};

exports.updateGatePassStatus = async (req, res, next) => {
  try {
    const { status, actualReturnTime } = req.body;
    const update = { status };
    if (status === 'Returned') update.actualReturnTime = actualReturnTime || new Date();

    const pass = await GatePass.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!pass) return res.status(404).json({ success: false, message: 'Gate pass not found' });
    res.status(200).json({ success: true, data: pass, message: `Status updated to ${status}` });
  } catch (error) { next(error); }
};

exports.deleteGatePass = async (req, res, next) => {
  try {
    const pass = await GatePass.findByIdAndDelete(req.params.id);
    if (!pass) return res.status(404).json({ success: false, message: 'Gate pass not found' });
    res.status(200).json({ success: true, message: 'Gate pass deleted' });
  } catch (error) { next(error); }
};

// ======================== CAMPUS WORKERS ========================
exports.getCampusWorkers = async (req, res, next) => {
  try {
    const { state, type, search } = req.query;
    let query = {};
    if (state && state !== 'All') query.state = state;
    if (type && type !== 'All') query.type = type;
    if (search) {
      query.$or = [
        { badgeNo: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    const workers = await CampusWorker.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: workers.length, data: workers });
  } catch (error) { next(error); }
};

exports.getCampusWorkerById = async (req, res, next) => {
  try {
    const worker = await CampusWorker.findById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker record not found' });
    res.status(200).json({ success: true, data: worker });
  } catch (error) { next(error); }
};

exports.createCampusWorker = async (req, res, next) => {
  try {
    const count = await CampusWorker.countDocuments();
    const badgeNo = req.body.badgeNo || `CW/2026/${String(count + 1).padStart(5, '0')}`;
    const worker = await CampusWorker.create({ ...req.body, badgeNo });
    res.status(201).json({ success: true, data: worker });
  } catch (error) { next(error); }
};

exports.updateCampusWorker = async (req, res, next) => {
  try {
    const worker = await CampusWorker.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker record not found' });
    res.status(200).json({ success: true, data: worker });
  } catch (error) { next(error); }
};

exports.addCampusWorkerLog = async (req, res, next) => {
  try {
    const { inTime, outTime, gate } = req.body;
    const worker = await CampusWorker.findById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker record not found' });
    worker.logs.push({ inTime: inTime || new Date(), outTime: outTime || null, gate: gate || 'Main Gate 1' });
    await worker.save();
    res.status(200).json({ success: true, data: worker, message: 'Gate log recorded' });
  } catch (error) { next(error); }
};

exports.deleteCampusWorker = async (req, res, next) => {
  try {
    const worker = await CampusWorker.findByIdAndDelete(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker record not found' });
    res.status(200).json({ success: true, message: 'Worker record deleted' });
  } catch (error) { next(error); }
};
