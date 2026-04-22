# JSON Temporary Database - Setup Guide

## Overview
This is a temporary JSON-based database for development and testing without a real backend server. It includes sample data for users, complaints, FAQs, and chatbot conversations.

## Files

### `db.json`
Main database file containing:
- **users** - Sample user accounts for testing
- **complaints** - Sample complaints with all fields including location and attachments
- **faqs** - Frequently asked questions in Bahasa Melayu
- **chatbot_conversations** - Sample chatbot message history
- **statistics** - Portal statistics

### `databaseService.js`
Utility service with helper functions to read/manage JSON data:
- User authentication and registration
- Complaint submission and retrieval
- FAQ search
- Chatbot responses
- Statistics retrieval

## Test Credentials

### Regular User
- **Email:** ahmad.ibrahim@example.com
- **Password:** password123

### Another User
- **Email:** siti.nurhaliza@example.com
- **Password:** password123

### Admin Account
- **Email:** admin@kulai.gov.my
- **Password:** admin123

## How to Use with Your API Service

### Option 1: Quick Development (Use JSON directly)

```javascript
// In your API service file (src/services/api.js)
import databaseService from '../data/databaseService';

export const authAPI = {
  login: async (email, password) => {
    const user = await databaseService.authenticateUser(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const token = databaseService.generateMockToken();
    return { data: { user, token } };
  },

  register: async (name, email, password) => {
    const user = await databaseService.registerUser({
      name, email, password
    });
    return { data: { user } };
  }
};

export const complaintAPI = {
  submitComplaint: async (data) => {
    const userId = 1; // Get from localStorage or context
    const complaint = await databaseService.submitComplaint(data, userId);
    return { data: complaint };
  },

  getMyComplaints: async () => {
    const userId = 1; // Get from actual user
    const complaints = await databaseService.getComplaintsByUserId(userId);
    return { data: complaints };
  }
};
```

### Option 2: Replace Backend Gradually

Keep using the JSON database for development, then replace API calls with real backend when ready:

```javascript
// Development
const useJSON = process.env.REACT_APP_USE_JSON_DB === 'true';

export const authAPI = {
  login: async (email, password) => {
    if (useJSON) {
      return databaseService.authenticateUser(email, password);
    }
    // Real API call
    return axios.post('/api/auth/login', { email, password });
  }
};
```

## Sample Data

### Users
```json
{
  "id": 1,
  "name": "Ahmad bin Ibrahim",
  "email": "ahmad.ibrahim@example.com",
  "password": "password123",
  "role": "user"
}
```

### Complaints
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Jalan Berlubang di Jalan Merdeka",
  "description": "...",
  "category": "Infrastructure",
  "location": "Jalan Merdeka, km 2, Kulai",
  "status": "in_progress",
  "attachment": "/attachments/road_damage_1.jpg",
  "created_at": "2026-03-10T09:15:00Z"
}
```

### FAQs
```json
{
  "id": 1,
  "question": "Bagaimana cara mengajukan aduan?",
  "answer": "..."
}
```

## Features

✅ Mock authentication with token generation
✅ User registration
✅ Complaint submission with location & attachments
✅ Complaint status tracking
✅ FAQ search functionality
✅ Chatbot response generation
✅ Realistic delays (simulation)
✅ Full Bahasa Melayu support
✅ All complaint fields including new location & attachment fields

## Limitations

⚠️ Data is not persisted (resets on page refresh)
⚠️ File attachments are handled as file references (not true file storage)
⚠️ No real file upload/storage backend
⚠️ Simple rule-based chatbot responses

## Next Steps

1. **For Production:**
   - Replace JSON calls with real REST API endpoints
   - Implement proper database (MySQL, MongoDB, etc.)
   - Add authentication server
   - Implement file storage (AWS S3, etc.)

2. **For Testing:**
   - Keep using JSON database locally
   - Use tools like `json-server` package for mock API server
   - Add more sample data as needed

## Install json-server (Optional)

For a more realistic mock server experience:

```bash
npm install -g json-server
json-server --watch src/data/db.json --port 3001
```

Then update your API calls to use `http://localhost:3001`

## Tips

- Modify `db.json` directly to add more test data
- Update `databaseService.js` to add new data operations
- Use localStorage to persist authentication token
- Add more realistic complaints based on actual requirements
