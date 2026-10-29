const mongoose = require('mongoose');

async function cleanAllDummyData() {
  await mongoose.connect('mongodb://127.0.0.1:27017/school_erp');
  const db = mongoose.connection.db;

  const collectionsToClear = [
    'bankaccounts', 'feetypes', 'feegroups', 'feediscounts', 'classteachers',
    'routes', 'vehicles', 'drivers', 'surveys', 'feedbacks',
    'compliancedocuments', 'compliancechecklists', 'compliancecalendarevents',
    'cctvaccesslogs', 'cameras', 'galleryalbums', 'academicsubjects',
    'academicsections', 'academicclasses', 'academicsessions', 'osmsessions',
    'expenseheads', 'incomeheads', 'assetcategories', 'assets',
    'moderationreports', 'moderatedconversations', 'deviceregistries',
    'roomtypes', 'hostels', 'hostelrooms', 'studenthouses', 'studentcategories',
    'complaints', 'cocurricularareas', 'cbcstrands', 'cbcassessments',
    'festivalgreetings', 'contacts', 'birthdaylogs', 'campusworkers',
    'examtypes', 'examgrades', 'hpcactivities', 'hpcprogresscards',
    'parents', 'staffhealthrecords', 'kbarticles', 'kbcategories',
    'staffattendances', 'staffs', 'salarytemplates', 'supporttickets',
    'books', 'bookcategories', 'bookissues', 'bookrequests', 'notices',
    'coachingprograms', 'liveclasses', 'notifications', 'leads',
    'homeworks', 'studyresources', 'syllabusunits', 'classworklogs',
    'homeworkassignments', 'broadcasts', 'events', 'appregistries',
    'appraisalcriterions', 'appraisalcycles', 'boardingregisters',
    'students', 'transactions', 'feepayments', 'invoices', 'admissions', 'feeinvoices',
    'subscriptioninvoices', 'emailmessages', 'onlineexamresults', 'complianceprofiles'
  ];

  console.log('--- PURGING DUMMY COLLECTIONS ---');
  for (const name of collectionsToClear) {
    try {
      const col = db.collection(name);
      const count = await col.countDocuments();
      if (count > 0) {
        const res = await col.deleteMany({});
        console.log('✓ Cleared ' + name + ': ' + res.deletedCount + ' documents');
      }
    } catch (err) {
      // collection might not exist, ignore
    }
  }

  // Clean fake users, keep ryadavy498@gmail.com and hari@gmail.com
  const usersCol = db.collection('users');
  const fakeUsersDeleted = await usersCol.deleteMany({
    email: { $nin: ['ryadavy498@gmail.com', 'hari@gmail.com'] }
  });
  console.log('✓ Cleared dummy users: ' + fakeUsersDeleted.deletedCount);

  console.log('\n--- VERIFYING REMAINING COLLECTIONS ---');
  const allCols = await db.listCollections().toArray();
  for (let c of allCols) {
    const count = await db.collection(c.name).countDocuments();
    if (count > 0) {
      console.log('Remaining: ' + c.name + ' = ' + count);
    }
  }

  await mongoose.disconnect();
}

cleanAllDummyData().catch(console.error);
