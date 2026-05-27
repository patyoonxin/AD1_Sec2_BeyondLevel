import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminProfilePage = () => {
  // ===============================
  // USER STATE
  // ===============================
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // UI STATES
  // ===============================
  const [editMode, setEditMode] = useState(false);
  const [showDropdown, setShowDropdown] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // ===============================
  // FORM STATES
  // ===============================
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  // ===============================
  // FETCH PROFILE
  // ===============================
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await axios.get("http://127.0.0.1:8000/api/admin/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setUser(res.data);

      setFormData({
        name: res.data.name || "",
        email: res.data.email || "",
        phone_number: res.data.phone_number || "",
      });

    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // FORM HANDLER
  // ===============================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ===============================
  // UPDATE PROFILE
  // ===============================
  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await axios.put(
        "http://127.0.0.1:8000/api/admin/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setUser(res.data.user);
      setEditMode(false);

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // ===============================
  // PASSWORD HANDLER
  // ===============================
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.post(
        "http://127.0.0.1:8000/api/admin/change-password",
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      alert("Password changed successfully!");

      setShowPasswordForm(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });

    } catch (err) {
      console.log("ERROR RESPONSE:", err.response?.data);
      console.error("Password change failed:", err);
    }
  };

  // ===============================
  // LOADING
  // ===============================
  if (loading) return <div className="p-6">Loading profile...</div>;
  if (!user) return <div className="p-6 text-red-500">Failed to load profile.</div>;

  // ===============================
  // UI
  // ===============================
  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow rounded-xl p-6">

      <h1 className="text-2xl font-bold mb-6">👤 My Profile</h1>

      {/* ================= DROPDOWN ================= */}
      <div className="mb-6 border rounded p-3">

        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="font-semibold text-lg"
        >
          ▼ My Profile
        </button>

        {showDropdown && (
          <div className="mt-3 text-gray-700 space-y-1">
            <p><b>Name:</b> {user.name}</p>
            <p><b>Email:</b> {user.email || "No email added"}</p>
            <p><b>Phone:</b> {user.phone_number}</p>
            <p><b>Role:</b> {user.role}</p>
          </div>
        )}
      </div>

      {/* ================= BUTTONS ================= */}
      {!editMode ? (
        <div className="space-x-2">

          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Edit Profile
          </button>

          <button
            onClick={() => setShowPasswordForm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Change Password
          </button>

        </div>
      ) : (
        <div className="space-y-3">

          <input name="name" value={formData.name} onChange={handleChange} className="border p-2 w-full" />
          <input name="email" value={formData.email} onChange={handleChange} className="border p-2 w-full" />
          <input name="phone_number" value={formData.phone_number} onChange={handleChange} className="border p-2 w-full" />

          <div className="space-x-2">
            <button onClick={handleUpdateProfile} className="bg-green-600 text-white px-4 py-2 rounded">
              Save
            </button>

            <button onClick={() => setEditMode(false)} className="bg-gray-400 text-white px-4 py-2 rounded">
              Cancel
            </button>
          </div>

        </div>
      )}

      {/* ================= PASSWORD ================= */}
      {showPasswordForm && (
        <div className="mt-6 border p-4 space-y-3">

          <input
            type="password"
            name="current_password"
            placeholder="Current Password"
            value={passwordData.current_password}
            onChange={handlePasswordChange}
            className="border p-2 w-full"
          />

          <input
            type="password"
            name="new_password"
            placeholder="New Password"
            value={passwordData.new_password}
            onChange={handlePasswordChange}
            className="border p-2 w-full"
          />

          <input
            type="password"
            name="new_password_confirmation"
            placeholder="Confirm Password"
            value={passwordData.new_password_confirmation}
            onChange={handlePasswordChange}
            className="border p-2 w-full"
          />

          <div className="space-x-2">
            <button
              onClick={handleChangePassword}
              className="bg-green-600 text-white px-4 py-2"
            >
              Update Password
            </button>

            <button
              onClick={() => setShowPasswordForm(false)}
              className="bg-gray-400 text-white px-4 py-2"
            >
              Cancel
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default AdminProfilePage;