import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatbotPage from './pages/ChatbotPage';
import ComplaintsPage from './pages/ComplaintsPage';
import FAQPage from './pages/FAQPage';
import DashboardPage from './pages/DashboardPage';

// Components
import Navbar from './components/Common/Navbar';
import PrivateRoute from './components/Common/PrivateRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token with backend (implement later)
      setUser(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/chatbot"
          element={<ChatbotPage />}
        />
        <Route
          path="/complaints"
          element={<ComplaintsPage />}
        />
        <Route
          path="/faq"
          element={<FAQPage />}
        />
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
