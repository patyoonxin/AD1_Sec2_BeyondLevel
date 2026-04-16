# JSON Database Setup - Complete Guide

## What Was Created

### 1. **src/data/db.json** - Main Database File
Complete JSON database with realistic sample data:

```
📊 Users (3 accounts)
├── Regular User 1: ahmad.ibrahim@example.com / password123
├── Regular User 2: siti.nurhaliza@example.com / password123
└── Admin: admin@kulai.gov.my / admin123

📝 Complaints (4 samples)
├── Infrastructure issue (in progress)
├── Street light issue (resolved)
├── License/Permit issue (pending)
└── Cleanliness issue (pending)

❓ FAQs (8 questions)
├── How to submit complaint
├── Processing time
├── Account requirements
├── Categories
├── Password reset
├── File attachments
├── Data privacy
└── Contact support

💬 Chatbot Conversations (1 sample)
└── Sample user-bot interaction

📈 Statistics
└── Portal metrics and analytics
```

### 2. **src/data/databaseService.js** - Utility Functions
Ready-to-use helper functions:
- `authenticateUser(email, password)` - Login verification
- `registerUser(userData)` - New account creation
- `getComplaintsByUserId(userId)` - Retrieve user complaints
- `submitComplaint(data, userId)` - Submit new complaint
- `getAllFAQs()` - Get all FAQ entries
- `searchFAQs(keyword)` - Search FAQs
- `getChatbotResponse(message)` - AI chatbot responses
- `getStatistics()` - Portal stats

### 3. **src/services/api-json-integration.js** - API Integration
Two integration approaches:
- **JSON Only** - Use JSON database directly
- **Hybrid** - Switch between JSON and real API via environment variable

### 4. **src/data/README.md** - Documentation
Complete setup guide with credentials and usage examples

### 5. **.env.example** - Environment Template
Configuration template for your project

---

## Quick Start

### Step 1: Use JSON Database in Your Components

For development, update your components to use the JSON service:

```javascript
// In your component file
import databaseService from '../data/databaseService';

// Example: Login
const handleLogin = async (email, password) => {
  try {
    const user = await databaseService.authenticateUser(email, password);
    if (user) {
      localStorage.setItem('authToken', 'mock_token_' + Date.now());
      localStorage.setItem('userId', user.id);
      // Proceed with login
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Step 2: Use Pre-Built Integration

Or use the ready-made integration file that handles API calls:

```javascript
// In src/services/api.js or update your api imports
import { 
  authAPI_JSON, 
  complaintAPI_Enhanced, 
  faqAPI_JSON,
  chatbotAPI_JSON 
} from '../services/api-json-integration';

// Then use it in your components
const response = await authAPI_JSON.login(email, password);
```

### Step 3: Test with Sample Accounts

**Regular User:**
- Email: `ahmad.ibrahim@example.com`
- Password: `password123`

**Admin:**
- Email: `admin@kulai.gov.my`
- Password: `admin123`

---

## File Structure

```
portal-pejabat-kulai/
├── src/
│   ├── data/
│   │   ├── db.json                      ← Main database
│   │   ├── databaseService.js           ← Helper functions
│   │   └── README.md                    ← Database documentation
│   ├── services/
│   │   ├── api.js                       ← Your existing API file
│   │   └── api-json-integration.js      ← New JSON integration
│   ├── pages/
│   ├── components/
│   └── App.js
├── public/
├── .env                                 ← Create this
├── .env.example                         ← Template
└── package.json
```

---

## Implementation Strategies

### 🟢 Strategy 1: Direct JSON (Fastest)
Best for rapid prototyping:
```javascript
import databaseService from '../data/databaseService';
// Use databaseService directly in components
```

### 🟡 Strategy 2: Hybrid (Flexible)
Best for gradual migration:
```javascript
// .env file
REACT_APP_USE_JSON_DB=true

// When ready to use real API, change to:
REACT_APP_USE_JSON_DB=false
```

### 🔴 Strategy 3: Mock Server (Realistic)
Best for production-like testing:
```bash
# Install globally
npm install -g json-server

# Run mock server
json-server --watch src/data/db.json --port 3001

# Update API_URL to http://localhost:3001
```

---

## Data Structure Examples

### Complaint Object
```javascript
{
  "id": 1,
  "user_id": 1,
  "title": "Jalan Berlubang",
  "description": "Detailed description...",
  "category": "Infrastructure",
  "location": "Jalan Merdeka, Kulai",        // NEW
  "status": "in_progress",
  "attachment": "/attachments/photo.jpg",    // NEW
  "created_at": "2026-03-10T09:15:00Z",
  "updated_at": "2026-03-20T11:30:00Z"
}
```

### User Object
```javascript
{
  "id": 1,
  "name": "Ahmad bin Ibrahim",
  "email": "ahmad.ibrahim@example.com",
  "phone": "+60-7-1234-5678",
  "address": "123 Jalan Merdeka",
  "role": "user",
  "created_at": "2026-01-15T10:30:00Z"
}
```

---

## Next Steps

### For Development
1. ✅ Use this JSON database for local testing
2. ✅ Test all features with sample data
3. ✅ Verify component logic works correctly
4. ✅ Add more test data to db.json as needed

### For Production
1. 🔄 Replace JSON database with real backend API
2. 🔄 Implement proper authentication server
3. 🔄 Set up file storage (AWS S3, etc.)
4. 🔄 Deploy to production server
5. 🔄 Remove JSON database code

### Useful Enhancements
- Add more sample complaints based on real scenarios
- Create admin dashboard using mock data
- Test error handling with invalid data
- Add timestamps for realistic testing
- Create batch operations for testing

---

## Tips & Tricks

### Add Test Data
Edit `src/data/db.json` directly:
```json
{
  "complaints": [
    // ... existing complaints
    {
      "id": 5,
      "user_id": 2,
      "title": "Your new test complaint",
      ...
    }
  ]
}
```

### Debug Database Calls
```javascript
// Check what data is being stored
console.log('Database:', db);

// Verify a specific query
const user = await databaseService.findUserByEmail('test@example.com');
console.log('Found user:', user);
```

### Simulate Network Delays
The service already includes delays, but you can adjust them:
```javascript
// In databaseService.js
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// Change 200/300/400 values for different delays
```

---

## Troubleshooting

### Problem: Cannot import db.json
**Solution:** Ensure you're in a Create React App project that supports JSON imports
```javascript
// This should work in Create React App
import db from './db.json';
```

### Problem: Data not persisting across page refreshes
**Expected behavior** - JSON is reloaded from file. Use localStorage for persistence:
```javascript
localStorage.setItem('userData', JSON.stringify(user));
```

### Problem: File attachment not working
**Workaround:** Currently, only file metadata is stored. For full file uploads, integrate with backend file storage later.

---

## Support

For questions about implementation:
1. Check the [README.md](./README.md) in src/data/
2. Review examples in [api-json-integration.js](../../services/api-json-integration.js)
3. Study the [db.json](./db.json) structure

---

**Last Updated:** April 14, 2026
**Status:** ✅ Ready for Development
