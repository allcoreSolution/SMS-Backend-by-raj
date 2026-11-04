const mongoose = require('mongoose');

const connectDB = async () => {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGO_URI_ATLAS ||
    process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MongoDB URI is missing in environment variables');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });

    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    // If Atlas fails and we have a local MongoDB running, try connecting locally
    const localUri = process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/school_erp';
    if (localUri && uri !== localUri) {
      try {
        console.log(`Attempting fallback to local MongoDB: ${localUri}...`);
        const localConn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 3000
        });
        console.log(`Fallback connected to local MongoDB: ${localConn.connection.host}`);
        return localConn;
      } catch (localErr) {
        console.error(`Fallback to local MongoDB also failed: ${localErr.message}`);
      }
    }
    throw error;
  }
};

module.exports = connectDB;
