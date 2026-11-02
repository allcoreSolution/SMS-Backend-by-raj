const mongoose = require('mongoose');

async function inspectStudent() {
  await mongoose.connect('mongodb://127.0.0.1:27017/school_erp');
  const student = await mongoose.connection.db.collection('students').findOne();
  console.log('Student record in DB:');
  console.log(JSON.stringify(student, null, 2));

  const classes = await mongoose.connection.db.collection('academicclasses').find().toArray();
  console.log('\nAcademic Classes:', classes.map(c => ({ id: c._id, name: c.className })));

  const sections = await mongoose.connection.db.collection('academicsections').find().toArray();
  console.log('\nAcademic Sections:', sections.map(s => ({ id: s._id, name: s.sectionName })));

  await mongoose.disconnect();
}

inspectStudent().catch(console.error);

