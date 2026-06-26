import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { KeyIcon } from "@heroicons/react/24/solid";

export default function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("http://127.0.0.1:8000/api/auth/forgot-password/send-otp", {
        phone_number: phone
      });
      navigate("/reset-password", { state: { phone_number: phone } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8 slide-in-left">
          <div className="text-4xl mb-4">
            <KeyIcon className="h-12 w-12 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
          <p className="text-gray-600">Enter your phone number to receive an OTP</p>
        </div>

        {/* Card */}
        <div className="card fade-in">

          {error && (
            <div className="alert alert-error mb-6"><span>{error}</span></div>
          )}

          <div className="form-group mb-6">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              placeholder="+60123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
            />
          </div>

          <button
            onClick={sendOtp}
            disabled={loading || !phone}
            className="btn btn-primary w-full btn-lg font-semibold"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Sending OTP...</span>
              </span>
            ) : 'Send OTP'}
          </button>

          <p className="text-center text-gray-600 mt-4">
            Remember your password?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Back to Login
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}