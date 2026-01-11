// Vercel serverless function handler
require('dotenv').config({ path: '../Backend/.env' });
const connectDB = require('../Backend/config/database');

// Initialize database connection
connectDB();

// Load Express app
const app = require('../Backend/index.js');

// Export the Express app as serverless handler
module.exports = app;
