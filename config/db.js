
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGO_URI_ATLAS ||
    process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MongoDB URI is missing in environment variables');
  }

  if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
    throw new Error(
      'Local MongoDB URI detected. Please configure MongoDB Atlas URI on Render.'
    );
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });

    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;
