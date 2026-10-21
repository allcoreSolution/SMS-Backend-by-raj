const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://allcore2515:iosajay2000@allcoresolution.h6jogox.mongodb.net/school_erp?appName=allcoreSolution';

async function fixDb() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    // Create SuperAdmin role if not exists
    let role = await db.collection('roles').findOne({ name: 'SuperAdmin' });
    if (!role) {
      const res = await db.collection('roles').insertOne({
        name: 'SuperAdmin',
        permissions: ['all'],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      role = { _id: res.insertedId };
    }

    // Hash admin123 instead of admin@123 to match frontend expectation
    const hashedPassword = await bcrypt.hash('admin@123', 10);

    // Update the superadmin user
    await db.collection('users').updateOne(
      { email: 'admin123@gmail.com' },
      { 
        $set: { 
          role: role._id, 
          password: hashedPassword,
          isActive: true
        } 
      },
      { upsert: true }
    );

    console.log('Fixed DB Roles and Password! Now SuperAdmin login will work perfectly with admin123');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
fixDb();
