const { CertificateTemplate, IssuedCertificate, Certificate } = require('../models/Certificate');
const Student = require('../models/Student');

// Helper: Seed Default Professional Templates if none exist
const autoSeedTemplatesIfEmpty = async () => {
  const count = await CertificateTemplate.countDocuments();
  if (count > 0) return;

  const defaultTemplates = [
    {
      templateId: 'bonafide-cert',
      title: 'Bonafide Student Certificate',
      type: 'Student',
      layout: 'Landscape',
      paperSize: 'A4',
      schoolName: 'ALL CORE SOLUTIONS',
      schoolAffiliation: 'Affiliated to CBSE, New Delhi | Affiliation No: 2130892',
      schoolAddress: 'Sector 4, Institutional Area, New Delhi - 110001',
      headerSubtitle: 'BONAFIDE CERTIFICATE',
      bodyTemplate: 'This is to certify that {{studentName}}, son/daughter of Mr. {{fatherName}} and Mrs. {{motherName}}, bearing Admission No: {{admissionNo}} and Roll No: {{rollNo}}, is a bonafide regular student of {{className}}, Section {{sectionName}} in our institution during the academic session {{academicYear}}.\n\nTo the best of our knowledge and school records, he/she bears an exemplary moral character and pleasant conduct. This certificate is issued on his/her request for official purposes.',
      primaryColor: '#1e3a8a',
      accentColor: '#f59e0b',
      signatoryTitle1: 'Class Teacher',
      signatoryTitle2: 'Principal / Head of School',
      isSystemDefault: true
    },
    {
      templateId: 'transfer-cert',
      title: 'Transfer Certificate (TC)',
      type: 'Student',
      layout: 'Landscape',
      paperSize: 'A4',
      schoolName: 'ALL CORE SOLUTIONS',
      schoolAffiliation: 'Affiliated to CBSE, New Delhi | School Code: 40182',
      schoolAddress: 'Sector 4, Institutional Area, New Delhi - 110001',
      headerSubtitle: 'TRANSFER & SCHOOL LEAVING CERTIFICATE',
      bodyTemplate: 'This is to certify that {{studentName}}, S/o / D/o Mr. {{fatherName}}, bearing Admission No: {{admissionNo}}, was admitted to this institution in {{className}}. He/She has cleared all school dues up to the current session {{academicYear}}.\n\nHis/Her conduct during his/her stay in this institution has been Good. He/She is leaving the school due to relocation of residence. We wish him/her success in all future academic endeavors.',
      primaryColor: '#831843',
      accentColor: '#db2777',
      signatoryTitle1: 'Exam Controller',
      signatoryTitle2: 'Principal',
      isSystemDefault: true
    },
    {
      templateId: 'character-cert',
      title: 'Character & Conduct Certificate',
      type: 'Student',
      layout: 'Landscape',
      paperSize: 'A4',
      schoolName: 'ALL CORE SOLUTIONS',
      schoolAffiliation: 'Affiliated to CBSE, New Delhi | Affiliation No: 2130892',
      schoolAddress: 'Sector 4, Institutional Area, New Delhi - 110001',
      headerSubtitle: 'CHARACTER CERTIFICATE',
      bodyTemplate: 'This is to certify that {{studentName}}, son/daughter of Mr. {{fatherName}}, Admission No: {{admissionNo}}, is well known to me personally as a student of {{className}} (Section {{sectionName}}).\n\nDuring his/her tenure at this academy, he/she has maintained strict academic discipline, showed utmost respect to teachers, and displayed commendable moral fortitude. He/She bears an upright moral character.',
      primaryColor: '#065f46',
      accentColor: '#10b981',
      signatoryTitle1: 'Discipline Head',
      signatoryTitle2: 'Principal',
      isSystemDefault: true
    },
    {
      templateId: 'academic-merit',
      title: 'Academic Excellence & Merit Award',
      type: 'Merit',
      layout: 'Landscape',
      paperSize: 'A4',
      schoolName: 'ALL CORE SOLUTIONS',
      schoolAffiliation: 'Affiliated to CBSE, New Delhi | Affiliation No: 2130892',
      schoolAddress: 'Sector 4, Institutional Area, New Delhi - 110001',
      headerSubtitle: 'CERTIFICATE OF SCHOLASTIC MERIT',
      bodyTemplate: 'In recognition of outstanding scholarly achievement, intellectual brilliance, and academic distinction, this Certificate of Merit is proudly presented to:\n\n{{studentName}}\nof {{className}} (Roll No: {{rollNo}})\n\nfor securing top-tier honours and demonstrating scholastic excellence during the academic year {{academicYear}}.',
      primaryColor: '#b45309',
      accentColor: '#f59e0b',
      signatoryTitle1: 'Academic Dean',
      signatoryTitle2: 'Director / Principal',
      isSystemDefault: true
    },
    {
      templateId: 'sports-achievement',
      title: 'Sports & Athletic Merit Certificate',
      type: 'Merit',
      layout: 'Landscape',
      paperSize: 'A4',
      schoolName: 'ALL CORE SOLUTIONS',
      schoolAffiliation: 'Department of Physical Education & Sports',
      schoolAddress: 'Sector 4, Institutional Area, New Delhi - 110001',
      headerSubtitle: 'SPORTS MERIT CERTIFICATE',
      bodyTemplate: 'This certificate of Athletic Distinction is proudly awarded to {{studentName}}, student of {{className}} (Adm No: {{admissionNo}}), for representing the academy and demonstrating exceptional teamwork, endurance, and true sportsman spirit in the Annual Interschool Sports Meet during the academic session {{academicYear}}.',
      primaryColor: '#0f766e',
      accentColor: '#14b8a6',
      signatoryTitle1: 'Sports Coach / HOD Physical Ed',
      signatoryTitle2: 'Principal',
      isSystemDefault: true
    },
    {
      templateId: 'admit-card',
      title: 'Board Style Examination Admit Card',
      type: 'Admit Card',
      layout: 'Portrait',
      paperSize: 'A4',
      schoolName: 'ALL CORE SOLUTIONS',
      schoolAffiliation: 'Annual Board Examination Session',
      schoolAddress: 'Sector 4, Institutional Area, New Delhi - 110001',
      headerSubtitle: 'EXAMINATION ADMIT CARD & ENTRY PASS',
      bodyTemplate: 'Candidate Name: {{studentName}}\nFather Name: {{fatherName}}\nRoll Number: {{rollNo}}\nAdmission No: {{admissionNo}}\nClass & Section: {{className}} - {{sectionName}}\nExam Center: All Core Solutions Main Campus\n\nThis admit card authorizes the candidate to appear for the Annual Terminal Board Examinations for session {{academicYear}}. Candidate must carry this card and school ID to every exam.',
      primaryColor: '#312e81',
      accentColor: '#6366f1',
      signatoryTitle1: 'Centre Superintendent',
      signatoryTitle2: 'Controller of Examinations',
      isSystemDefault: true
    },
    {
      templateId: 'fee-clearance',
      title: 'Fee Clearance & No Dues Certificate',
      type: 'Fee Receipt',
      layout: 'Landscape',
      paperSize: 'A4',
      schoolName: 'ALL CORE SOLUTIONS',
      schoolAffiliation: 'Accounts & Finance Department',
      schoolAddress: 'Sector 4, Institutional Area, New Delhi - 110001',
      headerSubtitle: 'OFFICIAL NO-DUES CLEARANCE CERTIFICATE',
      bodyTemplate: 'This is to officially certify that all educational fees including Tuition, Laboratories, Smartboard, Transport, and Annual Examinations for {{studentName}} (Admission No: {{admissionNo}}, {{className}}) have been completely cleared for the session {{academicYear}}. There are zero outstanding dues against this account.',
      primaryColor: '#374151',
      accentColor: '#10b981',
      signatoryTitle1: 'Chief Accounts Officer',
      signatoryTitle2: 'Bursar / Principal',
      isSystemDefault: true
    },
    {
      templateId: 'attendance-award',
      title: '100% Attendance Honor Award',
      type: 'Merit',
      layout: 'Landscape',
      paperSize: 'A4',
      schoolName: 'ALL CORE SOLUTIONS',
      schoolAffiliation: 'Affiliated to CBSE, New Delhi | Affiliation No: 2130892',
      schoolAddress: 'Sector 4, Institutional Area, New Delhi - 110001',
      headerSubtitle: 'HONOR OF PERFECT ATTENDANCE',
      bodyTemplate: 'Conferred upon {{studentName}} of {{className}}, Section {{sectionName}} in recognition of flawless regularity, outstanding punctuality, and achieving 100% Attendance throughout the entire academic session {{academicYear}} without a single day of unexcused absence.',
      primaryColor: '#c2410c',
      accentColor: '#f97316',
      signatoryTitle1: 'Class Mentor',
      signatoryTitle2: 'Principal',
      isSystemDefault: true
    }
  ];

  await CertificateTemplate.insertMany(defaultTemplates);
};

// 1. Get All Templates
exports.getTemplates = async (req, res, next) => {
  try {
    await autoSeedTemplatesIfEmpty();

    const { type, search } = req.query;
    let query = {};
    if (type && type !== 'All') {
      query.type = type;
    }
    if (search && search.trim() !== '') {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    const templates = await CertificateTemplate.find(query).sort({ isSystemDefault: -1, createdAt: 1 });
    res.status(200).json({ success: true, count: templates.length, data: templates });
  } catch (error) {
    next(error);
  }
};

// 2. Create Template
exports.createTemplate = async (req, res, next) => {
  try {
    const templateId = req.body.templateId || `tpl-${Date.now()}`;
    const template = await CertificateTemplate.create({ ...req.body, templateId });
    res.status(201).json({ success: true, message: 'Certificate template created', data: template });
  } catch (error) {
    next(error);
  }
};

// 3. Update Template
exports.updateTemplate = async (req, res, next) => {
  try {
    const updated = await CertificateTemplate.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Template not found' });
    res.status(200).json({ success: true, message: 'Template updated', data: updated });
  } catch (error) {
    next(error);
  }
};

// 4. Delete Template
exports.deleteTemplate = async (req, res, next) => {
  try {
    const deleted = await CertificateTemplate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Template not found' });
    res.status(200).json({ success: true, message: 'Template deleted' });
  } catch (error) {
    next(error);
  }
};

// 5. Auto-Generate Certificate for a Student
exports.autoGenerateCertificate = async (req, res, next) => {
  try {
    await autoSeedTemplatesIfEmpty();

    const { studentId, templateId, customRemarks, issueDate, manualStudent } = req.body;

    // Fetch Template
    let template = null;
    if (templateId) {
      template = await CertificateTemplate.findOne({
        $or: [
          { templateId },
          { _id: templateId.match(/^[0-9a-fA-F]{24}$/) ? templateId : null }
        ]
      });
    }

    if (!template) {
      template = await CertificateTemplate.findOne(); // fallback to default
    }

    // Resolve Student
    let student = null;
    if (studentId && studentId !== 'all' && studentId !== 'whole') {
      student = await Student.findById(studentId).populate('classId sectionId');
    }

    const studentName = (student ? `${student.firstName} ${student.lastName || ''}`.trim() : null) || req.body.studentName || manualStudent?.name || 'Arjun Kapoor';
    const admissionNo = (student ? (student.admissionNo || student.aparId) : null) || req.body.admissionNo || manualStudent?.admissionNo || 'DPA-2024-101';
    const rollNo = (student ? student.rollNo : null) || req.body.rollNo || manualStudent?.rollNo || '15';
    const className = (student?.classId?.className) || req.body.className || manualStudent?.className || 'Class X';
    const sectionName = (student?.sectionId?.sectionName) || req.body.sectionName || manualStudent?.sectionName || 'A';
    const fatherName = (student?.fatherName) || req.body.fatherName || manualStudent?.fatherName || 'Vikram Chauhan';
    const motherName = (student?.motherName) || req.body.motherName || manualStudent?.motherName || 'Mrs. Chauhan';
    const academicYear = req.body.academicYear || '2026-2027';

    // Unique Certificate Reference Serial
    const serialCode = Math.floor(1000 + Math.random() * 9000);
    const certificateNumber = `DPA/2026/CERT-${serialCode}`;
    const certDate = issueDate ? new Date(issueDate) : new Date();

    // Variable Replacement Engine
    let renderedContent = template.bodyTemplate
      .replace(/{{studentName}}/g, studentName)
      .replace(/{{fatherName}}/g, fatherName)
      .replace(/{{motherName}}/g, motherName)
      .replace(/{{admissionNo}}/g, admissionNo)
      .replace(/{{rollNo}}/g, rollNo)
      .replace(/{{className}}/g, className)
      .replace(/{{sectionName}}/g, sectionName)
      .replace(/{{academicYear}}/g, academicYear)
      .replace(/{{referenceNumber}}/g, certificateNumber)
      .replace(/{{issueDate}}/g, certDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }));

    // Archive in Database
    const issuedCert = await IssuedCertificate.create({
      certificateNumber,
      templateId: template.templateId,
      templateTitle: template.title,
      certificateType: template.type,
      studentId: student ? student._id : undefined,
      studentName,
      admissionNo,
      rollNo,
      className,
      sectionName,
      fatherName,
      motherName,
      academicYear,
      issueDate: certDate,
      renderedContent,
      remarks: customRemarks || ''
    });

    res.status(201).json({
      success: true,
      message: 'Certificate auto-generated and archived successfully',
      data: {
        certificate: issuedCert,
        template: {
          title: template.title,
          schoolName: template.schoolName,
          schoolAffiliation: template.schoolAffiliation,
          schoolAddress: template.schoolAddress,
          headerSubtitle: template.headerSubtitle,
          primaryColor: template.primaryColor,
          accentColor: template.accentColor,
          layout: template.layout,
          signatoryTitle1: template.signatoryTitle1,
          signatoryTitle2: template.signatoryTitle2
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 6. Bulk Auto-Generate Certificates for whole Class
exports.bulkAutoGenerateCertificates = async (req, res, next) => {
  try {
    const { className, classId, sectionId, sectionName, templateId } = req.body;
    let template = null;
    if (templateId) {
      template = await CertificateTemplate.findOne({
        $or: [
          { templateId },
          { _id: templateId.match(/^[0-9a-fA-F]{24}$/) ? templateId : null }
        ]
      });
    }
    if (!template) template = await CertificateTemplate.findOne();

    let query = {};
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;

    let students = await Student.find(query).populate('classId sectionId');
    if (students.length === 0) {
      students = await Student.find().limit(10).populate('classId sectionId');
    }

    const results = [];

    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      const sName = `${s.firstName} ${s.lastName || ''}`.trim();
      const certNum = `DPA/2026/CERT-${Math.floor(1000 + Math.random() * 9000)}`;
      const certDate = new Date();

      const rendered = template.bodyTemplate
        .replace(/{{studentName}}/g, sName)
        .replace(/{{fatherName}}/g, s.fatherName || 'Parent')
        .replace(/{{motherName}}/g, s.motherName || 'Parent')
        .replace(/{{admissionNo}}/g, s.admissionNo || s.aparId || 'DPA-101')
        .replace(/{{rollNo}}/g, s.rollNo || String(i + 1))
        .replace(/{{className}}/g, s.classId?.className || className || 'Class X')
        .replace(/{{sectionName}}/g, s.sectionId?.sectionName || sectionName || 'A')
        .replace(/{{academicYear}}/g, '2026-2027')
        .replace(/{{referenceNumber}}/g, certNum)
        .replace(/{{issueDate}}/g, certDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }));

      const doc = await IssuedCertificate.create({
        certificateNumber: certNum,
        templateId: template.templateId,
        templateTitle: template.title,
        certificateType: template.type,
        studentId: s._id,
        studentName: sName,
        admissionNo: s.admissionNo || 'DPA-101',
        rollNo: s.rollNo || String(i + 1),
        className: s.classId?.className || className || 'Class X',
        sectionName: s.sectionId?.sectionName || sectionName || 'A',
        fatherName: s.fatherName || 'Parent',
        issueDate: certDate,
        renderedContent: rendered
      });
      results.push(doc);
    }

    res.status(201).json({
      success: true,
      message: `Bulk auto-generated ${results.length} certificates`,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// 7. Get All Issued / Archived Certificates
exports.getIssuedCertificates = async (req, res, next) => {
  try {
    const { search, type, className } = req.query;
    let query = {};

    if (type && type !== 'All') query.certificateType = type;
    if (className && className !== 'All') query.className = className;

    if (search && search.trim() !== '') {
      const s = search.trim();
      query.$or = [
        { studentName: { $regex: s, $options: 'i' } },
        { certificateNumber: { $regex: s, $options: 'i' } },
        { admissionNo: { $regex: s, $options: 'i' } },
        { templateTitle: { $regex: s, $options: 'i' } }
      ];
    }

    const certificates = await IssuedCertificate.find(query).sort({ issueDate: -1 });
    res.status(200).json({ success: true, count: certificates.length, data: certificates });
  } catch (error) {
    next(error);
  }
};

// 8. Delete Issued Certificate
exports.deleteIssuedCertificate = async (req, res, next) => {
  try {
    const deleted = await IssuedCertificate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Certificate record not found' });
    res.status(200).json({ success: true, message: 'Certificate record deleted' });
  } catch (error) {
    next(error);
  }
};

// 8b. Update Issued Certificate
exports.updateIssuedCertificate = async (req, res, next) => {
  try {
    const updated = await IssuedCertificate.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Certificate record not found' });
    res.status(200).json({ success: true, message: 'Certificate record updated', data: updated });
  } catch (error) {
    next(error);
  }
};

// 9. Certificate Stats
exports.getCertificateStats = async (req, res, next) => {
  try {
    await autoSeedTemplatesIfEmpty();

    const [totalTemplates, totalIssued, studentCertCount, meritCount, admitCardCount] = await Promise.all([
      CertificateTemplate.countDocuments(),
      IssuedCertificate.countDocuments(),
      IssuedCertificate.countDocuments({ certificateType: 'Student' }),
      IssuedCertificate.countDocuments({ certificateType: 'Merit' }),
      IssuedCertificate.countDocuments({ certificateType: 'Admit Card' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTemplates,
        totalIssued,
        studentCertCount,
        meritCount,
        admitCardCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// 10. Backward Compatibility methods
exports.issueCertificate = async (req, res, next) => {
  try {
    req.body.referenceNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const cert = await Certificate.create(req.body);
    res.status(201).json({ success: true, data: cert });
  } catch (error) { next(error); }
};

exports.getCertificates = async (req, res, next) => {
  try {
    const certs = await Certificate.find().populate('student', 'firstName lastName rollNo');
    res.status(200).json({ success: true, count: certs.length, data: certs });
  } catch (error) { next(error); }
};

exports.updateCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: cert });
  } catch (error) { next(error); }
};

exports.deleteCertificate = async (req, res, next) => {
  try {
    await Certificate.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Certificate deleted' });
  } catch (error) { next(error); }
};
