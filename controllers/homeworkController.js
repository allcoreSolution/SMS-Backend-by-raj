const Homework = require('../models/Homework');
const AcademicClass = require('../models/AcademicClass');
const AcademicSection = require('../models/AcademicSection');
const AcademicSubject = require('../models/AcademicSubject');
const Staff = require('../models/Staff');
const Student = require('../models/Student');
const fs = require('fs');
const path = require('path');

const deleteFileFromDisk = (relativePath) => {
  if (!relativePath) return;
  const absolutePath = path.join(__dirname, '..', relativePath);
  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== 'ENOENT') console.error(`Failed to delete file: ${absolutePath}`, err);
  });
};

// Seed realistic homework assignments if collection is empty
const seedDefaultHomework = async () => {
  try {
    const cls = await AcademicClass.findOne({ className: 'Class I' }) || await AcademicClass.findOne();
    const sec = await AcademicSection.findOne({ sectionName: 'A' }) || await AcademicSection.findOne();
    const subs = await AcademicSubject.find();
    const teachers = await Staff.find().limit(3);
    const aarav = await Student.findOne({ firstName: 'Aarav' });

    if (!cls || !sec || !subs || subs.length === 0) return;

    const mathSub = subs.find(s => s.subjectName === 'Mathematics') || subs[0];
    const sciSub = subs.find(s => s.subjectName === 'General Science') || subs[1] || subs[0];
    const engSub = subs.find(s => s.subjectName === 'English Literature') || subs[2] || subs[0];
    const hinSub = subs.find(s => s.subjectName === 'Hindi Language') || subs[3] || subs[0];
    const compSub = subs.find(s => s.subjectName === 'Computer Applications') || subs[4] || subs[0];

    const teacher1 = teachers[0]?._id;
    const teacher2 = teachers[1]?._id || teachers[0]?._id;

    const now = new Date();
    // Due dates in October 2026
    const tomorrow = new Date(2026, 9, 18, 17, 0, 0);
    const inTwoDays = new Date(2026, 9, 19, 17, 0, 0);
    const inThreeDays = new Date(2026, 9, 20, 17, 0, 0);
    const pastYesterday = new Date(2026, 9, 15, 17, 0, 0);
    const pastLastWeek = new Date(2026, 9, 10, 17, 0, 0);

    const assignments = [
      {
        title: 'Worksheet 4: 2-Digit Addition & Word Problems',
        description: 'Complete questions 1 to 15 from Math Workbook Page 42. Show all step-by-step carry overs clearly.',
        academicClass: cls._id,
        section: sec._id,
        subject: mathSub._id,
        assignedBy: teacher1,
        assignDate: new Date(2026, 9, 16),
        dueDate: tomorrow,
        maxMarks: 20,
        fileName: 'Math_Worksheet_Addition_Ch4.pdf',
        fileUrl: '/uploads/documents/sample_math_worksheet.pdf',
        status: 'Active',
        submissions: []
      },
      {
        title: 'Parts of Plants & Leaf Identification Activity',
        description: 'Draw and label a flowering plant with roots, stem, leaves, flower, and fruit. Write 2 sentences on photosynthesis.',
        academicClass: cls._id,
        section: sec._id,
        subject: sciSub._id,
        assignedBy: teacher2,
        assignDate: new Date(2026, 9, 16),
        dueDate: inTwoDays,
        maxMarks: 15,
        fileName: 'Science_Plant_Anatomy_Diagram.pdf',
        fileUrl: '/uploads/documents/sample_science_diagram.pdf',
        status: 'Active',
        submissions: []
      },
      {
        title: 'Reading Comprehension: The Brave Little Puppy',
        description: 'Read the short story in Reader Chapter 5. Answer short questions A to E in your English Four-line Notebook.',
        academicClass: cls._id,
        section: sec._id,
        subject: engSub._id,
        assignedBy: teacher1,
        assignDate: new Date(2026, 9, 17),
        dueDate: inThreeDays,
        maxMarks: 20,
        fileName: 'English_Story_Passage_Ch5.pdf',
        status: 'Active',
        submissions: []
      },
      {
        title: 'Computer Input & Output Devices Matching Chart',
        description: 'Match input devices (keyboard, mouse, mic) and output devices (monitor, printer, speaker) in computer practical sheet.',
        academicClass: cls._id,
        section: sec._id,
        subject: compSub._id,
        assignedBy: teacher2,
        assignDate: new Date(2026, 9, 14),
        dueDate: pastYesterday,
        maxMarks: 20,
        fileName: 'Computer_Hardware_Chart.pdf',
        status: 'Active',
        submissions: aarav ? [{
          student: aarav._id,
          studentName: `${aarav.firstName} ${aarav.lastName || ''}`.trim(),
          submittedAt: new Date(2026, 9, 15, 14, 30),
          submissionText: 'All matching lines drawn and devices labeled in worksheet.',
          status: 'Evaluated',
          evaluatedMarks: 19,
          teacherRemarks: 'Excellent neat work! Good classification of microphone and speaker.'
        }] : []
      },
      {
        title: 'Hindi Matra Abhyas & 5 Vakya Rachna',
        description: 'Aa (T) aur Ee (f) ki matra wale 5-5 shabdon se sundar vakya banayein aur likhein.',
        academicClass: cls._id,
        section: sec._id,
        subject: hinSub._id,
        assignedBy: teacher1,
        assignDate: new Date(2026, 9, 8),
        dueDate: pastLastWeek,
        maxMarks: 20,
        status: 'Closed',
        submissions: aarav ? [{
          student: aarav._id,
          studentName: `${aarav.firstName} ${aarav.lastName || ''}`.trim(),
          submittedAt: new Date(2026, 9, 9, 16, 0),
          submissionText: '5 vakya rachna poori ki gayi.',
          status: 'Evaluated',
          evaluatedMarks: 18,
          teacherRemarks: 'Shandaar lekh! Matraon ka sahi prayog.'
        }] : []
      }
    ];

    await Homework.insertMany(assignments);
    console.log('Seeded default homework assignments successfully.');
  } catch (err) {
    console.warn('Homework seeding error:', err.message);
  }
};

// GET Homework with student submission state
exports.getHomework = async (req, res, next) => {
  try {
    const count = await Homework.countDocuments();
    if (count === 0) {
      await seedDefaultHomework();
    }

    const { classId, sectionId, subjectId, studentId, status } = req.query;
    let query = {};
    if (classId) query.academicClass = classId;
    if (sectionId) query.section = sectionId;
    if (subjectId) query.subject = subjectId;
    if (status && status !== 'All') query.status = status;

    const homeworks = await Homework.find(query)
      .populate('subject', 'subjectName code')
      .populate('academicClass', 'className')
      .populate('section', 'sectionName')
      .populate('assignedBy', 'fullName firstName lastName')
      .sort({ dueDate: 1, createdAt: -1 });

    const data = homeworks.map(hw => {
      const hwObj = hw.toObject();
      let isSubmitted = false;
      let submission = null;

      if (studentId && hwObj.submissions) {
        submission = hwObj.submissions.find(s => {
          const sId = typeof s.student === 'object' ? s.student?._id : s.student;
          return sId && sId.toString() === studentId.toString();
        });

        if (submission) {
          isSubmitted = true;
        }
      }

      return {
        ...hwObj,
        isSubmitted,
        mySubmission: submission
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) { next(error); }
};

// SUBMIT Homework for a student
exports.submitHomework = async (req, res, next) => {
  try {
    const { homeworkId, studentId, studentName, submissionText, fileUrl } = req.body;
    if (!homeworkId || !studentId) {
      return res.status(400).json({ success: false, message: 'homeworkId and studentId are required' });
    }

    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    // Check if student already submitted
    const existingIndex = (homework.submissions || []).findIndex(s => {
      const sId = typeof s.student === 'object' ? s.student?._id : s.student;
      return sId && sId.toString() === studentId.toString();
    });

    const submissionPayload = {
      student: studentId,
      studentName: studentName || 'Student',
      submittedAt: new Date(),
      submissionText: submissionText || 'Worksheet answers submitted by student.',
      fileUrl: fileUrl || '',
      status: 'Submitted'
    };

    if (existingIndex > -1) {
      homework.submissions[existingIndex] = {
        ...homework.submissions[existingIndex].toObject(),
        ...submissionPayload
      };
    } else {
      homework.submissions.push(submissionPayload);
    }

    await homework.save();

    res.status(200).json({
      success: true,
      message: 'Homework submitted successfully! Marked for teacher review.',
      data: homework
    });
  } catch (error) { next(error); }
};

// ASSIGN / Create Homework (Teachers/Admin)
exports.assignHomework = async (req, res, next) => {
  try {
    const homeworkData = { ...req.body };
    if (req.file) {
      homeworkData.fileUrl = `/uploads/documents/${req.file.filename}`;
      homeworkData.fileName = req.file.originalname || req.file.filename;
    }

    const homework = await Homework.create(homeworkData);
    res.status(201).json({ success: true, data: homework });
  } catch (error) { 
    if (req.file) deleteFileFromDisk(`uploads/documents/${req.file.filename}`);
    next(error); 
  }
};

// DELETE Homework
exports.deleteHomework = async (req, res, next) => {
  try {
    const homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    if (homework.fileUrl && !homework.fileUrl.startsWith('http')) {
      deleteFileFromDisk(homework.fileUrl);
    }

    await homework.deleteOne();
    res.status(200).json({ success: true, message: 'Homework deleted successfully' });
  } catch(error) { next(error); }
};
