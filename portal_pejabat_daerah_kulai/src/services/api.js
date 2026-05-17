/**
 * API Service - JSON Database Version
 * Using temporary JSON database for development
 * Later, replace with real backend API calls
 */

import databaseService from '../data/databaseService';

// ============================================
// AUTH ENDPOINTS (JSON Database)
// ============================================
export const authAPI = {
  login: async (phoneNo, password) => {
    try {
      const user = await databaseService.authenticateUser(phoneNo, password);
      if (!user) {
        throw new Error('Invalid phone number or password');
      }
      const token = databaseService.generateMockToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', user.id);
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

  register: async (name, phoneNo, password) => {
    try {
      const user = await databaseService.registerUser({
        name,
        phoneNo,
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
// COMPLAINT ENDPOINTS (Laravel Backend API)
// ============================================
// Base URL for the Laravel API server
const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Normalize a complaint row from the backend into the shape the UI expects.
 * Backend status values are capitalized ('Pending', 'In Progress', 'Resolved',
 * 'Rejected'); the UI uses lowercase keys ('pending', 'in_progress', 'resolved').
 */
const normalizeComplaint = (c) => {
  const statusMap = {
    'Pending': 'pending',
    'In Progress': 'in_progress',
    'Resolved': 'resolved',
    'Rejected': 'rejected',
  };

  // attachments column is JSON array of URLs; expose the first one as `attachment`
  const attachments = Array.isArray(c.attachments) ? c.attachments : [];
  const firstAttachment = attachments[0] || null;
  const attachmentUrl = firstAttachment
    ? (firstAttachment.startsWith('http') ? firstAttachment : `http://127.0.0.1:8000${firstAttachment}`)
    : null;

  return {
    ...c,
    status: statusMap[c.status] || c.status,
    attachment: attachmentUrl,
    handler: c.handler || null,
    conclusion: c.admin_response || null,
  };
};

export const complaintAPI = {
  /**
   * Submit a new complaint to the Laravel backend.
   * Sends multipart/form-data so the file attachment is uploaded.
   */
  submitComplaint: async (formData) => {
    const userId = localStorage.getItem('userId') || 1;

    // Ensure user_id is appended to the FormData
    const payload = formData instanceof FormData ? formData : new FormData();
    if (!(formData instanceof FormData)) {
      Object.entries(formData || {}).forEach(([k, v]) => {
        if (v !== null && v !== undefined) payload.append(k, v);
      });
    }
    payload.append('user_id', userId);

    const res = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      body: payload, // do NOT set Content-Type; browser sets multipart boundary
      headers: { Accept: 'application/json' },
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = data?.message || 'Failed to submit complaint';
      throw new Error(msg);
    }

    return { data: normalizeComplaint(data.complaint || data) };
  },

  /**
   * Fetch the current user's complaints from the database.
   */
  getMyComplaints: async () => {
    const userId = localStorage.getItem('userId') || 1;
    const res = await fetch(`${API_BASE_URL}/complaints?user_id=${userId}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to load complaints');
    return { data: (data || []).map(normalizeComplaint) };
  },

  /**
   * Fetch a specific complaint by ID.
   */
  getComplaintStatus: async (complaintId) => {
    const userId = localStorage.getItem('userId') || 1;
    const res = await fetch(`${API_BASE_URL}/complaints/${complaintId}?user_id=${userId}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to load complaint');
    return { data: normalizeComplaint(data) };
  },

  /**
   * Search the current user's complaints with filters.
   * Accepts an object with { q, status, category }.
   * Status filter uses UI keys ('pending', 'in_progress', etc.) and is
   * automatically mapped to the backend's capitalized enum.
   */
  searchMyComplaints: async (filters = {}) => {
    const userId = localStorage.getItem('userId') || 1;
    const statusMap = {
      pending: 'Pending',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      rejected: 'Rejected',
    };

    const params = new URLSearchParams({ user_id: userId });
    if (filters.q) params.append('q', filters.q);
    if (filters.status) params.append('status', statusMap[filters.status] || filters.status);
    if (filters.category) params.append('category', filters.category);

    const res = await fetch(`${API_BASE_URL}/complaints/search?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Search failed');
    return { data: (data || []).map(normalizeComplaint) };
  },

  /**
   * Admin: search across all complaints in the system.
   * Accepts { q, status, category, user_name }.
   */
  searchAllComplaints: async (filters = {}) => {
    const statusMap = {
      pending: 'Pending',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      rejected: 'Rejected',
    };

    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.status) params.append('status', statusMap[filters.status] || filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.user_name) params.append('user_name', filters.user_name);

    const res = await fetch(`${API_BASE_URL}/admin/complaints/search?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Search failed');
    return { data: (data || []).map(normalizeComplaint) };
  },

  /**
   * Admin: fetch every complaint in the system.
   */
  getAllComplaints: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/complaints`, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to load complaints');
    // Backend admin index returns a paginator
    const rows = Array.isArray(data) ? data : (data.data || []);
    return { data: rows.map(normalizeComplaint) };
  },

  /**
   * Admin: submit a response to a specific complaint.
   */
  respondToComplaint: async (complaintId, response) => {
    const res = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ admin_response: response }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to submit response');
    return { data };
  },

  /**
   * Admin: update the status of a complaint.
   * Accepts UI status keys ('pending', 'in_progress', 'resolved', 'rejected')
   * and maps them to the backend's enum values.
   */
  updateComplaintStatus: async (complaintId, status) => {
    const statusMap = {
      pending: 'Pending',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      rejected: 'Rejected',
    };
    const mapped = statusMap[status] || status;

    const res = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ status: mapped }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to update status');
    return { data: normalizeComplaint(data.complaint || data) };
  },
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