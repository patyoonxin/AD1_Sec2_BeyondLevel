import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const phoneNo = location.state?.phoneNo;

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNo, otp }),
      });

      const data = await res.json();
      setIsError(!res.ok);
      setMessage(data.message);

      if (res.ok) setTimeout(() => navigate('/login'), 1500);
    } catch {
      setIsError(true);
      setMessage('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8 slide-in-left">
          <div className="text-4xl mb-4">📱</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
          <p className="text-gray-600">Enter the OTP sent to your phone</p>
        </div>

        {/* Card */}
        <div className="card fade-in">

          {/* Phone display */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg text-center">
            <p className="text-sm text-gray-500">OTP sent to</p>
            <p className="text-blue-700 font-semibold">{phoneNo}</p>
          </div>

          {/* OTP Input */}
          <div className="form-group mb-6">
            <label className="form-label">OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="form-input text-center text-2xl tracking-widest font-bold"
              placeholder="------"
              maxLength={6}
            />
          </div>

          {/* Message */}
          {message && (
            <div className={`alert ${isError ? 'alert-error' : 'alert-success'} mb-4`}>
              <span>{message}</span>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.length === 0}
            className="btn btn-primary w-full btn-lg font-semibold"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Verifying...</span>
              </span>
            ) : 'Verify OTP'}
          </button>

          {/* Back to login */}
          <p className="text-center text-gray-600 mt-4">
            Wrong number?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Go back
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;