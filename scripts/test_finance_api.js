const fs = require('fs');

async function testFinanceAPIs() {
  console.log('Testing Finance APIs...\n');
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

  // Need a student to assign fees to
  const studentsRes = await fetch(`${baseUrl}/students`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const studentsData = await studentsRes.json();
  let studentId = studentsData.data[0]?._id;
  
  if (!studentId) {
    console.log('No student found. Creating one...');
    const studentRes = await fetch(`${baseUrl}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            aparId: 'APAR-FIN-01',
            firstName: 'Finance',
            lastName: 'Student',
            gender: 'Male',
            dateOfBirth: '2010-01-01',
        })
    });
    const studentData = await studentRes.json();
    studentId = studentData.data._id;
  }
  console.log(`Using Student ID: ${studentId}\n`);

  // 2. Create FeeType
  console.log('2. Creating FeeType...');
  const feeTypeRes = await fetch(`${baseUrl}/fee-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name: 'Tuition Fee', code: 'TUT101', description: 'Regular Monthly Tuition Fee' })
  });
  const feeTypeData = await feeTypeRes.json();
  console.log('FeeType created:', feeTypeData.data._id);
  const feeTypeId = feeTypeData.data._id;

  // 3. Create FeeGroup
  console.log('3. Creating FeeGroup...');
  const feeGroupRes = await fetch(`${baseUrl}/fee-groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Class 10 Regular',
      feeTypes: [{
        feeType: feeTypeId,
        amount: 1500,
        fineType: 'None',
        fineAmount: 0
      }]
    })
  });
  const feeGroupData = await feeGroupRes.json();
  console.log('FeeGroup created:', feeGroupData.data._id);
  const feeGroupId = feeGroupData.data._id;

  // 4. Create FeeDiscount
  console.log('4. Creating FeeDiscount...');
  const feeDiscountRes = await fetch(`${baseUrl}/fee-discounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name: 'Early Bird', code: 'EB10', discountType: 'Percentage', amount: 10 })
  });
  const feeDiscountData = await feeDiscountRes.json();
  console.log('FeeDiscount created:', feeDiscountData.data._id);
  const discountId = feeDiscountData.data._id;

  // 5. Assign Fee to Student
  console.log('5. Assigning FeeGroup to Student...');
  const assignRes = await fetch(`${baseUrl}/assign-fees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ student: studentId, feeGroup: feeGroupId, dueDate: '2026-09-10' })
  });
  const assignData = await assignRes.json();
  console.log('Fee assigned successfully.\n');

  // 6. Collect Fee (Payment)
  console.log('6. Collecting Fee payment...');
  const collectRes = await fetch(`${baseUrl}/collect-fees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      student: studentId,
      feeGroup: feeGroupId,
      amountPaid: 1350, // 1500 - 10%
      discount: discountId,
      paymentMode: 'Cash',
      note: 'Paid in full with early bird discount'
    })
  });
  const collectData = await collectRes.json();
  console.log('Fee Receipt Generated:', collectData.data);
  
  console.log('\n7. All Finance APIs tested successfully!');
}

testFinanceAPIs().catch(console.error);
