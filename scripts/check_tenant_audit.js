const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

async function check() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGO_URI_ATLAS;
    console.log('Connecting to URI (masked):', uri.replace(/:([^:@]+)@/, ':****@'));
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected to DB successfully!');

    const db = mongoose.connection.db;

    const tenants = await db.collection('tenants').find({}).toArray();
    console.log(`\n--- FOUND ${tenants.length} TENANTS ---`);
    tenants.forEach(t => {
      console.log(`ID: ${t._id.toString()} | schoolName: "${t.schoolName}" | email: ${t.email} | subdomain: ${t.subdomain} | status: ${t.status}`);
    });

    const staffCount = await db.collection('staffs').countDocuments();
    console.log(`\n--- FOUND ${staffCount} STAFF RECORDS ---`);
    const staffList = await db.collection('staffs').find({}).limit(5).toArray();
    staffList.forEach(s => {
      console.log(`ID: ${s._id.toString()} | staffId: ${s.staffId} | name: ${s.fullName} | tenant: ${s.tenant} (type: ${typeof s.tenant})`);
    });

    const users = await db.collection('users').find({}).limit(10).toArray();
    console.log(`\n--- FOUND ${users.length} SAMPLE USERS ---`);
    users.forEach(u => {
      console.log(`ID: ${u._id.toString()} | username: ${u.username} | email: ${u.email} | tenant: ${u.tenant}`);
    });

    await mongoose.disconnect();
    console.log('\nAudit complete.');
  } catch (err) {
    console.error('Error checking DB:', err);
  }
}

check();
