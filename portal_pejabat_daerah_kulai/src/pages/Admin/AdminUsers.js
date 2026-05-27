import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card, SectionHeader, Avatar, Btn, IconBtn,
  SearchBar, Badge, MetricCard, DataTable,
} from '../../components/Admin/AdminUI';

const ROLE_BADGE = {
  'Super Admin': 'info',
  'Admin': 'success',
  'User': 'gray',
};

function AdminUsers() {

  // ================= STATE =================
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  const menuItemStyle = {
    padding: '8px 10px',
    fontSize: 12,
    cursor: 'pointer',
    borderRadius: 6,
  };

  // ================= FETCH USERS =================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/admin/users');
        setUsers(res.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ================= CLOSE DROPDOWN ON OUTSIDE CLICK =================
  useEffect(() => {
    const close = () => setOpenDropdown(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // ================= CHANGE ROLE =================
  const handleChangeRole = async (user) => {
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';

      await axios.patch(
        `http://127.0.0.1:8000/api/admin/users/${user.id}/role`,
        { role: newRole }
      );

      // update UI instantly
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, role: newRole } : u
        )
      );

      setOpenDropdown(null);

      alert(`Role updated to ${newRole}`);

    } catch (error) {
      console.error(error);
      alert('Failed to update role');
    }
  };

  // ================= FILTER =================
  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone_number?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  // ================= TABLE =================
  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials={row.initials} size={30} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{v}</div>
            <div style={{ fontSize: 10, color: '#aaa89e' }}>
              ID: {row.id}
            </div>
          </div>
        </div>
      ),
    },

    {
      key: 'phone_number',
      label: 'Phone Number',
      render: (v) => <span style={{ color: '#555450' }}>{v}</span>,
    },

    {
      key: 'role',
      label: 'Role',
      render: (v) => {
        const formatted = v.charAt(0).toUpperCase() + v.slice(1);
        return (
          <Badge variant={ROLE_BADGE[formatted] || 'gray'}>
            {formatted}
          </Badge>
        );
      },
    },

    {
      key: 'registered',
      label: 'Registered',
      render: (v) => <span style={{ color: '#888780' }}>{v}</span>,
    },

    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: v === 'Active' ? '#639922' : '#e24b4a',
            }}
          />
          {v}
        </span>
      ),
    },

    // ================= ACTION DROPDOWN =================
    {
      key: '_actions',
      label: 'Actions',
      render: (_, row) => {
        const isOpen = openDropdown === row.id;

        return (
          <div style={{ position: 'relative' }}>

            {/* BUTTON */}
            <IconBtn
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(isOpen ? null : row.id);
              }}
            >
              ⋮
            </IconBtn>

            {/* DROPDOWN */}
            {isOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 28,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #eee',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  zIndex: 10,
                  minWidth: 150,
                  padding: 6,
                }}
              >

                <div
                  style={menuItemStyle}
                  onClick={() => alert(`Edit ${row.name}`)}
                >
                  ✏️ Edit
                </div>

                <div
                  style={menuItemStyle}
                  onClick={() => alert(`Delete ${row.name}`)}
                >
                  🗑 Delete
                </div>

                <div
                  style={menuItemStyle}
                  onClick={() => handleChangeRole(row)}
                >
                  🔄 Change Role
                </div>

              </div>
            )}
          </div>
        );
      },
    },
  ];

  // ================= LOADING =================
  if (loading) {
    return <div style={{ padding: 20 }}>Loading users...</div>;
  }

  // ================= UI =================
  return (
    <div>

      {/* METRICS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 20
      }}>
        <MetricCard label="Total Users" value={users.length} />
        <MetricCard label="Active (30d)" value="924" />
        <MetricCard label="Administrators" value="8" />
        <MetricCard label="Banned / Inactive" value="12" />
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
          placeholder="Search by name, phone or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <DataTable columns={columns} rows={filtered} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 14,
          fontSize: 11,
          color: '#888780'
        }}>
          <span>
            Showing {filtered.length} of {users.length} users
          </span>

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