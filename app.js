const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const feeTypeRoutes = require('./routes/feeTypeRoutes');
const feeGroupRoutes = require('./routes/feeGroupRoutes');
const feeDiscountRoutes = require('./routes/feeDiscountRoutes');
const assignFeeRoutes = require('./routes/assignFeeRoutes');
const feeCollectionRoutes = require('./routes/feeCollectionRoutes');
const feeChallanRoutes = require('./routes/feeChallanRoutes');
const feesDashboardRoutes = require('./routes/feesDashboardRoutes');
const searchDueFeesRoutes = require('./routes/searchDueFeesRoutes');
const allTransactionsRoutes = require('./routes/allTransactionsRoutes');
const onlineTransactionsRoutes = require('./routes/onlineTransactionsRoutes');
const feesCarryForwardRoutes = require('./routes/feesCarryForwardRoutes');
const generateDueSlipRoutes = require('./routes/generateDueSlipRoutes');
const dueSlipHistoryRoutes = require('./routes/dueSlipHistoryRoutes');
const feeDataAuditRoutes = require('./routes/feeDataAuditRoutes');
const financeReportRoutes = require('./routes/financeReportRoutes');
const academicsRoutes = require('./routes/academicsRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const transportRoutes = require('./routes/transportRoutes');
const examRoutes = require('./routes/examRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const homeworkRoutes = require('./routes/homeworkRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const frontOfficeRoutes = require('./routes/frontOfficeRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const liveClassRoutes = require('./routes/liveClassRoutes');
const assetRoutes = require('./routes/assetRoutes');
const eventRoutes = require('./routes/eventRoutes');
const lessonPlanRoutes = require('./routes/lessonPlanRoutes');
const studyMaterialRoutes = require('./routes/studyMaterialRoutes');
const onlineExamRoutes = require('./routes/onlineExamRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const chatRoutes = require('./routes/chatRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const leadRoutes = require('./routes/leadRoutes');
const hardwareRoutes = require('./routes/hardwareRoutes');
const ptmRoutes = require('./routes/ptmRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const osmRoutes = require('./routes/osmRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const branchRoutes = require('./routes/branchRoutes');
const locationRoutes = require('./routes/locationRoutes');
const healthRoutes = require('./routes/healthRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const aiRoutes = require('./routes/aiRoutes');
const coachingRoutes = require('./routes/coachingRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const planRoutes = require('./routes/planRoutes');
const globalSettingRoutes = require('./routes/globalSettingRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const cbcRoutes = require('./routes/cbcRoutes');
const supportTicketRoutes = require('./routes/supportTicketRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const incomeHeadRoutes = require('./routes/incomeHeadRoutes');
const expenseHeadRoutes = require('./routes/expenseHeadRoutes');
const bankAccountRoutes = require('./routes/bankAccountRoutes');
const accountsDashboardRoutes = require('./routes/accountsDashboardRoutes');
const parentRoutes = require('./routes/parentRoutes');
const studentHouseRoutes = require('./routes/studentHouseRoutes');
const studentCategoryRoutes = require('./routes/studentCategoryRoutes');
const behaviorRoutes = require('./routes/behaviorRoutes');
const studentExitRoutes = require('./routes/studentExitRoutes');
const hrRoutes = require('./routes/hrRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const appsCenterRoutes = require('./routes/appsCenterRoutes');
const studyCenterRoutes = require('./routes/studyCenterRoutes');
const idCardRoutes = require('./routes/idCardRoutes');
const broadcastRoutes = require('./routes/broadcastRoutes');
const helpCenterRoutes = require('./routes/helpCenterRoutes');
const engagementRoutes = require('./routes/engagementRoutes');
const cctvRoutes = require('./routes/cctvRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const commsWalletRoutes = require('./routes/commsWalletRoutes');
const chatModerationRoutes = require('./routes/chatModerationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const hpcRoutes = require('./routes/hpcRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();



// Standard middlewares with dynamic CORS support
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 204
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded files (photos and documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/fee-types', feeTypeRoutes);
app.use('/api/fee-groups', feeGroupRoutes);
app.use('/api/fee-discounts', feeDiscountRoutes); // Backward compatibility
app.use('/api/fees-discount', feeDiscountRoutes); // Menu Exact Match
app.use('/api/assign-fees', assignFeeRoutes);
app.use('/api/collect-fees', feeCollectionRoutes);
app.use('/api/fee-challans', feeChallanRoutes);
app.use('/api/fees-dashboard', feesDashboardRoutes);
app.use('/api/search-due-fees', searchDueFeesRoutes);
app.use('/api/all-transactions', allTransactionsRoutes);
app.use('/api/online-transactions', onlineTransactionsRoutes);
app.use('/api/fees-carry-forward', feesCarryForwardRoutes);
app.use('/api/generate-due-slip', generateDueSlipRoutes);
app.use('/api/due-slip-history', dueSlipHistoryRoutes);
app.use('/api/fee-data-audit', feeDataAuditRoutes);
app.use('/api/finance-reports', financeReportRoutes);
app.use('/api/academics', academicsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/front-office', frontOfficeRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/study-center', studyCenterRoutes);
app.use('/api/online-exams', onlineExamRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/income-heads', incomeHeadRoutes);
app.use('/api/expense-heads', expenseHeadRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/accounts', accountsDashboardRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/hardware', hardwareRoutes);
app.use('/api/ptm', ptmRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/osm', osmRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/health-records', healthRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/student-houses', studentHouseRoutes);
app.use('/api/student-categories', studentCategoryRoutes);
app.use('/api/behavior', behaviorRoutes);
app.use('/api/student-exits', studentExitRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/ai-assistant', aiRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/coaching', coachingRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/settings', globalSettingRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/cbc', cbcRoutes);
app.use('/api/support-tickets', supportTicketRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/apps-center', appsCenterRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/study-center', studyCenterRoutes);
app.use('/api/id-cards', idCardRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/help-center', helpCenterRoutes);
app.use('/api/cctv', cctvRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/comms-wallet', commsWalletRoutes);
app.use('/api/chat-moderation', chatModerationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/hpc', hpcRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/parents', parentRoutes);

// Base Status Route

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'School ERP Student Admission API is running...',
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API error:', err.message);

  if (res.headersSent) return next(err);

  // Catch Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File upload size exceeds the limit!'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

module.exports = app;
