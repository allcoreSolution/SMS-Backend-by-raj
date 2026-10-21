const { IdCardTemplate, GeneratedIdCard } = require('../models/IdCard');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const AcademicClass = require('../models/AcademicClass');
const AcademicSection = require('../models/AcademicSection');

// Initial Flagship Templates Seed
const DEFAULT_TEMPLATES = [
  {
    templateId: 'classic-band-indigo',
    title: 'Classic Band Indigo',
    cardType: 'Student',
    orientation: 'Portrait',
    dimensions: '54 x 85.6 mm (CR80)',
    themeColor: '#5F52FF',
    accentColor: '#E9E7FF',
    inkColor: '#1E1B4B',
    schoolName: 'Greenwood International School',
    schoolTagline: 'Affiliated to CBSE | Affiliation No: 2130894',
    schoolAddress: 'Sector 12, Knowledge Park, New Delhi - 110001',
    schoolPhone: '+91 98765 43210',
    isDefault: true,
    fieldsIncluded: {
      photo: true,
      bloodGroup: true,
      emergencyContact: true,
      address: true,
      barcode: true,
      qrCode: true,
      validityYear: true,
      rollNo: true,
      admissionNo: true,
      dob: true
    }
  },
  {
    templateId: 'emerald-band',
    title: 'Emerald Band',
    cardType: 'Student',
    orientation: 'Portrait',
    dimensions: '54 x 85.6 mm (CR80)',
    themeColor: '#0F766E',
    accentColor: '#D5F2EE',
    inkColor: '#0B3B37',
    schoolName: 'Greenwood International School',
    schoolTagline: 'Excellence in Education Since 1998',
    schoolAddress: 'Sector 12, Knowledge Park, New Delhi',
    schoolPhone: '+91 98765 43210',
    fieldsIncluded: {
      photo: true,
      bloodGroup: true,
      emergencyContact: true,
      address: false,
      barcode: true,
      qrCode: true,
      validityYear: true,
      rollNo: true,
      admissionNo: true,
      dob: true
    }
  },
  {
    templateId: 'azure-landscape',
    title: 'Azure Modern Landscape',
    cardType: 'All',
    orientation: 'Landscape',
    dimensions: '85.6 x 54 mm (CR80)',
    themeColor: '#1D4ED8',
    accentColor: '#DBE7FF',
    inkColor: '#0F1E4D',
    schoolName: 'Greenwood International School',
    schoolTagline: 'Inspiring Global Citizens',
    schoolAddress: 'Sector 12, Knowledge Park, New Delhi',
    schoolPhone: '+91 98765 43210',
    fieldsIncluded: {
      photo: true,
      bloodGroup: true,
      emergencyContact: true,
      address: true,
      barcode: true,
      qrCode: true,
      validityYear: true,
      rollNo: true,
      admissionNo: true,
      dob: true
    }
  },
  {
    templateId: 'golden-crest-faculty',
    title: 'Golden Crest Faculty',
    cardType: 'Staff',
    orientation: 'Portrait',
    dimensions: '54 x 85.6 mm (CR80)',
    themeColor: '#D97706',
    accentColor: '#FEF3C7',
    inkColor: '#451A03',
    schoolName: 'Greenwood International School',
    schoolTagline: 'Faculty & Administrative Council',
    schoolAddress: 'Sector 12, Knowledge Park, New Delhi',
    schoolPhone: '+91 98765 43210',
    fieldsIncluded: {
      photo: true,
      bloodGroup: true,
      emergencyContact: true,
      address: true,
      barcode: true,
      qrCode: true,
      validityYear: true,
      rollNo: false,
      admissionNo: false,
      dob: false
    }
  },
  {
    templateId: 'midnight-executive',
    title: 'Midnight Executive Dark',
    cardType: 'All',
    orientation: 'Portrait',
    dimensions: '54 x 85.6 mm (CR80)',
    themeColor: '#1E1B4B',
    accentColor: '#4338CA',
    inkColor: '#FFFFFF',
    schoolName: 'Greenwood International School',
    schoolTagline: 'Centre of Advanced Learning',
    schoolAddress: 'Sector 12, Knowledge Park, New Delhi',
    schoolPhone: '+91 98765 43210',
    fieldsIncluded: {
      photo: true,
      bloodGroup: true,
      emergencyContact: true,
      address: false,
      barcode: true,
      qrCode: true,
      validityYear: true,
      rollNo: true,
      admissionNo: true,
      dob: true
    }
  },
  {
    templateId: 'sunrise-orange',
    title: 'Sunrise Warm Modern',
    cardType: 'Student',
    orientation: 'Portrait',
    dimensions: '54 x 85.6 mm (CR80)',
    themeColor: '#C2410C',
    accentColor: '#FDE5D6',
    inkColor: '#431407',
    schoolName: 'Greenwood International School',
    schoolTagline: 'Affiliated to CBSE | New Delhi',
    schoolAddress: 'Sector 12, Knowledge Park, New Delhi',
    schoolPhone: '+91 98765 43210',
    fieldsIncluded: {
      photo: true,
      bloodGroup: true,
      emergencyContact: true,
      address: true,
      barcode: true,
      qrCode: true,
      validityYear: true,
      rollNo: true,
      admissionNo: true,
      dob: true
    }
  }
];

// Helper to seed templates if empty
const ensureTemplatesSeeded = async () => {
  const count = await IdCardTemplate.countDocuments();
  if (count === 0) {
    await IdCardTemplate.insertMany(DEFAULT_TEMPLATES);
  }
};

/**
 * @desc Get all ID card templates
 * @route GET /api/id-cards/templates
 */
exports.getTemplates = async (req, res) => {
  try {
    await ensureTemplatesSeeded();
    const { cardType, orientation } = req.query;
    const filter = { isActive: true };
    if (cardType && cardType !== 'All') {
      filter.$or = [{ cardType }, { cardType: 'All' }];
    }
    if (orientation) filter.orientation = orientation;

    const templates = await IdCardTemplate.find(filter).sort({ isDefault: -1, createdAt: 1 });
    res.json({ success: true, count: templates.length, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Create new template
 * @route POST /api/id-cards/templates
 */
exports.createTemplate = async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      templateId: req.body.templateId || `tpl-${Date.now()}`
    };
    const template = await IdCardTemplate.create(templateData);
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update template
 * @route PUT /api/id-cards/templates/:id
 */
exports.updateTemplate = async (req, res) => {
  try {
    const template = await IdCardTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete template
 * @route DELETE /api/id-cards/templates/:id
 */
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await IdCardTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper to build person ID Card details
 */
const buildPersonCardData = async ({ personType, personId, templateId, validUntil, academicSession }) => {
  let template = await IdCardTemplate.findOne({ templateId });
  if (!template) {
    template = await IdCardTemplate.findOne({ isDefault: true }) || DEFAULT_TEMPLATES[0];
  }

  const session = academicSession || '2026-2027';
  const validity = validUntil || '31-Mar-2027';
  const randomSerial = Math.floor(1000 + Math.random() * 9000);
  const cardNum = `IDC-${new Date().getFullYear()}-${randomSerial}`;

  if (personType === 'Student') {
    const student = await Student.findById(personId)
      .populate('classId', 'className')
      .populate('sectionId', 'sectionName');
    
    if (!student) throw new Error('Student record not found');

    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
    const className = student.classId?.className || 'Class I';
    const sectionName = student.sectionId?.sectionName || 'A';
    const admissionNo = student.admissionNo || student.aparId || `ADM-${student._id.toString().slice(-4)}`;
    const rollNo = student.rollNo || '1';
    const photoUrl = student.studentPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80';
    const bloodGroup = student.bloodGroup || 'O+';
    const emergencyContact = student.fatherPhone || student.motherPhone || student.studentPhone || '+91 98765 43210';
    const dob = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB') : '15/06/2012';

    const qrPayload = JSON.stringify({
      card: cardNum,
      type: 'Student',
      name: fullName,
      adm: admissionNo,
      class: `${className} - ${sectionName}`,
      blood: bloodGroup,
      valid: validity,
      school: template.schoolName
    });

    return {
      cardNumber: cardNum,
      templateId: template.templateId,
      templateTitle: template.title,
      personType: 'Student',
      personId: student._id,
      personModel: 'Student',
      fullName,
      idNumber: admissionNo,
      rollNo,
      admissionNo,
      className,
      sectionName,
      designation: 'Student',
      department: 'Academics',
      bloodGroup,
      dob,
      gender: student.gender || 'Male',
      phone: student.studentPhone || emergencyContact,
      emergencyContact,
      address: 'Knowledge Park, New Delhi',
      photoUrl,
      qrCodeData: qrPayload,
      barcodeData: admissionNo,
      academicSession: session,
      validUntil: validity,
      status: 'Active'
    };
  } else {
    // Staff
    const staff = await Staff.findById(personId);
    if (!staff) throw new Error('Staff record not found');

    const fullName = staff.fullName || 'Staff Member';
    const staffId = staff.staffId || `STF-${staff._id.toString().slice(-4)}`;
    const designation = staff.designation || 'Faculty';
    const department = staff.department || 'Academics';
    const photoUrl = staff.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
    const bloodGroup = staff.bloodGroup || 'B+';
    const emergencyContact = staff.emergencyContactPhone || staff.phone || '+91 98765 43210';
    const dob = staff.dateOfBirth ? new Date(staff.dateOfBirth).toLocaleDateString('en-GB') : '10/08/1988';

    const qrPayload = JSON.stringify({
      card: cardNum,
      type: 'Staff',
      name: fullName,
      empId: staffId,
      dept: department,
      desig: designation,
      blood: bloodGroup,
      valid: validity,
      school: template.schoolName
    });

    return {
      cardNumber: cardNum,
      templateId: template.templateId,
      templateTitle: template.title,
      personType: 'Staff',
      personId: staff._id,
      personModel: 'Staff',
      fullName,
      idNumber: staffId,
      rollNo: '-',
      admissionNo: '-',
      className: '-',
      sectionName: '-',
      designation,
      department,
      bloodGroup,
      dob,
      gender: staff.gender || 'Male',
      phone: staff.phone || emergencyContact,
      emergencyContact,
      address: 'Staff Quarters, New Delhi',
      photoUrl,
      qrCodeData: qrPayload,
      barcodeData: staffId,
      academicSession: session,
      validUntil: validity,
      status: 'Active'
    };
  }
};

/**
 * @desc Auto-generate a single ID card
 * @route POST /api/id-cards/generate
 */
exports.autoGenerateIdCard = async (req, res) => {
  try {
    const { personType, personId, templateId, validUntil, academicSession } = req.body;
    if (!personType || !personId) {
      return res.status(400).json({ success: false, message: 'personType and personId are required' });
    }

    const cardData = await buildPersonCardData({
      personType,
      personId,
      templateId: templateId || 'classic-band-indigo',
      validUntil,
      academicSession
    });

    // Upsert or create new record for person
    let existingCard = await GeneratedIdCard.findOne({ personId, personType });
    if (existingCard) {
      // update with new template and timestamp
      Object.assign(existingCard, cardData);
      existingCard.updatedAt = new Date();
      await existingCard.save();
      return res.json({ success: true, message: 'ID card refreshed & auto-generated successfully', data: existingCard });
    }

    const newCard = await GeneratedIdCard.create(cardData);
    res.status(201).json({ success: true, message: 'ID card auto-generated successfully', data: newCard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Bulk Auto-Generate ID cards for a whole class or department
 * @route POST /api/id-cards/bulk-generate
 */
exports.bulkAutoGenerate = async (req, res) => {
  try {
    const { personType, classId, sectionId, department, templateId, validUntil, academicSession } = req.body;
    let people = [];

    if (personType === 'Student') {
      const query = { status: 'Active' };
      if (classId) query.classId = classId;
      if (sectionId) query.sectionId = sectionId;
      people = await Student.find(query).limit(50);
    } else {
      const query = {};
      if (department && department !== 'All') query.department = department;
      people = await Staff.find(query).limit(50);
    }

    if (!people.length) {
      return res.status(404).json({ success: false, message: `No active ${personType.toLowerCase()}s found matching selection.` });
    }

    const generatedCards = [];
    for (const person of people) {
      try {
        const cardData = await buildPersonCardData({
          personType,
          personId: person._id,
          templateId: templateId || 'classic-band-indigo',
          validUntil,
          academicSession
        });

        let existing = await GeneratedIdCard.findOne({ personId: person._id, personType });
        if (existing) {
          Object.assign(existing, cardData);
          await existing.save();
          generatedCards.push(existing);
        } else {
          const created = await GeneratedIdCard.create(cardData);
          generatedCards.push(created);
        }
      } catch (err) {
        console.error(`Error generating ID for ${person._id}:`, err.message);
      }
    }

    res.json({
      success: true,
      message: `Bulk auto-generated ${generatedCards.length} ID cards successfully!`,
      count: generatedCards.length,
      data: generatedCards
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get all generated ID cards / archive
 * @route GET /api/id-cards/issued
 */
exports.getGeneratedCards = async (req, res) => {
  try {
    const { personType, status, search, className } = req.query;
    const filter = {};
    if (personType && personType !== 'All') filter.personType = personType;
    if (status && status !== 'All') filter.status = status;
    if (className && className !== 'All') filter.className = className;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { idNumber: { $regex: search, $options: 'i' } },
        { cardNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const cards = await GeneratedIdCard.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: cards.length, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Mark ID Card as printed
 * @route PUT /api/id-cards/issued/:id/print
 */
exports.markCardPrinted = async (req, res) => {
  try {
    const card = await GeneratedIdCard.findByIdAndUpdate(
      req.params.id,
      { status: 'Printed', printedAt: new Date() },
      { new: true }
    );
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete generated card
 * @route DELETE /api/id-cards/issued/:id
 */
exports.deleteGeneratedCard = async (req, res) => {
  try {
    const card = await GeneratedIdCard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    res.json({ success: true, message: 'Generated card deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get ID Card statistics
 * @route GET /api/id-cards/stats
 */
exports.getIdCardStats = async (req, res) => {
  try {
    const totalIssued = await GeneratedIdCard.countDocuments();
    const studentCards = await GeneratedIdCard.countDocuments({ personType: 'Student' });
    const staffCards = await GeneratedIdCard.countDocuments({ personType: 'Staff' });
    const printedCards = await GeneratedIdCard.countDocuments({ status: 'Printed' });
    const activeTemplates = await IdCardTemplate.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        totalIssued,
        studentCards,
        staffCards,
        printedCards,
        activeTemplates
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
