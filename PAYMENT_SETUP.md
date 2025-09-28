# PhonePe Payment Gateway Integration

## Overview
This matrimony application now includes complete PhonePe payment gateway integration for subscription management.

## Features Implemented

### Backend
- ✅ PhonePe SDK integration
- ✅ Payment order creation
- ✅ Payment verification
- ✅ Webhook handling for payment callbacks
- ✅ Subscription management
- ✅ Payment history tracking

### Frontend
- ✅ Subscription/pricing page
- ✅ Payment flow UI
- ✅ Payment success/failure handling
- ✅ Premium feature restrictions
- ✅ Payment history display

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/shaadi-clone

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# API Base URL
API_BASE_URL=http://localhost:5000

# PhonePe Configuration (Your Credentials)
PHONEPE_MERCHANT_ID=SU2509191910120899506220
PHONEPE_SALT_KEY=3cd9c463-9e15-4654-9485-6227d8b988af
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_REDIRECT_URL=http://localhost:3000/payment/callback
```

### 2. PhonePe Merchant Setup
1. Register at [PhonePe Developer Portal](https://developer.phonepe.com/)
2. Get your merchant credentials:
   - Merchant ID
   - Salt Key
   - Salt Index
3. Update the environment variables with your credentials

### 3. Install Dependencies
```bash
cd backend
npm install phonepe-pg-sdk crypto axios
```

### 4. Frontend Environment
Add to your frontend `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## API Endpoints

### Payment Routes (`/api/payments`)
- `POST /create-order` - Create PhonePe payment order
- `POST /callback` - Handle PhonePe payment callback
- `GET /verify/:transactionId` - Verify payment status
- `GET /history` - Get user payment history

### Subscription Routes (`/api/subscriptions`)
- `GET /plans` - Get available subscription plans
- `POST /create` - Create subscription (legacy)
- `GET /current` - Get current user subscription

## Payment Flow

1. **User selects subscription plan**
2. **Frontend calls `/api/payments/create-order`**
3. **Backend creates PhonePe payment request**
4. **User redirected to PhonePe payment page**
5. **PhonePe processes payment**
6. **PhonePe redirects to callback URL**
7. **Backend verifies payment and activates subscription**

## Subscription Plans

### Premium Plan
- **1 Month**: ₹1,599
- **3 Months**: ₹3,999
- **6 Months**: ₹7,999
- **12 Months**: ₹14,999

**Features:**
- 10 contacts per day
- 50 messages per day
- Profile view analytics
- Advanced search filters

### Premium Plus Plan
- **1 Month**: ₹2,999
- **3 Months**: ₹7,999
- **6 Months**: ₹14,999
- **12 Months**: ₹24,999

**Features:**
- 25 contacts per day
- 100 messages per day
- Profile view analytics
- Advanced search filters
- Priority customer support
- Profile highlighted in search

## Testing

### Test Cards (PhonePe Sandbox)
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test Scenarios
1. **Successful Payment**: Use success test card
2. **Failed Payment**: Use failure test card
3. **Payment Verification**: Check payment status
4. **Subscription Activation**: Verify user membership update

## Security Features

- ✅ JWT-based authentication
- ✅ Payment verification with PhonePe
- ✅ Secure callback handling
- ✅ Transaction ID validation
- ✅ User authorization checks

## Frontend Components

### New Pages
- `SubscriptionPage.tsx` - Subscription plans and payment
- `PaymentCallbackPage.tsx` - Payment success/failure handling

### New Services
- `paymentService.ts` - Payment API integration

### Updated Components
- `App.tsx` - Added new routes
- `Navbar.tsx` - Added subscription link

## Production Deployment

### Environment Variables (Production)
```env
PHONEPE_MERCHANT_ID=your_production_merchant_id
PHONEPE_SALT_KEY=your_production_salt_key
PHONEPE_SALT_INDEX=your_production_salt_index
PHONEPE_BASE_URL=https://api.phonepe.com/apis/pg-sandbox
PHONEPE_REDIRECT_URL=https://yourdomain.com/payment/callback
```

### SSL Certificate
- PhonePe requires HTTPS for production
- Ensure your domain has valid SSL certificate
- Update redirect URLs to use HTTPS

## Monitoring & Analytics

### Payment Tracking
- All payments are logged in the database
- Transaction IDs are stored for verification
- Payment status is tracked (Pending, Active, Cancelled)

### User Experience
- Real-time payment status updates
- Clear success/failure messaging
- Automatic subscription activation

## Troubleshooting

### Common Issues
1. **Payment Creation Failed**: Check PhonePe credentials
2. **Callback Not Working**: Verify redirect URL configuration
3. **Payment Verification Failed**: Check transaction ID format
4. **Subscription Not Activated**: Verify payment status

### Debug Steps
1. Check backend logs for errors
2. Verify PhonePe dashboard for transactions
3. Test with PhonePe test cards
4. Check network connectivity

## Support

For PhonePe integration support:
- [PhonePe Developer Documentation](https://developer.phonepe.com/docs)
- [PhonePe Support](https://support.phonepe.com/)

For application support:
- Check backend logs
- Verify environment variables
- Test with sandbox credentials
