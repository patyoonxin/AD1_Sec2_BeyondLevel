import React, { useState } from 'react';
import {
  Card, SectionHeader, StatusBadge, Badge, Btn, IconBtn,
  SearchBar, MetricCard, DataTable,
} from '../../components/Admin/AdminUI';

const ALL_FAQS = [
  { id: 'FAQ-001', question: 'Bagaimana cara memfailkan aduan kepada pihak berkuasa tempatan?', category: 'Complaints', views: 824, status: 'Published', updated: '2 Apr 2026' },
  { id: 'FAQ-002', question: 'Apakah waktu operasi Pejabat Daerah Kulai?',                     category: 'General',    views: 612, status: 'Published', updated: '1 Apr 2026' },
  { id: 'FAQ-003', question: 'Cara memohon lesen perniagaan baru di Kulai',                     category: 'Licensing',  views: 487, status: 'Published', updated: '28 Mar 2026' },
  { id: 'FAQ-004', question: 'Jadual kutipan sampah mengikut kawasan',                          category: 'Waste',      views: 398, status: 'Published', updated: '20 Mar 2026' },
  { id: 'FAQ-005', question: 'Prosedur renew lesen jual beli kenderaan',                        category: 'Licensing',  views: 312, status: 'Draft',     updated: '15 Mar 2026' },
  { id: 'FAQ-006', question: 'Cara menghubungi pegawai daerah secara terus',                    category: 'General',    views: 289, status: 'Published', updated: '10 Mar 2026' },
  { id: 'FAQ-007', question: 'Syarat-syarat untuk mendapat bantuan rumah',                      category: 'Welfare',    views: 245, status: 'Draft',     updated: '5 Mar 2026' },
];

const CATEGORY_BADGE = {
  Complaints: 'info',
  General:    'gray',
  Licensing:  'warning',
  Waste:      'info',
  Welfare:    'purple',
};

const EditIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
    <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);
const TrashIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="5" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <path d="M6 5V3h4v2M1 5h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

function AdminFAQ() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = ALL_FAQS.filter((f) => {
    const matchSearch = f.question.toLowerCase().includes(search.toLowerCase()) ||
                        f.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      key: 'question', label: 'Question',
      render: (v) => <span style={{ color: '#1a1a1a', display: 'block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>,
    },
    { key: 'category', label: 'Category', render: (v) => <Badge variant={CATEGORY_BADGE[v] || 'gray'}>{v}</Badge> },
    { key: 'views',    label: 'Views',    render: (v) => <span style={{ fontWeight: 500, color: '#555' }}>{v.toLocaleString()}</span> },
    { key: 'status',   label: 'Status',   render: (v) => <StatusBadge status={v} /> },
    { key: 'updated',  label: 'Last updated', render: (v) => <span style={{ color: '#888780' }}>{v}</span> },
    {
      key: '_actions', label: 'Actions',
      render: () => (
        <div style={{ display: 'flex', gap: 6 }}>
          <IconBtn title="Edit FAQ"><EditIcon /></IconBtn>
          <IconBtn title="Delete FAQ" danger><TrashIcon /></IconBtn>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 20 }}>
        <MetricCard label="Total FAQs"       value="87"    />
        <MetricCard label="Published"        value="74"    subColor="up" />
        <MetricCard label="Draft"            value="13"    subColor="down" />
        <MetricCard label="Views (30 days)"  value="4,821" />
      </div>

      <Card>
        <SectionHeader
          title="FAQ entries"
          right={
            <>
              {/* Status filter pills */}
              {['all', 'Published', 'Draft'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: '4px 11px', fontSize: 11, borderRadius: 20,
                    border: '1px solid #eceae4',
                    background: statusFilter === s ? '#1a4fa0' : '#f1efe8',
                    color: statusFilter === s ? '#c8ddf5' : '#555',
                    cursor: 'pointer', fontWeight: 500,
                  }}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
              <Btn small>Import</Btn>
              <Btn small primary>+ Add FAQ</Btn>
            </>
          }
        />
        <SearchBar
          placeholder="Search FAQ by keyword or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <DataTable columns={columns} rows={filtered} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 11, color: '#888780' }}>
          <span>Showing {filtered.length} of 87 FAQs</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn small>← Prev</Btn>
            <Btn small primary>Next →</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AdminFAQ;
