require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({ password: String }, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function testPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const u = await User.findOne({ username: 'admin' }).select('+password');
    if (!u) {
      console.log('User not found');
      return;
    }
    const match1 = await bcrypt.compare('admin123', u.password);
    const match2 = await bcrypt.compare('password123', u.password);
    console.log(`admin123: ${match1}`);
    console.log(`password123: ${match2}`);

  } catch(e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}

testPassword();
