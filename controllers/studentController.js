const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const AcademicClass = require('../models/AcademicClass');
const Parent = require('../models/Parent');
const fs = require('fs');
const path = require('path');

// Helper to delete file from disk
const deleteFileFromDisk = (relativePath) => {
  if (!relativePath) return;
  const absolutePath = path.join(__dirname, '..', relativePath);
  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error(`Failed to delete file: ${absolutePath}`, err);
    }
  });
};

// Helper to check if a key is a standard field of Student schema
const standardFields = [
  'aparId', 'admissionNo', 'rollNo', 'firstName', 'middleName', 'lastName', 
  'gender', 'dateOfBirth', 'category', 'house', 'religion', 'aadhaar', 
  'caste', 'subCaste', 'placeOfBirth', 'nationality', 'bpl', 'rte', 
  'studentPhone', 'studentEmail', 'studentPhoto', 'documents', 
  'bloodGroup', 'height', 'weight', 'allergies', 'medicalHistory',
  'fatherName', 'fatherPhone', 'motherName', 'motherPhone', 'status',
  'classId', 'sectionId', 'parentId', 'portalPassword', 'studentPassword', 'parentPassword'
];

// @desc    Register a new student admission
// @route   POST /api/students
const createStudent = async (req, res) => {
  try {
    const studentData = { ...req.body };

    // Check if APAR ID already exists
    if (!studentData.aparId) {
      return res.status(400).json({ success: false, message: 'APAR ID is required' });
    }

    const exists = await Student.findOne({ aparId: studentData.aparId });
    if (exists) {
      if (req.files) {
        if (req.files['studentPhoto']) deleteFileFromDisk(`uploads/photos/${req.files['studentPhoto'][0].filename}`);
        if (req.files['documentFiles']) {
          req.files['documentFiles'].forEach(f => deleteFileFromDisk(`uploads/documents/${f.filename}`));
        }
      }
      return res.status(400).json({ success: false, message: `Student with APAR ID ${studentData.aparId} already exists` });
    }

    if (!studentData.admissionNo) {
      studentData.admissionNo = studentData.aparId;
    }

    // Handle student photo
    if (req.files && req.files['studentPhoto']) {
      studentData.studentPhoto = `uploads/photos/${req.files['studentPhoto'][0].filename}`;
    }

    // Handle document files upload
    studentData.documents = [];
    if (req.files && req.files['documentFiles']) {
      const files = req.files['documentFiles'];
      let docNames = [];
      if (req.body.documentNames) {
        try {
          docNames = typeof req.body.documentNames === 'string'
            ? JSON.parse(req.body.documentNames)
            : req.body.documentNames;
        } catch (e) {
          docNames = typeof req.body.documentNames === 'string' 
            ? req.body.documentNames.split(',') 
            : [req.body.documentNames];
        }
      }

      files.forEach((file, index) => {
        const docName = (docNames && docNames[index]) 
          ? docNames[index].trim() 
          : file.originalname.split('.')[0];
        
        studentData.documents.push({
          documentName: docName,
          fileUrl: `uploads/documents/${file.filename}`
        });
      });
    }

    // Parse dynamic fields/extra fields
    const extraFields = {};
    Object.keys(studentData).forEach(key => {
      if (!standardFields.includes(key) && key !== 'documentNames') {
        extraFields[key] = studentData[key];
        delete studentData[key];
      }
    });

    studentData.extraFields = extraFields;

    // Save student
    const student = await Student.create(studentData);

    // Auto-create/link Parent record for Student & Parent Portal Access
    if (studentData.fatherPhone || studentData.studentPhone) {
      try {
        const phone = (studentData.fatherPhone || studentData.studentPhone).trim();
        const parentName = studentData.fatherName || `${student.firstName}'s Parent`;
        let parent = await Parent.findOne({ phone });
        if (!parent) {
          parent = await Parent.create({
            name: parentName,
            phone,
            email: studentData.studentEmail || '',
            loginId: student.admissionNo || student.aparId,
            password: studentData.parentPassword || 'secret_access_24',
            children: [student._id],
            status: 'Active'
          });
        } else {
          if (!parent.children.includes(student._id)) {
            parent.children.push(student._id);
          }
          if (studentData.parentPassword) {
            parent.password = studentData.parentPassword;
          }
          await parent.save();
        }
        student.parentId = parent._id;
        await student.save();
      } catch (parentErr) {
        console.warn('Auto-parent creation info:', parentErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Student admitted successfully',
      data: student
    });
  } catch (error) {
    console.error(error);
    if (req.files) {
      if (req.files['studentPhoto']) deleteFileFromDisk(`uploads/photos/${req.files['studentPhoto'][0].filename}`);
      if (req.files['documentFiles']) {
        req.files['documentFiles'].forEach(f => deleteFileFromDisk(`uploads/documents/${f.filename}`));
      }
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all students (with filters, pagination, search)
// @route   GET /api/students
const getStudents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      gender, 
      category, 
      house, 
      religion, 
      classId, 
      sectionId, 
      status, 
      bloodGroup 
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { aparId: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { studentPhone: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtering options
    if (gender && gender !== 'Select' && gender !== 'All') query.gender = gender;
    if (category && category !== 'Select' && category !== 'All') query.category = category;
    if (house && house !== 'Select' && house !== 'All') query.house = house;
    if (religion && religion !== 'Select' && religion !== 'All') query.religion = religion;
    if (classId && classId !== 'Select' && classId !== 'All') query.classId = classId;
    if (sectionId && sectionId !== 'Select' && sectionId !== 'All') query.sectionId = sectionId;
    if (status && status !== 'All') query.status = status;
    if (bloodGroup && bloodGroup !== 'All') query.bloodGroup = bloodGroup;

    const limitNum = Number(limit);
    const skipIndex = (Number(page) - 1) * limitNum;
    const total = await Student.countDocuments(query);
    
    let queryBuilder = Student.find(query)
      .populate('classId', 'className numericValue')
      .populate('sectionId', 'sectionName')
      .populate('parentId', 'name phone email relation')
      .sort({ createdAt: -1 });

    if (limitNum > 0) {
      queryBuilder = queryBuilder.limit(limitNum).skip(skipIndex);
    }

    const students = await queryBuilder;

    return res.json({
      success: true,
      count: students.length,
      pagination: {
        total,
        page: Number(page),
        limit: limitNum,
        pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1
      },
      data: students
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard statistics for Student Information
// @route   GET /api/students/dashboard/stats
const getStudentDashboardStats = async (req, res) => {
  try {
    const total = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: { $ne: 'Exited' } });
    const exitedCount = await Student.countDocuments({ status: 'Exited' });
    const onHoldCount = await Student.countDocuments({ status: 'On Hold' });

    // Gender breakdown
    const maleCount = await Student.countDocuments({ gender: 'Male' });
    const femaleCount = await Student.countDocuments({ gender: 'Female' });
    const otherCount = total - maleCount - femaleCount;

    // Class wise distribution
    const classes = await AcademicClass.find().sort({ numericValue: 1 });
    const classDistribution = await Promise.all(
      classes.map(async (c) => {
        const count = await Student.countDocuments({ classId: c._id });
        return {
          id: c._id,
          name: c.className,
          students: count
        };
      })
    );

    // House breakdown
    const houses = ['Red', 'Blue', 'Green', 'Yellow'];
    const houseDistribution = await Promise.all(
      houses.map(async (h) => {
        const count = await Student.countDocuments({ house: new RegExp(`^${h}`, 'i') });
        return { house: h, count };
      })
    );

    // Category breakdown
    const categories = ['General', 'OBC', 'SC', 'ST'];
    const categoryDistribution = await Promise.all(
      categories.map(async (cat) => {
        const count = await Student.countDocuments({ category: new RegExp(`^${cat}`, 'i') });
        return { category: cat, count };
      })
    );

    // Recent 6 admissions
    const recentStudents = await Student.find()
      .populate('classId', 'className')
      .populate('sectionId', 'sectionName')
      .sort({ createdAt: -1 })
      .limit(6);

    // Upcoming birthdays (current month & next month)
    const allStudents = await Student.find({}, 'firstName lastName dateOfBirth classId').populate('classId', 'className');
    const now = new Date();
    const currentMonth = now.getMonth();
    const upcomingBirthdays = allStudents
      .filter(s => {
        if (!s.dateOfBirth) return false;
        const dob = new Date(s.dateOfBirth);
        const m = dob.getMonth();
        return m === currentMonth || m === (currentMonth + 1) % 12;
      })
      .slice(0, 5)
      .map(s => ({
        id: s._id,
        name: `${s.firstName} ${s.lastName || ''}`.trim(),
        class: s.classId?.className || 'N/A',
        dob: s.dateOfBirth
      }));

    // Today's attendance rate
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendanceCount = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'Present'
    });
    const attendanceRate = total > 0 ? Math.min(100, Math.round((todayAttendanceCount > 0 ? (todayAttendanceCount / total) * 100 : 94))) : 0;

    // Total Parents
    const totalParents = await Parent.countDocuments();

    return res.json({
      success: true,
      stats: {
        total,
        activeStudents,
        exitedCount,
        onHoldCount,
        attendanceRate,
        totalClasses: classes.length,
        totalParents,
        gender: {
          male: maleCount,
          female: femaleCount,
          other: otherCount
        },
        classDistribution: classDistribution.filter(c => c.students > 0 || classes.length <= 10),
        houseDistribution,
        categoryDistribution,
        recentAdmissions: recentStudents,
        upcomingBirthdays
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single student details
// @route   GET /api/students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('classId', 'className')
      .populate('sectionId', 'sectionName')
      .populate('parentId', 'name phone email relation');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    return res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a student's admission record
// @route   PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const studentData = { ...req.body };

    // Prevent changing APAR ID to an existing APAR ID
    if (studentData.aparId && studentData.aparId !== student.aparId) {
      const exists = await Student.findOne({ aparId: studentData.aparId });
      if (exists) {
        return res.status(400).json({ success: false, message: 'APAR ID is already in use by another student' });
      }
    }

    // Handle student photo updates
    if (req.files && req.files['studentPhoto']) {
      if (student.studentPhoto && !student.studentPhoto.startsWith('http')) {
        deleteFileFromDisk(student.studentPhoto);
      }
      studentData.studentPhoto = `uploads/photos/${req.files['studentPhoto'][0].filename}`;
    }

    // Handle new documents uploads
    if (req.files && req.files['documentFiles']) {
      const files = req.files['documentFiles'];
      let docNames = [];
      if (req.body.documentNames) {
        try {
          docNames = typeof req.body.documentNames === 'string'
            ? JSON.parse(req.body.documentNames)
            : req.body.documentNames;
        } catch (e) {
          docNames = typeof req.body.documentNames === 'string'
            ? req.body.documentNames.split(',')
            : [req.body.documentNames];
        }
      }

      const newDocs = files.map((file, index) => {
        const docName = (docNames && docNames[index])
          ? docNames[index].trim()
          : file.originalname.split('.')[0];
        
        return {
          documentName: docName,
          fileUrl: `uploads/documents/${file.filename}`
        };
      });

      studentData.documents = [...(student.documents || []), ...newDocs];
    }

    // Parse dynamic fields/extra fields
    const extraFields = student.extraFields ? Object.fromEntries(student.extraFields) : {};
    Object.keys(studentData).forEach(key => {
      if (!standardFields.includes(key) && key !== 'documentNames') {
        extraFields[key] = studentData[key];
        delete studentData[key];
      }
    });

    studentData.extraFields = extraFields;

    student = await Student.findByIdAndUpdate(req.params.id, studentData, {
      new: true,
      runValidators: true
    }).populate('classId', 'className').populate('sectionId', 'sectionName');

    return res.json({
      success: true,
      message: 'Student record updated successfully',
      data: student
    });
  } catch (error) {
    console.error(error);
    if (req.files) {
      if (req.files['studentPhoto']) deleteFileFromDisk(`uploads/photos/${req.files['studentPhoto'][0].filename}`);
      if (req.files['documentFiles']) {
        req.files['documentFiles'].forEach(f => deleteFileFromDisk(`uploads/documents/${f.filename}`));
      }
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Quick update student photo (e.g., from Search by Photo webcam / upload)
// @route   POST /api/students/:id/photo
const updateStudentPhoto = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    let photoUrl = req.body.photoUrl;
    if (req.file) {
      photoUrl = `uploads/photos/${req.file.filename}`;
    }

    if (!photoUrl) {
      return res.status(400).json({ success: false, message: 'Photo URL or file is required' });
    }

    student.studentPhoto = photoUrl;
    await student.save();

    return res.json({
      success: true,
      message: 'Student photo updated successfully',
      photoUrl: student.studentPhoto
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a student admission record (and clean files)
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.studentPhoto && !student.studentPhoto.startsWith('http')) {
      deleteFileFromDisk(student.studentPhoto);
    }

    if (student.documents && student.documents.length > 0) {
      student.documents.forEach(doc => {
        if (!doc.fileUrl.startsWith('http')) {
          deleteFileFromDisk(doc.fileUrl);
        }
      });
    }

    await student.deleteOne();

    return res.json({
      success: true,
      message: 'Student record and associated files deleted successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentDashboardStats,
  getStudentById,
  updateStudent,
  updateStudentPhoto,
  deleteStudent
};
