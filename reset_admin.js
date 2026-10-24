require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB.");

    const email = 'ryadavy498@gmail.com';
    const password = 'admin@123';

    let user = await User.findOne({ $or: [{ email }, { email: 'admin123@gmail.com' }, { username: 'admin' }, { username: 'superadmin' }] });
    if (!user) {
       user = await User.findOne({ email: 'superadmin@erp.com' });
    }
    if (!user) {
       user = await User.findOne({ email: 'admin@school.com' });
    }

    if (user) {
        user.email = email;
        user.password = password;
        user.isActive = true;
        await user.save();
        console.log("SUCCESS! Admin credentials set to:");
        console.log("Email: ryadavy498@gmail.com");
        console.log("Password: admin@123");
    } else {
        console.log("No admin user found to reset! Run seed_admin.js first.");
    }
  } catch(e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}

resetPassword();
