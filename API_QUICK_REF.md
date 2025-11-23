# API Quick Reference Card

## Base URL
```
http://localhost:3000/api
```

## Authentication Header
```
Authorization: Bearer <jwt-token>
```

## Quick Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **AUTH** |
| POST | `/auth/register` | - | Register new user |
| POST | `/auth/login` | - | Login user |
| **USERS** |
| GET | `/users/me` | ✓ | Get current user |
| PUT | `/users/me` | ✓ | Update profile |
| GET | `/users` | Admin | List all users |
| GET | `/users/:id` | Admin | Get user details |
| **CATEGORIES** |
| GET | `/categories` | ✓ | List categories |
| GET | `/categories/:id` | ✓ | Get category + videos |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |
| **VIDEOS** |
| GET | `/videos` | ✓ | List videos |
| GET | `/videos/:id` | ✓ | Get video details |
| POST | `/videos` | Admin | Upload video |
| PUT | `/videos/:id` | Admin | Update video |
| DELETE | `/videos/:id` | Admin | Delete video |
| **SCHEDULES** |
| GET | `/schedules` | ✓ | Get user schedules |
| POST | `/schedules` | ✓ | Create schedule |
| PUT | `/schedules/:id/complete` | ✓ | Mark complete |
| DELETE | `/schedules/:id` | ✓ | Delete schedule |
| **PROGRESS** |
| GET | `/progress` | ✓ | Get user progress |
| GET | `/progress/stats` | ✓ | Get statistics |
| POST | `/progress` | ✓ | Record completion |
| **MESSAGES** |
| GET | `/messages` | ✓ | Get all messages |
| GET | `/messages/conversation/:userId` | ✓ | Get conversation |
| GET | `/messages/unread/count` | ✓ | Unread count |
| POST | `/messages` | ✓ | Send message |
| **HARDWARE** |
| GET | `/hardware` | ✓ | Get sensor data |
| POST | `/hardware` | ✓ | Record data |
| POST | `/hardware/batch` | ✓ | Batch record |
| GET | `/hardware/stats/summary` | ✓ | Get statistics |
| **STATS** |
| GET | `/stats/overview` | Admin | Overall stats |
| GET | `/stats/active-users` | Admin | Active users |
| GET | `/stats/videos` | Admin | Video stats |
| GET | `/stats/engagement` | Admin | User engagement |

## Common Query Parameters

**Pagination**:
```
?page=1&limit=20
```

**Date Filtering**:
```
?startDate=2025-11-01T00:00:00Z&endDate=2025-11-30T23:59:59Z
```

**Filtering**:
```
?categoryId=1
?difficultyLevel=beginner
?completed=true
?role=patient
```

## Response Format

**Success**:
```json
{
  "data": {...},
  "message": "Success"
}
```

**Error**:
```json
{
  "error": "Error message"
}
```

**Paginated**:
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Sample Login Flow

1. **Register** (if new user):
```bash
POST /auth/register
{
  "email": "user@email.com",
  "password": "password123",
  "name": "User Name",
  "role": "patient"
}
```

2. **Login**:
```bash
POST /auth/login
{
  "email": "user@email.com",
  "password": "password123"
}
```

3. **Save token** from response

4. **Use token** in subsequent requests:
```bash
Authorization: Bearer eyJhbGc...
```

## Sample Data Flow

### Patient Exercise Flow
1. `GET /categories` - Browse categories
2. `GET /categories/1` - Get videos in category
3. `GET /videos/1` - Get video details
4. `POST /schedules` - Schedule exercise
5. `PUT /schedules/1/complete` - Mark as done
6. `POST /progress` - Record completion

### Expert-Patient Communication
1. `GET /messages/unread/count` - Check unread
2. `GET /messages/conversation/3` - View conversation
3. `POST /messages` - Send reply
4. `GET /stats/engagement` - View patient progress

### Admin Content Management
1. `POST /categories` - Create category
2. `POST /videos` - Upload video
3. `POST /videos/1/thumbnail` - Add thumbnail
4. `GET /stats/overview` - View statistics
5. `GET /stats/videos` - Check video performance

## File Upload Format

**Video Upload**:
```bash
Content-Type: multipart/form-data

Fields:
- video: [file]
- title: string
- description: string
- categoryId: number
- duration: number (seconds)
- difficultyLevel: beginner|intermediate|advanced
- instructions: string
```

**Thumbnail Upload**:
```bash
Content-Type: multipart/form-data

Fields:
- thumbnail: [image file]
```

## Date/Time Format

Always use ISO 8601:
```
2025-11-19T14:30:00Z
```

## Roles

- `patient` - Regular users
- `expert` - Healthcare professionals
- `admin` - System administrators

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Server Error

---

**Keep this card handy while developing!**
