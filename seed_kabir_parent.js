const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/school_erp');
  console.log('Connected to MongoDB');

  const Student = mongoose.model('Student', new mongoose.Schema({}, { strict: false }));
  const Parent = mongoose.model('Parent', new mongoose.Schema({}, { strict: false }));
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const AcademicClass = mongoose.model('AcademicClass', new mongoose.Schema({}, { strict: false }));
  const AcademicSection = mongoose.model('AcademicSection', new mongoose.Schema({}, { strict: false }));
  const Role = mongoose.model('Role', new mongoose.Schema({}, { strict: false }));

  // Get or create class & section
  let academicClass = await AcademicClass.findOne({ className: /Class IX|Class 9|IX/i });
  if (!academicClass) {
    academicClass = await AcademicClass.create({ className: 'Class IX', numericValue: 9 });
  }

  let academicSection = await AcademicSection.findOne({ sectionName: 'A' });
  if (!academicSection) {
    academicSection = await AcademicSection.create({ sectionName: 'A', classId: academicClass._id });
  }

  // Get or create roles
  let studentRole = await Role.findOne({ name: 'Student' });
  if (!studentRole) {
    studentRole = await Role.create({ name: 'Student', description: 'Student role', permissions: [] });
  }
  let parentRole = await Role.findOne({ name: 'Parent' });
  if (!parentRole) {
    parentRole = await Role.create({ name: 'Parent', description: 'Parent role', permissions: [] });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('secret_access_24', salt);

  // 1. Seed/Update Student: Kabir Singh (YIS-2024-101)
  let student = await Student.findOne({ admissionNo: 'YIS-2024-101' });
  const studentData = {
    admissionNo: 'YIS-2024-101',
    aparId: 'YIS-2024-101',
    rollNo: '12',
    firstName: 'Kabir',
    lastName: 'Singh',
    gender: 'Male',
    dateOfBirth: new Date('2011-08-14'),
    classId: academicClass._id,
    sectionId: academicSection._id,
    studentEmail: 'kabir.singh@gmail.com',
    studentPhone: '9876543210',
    fatherName: 'Vikram Singh',
    fatherPhone: '9876510108',
    motherName: 'Sunita Singh',
    motherPhone: '9876510109',
    bloodGroup: 'B+',
    status: 'Active',
    portalPassword: 'secret_access_24',
    parentPassword: 'secret_access_24',
    extraFields: {
      password: 'secret_access_24',
      className: 'Class IX',
      sectionName: 'A',
      currentAddress: '42, Green Park Enclave, New Delhi'
    }
  };

  if (!student) {
    student = await Student.create(studentData);
    console.log('Created Student Kabir Singh:', student._id);
  } else {
    await Student.updateOne({ _id: student._id }, { $set: studentData });
    console.log('Updated Student Kabir Singh:', student._id);
  }

  // 2. Seed/Update Parent: Vikram Singh (P-1920-KABIR)
  let parent = await Parent.findOne({ loginId: 'P-1920-KABIR' });
  const parentData = {
    name: 'Vikram Singh',
    relation: 'Father',
    phone: '9876510108',
    email: 'vikram.singh@gmail.com',
    occupation: 'Senior IT Consultant',
    address: '42, Green Park Enclave, New Delhi',
    loginId: 'P-1920-KABIR',
    password: 'secret_access_24',
    children: [student._id],
    status: 'Active'
  };

  if (!parent) {
    parent = await Parent.create(parentData);
    console.log('Created Parent Vikram Singh:', parent._id);
  } else {
    await Parent.updateOne({ _id: parent._id }, { $set: parentData });
    console.log('Updated Parent Vikram Singh:', parent._id);
  }

  // Link parentId to student
  await Student.updateOne({ _id: student._id }, { $set: { parentId: parent._id } });

  // 3. Ensure User records exist for both in users collection
  let studentUser = await User.findOne({ username: 'YIS-2024-101' });
  if (!studentUser) {
    studentUser = await User.create({
      username: 'YIS-2024-101',
      email: 'kabir.singh@gmail.com',
      password: hashedPassword,
      role: studentRole._id
    });
    console.log('Created User record for Student');
  } else {
    await User.updateOne({ _id: studentUser._id }, { $set: { password: hashedPassword, role: studentRole._id } });
  }

  let parentUser = await User.findOne({ username: 'P-1920-KABIR' });
  if (!parentUser) {
    parentUser = await User.create({
      username: 'P-1920-KABIR',
      email: 'vikram.singh@gmail.com',
      password: hashedPassword,
      role: parentRole._id
    });
    console.log('Created User record for Parent');
  } else {
    await User.updateOne({ _id: parentUser._id }, { $set: { password: hashedPassword, role: parentRole._id } });
  }

  console.log('✅ Seed completed successfully!');
  await mongoose.disconnect();
}

seed().catch(console.error);

