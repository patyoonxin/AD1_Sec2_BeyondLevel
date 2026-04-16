# Portal Pejabat Daerah Kulai

## 🎯 Main Feature

- **💬 AI Chatbot** - AI-powered chatbot (Gemini API) to answer common questions
- **📝 Complaint Management** - Users can submit, track, and manage complaints
- **❓ FAQ & Knowledge Base** - Searchable database for general information and references
- **🔐 Secure Authentication** - Safe and secure account registration and login system
- **📊 Admin Dashboard** - Analytics and reporting for administrators

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework

### Backend (To be implemented)
- **Laravel** - PHP framework
- **MySQL** - Database
- **Gemini API** - AI integration

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

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

## 📁 Struktur Folder

```
portal-pejabat-daerah-kulai/
├── public/
├── src/
│   ├── components/
│   │   ├── Chatbot/
│   │   ├── Complaints/
│   │   ├── FAQ/
│   │   ├── Dashboard/
│   │   └── Common/
│   ├── pages/
│   │   ├── Home.js
│   │   ├── ChatbotPage.js
│   │   ├── ComplaintsPage.js
│   │   ├── FAQPage.js
│   │   ├── DashboardPage.js
│   │   ├── Login.js
│   │   └── Register.js
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   ├── App.js
│   └── index.js
├── .gitignore
├── package.json
├── README.md
└── tailwind.config.js
```

## 📝 Usage

### For General Users
1. **Register & Login** - Create a new account using your email
2. **Use the Chatbot** - Ask questions to the AI chatbot
3. **Submit a Complaint** - Report an issue through the form
4. **Track Status** - Monitor the progress of your complaint
5. **Read the FAQs** - Find answers in the knowledge base

### For Administrators
1. **Login** - Sign in with an admin account
2. **Dashboard** - View statistics and analytics
3. **Manage Complaints** - Review, manage, and respond to user complaints
4. **Manage FAQs** - Add, edit, or delete FAQ entries
5. **Generate Reports** - Export data for analysis

## 🔗 API Endpoints

Check `src/services/api.js` for the complete list of API endpoints.

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Chatbot
- `POST /api/chatbot/message` - Send a message to the chatbot
- `GET /api/chatbot/history` - Get chat history

### Complaints
- `GET /api/complaints/my-complaints` - Get user's complaints
- `POST /api/complaints` - Submit a new complaint
- `GET /api/complaints/:id` - Get complaint details
- `GET /api/complaints` - Get all complaints (admin)
- `PUT /api/complaints/:id/status` - Update complaint status (admin)

### FAQ
- `GET /api/faqs` - Get all FAQs
- `GET /api/faqs/search` - Search FAQs
- `POST /api/faqs` - Create a new FAQ (admin)
- `PUT /api/faqs/:id` - Update an FAQ (admin)
- `DELETE /api/faqs/:id` - Delete an FAQ (admin)

### Analytics
- `GET /api/analytics/chat` - Chat analytics (admin)
- `GET /api/analytics/complaints` - Complaint analytics (admin)
- `POST /api/analytics/generate-report` - Generate report (admin)

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

Then, run:
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

## 🐛 Bug Report

If you encounter a bug, please open an issue on GitHub with the following details:
- Bug description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshot (if applicable)

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for the details.
