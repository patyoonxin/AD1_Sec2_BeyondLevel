import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  SectionHeader,
  StatusBadge,
  Badge,
  Btn,
  IconBtn,
  SearchBar,
  MetricCard,
  DataTable,
} from "../../components/Admin/AdminUI";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const CATEGORY_BADGE = {
  Complaints: "info",
  General: "gray",
  Licensing: "warning",
  Waste: "info",
  Welfare: "purple",
};

const EditIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
    <path
      d="M11 2l3 3-8 8H3v-3l8-8z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);
const TrashIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
    <rect
      x="3"
      y="5"
      width="10"
      height="8"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path
      d="M6 5V3h4v2M1 5h14"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

// ── Modal: Add / Edit FAQ ─────────────────────────────────────
function FAQModal({ faq, onClose, onSave }) {
  const isEdit = !!faq;
  const [form, setForm] = useState({
    question_eng: faq?.question_eng || "",
    answer_eng: faq?.answer_eng || "",
    question_malay: faq?.question_malay || "",
    answer_malay: faq?.answer_malay || "",
    keywords: faq?.keywords || "",
    category: faq?.category || "General",
    status: faq?.status || "published",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.question_eng || !form.answer_eng) {
      setError("Question (English) and Answer (English) are required.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      const url = isEdit
        ? `${API}/admin/faq/${faq.faq_id}`
        : `${API}/admin/faq`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to save FAQ");

      onSave();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    fontSize: 12,
    border: "1px solid #eceae4",
    borderRadius: 7,
    outline: "none",
    background: "#f8f7f4",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 600,
    color: "#555450",
    display: "block",
    marginBottom: 4,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 28,
          width: 580,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
            {isEdit ? "Edit FAQ" : "Add New FAQ"}
          </h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 18,
              color: "#888",
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#fcebeb",
              color: "#a32d2d",
              padding: "8px 12px",
              borderRadius: 7,
              fontSize: 12,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <label style={labelStyle}>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={inputStyle}
            >
              {[
                "General",
                "Complaints",
                "Licensing",
                "Waste",
                "Welfare",
                "Infrastructure",
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Question (English) *</label>
          <input
            name="question_eng"
            value={form.question_eng}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Enter question in English"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Answer (English) *</label>
          <textarea
            name="answer_eng"
            value={form.answer_eng}
            onChange={handleChange}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Enter answer in English"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Question (Malay)</label>
          <input
            name="question_malay"
            value={form.question_malay}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Masukkan soalan dalam Bahasa Melayu"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Answer (Malay)</label>
          <textarea
            name="answer_malay"
            value={form.answer_malay}
            onChange={handleChange}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Masukkan jawapan dalam Bahasa Melayu"
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Keywords (comma separated)</label>
          <input
            name="keywords"
            value={form.keywords}
            onChange={handleChange}
            style={inputStyle}
            placeholder="e.g. aduan, complaint, jalan"
          />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn small onClick={onClose}>
            Cancel
          </Btn>
          <Btn small primary onClick={handleSubmit}>
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add FAQ"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── Modal: Delete Confirm ─────────────────────────────────────
function DeleteModal({ faq, onClose, onConfirm, deleting }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 28,
          width: 380,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
          Delete FAQ?
        </h3>
        <p style={{ fontSize: 12, color: "#888780", marginBottom: 20 }}>
          Are you sure you want to delete this FAQ? This action cannot be
          undone.
        </p>
        <div
          style={{
            background: "#f8f7f4",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            color: "#333",
            marginBottom: 20,
            textAlign: "left",
          }}
        >
          {faq?.question_eng}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <Btn small onClick={onClose}>
            Cancel
          </Btn>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              padding: "5px 16px",
              fontSize: 11,
              borderRadius: 7,
              border: "none",
              background: "#a32d2d",
              color: "#fff",
              cursor: deleting ? "not-allowed" : "pointer",
              fontWeight: 600,
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main: AdminFAQ ────────────────────────────────────────────
function AdminFAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    views: 0,
  });

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [editFaq, setEditFaq] = useState(null);
  const [deleteFaq, setDeleteFaq] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch all FAQs from API ───────────────────────────────
  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API}/admin/faq`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Unable to retrieve FAQ list");

      const list = data.data || [];
      setFaqs(list);

      // Calculate stats
      const published = list.filter((f) => f.status === "published").length;
      const draft = list.filter((f) => f.status === "draft").length;
      const totalViews = list.reduce((sum, f) => sum + (f.views || 0), 0);
      setStats({ total: list.length, published, draft, views: totalViews });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  // ── Delete FAQ ────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API}/admin/faq/${deleteFaq.faq_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unable to process FAQ request");
      setDeleteFaq(null);
      fetchFAQs();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── Filter ────────────────────────────────────────────────
  const filtered = faqs.filter((f) => {
    const q = (f.question_eng || "").toLowerCase();
    const c = (f.category || "").toLowerCase();
    const s = search.toLowerCase();
    const matchSearch = q.includes(s) || c.includes(s);
    const matchStatus = statusFilter === "all" || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Table columns ─────────────────────────────────────────
  const columns = [
    {
      key: "question_eng",
      label: "Question",
      render: (v) => (
        <span
          style={{
            color: "#1a1a1a",
            display: "block",
            maxWidth: 300,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {v}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (v) => (
        <Badge variant={CATEGORY_BADGE[v] || "gray"}>{v || "General"}</Badge>
      ),
    },
    {
      key: "views",
      label: "Views",
      render: (v) => (
        <span style={{ fontWeight: 500, color: "#555" }}>
          {(v || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => (
        <StatusBadge status={v === "published" ? "Published" : "Draft"} />
      ),
    },
    {
      key: "updated_at",
      label: "Last updated",
      render: (v) => (
        <span style={{ color: "#888780" }}>
          {v ? new Date(v).toLocaleDateString("en-MY") : "-"}
        </span>
      ),
    },
    {
      key: "_actions",
      label: "Actions",
      render: (_, row) => (
        <div style={{ display: "flex", gap: 6 }}>
          <IconBtn title="Edit FAQ" onClick={() => setEditFaq(row)}>
            <EditIcon />
          </IconBtn>
          <IconBtn title="Delete FAQ" danger onClick={() => setDeleteFaq(row)}>
            <TrashIcon />
          </IconBtn>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Metrics — from real API */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <MetricCard
          label="Total FAQs"
          value={loading ? "..." : stats.total.toString()}
        />
        <MetricCard
          label="Published"
          value={loading ? "..." : stats.published.toString()}
          subColor="up"
        />
        <MetricCard
          label="Draft"
          value={loading ? "..." : stats.draft.toString()}
          subColor="down"
        />
        <MetricCard
          label="Total Views"
          value={loading ? "..." : stats.views.toLocaleString()}
        />
      </div>

      <Card>
        <SectionHeader
          title="FAQ entries"
          right={
            <>
              {["all", "published", "draft"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: "4px 11px",
                    fontSize: 11,
                    borderRadius: 20,
                    border: "1px solid #eceae4",
                    background: statusFilter === s ? "#1a4fa0" : "#f1efe8",
                    color: statusFilter === s ? "#c8ddf5" : "#555",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
              <Btn small onClick={fetchFAQs}>
                ↻ Refresh
              </Btn>
              <Btn small primary onClick={() => setShowAdd(true)}>
                + Add FAQ
              </Btn>
            </>
          }
        />

        {/* Error message */}
        {error && (
          <div
            style={{
              background: "#fcebeb",
              color: "#a32d2d",
              padding: "8px 12px",
              borderRadius: 7,
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        <SearchBar
          placeholder="Search FAQ by keyword or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Loading state */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#888780",
              fontSize: 13,
            }}
          >
            Loading FAQ data...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#888780",
              fontSize: 13,
            }}
          >
            {search
              ? "No matching FAQ found."
              : "No FAQ information available."}
          </div>
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 14,
            fontSize: 11,
            color: "#888780",
          }}
        >
          <span>
            Showing {filtered.length} of {stats.total} FAQs
          </span>
        </div>
      </Card>

      {/* Add Modal */}
      {showAdd && (
        <FAQModal
          onClose={() => setShowAdd(false)}
          onSave={() => {
            setShowAdd(false);
            fetchFAQs();
          }}
        />
      )}

      {/* Edit Modal */}
      {editFaq && (
        <FAQModal
          faq={editFaq}
          onClose={() => setEditFaq(null)}
          onSave={() => {
            setEditFaq(null);
            fetchFAQs();
          }}
        />
      )}

      {/* Delete Modal */}
      {deleteFaq && (
        <DeleteModal
          faq={deleteFaq}
          deleting={deleting}
          onClose={() => setDeleteFaq(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default AdminFAQ;
