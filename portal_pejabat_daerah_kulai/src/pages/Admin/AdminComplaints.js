import React, { useState } from 'react';
import {
  Card, SectionHeader, StatusBadge, Avatar, Btn, IconBtn,
  SearchBar, Tabs, DataTable, MetricCard,
} from '../../components/Admin/AdminUI';

const ALL_COMPLAINTS = [
  { id: 'ADU-248', title: 'Jalan berlubang Taman Kulai Jaya', category: 'Roads',    user: 'Razif Hamdan',     initials: 'RH', date: '17 Apr 2026', status: 'Pending' },
  { id: 'ADU-247', title: 'Lampu jalan mati sejak 3 hari',    category: 'Lighting', user: 'Norhayati Ismail', initials: 'NI', date: '16 Apr 2026', status: 'In Progress' },
];

const STATUS_TABS = [
  { key: 'all',        label: 'All (248)' },
  { key: 'Pending',    label: 'Pending (42)' },
  { key: 'In Progress',label: 'In Progress (23)' },
  { key: 'Resolved',   label: 'Resolved (183)' },
];

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
  const [tab, setTab]       = useState('all');
  const [search, setSearch] = useState('');

  const filtered = ALL_COMPLAINTS.filter((c) => {
    const matchTab    = tab === 'all' || c.status === tab;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                        c.category.toLowerCase().includes(search.toLowerCase()) ||
                        c.user.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const columns = [
    { key: 'id',       label: 'ID',       render: (v) => <span style={{ color: '#aaa89e', fontSize: 11 }}>{v}</span> },
    {
      key: 'title', label: 'Title',
      render: (v) => <span style={{ fontWeight: 500, color: '#1a1a1a', display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>,
    },
    { key: 'category', label: 'Category', render: (v) => <span style={{ color: '#555450' }}>{v}</span> },
    {
      key: 'user', label: 'Submitted by',
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar initials={row.initials} size={26} />
          <span>{v}</span>
        </div>
      ),
    },
    { key: 'date',   label: 'Date',   render: (v) => <span style={{ color: '#888780' }}>{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: '_actions', label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <IconBtn title="Respond to complaint"><ReplyIcon /></IconBtn>
          <IconBtn title="Update status"><EditIcon /></IconBtn>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 20 }}>
        <MetricCard label="Total"       value="248" />
        <MetricCard label="Pending"     value="42"  subColor="down" />
        <MetricCard label="In Progress" value="23"  />
        <MetricCard label="Resolved"    value="183" subColor="up" />
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Tabs tabs={STATUS_TABS} active={tab} onChange={setTab} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Btn small>Export CSV</Btn>
            <Btn small primary>+ New Complaint</Btn>
          </div>
        </div>

        <SearchBar
          placeholder="Search by title, category, or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <DataTable columns={columns} rows={filtered} />

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, fontSize: 11, color: '#888780' }}>
          <span>Showing {filtered.length} of 248 complaints</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn small>← Prev</Btn>
            <Btn small primary>Next →</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AdminComplaints;
