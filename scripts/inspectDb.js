const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/school_erp');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Total collections:', collections.length);
    for (const c of collections.sort((a,b) => a.name.localeCompare(b.name))) {
      const count = await mongoose.connection.db.collection(c.name).countDocuments();
      if (count > 0) {
        console.log(`${c.name}: ${count}`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
