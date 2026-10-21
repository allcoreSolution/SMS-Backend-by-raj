const mongoose = require('mongoose');
require('dotenv').config();

const AcademicClass = require('./models/AcademicClass');
const AcademicSection = require('./models/AcademicSection');
const Student = require('./models/Student');
const FeeType = require('./models/FeeType');
const FeeGroup = require('./models/FeeGroup');
const FeeDiscount = require('./models/FeeDiscount');
const AssignFee = require('./models/AssignFee');
const FeeCollection = require('./models/FeeCollection');
const FeeChallan = require('./models/FeeChallan');
const DueSlipHistory = require('./models/DueSlipHistory');
const User = require('./models/User');

async function seedFinance() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Get or create Admin User
    let admin = await User.findOne({ email: 'admin123@gmail.com' });
    if (!admin) {
      admin = await User.findOne();
    }

    // 2. Clear existing fee and student data if needed or populate if empty
    console.log('Seeding Academic Sections...');
    const sectionsData = ['A', 'B', 'C'];
    const sections = [];
    for (const sName of sectionsData) {
      let sec = await AcademicSection.findOne({ sectionName: sName });
      if (!sec) {
        sec = await AcademicSection.create({ sectionName: sName, capacity: 40 });
      }
      sections.push(sec);
    }

    console.log('Seeding Academic Classes...');
    const classesData = [
      { className: 'Class I', numericValue: 1 },
      { className: 'Class II', numericValue: 2 },
      { className: 'Class III', numericValue: 3 },
      { className: 'Class IV', numericValue: 4 },
      { className: 'Class V', numericValue: 5 },
      { className: 'Class VI', numericValue: 6 },
      { className: 'Class VII', numericValue: 7 },
      { className: 'Class VIII', numericValue: 8 },
      { className: 'Class IX', numericValue: 9 },
      { className: 'Class X', numericValue: 10 },
    ];
    const classes = [];
    for (const cData of classesData) {
      let cls = await AcademicClass.findOne({ className: cData.className });
      if (!cls) {
        cls = await AcademicClass.create({
          className: cData.className,
          numericValue: cData.numericValue,
          sections: sections.map(s => s._id)
        });
      }
      classes.push(cls);
    }

    // 3. Seed Students
    console.log('Seeding Students...');
    const studentsRaw = [
      { aparId: 'YIS-2024-101', firstName: 'Aarav', lastName: 'Sharma', gender: 'Male', phone: '9876543210', email: 'aarav.s@gmail.com', cIdx: 0, sIdx: 0 },
      { aparId: 'YIS-2024-102', firstName: 'Ananya', lastName: 'Verma', gender: 'Female', phone: '9876543211', email: 'ananya.v@gmail.com', cIdx: 0, sIdx: 1 },
      { aparId: 'YIS-2024-103', firstName: 'Rohan', lastName: 'Patel', gender: 'Male', phone: '9876543212', email: 'rohan.p@gmail.com', cIdx: 1, sIdx: 0 },
      { aparId: 'YIS-2024-104', firstName: 'Priya', lastName: 'Iyer', gender: 'Female', phone: '9876543213', email: 'priya.i@gmail.com', cIdx: 1, sIdx: 1 },
      { aparId: 'YIS-2024-105', firstName: 'Kabir', lastName: 'Mehta', gender: 'Male', phone: '9876543214', email: 'kabir.m@gmail.com', cIdx: 2, sIdx: 0 },
      { aparId: 'YIS-2024-106', firstName: 'Sneha', lastName: 'Reddy', gender: 'Female', phone: '9876543215', email: 'sneha.r@gmail.com', cIdx: 2, sIdx: 1 },
      { aparId: 'YIS-2024-107', firstName: 'Rudra', lastName: 'Chauhan', gender: 'Male', phone: '9876543216', email: 'rudra.c@gmail.com', cIdx: 3, sIdx: 0 },
      { aparId: 'YIS-2024-108', firstName: 'Diya', lastName: 'Deshmukh', gender: 'Female', phone: '9876543217', email: 'diya.d@gmail.com', cIdx: 3, sIdx: 1 },
      { aparId: 'YIS-2024-109', firstName: 'Ishaan', lastName: 'Joshi', gender: 'Male', phone: '9876543218', email: 'ishaan.j@gmail.com', cIdx: 4, sIdx: 0 },
      { aparId: 'YIS-2024-110', firstName: 'Tanvi', lastName: 'Bhatia', gender: 'Female', phone: '9876543219', email: 'tanvi.b@gmail.com', cIdx: 4, sIdx: 1 },
      { aparId: 'YIS-2024-111', firstName: 'Vihaan', lastName: 'Gupta', gender: 'Male', phone: '9876543220', email: 'vihaan.g@gmail.com', cIdx: 5, sIdx: 0 },
      { aparId: 'YIS-2024-112', firstName: 'Kavya', lastName: 'Menon', gender: 'Female', phone: '9876543221', email: 'kavya.m@gmail.com', cIdx: 6, sIdx: 0 },
      { aparId: 'YIS-2024-113', firstName: 'Advait', lastName: 'Nair', gender: 'Male', phone: '9876543222', email: 'advait.n@gmail.com', cIdx: 7, sIdx: 1 },
      { aparId: 'YIS-2024-114', firstName: 'Zoya', lastName: 'Khan', gender: 'Female', phone: '9876543223', email: 'zoya.k@gmail.com', cIdx: 8, sIdx: 0 },
      { aparId: 'YIS-2024-115', firstName: 'Arjun', lastName: 'Kapoor', gender: 'Male', phone: '9876543224', email: 'arjun.k@gmail.com', cIdx: 9, sIdx: 0 }
    ];

    const students = [];
    for (const s of studentsRaw) {
      let st = await Student.findOne({ aparId: s.aparId });
      if (!st) {
        st = await Student.create({
          aparId: s.aparId,
          firstName: s.firstName,
          lastName: s.lastName,
          gender: s.gender,
          dateOfBirth: new Date(2012, 4, 15),
          studentPhone: s.phone,
          studentEmail: s.email,
          classId: classes[s.cIdx]._id,
          sectionId: sections[s.sIdx]._id,
          nationality: 'Indian'
        });
      }
      students.push(st);
    }

    // 4. Seed Fee Types
    console.log('Seeding Fee Types...');
    const feeTypesData = [
      { name: 'Tuition Fee', code: 'TF-01', description: 'Core curriculum and instructional academic fees' },
      { name: 'Admission & Registration Fee', code: 'ADM-01', description: 'One-time admission registration charges' },
      { name: 'Annual Development & IT Fee', code: 'DEV-01', description: 'Campus technology, high-speed WiFi, smart boards' },
      { name: 'Science & STEM Lab Fee', code: 'LAB-01', description: 'Hands-on practicals, robotics kits, chemistry lab' },
      { name: 'Sports & Co-Curricular Activity', code: 'ACT-01', description: 'Physical education, tennis, swimming, tournaments' },
      { name: 'Library & Digital Resource Fee', code: 'LIB-01', description: 'Physical library access and digital EBSCO journal portal' },
      { name: 'Transportation & Bus Service', code: 'TRP-01', description: 'Doorstep GPS-enabled safe bus transit' },
      { name: 'Term Examination Fee', code: 'EXM-01', description: 'Mid-term, terminal evaluations and question papers' }
    ];

    const feeTypes = [];
    for (const ft of feeTypesData) {
      let record = await FeeType.findOne({ code: ft.code });
      if (!record) {
        record = await FeeType.create(ft);
      }
      feeTypes.push(record);
    }

    // 5. Seed Fee Discounts
    console.log('Seeding Fee Discounts...');
    const discountsData = [
      { name: 'Merit Scholarship', code: 'DISC-MERIT25', discountType: 'Percentage', amount: 25, description: 'Awarded to top 5% rank holders' },
      { name: 'Sibling Concession', code: 'DISC-SIB4000', discountType: 'Fixed', amount: 4000, description: 'Family concession for 2nd enrolled sibling' },
      { name: 'Staff Ward Concession', code: 'DISC-STAFF50', discountType: 'Percentage', amount: 50, description: 'School faculty children benefit' },
      { name: 'Early Bird Registration', code: 'DISC-EARLY2500', discountType: 'Fixed', amount: 2500, description: 'Advance session settlement discount' }
    ];

    const discounts = [];
    for (const d of discountsData) {
      let record = await FeeDiscount.findOne({ code: d.code });
      if (!record) {
        record = await FeeDiscount.create(d);
      }
      discounts.push(record);
    }

    // 6. Seed Fee Groups
    console.log('Seeding Fee Groups...');
    const feeGroupsData = [
      {
        name: 'Primary Composite Fee 2024-25',
        description: 'Annual fee structure for Class I to V',
        feeTypes: [
          { feeType: feeTypes[0]._id, amount: 28000, fineType: 'Fixed', fineAmount: 500 },
          { feeType: feeTypes[2]._id, amount: 6000, fineType: 'None', fineAmount: 0 },
          { feeType: feeTypes[4]._id, amount: 4000, fineType: 'None', fineAmount: 0 },
          { feeType: feeTypes[7]._id, amount: 2000, fineType: 'None', fineAmount: 0 },
        ]
      },
      {
        name: 'Middle School Composite Fee 2024-25',
        description: 'Annual fee package for Class VI to VIII',
        feeTypes: [
          { feeType: feeTypes[0]._id, amount: 36000, fineType: 'Fixed', fineAmount: 750 },
          { feeType: feeTypes[2]._id, amount: 7500, fineType: 'None', fineAmount: 0 },
          { feeType: feeTypes[3]._id, amount: 6500, fineType: 'Fixed', fineAmount: 250 },
          { feeType: feeTypes[4]._id, amount: 4000, fineType: 'None', fineAmount: 0 },
          { feeType: feeTypes[7]._id, amount: 3000, fineType: 'None', fineAmount: 0 },
        ]
      },
      {
        name: 'Secondary Board Composite Fee 2024-25',
        description: 'Comprehensive annual package for Class IX & X',
        feeTypes: [
          { feeType: feeTypes[0]._id, amount: 48000, fineType: 'Percentage', fineAmount: 5 },
          { feeType: feeTypes[2]._id, amount: 9000, fineType: 'None', fineAmount: 0 },
          { feeType: feeTypes[3]._id, amount: 10000, fineType: 'Fixed', fineAmount: 500 },
          { feeType: feeTypes[5]._id, amount: 3500, fineType: 'None', fineAmount: 0 },
          { feeType: feeTypes[7]._id, amount: 4500, fineType: 'None', fineAmount: 0 },
        ]
      },
      {
        name: 'Quarterly Term 1 (Apr - Jun)',
        description: 'First quarterly fee installment for all active students',
        feeTypes: [
          { feeType: feeTypes[0]._id, amount: 12000, fineType: 'Fixed', fineAmount: 300 },
          { feeType: feeTypes[4]._id, amount: 2500, fineType: 'None', fineAmount: 0 },
        ]
      },
      {
        name: 'Annual Express Bus Transport',
        description: 'Two-way air-conditioned bus commute service',
        feeTypes: [
          { feeType: feeTypes[6]._id, amount: 18000, fineType: 'Fixed', fineAmount: 400 },
        ]
      }
    ];

    const feeGroups = [];
    for (const fg of feeGroupsData) {
      let record = await FeeGroup.findOne({ name: fg.name });
      if (!record) {
        record = await FeeGroup.create(fg);
      }
      feeGroups.push(record);
    }

    // 7. Seed Fee Assignments
    console.log('Seeding Fee Assignments...');
    await AssignFee.deleteMany({});
    const assignedRecords = [];

    // Assign Primary Composite to students 0-9 (Classes 1-5)
    for (let i = 0; i < 10; i++) {
      const af = await AssignFee.create({
        student: students[i]._id,
        feeGroup: feeGroups[0]._id,
        assignedDate: new Date(2024, 3, 1),
        dueDate: new Date(2024, 9, 30)
      });
      assignedRecords.push(af);
    }

    // Assign Middle School to students 10-12
    for (let i = 10; i < 13; i++) {
      const af = await AssignFee.create({
        student: students[i]._id,
        feeGroup: feeGroups[1]._id,
        assignedDate: new Date(2024, 3, 1),
        dueDate: new Date(2024, 9, 30)
      });
      assignedRecords.push(af);
    }

    // Assign Secondary Board to students 13-14
    for (let i = 13; i < 15; i++) {
      const af = await AssignFee.create({
        student: students[i]._id,
        feeGroup: feeGroups[2]._id,
        assignedDate: new Date(2024, 3, 1),
        dueDate: new Date(2024, 9, 30)
      });
      assignedRecords.push(af);
    }

    // Also assign Quarterly Term 1 to some students
    for (let i = 0; i < 8; i++) {
      const af = await AssignFee.create({
        student: students[i]._id,
        feeGroup: feeGroups[3]._id,
        assignedDate: new Date(2024, 3, 15),
        dueDate: new Date(2024, 5, 10)
      });
      assignedRecords.push(af);
    }

    // Assign Transport to some
    for (let i = 0; i < 6; i += 2) {
      const af = await AssignFee.create({
        student: students[i]._id,
        feeGroup: feeGroups[4]._id,
        assignedDate: new Date(2024, 3, 1),
        dueDate: new Date(2024, 11, 31)
      });
      assignedRecords.push(af);
    }

    console.log(`Assigned fees to ${assignedRecords.length} student records.`);

    // 8. Seed Fee Collections across the last 15 days
    console.log('Seeding Fee Collections...');
    await FeeCollection.deleteMany({});

    const paymentModesList = ['Online', 'Cash', 'Cheque', 'Online', 'Cash'];
    const collectionsData = [
      { sIdx: 0, gIdx: 0, amount: 40000, mode: 'Online', daysAgo: 1, disc: discounts[0], ref: 'UPI/2024/09812' },
      { sIdx: 1, gIdx: 0, amount: 25000, mode: 'Cash', daysAgo: 2, disc: null, ref: 'CSH-COUNTER-01' },
      { sIdx: 2, gIdx: 0, amount: 40000, mode: 'Online', daysAgo: 3, disc: discounts[1], ref: 'UPI/2024/09844' },
      { sIdx: 3, gIdx: 0, amount: 20000, mode: 'Cheque', daysAgo: 4, disc: null, ref: 'CHQ-HDFC-88219' },
      { sIdx: 4, gIdx: 0, amount: 35000, mode: 'Online', daysAgo: 5, disc: null, ref: 'UPI/2024/09899' },
      { sIdx: 5, gIdx: 0, amount: 15000, mode: 'Cash', daysAgo: 6, disc: null, ref: 'CSH-COUNTER-02' },
      { sIdx: 6, gIdx: 0, amount: 18000, mode: 'Online', daysAgo: 7, disc: null, ref: 'UPI/2024/09911' },
      { sIdx: 7, gIdx: 0, amount: 30000, mode: 'Online', daysAgo: 8, disc: discounts[0], ref: 'UPI/2024/09923' },
      { sIdx: 8, gIdx: 0, amount: 22000, mode: 'Cash', daysAgo: 9, disc: null, ref: 'CSH-COUNTER-03' },
      { sIdx: 9, gIdx: 0, amount: 40000, mode: 'Online', daysAgo: 10, disc: null, ref: 'UPI/2024/09945' },
      { sIdx: 10, gIdx: 1, amount: 35000, mode: 'Cheque', daysAgo: 11, disc: discounts[2], ref: 'CHQ-ICICI-44120' },
      { sIdx: 11, gIdx: 1, amount: 25000, mode: 'Online', daysAgo: 12, disc: null, ref: 'UPI/2024/09982' },
      { sIdx: 12, gIdx: 1, amount: 45000, mode: 'Cash', daysAgo: 13, disc: null, ref: 'CSH-COUNTER-04' },
      { sIdx: 13, gIdx: 2, amount: 50000, mode: 'Online', daysAgo: 14, disc: discounts[0], ref: 'UPI/2024/10002' },
      { sIdx: 14, gIdx: 2, amount: 30000, mode: 'Online', daysAgo: 0, disc: null, ref: 'UPI/2024/10015' }, // Today!
      { sIdx: 0, gIdx: 3, amount: 14500, mode: 'Online', daysAgo: 0, disc: null, ref: 'UPI/2024/10022' }, // Today!
      { sIdx: 1, gIdx: 3, amount: 14500, mode: 'Cash', daysAgo: 2, disc: null, ref: 'CSH-COUNTER-05' },
      { sIdx: 2, gIdx: 4, amount: 18000, mode: 'Online', daysAgo: 3, disc: null, ref: 'UPI/2024/10034' },
    ];

    let receiptIndex = 1001;
    for (const c of collectionsData) {
      const pDate = new Date();
      pDate.setDate(pDate.getDate() - c.daysAgo);
      pDate.setHours(10 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 59));

      await FeeCollection.create({
        receiptNo: `REC-2024-${receiptIndex++}`,
        student: students[c.sIdx]._id,
        feeGroup: feeGroups[c.gIdx]._id,
        amountPaid: c.amount,
        fineAmount: c.daysAgo > 7 ? 250 : 0,
        discount: c.disc ? c.disc._id : null,
        paymentMode: c.mode,
        referenceNo: c.ref,
        paymentDate: pDate,
        note: `Fee cleared for session 2024-25. Mode: ${c.mode}`
      });
    }

    console.log(`Created ${collectionsData.length} fee collection receipts.`);

    // 9. Seed Fee Challans
    console.log('Seeding Fee Challans...');
    await FeeChallan.deleteMany({});
    const challansData = [
      { challanNo: 'CHL-2024-001', sIdx: 3, gIdx: 0, amount: 20000, status: 'Issued', dueDays: 15 },
      { challanNo: 'CHL-2024-002', sIdx: 5, gIdx: 0, amount: 25000, status: 'Issued', dueDays: 20 },
      { challanNo: 'CHL-2024-003', sIdx: 7, gIdx: 0, amount: 10000, status: 'Paid', dueDays: -5 },
      { challanNo: 'CHL-2024-004', sIdx: 8, gIdx: 0, amount: 18000, status: 'Expired', dueDays: -12 },
      { challanNo: 'CHL-2024-005', sIdx: 11, gIdx: 1, amount: 32000, status: 'Issued', dueDays: 10 },
      { challanNo: 'CHL-2024-006', sIdx: 14, gIdx: 2, amount: 42000, status: 'Issued', dueDays: 25 },
    ];

    for (const ch of challansData) {
      const dDate = new Date();
      dDate.setDate(dDate.getDate() + ch.dueDays);
      await FeeChallan.create({
        challanNo: ch.challanNo,
        student: students[ch.sIdx]._id,
        feeGroup: feeGroups[ch.gIdx]._id,
        amount: ch.amount,
        dueDate: dDate,
        status: ch.status,
        paymentDate: ch.status === 'Paid' ? new Date() : undefined
      });
    }

    // 10. Seed DueSlipHistory
    console.log('Seeding Due Slip History...');
    await DueSlipHistory.deleteMany({});
    if (admin) {
      await DueSlipHistory.create({
        batchId: 'BATCH-DUE-2024-01',
        generatedBy: admin._id,
        studentsCount: 12,
        totalDueAmount: 382000,
        targetClass: 'Class I to V',
        targetSection: 'All Sections'
      });
      await DueSlipHistory.create({
        batchId: 'BATCH-DUE-2024-02',
        generatedBy: admin._id,
        studentsCount: 6,
        totalDueAmount: 215000,
        targetClass: 'Class VI to X',
        targetSection: 'All Sections'
      });
    }

    console.log('🎉 ALL FEE & FINANCE DATA SEEDED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding finance data:', error);
    process.exit(1);
  }
}

seedFinance();
