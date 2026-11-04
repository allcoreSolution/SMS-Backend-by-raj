const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { resolveTenant, isSameTenant } = require('../services/tenantResolver');

async function testResolver() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGO_URI_ATLAS;
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('DB connected for resolver test.');

    const testCases = [
      'tenant-allcore-01',
      '6ad9bbe1c6514fd4a43099c6',
      'AMITY SCHOOL',
      'amity',
      '6ad8a3f0a70375e33dec8d6e',
      '507f1f77bcf86cd799439011', // valid ObjectId format, but does not exist in DB
      'random-fake-tenant-1234', // string that does not exist
      null,
      undefined,
      ''
    ];

    for (const testInput of testCases) {
      const res = await resolveTenant(testInput);
      if (res) {
        console.log(`PASS: "${testInput}" => Tenant ID: ${res.tenantId} (${res.tenant.schoolName})`);
      } else {
        console.log(`NULL: "${testInput}" => null (unresolved/nonexistent)`);
      }
    }

    await mongoose.disconnect();
    console.log('Resolver test completed.');
  } catch (err) {
    console.error('Resolver test error:', err);
  }
}

testResolver();

