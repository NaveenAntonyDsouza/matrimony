const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

// Import models to ensure they're registered
const User = require('./models/User');
const Interest = require('./models/Interest');
const Message = require('./models/Message');
const Subscription = require('./models/Subscription');
const ProfileView = require('./models/ProfileView');

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Database: ${dbName}`);
    
    // List existing collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Existing collections:', collections.map(c => c.name));
    
    // Create collections if they don't exist
    const modelNames = ['users', 'interests', 'messages', 'subscriptions', 'profileviews'];
    
    for (const modelName of modelNames) {
      const collectionExists = collections.some(c => c.name === modelName);
      if (!collectionExists) {
        await mongoose.connection.db.createCollection(modelName);
        console.log(`✅ Created collection: ${modelName}`);
      } else {
        console.log(`ℹ️  Collection already exists: ${modelName}`);
      }
    }
    
    // Create indexes for better performance
    console.log('🔍 Creating database indexes...');
    
    try {
      // User indexes (skip email and phone as they're already unique in schema)
      await User.collection.createIndex({ 'location.state': 1, 'location.city': 1 }, { background: true });
      await User.collection.createIndex({ gender: 1, age: 1 }, { background: true });
      console.log('✅ User indexes created');
      
      // Interest indexes (skip the unique one as it's in schema)
      await Interest.collection.createIndex({ toUser: 1, createdAt: -1 }, { background: true });
      console.log('✅ Interest indexes created');
      
      // Message indexes
      await Message.collection.createIndex({ sender: 1, receiver: 1, createdAt: -1 }, { background: true });
      await Message.collection.createIndex({ receiver: 1, isRead: 1 }, { background: true });
      console.log('✅ Message indexes created');
      
      // ProfileView indexes (skip the unique one as it's in schema)
      await ProfileView.collection.createIndex({ viewedProfile: 1, viewedAt: -1 }, { background: true });
      console.log('✅ ProfileView indexes created');
    } catch (indexError) {
      console.log('⚠️ Some indexes may already exist:', indexError.message);
    }
    
    // Get database stats
    const stats = await mongoose.connection.db.stats();
    console.log('📈 Database Statistics:');
    console.log(`   - Collections: ${stats.collections}`);
    console.log(`   - Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`   - Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB`);
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run setup
setupDatabase();