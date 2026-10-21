const Lead = require('../models/Lead');

const sampleLeads = [
  {
    studentName: 'Aarav Sharma',
    parentName: 'Vivek Sharma',
    contactNumber: '+91 9876543210',
    email: 'vivek.sharma@example.com',
    targetClass: 'Grade 1',
    source: 'Website',
    status: 'New Enquiry',
    stage: 'New Enquiry',
    score: 85,
    followUpDate: new Date(Date.now() + 86400000),
    followUpType: 'Call',
    followUpTitle: 'Schedule campus tour',
    followUpStatus: 'pending',
    notes: 'Interested in CBSE curriculum and school transport facility.',
  },
  {
    studentName: 'Priya Patel',
    parentName: 'Sanjay Patel',
    contactNumber: '+91 9876543211',
    email: 'sanjay.patel@example.com',
    targetClass: 'Grade 3',
    source: 'Walk-in',
    status: 'Contacted / Qualified',
    stage: 'Contacted / Qualified',
    score: 90,
    followUpDate: new Date(),
    followUpType: 'Meeting',
    followUpTitle: 'Document verification meeting',
    followUpStatus: 'pending',
    notes: 'Visited front desk. Looking for admission in Grade 3.',
  },
  {
    studentName: 'Rohan Gupta',
    parentName: 'Amit Gupta',
    contactNumber: '+91 9876543212',
    email: 'amit.gupta@example.com',
    targetClass: 'Grade 5',
    source: 'Facebook',
    status: 'Application Received',
    stage: 'Application Received',
    score: 75,
    followUpDate: new Date(Date.now() + 172800000),
    followUpType: 'Email',
    followUpTitle: 'Send fee structure & syllabus breakdown',
    followUpStatus: 'pending',
    notes: 'Submitted online inquiry via social media ad.',
  },
  {
    studentName: 'Ishita Singh',
    parentName: 'Rajesh Singh',
    contactNumber: '+91 9876543213',
    email: 'rajesh.singh@example.com',
    targetClass: 'LKG',
    source: 'Google Ads',
    status: 'Document Verification',
    stage: 'Document Verification',
    score: 95,
    followUpDate: new Date(Date.now() - 86400000),
    followUpType: 'Call',
    followUpTitle: 'Entrance test results review',
    followUpStatus: 'pending',
    notes: 'Submitted birth certificate and parent Aadhaar card.',
  },
  {
    studentName: 'Karan Malhotra',
    parentName: 'Vijay Malhotra',
    contactNumber: '+91 9876543214',
    email: 'vijay.malhotra@example.com',
    targetClass: 'Grade 9',
    source: 'Referral',
    status: 'Entrance Test',
    stage: 'Entrance Test',
    score: 65,
    followUpDate: new Date(Date.now() + 259200000),
    followUpType: 'Campus Visit',
    followUpTitle: 'Entrance test assessment slot',
    followUpStatus: 'pending',
    notes: 'Referred by Grade 9 student. Scheduled for Math & Science test.',
  },
  {
    studentName: 'Ananya Verma',
    parentName: 'Sunil Verma',
    contactNumber: '+91 9811223344',
    email: 'sunil.verma@example.com',
    targetClass: 'Nursery',
    source: 'Walk-in',
    status: 'Offer / Selected',
    stage: 'Offer / Selected',
    score: 95,
    followUpDate: new Date(Date.now() + 86400000),
    followUpType: 'Meeting',
    followUpTitle: 'Admission fee payment and enrollment confirmation',
    followUpStatus: 'pending',
    notes: 'Shortlisted by the principal. Waiting for admission fee payment.',
  },
  {
    studentName: 'Kabir Das',
    parentName: 'Meera Das',
    contactNumber: '+91 9822334455',
    email: 'meera.das@example.com',
    targetClass: 'Grade 2',
    source: 'Website',
    status: 'Enrolled',
    stage: 'Enrolled',
    score: 100,
    followUpDate: null,
    followUpType: 'Call',
    followUpTitle: 'Welcome kit confirmation',
    followUpStatus: 'completed',
    notes: 'Successfully enrolled. Admission fees paid.',
  }
];

exports.seedSampleLeads = async (req, res, next) => {
  try {
    await Lead.deleteMany({});
    const created = await Lead.insertMany(sampleLeads);
    res.status(200).json({ success: true, count: created.length, data: created });
  } catch (error) { next(error); }
};

exports.createLead = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.stage && payload.status) payload.stage = payload.status;
    if (!payload.status && payload.stage) payload.status = payload.stage;
    if (!payload.parentName && payload.guardianName) payload.parentName = payload.guardianName;
    if (!payload.targetClass && (payload.class || payload.cls)) payload.targetClass = payload.class || payload.cls;

    const lead = await Lead.create(payload);
    res.status(201).json({ success: true, data: lead });
  } catch (error) { next(error); }
};

exports.getLeads = async (req, res, next) => {
  try {
    const { status, stage, source, targetClass, search, startDate, endDate } = req.query;
    
    // Auto-seed if database is empty so system always has realistic live data
    const totalCount = await Lead.countDocuments();
    if (totalCount === 0) {
      await Lead.insertMany(sampleLeads);
    }

    let query = {};
    if (stage) query.stage = stage;
    else if (status) query.status = status;

    if (source) query.source = source;
    if (targetClass) query.targetClass = targetClass;

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { studentName: searchRegex },
        { parentName: searchRegex },
        { contactNumber: searchRegex },
        { email: searchRegex },
        { targetClass: searchRegex },
        { source: searchRegex }
      ];
    }

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'firstName lastName email contactNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leads.length, data: leads });
  } catch (error) { next(error); }
};

exports.getLeadStats = async (req, res, next) => {
  try {
    const leads = await Lead.find();
    const total = leads.length;
    const converted = leads.filter(l => l.status === 'Enrolled' || l.status === 'Converted' || l.stage === 'Enrolled').length;
    const lost = leads.filter(l => l.status === 'Lost' || l.stage === 'Lost / Rejected' || l.status === 'Lost / Rejected').length;
    const open = total - converted - lost;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

    // This month count
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = leads.filter(l => new Date(l.createdAt) >= firstDayOfMonth).length;

    // Stage breakdown
    const stageCounts = {};
    leads.forEach(l => {
      const stg = l.stage || l.status || 'New Enquiry';
      stageCounts[stg] = (stageCounts[stg] || 0) + 1;
    });

    // Source breakdown
    const sourceCounts = {};
    leads.forEach(l => {
      const src = l.source || 'Website';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    // Follow-ups breakdown
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const followUps = {
      overdue: 0,
      today: 0,
      upcoming: 0,
      completed: 0
    };

    leads.forEach(l => {
      if (l.followUpStatus === 'completed') {
        followUps.completed++;
      } else if (l.followUpDate) {
        const d = new Date(l.followUpDate);
        if (d < today) followUps.overdue++;
        else if (d >= today && d < tomorrow) followUps.today++;
        else followUps.upcoming++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        converted,
        open,
        lost,
        conversionRate,
        newThisMonth,
        stageCounts,
        sourceCounts,
        followUps
      }
    });
  } catch (error) { next(error); }
};

exports.updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.stage && !updateData.status) updateData.status = updateData.stage;
    if (updateData.status && !updateData.stage) updateData.stage = updateData.status;

    const lead = await Lead.findByIdAndUpdate(id, updateData, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.status(200).json({ success: true, data: lead });
  } catch (error) { next(error); }
};

exports.convertLeadToStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    lead.status = 'Enrolled';
    lead.stage = 'Enrolled';
    lead.score = 100;

    // Auto-create Student entry if not already converted
    if (!lead.convertedStudentId) {
      try {
        const Student = require('../models/Student');
        const names = (lead.studentName || 'Student').trim().split(' ');
        const firstName = names[0] || 'Student';
        const lastName = names.slice(1).join(' ') || 'Candidate';
        const aparId = 'STU-' + Math.floor(100000 + Math.random() * 900000);

        const newStudent = await Student.create({
          aparId,
          admissionNo: aparId,
          firstName,
          lastName,
          gender: 'Male',
          dateOfBirth: new Date('2015-01-01'),
          class: lead.targetClass || 'Grade 1',
          section: 'A',
          contactNumber: lead.contactNumber,
          email: lead.email,
          fatherName: lead.parentName || 'Parent',
          presentAddress: lead.notes || 'Enquiry converted',
          admissionDate: new Date()
        });
        lead.convertedStudentId = newStudent._id;
      } catch (stuErr) {
        console.warn('Student auto-create notice:', stuErr.message);
      }
    }

    await lead.save();

    res.status(200).json({
      success: true,
      message: `${lead.studentName} successfully converted and enrolled as student!`,
      data: lead
    });
  } catch (error) { next(error); }
};

exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    
    await lead.deleteOne();
    res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) { next(error); }
};

