# Hostinger Deployment Guide for Matrimony App

## Overview
This guide will help you deploy your matrimony application using Hostinger's shared hosting for the frontend and external services for the backend.

## Architecture
- **Frontend**: React app hosted on Hostinger shared hosting (static files)
- **Backend**: Node.js/Express API hosted on Railway/Render/Vercel
- **Database**: MongoDB Atlas (cloud database)

## Step 1: Prepare Backend for External Hosting

### 1.1 Choose a Backend Hosting Service
We recommend **Railway** for its simplicity and Node.js support:
- Sign up at [railway.app](https://railway.app)
- Connect your GitHub account
- Create a new project from your repository

### 1.2 Set Up MongoDB Atlas
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Railway access
5. Get your connection string

### 1.3 Configure Backend Environment Variables
In your Railway dashboard, add these environment variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/matrimony?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-here
FRONTEND_URL=https://yourdomain.com
PHONEPE_MERCHANT_ID=your-phonepe-merchant-id
PHONEPE_SALT_KEY=your-phonepe-salt-key
PHONEPE_SALT_INDEX=your-phonepe-salt-index
PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
PORT=5000
```

### 1.4 Deploy Backend
1. Push your code to GitHub
2. Connect Railway to your repository
3. Railway will automatically deploy your backend
4. Note your Railway app URL (e.g., `https://your-app.railway.app`)

## Step 2: Prepare Frontend for Hostinger

### 2.1 Update Production Environment
Edit `.env.production` file:
```
REACT_APP_API_URL=https://your-app.railway.app/api
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
```

### 2.2 Build Production Version
```bash
npm run build
```

This creates a `build` folder with optimized static files.

## Step 3: Deploy Frontend to Hostinger

### 3.1 Access Hostinger File Manager
1. Log into your Hostinger control panel
2. Go to "File Manager"
3. Navigate to `public_html` folder

### 3.2 Upload Files
1. Delete any existing files in `public_html`
2. Upload all contents from your `build` folder to `public_html`
3. Ensure `index.html` is in the root of `public_html`

### 3.3 Configure URL Rewriting (Important for React Router)
Create a `.htaccess` file in `public_html` with this content:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QR,L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

## Step 4: Domain Configuration

### 4.1 Custom Domain (Optional)
If you have a custom domain:
1. Point your domain to Hostinger's nameservers
2. Update `FRONTEND_URL` in your backend environment variables
3. Update CORS settings to include your domain

### 4.2 SSL Certificate
Hostinger provides free SSL certificates:
1. Go to SSL section in control panel
2. Enable SSL for your domain
3. Force HTTPS redirects

## Step 5: Testing and Troubleshooting

### 5.1 Test Your Deployment
1. Visit your Hostinger domain
2. Test user registration/login
3. Test payment functionality
4. Check browser console for errors

### 5.2 Common Issues and Solutions

**CORS Errors:**
- Ensure backend `FRONTEND_URL` matches your Hostinger domain
- Check that CORS is properly configured in `server.js`

**API Connection Issues:**
- Verify `REACT_APP_API_URL` in `.env.production`
- Ensure backend is running on Railway
- Check Railway logs for errors

**Routing Issues:**
- Ensure `.htaccess` file is properly configured
- Check that all React Router routes work

**Payment Issues:**
- Verify PhonePe credentials in backend environment
- Test payment flow in production environment

## Step 6: Maintenance and Updates

### 6.1 Frontend Updates
1. Make changes to your React app
2. Run `npm run build`
3. Upload new build files to Hostinger

### 6.2 Backend Updates
1. Push changes to GitHub
2. Railway will automatically redeploy
3. Monitor Railway logs for any issues

## Cost Breakdown
- **Hostinger Shared Hosting**: $1-3/month (you already have this)
- **Railway Backend**: $0-5/month (free tier available)
- **MongoDB Atlas**: $0/month (free tier: 512MB)
- **Total**: $1-8/month

## Security Considerations
1. Use strong JWT secrets
2. Keep PhonePe credentials secure
3. Regularly update dependencies
4. Monitor for security vulnerabilities
5. Use HTTPS everywhere

## Support
If you encounter issues:
1. Check Railway logs for backend errors
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Test API endpoints directly using tools like Postman

Your matrimony application should now be successfully deployed and accessible via your Hostinger domain!