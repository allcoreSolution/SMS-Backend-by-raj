require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  console.log("URI:", process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully");
  } catch(e) {
    console.error("Connect failed:", e);
  }
  process.exit();
}
test();
