import React, { useState, useEffect, useRef } from "react";
import { chatAPI } from "../services/api";

function RealAgent() {
  const [conversationId, setConversationId] = useState(null);
  const userId = 2;

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

  // INIT CONVERSATION
  useEffect(() => {
    const init = async () => {
      const res = await chatAPI.createConversation(userId);
      setConversationId(res.data.id);
    };

    init();
  }, []);

  // LOAD MESSAGES (POLLING)
  useEffect(() => {
    if (!conversationId) return;

    loadMessages(conversationId);

    const interval = setInterval(() => {
      loadMessages(conversationId);
    }, 20000);

    return () => clearInterval(interval);
  }, [conversationId]);

  const loadMessages = async (convId) => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;

      const res = await chatAPI.getMessages(convId);
      const data = res.data || res;

      const formatted = data.map((msg) => ({
        id: msg.id,
        text: msg.message,
        sender: msg.sender_id === userId ? "user" : "agent",
        senderName: msg.sender_id === userId ? "You" : "Admin Support",
        timestamp: new Date(msg.created_at),
      }));

      setMessages(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      isLoadingRef.current = false;
    }
  };

  // SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SEND MESSAGE
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || !conversationId) return;

    const text = inputValue;
    setInputValue("");

    try {
      await chatAPI.sendMessage(conversationId, userId, text);
      await loadMessages(conversationId);
    } catch (error) {
      console.error("Send failed:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => {
          const time = new Date(message.timestamp).toLocaleTimeString(
            "en-MY",
            { hour: "2-digit", minute: "2-digit" }
          );

          return (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-black"
                }`}
              >
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
      <form onSubmit={handleSendMessage} className="p-4 flex gap-3">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 border p-3 rounded"
          placeholder="Type message..."
        />

        <button className="bg-blue-600 text-white px-4 rounded">
          Send
        </button>
      </form>
    </div>
  );
}

export default RealAgent;
