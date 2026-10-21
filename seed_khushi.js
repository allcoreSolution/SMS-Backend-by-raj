require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
const Student = require('./models/Student');

async function createKhushi() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB.");

    let studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      studentRole = await Role.create({ name: 'Student', permissions: [], description: 'Student' });
    }

    // Check if Khushi already exists
    let student = await Student.findOne({ aparId: 'APAR-KHUSHI-001' });
    if (!student) {
      student = await Student.create({
        aparId: 'APAR-KHUSHI-001',
        firstName: 'Khushi',
        lastName: 'Sharma',
        gender: 'Female',
        dateOfBirth: new Date('2010-05-15'),
        studentPhone: '9876543210',
        studentEmail: 'khushi@school.com',
        extraFields: { studentClass: 'Class 10', section: 'A' }
      });
      console.log("Created Student Document with ID:", student._id);
    } else {
      console.log("Student KHUSHI already exists with ID:", student._id);
    }

    // Now create a User with the EXACT SAME ID so the Flutter app's /api/students/:id works
    let user = await User.findById(student._id);
    if (!user) {
      user = await User.create({
        _id: student._id, // FORCE SAME ID
        username: 'khushi',
        email: 'khushi@school.com',
        password: 'password123',
        role: studentRole._id,
      });
      console.log("Created matching User Document for Student Login.");
    } else {
       console.log("User already exists.");
    }

    console.log("\n==================================");
    console.log("SUCCESS! KHUSHI IS READY.");
    console.log("Login Email: khushi@school.com");
    console.log("Password: password123");
    console.log("==================================\n");

  } catch(e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}

createKhushi();
