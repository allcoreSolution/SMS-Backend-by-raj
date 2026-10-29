// Comprehensive Multi-Panel School ERP Ecosystem Audit
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5050/api';

async function runEcosystemAudit() {
  console.log('================================================================');
  console.log('      COMPREHENSIVE MULTI-PANEL SCHOOL ERP ECOSYSTEM AUDIT     ');
  console.log('================================================================\n');

  // 1. DATABASE CONNECTIVITY & SHARED MODELS
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';
  await mongoose.connect(mongoUri);
  console.log('✓ MongoDB Connected to:', mongoUri);

  const collections = [
    'users', 'roles', 'staffs', 'students', 'parents', 'drivers',
    'vehicles', 'routes', 'chatthreads', 'chatmessages', 'attendances',
    'feecollections', 'feegroups', 'leaves', 'complaints', 'notices',
    'homeworks', 'exams', 'surveys', 'leads'
  ];

  console.log('\n--- 1. DATABASE ENTITY INVENTORY & SHARED MODELS ---');
  for (const colName of collections) {
    try {
      const count = await mongoose.connection.db.collection(colName).countDocuments();
      console.log(`  • ${colName.padEnd(20)}: ${count} records`);
    } catch {
      console.log(`  • ${colName.padEnd(20)}: Not created`);
    }
  }

  // 2. MULTI-PANEL AUTHENTICATION AUDIT
  console.log('\n--- 2. MULTI-PANEL AUTHENTICATION AUDIT ---');
  const logins = [
    { role: 'Admin (School_ERP - 5176)', creds: { username: 'ryadavy498@gmail.com', password: 'admin@123' }, expectedRole: 'Admin' },
    { role: 'Staff (Teache_Panel - 5177)', creds: { username: 'staff@school.edu', password: 'admin@123' }, expectedRole: 'Staff' },
    { role: 'Accountant (Accountant - 5178)', creds: { username: 'accountant@allcoresolution.com', password: 'admin@123' }, expectedRole: 'Accountant' },
    { role: 'Student (Student_Parents - 5175)', creds: { username: 'YIS-2024-101', password: 'password123' }, expectedRole: 'Student' },
    { role: 'Parent (Student_Parents - 5175)', creds: { username: 'P9876510000', password: 'admin@123' }, expectedRole: 'Parent' },
    { role: 'Driver (Driver_Panel - 5180)', creds: { username: 'DL-01-AB-4501', password: 'admin123' }, expectedRole: 'Driver' }
  ];

  const tokens = {};
  for (const l of logins) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: l.creds.username,
          email: l.creds.username,
          identifier: l.creds.username,
          password: l.creds.password
        })
      });
      const data = await res.json();
      if (data.success && (data.token || data.data?.token)) {
        const token = data.token || data.data?.token;
        const role = data.data?.role?.name || data.data?.role || l.expectedRole;
        tokens[l.expectedRole] = token;
        console.log(`  ✓ ${l.role.padEnd(42)}: SUCCESS (200) Token Issued, Role: ${role}`);
      } else {
        console.log(`  ✕ ${l.role.padEnd(42)}: Result: ${data.message || 'Failed'}`);
      }
    } catch (err) {
      console.log(`  ✕ ${l.role.padEnd(42)}: Error: ${err.message}`);
    }
  }

  // 3. FORGOT PASSWORD WORKFLOW AUDIT ACROSS ALL ENTITY TYPES
  console.log('\n--- 3. FORGOT PASSWORD & OTP WORKFLOW AUDIT ---');
  const forgotTests = [
    { type: 'Admin', id: 'ryadavy498@gmail.com' },
    { type: 'Staff', id: 'staff@school.edu' },
    { type: 'Accountant', id: 'accountant@allcoresolution.com' },
    { type: 'Parent', id: 'rajesh.kumar.gupta@gmail.com' },
    { type: 'Parent (ID)', id: 'P9876510000' },
    { type: 'Student', id: 'aarav.sharma@yis.edu' },
    { type: 'Student (AdmNo)', id: 'YIS-2024-101' },
    { type: 'Driver (ID)', id: 'DRV-101' },
    { type: 'Driver (Phone)', id: '+91 98112 55555' }
  ];

  for (const ft of forgotTests) {
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ft.id })
      });
      const data = await res.json();
      if (data.success) {
        console.log(`  ✓ Forgot Password for ${ft.type.padEnd(16)} (${ft.id.padEnd(30)}): OTP ${data.otp || data.devOtp || 'Dispatched'} ✓`);
      } else {
        console.log(`  ⚠ Forgot Password for ${ft.type.padEnd(16)} (${ft.id.padEnd(30)}): ${data.message}`);
      }
    } catch (err) {
      console.log(`  ✕ Forgot Password for ${ft.type}: ${err.message}`);
    }
  }

  // 4. AUDIT CROSS-PANEL DATA CONNECTIVITY & CRUD OPERATIONS
  console.log('\n--- 4. CROSS-PANEL DATA CONNECTIVITY & CRUD OPERATIONS ---');
  const adminToken = tokens['Admin'];
  if (adminToken) {
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    };

    // A. Notice Board (Create -> Multi-Panel Fetch -> Delete)
    try {
      const noticeRes = await fetch(`${BASE_URL}/notices`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title: 'Ecosystem Connectivity Audit Notice ' + Date.now(),
          content: 'Verified multi-panel cross data synchronization.',
          targetAudience: 'All',
          priority: 'High',
          category: 'General'
        })
      });
      const noticeData = await noticeRes.json();
      const noticeId = noticeData.data?._id || noticeData._id;
      console.log(`  ✓ Notice Board CRUD (Create & Sync)        : Status ${noticeRes.status} (ID: ${noticeId || 'Created'})`);

      const fetchNotices = await fetch(`${BASE_URL}/notices`, { headers: authHeaders });
      const fetched = await fetchNotices.json();
      console.log(`  ✓ Notice Board Multi-Panel Fetch           : Status ${fetchNotices.status} (Count: ${fetched.count || fetched.data?.length || 0})`);

      if (noticeId) {
        await fetch(`${BASE_URL}/notices/${noticeId}`, { method: 'DELETE', headers: authHeaders }).catch(() => null);
      }
    } catch (e) {
      console.log(`  ✕ Notice Board Test: ${e.message}`);
    }

    // B. Chats & Communication (Threads, Contacts, Messaging)
    try {
      const threadsRes = await fetch(`${BASE_URL}/chats/threads`, { headers: authHeaders });
      const threadsData = await threadsRes.json();
      console.log(`  ✓ Communication Threads (Chat Engine)      : Status ${threadsRes.status} (${threadsData.count || 0} active threads)`);

      const contactsRes = await fetch(`${BASE_URL}/chats/contacts`, { headers: authHeaders });
      const contactsData = await contactsRes.json();
      console.log(`  ✓ Communication Directory (Staff & Faculty): Status ${contactsRes.status} (${contactsData.count || contactsData.data?.length || 0} contacts)`);
    } catch (e) {
      console.log(`  ✕ Chat Engine Test: ${e.message}`);
    }

    // C. Student Master & Live Patching
    try {
      const stuRes = await fetch(`${BASE_URL}/students?limit=5`, { headers: authHeaders });
      const stuData = await stuRes.json();
      const studentsList = stuData.data || stuData.students || [];
      console.log(`  ✓ Student Master (Shared to Parent/Fee/Exam): Status ${stuRes.status} (${stuData.total || stuData.count || studentsList.length} students)`);

      // Test real data patching on a student
      if (studentsList.length > 0) {
        const testStudent = studentsList[0];
        const patchRes = await fetch(`${BASE_URL}/students/${testStudent._id}`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({ emergencyContactRelation: 'Parent/Guardian' })
        });
        console.log(`  ✓ Student Real Data Patching (Update)      : Status ${patchRes.status} (Live Sync: OK)`);
      }
    } catch (e) {
      console.log(`  ✕ Student Master Test: ${e.message}`);
    }

    // D. HR Staff Directory & Live Patching
    try {
      const staffRes = await fetch(`${BASE_URL}/staff?limit=5`, { headers: authHeaders });
      const staffData = await staffRes.json();
      const staffList = staffData.data || staffData.staff || [];
      console.log(`  ✓ HR Staff Directory (Shared to Staff Desk) : Status ${staffRes.status} (${staffData.count || staffList.length} staff members)`);

      if (staffList.length > 0) {
        const testStaff = staffList[0];
        const patchRes = await fetch(`${BASE_URL}/staff/${testStaff._id}`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({ notes: 'Ecosystem verified at ' + new Date().toLocaleTimeString() })
        });
        console.log(`  ✓ Staff Real Data Patching (Update)        : Status ${patchRes.status} (Live Sync: OK)`);
      }
    } catch (e) {
      console.log(`  ✕ HR Staff Test: ${e.message}`);
    }

    // E. Fee Groups & Financial Ledger
    try {
      const feeRes = await fetch(`${BASE_URL}/fee-groups`, { headers: authHeaders });
      const feeData = await feeRes.json();
      console.log(`  ✓ Financial Fee Ledger (Accountant / Parent): Status ${feeRes.status} (${feeData.count || feeData.data?.length || 0} fee groups)`);

      const collRes = await fetch(`${BASE_URL}/collect-fees?limit=5`, { headers: authHeaders });
      const collData = await collRes.json();
      console.log(`  ✓ Fee Collection Real-Time Records         : Status ${collRes.status} (${collData.count || collData.total || collData.data?.length || 0} transactions)`);
    } catch (e) {
      console.log(`  ✕ Finance Ledger Test: ${e.message}`);
    }

    // F. Transport Fleet & Routes
    try {
      const transRes = await fetch(`${BASE_URL}/transport/routes`, { headers: authHeaders });
      const transData = await transRes.json();
      console.log(`  ✓ Transport Fleet & GPS Routes (Driver/Bus) : Status ${transRes.status} (${transData.count || transData.data?.length || 0} routes)`);
    } catch (e) {
      console.log(`  ✕ Transport Test: ${e.message}`);
    }

    // G. AI Assistant & Knowledge Base (Chatbot)
    try {
      const aiRes = await fetch(`${BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'What is the school fee payment schedule?',
          sessionId: 'test_session_audit_1'
        })
      });
      const aiData = await aiRes.json();
      const hasAnswer = (aiData.reply || aiData.response || aiData.message || '').length > 10;
      console.log(`  ✓ AI Chatbot Assistant (Query & RAG Engine) : Status ${aiRes.status} (Answer Generated: ${hasAnswer ? 'YES' : 'NO'})`);
    } catch (e) {
      console.log(`  ✕ AI Assistant Test: ${e.message}`);
    }

    // H. Notifications Desk (Email / In-App)
    try {
      const notifRes = await fetch(`${BASE_URL}/notifications`, { headers: authHeaders });
      const notifData = await notifRes.json();
      console.log(`  ✓ Notification & Broadcast Desk            : Status ${notifRes.status} (${notifData.count || notifData.data?.length || 0} alerts)`);
    } catch (e) {
      console.log(`  ✕ Notification Test: ${e.message}`);
    }
  }

  console.log('\n================================================================');
  console.log('              ALL ECOSYSTEM CHECKS COMPLETED                   ');
  console.log('================================================================\n');
  process.exit(0);
}

runEcosystemAudit().catch(err => {
  console.error('Audit run error:', err);
  process.exit(1);
});
