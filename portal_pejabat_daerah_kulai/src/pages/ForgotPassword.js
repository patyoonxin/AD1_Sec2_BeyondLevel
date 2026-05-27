import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const sendOtp = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/auth/forgot-password/send-otp",
        {
          phone_number: phone
        }
      );

      navigate("/reset-password", { state: { phone_number: phone } });

    } catch (err) {
        console.log("FULL ERROR:", err);
        console.log("RESPONSE:", err.response);
        console.log("DATA:", err.response?.data);
        alert(err.response?.data?.message || "Failed to send OTP");
    }
};

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Forgot Password</h1>

      <input
        type="text"
        placeholder="0123456789"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2"
      />

      <button
        onClick={sendOtp}
        className="bg-blue-500 text-white px-4 py-2 ml-2"
      >
        Send OTP
      </button>
    </div>
  );
}