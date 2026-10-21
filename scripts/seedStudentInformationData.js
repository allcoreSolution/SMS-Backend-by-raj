const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Student = require('../models/Student');
const AcademicClass = require('../models/AcademicClass');
const AcademicSection = require('../models/AcademicSection');
const Parent = require('../models/Parent');
const StudentHouse = require('../models/StudentHouse');
const StudentCategory = require('../models/StudentCategory');
const BehaviorRecord = require('../models/BehaviorRecord');
const StudentHealthRecord = require('../models/StudentHealthRecord');
const StudentExit = require('../models/StudentExit');
const Attendance = require('../models/Attendance');

const seedStudentData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);

    console.log('Connected! Starting Student Information Seeder...');

    // 1. Seed Student Houses
    console.log('Seeding Student Houses...');
    await StudentHouse.deleteMany({});
    const housesData = [
      { name: 'Red Phoenix', color: '#ef4444', description: 'Courage, passion and sportsmanship', headStudent: 'Vihaan Gupta' },
      { name: 'Blue Pegasus', color: '#3b82f6', description: 'Intellect, loyalty and calm focus', headStudent: 'Tanvi Bhatia' },
      { name: 'Green Dragon', color: '#10b981', description: 'Growth, sustainability and persistence', headStudent: 'Ishaan Joshi' },
      { name: 'Yellow Hydra', color: '#f59e0b', description: 'Energy, brightness and team collaboration', headStudent: 'Diya Deshmukh' }
    ];
    await StudentHouse.insertMany(housesData);
    console.log('Seeded 4 Student Houses.');

    // 2. Seed Student Categories
    console.log('Seeding Student Categories...');
    await StudentCategory.deleteMany({});
    const categoriesData = [
      { name: 'General', code: 'GEN', description: 'Unreserved General Merit Category' },
      { name: 'OBC', code: 'OBC', description: 'Other Backward Classes with central/state certification' },
      { name: 'SC', code: 'SC', description: 'Scheduled Caste quota according to statutory regulations' },
      { name: 'ST', code: 'ST', description: 'Scheduled Tribe quota according to statutory regulations' }
    ];
    await StudentCategory.insertMany(categoriesData);
    console.log('Seeded 4 Student Categories.');

    // 3. Update Existing Students with rich metadata
    console.log('Enhancing existing students with full information...');
    const students = await Student.find().sort({ createdAt: 1 });
    const bloodGroups = ['A+', 'B+', 'O+', 'AB+', 'O-', 'A-'];
    const housesList = ['Red Phoenix', 'Blue Pegasus', 'Green Dragon', 'Yellow Hydra'];
    const categoriesList = ['General', 'OBC', 'SC', 'ST'];
    const avatars = [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    ];

    const fatherNames = [
      'Rajesh Kumar Gupta', 'Anand Bhatia', 'Sunil Joshi', 'Ramesh Deshmukh',
      'Vikram Chauhan', 'Suresh Reddy', 'Naveen Khatri', 'Pawan Nair',
      'Kailash Bose', 'Alok Agarwal'
    ];

    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      const house = housesList[i % housesList.length];
      const category = categoriesList[i % categoriesList.length];
      const blood = bloodGroups[i % bloodGroups.length];
      const father = fatherNames[i % fatherNames.length];
      const fatherPhone = `98765${String(10000 + i * 27).slice(0, 5)}`;
      const mother = `Mrs. ${father.split(' ')[0]} ${father.split(' ').slice(1).join(' ')}`;
      const motherPhone = `98112${String(20000 + i * 33).slice(0, 5)}`;
      const roll = String(i + 1);
      const admissionNo = s.aparId || `YISADM-${100 + i}`;
      const photo = avatars[i % avatars.length];

      s.admissionNo = admissionNo;
      s.rollNo = roll;
      s.house = house;
      s.category = category;
      s.bloodGroup = blood;
      s.studentPhoto = photo;
      s.fatherName = father;
      s.fatherPhone = fatherPhone;
      s.motherName = mother;
      s.motherPhone = motherPhone;
      s.height = 120 + (i % 25);
      s.weight = 32 + (i % 18);
      s.status = i === students.length - 1 ? 'On Hold' : (i === students.length - 2 ? 'Exited' : 'Active');
      s.allergies = i % 3 === 0 ? 'Dust & Pollen' : 'None';
      await s.save();
    }
    console.log(`Updated ${students.length} students with realistic data.`);

    // 4. Seed Parents
    console.log('Seeding Parents collection...');
    await Parent.deleteMany({});
    const parentDocs = [];
    for (let i = 0; i < 8; i++) {
      const linkedStudent = students[i] ? [students[i]._id] : [];
      if (students[i + 8]) linkedStudent.push(students[i + 8]._id); // Sibling

      parentDocs.push({
        name: fatherNames[i],
        relation: 'Father',
        phone: `98765${String(10000 + i * 27).slice(0, 5)}`,
        email: `${fatherNames[i].toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        occupation: i % 2 === 0 ? 'Civil Engineer / IT Professional' : 'Business Owner & Merchant',
        address: `${100 + i * 12}, Sector ${i + 4}, Green Park Campus Enclave`,
        loginId: `P98765${String(10000 + i * 27).slice(0, 5)}`,
        children: linkedStudent,
        status: 'Active'
      });
    }
    const createdParents = await Parent.insertMany(parentDocs);

    // Link parentId back to students
    for (const p of createdParents) {
      if (p.children && p.children.length > 0) {
        await Student.updateMany({ _id: { $in: p.children } }, { parentId: p._id });
      }
    }
    console.log(`Seeded ${createdParents.length} parents with children linkages.`);

    // 5. Seed Behavior Records
    console.log('Seeding Behavior Records...');
    await BehaviorRecord.deleteMany({});
    const sampleBehaviors = [
      {
        studentIndex: 0,
        title: 'Outstanding Science Project Presentation',
        type: 'Positive',
        points: 5,
        reportedBy: 'Dr. Ramesh Sharma (Physics)',
        description: 'Demonstrated an innovative working model of solar water purification.'
      },
      {
        studentIndex: 1,
        title: 'Represented School in State Debate Semi-Finals',
        type: 'Positive',
        points: 4,
        reportedBy: 'Pooja Verma (English)',
        description: 'Delivered an articulate argument on sustainable future energy.'
      },
      {
        studentIndex: 2,
        title: 'Exemplary Conduct & Peer Tutoring Support',
        type: 'Positive',
        points: 3,
        reportedBy: 'Neha Saxena (Math)',
        description: 'Regularly assists classmates in understanding geometry problem sets.'
      },
      {
        studentIndex: 3,
        title: 'Disrupted Computer Lab Session',
        type: 'Negative',
        points: -2,
        reportedBy: 'Kunal Sen (IT)',
        description: 'Found playing unauthorized web games during class laboratory hours.'
      },
      {
        studentIndex: 4,
        title: 'Inter-House Athletics 100m Sprint Gold',
        type: 'Positive',
        points: 5,
        reportedBy: 'Coach Balwant Singh',
        description: 'Clocked record timing in junior sprint category.'
      },
      {
        studentIndex: 5,
        title: 'Repeated Missing Homework Assignment',
        type: 'Negative',
        points: -1,
        reportedBy: 'Amit Roy (Hindi)',
        description: 'Did not submit cursive workbook despite multiple verbal reminders.'
      }
    ];

    const behaviorDocs = sampleBehaviors.map(b => ({
      studentId: students[b.studentIndex % students.length]._id,
      title: b.title,
      type: b.type,
      points: b.points,
      incidentDate: new Date(Date.now() - (b.studentIndex + 1) * 86400000 * 2),
      reportedBy: b.reportedBy,
      description: b.description
    }));
    await BehaviorRecord.insertMany(behaviorDocs);
    console.log(`Seeded ${behaviorDocs.length} Behavior Records.`);

    // 6. Seed Student Health Records
    console.log('Seeding Student Health Records...');
    await StudentHealthRecord.deleteMany({});
    const healthDocs = students.map((s, idx) => ({
      studentId: s._id,
      bloodGroup: s.bloodGroup || 'B+',
      height: s.height || 135,
      weight: s.weight || 38,
      allergies: s.allergies || 'None',
      visionLeft: idx % 4 === 0 ? '6/9 (Glasses advised)' : '6/6',
      visionRight: '6/6',
      dentalNotes: idx % 3 === 0 ? 'Mild cavity in upper premolar' : 'Clean & healthy',
      checkupDate: new Date(Date.now() - idx * 86400000 * 3),
      doctorName: idx % 2 === 0 ? 'Dr. Anita Desai (MD Pediatrics)' : 'Dr. Rajiv Menon (MBBS)',
      remarks: idx % 4 === 0 ? 'Active lifestyle recommended, annual dental cleaning' : 'Excellent physical condition and stamina'
    }));
    await StudentHealthRecord.insertMany(healthDocs);
    console.log(`Seeded ${healthDocs.length} Health Records.`);

    // 7. Seed Student Exit & TC Records
    console.log('Seeding Student Exit & TC Records...');
    await StudentExit.deleteMany({});
    if (students.length >= 2) {
      const exitRecords = [
        {
          studentId: students[students.length - 2]._id, // Exited
          tcNo: 'TC-2026-0042',
          standing: 'TC Register',
          leftOn: new Date(Date.now() - 15 * 86400000),
          lastClass: 'Class V',
          duesCleared: true,
          reason: 'Parent relocated to Bangalore for employment',
          characterConduct: 'Exemplary',
          recordedBy: 'School Principal Office'
        },
        {
          studentId: students[students.length - 1]._id, // On Hold
          tcNo: 'TC-2026-0043',
          standing: 'On Hold',
          leftOn: new Date(Date.now() - 5 * 86400000),
          lastClass: 'Class VI',
          duesCleared: false,
          reason: 'Medical Leave & Extended Relocation review',
          characterConduct: 'Good',
          recordedBy: 'Admin Desk'
        }
      ];
      await StudentExit.insertMany(exitRecords);
      console.log(`Seeded ${exitRecords.length} Student Exit / TC Records.`);
    }

    // 8. Seed Attendance records for today
    console.log('Seeding Today Attendance for students...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validStudentsWithClass = students.filter(s => s.classId && s.sectionId);
    for (let idx = 0; idx < validStudentsWithClass.length; idx++) {
      const s = validStudentsWithClass[idx];
      const status = idx === 3 ? 'Absent' : (idx === 7 ? 'Late' : 'Present');
      const remarks = idx === 3 ? 'Sick leave intimation sent by parent' : 'On time';

      await Attendance.findOneAndUpdate(
        { student: s._id, date: today },
        {
          student: s._id,
          academicClass: s.classId,
          section: s.sectionId,
          date: today,
          status,
          remarks
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded Attendance for ${validStudentsWithClass.length} students.`);

    console.log('SUCCESS: All Student Information live demo data seeded cleanly!');
    process.exit(0);
  } catch (err) {
    console.error('ERROR during seed:', err);
    process.exit(1);
  }
};

seedStudentData();
