require('dotenv').config();
const mongoose = require('mongoose');
const {
  Department,
  Designation,
  LeaveType,
  StaffLoan,
  SalaryTemplate,
  StaffSalary,
  AppraisalCycle,
  AppraisalCriterion,
  StaffAppraisal
} = require('./models/HR');
const Staff = require('./models/Staff');
const Leave = require('./models/Leave');

async function seedHR() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_erp');
    console.log('MongoDB connected for HR Seeding...');

    // 1. Departments
    const departmentsData = [
      { name: 'Academic', code: 'ACAD', headOfDepartment: 'Dr. Ramesh Sen', description: 'Core curriculum and classroom teaching faculty', status: 'Active' },
      { name: 'Administration', code: 'ADMIN', headOfDepartment: 'Sunita Mehra', description: 'School administrative and front-office operations', status: 'Active' },
      { name: 'Science & Math', code: 'SCIMATH', headOfDepartment: 'Amit Sharma', description: 'STEM, Physics, Chemistry, Biology, and Mathematics faculty', status: 'Active' },
      { name: 'Languages', code: 'LANG', headOfDepartment: 'Rajesh Kumar', description: 'English, Hindi, Sanskrit, and regional language teaching', status: 'Active' },
      { name: 'Information Technology', code: 'IT', headOfDepartment: 'Vikram Malhotra', description: 'Computer science, robotics, and school ICT infra', status: 'Active' },
      { name: 'Creative Arts', code: 'ARTS', headOfDepartment: 'Ananya Sen', description: 'Fine arts, visual crafts, and performing arts', status: 'Active' },
      { name: 'Finance & Accounts', code: 'FIN', headOfDepartment: 'Raman Gupta', description: 'Fees collection, payroll, and bookkeeping', status: 'Active' }
    ];

    for (const d of departmentsData) {
      await Department.findOneAndUpdate({ name: d.name }, d, { upsert: true, new: true });
    }
    console.log('Departments seeded.');

    // 2. Designations
    const designationsData = [
      { name: 'Principal', code: 'PRN', department: 'Administration', description: 'Head of institution', status: 'Active' },
      { name: 'Vice Principal', code: 'VPRN', department: 'Academic', description: 'Deputy academic head', status: 'Active' },
      { name: 'Senior PGT Mathematics', code: 'PGT-MATH', department: 'Science & Math', description: 'Post Graduate Teacher (Grades 11-12)', status: 'Active' },
      { name: 'TGT Science & Biology', code: 'TGT-SCI', department: 'Science & Math', description: 'Trained Graduate Teacher (Grades 6-10)', status: 'Active' },
      { name: 'PGT English Literature', code: 'PGT-ENG', department: 'Languages', description: 'High school English literature instructor', status: 'Active' },
      { name: 'Computer Science Faculty', code: 'FAC-CS', department: 'Information Technology', description: 'IT and programming instructor', status: 'Active' },
      { name: 'Arts & Cultural Instructor', code: 'INST-ART', department: 'Creative Arts', description: 'Music, drama, and fine arts coordinator', status: 'Active' },
      { name: 'Accountant', code: 'ACCT', department: 'Finance & Accounts', description: 'Accounts and ledger administrator', status: 'Active' }
    ];

    for (const d of designationsData) {
      await Designation.findOneAndUpdate({ name: d.name }, d, { upsert: true, new: true });
    }
    console.log('Designations seeded.');

    // 3. Leave Types
    const leaveTypesData = [
      { name: 'Casual Leave (CL)', code: 'CL', daysAllowed: 12, isPaid: true, applicableFor: 'All', description: 'Short planned personal leave', status: 'Active' },
      { name: 'Sick Leave (SL)', code: 'SL', daysAllowed: 10, isPaid: true, applicableFor: 'All', description: 'Medical and health recuperation leave', status: 'Active' },
      { name: 'Earned Leave (EL)', code: 'EL', daysAllowed: 15, isPaid: true, applicableFor: 'All', description: 'Accrued annual vacation leave', status: 'Active' },
      { name: 'Maternity Leave (ML)', code: 'ML', daysAllowed: 90, isPaid: true, applicableFor: 'All', description: 'Statutory maternity leave for female employees', status: 'Active' },
      { name: 'Duty Leave (DL)', code: 'DL', daysAllowed: 7, isPaid: true, applicableFor: 'Teaching', description: 'Official CBSE / Board duty or workshop attendance', status: 'Active' }
    ];

    for (const lt of leaveTypesData) {
      await LeaveType.findOneAndUpdate({ code: lt.code }, lt, { upsert: true, new: true });
    }
    console.log('Leave Types seeded.');

    // 4. Salary Templates
    const templatesData = [
      {
        name: 'Senior PGT Teaching Faculty',
        basicSalary: 45000,
        allowances: [
          { name: 'Dearness Allowance (DA)', amount: 9000 },
          { name: 'House Rent Allowance (HRA)', amount: 11000 },
          { name: 'Conveyance Allowance', amount: 3000 },
          { name: 'Academic Special Allowance', amount: 2000 }
        ],
        deductions: [
          { name: 'Provident Fund (PF)', amount: 5400 },
          { name: 'Professional Tax (PT)', amount: 200 },
          { name: 'Income Tax (TDS)', amount: 2500 }
        ],
        description: 'Grade Pay band for Senior Secondary teachers'
      },
      {
        name: 'TGT Teaching Faculty',
        basicSalary: 32000,
        allowances: [
          { name: 'Dearness Allowance (DA)', amount: 6400 },
          { name: 'House Rent Allowance (HRA)', amount: 8000 },
          { name: 'Conveyance Allowance', amount: 2500 }
        ],
        deductions: [
          { name: 'Provident Fund (PF)', amount: 3840 },
          { name: 'Professional Tax (PT)', amount: 200 }
        ],
        description: 'Standard pay package for Secondary School teachers'
      },
      {
        name: 'Administrative & Support Staff',
        basicSalary: 25000,
        allowances: [
          { name: 'House Rent Allowance (HRA)', amount: 6000 },
          { name: 'Special Allowance', amount: 3000 }
        ],
        deductions: [
          { name: 'Provident Fund (PF)', amount: 3000 },
          { name: 'Professional Tax (PT)', amount: 200 }
        ],
        description: 'Pay structure for front-office, accountants, and lab staff'
      }
    ];

    for (const t of templatesData) {
      const allowancesSum = t.allowances.reduce((acc, a) => acc + a.amount, 0);
      const deductionsSum = t.deductions.reduce((acc, d) => acc + d.amount, 0);
      t.grossSalary = t.basicSalary + allowancesSum;
      t.totalDeductions = deductionsSum;
      t.netSalary = t.grossSalary - deductionsSum;
      await SalaryTemplate.findOneAndUpdate({ name: t.name }, t, { upsert: true, new: true });
    }
    console.log('Salary Templates seeded.');

    // 5. Staff Loans & Leaves for existing teachers
    const staffList = await Staff.find().limit(4);
    if (staffList.length > 0) {
      // Seed Loan
      await StaffLoan.findOneAndUpdate(
        { employeeCode: staffList[0].staffId },
        {
          staff: staffList[0]._id,
          staffName: staffList[0].fullName,
          employeeCode: staffList[0].staffId,
          amount: 50000,
          interestRate: 0,
          repaymentMonths: 10,
          monthlyDeduction: 5000,
          totalRepaid: 15000,
          remainingAmount: 35000,
          purpose: 'Home Renovation & Festival Advance',
          status: 'Active',
          disbursementDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        },
        { upsert: true }
      );

      // Seed Leaves
      await Leave.findOneAndUpdate(
        { reason: 'Attending National Science Congress' },
        {
          applicantType: 'Staff',
          staffId: staffList[0]._id,
          leaveType: 'Duty Leave (DL)',
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          reason: 'Attending National Science Congress',
          status: 'Pending',
          remarks: 'Under review by Academic Director'
        },
        { upsert: true }
      );

      if (staffList.length > 1) {
        await Leave.findOneAndUpdate(
          { reason: 'Severe viral fever and medical recuperation' },
          {
            applicantType: 'Staff',
            staffId: staffList[1]._id,
            leaveType: 'Sick Leave (SL)',
            startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            reason: 'Severe viral fever and medical recuperation',
            status: 'Approved',
            remarks: 'Approved with medical certificate attached'
          },
          { upsert: true }
        );
      }
      console.log('Staff Loans and Leaves seeded.');
    }

    // 6. Appraisal Cycle & Criteria
    const cycle = await AppraisalCycle.findOneAndUpdate(
      { title: 'Annual Academic Faculty Review 2026-2027' },
      {
        title: 'Annual Academic Faculty Review 2026-2027',
        session: '2026-2027',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'Active',
        description: 'Comprehensive 360-degree teacher evaluation cycle'
      },
      { upsert: true, new: true }
    );

    const criteriaData = [
      { name: 'Pedagogical Mastery & Concept Delivery', category: 'Instructional Skills', maxScore: 10, weightage: 30, description: 'Effectiveness of lesson explanation in classroom' },
      { name: 'Student Engagement & Learning Outcomes', category: 'Classroom Management', maxScore: 10, weightage: 25, description: 'Student assessment scores and pass percentages' },
      { name: 'Punctuality & Administrative Adherence', category: 'Professional Conduct', maxScore: 10, weightage: 20, description: 'Timely syllabus completion and attendance' },
      { name: 'Extra-Curricular Participation', category: 'Institutional Contribution', maxScore: 10, weightage: 25, description: 'Coordination of clubs, sports, and school events' }
    ];

    for (const c of criteriaData) {
      await AppraisalCriterion.findOneAndUpdate({ name: c.name }, c, { upsert: true, new: true });
    }

    // 7. Staff Appraisals
    if (staffList.length > 0) {
      await StaffAppraisal.findOneAndUpdate(
        { staff: staffList[0]._id, cycle: cycle._id },
        {
          staff: staffList[0]._id,
          staffName: staffList[0].fullName,
          designation: staffList[0].designation || 'Teacher',
          department: staffList[0].department || 'Academic',
          cycle: cycle._id,
          cycleTitle: cycle.title,
          overallRating: 4.8,
          performanceScore: 94,
          strengths: 'Exceptional student mentorship and 100% board exam pass rate',
          areasForImprovement: 'Can incorporate more smart board simulations',
          evaluator: 'Principal',
          status: 'Approved'
        },
        { upsert: true }
      );
    }
    console.log('Appraisals and Criteria seeded.');

    console.log('All HR Seed Data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding HR data:', error);
    process.exit(1);
  }
}

seedHR();
