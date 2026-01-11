// Vercel serverless function that wraps the Express backend
const app = require('../Backend/index.js');
const connectDB = require('../Backend/config/database');

// Ensure DB connection for serverless
connectDB().catch(err => {
  console.error('API function - Failed to connect to MongoDB:', err.message);
});

module.exports = app;
