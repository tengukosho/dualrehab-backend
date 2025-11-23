# Rehabilitation Platform - Backend API

Node.js + Express + SQLite backend for the rehabilitation platform.

## Features

- ✅ JWT Authentication (Patient, Expert, Admin roles)
- ✅ User management with role-based access
- ✅ Video upload and management
- ✅ Category management
- ✅ Scheduling system
- ✅ Progress tracking with statistics
- ✅ Patient-Expert messaging
- ✅ Hardware sensor data storage
- ✅ Admin dashboard statistics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Initialize Database

```bash
# Generate Prisma client and create database
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 3. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3000`

## Sample Credentials

After seeding:

- **Admin**: `admin@rehab.com` / `admin123`
- **Expert**: `expert@rehab.com` / `expert123`
- **Patient**: `patient1@email.com` / `patient123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users` - List all users (admin/expert)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id/assign-expert` - Assign expert to patient

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category with videos
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Videos
- `GET /api/videos` - List all videos
- `GET /api/videos/:id` - Get video details
- `POST /api/videos` - Upload video (admin)
- `POST /api/videos/:id/thumbnail` - Upload thumbnail (admin)
- `PUT /api/videos/:id` - Update video (admin)
- `DELETE /api/videos/:id` - Delete video (admin)

### Schedules
- `GET /api/schedules` - Get user schedules
- `GET /api/schedules/:id` - Get schedule details
- `POST /api/schedules` - Create schedule
- `PUT /api/schedules/:id/complete` - Mark as completed
- `DELETE /api/schedules/:id` - Delete schedule

### Progress
- `GET /api/progress` - Get user progress
- `GET /api/progress/stats` - Get progress statistics
- `POST /api/progress` - Record completion
- `PUT /api/progress/:id` - Update progress entry

### Messages
- `GET /api/messages` - Get all messages
- `GET /api/messages/conversation/:userId` - Get conversation
- `GET /api/messages/unread/count` - Unread count
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read
- `DELETE /api/messages/:id` - Delete message

### Hardware
- `GET /api/hardware` - Get hardware data
- `GET /api/hardware/:id` - Get specific data
- `POST /api/hardware` - Record sensor data
- `POST /api/hardware/batch` - Batch record data
- `GET /api/hardware/stats/summary` - Get statistics

### Statistics (Admin/Expert)
- `GET /api/stats/overview` - Overall statistics
- `GET /api/stats/active-users` - Active user stats
- `GET /api/stats/videos` - Video statistics
- `GET /api/stats/engagement` - User engagement
- `GET /api/stats/categories` - Category statistics
- `GET /api/stats/hospitals` - Hospital statistics

## Authentication

Include JWT token in requests:

```
Authorization: Bearer <your-jwt-token>
```

## Database Management

```bash
# View database in browser
npm run db:studio

# Reset database
rm prisma/dev.db
npm run db:push
npm run db:seed
```

## File Uploads

Videos and thumbnails are stored in `/uploads` directory:
- Videos: `/uploads/videos/`
- Thumbnails: `/uploads/thumbnails/`

Accessible via: `http://localhost:3000/uploads/videos/filename.mp4`

## Environment Variables

Configure in `.env`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
MAX_FILE_SIZE=104857600
```

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── errorHandler.js    # Error handling
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── category.routes.js
│   │   ├── video.routes.js
│   │   ├── schedule.routes.js
│   │   ├── message.routes.js
│   │   ├── progress.routes.js
│   │   ├── hardware.routes.js
│   │   └── stats.routes.js
│   ├── seed.js                # Database seeding
│   └── server.js              # Main server file
├── uploads/                   # File uploads
├── .env                       # Environment variables
└── package.json
```

## Development Tips

1. **Test API**: Use Postman, Insomnia, or curl
2. **View Database**: Run `npm run db:studio`
3. **Logs**: Server logs all requests with Morgan
4. **CORS**: Enabled for all origins in development

## Next Steps

1. ✅ Backend is ready
2. 🔜 Build Android app
3. 🔜 Build Web dashboard

## Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env file
PORT=3001
```

**Database locked:**
```bash
# Stop all running instances
killall node
npm run dev
```

**Prisma errors:**
```bash
# Regenerate Prisma client
npx prisma generate
npm run db:push
```
