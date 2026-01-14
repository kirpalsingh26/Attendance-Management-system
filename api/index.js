// Vercel serverless function handler
// Import the Express app
const app = require('../Backend/index.js');

// Export handler for Vercel
module.exports = (req, res) => {
  // Log for debugging
  console.log('API request received:', req.method, req.url);
  
  // Handle the request with Express
  return app(req, res);
};
