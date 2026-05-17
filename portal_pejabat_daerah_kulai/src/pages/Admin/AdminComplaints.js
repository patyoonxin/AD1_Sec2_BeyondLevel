import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, StatusBadge, Avatar, Btn, IconBtn,
  SearchBar, Tabs, DataTable, MetricCard,
} from '../../components/Admin/AdminUI';
import { complaintAPI } from '../../services/api';

/* UI status keys ('pending') -> backend display labels ('Pending') */
const UI_TO_DISPLAY = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

/* Build initials from a full name (e.g. "Ahmad bin Ibrahim" -> "AI") */
const initialsOf = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const EditIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
    <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);

const ReplyIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12v8H2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

function AdminComplaints() {
  const [tab, setTab]               = useState('all');
  const [search, setSearch]         = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Modals: 'respond' or 'status', plus the row being acted on
  const [modal, setModal]                 = useState(null);
  const [activeComplaint, setActive]      = useState(null);
  const [responseText, setResponseText]   = useState('');
  const [statusValue, setStatusValue]     = useState('pending');
  const [submitting, setSubmitting]       = useState(false);

  /* Load complaints from the Laravel backend */
  const loadComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await complaintAPI.getAllComplaints();
      setComplaints(res.data);
    } catch (e) {
      setError(e.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComplaints(); }, []);

  /* Build derived metrics + filtered rows */
  const metrics = useMemo(() => ({
    total:       complaints.length,
    pending:     complaints.filter((c) => c.status === 'pending').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved:    complaints.filter((c) => c.status === 'resolved').length,
    rejected:    complaints.filter((c) => c.status === 'rejected').length,
  }), [complaints]);

  const STATUS_TABS = [
    { key: 'all',         label: `All (${metrics.total})` },
    { key: 'pending',     label: `Pending (${metrics.pending})` },
    { key: 'in_progress', label: `In Progress (${metrics.in_progress})` },
    { key: 'resolved',    label: `Resolved (${metrics.resolved})` },
    { key: 'rejected',    label: `Rejected (${metrics.rejected})` },
  ];

  /* Client-side filter combining tab + search across multiple fields */
  const filtered = complaints.filter((c) => {
    const matchTab = tab === 'all' || c.status === tab;
    const term = search.toLowerCase();
    const matchSearch = !term || [
      c.title, c.description, c.category, c.ai_category,
      c.location, c.record_id, c.user?.name,
    ].some((field) => (field || '').toLowerCase().includes(term));
    return matchTab && matchSearch;
  });

  /* Open the response modal for a given complaint */
  const openRespond = (row) => {
    setActive(row);
    setResponseText(row.admin_response || '');
    setModal('respond');
  };

  /* Open the status update modal */
  const openStatus = (row) => {
    setActive(row);
    setStatusValue(row.status || 'pending');
    setModal('status');
  };

  const closeModal = () => {
    setModal(null);
    setActive(null);
    setResponseText('');
    setSubmitting(false);
  };

  /* Submit admin response */
  const submitResponse = async () => {
    if (!responseText.trim() || responseText.trim().length < 5) {
      alert('Response must be at least 5 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await complaintAPI.respondToComplaint(activeComplaint.id, responseText.trim());
      await loadComplaints();
      closeModal();
    } catch (e) {
      alert(e.message || 'Failed to submit response');
      setSubmitting(false);
    }
  };

  /* Submit status update */
  const submitStatus = async () => {
    setSubmitting(true);
    try {
      await complaintAPI.updateComplaintStatus(activeComplaint.id, statusValue);
      await loadComplaints();
      closeModal();
    } catch (e) {
      alert(e.message || 'Failed to update status');
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'record_id', label: 'ID',
      render: (v) => <span style={{ color: '#aaa89e', fontSize: 11 }}>{v}</span>,
    },
    {
      key: 'title', label: 'Title',
      render: (v) => (
        <span style={{
          fontWeight: 500, color: '#1a1a1a', display: 'block',
          maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{v}</span>
      ),
    },
    {
      key: 'category', label: 'Category',
      render: (v) => <span style={{ color: '#555450' }}>{v}</span>,
    },
    {
      key: 'user', label: 'Submitted by',
      render: (u) => {
        const name = u?.name || 'Unknown';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar initials={initialsOf(name)} size={26} />
            <span>{name}</span>
          </div>
        );
      },
    },
    {
      key: 'created_at', label: 'Date',
      render: (v) => (
        <span style={{ color: '#888780' }}>
          {v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
        </span>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (v) => <StatusBadge status={UI_TO_DISPLAY[v] || v} />,
    },
    {
      key: '_actions', label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <IconBtn title="Respond to complaint" onClick={() => openRespond(row)}><ReplyIcon /></IconBtn>
          <IconBtn title="Update status" onClick={() => openStatus(row)}><EditIcon /></IconBtn>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 20 }}>
        <MetricCard label="Total"       value={metrics.total} />
        <MetricCard label="Pending"     value={metrics.pending}     subColor="down" />
        <MetricCard label="In Progress" value={metrics.in_progress} />
        <MetricCard label="Resolved"    value={metrics.resolved}    subColor="up" />
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Tabs tabs={STATUS_TABS} active={tab} onChange={setTab} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Btn small onClick={loadComplaints}>🔄 Refresh</Btn>
          </div>
        </div>

        <SearchBar
          placeholder="Search by title, description, category, user, location, or record ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#888780' }}>Loading complaints...</div>
        ) : error ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#a32d2d' }}>{error}</div>
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, fontSize: 11, color: '#888780' }}>
          <span>Showing {filtered.length} of {metrics.total} complaints</span>
        </div>
      </Card>

      {/* ── Respond Modal ───────────────────────────────────────────── */}
      {modal === 'respond' && activeComplaint && (
        <ModalOverlay onClose={closeModal}>
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16, fontWeight: 600 }}>Respond to Complaint</h3>
          <p style={{ margin: 0, marginBottom: 14, fontSize: 12, color: '#888780' }}>
            <strong>{activeComplaint.record_id}</strong> — {activeComplaint.title}
          </p>
          <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>
            Official Response
          </label>
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            rows={6}
            placeholder="Type your response to the complainant here..."
            style={{
              width: '100%', padding: 10, fontSize: 13,
              border: '1px solid #d3d1c7', borderRadius: 7,
              fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
            <Btn small onClick={closeModal}>Cancel</Btn>
            <Btn small primary onClick={submitResponse}>
              {submitting ? 'Submitting...' : 'Submit Response'}
            </Btn>
          </div>
        </ModalOverlay>
      )}

      {/* ── Status Update Modal ──────────────────────────────────────── */}
      {modal === 'status' && activeComplaint && (
        <ModalOverlay onClose={closeModal}>
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16, fontWeight: 600 }}>Update Complaint Status</h3>
          <p style={{ margin: 0, marginBottom: 14, fontSize: 12, color: '#888780' }}>
            <strong>{activeComplaint.record_id}</strong> — {activeComplaint.title}
          </p>
          <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>
            New Status
          </label>
          <select
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value)}
            style={{
              width: '100%', padding: '9px 10px', fontSize: 13,
              border: '1px solid #d3d1c7', borderRadius: 7,
              background: '#fff', boxSizing: 'border-box',
            }}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
            <Btn small onClick={closeModal}>Cancel</Btn>
            <Btn small primary onClick={submitStatus}>
              {submitting ? 'Updating...' : 'Update Status'}
            </Btn>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

/* ── Reusable modal overlay ───────────────────────────────────────── */
function ModalOverlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 12, padding: 22,
          width: '100%', maxWidth: 520,
          boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default AdminComplaints;
