const baseUrl = 'http://localhost:5000/api';

async function run() {
  console.log('--- STARTING DUMMY DATA INSERTION VIA HTTP API ---\n');

  // 1. Login
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@school.com', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  console.log('Login Result:', loginData);
  const token = loginData.data.token;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Get Roles
  const rolesRes = await fetch(`${baseUrl}/auth/roles`, { headers });
  const rolesData = await rolesRes.json();
  console.log('Roles Fetch Result:', rolesData);
  const teacherRole = rolesData.data.find(r => r.name === 'Teacher')?._id;
  const adminRole = rolesData.data.find(r => r.name === 'Admin')?._id;

  // ==========================================
  // 2. STUDENTS (Create 2)
  // ==========================================
  console.log('Inserting 2 Students...');
  const student1Res = await fetch(`${baseUrl}/students`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      aparId: 'APAR-DUMMY-01',
      firstName: 'Aarav',
      lastName: 'Sharma',
      gender: 'Male',
      dateOfBirth: '2012-04-10',
      category: 'General',
      studentPhone: '9812345670'
    })
  });
  const student1 = await student1Res.json();
  console.log('Student 1 Create Result:', student1);

  const student2Res = await fetch(`${baseUrl}/students`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      aparId: 'APAR-DUMMY-02',
      firstName: 'Diya',
      lastName: 'Patel',
      gender: 'Female',
      dateOfBirth: '2013-09-22',
      category: 'OBC',
      studentPhone: '9812345671'
    })
  });
  const student2 = await student2Res.json();
  console.log('Student 2 Create Result:', student2);
  console.log();

  // ==========================================
  // 3. STAFF (Create 2)
  // ==========================================
  console.log('Inserting 2 Staff members...');
  const staff1Res = await fetch(`${baseUrl}/staff`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      staffId: 'STF-DUMMY-01',
      fullName: 'Rajesh Kumar',
      email: 'rajesh.kumar@school.com',
      role: teacherRole,
      designation: 'Maths Teacher',
      gender: 'Male',
      department: 'Mathematics'
    })
  });
  const staff1 = await staff1Res.json();
  console.log('Staff 1 Create Result:', staff1);

  const staff2Res = await fetch(`${baseUrl}/staff`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      staffId: 'STF-DUMMY-02',
      fullName: 'Anjali Singh',
      email: 'anjali.singh@school.com',
      role: teacherRole,
      designation: 'English Teacher',
      gender: 'Female',
      department: 'English'
    })
  });
  const staff2 = await staff2Res.json();
  console.log('Staff 2 Create Result:', staff2);
  console.log();

  // ==========================================
  // 4. FEE TYPES (Create 2)
  // ==========================================
  console.log('Inserting 2 Fee Types...');
  const feeType1 = await (await fetch(`${baseUrl}/fee-types`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'Tuition Fee Monthly', code: 'TUT101', description: 'Regular Monthly Tuition Fee' })
  })).json();
  console.log('FeeType 1 Created:', feeType1);

  const feeType2 = await (await fetch(`${baseUrl}/fee-types`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'Bus Transport Fee', code: 'BUS102', description: 'Bus Service Monthly Fee' })
  })).json();
  console.log('FeeType 2 Created:', feeType2);
  console.log();

  // ==========================================
  // 5. FEE GROUPS (Create 2)
  // ==========================================
  console.log('Inserting 2 Fee Groups...');
  const feeGroup1 = await (await fetch(`${baseUrl}/fee-groups`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Class 6 Standard Plan',
      feeTypes: [{
        feeType: feeType1.data._id,
        amount: 2000,
        fineType: 'None',
        fineAmount: 0
      }]
    })
  })).json();
  console.log('FeeGroup 1 Created:', feeGroup1);

  const feeGroup2 = await (await fetch(`${baseUrl}/fee-groups`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Class 6 Transport Plan',
      feeTypes: [
        {
          feeType: feeType1.data._id,
          amount: 2000,
          fineType: 'None',
          fineAmount: 0
        },
        {
          feeType: feeType2.data._id,
          amount: 800,
          fineType: 'Fixed',
          fineAmount: 100
        }
      ]
    })
  })).json();
  console.log('FeeGroup 2 Created:', feeGroup2);
  console.log();

  // ==========================================
  // 6. FEE DISCOUNTS (Create 2)
  // ==========================================
  console.log('Inserting 2 Fee Discounts...');
  const discount1 = await (await fetch(`${baseUrl}/fee-discounts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'Sibling Discount', code: 'SIB15', discountType: 'Percentage', amount: 15 })
  })).json();
  console.log('Discount 1 Created:', discount1);

  const discount2 = await (await fetch(`${baseUrl}/fee-discounts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'Scholarship Discount', code: 'SCH500', discountType: 'Fixed', amount: 500 })
  })).json();
  console.log('Discount 2 Created:', discount2);
  console.log();

  // ==========================================
  // 7. ASSIGN FEES (Create 2)
  // ==========================================
  console.log('Assigning Fees to 2 Students...');
  const assign1 = await (await fetch(`${baseUrl}/assign-fees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      student: student1.data._id,
      feeGroup: feeGroup1.data._id,
      dueDate: '2026-10-01'
    })
  })).json();
  console.log('Assign 1 Completed:', assign1);

  const assign2 = await (await fetch(`${baseUrl}/assign-fees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      student: student2.data._id,
      feeGroup: feeGroup2.data._id,
      dueDate: '2026-10-15'
    })
  })).json();
  console.log('Assign 2 Completed:', assign2);
  console.log();

  // ==========================================
  // 8. FEE COLLECTIONS (Create 2)
  // ==========================================
  console.log('Collecting Fees (Payments) for 2 Students...');
  const collect1 = await (await fetch(`${baseUrl}/collect-fees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      student: student1.data._id,
      feeGroup: feeGroup1.data._id,
      amountPaid: 1700, // 2000 - 15% discount
      discount: discount1.data._id,
      paymentMode: 'Cash',
      note: 'Paid via cash with sibling discount'
    })
  })).json();
  console.log('Collection 1 (Receipt) Generated:', collect1);

  const collect2 = await (await fetch(`${baseUrl}/collect-fees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      student: student2.data._id,
      feeGroup: feeGroup2.data._id,
      amountPaid: 2300, // 2800 - 500 flat discount
      discount: discount2.data._id,
      paymentMode: 'Online',
      referenceNo: 'TXN987654321',
      note: 'Paid online via UPI'
    })
  })).json();
  console.log('Collection 2 (Receipt) Generated:', collect2);
  console.log();

  console.log('--- ALL DUMMY RECORDS INSERTED SUCCESSFULY! ---');
}

run().catch(console.error);
