require('dotenv').config();
const mongoose = require('mongoose');
const { KbCategory, KbArticle } = require('./models/HelpCenter');

async function seedHelpCenter() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Help Center Seeding...');

    // Drop previous collections if any index issue
    try {
      await mongoose.connection.db.dropCollection('kbcategories');
      await mongoose.connection.db.dropCollection('kbarticles');
      console.log('Dropped previous kbcategories and kbarticles collections.');
    } catch (e) {
      // ignore if collection did not exist
    }

    // 1. Seed Categories with explicit slugs
    const categoriesData = [
      { name: 'Getting Started', slug: 'getting-started', icon: '🚀', parentCategory: '— None (Root) —', description: 'Quick-start guides, system onboarding, and core ERP concepts.', visibility: 'Public', sortOrder: 1, status: 'Active' },
      { name: 'Dashboard & Navigation', slug: 'dashboard-navigation', icon: '📊', parentCategory: '— None (Root) —', description: 'Central executive dashboard, ERP Navigator, and quick actions.', visibility: 'Public', sortOrder: 2, status: 'Active' },
      { name: 'Student Management', slug: 'student-management', icon: '👥', parentCategory: '— None (Root) —', description: 'Student admission, biographical profile, health logs, and exit processing.', visibility: 'Public', sortOrder: 3, status: 'Active' },
      { name: 'Academics & Syllabus', slug: 'academics-syllabus', icon: '📖', parentCategory: '— None (Root) —', description: 'Class sections, subjects, lesson planning, and curriculum tracking.', visibility: 'Public', sortOrder: 4, status: 'Active' },
      { name: 'Attendance & Biometrics', slug: 'attendance-biometrics', icon: '📅', parentCategory: '— None (Root) —', description: 'Daily student attendance, biometric eSSL integration, and WhatsApp alerts.', visibility: 'Public', sortOrder: 5, status: 'Active' },
      { name: 'Fees & Accounts', slug: 'fees-accounts', icon: '💵', parentCategory: '— None (Root) —', description: 'Fee collection, challans, receipt printing, and pending dues audit.', visibility: 'Public', sortOrder: 6, status: 'Active' },
      { name: 'Examinations & Marksheets', slug: 'examinations-marksheets', icon: '📝', parentCategory: '— None (Root) —', description: 'Datesheets, offline exam marks entry, teacher remarks, and CBSE report cards.', visibility: 'Public', sortOrder: 7, status: 'Active' },
      { name: 'Online Examinations (CBT)', slug: 'online-examinations-cbt', icon: '💻', parentCategory: '— None (Root) —', description: 'Question bank, online tests, automated grading, and student rankings.', visibility: 'Public', sortOrder: 8, status: 'Active' },
      { name: 'Human Resource & Payroll', slug: 'human-resource-payroll', icon: '💼', parentCategory: '— None (Root) —', description: 'Staff directory, leave approvals, salary templates, and payroll generation.', visibility: 'Public', sortOrder: 9, status: 'Active' },
      { name: 'Timetable Management', slug: 'timetable-management', icon: '🗓️', parentCategory: '— None (Root) —', description: 'Weekly periods, teacher subject allocation, and room assignments.', visibility: 'Public', sortOrder: 10, status: 'Active' },
      { name: 'Library & Book Loans', slug: 'library-book-loans', icon: '📚', parentCategory: '— None (Root) —', description: 'Book cataloging, barcode scanning, issue/returns, and overdue fines.', visibility: 'Public', sortOrder: 11, status: 'Active' },
      { name: 'Transport & GPS Tracking', slug: 'transport-gps-tracking', icon: '🚌', parentCategory: '— None (Root) —', description: 'Bus routes, pickup stops, driver management, and live GPS map tracking.', visibility: 'Public', sortOrder: 12, status: 'Active' },
      { name: 'Hostel & Boarding', slug: 'hostel-boarding', icon: '🏢', parentCategory: '— None (Root) —', description: 'Hostel blocks, room types, bed capacities, and student room allocation.', visibility: 'Public', sortOrder: 13, status: 'Active' },
      { name: 'Notice Board & Communication', slug: 'notice-board-communication', icon: '📢', parentCategory: '— None (Root) —', description: 'Official notices, circulars, broadcast SMS/WhatsApp, and event calendar.', visibility: 'Public', sortOrder: 14, status: 'Active' },
      { name: 'Certificates & Documentation', slug: 'certificates-documentation', icon: '📜', parentCategory: '— None (Root) —', description: 'Transfer Certificates (TC), bonafide letters, and student ID cards.', visibility: 'Public', sortOrder: 15, status: 'Active' },
      { name: 'Settings & System Configuration', slug: 'settings-system-configuration', icon: '⚙️', parentCategory: '— None (Root) —', description: 'School profile, academic sessions, custom fields, and roles & permissions.', visibility: 'Public', sortOrder: 16, status: 'Active' }
    ];

    const createdCategories = await KbCategory.insertMany(categoriesData);
    console.log(`Seeded ${createdCategories.length} Knowledge Base Categories.`);

    // 2. Seed Articles with explicit slugs
    const articlesData = [
      {
        title: '📌 Welcome to the School Management System (Getting Started Guide)',
        slug: 'welcome-to-school-erp-getting-started',
        category: 'Getting Started',
        summary: 'A complete overview of your School ERP, navigating core features, user roles, and institutional data flows.',
        content: `### Welcome to Your All-in-One School ERP Platform

This comprehensive platform centralizes all operational, academic, financial, and administrative workflows for your educational institution.

#### 1. Core Platform Architecture
- **Multi-Role Access**: The platform provides role-specific dashboards for School Administrators, Teachers, Accountants, Receptionists, Librarians, Transport In-Charges, and Hostel Wardens.
- **Academic Session Scoping**: All operational data (students, exams, attendance, homework) is filtered by the currently active academic year selected in the top bar.
- **Central ERP Navigator**: Access the ERP Navigator at any time (\`/erp-navigator\`) for a complete visual map of all 39 institutional modules and 237 operational screens.

#### 2. First Steps for New Administrators
1. Verify institution details under **Settings & Billing** > **School Settings**.
2. Review the active academic session in the top header.
3. Configure user roles and staff permissions under **Roles & Permissions**.
4. Check data import templates if onboarding existing student databases.`,
        author: 'ACS Knowledge Team',
        status: 'Published',
        visibility: 'Public',
        views: 342,
        helpfulVotes: 58,
        featured: true,
        tags: ['getting-started', 'onboarding', 'dashboard', 'admin']
      },
      {
        title: 'How to Collect Fees & Print Instant Receipts',
        slug: 'how-to-collect-fees-print-receipts',
        category: 'Fees & Accounts',
        summary: 'Step-by-step instructions for recording cash, UPI, bank challan, or cheque fee collections.',
        content: `### Collecting Student Fees

Recording student fee payments is fast, secure, and generates verified printable receipts instantly.

#### Step-by-Step Procedure:
1. Open the **Finance & Accounts** menu and select **Collect Fees** (\`/collect-fees\`).
2. Search for the student using **Admission No**, **APAR ID**, or **Student Name**.
3. The screen will automatically display all fee heads assigned to the student (Tuition Fee, Transport Fee, Hostel Fee, Examination Fee) along with applicable discount vouchers.
4. Select the heads being paid, choose the payment mode:
   - **Cash**
   - **UPI / QR Code**
   - **Bank Challan / NEFT**
   - **Cheque / DD**
5. Enter transaction reference number if applicable and click **Record Payment & Generate Receipt**.
6. The receipt will open in print preview with school logo, receipt serial number, and payment verification barcode.`,
        author: 'Finance Desk',
        status: 'Published',
        visibility: 'Public',
        views: 289,
        helpfulVotes: 44,
        featured: true,
        tags: ['fees', 'receipts', 'accounts', 'challan']
      },
      {
        title: 'Taking Daily Attendance & Triggering SMS / WhatsApp Alerts',
        slug: 'taking-daily-attendance-sms-alerts',
        category: 'Attendance & Biometrics',
        summary: 'Guide to recording morning class attendance, marking leaves, and sending auto notifications to parents.',
        content: `### Recording Daily Student Attendance

Keeping accurate daily attendance ensures student safety and compliance with educational board requirements.

#### Morning Attendance Workflow:
1. Navigate to **Students** > **Student Attendance** (\`/students/attendance\`).
2. Select the **Class**, **Section**, and **Date**. Click **Search**.
3. All enrolled students are displayed with default status **Present**.
4. Click on any student card/row to toggle status to **Absent**, **Late Arrival**, or **Half Day**.
5. Click **Submit Attendance**.
6. If automated parent messaging is turned on in **Notification Settings**, parents of absent students will instantly receive an SMS / WhatsApp notification.`,
        author: 'Academic Coordination',
        status: 'Published',
        visibility: 'Public',
        views: 215,
        helpfulVotes: 37,
        featured: false,
        tags: ['attendance', 'absent-alert', 'students', 'biometric']
      },
      {
        title: 'Entering Offline Exam Marks & Generating Report Cards',
        slug: 'entering-offline-exam-marks-report-cards',
        category: 'Examinations & Marksheets',
        summary: 'Learn how to input marks, record co-curricular remarks, and generate print-ready CBSE marksheets.',
        content: `### Examination Results & Marksheet Generation

The Offline Examinations module handles the complete lifecycle from datesheets to marksheet printing.

#### Steps:
1. **Marks Entry**: Go to **Offline Examinations** > **Enter Marks**, select exam, class, and subject. Enter marks obtained against maximum marks.
2. **Teacher Remarks**: Go to **Teacher Remarks** (\`/offline-exams/teacher-remarks\`) to record personalized feedback or select predefined remarks.
3. **Co-curricular Grades**: Record discipline, work education, and art education grades.
4. **Generate Marksheet**: Head to **Generate Marksheet**, select class and template (CBSE Comprehensive, State Board, or Trimester). Click **Generate All** to print in batch or download PDF.`,
        author: 'Examination Controller',
        status: 'Published',
        visibility: 'Public',
        views: 198,
        helpfulVotes: 32,
        featured: true,
        tags: ['exams', 'marksheet', 'cbse', 'remarks']
      },
      {
        title: 'Hostel Bed Allocation & Room Capacity Management',
        slug: 'hostel-bed-allocation-room-capacity',
        category: 'Hostel & Boarding',
        summary: 'Configure hostel blocks, room types, bed tariffs, and check-in residential students.',
        content: `### Managing Residential Hostels & Bed Allocations

Ensure orderly boarding management with live capacity monitoring.

#### Workflow:
1. **Manage Hostels**: Add residential blocks (e.g. Tagore Boys Hostel, Sarojini Girls Hostel) with appointed wardens and intake capacities.
2. **Room Types**: Set up categories such as Deluxe AC (2-Bed), Standard Non-AC (4-Bed) with monthly bed tariffs.
3. **Manage Rooms**: Add room numbers under each hostel with bed capacities.
4. **Student Allocation**: Click **+ Allocate Student** (\`/hostel/student-allocation\`), choose resident student, hostel, available room, and bed number.
5. **Checkout / Vacate**: When a student vacates, click **Vacate** on their row to immediately free up the bed slot for new admissions.`,
        author: 'Hostel Management Office',
        status: 'Published',
        visibility: 'Public',
        views: 176,
        helpfulVotes: 29,
        featured: false,
        tags: ['hostel', 'rooms', 'allocation', 'beds', 'boarding']
      },
      {
        title: 'Vehicle Fleet & Real-Time GPS Route Tracking',
        slug: 'vehicle-fleet-gps-route-tracking',
        category: 'Transport & GPS Tracking',
        summary: 'How to manage bus routes, driver rosters, vehicle compliance, and track buses live on Google Maps.',
        content: `### School Transport Operations

The transport module guarantees passenger safety and route efficiency.

#### Key Operations:
- **Manage Vehicles**: Keep track of bus registration numbers, seating capacities, vehicle insurance, pollution certificates, and fitness validity dates.
- **Routes & Stops**: Create routes with designated pickup stops, estimated arrival times, and monthly transport fares.
- **Live Vehicle Tracking**: Access \`/transport/live-tracking\` to watch buses moving on the live map with real-time GPS telemetry, speed monitoring, and geofence alerts.`,
        author: 'Transport Department',
        status: 'Published',
        visibility: 'Public',
        views: 164,
        helpfulVotes: 25,
        featured: false,
        tags: ['transport', 'bus', 'gps', 'routes', 'safety']
      },
      {
        title: 'Biometric eSSL & ZKTeco Hardware Sync Troubleshooting',
        slug: 'biometric-essl-zkteco-hardware-sync-troubleshooting',
        category: 'Attendance & Biometrics',
        summary: 'Troubleshooting steps when punch logs fail to sync automatically to cloud attendance tables.',
        content: `### Biometric Machine Troubleshooting

If biometric punches are not appearing in real-time, follow these diagnostic steps:

#### Verification Steps:
1. Verify device local IP address by pinging the device from the school server.
2. Confirm port 4370 (eSSL default) or port 5050 is not blocked by local Windows firewall.
3. Open Windows Services (\`services.msc\`) and verify that **ERP-Biometric-Sync** service status is **Running**.
4. Check the local agent sync log at \`C:\\SchoolERP\\logs\\biometric_sync.log\`.
5. If punches were recorded offline, click **Force Sync Buffered Logs** inside the ERP hardware hub.`,
        author: 'IT Infrastructure Lead',
        status: 'Published',
        visibility: 'Public',
        views: 245,
        helpfulVotes: 48,
        featured: false,
        tags: ['biometric', 'hardware', 'essl', 'sync', 'attendance']
      },
      {
        title: 'Staff Payroll Generation, Leave Deductions & Payslips',
        slug: 'staff-payroll-generation-payslips',
        category: 'Human Resource & Payroll',
        summary: 'Guide to configuring salary templates, processing monthly employee payroll, and emailing payslips.',
        content: `### Processing Monthly Staff Payroll

Ensure timely, accurate salary disbursals with automated tax and leave deductions.

#### Steps:
1. **Salary Templates**: Configure Basic Pay, HRA, DA, Medical Allowance, and Provident Fund (PF) percentages under **Salary Templates**.
2. **Assign Salary**: Link employees to their respective designation templates under **Set Salary**.
3. **Monthly Run**: Go to **Payroll** (\`/hr/payroll\`), choose the payroll month and year. Click **Compute Payroll**.
4. The system calculates working days, approved paid leaves, unpaid absent days, and net payable salary.
5. Click **Approve & Generate Payslips** to send PDF payslips directly to staff mobile apps.`,
        author: 'HR & Accounts Dept',
        status: 'Published',
        visibility: 'Public',
        views: 182,
        helpfulVotes: 31,
        featured: false,
        tags: ['hr', 'payroll', 'salary', 'payslip', 'staff']
      },
      {
        title: 'Designing & Printing Student & Staff ID Cards',
        slug: 'designing-printing-student-staff-id-cards',
        category: 'Certificates & Documentation',
        summary: 'How to customize ID card dimensions, badges, QR verification stamps, and execute bulk prints.',
        content: `### Generating Institutional ID Cards

Create durable, modern identity cards with QR verification.

#### Instructions:
1. Open **ID Cards** > **Student ID Cards** (\`/id-cards/student\`).
2. Select Class and Section to load all student records.
3. Select your preferred template (Vertical Modern, Horizontal Classic, or Minimal Badge).
4. Review student photos, blood groups, and parent contact numbers.
5. Click **Batch Print ID Cards** or **Download Print PDF** formatted for standard CR-80 PVC card printers.`,
        author: 'Media & Design Lab',
        status: 'Published',
        visibility: 'Public',
        views: 153,
        helpfulVotes: 26,
        featured: false,
        tags: ['id-cards', 'print', 'badges', 'qr-code']
      },
      {
        title: 'Library Cataloging, Barcode Scanning & Fine Collection',
        slug: 'library-cataloging-barcode-scanning-fines',
        category: 'Library & Book Loans',
        summary: 'Manage book inventory, issue books to students/teachers, and track return due dates.',
        content: `### Library Management Workflow

Streamline book circulation and maintain institutional inventory.

#### Daily Library Operations:
- **Book Issue**: Go to **Issue/Return Book** (\`/library/issue-return\`), scan student barcode / enter admission number, then scan book accession number. Click **Issue Book**.
- **Book Return**: Scan the book accession barcode. The system calculates overdue fines automatically based on library policy.
- **Book Catalog**: Add new titles, authors, publishers, and ISBN details in **Manage Books**.`,
        author: 'Chief Librarian',
        status: 'Published',
        visibility: 'Public',
        views: 139,
        helpfulVotes: 22,
        featured: false,
        tags: ['library', 'books', 'issue-return', 'fines']
      }
    ];

    const createdArticles = await KbArticle.insertMany(articlesData);
    console.log(`Seeded ${createdArticles.length} Knowledge Base Articles.`);

    console.log('Help Center successfully seeded with 100% live data!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Help Center data:', error);
    process.exit(1);
  }
}

seedHelpCenter();
