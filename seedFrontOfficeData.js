const mongoose = require('mongoose');
const { 
  Visitor, 
  Complaint, 
  AdmissionEnquiry, 
  PostalRecord, 
  GatePass, 
  CampusWorker 
} = require('./models/FrontOffice');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';

async function seedFrontOffice() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Front Office seeding...');

    // Clear existing front office collections
    await Promise.all([
      Visitor.deleteMany({}),
      Complaint.deleteMany({}),
      AdmissionEnquiry.deleteMany({}),
      PostalRecord.deleteMany({}),
      GatePass.deleteMany({}),
      CampusWorker.deleteMany({})
    ]);
    console.log('Cleared existing Front Office collections.');

    // 1. Seed Admission Enquiries
    const enquiriesData = [
      {
        studentName: 'Aarav Sharma',
        parentName: 'Ramesh Sharma',
        phone: '9876501234',
        email: 'ramesh.sharma@example.com',
        classApplied: 'Class I',
        source: 'Walk-in Reception',
        enquiryDate: new Date('2026-08-11'),
        nextFollowUp: new Date('2026-08-18'),
        status: 'Followed-up',
        assignedTo: 'Counselor Ananya',
        notes: 'Inquired about CBSE English curriculum and bus facility for Sector 14.'
      },
      {
        studentName: 'Diya Patel',
        parentName: 'Hiren Patel',
        phone: '9876501235',
        email: 'hiren.patel@example.com',
        classApplied: 'Nursery',
        source: 'Online Website',
        enquiryDate: new Date('2026-08-11'),
        nextFollowUp: new Date('2026-08-19'),
        status: 'Pending',
        assignedTo: 'Counselor Ananya',
        notes: 'Submitted online enquiry form. Requested campus walkthrough.'
      },
      {
        studentName: 'Rohan Gupta',
        parentName: 'Rajesh Gupta',
        phone: '9876501236',
        email: 'rajesh.gupta@example.com',
        classApplied: 'Class V',
        source: 'Referral',
        enquiryDate: new Date('2026-08-10'),
        nextFollowUp: new Date('2026-08-15'),
        status: 'Admitted',
        assignedTo: 'Admission Head Priya',
        notes: 'Transferred from previous school. Admission confirmed and fee paid.'
      },
      {
        studentName: 'Ananya Verma',
        parentName: 'Suresh Verma',
        phone: '9876501237',
        email: 'suresh.verma@example.com',
        classApplied: 'Class X',
        source: 'Newspaper Ad',
        enquiryDate: new Date('2026-08-06'),
        nextFollowUp: new Date('2026-08-14'),
        status: 'Followed-up',
        assignedTo: 'Counselor Ananya',
        notes: 'Interested in Science stream elective subjects.'
      },
      {
        studentName: 'Vivaan Joshi',
        parentName: 'Manoj Joshi',
        phone: '9876501238',
        email: 'manoj.joshi@example.com',
        classApplied: 'Class II',
        source: 'Social Media',
        enquiryDate: new Date('2026-08-04'),
        nextFollowUp: null,
        status: 'Lost',
        assignedTo: 'Admission Head Priya',
        notes: 'Family relocated out of station.'
      },
      {
        studentName: 'Siya Rao',
        parentName: 'Venkat Rao',
        phone: '9876501239',
        email: 'venkat.rao@example.com',
        classApplied: 'Class VII',
        source: 'Walk-in Reception',
        enquiryDate: new Date('2026-08-08'),
        nextFollowUp: new Date('2026-08-20'),
        status: 'Followed-up',
        assignedTo: 'Counselor Ananya',
        notes: 'Campus tour completed. Parent impressed with sports infrastructure.'
      },
      {
        studentName: 'Kabir Singh',
        parentName: 'Gurpreet Singh',
        phone: '9876501240',
        email: 'gurpreet.singh@example.com',
        classApplied: 'Class IV',
        source: 'Direct Call',
        enquiryDate: new Date('2026-08-09'),
        nextFollowUp: new Date('2026-08-16'),
        status: 'Pending',
        assignedTo: 'Admission Head Priya',
        notes: 'Requested fee structure breakdown and sibling discount policy.'
      },
      {
        studentName: 'Meera Reddy',
        parentName: 'Srinivas Reddy',
        phone: '9876501241',
        email: 'srinivas.reddy@example.com',
        classApplied: 'Nursery',
        source: 'Online Website',
        enquiryDate: new Date('2026-08-05'),
        nextFollowUp: null,
        status: 'Admitted',
        assignedTo: 'Counselor Ananya',
        notes: 'Seat confirmed for Nursery batch A.'
      }
    ];

    await AdmissionEnquiry.insertMany(enquiriesData);
    console.log(`Seeded ${enquiriesData.length} Admission Enquiries`);

    // 2. Seed Visitors
    const visitorsData = [
      {
        name: 'Dr. Rajiv Nair',
        phone: '9811223344',
        purpose: 'CBSE Board Inspection',
        meetingWith: 'Principal Office',
        visitorType: 'Official',
        badgeNumber: 'VB-2026-001',
        idProof: 'Government ID',
        idNumber: 'GOV-IND-4412',
        numberOfPersons: 2,
        inTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        outTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'Checked Out',
        notes: 'Annual affiliation and science laboratory audit.'
      },
      {
        name: 'Sunita Kapoor',
        phone: '9822334455',
        purpose: 'Fee Consultation & Transport Change',
        meetingWith: 'Accounts Officer',
        visitorType: 'Parent',
        badgeNumber: 'VB-2026-002',
        idProof: 'Aadhaar Card',
        idNumber: 'XXXX-XXXX-9912',
        numberOfPersons: 1,
        inTime: new Date(Date.now() - 45 * 60 * 1000),
        outTime: null,
        status: 'On Campus',
        notes: 'Parent of Rohan Kapoor (Class IV A).'
      },
      {
        name: 'Amit Bansal',
        phone: '9833445566',
        purpose: 'Winter Uniform Fabric Samples',
        meetingWith: 'Administrative Head',
        visitorType: 'Vendor',
        badgeNumber: 'VB-2026-003',
        idProof: 'Driving License',
        idNumber: 'DL-04-2019-8812',
        numberOfPersons: 1,
        inTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
        outTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'Checked Out',
        notes: 'Apex Uniforms supplier representative.'
      },
      {
        name: 'Preeti Mehra',
        phone: '9844556677',
        purpose: 'Parent-Teacher Meeting (Academic progress)',
        meetingWith: 'Senior PGT Mathematics',
        visitorType: 'Parent',
        badgeNumber: 'VB-2026-004',
        idProof: 'Aadhaar Card',
        idNumber: 'XXXX-XXXX-1142',
        numberOfPersons: 1,
        inTime: new Date(Date.now() - 20 * 60 * 1000),
        outTime: null,
        status: 'On Campus',
        notes: 'Parent of Aryan Mehra (Grade 9).'
      },
      {
        name: 'Inspector Vikram Rathore',
        phone: '9855667788',
        purpose: 'Campus Safety & Fire Drill Protocol',
        meetingWith: 'Vice Principal',
        visitorType: 'Guest',
        badgeNumber: 'VB-2026-005',
        idProof: 'Police ID',
        idNumber: 'POL-DL-7731',
        numberOfPersons: 3,
        inTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
        outTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'Checked Out',
        notes: 'Reviewed emergency evacuation floor maps and assembly ground safety.'
      },
      {
        name: 'Deepak Chawla',
        phone: '9866778899',
        purpose: 'Admission Query & Campus Tour',
        meetingWith: 'Counselor Ananya',
        visitorType: 'Parent',
        badgeNumber: 'VB-2026-006',
        idProof: 'PAN Card',
        idNumber: 'ABCDE1234F',
        numberOfPersons: 2,
        inTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        outTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'Checked Out',
        notes: 'Prospective admission for Class I next session.'
      }
    ];

    await Visitor.insertMany(visitorsData);
    console.log(`Seeded ${visitorsData.length} Visitors`);

    // 3. Seed Gate Passes
    const gatePassesData = [
      {
        passNo: 'GP/2026/00001',
        personType: 'Student',
        personName: 'Ishaan Gupta',
        classSection: 'Nursery A',
        reason: 'Sick / unwell',
        authorizedBy: 'Dr. Joshi (Infirmary)',
        outTime: new Date('2026-08-17T14:21:00'),
        actualReturnTime: new Date('2026-08-17T15:30:00'),
        status: 'Returned',
        notes: 'Mild fever, picked up by mother.'
      },
      {
        passNo: 'GP/2026/00002',
        personType: 'Student',
        personName: 'Avani Verma',
        classSection: 'Class IV A',
        reason: 'Doctor appointment',
        authorizedBy: 'Principal Office',
        outTime: new Date('2026-08-11T15:28:00'),
        actualReturnTime: new Date('2026-08-11T18:58:00'),
        status: 'Returned',
        notes: 'Dentist appointment.'
      },
      {
        passNo: 'GP/2026/00003',
        personType: 'Student',
        personName: 'Kabir Desai',
        classSection: 'Class VII A',
        reason: 'Parent pickup',
        authorizedBy: 'Vice Principal',
        outTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        expectedReturnTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'Out',
        notes: 'Family emergency.'
      },
      {
        passNo: 'GP/2026/00004',
        personType: 'Student',
        personName: 'Aarav Chaudhary',
        classSection: 'Class II A',
        reason: 'Sick / unwell',
        authorizedBy: 'School Infirmary',
        outTime: new Date(Date.now() - 40 * 60 * 1000),
        status: 'Out',
        notes: 'Stomach ache.'
      },
      {
        passNo: 'GP/2026/00005',
        personType: 'Staff',
        personName: 'Priya Singh',
        classSection: 'Science Faculty',
        reason: 'Official duty',
        authorizedBy: 'Principal Office',
        outTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
        status: 'Approved',
        notes: 'Inter-school science quiz coordinator duty at zonal center.'
      },
      {
        passNo: 'GP/2026/00006',
        personType: 'Student',
        personName: 'Riya Malhotra',
        classSection: 'Class X A',
        reason: 'Doctor appointment',
        authorizedBy: 'Class Coordinator',
        outTime: new Date('2026-08-06T10:16:00'),
        actualReturnTime: new Date('2026-08-06T13:40:00'),
        status: 'Returned',
        notes: 'Orthopedic consultation.'
      },
      {
        passNo: 'GP/2026/00007',
        personType: 'Student',
        personName: 'Aryan Kapoor',
        classSection: 'Class V A',
        reason: 'Parent pickup',
        authorizedBy: 'Counselor Office',
        outTime: new Date('2026-08-04T10:18:00'),
        status: 'Cancelled',
        notes: 'Parent requested cancellation.'
      },
      {
        passNo: 'GP/2026/00008',
        personType: 'Student',
        personName: 'Sneha Sen',
        classSection: 'Class I A',
        reason: 'Sick / unwell',
        authorizedBy: 'School Infirmary',
        outTime: new Date(),
        status: 'Approved',
        notes: 'Approved for early departure with guardian.'
      }
    ];

    await GatePass.insertMany(gatePassesData);
    console.log(`Seeded ${gatePassesData.length} Gate Passes`);

    // 4. Seed Campus Workers
    const campusWorkersData = [
      {
        badgeNo: 'CW/2026/00001',
        name: 'Ramesh Kumar',
        phone: '9871100221',
        type: 'Housekeeping',
        contractor: 'CleanFast Facility Services',
        validDate: new Date('2027-03-31'),
        policeCheck: 'Verified',
        state: 'Active',
        logs: [
          { inTime: new Date(Date.now() - 7 * 60 * 60 * 1000), outTime: null, gate: 'Main Gate 1' }
        ]
      },
      {
        badgeNo: 'CW/2026/00002',
        name: 'Baldev Singh',
        phone: '9871100222',
        type: 'Security',
        contractor: 'Apex Guarding Solutions',
        validDate: new Date('2027-03-31'),
        policeCheck: 'Verified',
        state: 'Active',
        logs: [
          { inTime: new Date(Date.now() - 8 * 60 * 60 * 1000), outTime: null, gate: 'East Gate 2' }
        ]
      },
      {
        badgeNo: 'CW/2026/00003',
        name: 'Sunder Lal',
        phone: '9871100223',
        type: 'Gardener',
        contractor: 'GreenThumb Landscaping',
        validDate: new Date('2027-03-31'),
        policeCheck: 'Verified',
        state: 'Active',
        logs: [
          { inTime: new Date(Date.now() - 6 * 60 * 60 * 1000), outTime: null, gate: 'Service Gate 3' }
        ]
      },
      {
        badgeNo: 'CW/2026/00004',
        name: 'Mohammad Irfan',
        phone: '9871100224',
        type: 'Electrician',
        contractor: 'Voltech Engineering',
        validDate: new Date('2027-03-31'),
        policeCheck: 'Verified',
        state: 'Active',
        logs: [
          { inTime: new Date(Date.now() - 5 * 60 * 60 * 1000), outTime: new Date(Date.now() - 1 * 60 * 60 * 1000), gate: 'Main Gate 1' }
        ]
      },
      {
        badgeNo: 'CW/2026/00005',
        name: 'Anita Bai',
        phone: '9871100225',
        type: 'Catering',
        contractor: 'NutriBite Canteen Services',
        validDate: new Date('2027-03-31'),
        policeCheck: 'Pending',
        state: 'Active',
        logs: [
          { inTime: new Date(Date.now() - 7 * 60 * 60 * 1000), outTime: null, gate: 'Service Gate 3' }
        ]
      }
    ];

    await CampusWorker.insertMany(campusWorkersData);
    console.log(`Seeded ${campusWorkersData.length} Campus Workers`);

    // 5. Seed Complaints
    const complaintsData = [
      {
        complainantName: 'Sunita Roy',
        phone: '9812300001',
        complaintType: 'Transport',
        description: 'Route 4 morning bus arrived 25 minutes delayed at Sector 62 pickup point.',
        priority: 'High',
        status: 'In-Progress',
        assignedTo: 'Transport In-charge Mr. Deshmukh',
        actionTaken: 'Driver notified; route alternate assigned due to metro construction detour.'
      },
      {
        complainantName: 'Rajesh Verma',
        phone: '9812300002',
        complaintType: 'Facilities',
        description: 'Restroom hand-dryer and water tap leaking in Academic Block 2 (Second floor).',
        priority: 'Medium',
        status: 'Resolved',
        assignedTo: 'Maintenance Supervisor',
        actionTaken: 'Plumber repaired tap valve and electric sensor calibrated.'
      },
      {
        complainantName: 'Preeti Mehra',
        phone: '9812300003',
        complaintType: 'Academic',
        description: 'Science homework assignment questions not visible on parent mobile app.',
        priority: 'Low',
        status: 'Resolved',
        assignedTo: 'IT Department',
        actionTaken: 'Attachment PDF re-synced and verified on parent portal.'
      },
      {
        complainantName: 'Deepak Sharma',
        phone: '9812300004',
        complaintType: 'Fee & Finance',
        description: 'Discrepancy in quarterly transport charge calculation on Challan #1042.',
        priority: 'High',
        status: 'Open',
        assignedTo: 'Accounts Officer',
        actionTaken: 'Under verification against distance slab matrix.'
      },
      {
        complainantName: 'Anita Desai',
        phone: '9812300005',
        complaintType: 'Canteen',
        description: 'Healthy fresh fruit salad availability requested in junior cafeteria snack counter.',
        priority: 'Low',
        status: 'Open',
        assignedTo: 'Canteen Committee',
        actionTaken: ''
      },
      {
        complainantName: 'Alok Nath',
        phone: '9812300006',
        complaintType: 'Discipline',
        description: 'Minor pushing incident observed near Junior Library during lunch break.',
        priority: 'Medium',
        status: 'In-Progress',
        assignedTo: 'Discipline In-charge',
        actionTaken: 'Corridor monitor assigned additional supervision duty during lunch hours.'
      }
    ];

    await Complaint.insertMany(complaintsData);
    console.log(`Seeded ${complaintsData.length} Complaints`);

    // 6. Seed Postal Records
    const postalData = [
      {
        type: 'Receive',
        fromTitle: 'CBSE Examination Department, New Delhi',
        toTitle: 'Principal Office',
        referenceNo: 'CBSE/EXAM/2026/9941',
        address: 'Shiksha Kendra, 2 Community Centre, Preet Vihar, Delhi',
        date: new Date('2026-08-10'),
        confidential: true,
        postalProvider: 'Speed Post (India Post)',
        notes: 'Class 10 Board Registration Gazette Circular and Roll List guidelines.'
      },
      {
        type: 'Dispatch',
        fromTitle: 'Accounts & Finance Office',
        toTitle: 'District Education Officer (DEO Office)',
        referenceNo: 'DEO/AUDIT/Q2-2026',
        address: 'Civil Lines, Education Directorate, District HQ',
        date: new Date('2026-08-08'),
        confidential: false,
        postalProvider: 'DTDC Courier',
        notes: 'Quarterly Grant & RTE Student Enrolment Utilization Summary.'
      },
      {
        type: 'Receive',
        fromTitle: 'Pearson Education Publishers',
        toTitle: 'Senior School Librarian',
        referenceNo: 'PEAR/INV/5582',
        address: 'DLF Cyber City, Tower B, Gurugram',
        date: new Date('2026-08-06'),
        confidential: false,
        postalProvider: 'BlueDart Express',
        notes: 'Advance Sample Reference Manuals for Grade 9 & 10 Mathematics syllabus.'
      },
      {
        type: 'Dispatch',
        fromTitle: 'Admissions & Scholarships Committee',
        toTitle: 'Selected Merit Scholarship Candidates',
        referenceNo: 'ADM/SCHOLAR/2026/04',
        address: 'Various Parent Residential Addresses',
        date: new Date('2026-08-05'),
        confidential: true,
        postalProvider: 'Speed Post (India Post)',
        notes: 'Formal Merit Scholarship Award Letters for Academic Year 2026-27.'
      },
      {
        type: 'Receive',
        fromTitle: 'Municipal Health & Hygiene Department',
        toTitle: 'School Infirmary & Medical Officer',
        referenceNo: 'MED/VACC/HEALTH/882',
        address: 'Municipal Corporation Health Complex',
        date: new Date('2026-08-02'),
        confidential: false,
        postalProvider: 'Official Courier Delivery',
        notes: 'Annual Monsoon Campus Health & Dengue Precaution Directives.'
      },
      {
        type: 'Dispatch',
        fromTitle: 'Physical Education & Sports Department',
        toTitle: 'State Inter-School Athletics Federation',
        referenceNo: 'SPO/ATHLETICS/2026/12',
        address: 'State Sports Complex, Stadium Road',
        date: new Date('2026-08-01'),
        confidential: false,
        postalProvider: 'Speed Post',
        notes: 'Official Student Athlete Entry Forms for State Track & Field Relay Championship.'
      }
    ];

    await PostalRecord.insertMany(postalData);
    console.log(`Seeded ${postalData.length} Postal Records`);

    console.log('✅ Front Office database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Front Office seeding error:', err);
    process.exit(1);
  }
}

seedFrontOffice();
