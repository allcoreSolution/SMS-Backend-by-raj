const mongoose = require('mongoose');

async function inspectDb() {
  await mongoose.connect('mongodb://127.0.0.1:27017/school_erp');
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log(`--- TOTAL COLLECTIONS: ${collections.length} ---`);

  const results = [];
  for (const colInfo of collections) {
    const colName = colInfo.name;
    const count = await db.collection(colName).countDocuments();
    if (count > 0) {
      results.push({ collection: colName, count });
    }
  }

  console.log('--- NON-EMPTY COLLECTIONS ---');
  results.sort((a, b) => b.count - a.count);
  results.forEach(r => console.log(`${r.collection}: ${r.count}`));
  
  await mongoose.disconnect();
}

inspectDb().catch(console.error);
