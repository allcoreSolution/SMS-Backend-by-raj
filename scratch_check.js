const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/school_erp');
  
  const students = await mongoose.connection.db.collection('students').find({}, { projection: { admissionNo: 1, firstName: 1, lastName: 1, studentEmail: 1, password: 1 } }).limit(10).toArray();
  console.log('\nStudents count:', students.length);
  console.log(students);

  const parents = await mongoose.connection.db.collection('parents').find({}, { projection: { loginId: 1, name: 1, phone: 1, email: 1 } }).limit(10).toArray();
  console.log('\nParents count:', parents.length);
  console.log(parents);

  const users = await mongoose.connection.db.collection('users').find({}).limit(10).toArray();
  console.log('\nUsers count:', users.length);
  console.log(users.map(u => ({ username: u.username, email: u.email, role: u.role })));

  await mongoose.disconnect();
}

check().catch(console.error);

