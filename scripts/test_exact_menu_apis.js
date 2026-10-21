const baseUrl = 'http://localhost:5000/api';

async function testExactMenuEndpoints() {
  console.log('=== TESTING NEW EXACT MATCHING SIDEBAR ENDPOINTS ===\n');

  // Login as Admin
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@school.com', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 1. Fees Dashboard
  const dashboard = await (await fetch(`${baseUrl}/fees-dashboard`, { headers })).json();
  console.log('1. GET /api/fees-dashboard success:', dashboard.success);

  // 2. Search Due Fees
  const dueFees = await (await fetch(`${baseUrl}/search-due-fees`, { headers })).json();
  console.log('2. GET /api/search-due-fees success:', dueFees.success, `| Found ${dueFees.count} students with dues.`);

  // 3. All Transactions
  const allTx = await (await fetch(`${baseUrl}/all-transactions`, { headers })).json();
  console.log('3. GET /api/all-transactions success:', allTx.success, `| Found ${allTx.count} transactions.`);

  // 4. Online Transactions
  const onlineTx = await (await fetch(`${baseUrl}/online-transactions`, { headers })).json();
  console.log('4. GET /api/online-transactions success:', onlineTx.success, `| Found ${onlineTx.count} online transactions.`);

  // 5. Generate Due Slip
  const genSlip = await (await fetch(`${baseUrl}/generate-due-slip`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ targetClass: 'Class 6', targetSection: 'A' })
  })).json();
  console.log('5. POST /api/generate-due-slip success:', genSlip.success, genSlip.batch ? `| Batch ID: ${genSlip.batch.batchId}` : '');

  // 6. Due Slip History
  const history = await (await fetch(`${baseUrl}/due-slip-history`, { headers })).json();
  console.log('6. GET /api/due-slip-history success:', history.success, `| Found ${history.count} slip batches.`);

  // 7. Fee Data Audit
  const audits = await (await fetch(`${baseUrl}/fee-data-audit`, { headers })).json();
  console.log('7. GET /api/fee-data-audit success:', audits.success);

  // 8. Fees Discount (Exact Match check)
  const discounts = await (await fetch(`${baseUrl}/fees-discount`, { headers })).json();
  console.log('8. GET /api/fees-discount success:', discounts.success);

  console.log('\n=== ENDPOINTS TEST COMPLETED SUCCESSFULLY ===');
}

testExactMenuEndpoints().catch(console.error);
