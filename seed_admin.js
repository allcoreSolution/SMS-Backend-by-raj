require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB.");

    // Admin Role
    let adminRole = await Role.findOne({ name: 'Admin' });
    if (!adminRole) {
      adminRole = await Role.create({ name: 'Admin', permissions: ['all'], description: 'School Admin' });
    }

    // SuperAdmin Role
    let superRole = await Role.findOne({ name: 'SuperAdmin' });
    if (!superRole) {
      superRole = await Role.create({ name: 'SuperAdmin', permissions: ['all'], description: 'Platform Super Admin' });
    }

    const email = 'admin123@gmail.com';
    const password = 'admin@123';

    // Upsert Admin
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: 'admin',
        email,
        password,
        role: adminRole._id,
        isActive: true,
      });
      console.log("Created Admin User.");
    } else {
      user.password = password;
      user.isActive = true;
      user.role = adminRole._id;
      await user.save();
      console.log("Updated Admin User password.");
    }

    // Also create/update SuperAdmin with same credentials
    let superUser = await User.findOne({ email: 'admin123@gmail.com', role: superRole._id });
    if (!superUser) {
      // Same email can work if role differs, or use same login for all panels
      let existing = await User.findOne({ email });
      if (existing) {
        existing.role = superRole._id;
        existing.password = password;
        await existing.save();
        console.log("Updated user role to SuperAdmin as well (shared login).");
      }
    }

    // Also ensure username-based login works
    let byUser = await User.findOne({ username: 'admin' });
    if (byUser) {
      byUser.email = email;
      byUser.password = password;
      byUser.isActive = true;
      await byUser.save();
    }

    console.log("\n==================================");
    console.log("SUCCESS! ALL ADMIN PANELS READY.");
    console.log("Login Email: admin123@gmail.com");
    console.log("Password: admin@123");
    console.log("==================================\n");

  } catch(e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}

createAdmin();
