# API Testing Examples

Use these curl commands to test the API endpoints.

## 1. Authentication

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newpatient@email.com",
    "password": "password123",
    "name": "New Patient",
    "role": "patient",
    "hospital": "Test Hospital",
    "phoneNumber": "+1234567899"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient1@email.com",
    "password": "patient123"
  }'
```

**Save the token from response:**
```bash
export TOKEN="your-jwt-token-here"
```

## 2. User Endpoints

### Get Current User
```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "phoneNumber": "+9876543210"
  }'
```

## 3. Categories

### Get All Categories
```bash
curl http://localhost:3000/api/categories \
  -H "Authorization: Bearer $TOKEN"
```

### Get Category with Videos
```bash
curl http://localhost:3000/api/categories/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Create Category (Admin only)
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Category",
    "description": "Description here",
    "order": 6
  }'
```

## 4. Videos

### Get All Videos
```bash
curl http://localhost:3000/api/videos \
  -H "Authorization: Bearer $TOKEN"
```

### Get Videos by Category
```bash
curl "http://localhost:3000/api/videos?categoryId=1" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Video Details
```bash
curl http://localhost:3000/api/videos/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Upload Video (Admin only)
```bash
curl -X POST http://localhost:3000/api/videos \
  -H "Authorization: Bearer $TOKEN" \
  -F "video=@/path/to/video.mp4" \
  -F "title=Test Video" \
  -F "description=Test description" \
  -F "categoryId=1" \
  -F "duration=300" \
  -F "difficultyLevel=beginner" \
  -F "instructions=Step by step instructions"
```

## 5. Schedules

### Get My Schedules
```bash
curl http://localhost:3000/api/schedules \
  -H "Authorization: Bearer $TOKEN"
```

### Get Today's Schedules
```bash
TODAY=$(date +%Y-%m-%d)
curl "http://localhost:3000/api/schedules?startDate=${TODAY}T00:00:00Z&endDate=${TODAY}T23:59:59Z" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Schedule
```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": 1,
    "scheduledDate": "2025-11-20T10:00:00Z"
  }'
```

### Mark Schedule as Complete
```bash
curl -X PUT http://localhost:3000/api/schedules/1/complete \
  -H "Authorization: Bearer $TOKEN"
```

## 6. Progress

### Get My Progress
```bash
curl http://localhost:3000/api/progress \
  -H "Authorization: Bearer $TOKEN"
```

### Get Progress Statistics
```bash
curl http://localhost:3000/api/progress/stats \
  -H "Authorization: Bearer $TOKEN"
```

### Record Completion
```bash
curl -X POST http://localhost:3000/api/progress \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": 1,
    "notes": "Felt great today!",
    "rating": 5
  }'
```

## 7. Messages

### Get All Messages
```bash
curl http://localhost:3000/api/messages \
  -H "Authorization: Bearer $TOKEN"
```

### Get Conversation with Expert
```bash
curl http://localhost:3000/api/messages/conversation/2 \
  -H "Authorization: Bearer $TOKEN"
```

### Get Unread Count
```bash
curl http://localhost:3000/api/messages/unread/count \
  -H "Authorization: Bearer $TOKEN"
```

### Send Message
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": 2,
    "message": "Hello, I have a question about my exercises."
  }'
```

## 8. Hardware Data

### Record Sensor Data
```bash
curl -X POST http://localhost:3000/api/hardware \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dataType": "accelerometer",
    "dataValue": {
      "x": 0.5,
      "y": 0.3,
      "z": 9.8
    },
    "notes": "Exercise session data"
  }'
```

### Batch Record Data
```bash
curl -X POST http://localhost:3000/api/hardware/batch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {
        "dataType": "accelerometer",
        "dataValue": {"x": 0.5, "y": 0.3, "z": 9.8}
      },
      {
        "dataType": "gyroscope",
        "dataValue": {"x": 0.1, "y": 0.2, "z": 0.05}
      }
    ]
  }'
```

### Get Hardware Statistics
```bash
curl "http://localhost:3000/api/hardware/stats/summary?days=30" \
  -H "Authorization: Bearer $TOKEN"
```

## 9. Statistics (Admin/Expert)

### Overview Statistics
```bash
curl http://localhost:3000/api/stats/overview \
  -H "Authorization: Bearer $TOKEN"
```

### Active Users
```bash
curl "http://localhost:3000/api/stats/active-users?period=7" \
  -H "Authorization: Bearer $TOKEN"
```

### Video Statistics
```bash
curl http://localhost:3000/api/stats/videos \
  -H "Authorization: Bearer $TOKEN"
```

### User Engagement
```bash
curl "http://localhost:3000/api/stats/engagement?days=30" \
  -H "Authorization: Bearer $TOKEN"
```

### Category Statistics
```bash
curl http://localhost:3000/api/stats/categories \
  -H "Authorization: Bearer $TOKEN"
```

## Health Check
```bash
curl http://localhost:3000/health
```

## Notes

- Replace `$TOKEN` with your actual JWT token
- Replace IDs (like /1, /2) with actual IDs from your database
- Date format: ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
- Admin endpoints require admin role token
- Expert endpoints require expert or admin role token
