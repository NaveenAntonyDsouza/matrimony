# Matrimony Test - Complete Matrimonial Platform

A full-stack matrimonial web application built with React.js, Node.js, Express, and MongoDB. This is a comprehensive matrimonial platform with all major features including user registration, profile management, advanced search, messaging, and premium memberships.

## 🚀 Features

### ✅ Authentication & User Management
- User registration with multi-step form
- Secure login/logout functionality
- JWT-based authentication
- Password encryption with bcrypt
- Profile creation for self or family members

### ✅ Profile Management
- Comprehensive profile creation form
- Personal, family, and career information
- Photo upload and management
- Profile verification system
- Privacy settings and visibility controls

### ✅ Advanced Search & Matching
- Multi-criteria search filters
- Age, religion, education, location filters
- Advanced search with slider controls
- Profile viewing and tracking
- Match recommendations

### ✅ Communication Features
- Interest expression system
- Real-time messaging interface
- Conversation management
- Message status tracking
- Photo and contact sharing

### ✅ Premium Features
- Multiple subscription plans
- Premium vs Free member benefits
- Payment integration ready
- Enhanced search capabilities
- Priority support features

### ✅ Modern UI/UX
- Material-UI design system
- Fully responsive design
- Mobile-first approach
- Smooth animations and transitions
- Professional color scheme

## 🛠️ Technology Stack

### Frontend
- **React.js 18** - Frontend framework
- **TypeScript** - Type safety
- **Material-UI (MUI)** - UI component library
- **React Router** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Express Validator** - Input validation

## 📁 Project Structure

```
shaadi-clone/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main page components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API service functions
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── public/
├── backend/
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API route handlers
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Backend utilities
│   └── uploads/            # File upload directory
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/matrimony-test.git
   cd matrimony-test
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/matrimony-test
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
   JWT_EXPIRE=7d
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # File Upload Configuration
   UPLOAD_PATH=./uploads
   MAX_FILE_UPLOAD=1000000
   
   # Payment Gateway (Optional)
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   
   # Frontend URL
   CLIENT_URL=http://localhost:3000
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb/brew/mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # Or use MongoDB Atlas (cloud)
   ```

6. **Run the application**
   
   Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
   
   Start the frontend server (in a new terminal):
   ```bash
   cd matrimony-test
   npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 Key Pages & Features

### Homepage
- Hero section with quick search
- Statistics showcase
- Feature highlights
- Success stories
- Call-to-action sections

### Authentication
- **Login Page**: Secure user login
- **Registration Page**: Multi-step registration form
- **Password Reset**: Forgot password functionality

### User Dashboard
- **Profile Page**: Complete profile management
- **Search Page**: Advanced filtering and matching
- **Messages Page**: Real-time messaging interface
- **Interests**: Manage sent/received interests

### Premium Features
- Subscription plans
- Payment integration
- Enhanced search capabilities
- Priority support

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Password reset

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Search & Profiles
- `POST /api/search` - Search profiles
- `GET /api/profiles/:id` - Get profile by ID

### Communication
- `POST /api/interests` - Express interest
- `GET /api/interests/received` - Get received interests
- `GET /api/interests/sent` - Get sent interests
- `PUT /api/interests/:id/respond` - Respond to interest

### Messaging
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:userId` - Get messages with user

### Subscriptions
- `GET /api/subscriptions/plans` - Get subscription plans
- `POST /api/subscriptions/create` - Create subscription
- `GET /api/subscriptions/current` - Get current subscription

### File Upload
- `POST /api/upload/photo` - Upload photo
- `DELETE /api/upload/photo/:photoId` - Delete photo

## 🎨 Design Features

### Color Scheme
- Primary: #F3426A (Brand Pink)
- Secondary: #2196F3 (Blue)
- Background: #FAFAFA (Light Gray)

### Typography
- Font Family: Roboto
- Consistent heading hierarchy
- Readable body text

### Components
- Material Design principles
- Consistent spacing and layout
- Hover effects and animations
- Mobile-responsive breakpoints

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- File upload restrictions
- CORS configuration
- Environment variable protection

## 📊 Database Schema

### User Model
Comprehensive user profile with:
- Basic information (name, email, phone)
- Personal details (age, height, religion)
- Location information
- Education and career
- Family information
- Lifestyle preferences
- Partner preferences
- Photos and verification

### Interest Model
- Interest tracking between users
- Different interest types
- Status management

### Message Model
- Real-time messaging
- Read receipts
- Message types (text, photo, contact)

### Subscription Model
- Premium membership management
- Payment tracking
- Feature access control

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy the build folder to your hosting service
```

### Backend Deployment
```bash
# Set production environment variables
NODE_ENV=production
# Deploy to your server (Heroku, DigitalOcean, AWS, etc.)
```

### Database
- MongoDB Atlas for cloud deployment
- Or self-hosted MongoDB instance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is for educational purposes and testing.

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- MongoDB team for the robust database solution
- React and Node.js communities

## 📞 Support

For support and questions:
- Create an issue in the repository
- Email: support@example.com

---

**Note**: This is a test matrimonial platform created for educational purposes. It includes all major features of a matrimonial platform and demonstrates modern web development practices with React, Node.js, and MongoDB.