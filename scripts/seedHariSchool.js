const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: 'c:/Users/Raj Yadav/Downloads/SCHOOL/School_ERP_Api/.env' });

// Models
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Role = require('../models/Role');
const Staff = require('../models/Staff');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const AcademicClass = require('../models/AcademicClass');
const AcademicSection = require('../models/AcademicSection');
const AcademicSession = require('../models/AcademicSession');
const AcademicSubject = require('../models/AcademicSubject');
const FeeGroup = require('../models/FeeGroup');
const FeeType = require('../models/FeeType');
const AssignFee = require('../models/AssignFee');
const FeeCollection = require('../models/FeeCollection');
const Attendance = require('../models/Attendance');
const Notice = require('../models/Notice');

async function seedHariSchool() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_erp_db');
  console.log('✅ Connected to MongoDB');

  // 1. Locate Tenant HARI
  let tenant = await Tenant.findOne({
    $or: [
      { schoolName: /HARI/i },
      { email: 'hari@gmail.com' }
    ]
  });

  if (!tenant) {
    tenant = await Tenant.create({
      schoolName: 'HARI',
      email: 'hari@gmail.com',
      phone: '7348974798',
      plan: 'Enterprise',
      status: 'Active',
      city: 'Pune',
      state: 'Maharashtra',
      adminName: 'Hari Admin',
      studentsCount: 12
    });
    console.log('Created Tenant HARI:', tenant._id);
  } else {
    tenant.studentsCount = 12;
    await tenant.save();
    console.log('Found Tenant HARI:', tenant._id);
  }

  const tenantId = tenant._id;

  // 2. Ensure Roles exist
  const rolesNeeded = ['Admin', 'Teacher', 'Staff', 'Accountant', 'Student', 'Parent'];
  const roleMap = {};
  for (const rName of rolesNeeded) {
    let r = await Role.findOne({ name: rName });
    if (!r) {
      r = await Role.create({ name: rName, permissions: ['all'] });
    }
    roleMap[rName] = r._id;
  }

  // 3. Academic Session
  let session = await AcademicSession.findOne({ name: '2026-2027' });
  if (!session) {
    session = await AcademicSession.create({
      name: '2026-2027',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      isCurrent: true,
      status: 'Active',
      description: 'Academic Session 2026-2027'
    });
  }

  // 4. Academic Sections
  const sectionNames = ['A', 'B'];
  const sectionMap = {};
  for (const sName of sectionNames) {
    let sec = await AcademicSection.findOne({ sectionName: sName });
    if (!sec) {
      sec = await AcademicSection.create({ sectionName: sName, capacity: 40 });
    }
    sectionMap[sName] = sec._id;
  }

  // 5. Academic Subjects
  const subjectList = [
    { subjectName: 'Mathematics', subjectCode: 'HARI-MATH', subjectType: 'theory' },
    { subjectName: 'Science', subjectCode: 'HARI-SCI', subjectType: 'both' },
    { subjectName: 'English', subjectCode: 'HARI-ENG', subjectType: 'theory' },
    { subjectName: 'Hindi', subjectCode: 'HARI-HIN', subjectType: 'theory' },
    { subjectName: 'Computer Science', subjectCode: 'HARI-CS', subjectType: 'practical' }
  ];
  const subjectIds = [];
  for (const s of subjectList) {
    let sub = await AcademicSubject.findOne({ subjectName: s.subjectName });
    if (!sub) {
      sub = await AcademicSubject.create({ ...s, status: 'active' });
    }
    subjectIds.push(sub._id);
  }

  // 6. Academic Classes
  const classDefs = [
    { className: 'Nursery', numericValue: 0, sections: [sectionMap['A']] },
    { className: 'Class 1', numericValue: 1, sections: [sectionMap['A'], sectionMap['B']] },
    { className: 'Class 2', numericValue: 2, sections: [sectionMap['A']] },
    { className: 'Class 5', numericValue: 5, sections: [sectionMap['A']] },
    { className: 'Class 10', numericValue: 10, sections: [sectionMap['A']] }
  ];
  const classMap = {};
  for (const c of classDefs) {
    let cls = await AcademicClass.findOne({ className: c.className });
    if (!cls) {
      cls = await AcademicClass.create({
        ...c,
        assignedSubjects: subjectIds,
        status: 'active'
      });
    }
    classMap[c.className] = cls._id;
  }

  // 7. Seed Staff for HARI
  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash('admin123', salt);

  const staffList = [
    {
      fullName: 'Sunita Sharma',
      email: 'sunita.teacher@hari.edu',
      staffId: 'HARI-STF-01',
      designation: 'Senior TGT Teacher',
      department: 'Mathematics',
      gender: 'Female',
      role: roleMap['Teacher'],
      tenant: tenantId
    },
    {
      fullName: 'Vikram Singh',
      email: 'vikram.science@hari.edu',
      staffId: 'HARI-STF-02',
      designation: 'TGT Science & IT',
      department: 'Science',
      gender: 'Male',
      role: roleMap['Teacher'],
      tenant: tenantId
    },
    {
      fullName: 'Manoj Gupta',
      email: 'manoj.accounts@hari.edu',
      staffId: 'HARI-STF-03',
      designation: 'Senior Accountant',
      department: 'Accounts & Finance',
      gender: 'Male',
      role: roleMap['Accountant'],
      tenant: tenantId
    },
    {
      fullName: 'Pooja Verma',
      email: 'pooja.admin@hari.edu',
      staffId: 'HARI-STF-04',
      designation: 'Office Executive / Front Desk',
      department: 'Administration',
      gender: 'Female',
      role: roleMap['Staff'],
      tenant: tenantId
    }
  ];

  for (const stf of staffList) {
    let sDoc = await Staff.findOne({ email: stf.email });
    if (!sDoc) {
      sDoc = await Staff.create(stf);
    } else {
      sDoc.tenant = tenantId;
      await sDoc.save();
    }

    // Also link/create User account
    let uDoc = await User.findOne({ email: stf.email });
    if (!uDoc) {
      await User.create({
        username: stf.email,
        email: stf.email,
        password: 'admin123',
        role: stf.role,
        tenant: tenantId,
        isActive: true,
        firstName: stf.fullName.split(' ')[0],
        lastName: stf.fullName.split(' ')[1] || '',
        designation: stf.designation,
        department: stf.department
      });
    }
  }
  console.log('✅ Seeded 4 Staff & User members for HARI');

  // 8. Seed Students for HARI
  const studentRaw = [
    { first: 'Aarav', last: 'Verma', gender: 'Male', class: 'Class 1', sec: 'A', roll: '1', apar: 'HARI-2026-001', parent: 'Rakesh Verma', phone: '9811200001' },
    { first: 'Ananya', last: 'Sharma', gender: 'Female', class: 'Class 1', sec: 'A', roll: '2', apar: 'HARI-2026-002', parent: 'Deepak Sharma', phone: '9811200002' },
    { first: 'Rohan', last: 'Mehta', gender: 'Male', class: 'Class 1', sec: 'A', roll: '3', apar: 'HARI-2026-003', parent: 'Sanjay Mehta', phone: '9811200003' },
    { first: 'Priya', last: 'Patel', gender: 'Female', class: 'Class 1', sec: 'B', roll: '1', apar: 'HARI-2026-004', parent: 'Kirit Patel', phone: '9811200004' },
    { first: 'Kabir', last: 'Kapoor', gender: 'Male', class: 'Class 2', sec: 'A', roll: '1', apar: 'HARI-2026-005', parent: 'Anil Kapoor', phone: '9811200005' },
    { first: 'Sneha', last: 'Rao', gender: 'Female', class: 'Class 2', sec: 'A', roll: '2', apar: 'HARI-2026-006', parent: 'Venkat Rao', phone: '9811200006' },
    { first: 'Aditya', last: 'Joshi', gender: 'Male', class: 'Class 5', sec: 'A', roll: '1', apar: 'HARI-2026-007', parent: 'Nitin Joshi', phone: '9811200007' },
    { first: 'Isha', last: 'Gupta', gender: 'Female', class: 'Class 5', sec: 'A', roll: '2', apar: 'HARI-2026-008', parent: 'Pawan Gupta', phone: '9811200008' },
    { first: 'Vihaan', last: 'Nair', gender: 'Male', class: 'Nursery', sec: 'A', roll: '1', apar: 'HARI-2026-009', parent: 'Manoj Nair', phone: '9811200009' },
    { first: 'Myra', last: 'Kulkarni', gender: 'Female', class: 'Nursery', sec: 'A', roll: '2', apar: 'HARI-2026-010', parent: 'Sachin Kulkarni', phone: '9811200010' },
    { first: 'Devansh', last: 'Bose', gender: 'Male', class: 'Class 10', sec: 'A', roll: '1', apar: 'HARI-2026-011', parent: 'Subhash Bose', phone: '9811200011' },
    { first: 'Riya', last: 'Chauhan', gender: 'Female', class: 'Class 10', sec: 'A', roll: '2', apar: 'HARI-2026-012', parent: 'Rajesh Chauhan', phone: '9811200012' }
  ];

  const createdStudents = [];
  for (const s of studentRaw) {
    let student = await Student.findOne({ aparId: s.apar });
    if (!student) {
      student = await Student.create({
        aparId: s.apar,
        admissionNo: s.apar,
        rollNo: s.roll,
        firstName: s.first,
        lastName: s.last,
        gender: s.gender,
        dateOfBirth: new Date('2018-05-15'),
        studentPhone: s.phone,
        studentEmail: `${s.first.toLowerCase()}.${s.last.toLowerCase()}@hari.edu`,
        fatherName: s.parent,
        fatherPhone: s.phone,
        classId: classMap[s.class],
        sectionId: sectionMap[s.sec],
        academicSessionId: session._id,
        tenant: tenantId,
        status: 'Active'
      });
    } else {
      student.tenant = tenantId;
      await student.save();
    }
    createdStudents.push(student);
  }
  console.log(`✅ Seeded ${createdStudents.length} Students for HARI`);

  // 9. Seed Fee Structure & Collection for HARI
  let feeTypeTuition = await FeeType.findOne({ name: 'Tuition Fee - Monthly' });
  if (!feeTypeTuition) {
    feeTypeTuition = await FeeType.create({ name: 'Tuition Fee - Monthly', code: 'TUIT-M', description: 'Monthly class tuition' });
  }

  let feeTypeAnnual = await FeeType.findOne({ name: 'Annual Development Fee' });
  if (!feeTypeAnnual) {
    feeTypeAnnual = await FeeType.create({ name: 'Annual Development Fee', code: 'ANN-DEV', description: 'Institutional development fee' });
  }

  let feeGroup = await FeeGroup.findOne({ name: 'HARI Standard Fees 2026-27' });
  if (!feeGroup) {
    feeGroup = await FeeGroup.create({
      name: 'HARI Standard Fees 2026-27',
      description: 'Standard fees structure for HARI Academy',
      feeTypes: [
        { feeType: feeTypeTuition._id, amount: 4500 },
        { feeType: feeTypeAnnual._id, amount: 12000 }
      ],
      isActive: true
    });
  }

  // Assign Fee to all students
  let totalAssigned = 0;
  for (const stu of createdStudents) {
    let assign = await AssignFee.findOne({ student: stu._id, feeGroup: feeGroup._id });
    if (!assign) {
      assign = await AssignFee.create({
        student: stu._id,
        feeGroup: feeGroup._id,
        assignedDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        customAmount: 16500
      });
    }
    totalAssigned++;
  }
  console.log(`✅ Assigned fee to ${totalAssigned} students in HARI`);

  // Collect fee for 7 students
  let collectedCount = 0;
  for (let i = 0; i < 7; i++) {
    const stu = createdStudents[i];
    const recNo = `HARI-REC-2026-${1000 + i}`;
    let coll = await FeeCollection.findOne({ receiptNo: recNo });
    const isFull = i < 4;
    const paidAmt = isFull ? 16500 : 8000;
    if (!coll) {
      coll = await FeeCollection.create({
        receiptNo: recNo,
        student: stu._id,
        feeGroup: feeGroup._id,
        amountPaid: paidAmt,
        paymentMode: i % 2 === 0 ? 'Online' : 'UPI',
        paymentDate: new Date(Date.now() - (i * 2) * 3600 * 1000),
        referenceNo: `PAY-HARI-00${i + 1}`,
        note: isFull ? 'Full Term Fees Cleared' : '1st Installment Paid'
      });
    }
    collectedCount++;
  }
  console.log(`✅ Recorded Fee Collections for ${collectedCount} students in HARI`);

  // 10. Mark Today's Attendance for HARI students
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let attCount = 0;
  for (let i = 0; i < createdStudents.length; i++) {
    const stu = createdStudents[i];
    const status = (i === 4) ? 'Absent' : ((i === 8) ? 'Late' : 'Present');
    
    // Check if attendance exists
    let existingAtt = await Attendance.findOne({ student: stu._id, date: today });
    if (!existingAtt) {
      await Attendance.create({
        student: stu._id,
        date: today,
        status: status,
        academicClass: stu.classId,
        section: stu.sectionId,
        remarks: status === 'Present' ? 'On time' : (status === 'Late' ? 'Bus delayed' : 'Sick leave')
      });
      attCount++;
    }
  }
  console.log(`✅ Marked today's attendance for ${attCount} students in HARI`);

  // 11. Seed School Notices for HARI
  const notices = [
    {
      title: 'Welcome to HARI Academy — Academic Session 2026-27 Started',
      content: 'Warm welcome to all parents, faculty, and students for the new academic session 2026-2027.',
      sentTo: 'All (Entire School)',
      targetAudience: 'All',
      priority: 'High',
      createdByRole: 'Principal Office'
    },
    {
      title: 'Bookset and School Uniform Distribution Schedule',
      content: 'All enrolled students can collect their uniform and booksets from the school campus administrative desk.',
      sentTo: 'Students & Parents',
      targetAudience: 'Student',
      priority: 'Normal',
      createdByRole: 'Administration Desk'
    },
    {
      title: 'First Parent-Teacher Meeting (PTM) Announced',
      content: 'PTM for Nursery through Class 10 will be conducted next Saturday between 9:00 AM to 1:00 PM.',
      sentTo: 'Parents',
      targetAudience: 'Parent',
      priority: 'Urgent',
      createdByRole: 'Director Office'
    }
  ];

  for (const n of notices) {
    let nDoc = await Notice.findOne({ title: n.title });
    if (!nDoc) {
      await Notice.create(n);
    }
  }
  console.log('✅ Seeded 3 official notices for HARI');

  console.log('🎉 ALL A TO Z SEED DATA SUCCESSFULLY POPULATED FOR HARI SCHOOL!');
  process.exit(0);
}

seedHariSchool().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
