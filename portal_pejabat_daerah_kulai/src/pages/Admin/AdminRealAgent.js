import React, { useState, useEffect, useRef } from "react";
import { adminChatAPI } from "../../services/api";

function AdminRealAgent() {
  const adminId = parseInt(localStorage.getItem("userId"));

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const messagesEndRef = useRef(null);

  // =========================
  // LOAD CONVERSATIONS
  // =========================
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await adminChatAPI.getConversations();
        const data = res.data ?? res;

        setConversations(data);

        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
        }
      } catch (err) {
        console.error("Failed to load conversations", err);
      }
    };

    loadConversations();
  }, []);

  // =========================
  // LOAD MESSAGES
  // =========================
  useEffect(() => {
    if (!selectedConversation?.id) return;

    const loadMessages = async () => {
      try {
        const res = await adminChatAPI.getMessages(selectedConversation.id);
        const data = res.data ?? res;

        const formatted = data.map((msg) => ({
          id: msg.id,
          text: msg.message,

          // ✅ FIXED: use relationship
          sender: msg.sender.role === "admin" ? "admin" : "user",

          senderName:
            msg.sender.name || msg.sender.username || `User #${msg.sender.id}`,

          timestamp: new Date(msg.created_at),
        }));

        setMessages(formatted);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    loadMessages();

    const interval = setInterval(loadMessages, 20000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  // =========================
  // SCROLL
  // =========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =========================
  // SEND MESSAGE
  // =========================
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || !selectedConversation) return;

    const text = inputValue;
    setInputValue("");

    try {
      await adminChatAPI.sendMessage(selectedConversation.id, adminId, text);

      const res = await adminChatAPI.getMessages(selectedConversation.id);

      const data = res.data ?? res;

      const formatted = data.map((msg) => ({
        id: msg.id,
        text: msg.message,

        // ✅ FIXED: use relationship
        sender: msg.sender.role === "admin" ? "admin" : "user",

        senderName:
          msg.sender.name || msg.sender.username || `User #${msg.sender.id}`,

        timestamp: new Date(msg.created_at),
      }));

      setMessages(formatted);
    } catch (err) {
      console.error("Send message failed", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-5 border-b">
          <h1 className="text-2xl font-bold">💬 Support Chats</h1>
          <p className="text-sm text-gray-500">Admin dashboard</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                selectedConversation?.id === conv.id ? "bg-blue-50" : ""
              }`}
            >
              <div className="font-semibold">User #{conv.user_id}</div>

              <div className="text-sm text-gray-500">{conv.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <div className="bg-white p-5 border-b">
          <h2 className="text-xl font-bold">
            {selectedConversation
              ? `User #${selectedConversation.user_id}`
              : "Select a chat"}
          </h2>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "admin" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex flex-col max-w-xs">
                {/* ✅ Sender label (only show for admin messages OR all messages if you want) */}
                <div className="text-xs text-gray-500 mb-1 px-1">
                  {msg.sender === "admin"
                    ? `Admin #${msg.senderName}`
                    : `User #${msg.senderName}`}
                </div>

                {/* Message bubble */}
                <div
                  className={`px-4 py-2 rounded-xl ${
                    msg.sender === "admin"
                      ? "bg-blue-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-3">
          <input
            className="flex-1 border rounded-xl px-4 py-2"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Reply..."
          />

          <button className="bg-blue-600 text-white px-4 rounded-xl">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminRealAgent;
