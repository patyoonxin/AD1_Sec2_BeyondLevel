import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { chatAPI } from "../services/api";

function RealAgent() {
  const navigate = useNavigate();

  // ============================================
  // GET REAL USER ID
  // ============================================
  const userId = localStorage.getItem("userId");

  const [conversationId, setConversationId] = useState(null);

  const [inputValue, setInputValue] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello 👋 Welcome to Portal Support.",
      sender: "agent",
      senderName: "Admin Support",
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef(null);
  const isLoadingRef = useRef(false);

  // ============================================
  // REDIRECT IF NOT LOGIN
  // ============================================
  useEffect(() => {
    if (!userId) {
      alert("Please login first.");
      navigate("/login");
    }
  }, [userId, navigate]);

  // ============================================
  // INIT CONVERSATION
  // ============================================
  useEffect(() => {
    if (!userId) return;

    const init = async () => {
      try {
        const res = await chatAPI.createConversation(userId);

        // support both {data:{}} and direct response
        const data = res.data || res;

        setConversationId(data.id);
      } catch (error) {
        console.error("Conversation init failed:", error);
      }
    };

    init();
  }, [userId]);

  // ============================================
  // LOAD MESSAGES (POLLING)
  // ============================================
  useEffect(() => {
    if (!conversationId) return;

    loadMessages(conversationId);

    const interval = setInterval(() => {
      loadMessages(conversationId);
    }, 20000); // 10 seconds polling

    return () => clearInterval(interval);
  }, [conversationId]);

  // ============================================
  // LOAD MESSAGES
  // ============================================
  const loadMessages = async (convId) => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;

      const res = await chatAPI.getMessages(convId);

      const data = res.data || res;

      const formatted = data.map((msg) => ({
        id: msg.id,
        text: msg.message,
        sender:
          parseInt(msg.sender_id) === parseInt(userId)
            ? "user"
            : "agent",
        senderName:
          parseInt(msg.sender_id) === parseInt(userId)
            ? "You"
            : "Admin Support",
        timestamp: new Date(msg.created_at),
      }));

      setMessages(formatted);
    } catch (err) {
      console.error("Load messages failed:", err);
    } finally {
      isLoadingRef.current = false;
    }
  };

  // ============================================
  // AUTO SCROLL
  // ============================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ============================================
  // SEND MESSAGE
  // ============================================
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || !conversationId) return;

    const text = inputValue;

    setInputValue("");

    try {
      // send message
      await chatAPI.sendMessage(
        conversationId,
        userId,
        text
      );

      // immediate refresh
      await loadMessages(conversationId);
    } catch (error) {
      console.error("Send failed:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 shadow-sm p-5">
        <h1 className="text-2xl font-bold text-gray-900">
          💬 Live Agent Support
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Connected with admin support
        </p>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => {
          const time = new Date(
            message.timestamp
          ).toLocaleTimeString("en-MY", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-black border border-gray-200 rounded-bl-none"
                }`}
              >
                <p className="text-xs font-semibold mb-1 opacity-80">
                  {message.senderName}
                </p>

                <p>{message.text}</p>

                <span className="text-xs block mt-1 opacity-70">
                  {time}
                </span>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border-t border-gray-200 p-4 flex gap-3"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) =>
            setInputValue(e.target.value)
          }
          className="flex-1 border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type message..."
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl transition"
        >
          📤 Send
        </button>
      </form>
    </div>
  );
}

export default RealAgent;