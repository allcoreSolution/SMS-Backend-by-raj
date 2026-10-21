const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://allcore2515:iosajay2000@allcoresolution.h6jogox.mongodb.net/school_erp?appName=allcoreSolution';
async function test() {
  await mongoose.connect(MONGO_URI);
  const u = await mongoose.connection.db.collection('users').findOne({ email: 'superadmin@erp.com' });
  console.log('User:', u);
  if(u) {
    const r = await mongoose.connection.db.collection('roles').findOne({ _id: u.role });
    console.log('Role:', r);
  }
  process.exit();
}
test();
