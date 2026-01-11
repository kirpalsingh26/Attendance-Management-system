const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('⚠️  Server will continue running but database features will not work.');
    console.error('💡 Fix: Add your IP to MongoDB Atlas whitelist or use local MongoDB');
    // Don't exit - let server run without DB connection
  }
};

module.exports = connectDB;
