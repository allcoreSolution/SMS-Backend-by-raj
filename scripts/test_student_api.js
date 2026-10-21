const fs = require('fs');

async function testStudentAPIs() {
  console.log('Testing Student APIs...\n');
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

  // 2. Create Student (POST)
  console.log('2. Creating a new Student (POST /api/students)...');
  
  const studentPayload = {
    aparId: 'APAR2026001',
    firstName: 'Ramesh',
    lastName: 'Kumar',
    gender: 'Male',
    dateOfBirth: '2010-05-15',
    category: 'General',
    nationality: 'Indian',
    studentPhone: '9876543210'
  };

  const createRes = await fetch(`${baseUrl}/students`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(studentPayload)
  });
  const createData = await createRes.json();
  console.log('Create Response:', createData);
  if (!createData.success) {
    console.error('Failed to create student.');
    return;
  }
  const studentId = createData.data._id;
  console.log('\n');

  // 3. Get Students (GET)
  console.log('3. Getting all Students (GET /api/students)...');
  const getAllRes = await fetch(`${baseUrl}/students`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const getAllData = await getAllRes.json();
  console.log(`Found ${getAllData.count} students.\n`);

  // 4. Update Student (PUT/PATCH)
  console.log('4. Updating Student (PATCH /api/students/:id)...');
  const updateRes = await fetch(`${baseUrl}/students/${studentId}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      category: 'OBC', // updated field
      studentPhone: '9999999999' // updated field
    })
  });
  const updateData = await updateRes.json();
  console.log('Update Response:', updateData);
  console.log('\n');

  console.log('5. Testing complete. Student record is kept in DB.');
}

testStudentAPIs().catch(console.error);
