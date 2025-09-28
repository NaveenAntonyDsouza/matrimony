const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

// Import models
const User = require('./models/User');
const Interest = require('./models/Interest');
const Message = require('./models/Message');

async function cleanupTestData() {
  try {
    console.log('🧹 Starting test data cleanup...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Remove test user and related data
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (testUser) {
      // Remove interests related to test user
      await Interest.deleteMany({
        $or: [
          { fromUser: testUser._id },
          { toUser: testUser._id }
        ]
      });
      
      // Remove messages related to test user
      await Message.deleteMany({
        $or: [
          { sender: testUser._id },
          { receiver: testUser._id }
        ]
      });
      
      // Remove test user
      await User.deleteOne({ email: 'test@example.com' });
      
      console.log('✅ Test data cleaned up successfully');
    } else {
      console.log('ℹ️ No test data found to clean up');
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the cleanup
cleanupTestData();