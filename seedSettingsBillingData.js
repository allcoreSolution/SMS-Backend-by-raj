const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const GlobalSetting = require('./models/GlobalSetting');
const { Subscription, SubscriptionInvoice } = require('./models/Subscription');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';

async function seedSettingsBilling() {
  try {
    console.log('Connecting to MongoDB for Settings & Billing Seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected successfully.');

    // 1. Seed Active Subscription
    await Subscription.deleteMany({});
    const activeSub = await Subscription.create({
      schoolName: 'Greenwood International School',
      planId: 'growth',
      planName: 'Growth Plan',
      capacity: 'Up to 5,000 students',
      activeStudents: 280,
      status: 'Active',
      billingCycle: 'Yearly',
      amount: 10000,
      startDate: new Date('2026-02-26T00:00:00.000Z'),
      endDate: new Date('2027-02-26T00:00:00.000Z'),
      paymentMethod: 'Razorpay',
      autoRenew: true
    });
    console.log('Seeded Active Subscription:', activeSub.planName);

    // 2. Seed Subscription Invoices History
    await SubscriptionInvoice.deleteMany({});
    const invoices = await SubscriptionInvoice.insertMany([
      {
        orderId: '#order_SrOv3QNEPhwD2n',
        plan: 'Growth Plan',
        amount: 10000,
        billingCycle: 'Yearly',
        method: 'Razorpay',
        status: 'Paid',
        transactionId: 'TXN_98A4BC21D0',
        date: '26 Feb, 2026 09:15 AM'
      },
      {
        orderId: '#order_K8mF2qP09zA1',
        plan: 'Basic Plan',
        amount: 5000,
        billingCycle: 'Monthly',
        method: 'UPI',
        status: 'Paid',
        transactionId: 'TXN_44E89F0A12',
        date: '26 Jan, 2026 11:30 AM'
      },
      {
        orderId: '#order_P2xL9mN88qR3',
        plan: 'Trial Plan',
        amount: 0,
        billingCycle: 'Monthly',
        method: 'Free Activation',
        status: 'Paid',
        transactionId: 'TXN_FREE_ACTIVATION',
        date: '10 Jan, 2026 04:00 PM'
      }
    ]);
    console.log(`Seeded ${invoices.length} Subscription Invoices.`);

    // 3. Seed Global Settings
    const settingsToSeed = [
      {
        key: 'school_profile',
        value: {
          schoolName: 'Greenwood International School',
          shortName: 'GIS',
          email: 'admin@greenwood.edu',
          phone: '+91 98765 43210',
          address: '42 Knowledge Park, Silicon Valley Boulevard, Sector 62',
          affiliationNo: 'CBSE-AFF-2024-9812',
          schoolCode: 'GIS-8891',
          academicSession: '2026-2027',
          timezone: 'Asia/Kolkata (GMT +05:30)',
          currency: 'INR (₹)',
          website: 'https://greenwood.edu',
          themeId: 'executive'
        }
      },
      {
        key: 'payment_gateway',
        value: {
          isOnlineFeeEnabled: true,
          activeProvider: 'Razorpay',
          razorpayKeyId: 'rzp_live_89f02a99e12b',
          razorpaySecret: '••••••••••••••••',
          stripePublishableKey: 'pk_live_51M89ab29fQ',
          stripeSecretKey: 'sk_live_••••••••••••',
          upiVpa: 'greenwoodschool@icici',
          merchantName: 'Greenwood Educational Trust',
          testMode: false
        }
      },
      {
        key: 'system_prefixes',
        value: {
          feePrefix: 'REC',
          feeSeparator: '-',
          feePadding: '4',
          feeIncludeSession: true,
          feeIncludeDate: false,
          feeNextNumber: 1045,
          admPrefix: 'GIS',
          admSeparator: '-',
          admIncludeSession: true,
          admIncludeYear: false,
          admNextNumber: 2024,
          rollPrefix: 'ROLL',
          rollSeparator: '-',
          rollPadding: '3',
          rollIncludeSession: true
        }
      },
      {
        key: 'notification_settings',
        value: [
          { id: 1, name: 'Parent Fee Paid', desc: 'Sent to parent when an online fee payment is successful.', status: 'Active', email: true, sms: false, whatsapp: true, push: true, type: 'billing' },
          { id: 2, name: 'Exam Result Published', desc: 'Sent when exam marks & result cards are released.', status: 'Active', email: true, sms: true, whatsapp: true, push: true, type: 'academic' },
          { id: 3, name: 'Student Attendance Alert', desc: 'Sent when student is marked absent in daily roll-call.', status: 'Active', email: false, sms: true, whatsapp: true, push: true, type: 'attendance' },
          { id: 4, name: 'Student Leave Approved', desc: 'Sent to parent when leave application is approved.', status: 'Active', email: true, sms: false, whatsapp: true, push: true, type: 'leave' },
          { id: 5, name: 'Online Admission Form Received', desc: 'Sent when online admission enquiry is submitted.', status: 'Active', email: true, sms: true, whatsapp: true, push: true, type: 'admission' },
          { id: 6, name: 'Fee Dues Reminder', desc: 'Automated notice sent 3 days before fee due date.', status: 'Active', email: true, sms: true, whatsapp: true, push: true, type: 'billing' }
        ]
      },
      {
        key: 'admission_settings',
        value: {
          enableFee: true,
          registrationFee: 1500,
          customSlug: 'greenwood-international',
          allowOnlineEnquiry: true,
          autoGenerateAdmNo: true
        }
      },
      {
        key: 'audit_trail',
        value: [
          {
            id: 1,
            user: 'School Superintendent',
            activity: 'Updated',
            platform: 'Web Console',
            date: '15 Oct, 2026 12:20 PM',
            eventTitle: 'Updated School Profile & Contact Credentials.',
            changes: [{ field: 'School Name', from: 'ALL CORE SOLUTION', to: 'Greenwood International School' }]
          },
          {
            id: 2,
            user: 'System Admin',
            activity: 'Configured',
            platform: 'Web Console',
            date: '15 Oct, 2026 11:45 AM',
            eventTitle: 'Configured Razorpay Payment Gateway for Live Fee Transactions.',
            changes: [{ field: 'Provider', from: 'None', to: 'Razorpay' }]
          },
          {
            id: 3,
            user: 'Super Admin',
            activity: 'Renewed',
            platform: 'Billing System',
            date: '14 Oct, 2026 09:30 AM',
            eventTitle: 'Upgraded Annual Growth Plan Subscription License.',
            changes: [{ field: 'Plan', from: 'Trial', to: 'Growth Plan' }]
          }
        ]
      },
      {
        key: 'module_settings',
        value: {
          modules: {
            schoolWebsite: true,
            homework: true,
            libraryManagement: true,
            transport: true,
            hostel: true,
            inventory: true,
            assetManagement: true,
            aiAssistant: true,
            chatbot: true,
            studyCenter: true,
            liveClasses: true,
            finance: true,
            frontOffice: true,
            leadManagement: true,
            communications: true,
            onlineExams: true,
            biometricAttendance: true,
            cbcAcademics: true,
            healthRecords: true,
            appsCenter: true,
            ptm: true,
            lessonPlanner: true,
            osmEvaluation: true
          },
          parentVisibility: {
            aiAssistant: true,
            assessment: true,
            cbcAcademics: true,
            cctvSurveillance: true,
            osmEvaluation: true,
            healthRecords: true,
            homework: true,
            chatbot: true,
            lessonPlanner: true,
            libraryManagement: true,
            onlineExams: true,
            ptm: true,
            studyCenter: true,
            surveysFeedback: true,
            transport: true
          }
        }
      },
      {
        key: 'content_safety',
        value: {
          isSafetyEnabled: true,
          filterLevel: 'Strict',
          autoBlurThumbnails: true,
          logTeacherReveals: true,
          stats: {
            scanned: 1420,
            pending: 2,
            clean: 1416,
            flagged: 2
          }
        }
      },
      {
        key: 'backup_settings',
        value: {
          dailySummary: true,
          summaryTime: '08:00',
          deliveryEmail: true,
          deliveryWhatsApp: true,
          systemBackup: true,
          backupTime: '02:00',
          selectedProvider: 'Cloudflare R2',
          backups: [
            { 
              id: 1, 
              date: '15 Oct, 2026 02:00 AM', 
              filename: 'mongodb-school_erp-snapshot-2026-10-15.tar.gz', 
              size: '24.85 MB',
              type: 'Automated Nightly',
              destination: 'Cloudflare R2 (ap-south-1)',
              status: 'Verified Healthy'
            },
            { 
              id: 2, 
              date: '14 Oct, 2026 02:00 AM', 
              filename: 'mongodb-school_erp-snapshot-2026-10-14.tar.gz', 
              size: '24.52 MB',
              type: 'Automated Nightly',
              destination: 'Cloudflare R2 (ap-south-1)',
              status: 'Verified Healthy'
            }
          ]
        }
      }
    ];

    for (const item of settingsToSeed) {
      await GlobalSetting.findOneAndUpdate(
        { key: item.key },
        { key: item.key, value: item.value },
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded ${settingsToSeed.length} Global Settings.`);

    console.log('=== SETTINGS & BILLING SEEDING COMPLETED SUCCESSFULLY ===');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
}

seedSettingsBilling();
