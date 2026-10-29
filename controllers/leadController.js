const Lead = require('../models/Lead');

const sampleLeads = [];

exports.seedSampleLeads = async (req, res, next) => {
  try {
    await Lead.deleteMany({});
    res.status(200).json({ success: true, count: 0, data: [] });
  } catch (error) { next(error); }
};

exports.createLead = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    const schoolId = req.headers['x-tenant-id'] || req.user?.tenant?._id || req.user?.schoolId;
    if (schoolId && !payload.schoolId) payload.schoolId = schoolId;

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
    const schoolId = req.headers['x-tenant-id'] || req.user?.tenant?._id || req.user?.schoolId;

    let query = {};
    if (schoolId) {
      query.$or = [{ schoolId }, { schoolId: { $exists: false } }, { schoolId: null }];
    }

    if (stage) query.stage = stage;
    else if (status) query.status = status;

    if (source) query.source = source;
    if (targetClass) query.targetClass = targetClass;

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = [
        ...(query.$or ? [{ $or: query.$or }] : []),
        {
          $or: [
            { studentName: searchRegex },
            { parentName: searchRegex },
            { contactNumber: searchRegex },
            { email: searchRegex },
            { targetClass: searchRegex },
            { source: searchRegex }
          ]
        }
      ];
      delete query.$or;
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
    const schoolId = req.headers['x-tenant-id'] || req.user?.tenant?._id || req.user?.schoolId;
    const filter = schoolId ? { $or: [{ schoolId }, { schoolId: { $exists: false } }, { schoolId: null }] } : {};
    const leads = await Lead.find(filter);
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

