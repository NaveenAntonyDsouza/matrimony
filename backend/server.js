const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL || 'https://test2.kudlamatrimony.com',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ]
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl) or if origin is allowed
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204,
  preflightContinue: false
};

// Middleware
app.use(cors(corsOptions));
// Global preflight handler to avoid path-to-regexp wildcard issues in Express 5
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.get('Origin');
    if (!origin || allowedOrigins.includes(origin)) {
      if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
      }
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      return res.sendStatus(204);
    }
    return res.sendStatus(403);
  }
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  if (req.path.includes('/api/payments')) {
    console.log(`📥 Payment Request: ${req.method} ${req.path}`);
    console.log('📥 Headers:', JSON.stringify(req.headers, null, 2));
    console.log('📥 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/interests', require('./routes/interests'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/search', require('./routes/search'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/upload', require('./routes/upload'));

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Matrimony Test API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API route not found' 
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', (process.env.MONGODB_URI || 'mongodb://localhost:27017/shaadi-clone').replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shaadi-clone', {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      connectTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds timeout
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 This usually means:');
      console.error('   - MongoDB Atlas cluster is paused or deleted');
      console.error('   - IP address is not whitelisted in MongoDB Atlas');
      console.error('   - Network connectivity issues');
      console.error('   - Invalid connection string or credentials');
    }
    
    console.error('🔄 Retrying connection in 5 seconds...');
    setTimeout(() => {
      connectDB();
    }, 5000);
  }
};

// Connect Database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});