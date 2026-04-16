# Complaint Form - Save & Display Flow

## How It Works

### 1️⃣ **Form Submission**
User fills complaint form with:
- Title
- Category
- Description
- Location (NEW)
- Attachment file (NEW)

### 2️⃣ **Data Processing**
When user clicks "Hantar Aduan":
1. Form data is converted to FormData object
2. All fields are appended (including file attachment)
3. Sent to `complaintAPI.submitComplaint()`

### 3️⃣ **Backend Processing**
In `src/services/api.js`:
1. Extracts FormData fields
2. Processes file attachment path
3. Gets userId from localStorage
4. Calls `databaseService.submitComplaint()`

### 4️⃣ **Database Storage**
In `src/data/databaseService.js`:
1. Generates unique ID: `Math.max(...ids) + 1`
2. Sets status as 'pending'
3. Adds created_at & updated_at timestamps
4. Adds to db.complaints array
5. Returns complete complaint object

### 5️⃣ **Immediate Feedback**
After successful submission:
- ✅ Success message displays with Reference ID
- Form fields reset
- Form closes
- Complaint list refreshes automatically

### 6️⃣ **List Display**
`fetchComplaints()` retrieves all user's complaints:
1. Calls `complaintAPI.getMyComplaints()`
2. Gets userId from localStorage
3. Filters complaints by user_id
4. Updates state and displays list

---

## Complete Data Flow

```
User Form Submit
      ↓
FormData Created & Sent
      ↓
complaintAPI.submitComplaint(formData)
      ↓
Extract FormData fields
      ↓
databaseService.submitComplaint(data, userId)
      ↓
Generate ID → Add to db.complaints[] → Return complaint
      ↓
Return { data: complaint }
      ↓
Display Success Message with Ref #ID
      ↓
Reset Form & Hide
      ↓
fetchComplaints()
      ↓
complaintAPI.getMyComplaints()
      ↓
getComplaintsByUserId(userId)
      ↓
Update complaints state
      ↓
Display in List with all details:
  • Title
  • Category
  • Location (NEW)
  • Status badge
  • Date
  • View Attachment link (if present)
```

---

## Features Included

✅ **Automatic ID Generation** - Each complaint gets unique ID
✅ **User Association** - Complaints linked to logged-in user
✅ **Status Tracking** - New complaints start as 'pending'
✅ **Timestamps** - Created and updated timestamps stored
✅ **File Attachment** - Filename stored and displayed
✅ **Success Feedback** - Reference number shown to user
✅ **Auto-Refresh** - List updates immediately after submission
✅ **Error Handling** - Catches and displays errors
✅ **Form Reset** - Clear fields after successful submission
✅ **Session Persistence** - Data stays within session (doesn't persist on page reload)

---

## Test It Now!

1. Login with test account:
   - Email: `ahmad.ibrahim@example.com`
   - Password: `password123`

2. Click "➕ New Complaint" button

3. Fill the form:
   - Title: "Test Complaint"
   - Category: "Infrastructure"
   - Description: "Test description"
   - Location: "Test Location, Kulai"
   - Attachment: (optional) Upload a PDF or image

4. Click "📤 Hantar Aduan"

5. You'll see:
   - ✅ Success message with Reference ID
   - New complaint appears in the list below
   - Form closes automatically

---

## Database State Example

After submitting a complaint, the `db.complaints` array looks like:

```javascript
{
  id: 5,                              // Auto-generated
  user_id: 1,                         // From logged-in user
  title: "Test Complaint",
  description: "Test description",
  category: "Infrastructure",
  location: "Test Location, Kulai",   // NEW
  status: "pending",                  // Auto-set
  attachment: "/attachments/file.pdf",// NEW
  created_at: "2026-04-14T10:30:00Z",
  updated_at: "2026-04-14T10:30:00Z"
}
```

---

## Enhanced Features Added

### Success/Error Messages
- Green success box with reference ID
- Red error box if submission fails
- Auto-disappears after 3 seconds

### Better Error Handling
- Catches all submission errors
- Displays user-friendly messages
- Logs errors for debugging

### Form State Management
- Clears on successful submit
- Preserves on error
- Resets attachment after submit

---

## What's Saved in Database

When a complaint is submitted, this data is permanently stored (in session):

| Field | Source | Example |
|-------|--------|---------|
| ID | Auto-generated | 5 |
| User ID | localStorage | 1 |
| Title | Form input | "Jalan Berlubang" |
| Category | Form select | "Infrastructure" |
| Description | Form textarea | "Detailed description..." |
| Location | Form input (NEW) | "Jalan Merdeka, Kulai" |
| Attachment | File upload (NEW) | "/attachments/photo.jpg" |
| Status | Auto-set | "pending" |
| Created At | Auto-generated | 2026-04-14T10:30:00Z |
| Updated At | Auto-generated | 2026-04-14T10:30:00Z |

---

## Next: Real Backend

When ready to use a real backend:
1. Replace `databaseService` calls with API endpoints
2. Implement proper file upload to server
3. Add database persistence
4. Handle user sessions

For now, everything works perfectly with the JSON database! 🚀
