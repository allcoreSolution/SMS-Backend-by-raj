require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const FeeType = require('../models/FeeType');
const FeeGroup = require('../models/FeeGroup');
const FeeDiscount = require('../models/FeeDiscount');
const AssignFee = require('../models/AssignFee');
const FeeCollection = require('../models/FeeCollection');

const rolesData = [
  {
    name: 'Admin',
    permissions: [
      'create_students',
      'view_students',
      'update_students',
      'delete_students',
      'create_staff',
      'view_staff',
      'update_staff',
      'delete_staff',
      'manage_roles',
      'view_roles',
      'manage_finance',
    ],
    description: 'System administrator with full permissions.',
  },
  {
    name: 'Registrar',
    permissions: [
      'create_students',
      'view_students',
      'update_students',
      'view_roles',
    ],
    description: 'Staff responsible for student admissions and profile updates.',
  },
  {
    name: 'Teacher',
    permissions: ['view_students'],
    description: 'Academic staff with read-only access to student profiles.',
  },
  {
    name: 'Student',
    permissions: [],
    description: 'Student role with limited portal access.',
  },
];

const seedDB = async () => {
  try {
    // Connect to database
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected successfully.');

    // Clear existing data
    console.log('Clearing all existing collections...');
    await Role.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});
    await Staff.deleteMany({});
    await FeeType.deleteMany({});
    await FeeGroup.deleteMany({});
    await FeeDiscount.deleteMany({});
    await AssignFee.deleteMany({});
    await FeeCollection.deleteMany({});
    console.log('Cleaned database.');

    // Seed Roles
    console.log('Seeding Roles...');
    const createdRoles = await Role.insertMany(rolesData);
    console.log(`Successfully seeded ${createdRoles.length} roles.`);

    // Find the Admin role id
    const adminRole = createdRoles.find((role) => role.name === 'Admin');

    // Seed default Admin user
    console.log('Seeding default Admin user...');
    const adminUser = await User.create({
      username: 'admin',
      email: 'ryadavy498@gmail.com',
      password: 'admin@123', // Will be hashed automatically by user pre-save hook
      role: adminRole._id,
    });

    console.log(`Successfully seeded Admin user:
Username: ${adminUser.username}
Email: ${adminUser.email}
Password: admin123
Role: Admin`);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
