import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({ name: "", email: "", phone_number: "" });
  const [passwordData, setPasswordData] = useState({
    current_password: "", new_password: "", new_password_confirmation: ""
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://127.0.0.1:8000/api/admin/profile", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      setUser(res.data);
      setFormData({ name: res.data.name || "", email: res.data.email || "", phone_number: res.data.phone_number || "" });
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };
  const showError = (msg) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 3000); };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.put("http://127.0.0.1:8000/api/admin/profile", formData, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      setUser(res.data.user);
      setEditMode(false);
      showSuccess("Profile updated successfully!");
    } catch (err) {
      showError("Failed to update profile.");
    }
  };

  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post("http://127.0.0.1:8000/api/admin/change-password", passwordData, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      showSuccess("Password changed successfully!");
      setShowPasswordForm(false);
      setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (err) {
      showError(err.response?.data?.message || "Failed to change password.");
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500">Loading profile...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="flex items-center justify-center h-96">
      <p className="text-red-500">Failed to load profile.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">

      {/* Alerts */}
      {successMsg && (
        <div className="alert alert-success"><span>✓ {successMsg}</span></div>
      )}
      {errorMsg && (
        <div className="alert alert-error"><span>✕ {errorMsg}</span></div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-5">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
            <p className="text-gray-500 text-sm">{user.phone_number}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Info / Edit */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Profile Information</h2>
          {!editMode && (
            <button onClick={() => setEditMode(true)} className="btn btn-primary btn-sm">
              Edit Profile
            </button>
          )}
        </div>

        {!editMode ? (
          <div className="space-y-3">
            {[
              { label: 'Full Name', value: user.name, icon: '👤' },
              { label: 'Email Address', value: user.email || 'No email added', icon: '✉️' },
              { label: 'Phone Number', value: user.phone_number || '—', icon: '📱' },
              { label: 'Role', value: user.role, icon: '🛡️' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-lg mr-3">{icon}</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="text-gray-800 font-medium capitalize">{value}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="email" value={formData.email} onChange={handleChange} className="form-input" type="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input name="phone_number" value={formData.phone_number} onChange={handleChange} className="form-input" />
            </div>
            <div className="flex space-x-3 pt-2">
              <button onClick={handleUpdateProfile} className="btn btn-primary">Save Changes</button>
              <button onClick={() => setEditMode(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Password & Security</h2>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="btn btn-sm"
              style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
            >
              Change Password
            </button>
          )}
        </div>

        {!showPasswordForm ? (
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-lg mr-3">🔒</span>
            <div>
              <p className="text-xs text-gray-400 font-medium">Password</p>
              <p className="text-gray-800 font-medium">••••••••</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" name="current_password" value={passwordData.current_password}
                onChange={handlePasswordChange} className="form-input" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" name="new_password" value={passwordData.new_password}
                onChange={handlePasswordChange} className="form-input" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" name="new_password_confirmation" value={passwordData.new_password_confirmation}
                onChange={handlePasswordChange} className="form-input" placeholder="••••••••" />
            </div>
            <div className="flex space-x-3 pt-2">
              <button onClick={handleChangePassword} className="btn btn-primary">Update Password</button>
              <button onClick={() => setShowPasswordForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminProfilePage;