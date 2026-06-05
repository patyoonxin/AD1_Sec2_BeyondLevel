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
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone_number: '', password: '', role: 'user' });

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

  // ================= ADD USER =================
  const handleAddUser = async () => {
  try {
    const res = await axios.post('http://127.0.0.1:8000/api/admin/users', newUser, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    });
    setUsers(prev => [...prev, res.data.user]);
    setShowAddModal(false);
    setNewUser({ name: '', email: '', phone_number: '', password: '', role: 'user' });
    alert('User added successfully');
  } catch (error) {
    console.error(error.response?.data);
    alert('Failed to add user');
  }
};


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

  // ================= EDIT USER =================
  const handleEditUser = (user) => {
  setSelectedUser({
    ...user,
  });

  setShowEditModal(true);
  setOpenDropdown(null);
};
  // ================= DELETE USER =================
  const handleDeleteUser = async (userId) => {
  try {
    await axios.delete(
      `http://127.0.0.1:8000/api/admin/users/${userId}`
    );

    setUsers(prev =>
      prev.filter(u => u.id !== userId)
    );

    setOpenDropdown(null);

    alert('User deleted successfully');
  } catch (error) {
    console.error(error);
    alert('Failed to delete user');
  }
};

  // ================= SAVE USER =================
const handleSaveUser = async () => {
  try {
    const response = await axios.put(
      `http://127.0.0.1:8000/api/admin/users/${selectedUser.id}`,
      {
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
      }
    );

    setUsers(prev =>
      prev.map(user =>
        user.id === selectedUser.id
          ? response.data.user
          : user
      )
    );

    setShowEditModal(false);

    alert('User updated successfully');

  } catch (error) {
    console.error(error);
    alert('Failed to update user');
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
          <Avatar
          initials={
            row.name
            ? row.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            : 'U'
          }
          size={30}
          />
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
    if (!v) return <Badge variant="gray">Unknown</Badge>;
    const formatted = v.charAt(0).toUpperCase() + v.slice(1);
    return <Badge variant={ROLE_BADGE[formatted] || 'gray'}>{formatted}</Badge>;
  },
},

{
  key: 'registered',
  label: 'Registered',
  render: (v) => <span style={{ color: '#888780' }}>{v || '—'}</span>,
},

{
  key: 'status',
  label: 'Status',
  render: (v) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: v === 'Active' ? '#639922' : '#e24b4a' }} />
      {v || 'Inactive'}
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
                  onClick={() => handleEditUser(row)}
                >
                  ✏️ Edit
                </div>

                <div
                  style={menuItemStyle}
                  onClick={() => handleDeleteUser(row.id)}
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
            {showEditModal && selectedUser && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: '#fff',
        width: 450,
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 20,
        }}
      >
        Edit User
      </h3>

      <div style={{ marginBottom: 12 }}>
        <label>Name</label>

        <input
          type="text"
          value={selectedUser.name || ''}
          onChange={(e) =>
            setSelectedUser({
              ...selectedUser,
              name: e.target.value,
            })
          }
          style={{
            width: '100%',
            padding: 10,
            marginTop: 4,
          }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Email</label>

        <input
          type="email"
          value={selectedUser.email || ''}
          onChange={(e) =>
            setSelectedUser({
              ...selectedUser,
              email: e.target.value,
            })
          }
          style={{
            width: '100%',
            padding: 10,
            marginTop: 4,
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>Role</label>

        <select
          value={selectedUser.role || 'user'}
          onChange={(e) =>
            setSelectedUser({
              ...selectedUser,
              role: e.target.value,
            })
          }
          style={{
            width: '100%',
            padding: 10,
            marginTop: 4,
          }}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
        }}
      >
        <Btn
          onClick={() => setShowEditModal(false)}
        >
          Cancel
        </Btn>

        <Btn
          primary
          onClick={handleSaveUser}
        >
          Save Changes
        </Btn>
      </div>
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
              <Btn small primary onClick={() => setShowAddModal(true)}>+ Add User</Btn>
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

      {showEditModal && selectedUser && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: '#fff',
        width: '500px',
        maxWidth: '90%',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        border: '1px solid #eceae4',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          paddingBottom: 12,
          borderBottom: '1px solid #eceae4',
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: '#1a1a1a',
            }}
          >
            Edit User
          </h3>

          <p
            style={{
              margin: '4px 0 0',
              fontSize: 12,
              color: '#888780',
            }}
          >
            Update user information and role
          </p>
        </div>

        <button
          onClick={() => setShowEditModal(false)}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 22,
            color: '#888780',
          }}
        >
          ×
        </button>
      </div>

      {/* User Preview */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          padding: '12px',
          background: '#f8f7f4',
          borderRadius: 10,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#1a4fa0',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
          }}
        >
          {selectedUser.name
            ?.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()}
        </div>

        <div>
          <div style={{ fontWeight: 600 }}>
            {selectedUser.name}
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#888780',
            }}
          >
            User ID: {selectedUser.id}
          </div>
        </div>
      </div>

      {/* Name */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: 'block',
            marginBottom: 6,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Name
        </label>

        <input
          type="text"
          value={selectedUser.name || ''}
          onChange={(e) =>
            setSelectedUser({
              ...selectedUser,
              name: e.target.value,
            })
          }
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d9d7cf',
            borderRadius: 8,
          }}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: 'block',
            marginBottom: 6,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Email
        </label>

        <input
          type="email"
          value={selectedUser.email || ''}
          onChange={(e) =>
            setSelectedUser({
              ...selectedUser,
              email: e.target.value,
            })
          }
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d9d7cf',
            borderRadius: 8,
          }}
        />
      </div>

      {/* Role */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: 'block',
            marginBottom: 6,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Role
        </label>

        <select
          value={selectedUser.role || 'user'}
          onChange={(e) =>
            setSelectedUser({
              ...selectedUser,
              role: e.target.value,
            })
          }
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d9d7cf',
            borderRadius: 8,
          }}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid #eceae4',
        }}
      >
        <button
          onClick={() => setShowEditModal(false)}
          style={{
            padding: '10px 16px',
            border: '1px solid #d9d7cf',
            background: '#fff',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleSaveUser}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: '#1a4fa0',
            color: '#fff',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}
{showAddModal && (
  <div style={{
    position: 'fixed', inset: 0,
    background: 'rgba(15,23,42,0.45)',
    backdropFilter: 'blur(3px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
  }}>
    <div style={{
      background: '#fff', width: 500, maxWidth: '90%',
      borderRadius: 16, padding: 24,
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      border: '1px solid #eceae4',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid #eceae4' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>Add User</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888780' }}>Create a new user account</p>
        </div>
        <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 22, color: '#888780' }}>×</button>
      </div>

      {/* Fields */}
      {[
        { label: 'Name', key: 'name', type: 'text' },
        { label: 'Email', key: 'email', type: 'email' },
        { label: 'Phone Number', key: 'phone_number', type: 'text' },
        { label: 'Password', key: 'password', type: 'password' },
      ].map(({ label, key, type }) => (
        <div key={key} style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>{label}</label>
          <input
            type={type}
            value={newUser[key]}
            onChange={(e) => setNewUser({ ...newUser, [key]: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9d7cf', borderRadius: 8 }}
          />
        </div>
      ))}

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Role</label>
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9d7cf', borderRadius: 8 }}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: '1px solid #eceae4' }}>
        <button onClick={() => setShowAddModal(false)} style={{ padding: '10px 16px', border: '1px solid #d9d7cf', background: '#fff', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
        <button onClick={handleAddUser} style={{ padding: '10px 18px', border: 'none', background: '#1a4fa0', color: '#fff', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Add User</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default AdminUsers;