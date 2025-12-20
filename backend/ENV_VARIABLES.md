# Environment Variables Reference

Copy this file to `.env` in the backend directory and fill in your actual values.

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Database
MONGODB_URI=mongodb://localhost:27017/hamarasamachar
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hamarasamachar?retryWrites=true&w=majority

# JWT Secrets (IMPORTANT: Use strong random strings in production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
ADMIN_JWT_SECRET=your_super_secret_admin_jwt_key_change_this_in_production
ADMIN_JWT_EXPIRE=24h

# Cloudinary Configuration (for image/file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OTP Configuration
OTP_EXPIRE_MINUTES=10

# SMS Hub India Configuration (Optional - for OTP via SMS)
SMSINDIAHUB_API_KEY=your_sms_hub_india_api_key
SMSINDIAHUB_SENDER_ID=your_sender_id

# Email Configuration (Optional - for password reset emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password  # Use App Password for Gmail

# Razorpay Payment Gateway (Optional - for subscription payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,gif,webp
ALLOWED_PDF_TYPES=pdf
```

## Required Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (production/development)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for user JWT tokens
- `ADMIN_JWT_SECRET` - Secret for admin JWT tokens
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## Optional Variables
- `SMSINDIAHUB_API_KEY` & `SMSINDIAHUB_SENDER_ID` - For SMS OTP (Required for production)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` - For email functionality
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` - For payment processing

## Security Notes
1. Never commit `.env` file to Git
2. Use strong, random strings for JWT secrets
3. Use App Passwords for Gmail (not your regular password)
4. Keep all secrets secure and rotate them periodically

