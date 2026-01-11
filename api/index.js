// Vercel serverless function handler
const connectDB = require('../Backend/config/database');

// Initialize the app
const app = require('../Backend/index.js');

// Export handler that ensures DB connection before processing requests
module.exports = async (req, res) => {
  try {
    // Ensure database is connected
    await connectDB();
    
    // Process the request with Express
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
