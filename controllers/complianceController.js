const {
  ComplianceProfile,
  ComplianceDocument,
  ComplianceChecklist,
  ComplianceCalendarEvent
} = require('../models/Compliance');
const Student = require('../models/Student');

// Master List of Statutory Packs
const COMPLIANCE_PACKS = [
  {
    id: 'india-cbse',
    icon: '🏫',
    name: 'India — CBSE / UDISE+',
    category: 'National Board',
    desc: 'UDISE+, SARAS, OASIS, SQAAF, APAAR ID, Aadhaar, CWSN and CBSE statutory documents. The flagship pack for CBSE affiliated schools.',
    badges: ['CBSE Affiliated', 'UDISE+ Enabled', 'APAAR Ready']
  },
  {
    id: 'india-state',
    icon: '🏛️',
    name: 'India — State Board / UDISE+',
    category: 'State Board',
    desc: 'UDISE+ student, teacher and school fields plus common statutory documents, without CBSE-only affiliation (SARAS/OASIS).',
    badges: ['State Recognized', 'RTE Compliant', 'UDISE+ Ready']
  },
  {
    id: 'kenya-cbc',
    icon: '🇰🇪',
    name: 'Kenya — CBC / NEMIS',
    category: 'International / Regional',
    desc: 'NEMIS UPI / assessment number, county and CBC learner fields for Kenyan schools. Hides India-only columns.',
    badges: ['NEMIS UPI', 'CBC Assessment']
  },
  {
    id: 'generic',
    icon: '🌐',
    name: 'Generic / International (IB & Cambridge)',
    category: 'International',
    desc: 'Statutory safety, civil defense, staff vetting, and governance. Safe default for schools following international curricula.',
    badges: ['Inspection Ready', 'Civil Safety', 'Audit Vault']
  }
];

// Seed realistic initial documents, checklist and profile if database is empty
const seedComplianceDataIfEmpty = async () => {
  try {
    const profileCount = await ComplianceProfile.countDocuments();
    if (profileCount === 0) {
      await ComplianceProfile.create({
        tenantId: 'default',
        udiseCode: '09010405101',
        schoolName: 'St. Xavier International Academy',
        affiliationNo: 'CBSE/AFF/2130892',
        recognitionNo: 'REC-EDU-2018-994',
        recognitionDate: new Date('2018-04-01'),
        managementType: 'Private Unaided',
        schoolCategory: 'Higher Secondary (I–XII)',
        board: 'India — CBSE',
        minorityGroup: 'Non-Minority',
        yearEstablished: '2008',
        principalName: 'Dr. Anandita Verma',
        principalPhone: '+91 98765 43210',
        nodalOfficer: 'Rajesh Kumar (Senior Registrar)',
        mediumOfInstruction: { english: true, hindi: true, regional: false, other: false },
        installedPacks: ['india-cbse', 'generic']
      });
    }

    const docCount = await ComplianceDocument.countDocuments();
    if (docCount === 0) {
      const now = new Date();
      await ComplianceDocument.create([
        {
          ownerType: 'School',
          category: 'Fire Safety',
          title: 'Fire Safety Certificate & NOC',
          docNo: 'FS-NOC/2025/8812',
          issuingAuthority: 'Chief Fire Officer, State Disaster & Fire Services',
          issueDate: new Date(now.getFullYear(), 1, 15),
          expiryDate: new Date(now.getFullYear() + 1, 1, 14),
          status: 'Valid',
          verified: true,
          notes: 'Annual inspection completed. All 42 dry-chemical fire extinguishers serviced.'
        },
        {
          ownerType: 'School',
          category: 'Building Safety',
          title: 'Structural Safety & Stability Certificate',
          docNo: 'PWD/STR-SAF/4410',
          issuingAuthority: 'Public Works Department (Civil Division)',
          issueDate: new Date(now.getFullYear() - 1, 5, 20),
          expiryDate: new Date(now.getFullYear() + 2, 5, 19),
          status: 'Valid',
          verified: true,
          notes: 'Triennial structural inspection passed for Blocks A, B, and Central Auditorium.'
        },
        {
          ownerType: 'School',
          category: 'Water & Sanitation',
          title: 'Safe Drinking Water & Sanitary Conditions Certificate',
          docNo: 'PHED/WATER-LAB/901',
          issuingAuthority: 'Public Health Engineering Department',
          issueDate: new Date(now.getFullYear(), 3, 10),
          expiryDate: new Date(now.getFullYear() + 1, 3, 9),
          status: 'Valid',
          verified: true,
          notes: 'Bacteriological and chemical test lab report attached. TDS within acceptable norms.'
        },
        {
          ownerType: 'School',
          category: 'CBSE Affiliation / SARAS',
          title: 'CBSE Affiliation Extension Grant Letter',
          docNo: 'CBSE/AFF-EX/2023-28/2130892',
          issuingAuthority: 'Central Board of Secondary Education, Delhi',
          issueDate: new Date(now.getFullYear() - 2, 3, 1),
          expiryDate: new Date(now.getFullYear() + 3, 2, 31),
          status: 'Valid',
          verified: true,
          notes: 'Provisional composite affiliation up to Senior Secondary Level renewed till 2028.'
        },
        {
          ownerType: 'School',
          category: 'Transport Fitness & Permit',
          title: 'School Bus Fleet Fitness & Speed Governor NOC',
          docNo: 'RTO/SCH-BUS/12-FLEET',
          issuingAuthority: 'Regional Transport Authority',
          issueDate: new Date(now.getFullYear(), 0, 10),
          expiryDate: new Date(now.getFullYear(), 11, 31),
          status: 'Expiring Soon',
          verified: true,
          notes: '12 buses inspected. 2 buses due for semi-annual fitness renewal next month.'
        },
        {
          ownerType: 'School',
          category: 'Land & Lease Title',
          title: 'School Land Title Deed & Non-Encumbrance Certificate',
          docNo: 'SUB-REG/LAND-M/5521',
          issuingAuthority: 'Sub-Registrar Land Revenue Department',
          issueDate: new Date(2007, 8, 12),
          expiryDate: null,
          status: 'Valid',
          verified: true,
          notes: 'Perpetual possession on 3.5 acres single compact plot in name of educational society.'
        }
      ]);
    }

    const checkCount = await ComplianceChecklist.countDocuments();
    if (checkCount === 0) {
      await ComplianceChecklist.create([
        {
          code: 'SAF-01',
          category: 'Safety & Infrastructure',
          title: 'Fire Drills and Emergency Evacuation Plan Displayed',
          description: 'Evacuation route maps mounted on each corridor and bi-annual evacuation drill conducted.',
          priority: 'Critical',
          status: 'Compliant',
          assignedTo: 'Campus Admin Officer',
          remarks: 'Mock drill conducted on 12th Aug. All alarm sirens verified.'
        },
        {
          code: 'STAT-02',
          category: 'Statutory Approvals',
          title: 'Mandatory Public Disclosure on School Website',
          description: 'CBSE Annexure IX disclosure link live with building safety, fire NOC, fee structure, and PTA details.',
          priority: 'Mandatory',
          status: 'Compliant',
          assignedTo: 'Webmaster / IT Head',
          remarks: 'Updated for current academic year.'
        },
        {
          code: 'WEL-03',
          category: 'Student Welfare & Protection',
          title: 'POCSO & Anti-Bullying Committee Constitution',
          description: 'Committee formed with external NGO member, legal counselor, parent reps, and complaint box installed.',
          priority: 'Critical',
          status: 'Compliant',
          assignedTo: 'Vice Principal',
          remarks: 'Meeting minutes recorded quarterly.'
        },
        {
          code: 'STF-04',
          category: 'Staff Governance & Service',
          title: 'Police Verification & Character Certificates for all Staff',
          description: 'Background checks for all teaching and contractual transport/security staff.',
          priority: 'Mandatory',
          status: 'In Progress',
          assignedTo: 'HR Manager',
          remarks: '4 new contractual housekeeping staff verifications pending at local police station.'
        },
        {
          code: 'ACA-05',
          category: 'Academic Standards & NEP 2020',
          title: 'Holistic Progress Card (HPC) & 50 Hours CPD for Teachers',
          description: 'All full-time teachers to complete 50 hours of continuous professional development per year.',
          priority: 'Mandatory',
          status: 'In Progress',
          assignedTo: 'Academic Coordinator',
          remarks: 'Average 32 hours completed per faculty on DIKSHA portal so far.'
        },
        {
          code: 'UDISE-06',
          category: 'Affiliation & Annual Returns',
          title: 'Annual UDISE+ DCF Data Upload & Certify',
          description: 'Complete data capture format upload on national UDISE portal before state deadline.',
          priority: 'Mandatory',
          status: 'Pending',
          assignedTo: 'Nodal Officer (UDISE)',
          remarks: 'Student APAAR ID verification pending.'
        }
      ]);
    }

    const calCount = await ComplianceCalendarEvent.countDocuments();
    if (calCount === 0) {
      const now = new Date();
      await ComplianceCalendarEvent.create([
        {
          title: 'Annual UDISE+ Portal Final Data Submission Deadline',
          category: 'Statutory Reporting',
          authority: 'Ministry of Education / State Project Office',
          dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
          priority: 'Urgent',
          status: 'Upcoming',
          notes: 'All student basic details, facilities, and teacher profiles must be verified.'
        },
        {
          title: 'Fire Safety Certificate Annual Renewal Inspection',
          category: 'Safety Renewal',
          authority: 'Fire Services Directorate',
          dueDate: new Date(now.getFullYear(), now.getMonth() + 2, 28),
          priority: 'High',
          status: 'Upcoming',
          notes: 'Schedule inspection officer visit 15 days in advance.'
        },
        {
          title: 'Quarterly Parent-Teacher Grievance Redressal Filing',
          category: 'Governance Review',
          authority: 'District Education Office (DEO)',
          dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 30),
          priority: 'Medium',
          status: 'Upcoming',
          notes: 'Submit summary report of PTA discussions and fee regulation compliance.'
        }
      ]);
    }
  } catch (err) {
    console.error('Error auto-seeding compliance records:', err);
  }
};

// Seed on startup
seedComplianceDataIfEmpty();

// ==============================================================
// 1. COMPLIANCE OVERVIEW & READINESS SCORES
// ==============================================================
exports.getComplianceOverview = async (req, res, next) => {
  try {
    let profile = await ComplianceProfile.findOne();
    if (!profile) {
      await seedComplianceDataIfEmpty();
      profile = await ComplianceProfile.findOne();
    }

    // Documents breakdown
    const totalDocs = await ComplianceDocument.countDocuments();
    const validDocs = await ComplianceDocument.countDocuments({ status: 'Valid' });
    const expiringSoonDocs = await ComplianceDocument.countDocuments({ status: 'Expiring Soon' });
    const expiredDocs = await ComplianceDocument.countDocuments({ status: 'Expired' });

    // Checklist breakdown
    const totalChecklist = await ComplianceChecklist.countDocuments();
    const compliantChecklist = await ComplianceChecklist.countDocuments({ status: 'Compliant' });
    const inProgressChecklist = await ComplianceChecklist.countDocuments({ status: 'In Progress' });
    const pendingChecklist = await ComplianceChecklist.countDocuments({ status: { $in: ['Pending', 'Non-Compliant'] } });

    // Data validation check on Student records
    const totalStudents = await Student.countDocuments();
    const missingAadhaarCount = await Student.countDocuments({
      $or: [{ aadhaar: { $exists: false } }, { aadhaar: '' }, { aadhaar: null }]
    });
    const missingAparCount = await Student.countDocuments({
      $or: [{ aparId: { $exists: false } }, { aparId: '' }, { aparId: null }]
    });
    const totalValidationErrors = missingAadhaarCount + missingAparCount;

    // Calculate Dynamic Readiness %
    // Profile completeness: check key fields
    const keyProfileFields = [profile.udiseCode, profile.affiliationNo, profile.recognitionNo, profile.yearEstablished, profile.principalName, profile.principalPhone];
    const filledKeyFields = keyProfileFields.filter(f => Boolean(f && f.toString().trim())).length;
    const profileCompletenessPct = Math.round((filledKeyFields / keyProfileFields.length) * 100);

    // Checklist completeness
    const checklistPct = totalChecklist > 0 ? Math.round((compliantChecklist / totalChecklist) * 100) : 80;

    // Document validity score
    const docScorePct = totalDocs > 0 ? Math.round((validDocs / totalDocs) * 100) : 85;

    // UDISE readiness
    const studentDataQualityPct = totalStudents > 0 
      ? Math.max(10, Math.round(((totalStudents * 2 - totalValidationErrors) / (totalStudents * 2)) * 100))
      : 88;
    const udiseReadinessPct = Math.round((profileCompletenessPct * 0.4) + (studentDataQualityPct * 0.6));

    // Overall School Health
    const healthScorePct = Math.round((checklistPct * 0.35) + (docScorePct * 0.35) + (profileCompletenessPct * 0.3));

    // Risk assessment
    let riskLevel = 'Low';
    if (totalValidationErrors > 50 || expiredDocs > 0 || pendingChecklist > 3) {
      riskLevel = 'High';
    } else if (totalValidationErrors > 10 || expiringSoonDocs > 1 || pendingChecklist > 1) {
      riskLevel = 'Medium';
    }

    // Top action items
    const urgentDocuments = await ComplianceDocument.find({ status: { $in: ['Expired', 'Expiring Soon'] } }).limit(3);
    const urgentChecklist = await ComplianceChecklist.find({ status: { $in: ['Pending', 'Non-Compliant'] }, priority: 'Critical' }).limit(3);

    res.status(200).json({
      success: true,
      data: {
        profile,
        readiness: {
          udiseReady: udiseReadinessPct,
          cbseReady: profile.installedPacks.includes('india-cbse') ? Math.round((docScorePct + checklistPct) / 2) : null,
          healthScore: healthScorePct,
          riskLevel,
          profileCompleteness: profileCompletenessPct,
          studentDataQuality: studentDataQualityPct,
          validationErrorCount: totalValidationErrors,
          totalStudents
        },
        stats: {
          totalDocuments: totalDocs,
          validDocuments: validDocs,
          expiringSoonDocuments: expiringSoonDocs,
          expiredDocuments: expiredDocs,
          totalChecklist,
          compliantChecklist,
          inProgressChecklist,
          pendingChecklist
        },
        urgentActions: {
          documents: urgentDocuments,
          checklist: urgentChecklist
        }
      }
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 2. SCHOOL COMPLIANCE PROFILE
// ==============================================================
exports.getSchoolProfile = async (req, res, next) => {
  try {
    let profile = await ComplianceProfile.findOne();
    if (!profile) {
      profile = await ComplianceProfile.create({});
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) { next(error); }
};

exports.updateSchoolProfile = async (req, res, next) => {
  try {
    let profile = await ComplianceProfile.findOne();
    if (!profile) {
      profile = await ComplianceProfile.create(req.body);
    } else {
      profile = await ComplianceProfile.findByIdAndUpdate(profile._id, req.body, { new: true, runValidators: true });
    }
    res.status(200).json({ success: true, message: 'School compliance profile updated successfully', data: profile });
  } catch (error) { next(error); }
};

// ==============================================================
// 3. COMPLIANCE PACKS MANAGEMENT
// ==============================================================
exports.getPacks = async (req, res, next) => {
  try {
    const profile = await ComplianceProfile.findOne();
    const installed = profile?.installedPacks || ['india-cbse', 'generic'];

    const packsWithStatus = COMPLIANCE_PACKS.map(p => ({
      ...p,
      installed: installed.includes(p.id)
    }));

    res.status(200).json({ success: true, data: packsWithStatus });
  } catch (error) { next(error); }
};

exports.togglePackInstall = async (req, res, next) => {
  try {
    const { packId, install } = req.body;
    let profile = await ComplianceProfile.findOne();
    if (!profile) profile = await ComplianceProfile.create({});

    let installed = profile.installedPacks || [];
    if (install) {
      if (!installed.includes(packId)) installed.push(packId);
    } else {
      installed = installed.filter(id => id !== packId);
    }

    profile.installedPacks = installed;
    await profile.save();

    res.status(200).json({
      success: true,
      message: `Pack ${packId} ${install ? 'installed' : 'uninstalled'} successfully`,
      data: profile.installedPacks
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 4. FIELD SETTINGS
// ==============================================================
exports.getFieldSettings = async (req, res, next) => {
  try {
    const profile = await ComplianceProfile.findOne();
    res.status(200).json({
      success: true,
      data: profile?.fieldSettings || {}
    });
  } catch (error) { next(error); }
};

exports.updateFieldSettings = async (req, res, next) => {
  try {
    const { student, teacher } = req.body;
    let profile = await ComplianceProfile.findOne();
    if (!profile) profile = await ComplianceProfile.create({});

    if (student) profile.fieldSettings.student = student;
    if (teacher) profile.fieldSettings.teacher = teacher;
    await profile.save();

    res.status(200).json({ success: true, message: 'Field visibility settings saved', data: profile.fieldSettings });
  } catch (error) { next(error); }
};

// ==============================================================
// 5. STATUTORY DOCUMENT VAULT
// ==============================================================
exports.getDocuments = async (req, res, next) => {
  try {
    const { category, ownerType, search, status } = req.query;
    let query = {};

    if (category && category !== 'All categories') query.category = category;
    if (ownerType && ownerType !== 'All') query.ownerType = ownerType;
    if (status && status !== 'All') query.status = status;
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { docNo: { $regex: search.trim(), $options: 'i' } },
        { issuingAuthority: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const docs = await ComplianceDocument.find(query).sort({ expiryDate: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) { next(error); }
};

exports.createDocument = async (req, res, next) => {
  try {
    const { title, category, ownerType, docNo, issuingAuthority, issueDate, expiryDate, notes, fileUrl } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Document title is required' });
    }

    // Determine status based on expiry
    let status = 'Valid';
    if (expiryDate) {
      const exp = new Date(expiryDate);
      const diffDays = Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) status = 'Expired';
      else if (diffDays <= 60) status = 'Expiring Soon';
    }

    const doc = await ComplianceDocument.create({
      title,
      category: category || 'Building Safety',
      ownerType: ownerType || 'School',
      docNo: docNo || '',
      issuingAuthority: issuingAuthority || '',
      issueDate: issueDate ? new Date(issueDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      status: req.body.status || status,
      notes: notes || '',
      fileUrl: fileUrl || '',
      verified: true
    });

    res.status(201).json({ success: true, message: 'Document uploaded and registered in vault', data: doc });
  } catch (error) { next(error); }
};

exports.updateDocument = async (req, res, next) => {
  try {
    const doc = await ComplianceDocument.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.status(200).json({ success: true, message: 'Document updated successfully', data: doc });
  } catch (error) { next(error); }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await ComplianceDocument.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.status(200).json({ success: true, message: 'Document removed from vault' });
  } catch (error) { next(error); }
};

// ==============================================================
// 6. COMPLIANCE CHECKLIST
// ==============================================================
exports.getChecklist = async (req, res, next) => {
  try {
    const { category, priority, status } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;
    if (priority && priority !== 'All') query.priority = priority;
    if (status && status !== 'All') query.status = status;

    const list = await ComplianceChecklist.find(query).sort({ priority: 1, createdAt: 1 });
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) { next(error); }
};

exports.createChecklistItem = async (req, res, next) => {
  try {
    const { title, code, category, priority, status, assignedTo, remarks } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Checklist title is required' });

    const item = await ComplianceChecklist.create({
      code: code || `CHK-${Date.now().toString().slice(-4)}`,
      title,
      category: category || 'Statutory Approvals',
      priority: priority || 'Mandatory',
      status: status || 'Pending',
      assignedTo: assignedTo || 'Principal',
      remarks: remarks || ''
    });

    res.status(201).json({ success: true, message: 'Checklist item added', data: item });
  } catch (error) { next(error); }
};

exports.updateChecklistItem = async (req, res, next) => {
  try {
    const item = await ComplianceChecklist.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Checklist item not found' });
    res.status(200).json({ success: true, message: 'Checklist item updated', data: item });
  } catch (error) { next(error); }
};

exports.deleteChecklistItem = async (req, res, next) => {
  try {
    const item = await ComplianceChecklist.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Checklist item not found' });
    res.status(200).json({ success: true, message: 'Checklist item deleted' });
  } catch (error) { next(error); }
};

// ==============================================================
// 7. COMPLIANCE CALENDAR EVENTS
// ==============================================================
exports.getCalendarEvents = async (req, res, next) => {
  try {
    const events = await ComplianceCalendarEvent.find().sort({ dueDate: 1 });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) { next(error); }
};

exports.createCalendarEvent = async (req, res, next) => {
  try {
    const { title, category, authority, dueDate, priority, status, notes } = req.body;
    if (!title || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title and due date are required' });
    }

    const event = await ComplianceCalendarEvent.create({
      title,
      category: category || 'Statutory Renewal',
      authority: authority || 'Education Department',
      dueDate: new Date(dueDate),
      priority: priority || 'High',
      status: status || 'Upcoming',
      notes: notes || ''
    });

    res.status(201).json({ success: true, message: 'Calendar event added', data: event });
  } catch (error) { next(error); }
};

exports.deleteCalendarEvent = async (req, res, next) => {
  try {
    const event = await ComplianceCalendarEvent.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Calendar event not found' });
    res.status(200).json({ success: true, message: 'Calendar event deleted' });
  } catch (error) { next(error); }
};

// ==============================================================
// 8. DATA VALIDATOR ENGINE (UDISE+ / CBSE Data Quality)
// ==============================================================
exports.runDataValidator = async (req, res, next) => {
  try {
    const students = await Student.find({}, 'firstName lastName aparId admissionNo aadhaar gender dateOfBirth category class section');

    const issues = [];

    students.forEach(st => {
      const studentName = `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Unnamed Student';

      // 1. Check APAAR / PEN ID
      if (!st.aparId || st.aparId.trim() === '' || st.aparId.length < 5) {
        issues.push({
          id: `err-apaar-${st._id}`,
          studentId: st._id,
          studentName,
          admissionNo: st.admissionNo || '-',
          field: 'APAAR / PEN ID',
          severity: 'Critical',
          description: 'Missing or incomplete 12-digit Permanent Education Number (PEN). Required for UDISE+ and board registration.',
          suggestedFix: 'Enter valid APAAR ID verified from Digilocker or state portal.'
        });
      }

      // 2. Check Aadhaar Number
      if (!st.aadhaar || st.aadhaar.trim().length !== 12 || isNaN(st.aadhaar)) {
        issues.push({
          id: `err-aadhaar-${st._id}`,
          studentId: st._id,
          studentName,
          admissionNo: st.admissionNo || '-',
          field: 'Aadhaar Number',
          severity: 'Critical',
          description: 'Aadhaar number is missing or does not match 12-digit UIDAI standard.',
          suggestedFix: 'Enter exact 12-digit Aadhaar number as printed on student UID card.'
        });
      }

      // 3. Check Date of Birth
      if (!st.dateOfBirth) {
        issues.push({
          id: `err-dob-${st._id}`,
          studentId: st._id,
          studentName,
          admissionNo: st.admissionNo || '-',
          field: 'Date of Birth',
          severity: 'Critical',
          description: 'Birth date is not recorded; blocks age-appropriate RTE cohort calculation.',
          suggestedFix: 'Upload birth certificate or record valid date of birth.'
        });
      }

      // 4. Check Gender
      if (!st.gender || st.gender === 'Select') {
        issues.push({
          id: `err-gender-${st._id}`,
          studentId: st._id,
          studentName,
          admissionNo: st.admissionNo || '-',
          field: 'Gender',
          severity: 'Warning',
          description: 'Gender not specified. Required for gender-disaggregated government metrics.',
          suggestedFix: 'Select Male, Female, or Other.'
        });
      }
    });

    const criticalCount = issues.filter(i => i.severity === 'Critical').length;
    const warningCount = issues.filter(i => i.severity === 'Warning').length;

    res.status(200).json({
      success: true,
      totalStudentsScanned: students.length,
      totalIssuesFound: issues.length,
      criticalCount,
      warningCount,
      data: issues
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 9. STATUTORY GOVERNMENT REPORTS SUMMARY
// ==============================================================
exports.getGovernmentReports = async (req, res, next) => {
  try {
    const profile = await ComplianceProfile.findOne();
    const totalStudents = await Student.countDocuments();
    const boysCount = await Student.countDocuments({ gender: 'Male' });
    const girlsCount = await Student.countDocuments({ gender: 'Female' });
    const generalCount = await Student.countDocuments({ category: 'General' });
    const reservedCount = totalStudents - generalCount;

    res.status(200).json({
      success: true,
      data: {
        udiseSummary: {
          udiseCode: profile?.udiseCode || '09010405101',
          schoolName: profile?.schoolName || 'St. Xavier International Academy',
          affiliationNo: profile?.affiliationNo || 'CBSE/AFF/2130892',
          totalEnrollment: totalStudents,
          genderRatio: { boys: boysCount, girls: girlsCount },
          socialCategories: { general: generalCount, reserved: Math.max(0, reservedCount) },
          dcfStatus: 'Ready for Review',
          lastExportDate: new Date()
        },
        cbseSarasReport: {
          landAreaAcres: '3.50',
          builtUpAreaSqMeters: '4,850',
          playGroundAreaSqMeters: '6,200',
          smartClassrooms: 24,
          scienceLabs: 3,
          compositeAffiliationStatus: 'Compliant'
        }
      }
    });
  } catch (error) { next(error); }
};
