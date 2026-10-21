require('dotenv').config();
const mongoose = require('mongoose');

// Define schema directly to avoid requiring all models
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB.");

    const users = await User.find({});
    users.forEach(u => {
      console.log(`Email: ${u.email}, Username: ${u.username}`);
    });

  } catch(e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}

checkUsers();
