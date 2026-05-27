import { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function ResetPassword() {
  const location = useLocation();
  const phone = location.state?.phone_number;
  console.log("PHONE:", phone);

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const resetPassword = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/auth/forgot-password/reset",
        {
            phone_number: phone,
            otp: otp,
            password: password
        }
      );

      alert("Password reset successful!");

    } catch (err) {
        console.error(err.response);
        const message =
        err.response?.data?.message || "Reset failed";
                alert(message);
            }
        };

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Reset Password</h1>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="border p-2 block mb-2"
      />

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 block mb-2"
      />

      <button
        onClick={resetPassword}
        className="bg-green-500 text-white px-4 py-2"
      >
        Reset Password
      </button>
    </div>
  );
}