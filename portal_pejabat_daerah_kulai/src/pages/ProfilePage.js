import React, { useEffect, useState } from "react";
import axios from "axios";

const ProfilePage = () => {
  // ===============================
  // STATE: user data from backend
  // ===============================
  const [user, setUser] = useState(null);

  // loading state while fetching API
  const [loading, setLoading] = useState(true);

  // ===============================
  // EDIT MODE (toggle view/edit)
  // ===============================
  const [editMode, setEditMode] = useState(false);

  // form data for updating profile
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });

  // ===============================
  // FETCH PROFILE ON PAGE LOAD
  // ===============================
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await axios.get("http://127.0.0.1:8000/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // save user data into state
      setUser(res.data);

      // fill form with existing data
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
  // HANDLE INPUT CHANGE
  // ===============================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ===============================
  // UPDATE PROFILE API CALL
  // ===============================
  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await axios.put(
        "http://127.0.0.1:8000/api/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      // update UI with new data
      setUser(res.data.user);

      // exit edit mode
      setEditMode(false);

      alert("Profile updated successfully!");

    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // ===============================
  // LOADING STATE UI
  // ===============================
  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  // ===============================
  // ERROR STATE UI
  // ===============================
  if (!user) {
    return <div className="p-6 text-red-500">Failed to load profile.</div>;
  }

  // ===============================
  // MAIN UI
  // ===============================
  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow rounded-xl p-6">
      
      <h1 className="text-2xl font-bold mb-6">👤 My Profile</h1>

      {/* ===============================
          VIEW MODE (READ ONLY)
      =============================== */}
      {!editMode ? (
        <div className="space-y-3 text-gray-700">

          <p>
            <span className="font-semibold">Name:</span> {user.name}
          </p>

          <p>
            <span className="font-semibold">Email:</span>{" "}
            {user.email || "No email added"}
          </p>

          <p>
            <span className="font-semibold">Phone:</span>{" "}
            {user.phone_number}
          </p>

          {/* EDIT BUTTON */}
          <button
            onClick={() => setEditMode(true)}
            className="mt-5 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Edit Profile
          </button>
        </div>

      ) : (
        /* ===============================
            EDIT MODE (FORM)
        =============================== */
        <div className="space-y-3">

          {/* NAME INPUT */}
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />

          {/* EMAIL INPUT */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />

          {/* PHONE INPUT */}
          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />

          {/* ACTION BUTTONS */}
          <div className="space-x-2">

            {/* SAVE BUTTON */}
            <button
              onClick={handleUpdateProfile}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Save Changes
            </button>

            {/* CANCEL BUTTON */}
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;