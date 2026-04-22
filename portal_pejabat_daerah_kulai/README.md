# Portal Pejabat Daerah Kulai

## 🎯 Main Features

- **💬 AI Chatbot** - AI-powered chatbot (Gemini API) to answer common questions
- **📝 Complaint Management** - Users can submit, track, and manage complaints
- **❓ FAQ & Knowledge Base** - Searchable database for general information and references
- **🔐 Secure Authentication** - Safe and secure account registration and login system
- **📊 Admin Dashboard** - Full admin panel with analytics, complaint management, user management, chatbot monitoring, FAQ management, and report generation

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Recharts** - Chart and analytics visualizations (used in Admin Dashboard)

### Backend (To be implemented)
- **Laravel** - PHP framework
- **MySQL** - Database
- **Gemini API** - AI integration

---

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

---

## 🚀 Setup & Installation

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/portal-pejabat-daerah-kulai.git
cd portal-pejabat-daerah-kulai
```

### 2. Install Dependencies
```bash
npm install
```

> **Note:** The Admin Dashboard uses Recharts for charts. Install it with:
> ```bash
> npm install recharts
> ```

### 3. Create Environment File
```bash
cp .env.example .env.local
```

Edit `.env.local` and update it with your backend configuration:
```
REACT_APP_API_URL=http://localhost:8000/api
```

### 4. Start Development Server
```bash
npm start
```

Server will be run at `http://localhost:3000`

---

## 📁 Folder Structure

```
portal-pejabat-daerah-kulai/
├── public/
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   │   ├── AdminLayout.js      ← Sidebar + topbar shell for admin
│   │   │   └── AdminUI.js          ← Shared UI components (Badge, MetricCard, DataTable, etc.)
│   │   ├── Chatbot/
│   │   ├── Complaints/
│   │   ├── FAQ/
│   │   ├── Dashboard/
│   │   └── Common/
│   ├── pages/
│   │   ├── Admin/
│   │   │   ├── AdminDashboard.js   ← Overview metrics, charts, recent activity
│   │   │   ├── AdminComplaints.js  ← Complaint list, filtering, status updates
│   │   │   ├── AdminChatbot.js     ← Chatbot session stats and conversation history
│   │   │   ├── AdminUsers.js       ← User list, roles, and account management
│   │   │   ├── AdminFAQ.js         ← FAQ entries management (add/edit/delete)
│   │   │   └── AdminAnalytics.js   ← Analytics charts and report generation
│   │   ├── Home.js
│   │   ├── ChatbotPage.js
│   │   ├── ComplaintsPage.js
│   │   ├── FAQPage.js
│   │   ├── DashboardPage.js
│   │   ├── Login.js
│   │   └── Register.js
│   ├── services/
│   │   └── api.js
│   ├── data/
│   │   └── db.json                 ← Local JSON database (development only)
│   ├── App.js
│   └── index.js
├── .gitignore
├── .env.example
├── package.json
├── README.md
└── tailwind.config.js
```

---

## 📝 Usage

### For General Users
1. **Register & Login** - Create a new account using your email
2. **Use the Chatbot** - Ask questions to the AI chatbot
3. **Submit a Complaint** - Report an issue through the form
4. **Track Status** - Monitor the progress of your complaint
5. **Read the FAQs** - Find answers in the knowledge base

### For Administrators
1. **Login** - Sign in with an admin account at `http://localhost:3000/login`
2. **Auto-redirect** - Admin users are automatically redirected to `/admin/dashboard` after login
3. **Dashboard** - View overall statistics: total complaints, resolved rate, chatbot sessions
4. **Manage Complaints** - Review, filter, respond to, and update complaint statuses
5. **Monitor Chatbot** - View chatbot session stats, common queries, and conversation history
6. **Manage Users** - View all users, assign roles, and manage accounts
7. **Manage FAQs** - Add, edit, publish, or delete FAQ entries
8. **Analytics & Reports** - View charts and export reports

---

## 🔐 Admin Access

The Admin Dashboard is protected by role-based access control. Only users with `role: "admin"` can access `/admin/*` routes. Non-admin users are redirected to `/login`.

### Default Admin Credentials (Development)
| Field    | Value                  |
|----------|------------------------|
| Email    | admin@kulai.gov.my     |
| Password | admin123               |
| Role     | admin                  |

> **Important:** Change these credentials before deploying to production.

### Admin Routes
| Route                  | Page                        |
|------------------------|-----------------------------|
| `/admin/dashboard`     | Overview & metrics          |
| `/admin/complaints`    | Complaint management        |
| `/admin/chatbot`       | AI chatbot monitoring       |
| `/admin/users`         | User management             |
| `/admin/faq`           | FAQ & knowledge base        |
| `/admin/analytics`     | Analytics & report export   |

---

## 🔗 API Endpoints

Check `src/services/api.js` for the complete list of API endpoints.

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Chatbot
- `POST /api/chatbot/message` - Send a message to the chatbot
- `GET /api/chatbot/history` - Get chat history

### Complaints
- `GET /api/complaints/my-complaints` - Get user's complaints
- `POST /api/complaints` - Submit a new complaint
- `GET /api/complaints/:id` - Get complaint details
- `GET /api/complaints` - Get all complaints (admin)
- `PUT /api/complaints/:id/status` - Update complaint status (admin)
- `POST /api/complaints/:id/respond` - Respond to a complaint (admin)

### FAQ
- `GET /api/faqs` - Get all FAQs
- `GET /api/faqs/search` - Search FAQs
- `POST /api/faqs` - Create a new FAQ (admin)
- `PUT /api/faqs/:id` - Update an FAQ (admin)
- `DELETE /api/faqs/:id` - Delete an FAQ (admin)

### Users (Admin)
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/:id/role` - Update user role (admin)
- `DELETE /api/users/:id` - Delete a user (admin)

### Analytics (Admin)
- `GET /api/analytics/chat` - Chat analytics
- `GET /api/analytics/complaints` - Complaint analytics
- `GET /api/analytics/users` - User activity analytics
- `POST /api/analytics/generate-report` - Generate and export report

---

## 🧩 Admin Dashboard Modules

### 1. 📊 Dashboard Overview
- Total complaints, resolved count, pending count, chatbot session count
- 6-month complaint trend line chart
- Complaint breakdown by category (pie chart + progress bars)
- Live chatbot activity feed
- Recent complaints table

### 2. 📝 Complaint Management
- Filter complaints by status: All, Pending, In Progress, Resolved
- Search by title, category, or user
- View, respond, and update complaint status
- CSV export

### 3. 💬 AI Chatbot Monitoring
- Session stats: total sessions, avg response time, AI resolution rate, escalation rate
- Top query topics categorized by AI
- Daily session bar chart
- Conversation history with escalation tracking

### 4. 👥 User Management
- Full user list with roles (User / Admin / Super Admin)
- Account status (Active / Banned)
- Search by name, email, or role
- Edit role and delete account actions

### 5. ❓ FAQ & Knowledge Base
- FAQ list with category tags, view counts, publish/draft status
- Filter by Published or Draft
- Add, edit, and delete FAQ entries
- Search by keyword or category

### 6. 📈 Analytics & Reports
- Monthly complaint volume bar chart
- Resolution rate by category (horizontal bar chart)
- Key metrics: avg resolution time, user satisfaction, repeat complaints
- Report generation cards (Monthly Summary, Chatbot Analytics, Resolution Times, etc.)

---

## 🧪 Development

### Starting the Development Server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

### Lint Code
```bash
npm run lint
```

---

## 📤 Deployment

### Deploy to GitHub Pages
```bash
npm install --save-dev gh-pages
```

Edit `package.json` and add:
```json
"homepage": "https://yourusername.github.io/portal-pejabat-daerah-kulai",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

Then run:
```bash
npm run deploy
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Deploy to Netlify
Connect your GitHub repository to Netlify and set up automatic deployment.

---

## 🐛 Bug Report

If you encounter a bug, please open an issue on GitHub with the following details:
- Bug description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshot (if applicable)

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for the details.
