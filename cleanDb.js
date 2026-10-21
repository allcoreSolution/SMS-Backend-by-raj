require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://allcore2515:iosajay2000@allcoresolution.h6jogox.mongodb.net/school_erp?appName=allcoreSolution';

async function cleanAndSeed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');
    
    // Clear all collections
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
      console.log('✓ Cleared collection: ' + collection.collectionName);
    }

    // Seed one fresh Super Admin
    const hashedPassword = await bcrypt.hash('admin@123', 10);
    await mongoose.connection.db.collection('users').insertOne({
      username: 'Super Admin',
      email: 'admin123@gmail.com',
      password: hashedPassword,
      role: 'SuperAdmin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('\n================================');
    console.log('ALL DUMMY DATA CLEARED SUCCESSFULLY!');
    console.log('New SuperAdmin Created:');
    console.log('Email: admin123@gmail.com');
    console.log('Password: admin@123');
    console.log('================================');
    
    process.exit(0);
  } catch(e) {
    console.error('Database connection or clearance failed:', e);
    process.exit(1);
  }
}

cleanAndSeed();
