const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enhanced CORS configuration
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://0.0.0.0:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB Atlas Connection
const connectDB = async () => {
  try {
    console.log('🔗 Attempting to connect to MongoDB Atlas...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully');
    
    const College = require('./models/College');
    const collegeCount = await College.countDocuments();
    console.log(`📊 Found ${collegeCount} colleges in database`);
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// API Root endpoint - ADD THIS
app.get('/api', (req, res) => {
  res.json({
    message: 'College Analytics API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      colleges: '/api/colleges',
      statistics: '/api/colleges/statistics',
      collegesByType: '/api/colleges/type/:type'
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/colleges', require('./routes/colleges'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    const College = require('./models/College');
    const collegeCount = await College.countDocuments();
    
    res.json({ 
      status: 'OK', 
      message: 'College Analytics API is running',
      database: dbStatus,
      collegeCount: collegeCount,
      timestamp: new Date().toISOString(),
      port: PORT
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'College Analytics API Server',
    endpoints: {
      api: '/api',
      health: '/api/health',
      test: '/api/test',
      colleges: '/api/colleges',
      statistics: '/api/colleges/statistics'
    }
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      root: '/',
      api: '/api',
      health: '/api/health',
      colleges: '/api/colleges',
      statistics: '/api/colleges/statistics'
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Global error handler:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});