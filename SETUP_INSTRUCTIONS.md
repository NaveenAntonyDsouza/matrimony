# 🚀 Complete Setup Instructions for PhonePe Payment Gateway

## Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- MongoDB (local or cloud)

## Step 1: Install Node.js (if not installed)
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version for Windows
3. Run the installer
4. Restart your terminal/command prompt

## Step 2: Install Dependencies
Open Command Prompt (cmd) or PowerShell and run:

```bash
# Navigate to backend directory
cd F:\applications\cursor\matrimony1\backend

# Install all dependencies (including PhonePe SDK)
npm install

# Or install specific PhonePe dependencies
npm install phonepe-pg-sdk crypto axios
```

## Step 3: Configure Environment Variables
Create or update your `.env` file in the `backend` directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/shaadi-clone

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# API Base URL
API_BASE_URL=http://localhost:5000

# PhonePe Payment Gateway Configuration
PHONEPE_MERCHANT_ID=SU2509191910120899506220
PHONEPE_SALT_KEY=3cd9c463-9e15-4654-9485-6227d8b988af
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_REDIRECT_URL=http://localhost:3000/payment/callback

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Step 4: Start the Backend Server
```bash
cd backend
npm run dev
```

## Step 5: Start the Frontend
Open a new terminal and run:
```bash
npm start
```

## Step 6: Test the Payment Integration

### Test the Backend API
```bash
cd backend
node test-payment.js
```

### Test the Frontend
1. Navigate to `http://localhost:3000`
2. Register/Login to your account
3. Go to `http://localhost:3000/subscription`
4. Select a subscription plan
5. Click "Choose Plan"
6. You'll be redirected to PhonePe payment page

### Test Cards (PhonePe Sandbox)
- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Troubleshooting

### If Node.js is not found:
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Restart your terminal
3. Try using Command Prompt instead of PowerShell

### If npm install fails:
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` folder and `package-lock.json`
3. Run `npm install` again

### If MongoDB connection fails:
1. Make sure MongoDB is running
2. Check your MONGODB_URI in .env file
3. Try using MongoDB Atlas (cloud) instead of local

## API Endpoints

### Payment Endpoints
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/callback` - Handle payment callback
- `GET /api/payments/verify/:transactionId` - Verify payment
- `GET /api/payments/history` - Get payment history

### Subscription Endpoints
- `GET /api/subscriptions/plans` - Get subscription plans
- `GET /api/subscriptions/current` - Get current subscription

## Frontend Routes
- `/subscription` - Subscription plans page
- `/payment/callback` - Payment success/failure page

## Security Features
- ✅ JWT Authentication
- ✅ PhonePe Signature Verification
- ✅ Secure Payment Processing
- ✅ PCI DSS Compliance

## Production Deployment
1. Update environment variables for production
2. Use production PhonePe credentials
3. Set up HTTPS for callback URLs
4. Configure proper CORS settings

## Support
- PhonePe Documentation: https://developer.phonepe.com/
- Payment Gateway Docs: https://developer.phonepe.com/payment-gateway

