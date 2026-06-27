import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Avatar, Btn, IconBtn, StatusBadge,
  SearchBar, Tabs, MetricCard,
} from '../../components/Admin/AdminUI';
import { complaintAPI } from '../../services/api';
import { useTranslation } from '../../lang/i18n';

/* UI status keys -> backend display labels used by <StatusBadge /> */
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

function AdminComplaints() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tab, setTab]               = useState('all');
  const [search, setSearch]         = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 10 });
  const [dateRange, setDateRange]       = useState({ start: '', end: '' });
  const [pendingRange, setPendingRange] = useState({ start: '', end: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  /* Load complaints from the Laravel backend with pagination */
  const loadComplaints = async (targetPage = 1, range) => {
    const activeRange = range !== undefined ? range : dateRange;
    setLoading(true);
    setError('');
    try {
      const res = await complaintAPI.getAllComplaints(targetPage, {
        startDate: activeRange.start || undefined,
        endDate: activeRange.end || undefined,
      });
      setComplaints(res.data);
      setPagination(res.meta || { current_page: 1, last_page: 1, total: res.data.length, per_page: 10 });
      setPage(targetPage);
    } catch (e) {
      setError('failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComplaints(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Close date picker popup on click outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    if (showDatePicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  /* Build derived metrics from the current paginated set */
  const metrics = useMemo(() => ({
    total:       pagination.total,
    pending:     complaints.filter((c) => c.status === 'pending').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved:    complaints.filter((c) => c.status === 'resolved').length,
    rejected:    complaints.filter((c) => c.status === 'rejected').length,
  }), [complaints, pagination.total]);

  const STATUS_TABS = [
    { key: 'all',         label: `${t('all', 'All')} (${metrics.total})` },
    { key: 'pending',     label: `${t('pending', 'Pending')} (${metrics.pending})` },
    { key: 'in_progress', label: `${t('in_progress', 'In Progress')} (${metrics.in_progress})` },
    { key: 'resolved',    label: `${t('resolved', 'Resolved')} (${metrics.resolved})` },
    { key: 'rejected',    label: `${t('rejected', 'Rejected')} (${metrics.rejected})` },
  ];

  /* Client-side filter combining tab + search across multiple fields */
  const filtered = complaints.filter((c) => {
    const matchTab = tab === 'all' || c.status === tab;
    const term = search.toLowerCase();
    const matchSearch = !term || [
      c.title, c.description, c.category,
      c.location, c.record_id, c.user?.name,
    ].some((field) => (field || '').toLowerCase().includes(term));
    return matchTab && matchSearch;
  });

  /* Navigate to the dedicated details page when a row is clicked.
   * Status updates are intentionally NOT exposed on this list view -
   * they live exclusively on the full Complaint Details page. */
  const goToDetails = (row) => navigate(`/admin/complaints/${row.id}`);

  /*
   * Per-column widths (in %). The Title column is intentionally generous so
   * long strings have breathing room. Total adds to ~100% with overflow on
   * Title gracefully wrapping over two lines.
   */
  const columns = [
    {
      key: 'record_id', label: t('record_id', 'Record ID'), width: '9%',
      render: (v) => <span style={{ color: '#9ca3af', fontSize: 11, whiteSpace: 'nowrap' }}>{v}</span>,
    },
    {
      key: 'title', label: t('title', 'Title'), width: '30%',
      render: (v) => (
        <span style={{
          fontWeight: 500, color: '#111827',
          lineHeight: 1.45,
          // Allow up to two lines before truncating, giving long titles room.
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>{v}</span>
      ),
    },
    {
      key: 'category', label: t('category', 'Category'), width: '12%',
      render: (v) => <span style={{ color: '#6b7280' }}>{v}</span>,
    },
    {
      key: 'user', label: t('submitted_by', 'Submitted by'), width: '16%',
      render: (u) => {
        const name = u?.name || 'Unknown';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar initials={initialsOf(name)} size={26} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
          </div>
        );
      },
    },
    {
      key: 'created_at', label: t('date', 'Date'), width: '11%',
      render: (v) => (
        <span style={{ color: '#9ca3af', whiteSpace: 'nowrap' }}>
          {v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
        </span>
      ),
    },
    {
      key: 'status', label: t('status', 'Status'), width: '14%',
      render: (v) => <StatusBadge status={UI_TO_DISPLAY[v] || v} />,
    },
    {
      key: '_actions', label: t('action', 'Action'), width: '8%',
      render: (_, row) => (
        <IconBtn
          title={t('edit', 'Edit')}
          onClick={(e) => { e.stopPropagation(); goToDetails(row); }}
        >
          {/* Pencil icon */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </IconBtn>
      ),
    },
  ];

  // Custom table with per-column widths + roomier padding on the Title column.
  const ClickableTable = () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed' }}>
        <colgroup>
          {columns.map((col) => <col key={col.key} style={{ width: col.width }} />)}
        </colgroup>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{
                textAlign: 'left',
                padding: col.key === 'title' ? '10px 18px' : '10px 14px',
                fontSize: 12, fontWeight: 600, color: '#6b7280',
                borderBottom: '1px solid #e5e7eb',
                background: '#f9fafb', whiteSpace: 'nowrap',
              }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, ri) => (
            <tr
              key={row.id}
              style={{
                borderBottom: '1px solid #f3f4f6',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: col.key === 'title' ? '14px 18px' : '11px 14px',
                    color: '#374151',
                    verticalAlign: 'middle',
                    wordBreak: 'break-word',
                  }}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 14, marginBottom: 20 }}>
        <MetricCard label={t('total', 'Total')}           value={metrics.total}       accentColor="#2563eb" />
        <MetricCard label={t('pending', 'Pending')}       value={metrics.pending}     accentColor="#f59e0b" subColor="down" />
        <MetricCard label={t('in_progress', 'In Progress')} value={metrics.in_progress} accentColor="#3b82f6" />
        <MetricCard label={t('resolved', 'Resolved')}     value={metrics.resolved}    accentColor="#10b981" subColor="up" />
        <MetricCard label={t('rejected', 'Rejected')}     value={metrics.rejected}    accentColor="#ef4444" subColor="down" />
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Tabs tabs={STATUS_TABS} active={tab} onChange={setTab} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Btn small onClick={loadComplaints}>{t('refresh', 'Refresh')}</Btn>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <SearchBar
              placeholder={t('placeholder_search_admin_complaint', 'Search by title, description, category, user, location, or record ID...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
          </div>

          {/* ── Date Range Picker ── */}
          <div style={{ position: 'relative', flexShrink: 0 }} ref={datePickerRef}>
            {/* Trigger button */}
            <button
              onClick={() => setShowDatePicker((v) => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
                border: '1px solid',
                borderColor: (dateRange.start || dateRange.end) ? '#2563eb' : '#e5e7eb',
                background: (dateRange.start || dateRange.end) ? '#eff6ff' : '#fff',
                color: (dateRange.start || dateRange.end) ? '#2563eb' : '#6b7280',
                borderRadius: 7, cursor: 'pointer',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {(dateRange.start || dateRange.end)
                ? `${dateRange.start || '…'} → ${dateRange.end || '…'}`
                : t('date_range', 'Date Range')}
            </button>

            {/* Popup panel */}
            {showDatePicker && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 200,
                background: '#fff', border: '1px solid #d3d1c7', borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0,0,0,0.13)', padding: 16, minWidth: 260,
              }}>
                <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>
                  {t('date_range', 'Date Range')}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ fontSize: 11, color: '#888780', fontWeight: 500 }}>
                    {t('from', 'From')}
                    <input
                      type="date"
                      value={pendingRange.start}
                      max={pendingRange.end || undefined}
                      onChange={(e) => setPendingRange((r) => ({ ...r, start: e.target.value }))}
                      style={{
                        display: 'block', width: '100%', marginTop: 4,
                        padding: '6px 8px', border: '1px solid #d3d1c7',
                        borderRadius: 6, fontSize: 12, fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    />
                  </label>
                  <label style={{ fontSize: 11, color: '#888780', fontWeight: 500 }}>
                    {t('to', 'To')}
                    <input
                      type="date"
                      value={pendingRange.end}
                      min={pendingRange.start || undefined}
                      onChange={(e) => setPendingRange((r) => ({ ...r, end: e.target.value }))}
                      style={{
                        display: 'block', width: '100%', marginTop: 4,
                        padding: '6px 8px', border: '1px solid #d3d1c7',
                        borderRadius: 6, fontSize: 12, fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    />
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button
                    onClick={() => {
                      setDateRange(pendingRange);
                      setShowDatePicker(false);
                      loadComplaints(1, pendingRange);
                    }}
                    style={{
                      flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 600,
                      background: '#2563eb', color: '#fff',
                      border: 'none', borderRadius: 6, cursor: 'pointer',
                    }}
                  >
                    {t('apply', 'Apply')}
                  </button>
                  <button
                    onClick={() => {
                      const cleared = { start: '', end: '' };
                      setPendingRange(cleared);
                      setDateRange(cleared);
                      setShowDatePicker(false);
                      loadComplaints(1, cleared);
                    }}
                    style={{
                      flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 500,
                      background: '#f9fafb', color: '#374151',
                      border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer',
                    }}
                  >
                    {t('clear', 'Clear')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>{t('loading', 'Loading...')}</div>
        ) : error ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}></div>
            <p style={{ fontWeight: 600, color: '#6b7280', margin: '0 0 16px', fontSize: 13 }}>
              {t('load_complaints_error', 'Unable to load complaints. Please try again later.')}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <p style={{ fontWeight: 600, color: '#6b7280', margin: '0 0 6px', fontSize: 13 }}>
              {(search || dateRange.start || dateRange.end)
                ? t('no_search_results', 'No results match your current filters.')
                : t('no_complaints_yet', 'No complaints submitted yet.')}
            </p>
          </div>
        ) : (
          <ClickableTable />
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, fontSize: 11, color: '#888780' }}>
          <span style={{ color: '#9ca3af', fontSize: 12 }}>
            {t('showing_of_complaints', 'Showing {shown} of {total} complaints', {
              shown: filtered.length,
              total: metrics.total,
            })}
          </span>

          {/* Pagination controls */}
          {pagination.last_page > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {page > 1 && (
                <button
                  onClick={() => loadComplaints(page - 1)}
                  style={{
                    padding: '4px 10px', fontSize: 11, borderRadius: 6,
                    border: '1px solid #e5e7eb', background: '#fff',
                    color: '#374151', cursor: 'pointer',
                  }}
                >
                  ‹ {t('previous', 'Previous')}
                </button>
              )}

              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.last_page || Math.abs(p - page) <= 2)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '…' ? (
                    <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#aaa89e' }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => loadComplaints(p)}
                      style={{
                        minWidth: 28, padding: '4px 6px', fontSize: 11, borderRadius: 6,
                        border: '1px solid',
                        borderColor: p === page ? '#2563eb' : '#e5e7eb',
                        background: p === page ? '#2563eb' : '#fff',
                        color: p === page ? '#fff' : '#374151',
                        cursor: 'pointer', fontWeight: p === page ? 600 : 400,
                      }}
                    >
                      {p}
                    </button>
                  )
                )}

              {page < pagination.last_page && (
                <button
                  onClick={() => loadComplaints(page + 1)}
                  style={{
                    padding: '4px 10px', fontSize: 11, borderRadius: 6,
                    border: '1px solid #e5e7eb', background: '#fff',
                    color: '#374151', cursor: 'pointer',
                  }}
                >
                  {t('next', 'Next')} ›
                </button>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default AdminComplaints;
