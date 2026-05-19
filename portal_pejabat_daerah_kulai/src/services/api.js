/**
 * API Service - JSON Database Version
 * Using temporary JSON database for development
 * Later, replace with real backend API calls
 */

import databaseService from '../data/databaseService';
import axios from "axios";


// ============================================
// AUTH ENDPOINTS (JSON Database)
// ============================================
export const authAPI = {
  login: async (phoneNo, password) => {
    return axios.post("http://127.0.0.1:8000/api/login", {
      phone_number: phoneNo,
      password: password
    });
  },

   register: async (name, phoneNo, password, password_confirmation) => {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/register",
      {
        name: name,
        phone_number: phoneNo,
        password: password,
        password_confirmation: password_confirmation
      }
    );

    return response;
  },

  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    return { data: { message: 'Logout successful' } };
  },

  getProfile: async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Not authenticated');
    }
    const user = await databaseService.findUserById(parseInt(userId));
    return { data: user };
  },

  updateProfile: async (userData) => {
    // For JSON DB, just return updated data (not persisted)
    return { data: userData };
  },

  changePassword: async (data) => {
    // For JSON DB, just acknowledge (not persisted)
    return { data: { message: 'Password changed successfully' } };
  }
};

// ============================================
// COMPLAINT ENDPOINTS (JSON Database)
// ============================================
export const complaintAPI = {
  submitComplaint: async (formData) => {
    try {
      const userId = localStorage.getItem('userId') || 1;
      
      // Extract files from FormData if present
      let attachmentPath = null;
      if (formData instanceof FormData && formData.get('attachment')) {
        const file = formData.get('attachment');
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
      const complaints = await databaseService.getComplaintsByUserId(parseInt(userId));
      return { data: complaints };
    } catch (error) {
      throw error;
    }
  },

  getComplaintStatus: async (complaintId) => {
    try {
      const complaint = await databaseService.getComplaintById(complaintId);
      return { data: complaint };
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
  },

  respondToComplaint: async (complaintId, response) => {
    // For JSON DB, just acknowledge
    return { data: { message: 'Response submitted' } };
  },

  updateComplaintStatus: async (complaintId, status) => {
    try {
      const complaint = await databaseService.updateComplaintStatus(complaintId, status);
      return { data: complaint };
    } catch (error) {
      throw error;
    }
  }
};

// ============================================
// CHATBOT ENDPOINTS (JSON Database)
// ============================================
// export const chatbotAPI = {
  // sendMessage: async (message) => {
  //   try {
  //     const response = await databaseService.getChatbotResponse(message);
  //     return {
  //       data: {
  //         reply: response,
  //         timestamp: new Date().toISOString()
  //       }
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // },
export const chatbotAPI = {
  sendMessage: async (message) => {
    try {
      console.log("📤 Sending to backend:", message);

      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      console.log("📥 Backend response:", data);

      return {
        data: {
          reply: data.reply,
          source: data.source,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error("❌ Chatbot API error:", error);
      throw error;
    }
  },

  getChatHistory: async () => {
    return { data: [] };
  }
};

// ============================================
// FAQ ENDPOINTS (JSON Database)
// ============================================
export const faqAPI = {
  getAllFAQs: async () => {
    try {
      const faqs = await databaseService.getAllFAQs();
      return { data: faqs };
    } catch (error) {
      throw error;
    }
  },

  searchFAQs: async (query) => {
    try {
      const faqs = query 
        ? await databaseService.searchFAQs(query)
        : await databaseService.getAllFAQs();
      return { data: faqs };
    } catch (error) {
      throw error;
    }
  },

  addFAQ: async (faqData) => {
    return { data: { message: 'FAQ added' } };
  },

  updateFAQ: async (faqId, faqData) => {
    return { data: { message: 'FAQ updated' } };
  },

  deleteFAQ: async (faqId) => {
    return { data: { message: 'FAQ deleted' } };
  }
};

// ============================================
// ANALYTICS ENDPOINTS (JSON Database)
// ============================================
export const analyticsAPI = {
  getChatAnalytics: async () => {
    return { data: { message: 'Chat analytics' } };
  },

  getComplaintAnalytics: async () => {
    return { data: { message: 'Complaint analytics' } };
  },

  generateReport: async (filters) => {
    return { data: { message: 'Report generated' } };
  }
};

// ============================================
// REAL AGENT CHAT ENDPOINTS (JSON Database)
// ============================================
export const chatAPI = {
  // create or get conversation
  createConversation: async (userId) => {
    const res = await fetch("http://127.0.0.1:8000/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    });

    return res.json();
  },

  // send message
  sendMessage: async (conversationId, senderId, message) => {
    const res = await fetch("http://127.0.0.1:8000/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_id: senderId,
        message: message,
      }),
    });

    return res.json();
  },

  // get messages
  getMessages: async (conversationId) => {
    const res = await fetch(
      `http://127.0.0.1:8000/api/messages/${conversationId}`
    );

    return res.json();
  },
};

// ============================================
// ADMIN REAL AGENT CHAT ENDPOINTS (JSON Database)
// ============================================
export const adminChatAPI = {
  // get all conversations
  getConversations: async () => {
    const res = await fetch("http://127.0.0.1:8000/api/conversations");
    return res.json();
  },

  // get messages
  getMessages: async (conversationId) => {
    const res = await fetch(
      `http://127.0.0.1:8000/api/messages/${conversationId}`
    );
    return res.json();
  },

  // send message
  sendMessage: async (conversationId, senderId, message) => {
    const res = await fetch("http://127.0.0.1:8000/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_id: senderId,
        message,
      }),
    });

    return res.json();
  },
};