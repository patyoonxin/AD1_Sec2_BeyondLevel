import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Existing pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatbotPage from './pages/ChatbotPage';
import ComplaintsPage from './pages/ComplaintsPage';
import FAQPage from './pages/FAQPage';
import RealAgent from './pages/RealAgent';

// Existing components
import Navbar from './components/Common/Navbar';

// Admin layout + pages
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminComplaints from './pages/Admin/AdminComplaints';
import AdminComplaintDetails from './pages/Admin/AdminComplaintDetails';
import AdminChatbot from './pages/Admin/AdminChatbot';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminFAQ from './pages/Admin/AdminFAQ';
import AdminAnalytics from './pages/Admin/AdminAnalytics';
import AdminRealAgent from './pages/Admin/AdminRealAgent';
import AdminCategories from './pages/Admin/AdminCategories';

// ── Guard: only admin role can access /admin/* ────────────────────────────────
function AdminRoute({ component: Component }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

// ── Guard: redirect logged-in admin away from login page ─────────────────────
function PublicRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (user && user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const handleSetUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🏛️</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>

        {/* ── Public routes (with Navbar) ──────────────────────────── */}
        <Route
          path="/"
          element={
            <>
              <Navbar user={user} setUser={handleSetUser} />
              <Home />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Navbar user={user} setUser={handleSetUser} />
              <Login setUser={handleSetUser} />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <>
              <Navbar user={user} setUser={handleSetUser} />
              <Register />
            </>
          }
        />
        <Route
          path="/chatbot"
          element={
            <>
              <Navbar user={user} setUser={handleSetUser} />
              <ChatbotPage />
            </>
          }
        />
        <Route
          path="/real-agent"
          element={
            <>
              <Navbar user={user} setUser={handleSetUser} />
              <RealAgent />
            </>
          }
        />
        <Route
          path="/complaints"
          element={
            <>
              <Navbar user={user} setUser={handleSetUser} />
              <ComplaintsPage />
            </>
          }
        />
        <Route
          path="/faq"
          element={
            <>
              <Navbar user={user} setUser={handleSetUser} />
              <FAQPage />
            </>
          }
        />

        {/* ── Admin routes (protected, with AdminLayout sidebar) ────── */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard"  element={<AdminRoute component={AdminDashboard} />} />
        <Route path="/admin/complaints"      element={<AdminRoute component={AdminComplaints} />} />
        <Route path="/admin/complaints/:id"  element={<AdminRoute component={AdminComplaintDetails} />} />
        <Route path="/admin/categories"      element={<AdminRoute component={AdminCategories} />} />
        <Route path="/admin/chatbot"    element={<AdminRoute component={AdminChatbot} />} />
        <Route path="/admin/users"      element={<AdminRoute component={AdminUsers} />} />
        <Route path="/admin/faq"        element={<AdminRoute component={AdminFAQ} />} />
        <Route path="/admin/analytics"  element={<AdminRoute component={AdminAnalytics} />} />
        <Route path="/admin/real-agent" element={<AdminRoute component={AdminRealAgent} />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
