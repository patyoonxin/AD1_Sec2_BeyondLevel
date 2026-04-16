// Database utility to work with JSON data
import db from './db.json';

// Simulated delay for realistic API behavior
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const databaseService = {
  // USER OPERATIONS
  async findUserByEmail(email) {
    await delay(200);
    return db.users.find(user => user.email === email) || null;
  },

  async findUserById(id) {
    await delay(200);
    return db.users.find(user => user.id === id) || null;
  },

  async authenticateUser(email, password) {
    await delay(300);
    const user = db.users.find(user => user.email === email && user.password === password);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },

  async registerUser(userData) {
    await delay(300);
    const existingUser = db.users.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: Math.max(...db.users.map(u => u.id)) + 1,
      ...userData,
      created_at: new Date().toISOString(),
      role: 'user'
    };

    db.users.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  // COMPLAINT OPERATIONS
  async getComplaintsByUserId(userId) {
    await delay(200);
    return db.complaints.filter(complaint => complaint.user_id === userId);
  },

  async getAllComplaints() {
    await delay(200);
    return db.complaints;
  },

  async getComplaintById(id) {
    await delay(200);
    return db.complaints.find(complaint => complaint.id === id) || null;
  },

  async submitComplaint(complaintData, userId) {
    await delay(400);
    const newComplaint = {
      id: Math.max(...db.complaints.map(c => c.id), 0) + 1,
      user_id: userId,
      ...complaintData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.complaints.push(newComplaint);
    return newComplaint;
  },

  async updateComplaintStatus(complaintId, status) {
    await delay(300);
    const complaint = db.complaints.find(c => c.id === complaintId);
    if (complaint) {
      complaint.status = status;
      complaint.updated_at = new Date().toISOString();
      return complaint;
    }
    return null;
  },

  // FAQ OPERATIONS
  async getAllFAQs() {
    await delay(200);
    return db.faqs;
  },

  async searchFAQs(keyword) {
    await delay(300);
    const lowerKeyword = keyword.toLowerCase();
    return db.faqs.filter(faq =>
      faq.question.toLowerCase().includes(lowerKeyword) ||
      faq.answer.toLowerCase().includes(lowerKeyword)
    );
  },

  // CHATBOT OPERATIONS
  async getChatbotResponse(userMessage) {
    await delay(500);
    // Simple rule-based responses
    const message = userMessage.toLowerCase();

    const responses = {
      aduan: "Untuk mengajukan aduan, silahkan ikuti langkah-langkah berikut:\n1. Masuk ke akun Anda\n2. Klik menu 'Aduan'\n3. Klik tombol 'Aduan Baru'\n4. Isi formulir dengan detail lengkap\n5. Klik 'Hantar Aduan'",
      lama: "Waktu pemrosesan tergantung jenis aduan. Aduan rutin biasanya diproses dalam 5-7 hari kerja. Anda dapat memantau status aduan Anda secara real-time melalui portal.",
      akun: "Ya, Anda perlu membuat akun untuk mengajukan aduan dan menggunakan semua fitur portal. Pendaftaran gratis dan cepat.",
      kategori: "Kategori aduan yang tersedia adalah: Infrastruktur, Kebajikan Awam, Lesen, Kebersihan, dan Komunitas.",
      password: "Klik tautan 'Lupa Kata Sandi?' di halaman masuk. Kami akan mengirimkan instruksi ke email Anda.",
      lampir: "Ya, Anda dapat melampirkan dokumen dengan ukuran maksimal 5MB. Format yang didukung: PDF, JPG, PNG, DOCX.",
      hubung: "Hubungi kami melalui:\nEmail: support@kulai.gov.my\nTelepon: +60-7-1234-5678\nJam: Senin-Jumat, 08:00-17:00"
    };

    for (const [keyword, response] of Object.entries(responses)) {
      if (message.includes(keyword)) {
        return response;
      }
    }

    return "Maaf, saya tidak dapat memahami pertanyaan Anda. Silakan hubungi tim support kami di support@kulai.gov.my untuk bantuan lebih lanjut.";
  },

  // STATISTICS
  async getStatistics() {
    await delay(200);
    return db.statistics;
  },

  // HELPER: Get mock token
  generateMockToken() {
    return 'mock_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
};

export default databaseService;
