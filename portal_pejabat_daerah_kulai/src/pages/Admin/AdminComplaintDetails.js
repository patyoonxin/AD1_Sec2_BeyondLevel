import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Btn, Avatar } from '../../components/Admin/AdminUI';
import { complaintAPI } from '../../services/api';
import { useTranslation } from '../../lang/i18n';

/* Color palette for the inline status select (matches list view) */
const STATUS_COLORS = {
  pending:     { bg: '#faeeda', fg: '#854f0b', border: '#e9d3a8' },
  in_progress: { bg: '#e8f0fb', fg: '#1a4fa0', border: '#c1d4ee' },
  resolved:    { bg: '#eaf3de', fg: '#3b6d11', border: '#c7dfaa' },
  rejected:    { bg: '#fcebeb', fg: '#a32d2d', border: '#eecaca' },
};

const initialsOf = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Full-page details view for a single complaint, accessible to admins.
 * Shows the full complaint metadata, the chronological response thread,
 * an inline status selector, and a form to append a new response.
 */
function AdminComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [newResponse, setNewResponse]   = useState('');
  const [responseError, setResponseError] = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  /* Pull the complaint (with full response thread) from the backend */
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await complaintAPI.getComplaintByIdAdmin(id);
      setComplaint(res.data);
    } catch (e) {
      setError(e.message || 'Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  /* Append a new admin response */
  const submitResponse = async () => {
    const trimmed = newResponse.trim();
    if (!trimmed) {
      setResponseError(t('response_empty', 'Response cannot be empty'));
      return;
    }
    setResponseError('');
    setSubmitting(true);
    try {
      await complaintAPI.respondToComplaint(complaint.id, trimmed);
      setNewResponse('');
      await load();
    } catch (e) {
      setResponseError(t('response_submit_error', 'Failed to send response. Please try again later.'));
    } finally {
      setSubmitting(false);
    }
  };

  /* Inline status update */
  const handleStatusChange = async (newStatus) => {
    if (!complaint || newStatus === complaint.status) return;
    setStatusUpdating(true);
    try {
      await complaintAPI.updateComplaintStatus(complaint.id, newStatus);
      await load();
    } catch (e) {
      alert(e.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  /* ── Renders ────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#888780' }}>
        {t('loading', 'Loading...')}
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div>
        <BackButton onClick={() => navigate('/admin/complaints')} label={t('back_to_complaints', 'Back to Complaints')} />
        <Card>
          <p style={{ color: '#a32d2d' }}>{error || t('complaint_not_found', 'Complaint not found.')}</p>
        </Card>
      </div>
    );
  }

  const palette = STATUS_COLORS[complaint.status] || STATUS_COLORS.pending;
  const submitter = complaint.user || {};
  const responses = Array.isArray(complaint.responses) ? complaint.responses : [];

  return (
    <div>
      <BackButton onClick={() => navigate('/admin/complaints')} label={t('back_to_complaints', 'Back to Complaints')} />

      {/* ── Header card ─────────────────────────────────────────── */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#aaa89e', marginBottom: 4 }}>
              {t('record_id', 'Record ID')}: {complaint.record_id}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, color: '#1a1a1a' }}>
              {complaint.title}
            </h1>
            <p style={{ fontSize: 12, color: '#888780', marginTop: 6 }}>
              {t('submitted_at', 'Submitted at')}: {new Date(complaint.created_at).toLocaleString()}
            </p>
          </div>

          {/* Inline status dropdown */}
          <select
            value={complaint.status}
            disabled={statusUpdating}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{
              fontSize: 12, fontWeight: 600,
              padding: '6px 28px 6px 12px',
              borderRadius: 12,
              background: palette.bg, color: palette.fg,
              border: `1px solid ${palette.border}`,
              cursor: statusUpdating ? 'wait' : 'pointer',
              appearance: 'none', WebkitAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 20 20' fill='none'><path d='M5 7l5 5 5-5' stroke='${encodeURIComponent(palette.fg)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            <option value="pending"     disabled={complaint.status === 'pending'}     style={{ background: '#fff', color: complaint.status === 'pending'     ? '#aaa' : '#1a1a1a' }}>{t('pending', 'Pending')}</option>
            <option value="in_progress" disabled={complaint.status === 'in_progress'} style={{ background: '#fff', color: complaint.status === 'in_progress' ? '#aaa' : '#1a1a1a' }}>{t('in_progress', 'In Progress')}</option>
            <option value="resolved"    disabled={complaint.status === 'resolved'}    style={{ background: '#fff', color: complaint.status === 'resolved'    ? '#aaa' : '#1a1a1a' }}>{t('resolved', 'Resolved')}</option>
            <option value="rejected"    disabled={complaint.status === 'rejected'}    style={{ background: '#fff', color: complaint.status === 'rejected'    ? '#aaa' : '#1a1a1a' }}>{t('rejected', 'Rejected')}</option>
          </select>
        </div>
      </Card>

      <div
        // Responsive: two-column on wide screens, stacks on narrow viewports.
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {/* ── Left column: description, location, attachment, thread ─────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

          {/* Description */}
          <Card>
            <SectionTitle>{t('description', 'Description')}</SectionTitle>
            <p style={{ margin: 0, color: '#333', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {complaint.description}
            </p>
          </Card>

          {/* Location — moved from sidebar to left column for better balance */}
          <Card>
            <SectionTitle>{t('location', 'Location')}</SectionTitle>
            <p style={{ margin: 0, fontSize: 13, color: '#333', lineHeight: 1.5 }}>
              {complaint.location || '-'}
            </p>
          </Card>

          {/* Attachment */}
          {complaint.attachment && (
            <Card>
              <SectionTitle>{t('attachment', 'Attachment')}</SectionTitle>
              {/\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i.test(complaint.attachment) ? (
                <img
                  src={complaint.attachment}
                  alt={t('attachment', 'Attachment')}
                  onClick={() => window.open(complaint.attachment, '_blank', 'noopener,noreferrer')}
                  style={{
                    maxHeight: 200, maxWidth: '100%', display: 'block',
                    borderRadius: 8, border: '1px solid #eceae4',
                    cursor: 'pointer', transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                />
              ) : (
                <a
                  href={complaint.attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, color: '#1a4fa0', fontWeight: 500 }}
                >
                  {t('view_attachment', 'View Attachment')}
                </a>
              )}
            </Card>
          )}

          {/* Response thread */}
          <Card>
            <SectionTitle>
              {t('response_thread', 'Response Thread')} {responses.length > 0 && `(${responses.length})`}
            </SectionTitle>

            {responses.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: '#888780', fontStyle: 'italic' }}>
                {t('no_responses_hint', 'No responses yet.')}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {responses.map((r) => {
                  const adminName = r.admin?.name || 'Admin';
                  return (
                    <div
                      key={r.id}
                      style={{
                        background: '#f8f7f4',
                        border: '1px solid #eceae4',
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar initials={initialsOf(adminName)} size={26} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>
                            {adminName}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: '#888780' }}>
                          {new Date(r.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: '#333', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                        {r.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* New response form */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #eceae4' }}>
              <SectionTitle>{t('add_response', 'Add a Response')}</SectionTitle>
              <textarea
                value={newResponse}
                onChange={(e) => { setNewResponse(e.target.value); if (e.target.value.trim()) setResponseError(''); }}
                rows={4}
                placeholder={t('placeholder_response', 'Type your response...')}
                style={{
                  width: '100%', padding: 10, fontSize: 13,
                  border: responseError ? '1px solid #ef4444' : '1px solid #d3d1c7',
                  borderRadius: 7,
                  fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
                }}
              />
              {responseError && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#a32d2d' }}>{responseError}</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <Btn small primary onClick={submitResponse} disabled={submitting}>
                  {submitting ? t('loading', 'Loading...') : t('append_response', 'Append Response')}
                </Btn>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Right column: metadata sidebar (Location removed; now in left column) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <Card>
            <SectionTitle>{t('submitter', 'Submitter')}</SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar initials={initialsOf(submitter.name || '?')} size={36} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
                  {submitter.name || 'Unknown'}
                </div>
                <div style={{ fontSize: 11, color: '#888780', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {submitter.email || submitter.phoneNo || ''}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle>{t('categorisation', 'Categorisation')}</SectionTitle>
            <MetaRow label={t('complaint_category', 'Complaint Category')} value={complaint.category} />
          </Card>

          <Card>
            <SectionTitle>{t('timestamps', 'Timestamps')}</SectionTitle>
            <MetaRow label={t('submitted_at', 'Submitted at')}     value={new Date(complaint.created_at).toLocaleString()} />
            <MetaRow label={t('last_updated', 'Last Updated Status')}    value={new Date(complaint.updated_at).toLocaleString()} />
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── Helper components ───────────────────────────────────────────────── */

function BackButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: '#1a4fa0', fontSize: 13, fontWeight: 500,
        padding: '4px 0', marginBottom: 14,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
        <path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label || 'Back to Complaints'}
    </button>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: '#888780', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>
      {children}
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
      <span style={{ color: '#888780' }}>{label}</span>
      <span style={{ color: '#333', fontWeight: 500 }}>{value || '-'}</span>
    </div>
  );
}

export default AdminComplaintDetails;
