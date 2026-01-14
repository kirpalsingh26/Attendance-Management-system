// Vercel serverless function handler
try {
  // Test if we can load dependencies
  const express = require('express');
  const app = require('../Backend/index.js');
  
  // Export handler
  module.exports = (req, res) => {
    try {
      console.log('Request:', req.method, req.url);
      return app(req, res);
    } catch (error) {
      console.error('Handler error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  };
} catch (error) {
  console.error('Module load error:', error);
  module.exports = (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Failed to load server modules',
      error: error.message,
      stack: error.stack
    });
  };
}
