// Only load .env in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
});

// Middleware - CORS must come first
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5001',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc) or same-origin requests
    if (!origin) return callback(null, true);
    
    // Allow Vercel preview and production domains
    if (origin.includes('vercel.app') || 
        allowedOrigins.some(allowed => origin.startsWith(allowed.replace('*', '')))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/user', require('./routes/user'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'College Attendance Management API is running', 
    status: 'ok',
    timestamp: new Date().toISOString(),
    ocrConfigured: !!process.env.OCR_API_KEY
  });
});

// 404 handler - must come after all routes
app.use((req, res, next) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/timetable',
      'POST /api/timetable',
      'POST /api/timetable/upload',
      'POST /api/timetable/upload-image',
      'GET /api/timetable/template'
    ]
  });
});

// Global error handling middleware - MUST return JSON
app.use((err, req, res, next) => {
  console.error('========================================');
  console.error('🔥 Global Error Handler Caught:');
  console.error('========================================');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('Request:', req.method, req.url);
  console.error('========================================');
  
  // Ensure we always return JSON, never HTML
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      details: err.toString()
    } : undefined
  });
});

// Only listen if not in serverless environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
