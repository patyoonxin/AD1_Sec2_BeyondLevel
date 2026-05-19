import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const phoneNo = location.state?.phoneNo;

  const handleVerify = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNo,
          otp: otp
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage('Verification failed');
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2>Verify OTP</h2>

      <p>Phone: {phoneNo}</p>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <br /><br />

      <button onClick={handleVerify}>Verify</button>

      <p>{message}</p>
    </div>
  );
}

export default VerifyOtp;