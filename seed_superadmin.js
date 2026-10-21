require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB.");

    let adminRole = await Role.findOne({ name: 'SuperAdmin' });
    if (!adminRole) {
      adminRole = await Role.create({ name: 'SuperAdmin', permissions: ['all'], description: 'Platform Super Admin' });
    }

    const email = 'admin123@gmail.com';
    const password = 'admin@123';

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: 'superadmin',
        email,
        password,
        role: adminRole._id,
        isActive: true,
      });
      console.log("Created SuperAdmin User Document.");
    } else {
      console.log("User already exists. Updating to SuperAdmin credentials...");
      user.password = password;
      user.role = adminRole._id;
      user.isActive = true;
      await user.save();
    }

    console.log("\n==================================");
    console.log("SUCCESS! SUPERADMIN IS READY.");
    console.log("Login Email: admin123@gmail.com");
    console.log("Password: admin@123");
    console.log("==================================\n");

  } catch(e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}

createSuperAdmin();
