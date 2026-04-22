/**
 * QUICK INTEGRATION GUIDE
 * 
 * This file shows how to integrate the JSON database service with your existing API calls.
 * Choose the approach that works best for your workflow.
 */

import databaseService from '../data/databaseService';

// ============================================
// APPROACH 1: Direct JSON Database Usage
// ============================================
// Best for: Pure development without backend

export const authAPI_JSON = {
  login: async (email, password) => {
    try {
      const user = await databaseService.authenticateUser(email, password);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      const token = databaseService.generateMockToken();
      return {
        data: {
          user,
          token,
          message: 'Login successful'
        }
      };
    } catch (error) {
      throw error;
    }
  },

  register: async (name, email, password) => {
    try {
      const user = await databaseService.registerUser({
        name,
        email,
        password
      });
      return {
        data: {
          user,
          message: 'Registration successful'
        }
      };
    } catch (error) {
      throw error;
    }
  }
};

export const complaintAPI_JSON = {
  submitComplaint: async (data) => {
    try {
      // Get user ID from localStorage or pass as parameter
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId') || 1;
      
      const complaint = await databaseService.submitComplaint(data, userId);
      return { data: complaint };
    } catch (error) {
      throw error;
    }
  },

  getMyComplaints: async () => {
    try {
      const userId = localStorage.getItem('userId') || 1;
      const complaints = await databaseService.getComplaintsByUserId(userId);
      return { data: complaints };
    } catch (error) {
      throw error;
    }
  },

  getAllComplaints: async () => {
    try {
      const complaints = await databaseService.getAllComplaints();
      return { data: complaints };
    } catch (error) {
      throw error;
    }
  }
};

export const faqAPI_JSON = {
  searchFAQs: async (keyword) => {
    try {
      const faqs = keyword 
        ? await databaseService.searchFAQs(keyword)
        : await databaseService.getAllFAQs();
      return { data: faqs };
    } catch (error) {
      throw error;
    }
  },

  getAllFAQs: async () => {
    try {
      const faqs = await databaseService.getAllFAQs();
      return { data: faqs };
    } catch (error) {
      throw error;
    }
  }
};

export const chatbotAPI_JSON = {
  sendMessage: async (message) => {
    try {
      const response = await databaseService.getChatbotResponse(message);
      return {
        data: {
          reply: response,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      throw error;
    }
  }
};

// ============================================
// APPROACH 2: Hybrid (JSON + Environment Variable)
// ============================================
// Best for: Gradual migration from JSON to real API

const USE_JSON_DB = process.env.REACT_APP_USE_JSON_DB === 'true';

export const authAPI_Hybrid = {
  login: async (email, password) => {
    if (USE_JSON_DB) {
      return authAPI_JSON.login(email, password);
    }
    // Real API call
    // return axios.post('/api/auth/login', { email, password });
  },

  register: async (name, email, password) => {
    if (USE_JSON_DB) {
      return authAPI_JSON.register(name, email, password);
    }
    // Real API call
    // return axios.post('/api/auth/register', { name, email, password });
  }
};

// ============================================
// APPROACH 3: Enhanced JSON with File Handling
// ============================================
// Handles file attachments better

export const complaintAPI_Enhanced = {
  submitComplaint: async (formData) => {
    try {
      const userId = localStorage.getItem('userId') || 1;
      
      // Extract file if present
      let attachmentPath = null;
      if (formData instanceof FormData && formData.get('attachment')) {
        const file = formData.get('attachment');
        // In JSON mode, just store the filename
        attachmentPath = `/attachments/${file.name}`;
      }

      const complaintData = {
        title: formData instanceof FormData ? formData.get('title') : formData.title,
        description: formData instanceof FormData ? formData.get('description') : formData.description,
        category: formData instanceof FormData ? formData.get('category') : formData.category,
        location: formData instanceof FormData ? formData.get('location') : formData.location,
        attachment: attachmentPath
      };

      const complaint = await databaseService.submitComplaint(complaintData, userId);
      return { data: complaint };
    } catch (error) {
      throw error;
    }
  },

  getMyComplaints: async () => {
    try {
      const userId = localStorage.getItem('userId') || 1;
      const complaints = await databaseService.getComplaintsByUserId(userId);
      return { data: complaints };
    } catch (error) {
      throw error;
    }
  }
};

// ============================================
// USAGE IN YOUR COMPONENTS
// ============================================

/*
// In Login.js
import { authAPI_JSON as authAPI } from '../services/api-json-integration';

const handleSubmit = async (e) => {
  try {
    const response = await authAPI.login(email, password);
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userId', response.data.user.id);
    // ... rest of your code
  } catch (error) {
    setError(error.message);
  }
};

// In ComplaintsPage.js
import { complaintAPI_Enhanced as complaintAPI } from '../services/api-json-integration';

const handleSubmit = async (e) => {
  const submitData = new FormData();
  submitData.append('title', formData.title);
  // ... append other fields
  
  const response = await complaintAPI.submitComplaint(submitData);
  // ... rest of your code
};

// In environment file (.env)
REACT_APP_USE_JSON_DB=true
*/

// ============================================
// SWITCH BETWEEN APPROACHES IN YOUR APP
// ============================================

export const getAPIService = () => {
  if (process.env.REACT_APP_USE_JSON_DB === 'true') {
    return {
      authAPI: authAPI_JSON,
      complaintAPI: complaintAPI_Enhanced,
      faqAPI: faqAPI_JSON,
      chatbotAPI: chatbotAPI_JSON
    };
  } else {
    // Return real API services
    return {
      // Your real API definitions
    };
  }
};

export default {
  authAPI: authAPI_JSON,
  complaintAPI: complaintAPI_Enhanced,
  faqAPI: faqAPI_JSON,
  chatbotAPI: chatbotAPI_JSON
};
