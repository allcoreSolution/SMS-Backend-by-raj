const mongoose = require('mongoose');
const StudentHealthRecord = require('../models/StudentHealthRecord');
const Student = require('../models/Student');
const StaffHealthRecord = require('../models/StaffHealthRecord');

// Helper to resolve or seed StaffHealthRecord for teacher / staff
const resolveStaffHealthDoc = async (req) => {
  const userId = req.body?.userId || req.query?.userId || req.user?._id;
  const staffId = req.body?.staffId || req.query?.staffId;
  const email = req.body?.email || req.query?.email || req.user?.email;

  let query = [];
  if (email) query.push({ email: email.toLowerCase() });
  if (userId && mongoose.Types.ObjectId.isValid(userId)) query.push({ userId });
  if (staffId && mongoose.Types.ObjectId.isValid(staffId)) query.push({ staffId });

  let doc = null;
  if (query.length > 0) {
    doc = await StaffHealthRecord.findOne({ $or: query });
  }

  if (!doc) {
    doc = await StaffHealthRecord.findOne();
  }

  if (!doc) {
    doc = await StaffHealthRecord.create({
      userId: userId && mongoose.Types.ObjectId.isValid(userId) ? userId : null,
      staffId: staffId && mongoose.Types.ObjectId.isValid(staffId) ? staffId : null,
      email: email ? email.toLowerCase() : (req.user?.email || ''),
      fullName: req.user?.name || req.body?.fullName || 'Faculty Member',
      records: [],
      vaccinations: [],
      medications: [],
      medicalProfile: {
        bloodGroup: '',
        allergies: 'None',
        chronicConditions: 'None',
        surgeries: 'None',
        disability: 'None',
        insurance: ''
      },
      emergencyContacts: []
    });
  }

  return doc;
};

// ==========================================
// STAFF / TEACHER HEALTH RECORD ENDPOINTS
// ==========================================

// @desc    Get staff health records & profile
// @route   GET /api/health/my-records
exports.getMyStaffHealthRecord = async (req, res) => {
  try {
    const doc = await resolveStaffHealthDoc(req);

    // Format records for frontend consumption
    const formattedRecords = doc.records.map(r => ({
      id: r._id,
      _id: r._id,
      date: r.date,
      type: r.type,
      doctor: r.doctor,
      hospital: r.hospital,
      bp: r.bp || '—',
      weight: r.weight || '—',
      temp: r.temp || '—',
      sugar: r.sugar || '—',
      notes: r.notes || '',
      status: r.status || 'Normal',
      createdAt: r.createdAt
    }));

    // Calculate latest vitals from records or defaults
    const latestWithBp = formattedRecords.find(r => r.bp && r.bp !== '—');
    const latestWithSugar = formattedRecords.find(r => r.sugar && r.sugar !== '—');
    const latestWithWeight = formattedRecords.find(r => r.weight && r.weight !== '—');
    const latestWithTemp = formattedRecords.find(r => r.temp && r.temp !== '—');

    const vitals = [
      {
        label: 'Blood Pressure',
        value: latestWithBp?.bp || '120/80',
        unit: 'mmHg',
        color: 'text-red-500 bg-red-50',
        ideal: 'Normal (< 120/80)'
      },
      {
        label: 'Blood Sugar',
        value: latestWithSugar?.sugar || '95',
        unit: 'mg/dL',
        color: 'text-blue-500 bg-blue-50',
        ideal: 'Normal (70–99)'
      },
      {
        label: 'Weight',
        value: latestWithWeight?.weight || '72',
        unit: 'kg',
        color: 'text-indigo-500 bg-indigo-50',
        ideal: 'BMI: 22.4 (Healthy)'
      },
      {
        label: 'Temperature',
        value: latestWithTemp?.temp || '98.6',
        unit: '°F',
        color: 'text-orange-500 bg-orange-50',
        ideal: 'Normal (97–99°F)'
      }
    ];

    return res.status(200).json({
      success: true,
      data: {
        _id: doc._id,
        records: formattedRecords,
        vitals,
        vaccinations: doc.vaccinations.map(v => ({
          id: v._id,
          _id: v._id,
          name: v.name,
          date: v.date,
          due: v.due || '—',
          status: v.status
        })),
        medications: doc.medications.map(m => ({
          id: m._id,
          _id: m._id,
          name: m.name,
          dosage: m.dosage,
          since: m.since,
          until: m.until
        })),
        medicalProfile: doc.medicalProfile || {
          bloodGroup: 'B+',
          allergies: 'None',
          chronicConditions: 'None',
          surgeries: 'None',
          disability: 'None',
          insurance: 'Star Health — #SH-20261234'
        },
        emergencyContacts: doc.emergencyContacts.map(c => ({
          id: c._id,
          _id: c._id,
          name: c.name,
          rel: c.rel,
          phone: c.phone,
          address: c.address
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching staff health records:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a medical visit record
// @route   POST /api/health/records
exports.createVisitRecord = async (req, res) => {
  try {
    const doc = await resolveStaffHealthDoc(req);
    const { date, type, doctor, hospital, bp, weight, temp, sugar, notes, status } = req.body;

    if (!date || !type) {
      return res.status(400).json({ success: false, message: 'Date and Visit Type are required' });
    }

    const newRecord = {
      date,
      type,
      doctor: doctor || 'Dr. Medical Officer',
      hospital: hospital || 'City Clinic',
      bp: bp || '—',
      weight: weight || '—',
      temp: temp || '—',
      sugar: sugar || '—',
      notes: notes || '',
      status: status || 'Normal'
    };

    doc.records.unshift(newRecord);
    await doc.save();

    const savedRecord = doc.records[0];

    return res.status(201).json({
      success: true,
      message: 'Medical visit record added successfully',
      data: {
        id: savedRecord._id,
        _id: savedRecord._id,
        ...savedRecord.toObject()
      }
    });
  } catch (error) {
    console.error('Error adding medical record:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a medical visit record
// @route   PUT /api/health/records/:id
exports.updateVisitRecord = async (req, res) => {
  try {
    const doc = await resolveStaffHealthDoc(req);
    const recordId = req.params.id;

    const record = doc.records.id(recordId);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const { date, type, doctor, hospital, bp, weight, temp, sugar, notes, status } = req.body;
    if (date !== undefined) record.date = date;
    if (type !== undefined) record.type = type;
    if (doctor !== undefined) record.doctor = doctor;
    if (hospital !== undefined) record.hospital = hospital;
    if (bp !== undefined) record.bp = bp;
    if (weight !== undefined) record.weight = weight;
    if (temp !== undefined) record.temp = temp;
    if (sugar !== undefined) record.sugar = sugar;
    if (notes !== undefined) record.notes = notes;
    if (status !== undefined) record.status = status;

    await doc.save();

    return res.status(200).json({
      success: true,
      message: 'Medical visit record updated successfully',
      data: {
        id: record._id,
        _id: record._id,
        ...record.toObject()
      }
    });
  } catch (error) {
    console.error('Error updating medical record:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a medical visit record
// @route   DELETE /api/health/records/:id
exports.deleteVisitRecord = async (req, res) => {
  try {
    const doc = await resolveStaffHealthDoc(req);
    const recordId = req.params.id;

    const record = doc.records.id(recordId);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    doc.records.pull(recordId);
    await doc.save();

    return res.status(200).json({
      success: true,
      message: 'Medical visit record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add vaccination
// @route   POST /api/health/vaccinations
exports.addVaccination = async (req, res) => {
  try {
    const doc = await resolveStaffHealthDoc(req);
    const { name, date, due, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Vaccine name is required' });
    }

    const newVac = {
      name,
      date: date || new Date().toISOString().split('T')[0],
      due: due || '—',
      status: status || 'Done'
    };

    doc.vaccinations.push(newVac);
    await doc.save();

    const createdVac = doc.vaccinations[doc.vaccinations.length - 1];
    return res.status(201).json({
      success: true,
      message: 'Vaccination record added successfully',
      data: {
        id: createdVac._id,
        _id: createdVac._id,
        ...createdVac.toObject()
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update vaccination
// @route   PUT /api/health/vaccinations/:id
exports.updateVaccination = async (req, res) => {
  try {
    const doc = await resolveStaffHealthDoc(req);
    const vac = doc.vaccinations.id(req.params.id);
    if (!vac) {
      return res.status(404).json({ success: false, message: 'Vaccination record not found' });
    }

    const { name, date, due, status } = req.body;
    if (name !== undefined) vac.name = name;
    if (date !== undefined) vac.date = date;
    if (due !== undefined) vac.due = due;
    if (status !== undefined) vac.status = status;

    await doc.save();
    return res.status(200).json({
      success: true,
      message: 'Vaccination updated successfully',
      data: {
        id: vac._id,
        _id: vac._id,
        ...vac.toObject()
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete vaccination
// @route   DELETE /api/health/vaccinations/:id
exports.deleteVaccination = async (req, res) => {
  try {
    const doc = await resolveStaffHealthDoc(req);
    const vac = doc.vaccinations.id(req.params.id);
    if (!vac) {
      return res.status(404).json({ success: false, message: 'Vaccination not found' });
    }

    doc.vaccinations.pull(req.params.id);
    await doc.save();
    return res.status(200).json({ success: true, message: 'Vaccination removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add medication
// @route   POST /api/health/medications
exports.addMedication = async (req, res) => {
  try {
    const doc = await resolveStaffHealthDoc(req);
    const { name, dosage, since, until } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Medication name is required' });
    }

    const newMed = {
      name,
      dosage: dosage || '1 tablet daily',
      since: since || 'Today',
      until: until || 'Ongoing'
    };

    doc.medications.push(newMed);
    await doc.save();

    const createdMed = doc.medications[doc.medications.length - 1];
    return res.status(201).json({
      success: true,
      message: 'Medication added successfully',
      data: {
        id: createdMed._id,
        _id: createdMed._id,
        ...createdMed.toObject()
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update medication
// @route   PUT /api/health/medications/:id
exports.updateMedication = async (req, res) => {
  try {
    const doc = await resolveStaffHealthDoc(req);
    const med = doc.medications.id(req.params.id);
    if (!med) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }

    const { name, dosage, since, until } = req.body;
    if (name !== undefined) med.name = name;
    if (dosage !== undefined) med.dosage = dosage;
    if (since !== undefined) med.since = since;
    if (until !== undefined) med.until = until;

    await doc.save();
    return res.status(200).json({
      success: true,
      message: 'Medication updated successfully',
      data: {
        id: med._id,
        _id: med._id,
        ...med.toObject()
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete medication
// @route   DELETE /api/health/medications/:id
exports.deleteMedication = async (req, res) => {
  try {
    const doc = await resolveStaffHealthDoc(req);
    const med = doc.medications.id(req.params.id);
    if (!med) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }

    doc.medications.pull(req.params.id);
    await doc.save();
    return res.status(200).json({ success: true, message: 'Medication removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Medical Profile
// @route   PUT /api/health/medical-profile
exports.updateMedicalProfile = async (req, res) => {
  try {
    const doc = await resolveStaffHealthDoc(req);
    const { bloodGroup, allergies, chronicConditions, surgeries, disability, insurance } = req.body;

    if (!doc.medicalProfile) {
      doc.medicalProfile = {};
    }

    if (bloodGroup !== undefined) doc.medicalProfile.bloodGroup = bloodGroup;
    if (allergies !== undefined) doc.medicalProfile.allergies = allergies;
    if (chronicConditions !== undefined) doc.medicalProfile.chronicConditions = chronicConditions;
    if (surgeries !== undefined) doc.medicalProfile.surgeries = surgeries;
    if (disability !== undefined) doc.medicalProfile.disability = disability;
    if (insurance !== undefined) doc.medicalProfile.insurance = insurance;

    await doc.save();
    return res.status(200).json({
      success: true,
      message: 'Medical profile updated successfully',
      data: doc.medicalProfile
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Emergency Contact
// @route   POST /api/health/emergency-contacts
exports.addEmergencyContact = async (req, res) => {
  try {
    const doc = await resolveStaffHealthDoc(req);
    const { name, rel, phone, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone number are required' });
    }

    const newContact = {
      name,
      rel: rel || 'Family',
      phone,
      address: address || ''
    };

    doc.emergencyContacts.push(newContact);
    await doc.save();

    const createdContact = doc.emergencyContacts[doc.emergencyContacts.length - 1];
    return res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      data: {
        id: createdContact._id,
        _id: createdContact._id,
        ...createdContact.toObject()
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Emergency Contact
// @route   PUT /api/health/emergency-contacts/:id
exports.updateEmergencyContact = async (req, res) => {
  try {
    const doc = await resolveStaffHealthDoc(req);
    const contact = doc.emergencyContacts.id(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    const { name, rel, phone, address } = req.body;
    if (name !== undefined) contact.name = name;
    if (rel !== undefined) contact.rel = rel;
    if (phone !== undefined) contact.phone = phone;
    if (address !== undefined) contact.address = address;

    await doc.save();
    return res.status(200).json({
      success: true,
      message: 'Emergency contact updated successfully',
      data: {
        id: contact._id,
        _id: contact._id,
        ...contact.toObject()
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Emergency Contact
// @route   DELETE /api/health/emergency-contacts/:id
exports.deleteEmergencyContact = async (req, res) => {
  try {
    const doc = await resolveStaffHealthDoc(req);
    const contact = doc.emergencyContacts.id(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    doc.emergencyContacts.pull(req.params.id);
    await doc.save();
    return res.status(200).json({ success: true, message: 'Emergency contact removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// STUDENT HEALTH RECORD ENDPOINTS (LEGACY)
// ==========================================

// @desc    Get all student health records
// @route   GET /api/health
exports.getHealthRecords = async (req, res) => {
  try {
    const { search, bloodGroup } = req.query;

    const students = await Student.find()
      .populate('classId', 'className')
      .populate('sectionId', 'sectionName')
      .sort({ createdAt: -1 });

    const healthList = await Promise.all(
      students.map(async (student) => {
        const latestCheckup = await StudentHealthRecord.findOne({ studentId: student._id })
          .sort({ checkupDate: -1 });

        return {
          id: student._id,
          studentId: student._id,
          roll: student.rollNo || '-',
          name: `${student.firstName} ${student.lastName || ''}`.trim(),
          aparId: student.aparId,
          admNo: student.admissionNo || student.aparId,
          class: student.classId ? `${student.classId.className || ''} - ${student.sectionId?.sectionName || 'A'}` : 'N/A',
          bloodGroup: latestCheckup?.bloodGroup || student.bloodGroup || 'Unknown',
          height: latestCheckup?.height || student.height || null,
          weight: latestCheckup?.weight || student.weight || null,
          allergies: latestCheckup?.allergies || student.allergies || 'None',
          checkup: latestCheckup ? new Date(latestCheckup.checkupDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No Records',
          visionLeft: latestCheckup?.visionLeft || '6/6',
          visionRight: latestCheckup?.visionRight || '6/6',
          dentalNotes: latestCheckup?.dentalNotes || 'Normal',
          doctorName: latestCheckup?.doctorName || 'School Doctor',
          remarks: latestCheckup?.remarks || 'Fit',
          avatar: student.studentPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.firstName + ' ' + (student.lastName || ''))}&background=EEEDFF&color=5F52FF`
        };
      })
    );

    let filtered = healthList;
    if (search) {
      filtered = filtered.filter(h => 
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.admNo.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (bloodGroup && bloodGroup !== 'All') {
      filtered = filtered.filter(h => h.bloodGroup === bloodGroup);
    }

    return res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single student health profile
// @route   GET /api/health/:id
exports.getStudentHealth = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('classId', 'className')
      .populate('sectionId', 'sectionName');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const records = await StudentHealthRecord.find({ studentId: student._id })
      .sort({ checkupDate: -1 });

    return res.json({
      success: true,
      student,
      records
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upsert health record for a student
// @route   POST /api/health
exports.updateHealthRecord = async (req, res) => {
  try {
    const { studentId, bloodGroup, height, weight, allergies, dentalNotes, visionLeft, visionRight, doctorName, remarks } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const record = await StudentHealthRecord.create({
      studentId,
      bloodGroup: bloodGroup || 'Unknown',
      height: height ? Number(height) : null,
      weight: weight ? Number(weight) : null,
      allergies: allergies || 'None',
      dentalNotes: dentalNotes || 'Normal',
      visionLeft: visionLeft || '6/6',
      visionRight: visionRight || '6/6',
      doctorName: doctorName || 'School Medical Officer',
      remarks: remarks || 'Healthy & Fit',
      checkupDate: new Date()
    });

    await Student.findByIdAndUpdate(studentId, {
      bloodGroup: bloodGroup || undefined,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      allergies: allergies || undefined
    });

    return res.json({
      success: true,
      message: 'Health record saved successfully',
      data: record
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete student health record
// @route   DELETE /api/health/:id
exports.deleteHealthRecord = async (req, res) => {
  try {
    const record = await StudentHealthRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    await record.deleteOne();
    return res.json({ success: true, message: 'Health record deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
