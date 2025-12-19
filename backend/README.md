# Hamara Samachar Backend API

Backend API for Hamara Samachar news application built with Node.js, Express, and MongoDB.

## Features

- Admin authentication and authorization
- User authentication with OTP
- News management (CRUD operations)
- Category management
- Banner management
- Comment moderation
- Feedback management
- Rating system
- E-paper management
- Bookmark functionality
- Cloudinary integration for file uploads
- MongoDB database

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/hamarasamachar

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
ADMIN_JWT_SECRET=your_super_secret_admin_jwt_key
ADMIN_JWT_EXPIRE=24h

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

OTP_EXPIRE_MINUTES=10

MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,gif,webp
ALLOWED_PDF_TYPES=pdf
```

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Admin Routes

#### Authentication
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/me` - Get current admin
- `PUT /api/admin/auth/profile` - Update admin profile
- `PUT /api/admin/auth/change-password` - Change password

#### Users
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `PATCH /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user
- `PATCH /api/admin/users/bulk-status` - Bulk update user status
- `DELETE /api/admin/users/bulk-delete` - Bulk delete users
- `GET /api/admin/users/stats` - Get user statistics

#### News
- `GET /api/admin/news` - Get all news
- `GET /api/admin/news/:id` - Get news by ID
- `POST /api/admin/news` - Create news (with image upload)
- `PUT /api/admin/news/:id` - Update news (with image upload)
- `DELETE /api/admin/news/:id` - Delete news
- `DELETE /api/admin/news/bulk-delete` - Bulk delete news

#### Categories
- `GET /api/admin/categories` - Get all categories
- `GET /api/admin/categories/:id` - Get category by ID
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category
- `PUT /api/admin/categories/reorder` - Reorder categories

#### Banners
- `GET /api/admin/banners` - Get all banners
- `GET /api/admin/banners/:id` - Get banner by ID
- `GET /api/admin/banners/position/:position` - Get banners by position
- `POST /api/admin/banners` - Create banner (with image upload)
- `PUT /api/admin/banners/:id` - Update banner (with image upload)
- `DELETE /api/admin/banners/:id` - Delete banner

#### Comments
- `GET /api/admin/comments` - Get all comments
- `GET /api/admin/comments/stats` - Get comment statistics
- `PATCH /api/admin/comments/:id/status` - Update comment status
- `DELETE /api/admin/comments/:id` - Delete comment
- `POST /api/admin/comments/:id/reply` - Reply to comment

#### Feedback
- `GET /api/admin/feedback` - Get all feedbacks
- `GET /api/admin/feedback/:id` - Get feedback by ID
- `GET /api/admin/feedback/unread-count` - Get unread feedback count
- `PATCH /api/admin/feedback/:id/status` - Update feedback status
- `DELETE /api/admin/feedback/:id` - Delete feedback

#### Ratings
- `GET /api/admin/ratings` - Get all ratings
- `GET /api/admin/ratings/stats` - Get rating statistics
- `POST /api/admin/ratings/:id/reply` - Add reply to rating
- `DELETE /api/admin/ratings/:id` - Delete rating

#### E-paper
- `GET /api/admin/epaper` - Get all e-papers
- `POST /api/admin/epaper` - Upload e-paper (PDF)
- `DELETE /api/admin/epaper/:id` - Delete e-paper

### User Routes

#### Authentication
- `POST /api/user/auth/send-otp` - Send OTP to phone number
- `POST /api/user/auth/verify-otp` - Verify OTP and login
- `GET /api/user/auth/me` - Get current user
- `PUT /api/user/auth/profile` - Update user profile

#### News
- `GET /api/user/news` - Get all published news
- `GET /api/user/news/:id` - Get news by ID
- `GET /api/user/news/breaking` - Get breaking news
- `GET /api/user/banners/:position` - Get banners by position

#### Comments
- `GET /api/user/comments/news/:newsId` - Get comments for a news
- `POST /api/user/comments` - Create comment

#### Feedback
- `POST /api/user/feedback` - Create feedback

#### Ratings
- `POST /api/user/ratings` - Create or update rating
- `GET /api/user/ratings/me` - Get user's rating

#### E-paper
- `GET /api/user/epaper` - Get all e-papers
- `GET /api/user/epaper/:id` - Get e-paper by ID

#### Bookmarks
- `GET /api/user/bookmarks` - Get user's bookmarks
- `POST /api/user/bookmarks` - Add bookmark
- `DELETE /api/user/bookmarks/:newsId` - Remove bookmark
- `GET /api/user/bookmarks/check/:newsId` - Check if news is bookmarked

## Authentication

### Admin Authentication
Include the admin JWT token in the Authorization header:
```
Authorization: Bearer <admin_token>
```

### User Authentication
Include the user JWT token in the Authorization header:
```
Authorization: Bearer <user_token>
```

## File Uploads

### Image Upload
Use `multipart/form-data` with field name `featuredImage` or `images` (for multiple).

### PDF Upload
Use `multipart/form-data` with field name `file` for e-paper uploads.

## Database Models

- Admin
- User
- News
- Category
- Banner
- Comment
- Feedback
- Rating
- Epaper
- Bookmark

## Error Handling

All errors are returned in the following format:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Development

The server runs on port 5000 by default. Make sure MongoDB is running before starting the server.

## License

ISC

