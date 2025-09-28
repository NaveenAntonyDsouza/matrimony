# 🗄️ Database Setup Guide for Matrimony Test

## Current Status
❌ **MongoDB is not installed on your system**

You have two options to set up the database:

## Option 1: MongoDB Atlas (Cloud Database) - **RECOMMENDED**

### Why MongoDB Atlas?
- ✅ No local installation required
- ✅ Free tier available (512MB storage)
- ✅ Automatic backups and scaling
- ✅ Works immediately

### Setup Steps:

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Choose "Build a Database" → "Free" tier
   - Select a cloud provider and region
   - Create cluster (takes 1-3 minutes)

3. **Create Database User**
   - Go to "Database Access"
   - Add new database user
   - Choose "Password" authentication
   - Save username and password

4. **Configure Network Access**
   - Go to "Network Access"
   - Add IP Address → "Allow access from anywhere" (0.0.0.0/0)
   - Or add your current IP for security

5. **Get Connection String**
   - Go to "Databases" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string

6. **Update .env File**
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/matrimony-test?retryWrites=true&w=majority
   ```

## Option 2: Local MongoDB Installation

### For Windows:

1. **Download MongoDB Community Server**
   ```
   https://www.mongodb.com/try/download/community
   ```

2. **Install MongoDB**
   - Run the installer
   - Choose "Complete" installation
   - Install as Windows Service
   - Install MongoDB Compass (GUI tool)

3. **Verify Installation**
   ```powershell
   mongod --version
   mongo --version
   ```

4. **Start MongoDB Service**
   ```powershell
   net start MongoDB
   ```

### For macOS:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### For Linux (Ubuntu):
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Database Setup Commands

After MongoDB is installed/configured:

1. **Install Dependencies** (if not already done)
   ```bash
   cd backend
   npm install
   ```

2. **Setup Database**
   ```bash
   # From project root
   node setup-database.js
   ```

3. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

## Database Structure

Your Matrimony Test application will create these collections:

- **users** - User profiles and authentication
- **interests** - User interactions and expressions of interest
- **messages** - Communication between users
- **subscriptions** - Premium membership data
- **profileviews** - Profile visit analytics

## Environment Variables

Make sure your `backend/.env` file contains:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/matrimony-test
# OR for Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/matrimony-test

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Ensure MongoDB service is running
   - Check if port 27017 is available

2. **Authentication Failed**
   - Verify username/password in connection string
   - Check database user permissions

3. **Network Timeout**
   - Check network access settings in Atlas
   - Verify firewall settings

### Useful Commands:

```bash
# Check MongoDB status (Windows)
net start | findstr MongoDB

# Check MongoDB status (Linux/Mac)
sudo systemctl status mongod

# Connect to MongoDB shell
mongo mongodb://localhost:27017/matrimony-test

# View database collections
show collections

# View collection data
db.users.find().limit(5)
```

## Next Steps

1. Choose your preferred option (Atlas recommended)
2. Follow the setup steps
3. Run `node setup-database.js` to initialize
4. Start your backend server
5. Your database will be ready! 🎉

## Need Help?

If you encounter any issues:
1. Check the error messages carefully
2. Verify your connection string
3. Ensure MongoDB service is running
4. Check network connectivity (for Atlas)

Happy coding! 🚀