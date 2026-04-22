import React, { useState } from 'react';
import {
  Card, SectionHeader, StatusBadge, Avatar, Btn, IconBtn,
  SearchBar, Badge, MetricCard, DataTable,
} from '../../components/Admin/AdminUI';

const ALL_USERS = [
  { id: 'USR-001', name: 'Razif Hamdan',    initials: 'RH', email: 'razif@mail.com',               role: 'User',        registered: '12 Jan 2026', status: 'Active' },
  { id: 'USR-002', name: 'Norhayati Ismail', initials: 'NI', email: 'norhayati@mail.com',            role: 'User',        registered: '3 Feb 2026',  status: 'Active' },
  { id: 'ADM-001', name: 'Ahmad Mazlan',     initials: 'AM', email: 'ahmad.mazlan@kulai.gov.my',     role: 'Super Admin', registered: '1 Jan 2025',  status: 'Active' },
  { id: 'ADM-002', name: 'Siti Rohani',      initials: 'SR', email: 'siti.rohani@kulai.gov.my',      role: 'Admin',       registered: '15 Mar 2025', status: 'Active' },
  { id: 'USR-089', name: 'Borhan Kassim',    initials: 'BK', email: 'borhan89@mail.com',             role: 'User',        registered: '20 Nov 2025', status: 'Banned' },
  { id: 'ADM-003', name: 'Hafizuddin Yusof', initials: 'HY', email: 'hafizuddin@kulai.gov.my',       role: 'Admin',       registered: '5 Apr 2025',  status: 'Active' },
  { id: 'USR-120', name: 'Amirah Zainuddin', initials: 'AZ', email: 'amirah.z@mail.com',             role: 'User',        registered: '8 Mar 2026',  status: 'Active' },
];

const ROLE_BADGE = {
  'Super Admin': 'info',
  'Admin':       'success',
  'User':        'gray',
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

function AdminUsers() {
  const [search, setSearch] = useState('');

  const filtered = ALL_USERS.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'name', label: 'User',
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials={row.initials} size={30} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{v}</div>
            <div style={{ fontSize: 10, color: '#aaa89e' }}>ID: {row.id}</div>
          </div>
        </div>
      ),
    },
    { key: 'email',      label: 'Email',      render: (v) => <span style={{ color: '#555450' }}>{v}</span> },
    { key: 'role',       label: 'Role',       render: (v) => <Badge variant={ROLE_BADGE[v] || 'gray'}>{v}</Badge> },
    { key: 'registered', label: 'Registered', render: (v) => <span style={{ color: '#888780' }}>{v}</span> },
    {
      key: 'status', label: 'Status',
      render: (v) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: v === 'Active' ? '#639922' : '#e24b4a',
          }} />
          {v}
        </span>
      ),
    },
    {
      key: '_actions', label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <IconBtn title="Edit user"><EditIcon /></IconBtn>
          <IconBtn title="Delete user" danger><TrashIcon /></IconBtn>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 20 }}>
        <MetricCard label="Total Users"        value="1,847" sub="↑ 34 this month" subColor="up" />
        <MetricCard label="Active (30d)"       value="924"   />
        <MetricCard label="Administrators"     value="8"     />
        <MetricCard label="Banned / Inactive"  value="12"    subColor="down" />
      </div>

      <Card>
        <SectionHeader
          title="All users"
          right={
            <>
              <Btn small>Export</Btn>
              <Btn small primary>+ Add User</Btn>
            </>
          }
        />
        <SearchBar
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <DataTable columns={columns} rows={filtered} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 11, color: '#888780' }}>
          <span>Showing {filtered.length} of 1,847 users</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn small>← Prev</Btn>
            <Btn small primary>Next →</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AdminUsers;
