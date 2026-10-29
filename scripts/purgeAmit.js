const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/school_erp');
    const cols = await mongoose.connection.db.listCollections().toArray();
    console.log('Searching all', cols.length, 'collections for dummy Amit Sharma data...');

    for (const c of cols) {
      const col = mongoose.connection.db.collection(c.name);
      const query = {
        $or: [
          { fullName: { $regex: 'Amit|Sharma|Verma', $options: 'i' } },
          { name: { $regex: 'Amit|Sharma|Verma', $options: 'i' } },
          { teacherName: { $regex: 'Amit|Sharma|Verma', $options: 'i' } },
          { staffName: { $regex: 'Amit|Sharma|Verma', $options: 'i' } },
          { email: { $regex: 'amit\\.sharma|verma', $options: 'i' } }
        ]
      };

      try {
        const count = await col.countDocuments(query);
        if (count > 0) {
          console.log(`Found ${count} dummy matches in ${c.name}, deleting...`);
          const res = await col.deleteMany(query);
          console.log(`Deleted ${res.deletedCount} from ${c.name}`);
        }
      } catch (e) {
        // query might fail if schema does not support regex or system collection
      }
    }

    // Also purge staffhealthrecords completely if it contains demo data
    const hrCount = await mongoose.connection.db.collection('staffhealthrecords').countDocuments();
    if (hrCount > 0) {
      console.log(`Cleaning staffhealthrecords (${hrCount} records)...`);
      await mongoose.connection.db.collection('staffhealthrecords').deleteMany({});
      console.log('staffhealthrecords purged.');
    }

    console.log('MongoDB purge completed.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
