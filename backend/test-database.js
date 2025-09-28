const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

// Import models
const User = require('./models/User');
const Interest = require('./models/Interest');
const Message = require('./models/Message');

async function testDatabaseOperations() {
  try {
    console.log('🧪 Starting database operations test...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Create a test user
    console.log('\n📝 Test 1: Creating a test user...');
    const testUser = new User({
      email: 'test@example.com',
      password: 'testpassword123',
      phone: '+1234567890',
      profileCreatedFor: 'Self',
      firstName: 'Test',
      lastName: 'User',
      gender: 'Male',
      dateOfBirth: new Date('1990-01-01'),
      maritalStatus: 'Never Married',
      motherTongue: 'English',
      religion: 'Hindu',
      caste: 'General',
      height: '5\'9"',
      weight: '70 kg',
      country: 'India',
      state: 'Maharashtra',
      city: 'Mumbai',
      education: 'Bachelor\'s Degree',
      occupation: 'Software Engineer',
      annualIncome: 'Rs. 7.5 - 10 Lakh'
    });
    
    const savedUser = await testUser.save();
    console.log(`✅ User created with ID: ${savedUser._id}`);
    
    // Test 2: Find the user
    console.log('\n🔍 Test 2: Finding the test user...');
    const foundUser = await User.findOne({ email: 'test@example.com' });
    console.log(`✅ User found: ${foundUser.firstName} ${foundUser.lastName}`);
    
    // Test 3: Update user
    console.log('\n✏️ Test 3: Updating user...');
    await User.updateOne(
      { _id: savedUser._id },
      { aboutMe: 'This is a test user profile for database testing.' }
    );
    console.log('✅ User updated successfully');
    
    // Test 4: Create an interest
    console.log('\n💝 Test 4: Creating an interest...');
    const testInterest = new Interest({
      fromUser: savedUser._id,
      toUser: savedUser._id, // Self-interest for testing
      interestType: 'Express Interest',
      message: 'Test interest message',
      status: 'Sent'
    });
    
    const savedInterest = await testInterest.save();
    console.log(`✅ Interest created with ID: ${savedInterest._id}`);
    
    // Test 5: Create a message
    console.log('\n💬 Test 5: Creating a message...');
    const testMessage = new Message({
      sender: savedUser._id,
      receiver: savedUser._id, // Self-message for testing
      content: 'Hello! This is a test message.',
      messageType: 'text',
      isRead: false
    });
    
    const savedMessage = await testMessage.save();
    console.log(`✅ Message created with ID: ${savedMessage._id}`);
    
    // Test 6: Query operations
    console.log('\n📊 Test 6: Running query operations...');
    const userCount = await User.countDocuments();
    const interestCount = await Interest.countDocuments();
    const messageCount = await Message.countDocuments();
    
    console.log(`📈 Database Statistics:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Interests: ${interestCount}`);
    console.log(`   - Messages: ${messageCount}`);
    
    // Cleanup: Remove test data
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ email: 'test@example.com' });
    await Interest.deleteOne({ _id: savedInterest._id });
    await Message.deleteOne({ _id: savedMessage._id });
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All database operations completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testDatabaseOperations();