// Database utility — connects to Laravel + MySQL backend
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, 
});

// Auto-attach Sanctum token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const databaseService = {
  // ─── USER / AUTH ────────────────────────────────────────────────────────────

  // Tiada endpoint cari user by phone di frontend — guna authenticateUser sahaja
  async findUserByphoneNo(phoneNo) {
    // Endpoint ini hanya ada di admin, frontend tak perlu cari user by phone terus
    // Gantikan usage dengan authenticateUser atau findUserById
    console.warn("findUserByphoneNo: tiada endpoint — guna authenticateUser");
    return null;
  },

  async findUserById(id) {
    try {
      const res = await api.get(`/users/${id}`); // GET /users/{id} (auth:sanctum)
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  async authenticateUser(phoneNo, password) {
    try {
      const res = await api.post("/login", { phoneNo, password }); // POST /login
      if (res.data.token) localStorage.setItem("token", res.data.token);
      return res.data.user ?? res.data;
    } catch (err) {
      if (err.response?.status === 401) return null;
      throw err;
    }
  },

  async registerUser(userData) {
    try {
      const res = await api.post("/register", userData); // POST /register
      return res.data.user ?? res.data;
    } catch (err) {
      if (err.response?.status === 422) {
        throw new Error("Phone number already registered");
      }
      throw err;
    }
  },

  // OTP (untuk register / forgot password)
  async sendOtp(phoneNo) {
    const res = await api.post("/send-otp", { phoneNo }); // POST /send-otp
    return res.data;
  },

  async verifyOtp(phoneNo, otp) {
    const res = await api.post("/verify-otp", { phoneNo, otp }); // POST /verify-otp
    return res.data;
  },

  // ─── PROFILE ────────────────────────────────────────────────────────────────

  async getProfile() {
    const res = await api.get("/profile"); // GET /profile (auth:sanctum)
    return res.data;
  },

  async updateProfile(profileData) {
    const res = await api.put("/profile", profileData); // PUT /profile (auth:sanctum)
    return res.data;
  },

  async changePassword(passwordData) {
    const res = await api.post("/change-password", passwordData); // POST /change-password
    return res.data;
  },

  // ─── COMPLAINT (USER) ───────────────────────────────────────────────────────

  async getComplaintsByUserId() {
    // Laravel guna token untuk tahu user mana — tak perlu pass userId terus
    const res = await api.get("/complaints"); // GET /complaints
    return res.data;
  },

  async getComplaintById(id) {
    try {
      const res = await api.get(`/complaints/${id}`); // GET /complaints/{id}
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  async submitComplaint(complaintData) {
    const res = await api.post("/complaints", complaintData); // POST /complaints
    return res.data;
  },

  async searchComplaints(params) {
    const res = await api.get("/complaints/search", { params }); // GET /complaints/search
    return res.data;
  },

  async suggestComplaintCategory(description) {
    const res = await api.post("/complaints/suggest-category", { description }); // POST /complaints/suggest-category
    return res.data;
  },

  // ─── COMPLAINT (ADMIN) ──────────────────────────────────────────────────────

  async getAllComplaints(params) {
    const res = await api.get("/admin/complaints", { params }); // GET /admin/complaints
    return res.data;
  },

  async getComplaintByIdAdmin(id) {
    const res = await api.get(`/admin/complaints/${id}`); // GET /admin/complaints/{id}
    return res.data;
  },

  async updateComplaintStatus(complaintId, status) {
    try {
      const res = await api.patch(`/admin/complaints/${complaintId}/status`, {
        status,
      }); // PATCH /admin/complaints/{id}/status
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  async respondToComplaint(complaintId, responseData) {
    const res = await api.post(
      `/admin/complaints/${complaintId}/respond`,
      responseData,
    ); // POST /admin/complaints/{id}/respond
    return res.data;
  },

  // ─── COMPLAINT CATEGORIES ───────────────────────────────────────────────────

  async getActiveCategories() {
    const res = await api.get("/complaint-categories/active"); // GET /complaint-categories/active
    return res.data;
  },

  // ─── FAQ ────────────────────────────────────────────────────────────────────

  async getAllFAQs() {
    const res = await api.get("/faq"); // GET /faq
    return res.data;
  },

  async getFAQById(id) {
    const res = await api.get(`/faq/${id}`); // GET /faq/{id}
    return res.data;
  },

  async searchFAQs(keyword) {
    const res = await api.get("/faq/search", { params: { q: keyword } }); // GET /faq/search
    return res.data;
  },

  async getFAQCategories() {
    const res = await api.get("/faq-categories"); // GET /faq-categories
    return res.data;
  },

  // ─── CHATBOT ────────────────────────────────────────────────────────────────

  async getChatbotResponse(userMessage) {
    const res = await api.post("/chat", { message: userMessage }); // POST /chat
    return res.data.response ?? res.data;
  },

  // ─── CONVERSATIONS (REAL AGENT) ─────────────────────────────────────────────

  async createConversation(data) {
    const res = await api.post("/conversations", data); // POST /conversations
    return res.data;
  },

  async getConversations() {
    const res = await api.get("/conversations"); // GET /conversations
    return res.data;
  },

  async getConversationById(id) {
    const res = await api.get(`/conversations/${id}`); // GET /conversations/{id}
    return res.data;
  },

  async hasConversation(userId) {
    const res = await api.get(`/conversations/has/${userId}`); // GET /conversations/has/{userId}
    return res.data;
  },

  async sendMessage(messageData) {
    const res = await api.post("/messages", messageData); // POST /messages
    return res.data;
  },

  async getMessages(conversationId) {
    const res = await api.get(`/messages/${conversationId}`); // GET /messages/{conversationId}
    return res.data;
  },

  async markMessagesAsRead(conversationId) {
    const res = await api.patch(`/messages/${conversationId}/read`); // PATCH /messages/{conversationId}/read
    return res.data;
  },

  // ─── ANALYTICS (ADMIN) ──────────────────────────────────────────────────────

  async getStatistics() {
    const res = await api.get("/dashboard/stats"); // GET /dashboard/stats
    return res.data;
  },

  async getAnalyticsSummary() {
    const res = await api.get("/admin/analytics/summary"); // GET /admin/analytics/summary
    return res.data;
  },

  async generateAnalyticsReport(params) {
    const res = await api.get("/admin/analytics/generate", { params }); // GET /admin/analytics/generate
    return res.data;
  },

  async exportAnalyticsReport(data) {
    const res = await api.post("/admin/analytics/export", data); // POST /admin/analytics/export
    return res.data;
  },

  // ─── FORGOT PASSWORD ────────────────────────────────────────────────────────

  async forgotPasswordSendOtp(phoneNo) {
    const res = await api.post("/auth/forgot-password/send-otp", { phoneNo });
    return res.data;
  },

  async forgotPasswordReset(data) {
    const res = await api.post("/auth/forgot-password/reset", data);
    return res.data;
  },
};

export default databaseService;
