import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const phone = location.state?.phone_number;

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetPassword = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("http://127.0.0.1:8000/api/auth/forgot-password/reset", {
        phone_number: phone,
        otp,
        password
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8 slide-in-left">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter the OTP sent to <strong>{phone}</strong></p>
        </div>

        {/* Card */}
        <div className="card fade-in">

          {error && (
            <div className="alert alert-error mb-6"><span>{error}</span></div>
          )}

          {/* OTP */}
          <div className="form-group mb-4">
            <label className="form-label">OTP Code</label>
            <input
              type="text"
              placeholder="------"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="form-input text-center text-2xl tracking-widest font-bold"
              maxLength={6}
            />
          </div>

          {/* New Password */}
          <div className="form-group mb-6">
            <label className="form-label">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button
            onClick={resetPassword}
            disabled={loading || !otp || !password}
            className="btn btn-primary w-full btn-lg font-semibold"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Resetting...</span>
              </span>
            ) : 'Reset Password'}
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