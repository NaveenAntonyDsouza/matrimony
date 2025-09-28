@echo off
echo 🚀 Starting PhonePe Payment Gateway Setup...
echo.

echo 📦 Installing dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.

echo 🔍 Verifying setup...
call node verify-setup.js
if %errorlevel% neq 0 (
    echo ❌ Setup verification failed
    pause
    exit /b 1
)

echo.
echo 🎉 Setup complete! 
echo.
echo 📋 Next Steps:
echo 1. Make sure your .env file has PhonePe configuration
echo 2. Start backend: cd backend && npm run dev
echo 3. Start frontend: npm start
echo 4. Test payment: http://localhost:3000/subscription
echo.
echo 🧪 Test Cards:
echo    Success: 4111 1111 1111 1111
echo    Failure: 4000 0000 0000 0002
echo    CVV: Any 3 digits
echo    Expiry: Any future date
echo.
pause

