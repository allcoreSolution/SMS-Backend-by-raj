const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedStaff() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';
    console.log('Connecting to:', mongoUri.replace(/\/\/.*@/, '//<creds>@'));
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    // 1. Ensure Staff Role exists
    let staffRole = await mongoose.connection.collection('roles').findOne({ name: 'Staff' });
    if (!staffRole) {
      const res = await mongoose.connection.collection('roles').insertOne({
        name: 'Staff',
        permissions: ['all', 'manage_chat', 'view_all', 'manage_staff', 'manage_roles', 'send_whatsapp'],
        description: 'Staff & Administration Faculty Role'
      });
      staffRole = { _id: res.insertedId, name: 'Staff' };
      console.log('Created Staff Role:', staffRole._id);
    } else {
      console.log('Found existing Staff Role:', staffRole._id);
    }

    // 2. Ensure staff@school.edu User exists with admin@123 password
    const hashedPassword = await bcrypt.hash('admin@123', 10);
    const existingUser = await mongoose.connection.collection('users').findOne({ email: 'staff@school.edu' });
    if (!existingUser) {
      await mongoose.connection.collection('users').insertOne({
        username: 'staff_rajesh',
        email: 'staff@school.edu',
        password: hashedPassword,
        role: staffRole._id,
        firstName: 'Rajesh',
        lastName: 'Verma',
        phone: '9810011223',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Created User: staff@school.edu');
    } else {
      await mongoose.connection.collection('users').updateOne(
        { email: 'staff@school.edu' },
        { $set: { password: hashedPassword, role: staffRole._id, isActive: true } }
      );
      console.log('Updated User staff@school.edu with password admin@123');
    }

    // 3. Ensure Staff model record exists for staff@school.edu
    const existingStaff = await mongoose.connection.collection('staffs').findOne({ email: 'staff@school.edu' });
    if (!existingStaff) {
      await mongoose.connection.collection('staffs').insertOne({
        fullName: 'Rajesh Verma',
        email: 'staff@school.edu',
        role: staffRole._id,
        staffId: 'STF-100',
        biometricId: 'BIO-100',
        designation: 'Senior Administrative Officer',
        department: 'Administration & HR',
        gender: 'Male',
        phone: '9810011223',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Created Staff record: staff@school.edu');
    } else {
      console.log('Staff record already exists');
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch(err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}
seedStaff();
