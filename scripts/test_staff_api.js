const fs = require('fs');

async function testAPIs() {
  console.log('Testing Staff APIs...\n');
  const baseUrl = 'http://localhost:5000/api';
  
  // 1. Login to get token
  console.log('1. Logging in as Admin...');
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@school.com', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success) {
    console.error('Login failed:', loginData);
    return;
  }
  const token = loginData.data.token;
  console.log('Login successful. Token acquired.\n');

  // Need to get a Role ID for the Staff.
  // We can fetch roles.
  const rolesRes = await fetch(`${baseUrl}/auth/roles`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const rolesData = await rolesRes.json();
  const teacherRole = rolesData.data.find(r => r.name === 'Teacher');

  // 2. Create Staff (POST)
  console.log('2. Creating a new Staff member (POST /api/staff)...');
  
  const staffPayload = {
    fullName: 'John Doe',
    email: 'john.doe@school.com',
    role: teacherRole._id,
    staffId: 'STF1001',
    designation: 'Senior Teacher',
    gender: 'Male',
    department: 'Science',
    bankDetails: JSON.stringify({
      accountTitle: 'John Doe',
      accountNumber: '123456789',
      bankName: 'SBI'
    })
  };

  const createRes = await fetch(`${baseUrl}/staff`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(staffPayload)
  });
  const createData = await createRes.json();
  console.log('Create Response:', createData);
  if (!createData.success) return;
  const staffId = createData.data._id;
  console.log('\n');

  // 3. Get Staffs (GET)
  console.log('3. Getting all Staff members (GET /api/staff)...');
  const getAllRes = await fetch(`${baseUrl}/staff`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const getAllData = await getAllRes.json();
  console.log(`Found ${getAllData.count} staff members.\n`);

  // 4. Update Staff (PUT)
  console.log('4. Updating Staff member (PUT /api/staff/:id)...');
  const updateRes = await fetch(`${baseUrl}/staff/${staffId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      department: 'Physics', // updated field
      designation: 'HOD Physics' // updated field
    })
  });
  const updateData = await updateRes.json();
  console.log('Update Response:', updateData);
  console.log('\n');

  // 5. Delete Staff (DELETE)
  console.log('5. Testing complete. Staff record is kept in DB as requested by user.');
  // User said "aur ik ik data database me bhe dena" (and insert one data into DB), so we won't delete it.
}

testAPIs().catch(console.error);
