const baseUrl = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== STARTING APP ROLE AND REPORTS VERIFICATION TESTS ===\n');

  // ==========================================
  // 1. ADMIN LOGIN
  // ==========================================
  console.log('1. Logging in as Admin...');
  const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@school.com', password: 'admin123' })
  });
  const adminLogin = await adminLoginRes.json();
  if (!adminLogin.success) {
    console.error('Admin login failed:', adminLogin);
    return;
  }
  const adminToken = adminLogin.data.token;
  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };
  console.log('Admin logged in successfully.\n');

  // Get student IDs and roles
  const studentsRes = await fetch(`${baseUrl}/students`, { headers: adminHeaders });
  const studentsData = await studentsRes.json();
  const student1 = studentsData.data[0];
  const student2 = studentsData.data[1];
  
  if (!student1 || !student2) {
    console.error('Please run populate_dummy_data.js first to insert students.');
    return;
  }

  // Update Student 1's email so we can test ownership check
  console.log(`Updating Student ${student1.firstName}'s email to aarav@school.com...`);
  await fetch(`${baseUrl}/students/${student1._id}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ studentEmail: 'aarav@school.com' })
  });

  // Update Student 2's email
  await fetch(`${baseUrl}/students/${student2._id}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ studentEmail: 'diya@school.com' })
  });

  // Register Student 1 as a User so they can login
  console.log('Registering Student 1 user...');
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'aarav',
      email: 'aarav@school.com',
      password: 'student123',
      roleName: 'Student'
    })
  });
  const regData = await regRes.json();
  console.log('Student registered:', regData.success);

  // ==========================================
  // 2. STUDENT LOGIN
  // ==========================================
  console.log('\n2. Logging in as Student (Aarav)...');
  const studentLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aarav@school.com', password: 'student123' })
  });
  const studentLogin = await studentLoginRes.json();
  const studentToken = studentLogin.data.token;
  const studentHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${studentToken}`
  };
  console.log('Student logged in successfully.');

  // ==========================================
  // 3. VERIFY OWN DATA ACCESS (STUDENT APP)
  // ==========================================
  console.log('\n3. Verifying Student App - Accessing OWN data:');

  // Can view own profile
  const ownProfile = await (await fetch(`${baseUrl}/students/${student1._id}`, { headers: studentHeaders })).json();
  console.log('- View own profile success:', ownProfile.success);

  // Can view own dues
  const ownDues = await (await fetch(`${baseUrl}/finance-reports/student-dues/${student1._id}`, { headers: studentHeaders })).json();
  console.log('- View own dues success:', ownDues.success);

  // Can view own assigned fees
  const ownAssigned = await (await fetch(`${baseUrl}/assign-fees/student/${student1._id}`, { headers: studentHeaders })).json();
  console.log('- View own assigned fees success:', ownAssigned.success);

  // ==========================================
  // 4. VERIFY OTHER DATA ACCESS BLOCKED (STUDENT APP)
  // ==========================================
  console.log('\n4. Verifying Student App - Attempting to access OTHER student\'s data (Should Fail):');

  // Try to view student 2 profile
  const otherProfile = await (await fetch(`${baseUrl}/students/${student2._id}`, { headers: studentHeaders })).json();
  console.log('- View other profile status (should be false):', otherProfile.success, '| Message:', otherProfile.message);

  // Try to view student 2 dues
  const otherDues = await (await fetch(`${baseUrl}/finance-reports/student-dues/${student2._id}`, { headers: studentHeaders })).json();
  console.log('- View other dues status (should be false):', otherDues.success, '| Message:', otherDues.message);

  // Try to access admin dashboard as student
  const adminDash = await (await fetch(`${baseUrl}/finance-reports/dashboard`, { headers: studentHeaders })).json();
  console.log('- Access admin dashboard (should be false):', adminDash.success, '| Message:', adminDash.message);

  // ==========================================
  // 5. ADMIN REPORTS AND METRICS (ADMIN APP)
  // ==========================================
  console.log('\n5. Verifying Admin App - Reports and metrics:');

  // Generate Challan
  console.log('Generating a Fee Challan...');
  const chalRes = await fetch(`${baseUrl}/fee-challans`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      student: student1._id,
      feeGroup: ownDues.data.groups[0]?.feeGroup._id,
      dueDate: '2026-11-30'
    })
  });
  const chalData = await chalRes.json();
  console.log('- Challan generated:', chalData.success, chalData.data?.challanNo);

  // Get Finance Dashboard Stats
  const dashboard = await (await fetch(`${baseUrl}/finance-reports/dashboard`, { headers: adminHeaders })).json();
  console.log('- Fetch Finance Dashboard stats success:', dashboard.success);
  console.log('  Total Expected:', dashboard.data?.totalExpected);
  console.log('  Total Collected:', dashboard.data?.totalCollected);
  console.log('  Total Outstanding Due:', dashboard.data?.totalDue);

  // Get Due Fees report
  const dueReport = await (await fetch(`${baseUrl}/finance-reports/due-fees`, { headers: adminHeaders })).json();
  console.log('- Fetch Due Fees report success:', dueReport.success, `| Found ${dueReport.count} students with dues.`);

  console.log('\n=== ALL VERIFICATION TESTS COMPLETED ===');
}

runTests().catch(console.error);
