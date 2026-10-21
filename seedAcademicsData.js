const mongoose = require('mongoose');
const AcademicClass = require('./models/AcademicClass');
const AcademicSection = require('./models/AcademicSection');
const AcademicSubject = require('./models/AcademicSubject');
const AcademicSession = require('./models/AcademicSession');
const PeriodSet = require('./models/PeriodSet');
const Timetable = require('./models/Timetable');
const ClassTeacher = require('./models/ClassTeacher');
const Student = require('./models/Student');
const Staff = require('./models/Staff');
const Role = require('./models/Role');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';

async function seedAcademics() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Academics seeding...');

    // 1. Get or create Teacher Role
    let teacherRole = await Role.findOne({ name: 'Teacher' });
    if (!teacherRole) {
      teacherRole = await Role.create({
        name: 'Teacher',
        permissions: ['view_students', 'mark_attendance'],
        description: 'Academic teaching staff'
      });
      console.log('Created Teacher Role');
    }

    // 2. Seed Teachers into Staff
    const teachersData = [
      {
        fullName: 'Amit Sharma',
        email: 'amit.sharma@school.edu',
        role: teacherRole._id,
        staffId: 'STF-101',
        designation: 'Senior PGT Mathematics',
        department: 'Science & Math',
        gender: 'Male',
        phone: '9876543210',
        status: 'Active'
      },
      {
        fullName: 'Priya Singh',
        email: 'priya.singh@school.edu',
        role: teacherRole._id,
        staffId: 'STF-102',
        designation: 'TGT Science & Biology',
        department: 'Science',
        gender: 'Female',
        phone: '9876543211',
        status: 'Active'
      },
      {
        fullName: 'Rajesh Kumar',
        email: 'rajesh.kumar@school.edu',
        role: teacherRole._id,
        staffId: 'STF-103',
        designation: 'PGT English Literature',
        department: 'Languages',
        gender: 'Male',
        phone: '9876543212',
        status: 'Active'
      },
      {
        fullName: 'Sneha Desai',
        email: 'sneha.desai@school.edu',
        role: teacherRole._id,
        staffId: 'STF-104',
        designation: 'TGT Social Sciences',
        department: 'Humanities',
        gender: 'Female',
        phone: '9876543213',
        status: 'Active'
      },
      {
        fullName: 'Vikram Malhotra',
        email: 'vikram.malhotra@school.edu',
        role: teacherRole._id,
        staffId: 'STF-105',
        designation: 'Computer Science Faculty',
        department: 'Information Technology',
        gender: 'Male',
        phone: '9876543214',
        status: 'Active'
      },
      {
        fullName: 'Ananya Sen',
        email: 'ananya.sen@school.edu',
        role: teacherRole._id,
        staffId: 'STF-106',
        designation: 'Arts & Cultural Instructor',
        department: 'Creative Arts',
        gender: 'Female',
        phone: '9876543215',
        status: 'Active'
      }
    ];

    const staffDocs = [];
    for (const t of teachersData) {
      let doc = await Staff.findOne({ email: t.email });
      if (!doc) {
        doc = await Staff.create(t);
        console.log(`Created teacher: ${t.fullName}`);
      }
      staffDocs.push(doc);
    }

    // 3. Seed Academic Subjects
    const subjectsData = [
      { subjectName: 'Mathematics', subjectCode: 'MATH101', subjectType: 'both', isElective: false, creditHours: 5, status: 'active' },
      { subjectName: 'General Science', subjectCode: 'SCI102', subjectType: 'both', isElective: false, creditHours: 5, status: 'active' },
      { subjectName: 'English Literature', subjectCode: 'ENG103', subjectType: 'theory', isElective: false, creditHours: 4, status: 'active' },
      { subjectName: 'Hindi Language', subjectCode: 'HIN104', subjectType: 'theory', isElective: false, creditHours: 4, status: 'active' },
      { subjectName: 'Social Studies', subjectCode: 'SST105', subjectType: 'theory', isElective: false, creditHours: 4, status: 'active' },
      { subjectName: 'Computer Applications', subjectCode: 'CS106', subjectType: 'practical', isElective: false, creditHours: 3, status: 'active' },
      { subjectName: 'Physical & Health Education', subjectCode: 'PHE107', subjectType: 'practical', isElective: false, creditHours: 2, status: 'active' },
      { subjectName: 'Sanskrit Elective', subjectCode: 'SKT201', subjectType: 'theory', isElective: true, creditHours: 3, status: 'active' },
      { subjectName: 'French Language', subjectCode: 'FRN202', subjectType: 'theory', isElective: true, creditHours: 3, status: 'active' },
      { subjectName: 'Fine Arts & Music', subjectCode: 'ART203', subjectType: 'practical', isElective: true, creditHours: 2, status: 'active' }
    ];

    const subjectDocs = [];
    for (const s of subjectsData) {
      let doc = await AcademicSubject.findOne({ subjectCode: s.subjectCode });
      if (!doc) {
        doc = await AcademicSubject.create(s);
        console.log(`Created subject: ${s.subjectName}`);
      }
      subjectDocs.push(doc);
    }

    // 4. Seed Academic Sessions
    const sessionsData = [
      {
        name: '2024-2025',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        isCurrent: false,
        status: 'Archived',
        description: 'Academic year 2024-25 (Archived record)'
      },
      {
        name: '2025-2026',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2026-03-31'),
        isCurrent: false,
        status: 'Archived',
        description: 'Academic year 2025-26 (Completed)'
      },
      {
        name: '2026-2027',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        isCurrent: true,
        status: 'Current',
        description: 'Active ongoing academic session for 2026-27'
      },
      {
        name: '2027-2028',
        startDate: new Date('2027-04-01'),
        endDate: new Date('2028-03-31'),
        isCurrent: false,
        status: 'Upcoming',
        description: 'Upcoming academic year 2027-28 admissions'
      }
    ];

    let currentSessionDoc = null;
    for (const s of sessionsData) {
      let doc = await AcademicSession.findOne({ name: s.name });
      if (!doc) {
        doc = await AcademicSession.create(s);
        console.log(`Created session: ${s.name}`);
      } else {
        doc.isCurrent = s.isCurrent;
        doc.status = s.status;
        await doc.save();
      }
      if (s.isCurrent) currentSessionDoc = doc;
    }

    // 5. Link core subjects to all classes
    const classes = await AcademicClass.find();
    const coreSubjectIds = subjectDocs.filter(s => !s.isElective).map(s => s._id);

    for (let i = 0; i < classes.length; i++) {
      const cls = classes[i];
      cls.assignedSubjects = coreSubjectIds;
      // Assign a coordinator
      const teacher = staffDocs[i % staffDocs.length];
      cls.classTeacher = teacher._id;
      await cls.save();
    }
    console.log(`Assigned core subjects and coordinators to ${classes.length} classes`);

    // 6. Seed Class Teachers for Sections
    const sections = await AcademicSection.find();
    for (let cIdx = 0; cIdx < classes.length; cIdx++) {
      for (let sIdx = 0; sIdx < sections.length; sIdx++) {
        const assignedTeacher = staffDocs[(cIdx + sIdx) % staffDocs.length];
        await ClassTeacher.findOneAndUpdate(
          { classId: classes[cIdx]._id, sectionId: sections[sIdx]._id },
          {
            teacherId: assignedTeacher._id,
            academicSessionId: currentSessionDoc?._id,
            status: 'active'
          },
          { upsert: true }
        );
      }
    }
    console.log('Seeded Class Teacher assignments for class-section pairs');

    // 7. Seed Period Set
    const periodSetExisting = await PeriodSet.findOne({ name: 'Standard Daily Schedule' });
    let periodSetDoc = periodSetExisting;
    if (!periodSetExisting) {
      periodSetDoc = await PeriodSet.create({
        name: 'Standard Daily Schedule',
        isDefault: true,
        periods: [
          { periodNumber: 1, name: 'Morning Assembly', startTime: '08:00 AM', endTime: '08:20 AM', type: 'Assembly' },
          { periodNumber: 2, name: 'Period 1', startTime: '08:20 AM', endTime: '09:05 AM', type: 'Teaching' },
          { periodNumber: 3, name: 'Period 2', startTime: '09:05 AM', endTime: '09:50 AM', type: 'Teaching' },
          { periodNumber: 4, name: 'Period 3', startTime: '09:50 AM', endTime: '10:35 AM', type: 'Teaching' },
          { periodNumber: 5, name: 'Mid-Morning Break', startTime: '10:35 AM', endTime: '10:50 AM', type: 'Break' },
          { periodNumber: 6, name: 'Period 4', startTime: '10:50 AM', endTime: '11:35 AM', type: 'Teaching' },
          { periodNumber: 7, name: 'Period 5', startTime: '11:35 AM', endTime: '12:20 PM', type: 'Teaching' },
          { periodNumber: 8, name: 'Lunch Break', startTime: '12:20 PM', endTime: '12:50 PM', type: 'Break' },
          { periodNumber: 9, name: 'Period 6', startTime: '12:50 PM', endTime: '01:35 PM', type: 'Teaching' },
          { periodNumber: 10, name: 'Period 7', startTime: '01:35 PM', endTime: '02:20 PM', type: 'Teaching' }
        ],
        assignedClasses: classes.map(c => c._id)
      });
      console.log('Created Standard Daily Schedule Period Set');
    }

    // 8. Seed Sample Timetable Slots for Class I Section A and Class X Section A
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sampleClasses = classes.slice(0, 2); // Class I and Class II

    for (const cls of sampleClasses) {
      for (const day of days) {
        // Teaching periods are 2, 3, 4, 6, 7, 9, 10
        const teachingPeriods = [
          { periodNumber: 2, name: 'Period 1', startTime: '08:20 AM', endTime: '09:05 AM' },
          { periodNumber: 3, name: 'Period 2', startTime: '09:05 AM', endTime: '09:50 AM' },
          { periodNumber: 4, name: 'Period 3', startTime: '09:50 AM', endTime: '10:35 AM' },
          { periodNumber: 6, name: 'Period 4', startTime: '10:50 AM', endTime: '11:35 AM' },
          { periodNumber: 7, name: 'Period 5', startTime: '11:35 AM', endTime: '12:20 PM' },
          { periodNumber: 9, name: 'Period 6', startTime: '12:50 PM', endTime: '01:35 PM' },
          { periodNumber: 10, name: 'Period 7', startTime: '01:35 PM', endTime: '02:20 PM' }
        ];

        for (let pIdx = 0; pIdx < teachingPeriods.length; pIdx++) {
          const p = teachingPeriods[pIdx];
          const sub = subjectDocs[pIdx % subjectDocs.length];
          const teacher = staffDocs[pIdx % staffDocs.length];

          await Timetable.findOneAndUpdate(
            {
              classId: cls._id,
              sectionId: sections[0]._id, // Section A
              day,
              periodNumber: p.periodNumber
            },
            {
              periodName: p.name,
              startTime: p.startTime,
              endTime: p.endTime,
              subjectId: sub._id,
              teacherId: teacher._id,
              roomNumber: `Room 10${(cls.numericValue || 1)}`
            },
            { upsert: true }
          );
        }
      }
    }
    console.log('Seeded sample timetable slots for classes');

    // 9. Update existing students to link them to current session and class
    if (currentSessionDoc) {
      await Student.updateMany(
        { academicSessionId: null },
        {
          $set: {
            academicSessionId: currentSessionDoc._id,
            classId: classes[0]._id,
            sectionId: sections[0]._id
          }
        }
      );
      console.log('Updated students with academicSessionId, classId, and sectionId');
    }

    console.log('✅ Academics module database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedAcademics();
