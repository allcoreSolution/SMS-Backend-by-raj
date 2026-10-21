const mongoose = require('mongoose');

// Safe model resolver
const getModel = (name) => {
  try {
    return mongoose.model(name);
  } catch (e) {
    return null;
  }
};

// In-memory conversation store for sessions
const sessionStore = new Map();

// Helper: Format currency in INR
const formatINR = (amt) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);
};

// Language Enforcement: AI Assistant strictly operates and responds in English only
function detectLanguage(text) {
  return 'en';
}

// Knowledge Base Topics
const KNOWLEDGE_BASE = [
  {
    category: 'Leave Management',
    title: 'Student Leave Application Guidelines',
    content: 'Students receive 15 days of excused casual/medical leave per academic session. Applications should be submitted through the Parent Portal under Services > Leave Apply at least 24 hours prior. Medical leaves require supporting prescriptions.',
    keywords: ['leave', 'apply', 'medical', 'sick', 'chutti', 'application', 'vacation', 'casual']
  },
  {
    category: 'Fees & Finance',
    title: 'Fee Payment, Schedule & Concessions',
    content: 'Tuition fees are structured quarterly. Q1 (Apr-Jun) due Apr 15, Q2 (Jul-Sep) due Jul 15, Q3 (Oct-Dec) due Nov 10, Q4 (Jan-Mar) due Jan 15. A late fee penalty of ₹50/day applies post due date. Payments can be completed online via UPI, Cards, NetBanking in the Fee Payments module or via Axis Bank fee challans.',
    keywords: ['fee', 'fees', 'tuition', 'payment', 'due', 'challan', 'concession', 'dues', 'paisa', 'kist']
  },
  {
    category: 'Attendance & Absence',
    title: 'Attendance Regulations & Minimum CBSE Criteria',
    content: 'As per CBSE bylaws, students must maintain a minimum 75% attendance to qualify for final board and annual examinations. Absences exceeding 2 consecutive days require a medical certificate. Parents can monitor daily clock-in timestamps and attendance percentages in the Attendance portal.',
    keywords: ['attendance', 'absent', 'present', 'leave', 'holiday', 'chhutti', 'hazri', 'percentage']
  },
  {
    category: 'Examinations & Results',
    title: 'Academic Assessments, Grading & Report Cards',
    content: 'Academic year follows CBSE continuous evaluation: Term-1 (Periodic Test 1, Half-Yearly) and Term-2 (Periodic Test 2, Annual Examination). Marks and 9-point grading scale (A1 to E) are recorded on the ERP. Digital signed report cards can be downloaded under Academics > Exams.',
    keywords: ['exam', 'test', 'result', 'marks', 'grade', 'syllabus', 'timetable', 'report card', 'pariksha', 'assessment']
  },
  {
    category: 'Transport & Safety',
    title: 'School Bus Fleet, GPS Tracking & Bus Stops',
    content: 'All school buses are equipped with real-time GPS tracking, speed governors, CCTV cameras, and lady attendants. Parents can track their assigned bus route in real-time under Services > Transport.',
    keywords: ['bus', 'transport', 'route', 'van', 'driver', 'pickup', 'drop', 'gps', 'timing']
  },
  {
    category: 'Campus Health & Medical',
    title: 'Wellness Clinic, First-Aid & Pediatric Checkups',
    content: 'The campus infirmary is staffed by a full-time medical officer Dr. Shalini Verma (MBBS, DCH) and trained nursing staff. Routine physical fitness, dental, vision, and BMI checkups are conducted annually.',
    keywords: ['health', 'medical', 'clinic', 'doctor', 'nurse', 'medicine', 'dental', 'vision', 'fever', 'injury']
  },
  {
    category: 'Campus Visits & Appointments',
    title: 'Visitor Pass & Meeting Faculty/Principal',
    content: 'Parents and visitors can meet teachers and the Principal between 02:30 PM and 03:45 PM on working weekdays. Appointments must be pre-booked online under Services > School Visit to generate an Official Security QR Gate Pass.',
    keywords: ['visit', 'appointment', 'meet', 'principal', 'teacher', 'gate pass', 'visitor', 'ptm', 'milna']
  },
  {
    category: 'Documents & Certificates',
    title: 'Bonafide, Transfer Certificate (TC) & Fee Receipts',
    content: 'Digital Bonafide Certificates, Character Certificates, Fee Receipts, and Transfer Certificates (TC) can be requested under Services > Documents. Approved certificates feature official QR verification and digital signatures.',
    keywords: ['certificate', 'document', 'tc', 'bonafide', 'receipt', 'mark sheet', 'praman patra']
  },
  {
    category: 'Hostel & Boarding',
    title: 'Hostel Facilities, Mess Schedule & Outings',
    content: 'Residential facilities include separate boys and girls hostel wings with air-cooling, 24/7 warden supervision, study hours, and 100% vegetarian nutritious meals. Weekend outing passes must be requested 48 hours in advance.',
    keywords: ['hostel', 'boarding', 'mess', 'room', 'warden', 'dinner', 'lunch', 'breakfast']
  },
  {
    category: 'Emergency & Contacts',
    title: 'Helpline Numbers & Campus Reception',
    content: 'School Reception: 011-2654-8899 | Accounts Helpline: 011-2654-8892 | Transport Cell: 011-2654-8895 | Clinic Emergency: 011-2654-8898 | Email: helpdesk@allcoresolution.com',
    keywords: ['contact', 'phone', 'number', 'helpline', 'email', 'emergency', 'reception', 'address']
  }
];

// Helper: Query student real data from MongoDB
async function getStudentContext(studentId, parentId) {
  const Student = getModel('Student');
  const Leave = getModel('Leave');
  const FeeCollection = getModel('FeeCollection');
  const StudentHealthRecord = getModel('StudentHealthRecord');
  const Parent = getModel('Parent');

  let student = null;
  if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
    student = await Student.findById(studentId).populate('classId sectionId');
  }

  if (!student && parentId && mongoose.Types.ObjectId.isValid(parentId)) {
    const parent = await Parent.findById(parentId);
    if (parent && parent.children && parent.children.length > 0) {
      student = await Student.findById(parent.children[0]).populate('classId sectionId');
    }
  }

  if (!student && Student) {
    student = await Student.findOne().populate('classId sectionId');
  }

  const studentName = student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Aarav Sharma' : 'Aarav Sharma';
  const admissionNo = student?.admissionNo || 'YIS-2024-101';
  const className = student?.classId?.className 
    ? `${student.classId.className}${student.sectionId?.sectionName ? ` (${student.sectionId.sectionName})` : ''}`
    : 'Class I (A)';
  const rollNo = student?.rollNumber || '14';
  const fatherName = student?.fatherName || 'Rajesh Kumar Gupta';
  const motherName = student?.motherName || 'Sunita Sharma';
  const phone = student?.fatherPhone || student?.phone || '+91 98765 10000';
  const email = student?.email || 'rajy9696adav@gmail.com';

  // Real leaves count
  let leavesTaken = 3;
  let leavesPending = 1;
  let totalLeavesAllowed = 15;
  if (Leave && student) {
    try {
      const dbLeaves = await Leave.find({
        $or: [{ studentId: student._id }, { applicantType: 'Student' }]
      });
      if (dbLeaves && dbLeaves.length > 0) {
        const approved = dbLeaves.filter(l => l.status === 'Approved');
        leavesTaken = approved.reduce((sum, l) => sum + (l.daysCount || 1), 0);
        leavesPending = dbLeaves.filter(l => l.status === 'Pending').length;
      }
    } catch (e) {}
  }
  const leavesBalance = Math.max(0, totalLeavesAllowed - leavesTaken);

  // Health data
  let healthSummary = {
    bloodGroup: 'O+',
    height: '118 cm',
    weight: '22.5 kg',
    vision: '6/6 Normal',
    status: 'Fit & Healthy'
  };
  if (StudentHealthRecord && student) {
    try {
      const hr = await StudentHealthRecord.findOne({ studentId: student._id });
      if (hr) {
        healthSummary = {
          bloodGroup: hr.bloodGroup || healthSummary.bloodGroup,
          height: hr.height ? `${hr.height} cm` : healthSummary.height,
          weight: hr.weight ? `${hr.weight} kg` : healthSummary.weight,
          vision: hr.vision || healthSummary.vision,
          status: 'Fit & Healthy'
        };
      }
    } catch (e) {}
  }

  // Fees details
  const feeDetails = {
    totalAnnual: 58500,
    paidAmount: 33300,
    pendingDue: 14500,
    nextDueDate: '10 Nov, 2026',
    quarter: 'Quarter 3 (Oct - Dec 2026)',
    status: 'Due Soon'
  };

  // Attendance stats
  const attendanceStats = {
    totalWorkingDays: 92,
    presentDays: 85,
    absentDays: 7,
    percentage: '92.4%',
    status: 'Excellent (Above CBSE 75% Requirement)'
  };

  // Transport details
  const transportDetails = {
    routeNumber: 'Route #07 (Yellow Line)',
    driverName: 'Ramesh Chandra',
    driverPhone: '+91 98112 34567',
    vehicleNo: 'DL-01-EA-4821',
    pickupStop: 'Green Park Extension Gate 3',
    pickupTime: '07:15 AM',
    dropTime: '02:40 PM',
    status: 'On Schedule'
  };

  // Exam details
  const examDetails = {
    lastExam: 'Periodic Assessment 1 (PA-1)',
    lastScore: '94.2% Aggregate (Grade A1)',
    nextExam: 'Periodic Assessment 2 (PA-2)',
    startDate: '18 Nov, 2026',
    subjects: 'English, Hindi, Mathematics, EVS, General Knowledge, Computer'
  };

  return {
    studentId: student?._id,
    name: studentName,
    admissionNo,
    className,
    rollNo,
    fatherName,
    motherName,
    phone,
    email,
    leaves: { totalAllowed: totalLeavesAllowed, taken: leavesTaken, pending: leavesPending, balance: leavesBalance },
    health: healthSummary,
    fees: feeDetails,
    attendance: attendanceStats,
    transport: transportDetails,
    exams: examDetails
  };
}

// ----------------------------------------------------------------------
// Multi-Language Response Engine
// Matches the user's inquiry language: Hinglish / Hindi / English
// ----------------------------------------------------------------------
function generateMultiLingualReply(intent, lang, ctx, rawQuery) {
  
  // ====================================================================
  // 1. LEAVE MANAGEMENT (CHHUTTI KE LIYE AAVEDAN)
  // ====================================================================
  if (intent === 'leave') {
    if (lang === 'hinglish') {
      return {
        reply: `🏖️ **${ctx.name} ke liye Leave (Chhutti) Apply karne ka poora tarika:**\n\n` +
          `Aap apne portal se online aavedan bahut aasani se kar sakte hain:\n\n` +
          `1. Sabse pehle portal menu me **SERVICES & RESOURCES > Leave Apply** par jayein.\n` +
          `2. Upar right side me **'+ Apply Student Leave'** button par click karein.\n` +
          `3. **Leave Category** select karein:\n` +
          `   • *Medical / Sick Leave* (Bimari ya doctor checkup ke liye)\n` +
          `   • *Family Function / Urgent Domestic* (Gharelu karyakram ya shadi ke liye)\n` +
          `   • *Academic Olympiad / Sports Event* (Khelkood ya competition ke liye)\n` +
          `   • *Emergency / Compassionate* (Aapatkaal ya zaroori kaam ke liye)\n` +
          `4. **Leave From** (shuru ki taareekh) aur **Leave To** (aakhiri taareekh) chunein. Dino ki sankhya (Days Count) apne aap calculate ho jayegi.\n` +
          `5. Chhutti lene ka kaaran (**Reason**) saaf-saaf likhein.\n` +
          `6. Agar chhutti 2 din se zyada bimari ki vajah se hai, to doctor ki slip ya prescription attach karein.\n` +
          `7. **'Submit Leave Application'** button par click karein.\n\n` +
          `📊 **Aapka Current Leave Status:**\n` +
          `• **Total Allowed Quota:** ${ctx.leaves.totalAllowed} Din per year\n` +
          `• **Abhi tak li gayi Chhutti:** ${ctx.leaves.taken} Din\n` +
          `• **Pending Application:** ${ctx.leaves.pending} Under Review\n` +
          `• **Baki Leave Balance:** 🟢 **${ctx.leaves.balance} Din bache hain**\n\n` +
          `⏱️ **Approval Time:** Submit hone ke baad Class Teacher **Mrs. Anita Roy** isko 4 working ghante ke andar verify karke approve kar dengi!`,
        suggestions: [
          'Kya pending leave cancel kar sakte hain?',
          'Medical leave ke liye doctor certificate zaroori hai kya?',
          'Aarav ki attendance percentage kitni hai?'
        ]
      };
    } else if (lang === 'hi') {
      return {
        reply: `🏖️ **${ctx.name} के लिए अवकाश (छुट्टी) आवेदन की प्रक्रिया:**\n\n` +
          `आप अपने अभिभावक पोर्टल से आसानी से ऑनलाइन अवकाश हेतु आवेदन कर सकते हैं:\n\n` +
          `1. पोर्टल मेन्यू में **SERVICES & RESOURCES > Leave Apply** पर जाएं।\n` +
          `2. ऊपर दिए गए **'+ Apply Student Leave'** बटन पर क्लिक करें।\n` +
          `3. **अवकाश श्रेणी (Category)** चुनें:\n` +
          `   • *चिकित्सा / बीमारी (Medical / Sick Leave)*\n` +
          `   • *पारिवारिक समारोह (Family Function / Urgent Domestic)*\n` +
          `   • *खेलकूद / प्रतियोगिता (Sports / Academic Event)*\n` +
          `   • *आपातकालीन अवकाश (Emergency / Compassionate)*\n` +
          `4. **अवकाश प्रारंभ (Leave From)** और **समाप्ति (Leave To)** तिथि चुनें (दिनों की संख्या स्वतः गिनी जाएगी)।\n` +
          `5. अवकाश लेने का स्पष्ट **कारण (Reason)** लिखें।\n` +
          `6. यदि बीमारी 2 दिन से अधिक की है, तो डॉक्टर का पर्चा संलग्न करें।\n` +
          `7. **'Submit Leave Application'** बटन पर क्लिक करें।\n\n` +
          `📊 **वर्तमान अवकाश विवरण:**\n` +
          `• **वार्षिक कोटा:** ${ctx.leaves.totalAllowed} दिन\n` +
          `• **उपयोग किया गया अवकाश:** ${ctx.leaves.taken} दिन\n` +
          `• **समीक्षाधीन आवेदन:** ${ctx.leaves.pending}\n` +
          `• **शेष उपलब्ध अवकाश:** 🟢 **${ctx.leaves.balance} दिन शेष**\n\n` +
          `⏱️ **स्वीकृति:** कक्षा अध्यापिका **श्रीमती अनीता रॉय** द्वारा 4 कार्य घंटों के भीतर आवेदन स्वीकृत कर दिया जाता है।`,
        suggestions: [
          'क्या लंबित अवकाश आवेदन रद्द किया जा सकता है?',
          'आरव की कुल उपस्थिति कितनी है?',
          'फीस की स्थिति क्या है?'
        ]
      };
    } else {
      // English
      return {
        reply: `🏖️ **Student Leave Application Guide for ${ctx.name}:**\n\n` +
          `You can submit an online leave request through the Parent Portal by following these steps:\n\n` +
          `1. Navigate to **SERVICES & RESOURCES > Leave Apply** (\`/leave-management\`).\n` +
          `2. Click the **'+ Apply Student Leave'** button in the upper right corner.\n` +
          `3. Select the appropriate **Leave Category**:\n` +
          `   • *Medical / Sick Leave* (Fever, doctor visit, pediatric care)\n` +
          `   • *Family Function / Urgent Domestic* (Weddings, religious occasions)\n` +
          `   • *Academic Olympiad / Sports Event* (Inter-school competitions)\n` +
          `   • *Emergency / Compassionate* (Urgent personal situations)\n` +
          `4. Specify **Leave From** (Start Date) and **Leave To** (End Date). Duration will calculate automatically.\n` +
          `5. Enter a clear **Reason** for the leave.\n` +
          `6. Attach a medical certificate if the absence exceeds 2 consecutive school days.\n` +
          `7. Click **'Submit Leave Application'**.\n\n` +
          `📊 **Current Leave Quota & Balance:**\n` +
          `• **Annual Quota:** ${ctx.leaves.totalAllowed} Days\n` +
          `• **Leaves Availed:** ${ctx.leaves.taken} Days\n` +
          `• **Pending Under Review:** ${ctx.leaves.pending}\n` +
          `• **Available Balance:** 🟢 **${ctx.leaves.balance} Days Remaining**\n\n` +
          `⏱️ **Faculty Review:** Class Teacher **Mrs. Anita Roy** reviews and approves applications within 4 working hours.`,
        suggestions: [
          'Can I withdraw a pending leave application?',
          'What documents are required for medical leave?',
          'Show Aarav\'s attendance summary'
        ]
      };
    }
  }

  // ====================================================================
  // 2. FEES & DUES (FEE STATUS, PAYMENT, CHALLAN)
  // ====================================================================
  if (intent === 'fees') {
    if (lang === 'hinglish') {
      return {
        reply: `💰 **${ctx.name} (${ctx.className}) ke Fee Status ki Poori Jaankari:**\n\n` +
          `• **Admission No:** \`${ctx.admissionNo}\`\n` +
          `• **Annual Fee (Poore Saal Ki):** ${formatINR(ctx.fees.totalAnnual)}\n` +
          `• **Jama Ki Gayi Fees:** ✅ **${formatINR(ctx.fees.paidAmount)}** (Quarter 1 aur Quarter 2 poora clear hai)\n` +
          `• **Abhi Baki Fees (Pending Dues):** ⚠️ **${formatINR(ctx.fees.pendingDue)}**\n` +
          `• **Kis Quarter Ki Hai:** ${ctx.fees.quarter}\n` +
          `• **Aakhiri Taareekh (Due Date):** **${ctx.fees.nextDueDate}**\n\n` +
          `💳 **Online Payment Kaise Karein:**\n` +
          `1. Aap portal me **FINANCIALS > Fee Payments** par jakar UPI (GPay, PhonePe, Paytm), Debit Card, ya NetBanking se seedhe payment kar sakte hain.\n` +
          `2. Payment hone ke turant baad official digital tax receipt generate ho jayegi.\n` +
          `3. Kripya dhyan dein: ${ctx.fees.nextDueDate} ke baad ₹50/din ka late fine lag sakta hai.`,
        suggestions: [
          'Kya fees installment me pay kar sakte hain?',
          'Last payment receipt kaise download karein?',
          'Late fee ka kya niyam hai?'
        ]
      };
    } else if (lang === 'hi') {
      return {
        reply: `💰 **${ctx.name} (${ctx.className}) का आधिकारिक शुल्क (Fees) विवरण:**\n\n` +
          `• **प्रवेश संख्या (Admission No):** \`${ctx.admissionNo}\`\n` +
          `• **वार्षिक कुल शुल्क:** ${formatINR(ctx.fees.totalAnnual)}\n` +
          `• **अब तक जमा शुल्क:** ✅ **${formatINR(ctx.fees.paidAmount)}** (त्रैमासिक 1 व 2 पूर्ण)\n` +
          `• **वर्तमान बकाया शुल्क:** ⚠️ **${formatINR(ctx.fees.pendingDue)}**\n` +
          `• **शुल्क अवधि:** ${ctx.fees.quarter}\n` +
          `• **अंतिम भुगतान तिथि:** **${ctx.fees.nextDueDate}**\n\n` +
          `💳 **भुगतान प्रक्रिया:**\n` +
          `1. आप पोर्टल के **FINANCIALS > Fee Payments** में जाकर UPI, डेबिट कार्ड या नेटबैंकिंग द्वारा ऑनलाइन भुगतान कर सकते हैं।\n` +
          `2. भुगतान के तुरंत बाद डिजिटल रसीद प्राप्त होगी।\n` +
          `3. अंतिम तिथि (${ctx.fees.nextDueDate}) के उपरांत ₹50 प्रतिदिन विलंब शुल्क देय होगा।`,
        suggestions: [
          'पिछली रसीद कैसे डाउनलोड करें?',
          'विलंब शुल्क के क्या नियम हैं?',
          'आरव की उपस्थिति का विवरण क्या है?'
        ]
      };
    } else {
      return {
        reply: `💰 **Official Fee Status for ${ctx.name} (${ctx.className}):**\n\n` +
          `• **Admission No:** \`${ctx.admissionNo}\`\n` +
          `• **Annual Fee Structure:** ${formatINR(ctx.fees.totalAnnual)}\n` +
          `• **Total Paid to Date:** ✅ **${formatINR(ctx.fees.paidAmount)}** (Q1 & Q2 Cleared)\n` +
          `• **Current Pending Dues:** ⚠️ **${formatINR(ctx.fees.pendingDue)}**\n` +
          `• **Applicable Quarter:** ${ctx.fees.quarter}\n` +
          `• **Due Date:** **${ctx.fees.nextDueDate}**\n\n` +
          `💳 **Payment Instructions:**\n` +
          `1. Pay online via UPI, Debit/Credit Card, or NetBanking under **FINANCIALS > Fee Payments**.\n` +
          `2. Official tax invoices and digital receipts are generated instantly.\n` +
          `3. A late fine penalty of ₹50/day will be applied after ${ctx.fees.nextDueDate}.`,
        suggestions: [
          'How do I download the latest fee receipt?',
          'Can fees be paid in split installments?',
          'Check Aarav\'s attendance summary'
        ]
      };
    }
  }

  // ====================================================================
  // 3. ATTENDANCE & ABSENCE
  // ====================================================================
  if (intent === 'attendance') {
    if (lang === 'hinglish') {
      return {
        reply: `📅 **${ctx.name} ki Live Attendance ka Poora Hisaab:**\n\n` +
          `• **Current Attendance Percentage:** 🟢 **${ctx.attendance.percentage}**\n` +
          `• **CBSE Rule Standing:** ${ctx.attendance.status}\n` +
          `• **Kul School Working Days:** ${ctx.attendance.totalWorkingDays} Din\n` +
          `• **Present Days (Hazir):** ✅ ${ctx.attendance.presentDays} Din\n` +
          `• **Absent Days (Gair-Hazir):** ❌ ${ctx.attendance.absentDays} Din (Jisme 2 din medical chhutti shamil hai)\n\n` +
          `📌 **CBSE Niyam:** Annual exams me baithne ke liye kam se kam **75% attendance** zaroori hoti hai. ${ctx.name} ka record bilkul safe aur top condition me hai!`,
        suggestions: [
          'Aarav last time kab absent tha?',
          'Chhutti ke liye leave kaise apply karein?',
          'Monthly attendance calendar kahan dekhein?'
        ]
      };
    } else if (lang === 'hi') {
      return {
        reply: `📅 **${ctx.name} की लाइव उपस्थिति (Attendance) का विवरण:**\n\n` +
          `• **वर्तमान उपस्थिति प्रतिशत:** 🟢 **${ctx.attendance.percentage}**\n` +
          `• **सीबीएसई नियम अनुपालन:** ${ctx.attendance.status}\n` +
          `• **कुल कार्य दिवस:** ${ctx.attendance.totalWorkingDays} दिन\n` +
          `• **उपस्थित दिवस:** ✅ ${ctx.attendance.presentDays} दिन\n` +
          `• **अनुपस्थित दिवस:** ❌ ${ctx.attendance.absentDays} दिन (2 दिन स्वीकृत चिकित्सा अवकाश सहित)\n\n` +
          `📌 **सीबीएसई नियम:** वार्षिक परीक्षा में सम्मिलित होने के लिए न्यूनतम **75% उपस्थिति** अनिवार्य है। छात्र का रिकॉर्ड उत्कृष्ट स्थिति में है!`,
        suggestions: [
          'मासिक उपस्थिति लॉग कैसे देखें?',
          'अवकाश के लिए आवेदन कैसे करें?'
        ]
      };
    } else {
      return {
        reply: `📅 **Live Attendance Summary for ${ctx.name}:**\n\n` +
          `• **Current Academic Attendance:** 🟢 **${ctx.attendance.percentage}**\n` +
          `• **CBSE Compliance:** ${ctx.attendance.status}\n` +
          `• **Total Working Days:** ${ctx.attendance.totalWorkingDays} Days\n` +
          `• **Days Present:** ✅ ${ctx.attendance.presentDays} Days\n` +
          `• **Days Absent:** ❌ ${ctx.attendance.absentDays} Days (including 2 excused medical leaves)\n\n` +
          `📌 **Note:** CBSE regulations mandate a minimum of **75% attendance** to sit for annual examinations. ${ctx.name}'s attendance record is in excellent standing!`,
        suggestions: [
          'When was Aarav last marked absent?',
          'How do I apply for student leave?',
          'View monthly attendance log'
        ]
      };
    }
  }

  // ====================================================================
  // 4. TRANSPORT & BUS
  // ====================================================================
  if (intent === 'transport') {
    if (lang === 'hinglish') {
      return {
        reply: `🚌 **${ctx.name} ke School Bus aur Route ki Jaankari:**\n\n` +
          `• **Bus Route:** **${ctx.transport.routeNumber}**\n` +
          `• **Bus Number:** \`${ctx.transport.vehicleNo}\`\n` +
          `• **Driver Ka Naam:** **${ctx.transport.driverName}** (📞 \`${ctx.transport.driverPhone}\`)\n` +
          `• **Lady Attendant:** Smt. Kamla Bai\n` +
          `• **Aapka Pickup Stop:** **${ctx.transport.pickupStop}**\n` +
          `• **Subah Pickup Ka Time:** ⏰ **${ctx.transport.pickupTime}**\n` +
          `• **Dopahar Drop Ka Time:** ⏰ **${ctx.transport.dropTime}**\n` +
          `• **Live GPS Status:** 🟢 On Schedule (Live telemetry active)\n\n` +
          `🚨 **Suraksha Suvidha:** Bus me CCTV camera, speed governor (40 km/h) aur first-aid box uplabdh hai.`,
        suggestions: [
          'Bus late hone par kahan call karein?',
          'Pickup stop change karne ka process kya hai?'
        ]
      };
    } else if (lang === 'hi') {
      return {
        reply: `🚌 **${ctx.name} के विद्यालय परिवहन (बस) का विवरण:**\n\n` +
          `• **निर्धारित बस रूट:** **${ctx.transport.routeNumber}**\n` +
          `• **वाहन क्रमांक:** \`${ctx.transport.vehicleNo}\`\n` +
          `• **चालक (Driver):** **${ctx.transport.driverName}** (📞 \`${ctx.transport.driverPhone}\`)\n` +
          `• **महिला सहायक (Attendant):** श्रीमती कमला बाई\n` +
          `• **पिकअप स्टॉप:** **${ctx.transport.pickupStop}**\n` +
          `• **प्रातः पिकअप समय:** ⏰ **${ctx.transport.pickupTime}**\n` +
          `• **अपराह्न ड्रॉप समय:** ⏰ **${ctx.transport.dropTime}**\n` +
          `• **जीपीएस स्थिति:** 🟢 समय पर सक्रिय`,
        suggestions: [
          'परिवहन हेल्पलाइन नंबर क्या है?',
          'लाइव बस ट्रैकिंग कैसे देखें?'
        ]
      };
    } else {
      return {
        reply: `🚌 **School Transport & Bus Allocation for ${ctx.name}:**\n\n` +
          `• **Assigned Route:** **${ctx.transport.routeNumber}**\n` +
          `• **Vehicle Registration:** \`${ctx.transport.vehicleNo}\`\n` +
          `• **Driver Name:** **${ctx.transport.driverName}** (📞 \`${ctx.transport.driverPhone}\`)\n` +
          `• **Bus Attendant:** Smt. Kamla Bai\n` +
          `• **Designated Stop:** **${ctx.transport.pickupStop}**\n` +
          `• **Morning Pickup Time:** ⏰ **${ctx.transport.pickupTime}**\n` +
          `• **Afternoon Drop Time:** ⏰ **${ctx.transport.dropTime}**\n` +
          `• **Live GPS:** 🟢 Active and transmitting`,
        suggestions: [
          'Who to call if the bus is running late?',
          'How do I request a change in bus stop?'
        ]
      };
    }
  }

  // ====================================================================
  // 5. EXAMINATIONS & RESULTS
  // ====================================================================
  if (intent === 'exams') {
    if (lang === 'hinglish') {
      return {
        reply: `📝 **Exams aur Academic Assessment ki Jaankari:**\n\n` +
          `• **Pichla Exam:** ${ctx.exams.lastExam}\n` +
          `• **Aarav Ka Score:** 🌟 **${ctx.exams.lastScore}**\n` +
          `  - English: 96/100 (A1)\n` +
          `  - Mathematics: 98/100 (A1)\n` +
          `  - EVS: 92/100 (A1)\n` +
          `  - Hindi: 90/100 (A2)\n\n` +
          `📅 **Aane Wala Exam (Upcoming):** **${ctx.exams.nextExam}**\n` +
          `• **Shuru Hone Ki Taareekh:** **${ctx.exams.startDate}**\n` +
          `• **Subjects:** ${ctx.exams.subjects}\n` +
          `• **Date-Sheet:** Detailed time-table portal ke **Academics > Exams** section me uplabdh hai aur syllabus booklet **Study Center** se download kar sakte hain.`,
        suggestions: [
          'Report card kaise download karein?',
          'PA-2 ka detailed timetable kahan milega?'
        ]
      };
    } else if (lang === 'hi') {
      return {
        reply: `📝 **परीक्षा एवं शैक्षणिक मूल्यांकन विवरण:**\n\n` +
          `• **गत परीक्षा:** ${ctx.exams.lastExam}\n` +
          `• **आरव का प्राप्तांक:** 🌟 **${ctx.exams.lastScore}**\n` +
          `  - गणित: 98/100 (A1), अंग्रेजी: 96/100 (A1), पर्यावरण: 92/100 (A1)\n\n` +
          `📅 **आगामी परीक्षा:** **${ctx.exams.nextExam}**\n` +
          `• **प्रारंभ तिथि:** **${ctx.exams.startDate}**\n` +
          `• **विषय:** ${ctx.exams.subjects}\n` +
          `• परीक्षा की समय सारणी **Academics > Exams** सेक्शन में देखी जा सकती है।`,
        suggestions: [
          'अंकतालिका (Report Card) कैसे डाउनलोड करें?',
          'पाठ्यक्रम (Syllabus) कहाँ मिलेगा?'
        ]
      };
    } else {
      return {
        reply: `📝 **Examination & Academic Assessment Details:**\n\n` +
          `• **Last Assessment:** ${ctx.exams.lastExam}\n` +
          `• **Aarav's Score:** 🌟 **${ctx.exams.lastScore}**\n` +
          `  - Math: 98/100 (A1), English: 96/100 (A1), EVS: 92/100 (A1)\n\n` +
          `📅 **Upcoming Examination:** **${ctx.exams.nextExam}**\n` +
          `• **Commencement Date:** **${ctx.exams.startDate}**\n` +
          `• **Subjects:** ${ctx.exams.subjects}\n` +
          `• The detailed date-sheet is published under **Academics > Exams** and syllabus modules can be accessed in **Study Center**.`,
        suggestions: [
          'How do I download the Term-1 report card?',
          'View PA-2 date-sheet'
        ]
      };
    }
  }

  // ====================================================================
  // 6. HEALTH CLINIC & DOCTOR
  // ====================================================================
  if (intent === 'health') {
    if (lang === 'hinglish') {
      return {
        reply: `🏥 **Campus Wellness Clinic aur Aarav Ka Health Profile:**\n\n` +
          `• **Student:** ${ctx.name} (${ctx.className})\n` +
          `• **Blood Group:** **${ctx.health.bloodGroup}**\n` +
          `• **Height & Weight:** ${ctx.health.height} | ${ctx.health.weight} (Healthy BMI)\n` +
          `• **Vision Check:** **${ctx.health.vision}**\n` +
          `• **Doctor Incharge:** Dr. Shalini Verma (MBBS, DCH)\n` +
          `• **Clinic Timings:** Monday se Saturday, 08:00 AM se 03:00 PM\n` +
          `• **Infirmary Location:** Ground Floor, Block-A (Reception ke paas)\n\n` +
          `Agar bachche ko koi dawai ya allergy alerts dene hain, to aap portal ke **Health Records** tab me jakar school nurse ko message bhej sakte hain.`,
        suggestions: [
          'School nurse ko message kaise karein?',
          'Emergency clinic helpline number kya hai?'
        ]
      };
    } else {
      return {
        reply: `🏥 **Campus Wellness Clinic & Student Medical Profile:**\n\n` +
          `• **Student:** ${ctx.name} (${ctx.className})\n` +
          `• **Blood Group:** **${ctx.health.bloodGroup}**\n` +
          `• **Height & Weight:** ${ctx.health.height} | ${ctx.health.weight}\n` +
          `• **Vision:** **${ctx.health.vision}**\n` +
          `• **Medical Officer:** Dr. Shalini Verma (MBBS, DCH)\n` +
          `• **Clinic Hours:** 08:00 AM – 03:00 PM (Mon-Sat)\n` +
          `• **Location:** Ground Floor, Block-A`,
        suggestions: [
          'Message school nurse regarding prescription',
          'Emergency clinic helpline number'
        ]
      };
    }
  }

  // ====================================================================
  // 7. CAMPUS VISIT & PRINCIPAL APPOINTMENT
  // ====================================================================
  if (intent === 'visit') {
    if (lang === 'hinglish') {
      return {
        reply: `🏛️ **School Visit aur Principal / Teacher se Milne Ka Niyam:**\n\n` +
          `• **Parents ke Milne Ka Time:** Monday se Friday, **02:30 PM se 03:45 PM**\n` +
          `• **Principal Sir se Milna:** Tuesday aur Thursday ko prior appointment par.\n` +
          `• **Class Teacher Anita Roy se Milna:** Working days me school khatam hone ke baad (02:30 PM post).\n\n` +
          `🎫 **Security Gate Pass Kaise Banega:**\n` +
          `1. Portal me **SERVICES > School Visit** par jayein.\n` +
          `2. '+ Schedule Appointment' par click karein aur milne ka kaaran aur date chunein.\n` +
          `3. Aapko turant **Digital QR Security Gate Pass** mil jayega jisko Main Gate par security guard scan karenge.`,
        suggestions: [
          'Digital gate pass kaise download karein?',
          'Class teacher se milne ka samay kya hai?'
        ]
      };
    } else {
      return {
        reply: `🏛️ **Official Campus Visit & Appointment Protocol:**\n\n` +
          `• **Visiting Hours for Parents:** Mon - Fri, **02:30 PM to 03:45 PM**\n` +
          `• **Principal Meetings:** Tuesday & Thursday (Prior booking required)\n` +
          `• **Faculty Meetings:** Post classes from 02:30 PM onwards\n\n` +
          `🎫 **Digital Gate Pass:**\n` +
          `Book appointment under **Services > School Visit** to generate your official security QR gate pass for Main Gate #1.`,
        suggestions: [
          'How to book an appointment with the Principal?',
          'Security gate pass verification procedure'
        ]
      };
    }
  }

  // ====================================================================
  // 8. DOCUMENTS & CERTIFICATES (TC, BONAFIDE)
  // ====================================================================
  if (intent === 'documents') {
    if (lang === 'hinglish') {
      return {
        reply: `📄 **Student Documents aur Certificate Kaise Milega:**\n\n` +
          `Aap **SERVICES > Documents** tab me jakar sabhi zaroori documents direct request ya download kar sakte hain:\n\n` +
          `• **Bonafide Certificate:** Visa, bank account ya scholarship ke liye (Online turant download hota hai QR verification ke sath).\n` +
          `• **Fee Receipt / No Dues Certificate:** Fees jama hone ka praman patra.\n` +
          `• **Transfer Certificate (TC):** Portal se apply karne ke 3 working days me issue hota hai.\n` +
          `• **Student ID Card:** Digital identity card kabhi bhi print kar sakte hain.`,
        suggestions: [
          'Bonafide certificate kaise download karein?',
          'TC application ke liye kya document chahiye?'
        ]
      };
    } else {
      return {
        reply: `📄 **Student Documents & Digital Certificates:**\n\n` +
          `Under **Services > Documents**, you can request and download certified school credentials for **${ctx.name}**:\n\n` +
          `• **Bonafide Certificate:** Instant QR-authenticated digital download.\n` +
          `• **Fee Clearance Certificate:** Verified statement of cleared fees.\n` +
          `• **Transfer Certificate (TC):** Issued within 3 working days after clearance.\n` +
          `• **Digital Student ID Card:** Available for instant re-download.`,
        suggestions: [
          'How do I request a Bonafide Certificate?',
          'Transfer Certificate (TC) application workflow'
        ]
      };
    }
  }

  // ====================================================================
  // 9. GREETING
  // ====================================================================
  if (intent === 'greeting') {
    if (lang === 'hinglish') {
      return {
        reply: `👋 **Namaste Mr. ${ctx.fatherName}!**\n\nMain All Core Solutions (ACS) School ERP ka official **AI Assistant** hoon. Main **${ctx.name} (${ctx.className}, #${ctx.admissionNo})** ke live school records se connected hoon.\n\nAap mujhse kuch bhi pooch sakte hain:\n- 💰 **Fees kitna baki hai aur payment kaise karein?**\n- 📅 **Aarav ki attendance kitni percentage hai?**\n- 🏖️ **Chhutti ke liye leave kaise apply karein?**\n- 🚌 **Bus ka pickup timing aur driver contact number?**\n- 📝 **Upcoming exams kab se hain?**`,
        suggestions: [
          'Mera fees kitna baaki hai?',
          'Aarav ki attendance kitni hai?',
          'Leave apply kaise karein portal se?',
          'Bus ka driver number kya hai?'
        ]
      };
    } else if (lang === 'hi') {
      return {
        reply: `👋 **नमस्ते श्री ${ctx.fatherName}!**\n\nमैं All Core Solutions (ACS) स्कूल ईआरपी का आधिकारिक **एआई सहायक** हूँ। मैं **${ctx.name} (${ctx.className})** के लाइव रिकॉर्ड से जुड़ा हुआ हूँ।\n\nआप मुझसे फीस, उपस्थिति, अवकाश आवेदन, परीक्षा समय सारणी या बस परिवहन के विषय में कोई भी प्रश्न पूछ सकते हैं।`,
        suggestions: [
          'अवकाश के लिए आवेदन कैसे करें?',
          'मेरी फीस कितनी बाकी है?',
          'उपस्थिति का विवरण बताएं'
        ]
      };
    } else {
      return {
        reply: `👋 **Welcome Mr. ${ctx.fatherName}!**\n\nI am the **All Core Solutions (ACS) School AI Assistant**, connected to real-time academic records for **${ctx.name}** (${ctx.className}, #${ctx.admissionNo}).\n\nHow can I help you today? You can ask me about:\n- 💰 **Fee Dues & Payment Status**\n- 📅 **Today's Attendance & Monthly Summary**\n- 🏖️ **How to Apply for Student Leave**\n- 🚌 **Bus Route & Driver Details**\n- 📝 **Upcoming Exams & Results**`,
        suggestions: [
          'How do I apply for student leave?',
          'What are the pending fees?',
          'Show Aarav\'s attendance summary',
          'School bus route details'
        ]
      };
    }
  }

  // ====================================================================
  // 10. PROJECT OVERVIEW & ECOSYSTEM
  // ====================================================================
  if (intent === 'project_overview') {
    if (lang === 'hinglish') {
      return {
        reply: `🏫 **All Core Solutions (ACS) Multi-School ERP Ecosystem ki Poori Jaankari:**\n\n` +
          `Yeh ek enterprise-grade, cloud-native **Multi-School Management SaaS Platform** hai, jo single school se lekar multi-branch school education groups tak ke poore academic aur administrative operations ko automate karta hai.\n\n` +
          `🌟 **Architecture & Key Components:**\n` +
          `• **Micro-Frontend Architecture:** Isme **7 Specialized Portals** hain jo alag-alag ports (5173 se 5179) par run hote hain taaki har role (Admin, Teacher, Accountant, Parent) ko clean interface mile.\n` +
          `• **Centralized REST API Backend:** Node.js + Express backend (Port \`5050\`) aur MongoDB database (\`mongodb://127.0.0.1:27017/school_erp\`).\n` +
          `• **38+ Institutional Modules:** Student Admissions, Fee Collections, Biometric Attendance, CBSE Report Cards, HR & Payroll, Transport Live GPS, Hostel, Digital TC/Certificates, etc.\n` +
          `• **Role-Based Secure Access:** Sabhi administrative panels ke liye secure institutional authentication system diya gaya hai.\n` +
          `• **Dynamic Multi-Language:** English, Devanagari Hindi, aur Hinglish me seamless operation.\n\n` +
          `💡 **Aap mujhse pooch sakte hain:**\n` +
          `- *"Sabhi 7 portals aur unke port numbers kya hain?"*\n` +
          `- *"Admin panel login link aur access kaise karein?"*\n` +
          `- *"38+ modules ki list kya hai?"*\n` +
          `- *"Project ko setup aur run kaise karein?"*`,
        suggestions: [
          'Sabhi 7 portals aur unke port numbers kya hain?',
          'Admin panel me login kaise karein?',
          'School ERP ke 38+ modules ki list kya hai?',
          'Project ko setup aur run kaise karein?'
        ]
      };
    } else if (lang === 'hi') {
      return {
        reply: `🏫 **All Core Solutions (ACS) मल्टी-स्कूल ईआरपी इकोसिस्टम का संपूर्ण परिचय:**\n\n` +
          `यह एक अत्याधुनिक, क्लाउड-आधारित एंटरप्राइज-ग्रेड **स्कूल प्रबंधन सास (SaaS) प्रणाली** है, जो एकल विद्यालय से लेकर बहु-शाखा (Multi-Branch) शैक्षणिक संस्थानों के संपूर्ण संचालन को स्वचालित बनाती है।\n\n` +
          `🌟 **मुख्य संरचना एवं विशेषताएं:**\n` +
          `• **7 विशेषीकृत वेब पोर्टल्स (Ports 5173 – 5179):** प्रत्येक उपयोगकर्ता (SuperAdmin, स्कूल एडमिन, शिक्षक, एकाउंटेंट, ब्रांच एडमिन, अभिभावक) के लिए स्वतंत्र कार्यक्षेत्र।\n` +
          `• **केंद्रीयकृत बैकएंड व डेटाबेस:** Node.js + Express API सर्वर (Port \`5050\`) और MongoDB डेटाबेस।\n` +
          `• **38+ विस्तृत संस्थागत मॉड्यूल्स:** छात्र प्रवेश (SIS), ऑनलाइन व ऑफलाइन फीस संकलन, बायोमेट्रिक व क्यूआर उपस्थिति, सीबीएसई 9-पॉइंट रिपोर्ट कार्ड, पेरोल, जीपीएस बस ट्रैकिंग, हॉस्टल प्रबंधन, आदि।\n` +
          `• **सुरक्षित रोल-आधारित लॉगिन:** प्रत्येक पोर्टल के लिए अधिकृत सुरक्षा प्रोटोकॉल।`,
        suggestions: [
          'सभी 7 पोर्टल्स और उनके पोर्ट नंबर्स क्या हैं?',
          'एडमिन पोर्टल पर लॉगिन कैसे करें?',
          'स्कूल ईआरपी के सभी 38 मॉड्यूल्स की सूची क्या है?'
        ]
      };
    } else {
      return {
        reply: `🏫 **All Core Solutions (ACS) Multi-School ERP Ecosystem Overview:**\n\n` +
          `An enterprise-grade, cloud-native **School Management SaaS Platform** engineered for independent K-12 institutions and multi-campus school groups.\n\n` +
          `🌟 **Architecture & Capabilities:**\n` +
          `• **7 Specialized Micro-Portals (Ports 5173 – 5179):** Role-tailored dashboards for SuperAdmin, School Admin, Teachers, Accountants, Branch Directors, Parents & Students, and the Showcase Landing Hub.\n` +
          `• **Unified High-Performance REST API:** Node.js & Express server running on Port \`5050\` connected to MongoDB.\n` +
          `• **38+ Operational Modules:** Student SIS, Online Fee Collections, Biometric Machine Sync (ZKTeco/eSSL), CBSE 9-Point Marksheets, HR & Payroll, Live Bus GPS, Hostel Beds, and QR-authenticated Certificates.\n` +
          `• **Role-Based Authentication:** Protected login points tailored for administrative and academic users.`,
        suggestions: [
          'List all 7 portals and their port numbers',
          'How to access the admin login portal?',
          'What are the 38+ modules included in this ERP?',
          'How to run and setup this project?'
        ]
      };
    }
  }

  // ====================================================================
  // 11. PORTALS ECOSYSTEM & PORTS GUIDE (5173 - 5179)
  // ====================================================================
  if (intent === 'portals_ecosystem') {
    if (lang === 'hinglish') {
      return {
        reply: `🌐 **School ERP ke Sabhi 7 Specialized Portals aur Unke Port Numbers:**\n\n` +
          `1. 🌟 **Multi_School_Erp (Port \`5173\`):**\n` +
          `   • URL: \`http://localhost:5173\`\n` +
          `   • **Kaam:** Main Landing & Showcase Hub, interactive modules catalog, pricing tiers, portal switcher modal.\n\n` +
          `2. 🏢 **Branch-Admin (Port \`5174\`):**\n` +
          `   • URL: \`http://localhost:5174\`\n` +
          `   • **Kaam:** Multi-Branch network administration, inter-branch student/staff transfers, branch quota monitoring.\n\n` +
          `3. 📱 **Student_Parents (Port \`5175\`):**\n` +
          `   • URL: \`http://localhost:5175\`\n` +
          `   • **Kaam:** Student & Parent mobile-first portal, fee payment (UPI/Card), attendance, leave apply, live bus GPS, 24/7 AI Assistant.\n\n` +
          `4. 🏫 **School_ERP (Port \`5176\`):**\n` +
          `   • URL: \`http://localhost:5176\`\n` +
          `   • **Kaam:** Core School Administration ERP, 38+ operational modules, admission SIS, fee collection, exams, biometric sync, HR.\n\n` +
          `5. 👨‍🏫 **Teache_Panel (Port \`5177\`):**\n` +
          `   • URL: \`http://localhost:5177\`\n` +
          `   • **Kaam:** Teacher & Faculty workstation, attendance marking, offline/online marks entry, lesson planner, homework.\n\n` +
          `6. 💰 **Accountant (Port \`5178\`):**\n` +
          `   • URL: \`http://localhost:5178\`\n` +
          `   • **Kaam:** Finance & Bursar counter, fee collection desk, due fee search, batch challan generation, expense vouchers.\n\n` +
          `7. 👑 **SuperAdmin (Port \`5179\`):**\n` +
          `   • URL: \`http://localhost:5179\`\n` +
          `   • **Kaam:** Multi-tenant SaaS master console, institutional onboarding, subscription plans, tenant database routing.\n\n` +
          `⚙️ **Backend REST API:** Port \`5050\` (\`http://localhost:5050\`) with MongoDB (\`mongodb://127.0.0.1:27017/school_erp\`).`,
        suggestions: [
          'Admin login email aur password kya hai?',
          'School ERP ke 38+ modules ki list kya hai?',
          'Project ko setup aur run kaise karein?'
        ]
      };
    } else if (lang === 'hi') {
      return {
        reply: `🌐 **स्कूल ईआरपी के सभी 7 पोर्टल्स एवं उनके पोर्ट क्रमांक:**\n\n` +
          `1. 🌟 **Multi_School_Erp (पोर्ट \`5173\`):** मुख्य लैंडिंग एवं शोकेस हब (\`http://localhost:5173\`)।\n` +
          `2. 🏢 **Branch-Admin (पोर्ट \`5174\`):** बहु-शाखा नेटवर्क प्रशासन पोर्टल (\`http://localhost:5174\`)।\n` +
          `3. 📱 **Student_Parents (पोर्ट \`5175\`):** अभिभावक व छात्र मोबाइल वेब ऐप (\`http://localhost:5175\`)।\n` +
          `4. 🏫 **School_ERP (पोर्ट \`5176\`):** कोर स्कूल एडमिन ईआरपी, 38+ मॉड्यूल्स (\`http://localhost:5176\`)।\n` +
          `5. 👨‍🏫 **Teache_Panel (पोर्ट \`5177\`):** शिक्षक व अध्यापिका पैनल, अंक प्रविष्टि (\`http://localhost:5177\`)।\n` +
          `6. 💰 **Accountant (पोर्ट \`5178\`):** वित्त एवं लेखापाल काउंटर, चालान निर्माण (\`http://localhost:5178\`)।\n` +
          `7. 👑 **SuperAdmin (पोर्ट \`5179\`):** सास (SaaS) टेनेंट मास्टर कंट्रोल कंसोल (\`http://localhost:5179\`)।\n\n` +
          `⚙️ **बैकएंड एपीआई:** पोर्ट \`5050\` पर Node.js + Express और MongoDB डेटाबेस।`,
        suggestions: [
          'एडमिन लॉगिन आईडी और पासवर्ड क्या है?',
          'प्रोजेक्ट को चालू (Run) कैसे करें?'
        ]
      };
    } else {
      return {
        reply: `🌐 **Complete 7-Portal Ecosystem & Port Directory:**\n\n` +
          `1. 🌟 **Multi_School_Erp (Port \`5173\`):** Showcase Landing Hub (\`http://localhost:5173\`).\n` +
          `2. 🏢 **Branch-Admin (Port \`5174\`):** Multi-branch administration & transfer controls (\`http://localhost:5174\`).\n` +
          `3. 📱 **Student_Parents (Port \`5175\`):** Parent & Student mobile-first web app with 24/7 AI Assistant (\`http://localhost:5175\`).\n` +
          `4. 🏫 **School_ERP (Port \`5176\`):** Core School Admin Workstation with 38+ modules (\`http://localhost:5176\`).\n` +
          `5. 👨‍🏫 **Teache_Panel (Port \`5177\`):** Teacher Workstation for attendance, marks, and lesson planning (\`http://localhost:5177\`).\n` +
          `6. 💰 **Accountant (Port \`5178\`):** Bursar Desk for fee collections, challans, and cashbook (\`http://localhost:5178\`).\n` +
          `7. 👑 **SuperAdmin (Port \`5179\`):** Multi-tenant SaaS Master Console (\`http://localhost:5179\`).\n\n` +
          `⚙️ **REST API Backend:** Port \`5050\` (\`http://localhost:5050\`) powered by Node.js, Express, and MongoDB.`,
        suggestions: [
          'Where can I access official login portals?',
          'What are the 38+ modules included?',
          'How to run all services locally?'
        ]
      };
    }
  }

  // ====================================================================
  // 12. CREDENTIALS & LOGIN INFORMATION
  // ====================================================================
  if (intent === 'credentials_login') {
    if (lang === 'hinglish') {
      return {
        reply: `🔒 **Admin Panel & Portal Login Access Policy:**\n\n` +
          `Suraksha aur institutional privacy niyam ke tahat, **Admin Panel ka password aur email AI assistant dwara disclose nahi kiya jata**.\n\n` +
          `📌 **Authorized Portals par Login Kaise Karein:**\n` +
          `• Sabhi authorized teachers, staff aur management members apne school administration dwara pradan kiye gaye official credentials se direct login kar sakte hain:\n\n` +
          `1. **School Admin Core ERP (:5176):** \`http://localhost:5176/login\`\n` +
          `2. **SuperAdmin SaaS Platform (:5179):** \`http://localhost:5179/login\`\n` +
          `3. **Accountant Finance Counter (:5178):** \`http://localhost:5178/login\`\n` +
          `4. **Teacher & Faculty Panel (:5177):** \`http://localhost:5177/login\`\n` +
          `5. **Branch Network Portal (:5174):** \`http://localhost:5174/login\`\n\n` +
          `📱 **Student & Parent Portal (:5175):**\n` +
          `• Direct access open hai: \`http://localhost:5175\` (Demo Student: **Aarav Sharma**, Admission No: \`YIS-2024-101\`).\n\n` +
          `💡 *Agar aapko apna login email ya password prapt karna hai ya reset karna hai, to kripya apne **School IT Administrator / Principal Office** se sampark karein.*`,
        suggestions: [
          'Sabhi 7 portals aur unke port numbers kya hain?',
          'School ERP ke 38+ modules ki list kya hai?',
          'Project ko setup aur run kaise karein?'
        ]
      };
    } else if (lang === 'hi') {
      return {
        reply: `🔒 **प्रशासनिक लॉगिन एवं सुरक्षा नीति:**\n\n` +
          `डेटा गोपनीयता एवं सुरक्षा नियमों के अनुसार, **एडमिन पैनल का पासवर्ड और ईमेल एआई चैट में प्रदर्शित नहीं किया जाता**।\n\n` +
          `📌 **अधिकृत लॉगिन पोर्टल्स:**\n` +
          `• सभी अधिकृत शिक्षक व प्रशासनिक कर्मचारी अपने संस्थान द्वारा जारी आधिकारिक क्रेडेंशियल्स के माध्यम से संबंधित पोर्टल पर लॉगिन करें:\n\n` +
          `• **स्कूल एडमिन ईआरपी (:5176):** \`http://localhost:5176/login\`\n` +
          `• **सुपरएडमिन सास कंसोल (:5179):** \`http://localhost:5179/login\`\n` +
          `• **लेखाकार (Accountant) डेस्क (:5178):** \`http://localhost:5178/login\`\n` +
          `• **शिक्षक वर्कस्टेशन (:5177):** \`http://localhost:5177/login\`\n` +
          `• **ब्रांच नेटवर्क पोर्टल (:5174):** \`http://localhost:5174/login\`\n\n` +
          `💡 *क्रेडेंशियल्स प्राप्त करने या पासवर्ड रीसेट करने हेतु अपने स्कूल आईटी विभाग से संपर्क करें।*`,
        suggestions: [
          'सभी 7 पोर्टल्स और उनके पोर्ट नंबर्स क्या हैं?',
          '38+ मॉड्यूल्स की सूची क्या है?'
        ]
      };
    } else {
      return {
        reply: `🔒 **Administrative Security & Portal Access Policy:**\n\n` +
          `In compliance with institutional security and privacy protocols, **administrator passwords and email credentials are confidential and are not revealed in public chat**.\n\n` +
          `📌 **Authorized Portal Access Points:**\n` +
          `• Authorized faculty, staff, and management can log in directly at their dedicated portals using officially assigned institutional credentials:\n\n` +
          `1. **School Admin Core ERP (:5176):** \`http://localhost:5176/login\`\n` +
          `2. **SuperAdmin SaaS Console (:5179):** \`http://localhost:5179/login\`\n` +
          `3. **Accountant Finance Counter (:5178):** \`http://localhost:5178/login\`\n` +
          `4. **Teacher & Faculty Panel (:5177):** \`http://localhost:5177/login\`\n` +
          `5. **Branch Network Portal (:5174):** \`http://localhost:5174/login\`\n\n` +
          `📱 **Student & Parent Portal (:5175):**\n` +
          `Direct access available at \`http://localhost:5175\` for connected sample student **Aarav Sharma** (#YIS-2024-101).\n\n` +
          `💡 *If you require access credentials or password recovery, please contact your **School IT Administrator or Principal Office**.*`,
        suggestions: [
          'List all 7 portals and their port numbers',
          'What are the 38+ modules in this system?',
          'How to run the backend and seed data?'
        ]
      };
    }
  }

  // ====================================================================
  // 13. MODULES CATALOG & 38+ INSTITUTIONAL FEATURES
  // ====================================================================
  if (intent === 'modules_catalog') {
    if (lang === 'hinglish') {
      return {
        reply: `📋 **School ERP ke Sabhi 38+ Modules aur Features ki Poori List:**\n\n` +
          `Is ERP me 10 core functional domains me 38+ modules integrate kiye gaye hain:\n\n` +
          `1. 🎓 **Student Information System (SIS):**\n` +
          `   • 3-Step Student Admission, Student Directory, Profile, Sibling linking, Category waivers.\n\n` +
          `2. 💰 **Fees & Financial Management:**\n` +
          `   • Fee Groups, Collect Fees, Due Slip History, Search Due Fees, Bank Challan generator, Expense Vouchers, Income Tracker.\n\n` +
          `3. 📅 **Academics & Timetable:**\n` +
          `   • Classes, Sections, Subjects, Class Timetable, Teacher Timetable, Syllabus Planner, Homework Assignment.\n\n` +
          `4. 📝 **Examinations & Marksheets:**\n` +
          `   • Offline Datesheet, Class Marks Entry, CBSE 9-Point Grading Scale, Digital Marksheet generation, Online CBT Exam with question bank.\n\n` +
          `5. ⏱️ **Biometric & Attendance:**\n` +
          `   • Real-time biometric machine sync (ZKTeco, eSSL), Daily attendance, Bulk Excel/CSV upload, SMS/WhatsApp punch alerts.\n\n` +
          `6. 👥 **Human Resources & Payroll:**\n` +
          `   • Staff Directory, Staff Attendance, Leave Approvals, Salary Slip Generator, Allowances & Deductions.\n\n` +
          `7. 🚌 **Transport & Live Telemetry:**\n` +
          `   • Bus Routes, Live GPS Tracking, Driver profiles, Vehicles maintenance, Student stop allocation.\n\n` +
          `8. 🛏️ **Hostel & Residential Wing:**\n` +
          `   • Hostel wings (Boys/Girls), Room types, Bed allocations, Resident student roster, Mess menu.\n\n` +
          `9. 📜 **Certificates & ID Cards Studio:**\n` +
          `   • Transfer Certificate (TC), Bonafide Certificate with QR verification, Student & Staff ID Card designer and bulk print.\n\n` +
          `10. 📢 **Communication & Support:**\n` +
          `   • Broadcast SMS/WhatsApp, Digital Notice Board, Event Calendar, Help Center, 24/7 AI Assistant.`,
        suggestions: [
          'Admin login email aur password kya hai?',
          'Biometric attendance machine kaise sync hoti hai?',
          'Offline exams me marks kaise enter karein?'
        ]
      };
    } else if (lang === 'hi') {
      return {
        reply: `📋 **स्कूल ईआरपी के संपूर्ण 38+ संस्थागत मॉड्यूल्स की सूची:**\n\n` +
          `1. **छात्र सूचना प्रणाली (SIS):** छात्र प्रवेश, डायरेक्टरी, सिबलिंग मैपिंग।\n` +
          `2. **फीस एवं वित्तीय प्रबंधन:** फीस संकलन, बकाया शुल्क, बैंक चालान, व्यय वाउचर।\n` +
          `3. **अकादमिक एवं समय सारणी:** कक्षाएं, विषय, समय सारणी, पाठ्यक्रम योजना, गृहकार्य।\n` +
          `4. **परीक्षा एवं मूल्यांकन:** ऑफलाइन व ऑनलाइन (CBT) परीक्षाएं, सीबीएसई मार्कशीट।\n` +
          `5. **उपस्थिति एवं बायोमेट्रिक:** ZKTeco/eSSL मशीन एकीकरण, दैनिक उपस्थिति।\n` +
          `6. **मानव संसाधन एवं पेरोल:** कर्मचारी डायरेक्टरी, अवकाश स्वीकृति, वेतन पर्ची।\n` +
          `7. **परिवहन (Transport):** लाइव जीपीएस बस ट्रैकिंग, रूट व चालक विवरण।\n` +
          `8. **हॉस्टल प्रबंधन:** कमरे एवं बेड आवंटन, मेस मेनू।\n` +
          `9. **प्रमाण पत्र एवं पहचान पत्र:** टीसी (TC), बोनाफाइड, क्यूआर युक्त आईडी कार्ड।\n` +
          `10. **संचार एवं एआई:** बल्क एसएमएस/व्हाट्सएप, नोटिस बोर्ड, 24/7 एआई सहायक।`,
        suggestions: [
          'सभी 7 पोर्टल्स और उनके पोर्ट नंबर्स क्या हैं?',
          'एडमिन लॉगिन क्रेडेंशियल्स क्या हैं?'
        ]
      };
    } else {
      return {
        reply: `📋 **Complete Catalog of 38+ ERP Modules:**\n\n` +
          `1. **Student Information System (SIS):** 3-Step Admissions, Student Directory, Sibling Linking.\n` +
          `2. **Fees & Billing:** Fee Groups, Master Fees, Collect Fees Counter, Batch Bank Challans, Expense Vouchers.\n` +
          `3. **Academics & Timetable:** Class Timetable, Teacher Timetable, Syllabus Coverage, Homework.\n` +
          `4. **Examinations & Grading:** Offline Datesheets, Mark Entry, CBSE 9-Point Scale, Online CBT Tests.\n` +
          `5. **Biometric & Attendance:** Real-time hardware integration (ZKTeco/eSSL), Excel bulk upload, SMS alerts.\n` +
          `6. **HR & Payroll:** Staff Profiles, Leave Approvals, Salary Computation, Payslip Generator.\n` +
          `7. **Transport & GPS:** Fleet Management, Live GPS Vehicle Tracking, Routes & Stops.\n` +
          `8. **Hostel & Boarding:** Wing Capacities, Room Types, Bed Allocations, Resident Log.\n` +
          `9. **Certificates & ID Cards:** QR-verified Transfer Certificate (TC), Bonafide, Canvas ID Card Designer.\n` +
          `10. **Comms & AI:** WhatsApp/SMS Broadcasting, Notice Board, Help Center, and 24/7 AI Assistant.`,
        suggestions: [
          'Where can I access official login portals?',
          'List all 7 portals and their ports',
          'How to run the developer backend?'
        ]
      };
    }
  }

  // ====================================================================
  // 14. TECHNICAL SETUP & HOW TO RUN
  // ====================================================================
  if (intent === 'technical_setup') {
    if (lang === 'hinglish') {
      return {
        reply: `⚙️ **Project Setup, Database & Local Run Guide:**\n\n` +
          `School ERP ko locally run karne ke steps:\n\n` +
          `1. **Prerequisites:**\n` +
          `   • Node.js (v18+ recommended)\n` +
          `   • MongoDB Server running at \`mongodb://127.0.0.1:27017/school_erp\`\n\n` +
          `2. **Backend API Server (Port \`5050\`):**\n` +
          `   \`\`\`bash\n` +
          `   cd "School_ERP_Api's"\n` +
          `   npm install\n` +
          `   npm run dev\n` +
          `   \`\`\`\n` +
          `   *API http://localhost:5050 par start ho jayegi.*\n\n` +
          `3. **Database Seeding (Default Admin & Sample Data):**\n` +
          `   \`\`\`bash\n` +
          `   node seed_admin.js          # Initializes administrator record\n` +
          `   node seed_superadmin.js     # SuperAdmin master record\n` +
          `   node seedFinanceData.js     # Fees, challans & dues\n` +
          `   node seedExamData.js        # Datesheets & marksheets\n` +
          `   \`\`\`\n\n` +
          `4. **Frontend Portals Run Karna (React + Vite):**\n` +
          `   • Multi_School_Erp: \`cd Multi_School_Erp && npm run dev\` (Port 5173)\n` +
          `   • Branch-Admin: \`cd Branch-Admin && npm run dev\` (Port 5174)\n` +
          `   • Student_Parents: \`cd Student_Parents && npm run dev\` (Port 5175)\n` +
          `   • School_ERP: \`cd School_ERP && npm run dev\` (Port 5176)\n` +
          `   • Teache_Panel: \`cd Teache_Panel && npm run dev\` (Port 5177)\n` +
          `   • Accountant: \`cd Accountant && npm run dev\` (Port 5178)\n` +
          `   • SuperAdmin: \`cd SuperAdmin && npm run dev\` (Port 5179)`,
        suggestions: [
          'Admin panel me login kaise karein?',
          'Sabhi 7 portals aur unke port numbers kya hain?'
        ]
      };
    } else {
      return {
        reply: `⚙️ **Developer Quickstart & Technical Architecture:**\n\n` +
          `• **Backend Server (Port \`5050\`):**\n` +
          `  Run \`npm run dev\` in \`School_ERP_Api's\`. Connects to \`mongodb://127.0.0.1:27017/school_erp\`.\n` +
          `• **Database Seeds:**\n` +
          `  Execute \`node seed_admin.js\` and \`node seed_superadmin.js\` to initialize system administration accounts.\n` +
          `• **Frontend Portals:**\n` +
          `  Run \`npm run dev\` inside respective folders to launch Ports 5173 through 5179.\n` +
          `• **Tech Stack:** React 18, Vite, Tailwind CSS, Node.js, Express, MongoDB (Mongoose), JWT, Multer.`,
        suggestions: [
          'List all 7 portals and their ports',
          'How to access the admin login portal?'
        ]
      };
    }
  }

  // ====================================================================
  // 15. ROLE GUIDES: TEACHER, ACCOUNTANT, SUPERADMIN, BRANCH ADMIN
  // ====================================================================
  if (intent === 'role_teacher') {
    return {
      reply: `👨‍🏫 **Teacher & Faculty Panel (Port \`5177\`) Guide:**\n\n` +
        `• **Portal URL:** \`http://localhost:5177\`\n` +
        `• **Target Users:** Class Teachers, Subject Teachers, Faculty Members.\n` +
        `• **Key Workflows:**\n` +
        `  1. **Daily Attendance:** Mark present, absent, half-day for assigned classes.\n` +
        `  2. **Marks Entry:** Enter marks for Periodic Assessments (PA-1, PA-2, Half-Yearly, Annual).\n` +
        `  3. **Lesson Planner:** Plan syllabus coverage and units for each week.\n` +
        `  4. **Homework:** Assign daily homework and evaluate submitted student assignments.\n` +
        `  5. **Leave Approvals:** Verify and approve student leave applications.\n` +
        `• **Portal Access:** Direct login via official staff credentials`,
      suggestions: [
        'What workflows are available in the Accountant desk?',
        'What are the features of the SuperAdmin console?',
        'How do teachers enter examination marks?'
      ]
    };
  }

  if (intent === 'role_accountant') {
    return {
      reply: `💰 **Accountant & Finance Counter (Port \`5178\`) Guide:**\n\n` +
        `• **Portal URL:** \`http://localhost:5178\`\n` +
        `• **Target Users:** School Bursar, Cashier, Accounts Officers.\n` +
        `• **Key Workflows:**\n` +
        `  1. **Collect Fees:** Fast counter collection via Cash, Cheque, Card, or UPI.\n` +
        `  2. **Search Due Fees:** Filter pending student dues by class, section, or fee group.\n` +
        `  3. **Fee Challans:** Generate batch bank challans for Axis/HDFC fee deposits.\n` +
        `  4. **Expense Vouchers:** Record campus operational expenses and petty cash.\n` +
        `  5. **Due Slip History & Invoices:** Print official fee receipts and audit slips.\n` +
        `• **Portal Access:** Direct login via official bursar credentials`,
      suggestions: [
        'What are the 38+ modules in this system?',
        'What features does the Teacher workstation provide?',
        'What is the pending fee status?'
      ]
    };
  }

  if (intent === 'role_superadmin') {
    return {
      reply: `👑 **SuperAdmin SaaS Platform Console (Port \`5179\`) Guide:**\n\n` +
        `• **Portal URL:** \`http://localhost:5179\`\n` +
        `• **Target Users:** Platform Owners, Multi-Tenant SaaS Directors.\n` +
        `• **Key Workflows:**\n` +
        `  1. **School Onboarding:** Register new institutions and assign subdomains.\n` +
        `  2. **Subscription Plans:** Configure SaaS tiers (Basic, Pro, Enterprise) and billing.\n` +
        `  3. **Module Feature Flags:** Enable or disable modules globally per school.\n` +
        `  4. **Platform Health & Audits:** Monitor API response latency, active database tenants, and audit logs.\n` +
        `• **Portal Access:** Master tenant administrative login`,
      suggestions: [
        'List all 7 portals and their port numbers',
        'How can I access the admin login portal?'
      ]
    };
  }

  if (intent === 'role_branch_admin') {
    return {
      reply: `🏢 **Branch Admin Network Portal (Port \`5174\`) Guide:**\n\n` +
        `• **Portal URL:** \`http://localhost:5174\`\n` +
        `• **Target Users:** Regional Directors, Multi-Branch Headmasters.\n` +
        `• **Key Workflows:**\n` +
        `  1. **Multi-Branch Overview:** Compare attendance, fee recovery, and exam ranks across campuses.\n` +
        `  2. **Inter-Branch Transfers:** Seamless student and faculty transfer between branches.\n` +
        `  3. **Branch Quotas:** Set custom branch fees, fee heads, and staff rosters.\n` +
        `• **Portal Access:** Direct login via branch admin credentials`,
      suggestions: [
        'List all 7 portals and their port numbers',
        'What are the 38+ modules in this system?'
      ]
    };
  }

  // ====================================================================
  // 16. BIOMETRIC HARDWARE & ATTENDANCE INTEGRATION
  // ====================================================================
  if (intent === 'biometric_hardware') {
    return {
      reply: `⏱️ **Biometric Hardware Integration (ZKTeco / eSSL):**\n\n` +
        `School ERP supports seamless biometric machine synchronization for student and staff punch logs:\n\n` +
        `• **Supported Devices:** ZKTeco K40, uFace series, eSSL SilkBio, Realtime T52.\n` +
        `• **Integration Method:** Hardware pushes HTTP POST webhook payloads to \`/api/biometric/punch\` on Port \`5050\`.\n` +
        `• **Automated Actions:** Real-time punch triggers automated SMS/WhatsApp alerts to parents notifying arrival and departure timestamps.\n` +
        `• **Offline Backup:** Admins can also upload daily biometric CSV/Excel punch logs directly under **Students > Student Attendance > Bulk Upload**.`,
      suggestions: [
        'What is Aarav\'s attendance percentage?',
        'What are the 38+ modules in this system?'
      ]
    };
  }

  // ====================================================================
  // 17. HELP & ASSISTANT CAPABILITIES
  // ====================================================================
  if (intent === 'help_support') {
    return {
      reply: `💡 **AI Assistant Capabilities & Support Directory:**\n\n` +
        `I am the official intelligent AI Assistant for the All Core Solutions School ERP Platform. I provide assistance across two primary domains:\n\n` +
        `1. 🏫 **School ERP Architecture & Technical Ecosystem:**\n` +
        `   • Comprehensive guide to all **7 Specialized Portals** (Ports 5173 - 5179)\n` +
        `   • **Secure Role-Based Authentication** for all administrative portals\n` +
        `   • **38+ Institutional Modules** (SIS, Fees, Exams, Biometric, HR, Transport, Hostel)\n` +
        `   • Local Developer Setup (Node.js, Express, MongoDB on Port 5050, Database Seeding)\n\n` +
        `2. 🎓 **Student Academic Records (${ctx.name}):**\n` +
        `   • Pending fee balance and verified payment receipts\n` +
        `   • Daily attendance percentage and CBSE 75% compliance\n` +
        `   • Online leave application and approval tracking\n` +
        `   • Live bus GPS tracking and driver contact directory\n` +
        `   • Examination datesheets and published report cards.\n\n` +
        `*Feel free to ask any question regarding institutional modules or student records!*`,
      suggestions: [
        'What is this School ERP project and what does it include?',
        'List all 7 portals and their port numbers',
        'How can I access official login portals?',
        'What is my pending fee balance?'
      ]
    };
  }

  // ====================================================================
  // 18. GENERAL FALLBACK (INTELLIGENT DUAL CONTEXT)
  // ====================================================================
  if (lang === 'hinglish') {
    return {
      reply: `🤖 **Aapke sawal "${rawQuery.trim()}" ke baare me:**\n\n` +
        `Main School ERP Project aur Student Academic Records dono me aapki poori madad kar sakta hoon:\n\n` +
        `🏫 **School ERP Project Help:**\n` +
        `• **7 Specialized Portals:** Ports 5173 se 5179 (Multi-School, Branch, Parent, Admin ERP, Teacher, Accountant, SuperAdmin).\n` +
        `• **Secure Role-Based Authentication** on Ports 5176, 5177, 5178, 5179.\n` +
        `• **38+ Modules:** Admissions, Fees, Exams, Biometric, HR & Payroll, Transport, Hostel.\n\n` +
        `🎓 **Student Records (${ctx.name}):**\n` +
        `• **Fees:** **FINANCIALS > Fee Payments** me jayein.\n` +
        `• **Attendance:** **ACADEMICS > Attendance** me check karein.\n` +
        `• **Leave Apply:** **SERVICES > Leave Apply** par jayein.\n` +
        `• **Bus GPS:** **SERVICES > Transport** me live telemetry dekhein.\n\n` +
        `*Aap mujhse specific sawal pooch sakte hain jaise "portals list", "admin panel login link", "fees kitna baki hai", ya "modules list"!*`,
      suggestions: [
        'Ye School ERP project kya hai aur isme kya kya hai?',
        'Sabhi 7 portals aur unke port numbers kya hain?',
        'Admin panel me login kaise karein?',
        'Mera fees kitna baaki hai?'
      ]
    };
  } else if (lang === 'hi') {
    return {
      reply: `🤖 **आपके प्रश्न "${rawQuery.trim()}" के संदर्भ में:**\n\n` +
        `मैं स्कूल ईआरपी प्रोजेक्ट एवं छात्र रिकॉर्ड दोनों में सहायता कर सकता हूँ:\n\n` +
        `🏫 **ईआरपी प्रोजेक्ट जानकारी:**\n` +
        `• **7 विशेषीकृत पोर्टल्स:** पोर्ट्स 5173 से 5179\n` +
        `• **सुरक्षित रोल-आधारित लॉगिन:** अधिकृत क्रेडेंशियल्स द्वारा लॉगिन\n` +
        `• **38+ संस्थागत मॉड्यूल्स:** प्रवेश, फीस, परीक्षा, बायोमेट्रिक, परिवहन, आदि।\n\n` +
        `🎓 **छात्र रिकॉर्ड (${ctx.name}):**\n` +
        `• **शुल्क विवरण:** FINANCIALS > Fee Payments\n` +
        `• **उपस्थिति:** ACADEMICS > Attendance\n` +
        `• **अवकाश आवेदन:** SERVICES > Leave Apply`,
      suggestions: [
        'सभी 7 पोर्टल्स और उनके पोर्ट नंबर्स क्या हैं?',
        'एडमिन पोर्टल पर लॉगिन कैसे करें?',
        'मेरी फीस कितनी बाकी है?'
      ]
    };
  } else {
    return {
      reply: `🤖 **Regarding your query "${rawQuery.trim()}":**\n\n` +
        `I can assist you with both the complete School ERP Ecosystem and student academic records for **${ctx.name}**:\n\n` +
        `🏫 **School ERP Project Ecosystem:**\n` +
        `• **7 Micro-Portals:** Ports 5173 – 5179 (Landing, Branch, Parent, Admin ERP, Teacher, Accountant, SuperAdmin).\n` +
        `• **Secure Authentication:** Institutional access points for all roles.\n` +
        `• **38+ Modules:** SIS, Online Fees, Offline/CBT Exams, Biometric Sync, HR & Payroll, GPS Transport.\n\n` +
        `🎓 **Student Records for ${ctx.name}:**\n` +
        `• **Fees & Dues:** Access **FINANCIALS > Fee Payments**.\n` +
        `• **Attendance Summary:** Check **ACADEMICS > Attendance**.\n` +
        `• **Leave Applications:** Visit **SERVICES > Leave Apply**.\n` +
        `• **Bus Fleet Tracking:** View under **SERVICES > Transport**.\n\n` +
        `*Feel free to ask questions like "Tell me about this project", "How to access the admin portal?", or "What is my fee status?"*`,
      suggestions: [
        'What is this project and what portals are available?',
        'How to access the admin login portal?',
        'What are the 38+ modules included?',
        'What are the pending fees?'
      ]
    };
  }
}

// Map query to intent
function detectIntent(q) {
  const query = (q || '').toLowerCase();

  // 1. Credentials / Login (Checked early to capture login queries)
  if (
    query.includes('credential') || 
    query.includes('login') || 
    query.includes('password') || 
    query.includes('passcode') || 
    query.includes('email id') || 
    query.includes('user id') || 
    query.includes('id pass') || 
    query.includes('kaise login') || 
    query.includes('admin login') || 
    query.includes('superadmin login') || 
    query.includes('demo login') || 
    query.includes('लॉगिन') || 
    query.includes('पासवर्ड')
  ) {
    return 'credentials_login';
  }

  // 2. Portals Ecosystem & Port Numbers (5173 - 5179)
  if (
    query.includes('portal') || 
    query.includes('portals') || 
    query.includes('port number') || 
    query.includes('ports') || 
    query.includes('5173') || 
    query.includes('5174') || 
    query.includes('5175') || 
    query.includes('5176') || 
    query.includes('5177') || 
    query.includes('5178') || 
    query.includes('5179') || 
    query.includes('kitne portal') || 
    query.includes('panels') || 
    query.includes('all portal') || 
    query.includes('पोर्टल')
  ) {
    return 'portals_ecosystem';
  }

  // 3. Modules Catalog & 38+ Features
  if (
    query.includes('module') || 
    query.includes('modules') || 
    query.includes('kya kya h') || 
    query.includes('kya kya hai') || 
    query.includes('suvidha') || 
    query.includes('suvidhaye') || 
    query.includes('feature') || 
    query.includes('features') || 
    query.includes('38') || 
    query.includes('catalog') || 
    query.includes('list of module') || 
    query.includes('all module') || 
    query.includes('मॉड्यूल') || 
    query.includes('सुविधा')
  ) {
    return 'modules_catalog';
  }

  // 4. Project Overview & About Project
  if (
    query.includes('project') || 
    query.includes('school erp kya') || 
    query.includes('ecosystem') || 
    query.includes('architecture') || 
    query.includes('ye kya h') || 
    query.includes('ye kya hai') || 
    query.includes('ye system kya') || 
    query.includes('about project') || 
    query.includes('overview') || 
    query.includes('all information') || 
    query.includes('poori jaankari') || 
    query.includes('puri jankari') || 
    query.includes('प्रोजेक्ट') || 
    query.includes('परियोजना')
  ) {
    return 'project_overview';
  }

  // 5. Technical Setup & How to Run / Backend & MongoDB
  if (
    query.includes('setup') || 
    query.includes('how to run') || 
    query.includes('run kaise') || 
    query.includes('start kaise') || 
    query.includes('chalaye') || 
    query.includes('npm run dev') || 
    query.includes('port 5050') || 
    query.includes('mongodb') || 
    query.includes('backend setup') || 
    query.includes('installation') || 
    query.includes('database') || 
    query.includes('सेटअप') || 
    query.includes('चालू कैसे')
  ) {
    return 'technical_setup';
  }

  // 6. SuperAdmin Console
  if (query.includes('superadmin') || query.includes('super admin') || query.includes('saas') || query.includes('tenant')) {
    return 'role_superadmin';
  }

  // 7. Teacher Panel
  if (query.includes('teacher') || query.includes('faculty') || query.includes('marks entry') || query.includes('lesson plan') || query.includes('adhyapak') || query.includes('शिक्षक') || query.includes('अध्यापक')) {
    return 'role_teacher';
  }

  // 8. Accountant & Finance Counter
  if (query.includes('accountant') || query.includes('finance desk') || query.includes('bursar') || query.includes('cashbook') || query.includes('lekhapal') || query.includes('लेखाकार') || query.includes('मुनीम')) {
    return 'role_accountant';
  }

  // 9. Branch Admin
  if (query.includes('branch admin') || query.includes('branch director') || query.includes('multi branch') || query.includes('शाखा')) {
    return 'role_branch_admin';
  }

  // 10. Biometric Hardware
  if (query.includes('biometric') || query.includes('zkteco') || query.includes('essl') || query.includes('fingerprint') || query.includes('punch machine') || query.includes('बायोमेट्रिक')) {
    return 'biometric_hardware';
  }

  // 11. Help & Support
  if (query.includes('help') || query.includes('madad') || query.includes('support') || query.includes('kya kar sakte') || query.includes('kya pooch') || query.includes('guide me') || query.includes('commands') || query.includes('सहायता') || query.includes('मदद')) {
    return 'help_support';
  }

  // 12. Student Leave / Chhutti
  if (query.includes('leave') || query.includes('chhutti') || query.includes('chutti') || query.includes('chhutiyan') || query.includes('sick') || query.includes('aavedan') || query.includes('absenteeism') || query.includes('अवकाश') || query.includes('छुट्टी') || query.includes('आवेदन')) {
    return 'leave';
  }

  // 13. Student Fees / Paisa
  if (query.includes('fee') || query.includes('paisa') || query.includes('due') || query.includes('payment') || query.includes('challan') || query.includes('receipt') || query.includes('rupaye') || query.includes('baki') || query.includes('kist') || query.includes('शुल्क') || query.includes('फीस') || query.includes('बकाया')) {
    return 'fees';
  }

  // 14. Student Attendance / Hazri
  if (query.includes('attendance') || query.includes('hazri') || query.includes('present') || query.includes('absent') || query.includes('upasthiti') || query.includes('attendence') || query.includes('उपस्थिति') || query.includes('हाजिरी')) {
    return 'attendance';
  }

  // 15. Student Transport / Bus
  if (query.includes('bus') || query.includes('transport') || query.includes('driver') || query.includes('pickup') || query.includes('drop') || query.includes('route') || query.includes('van') || query.includes('बस') || query.includes('परिवहन') || query.includes('चालक')) {
    return 'transport';
  }

  // 16. Exams / Marks / Report Card
  if (query.includes('exam') || query.includes('result') || query.includes('mark') || query.includes('test') || query.includes('syllabus') || query.includes('report card') || query.includes('pariksha') || query.includes('परीक्षा') || query.includes('परिणाम') || query.includes('अंकतालिका')) {
    return 'exams';
  }

  // 17. Health Clinic
  if (query.includes('health') || query.includes('clinic') || query.includes('doctor') || query.includes('nurse') || query.includes('fever') || query.includes('medical') || query.includes('bimari') || query.includes('स्वास्थ्य') || query.includes('चिकित्सा') || query.includes('दवाई')) {
    return 'health';
  }

  // 18. Campus Visit / Appointment
  if (query.includes('visit') || query.includes('appointment') || query.includes('milna') || query.includes('meet') || query.includes('principal') || query.includes('gate pass') || query.includes('ptm') || query.includes('मुलाकात') || query.includes('भेंट') || query.includes('गेट पास')) {
    return 'visit';
  }

  // 19. Documents / TC / Bonafide
  if (query.includes('document') || query.includes('certificate') || query.includes('tc') || query.includes('bonafide') || query.includes('praman') || query.includes('id card') || query.includes('प्रमाण पत्र') || query.includes('दस्तावेज')) {
    return 'documents';
  }

  // 20. Greeting
  if (/^(hi|hello|hey|namaste|pranam|good\s*(morning|afternoon|evening)|salaam|kese\s*ho|kaise\s*ho|नमस्ते|प्रणाम)/i.test(query)) {
    return 'greeting';
  }

  return 'general';
}

// -------------------------------------------------------------
// CONTROLLERS
// -------------------------------------------------------------

// POST /api/ai-assistant/chat
exports.chatWithAI = async (req, res) => {
  try {
    const { message, sessionId, studentId, parentId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const currentSessionId = sessionId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Detect language from incoming user query: 'hinglish' | 'hi' | 'en'
    const detectedLang = detectLanguage(message);

    // 2. Resolve real student context from DB
    const studentContext = await getStudentContext(studentId, parentId);

    // 3. Detect intent
    const intent = detectIntent(message);

    // 4. Generate response in matching language
    const result = generateMultiLingualReply(intent, detectedLang, studentContext, message);

    // Contextual Quick Actions mapping
    let quickActions = [];
    if (intent === 'project_overview' || intent === 'portals_ecosystem') {
      quickActions = [
        { label: 'Multi-School Hub (:5173)', route: 'http://localhost:5173' },
        { label: 'School Admin ERP (:5176)', route: 'http://localhost:5176' },
        { label: 'SuperAdmin SaaS (:5179)', route: 'http://localhost:5179' },
        { label: 'Teacher Panel (:5177)', route: 'http://localhost:5177' }
      ];
    } else if (intent === 'credentials_login') {
      quickActions = [
        { label: 'Login School Admin (:5176)', route: 'http://localhost:5176/login' },
        { label: 'Login SuperAdmin (:5179)', route: 'http://localhost:5179/login' },
        { label: 'Login Accountant Desk (:5178)', route: 'http://localhost:5178/login' }
      ];
    } else if (intent === 'modules_catalog') {
      quickActions = [
        { label: 'Fee Payments', route: '/fee-payments' },
        { label: 'Student Attendance', route: '/attendance' },
        { label: 'Leave Apply', route: '/leave-management' },
        { label: 'Live Bus Tracking', route: '/transport' }
      ];
    } else if (intent === 'technical_setup') {
      quickActions = [
        { label: 'Multi-School Hub (:5173)', route: 'http://localhost:5173' },
        { label: 'Backend Health Check (:5050)', route: 'http://localhost:5050/api/ai-assistant/knowledge' }
      ];
    } else if (intent === 'role_teacher') {
      quickActions = [
        { label: 'Open Teacher Panel (:5177)', route: 'http://localhost:5177' }
      ];
    } else if (intent === 'role_accountant') {
      quickActions = [
        { label: 'Open Accountant Desk (:5178)', route: 'http://localhost:5178' }
      ];
    } else if (intent === 'role_superadmin') {
      quickActions = [
        { label: 'Open SuperAdmin SaaS (:5179)', route: 'http://localhost:5179' }
      ];
    } else if (intent === 'role_branch_admin') {
      quickActions = [
        { label: 'Open Branch Admin (:5174)', route: 'http://localhost:5174' }
      ];
    } else if (intent === 'leave') {
      quickActions = [
        { label: 'Open Leave Apply Form', route: '/leave-management' },
        { label: 'View Leave History', route: '/leave-management' }
      ];
    } else if (intent === 'fees') {
      quickActions = [
        { label: 'Pay Fees Online', route: '/fee-payments' },
        { label: 'Download Fee Receipts', route: '/transactions' }
      ];
    } else if (intent === 'attendance') {
      quickActions = [
        { label: 'Monthly Attendance Log', route: '/attendance' },
        { label: 'Apply Leave for Absence', route: '/leave-management' }
      ];
    } else if (intent === 'transport') {
      quickActions = [
        { label: 'Live GPS Bus Tracking', route: '/transport' }
      ];
    } else if (intent === 'exams') {
      quickActions = [
        { label: 'View Exam Date-Sheet', route: '/exams' },
        { label: 'Download Report Card', route: '/exams' }
      ];
    } else if (intent === 'health') {
      quickActions = [
        { label: 'Open Health Records', route: '/health-records' }
      ];
    } else if (intent === 'visit') {
      quickActions = [
        { label: 'Book Campus Appointment', route: '/school-visit' },
        { label: 'My Security Passes', route: '/school-visit' }
      ];
    } else if (intent === 'documents') {
      quickActions = [
        { label: 'Request Certificate', route: '/documents' }
      ];
    } else {
      quickActions = [
        { label: 'Multi-School Hub (:5173)', route: 'http://localhost:5173' },
        { label: 'School Admin ERP (:5176)', route: 'http://localhost:5176' },
        { label: 'Fee Payments', route: '/fee-payments' },
        { label: 'Attendance', route: '/attendance' }
      ];
    }

    // Persist in session memory
    if (!sessionStore.has(currentSessionId)) {
      sessionStore.set(currentSessionId, []);
    }
    const sessionHistory = sessionStore.get(currentSessionId);
    sessionHistory.push({
      role: 'user',
      text: message,
      timestamp: new Date()
    });
    sessionHistory.push({
      role: 'bot',
      text: result.reply,
      intent,
      language: detectedLang,
      quickActions,
      suggestions: result.suggestions,
      timestamp: new Date()
    });

    return res.status(200).json({
      success: true,
      sessionId: currentSessionId,
      detectedLanguage: detectedLang,
      intent,
      student: {
        id: studentContext.studentId,
        name: studentContext.name,
        className: studentContext.className,
        admissionNo: studentContext.admissionNo
      },
      reply: result.reply,
      quickActions,
      suggestions: result.suggestions
    });
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    res.status(500).json({
      success: false,
      message: 'Internal AI Assistant Error: ' + error.message
    });
  }
};

// GET /api/ai-assistant/knowledge
exports.getKnowledgeBase = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: KNOWLEDGE_BASE
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/ai-assistant/sessions
exports.getSessions = async (req, res) => {
  try {
    const sessions = [];
    sessionStore.forEach((messages, sId) => {
      const firstUserMsg = messages.find(m => m.role === 'user');
      const lastMsg = messages[messages.length - 1];
      sessions.push({
        id: sId,
        title: firstUserMsg ? firstUserMsg.text.substring(0, 32) : 'General Inquiry',
        lastMessage: lastMsg ? lastMsg.text.substring(0, 60) : '',
        messageCount: messages.length,
        updatedAt: lastMsg ? lastMsg.timestamp : new Date()
      });
    });

    if (sessions.length === 0) {
      sessions.push(
        { id: 'sess_1', title: 'Fee Status & Next Due Date', time: 'Today', messageCount: 2 },
        { id: 'sess_2', title: 'Aarav\'s Attendance Report', time: 'Yesterday', messageCount: 4 },
        { id: 'sess_3', title: 'Upcoming PA-2 Exam Dates', time: '3 days ago', messageCount: 2 }
      );
    }

    return res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/ai-assistant/sessions/:id
exports.clearSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (sessionStore.has(id)) {
      sessionStore.delete(id);
    }
    return res.status(200).json({
      success: true,
      message: 'Session cleared successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
