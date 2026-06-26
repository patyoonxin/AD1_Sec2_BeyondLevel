import React, { useState, useEffect, useRef } from 'react';
import { chatbotAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import { useTranslation } from "../lang/i18n";

function ChatbotPage() {
  const navigate = useNavigate();
   const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: t('hello-how-help', 'Hello! 👋 How can I help you today?'),
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  const getChatKey = (userId) => `chat_cache_${userId}`;
  const userId = localStorage.getItem("userId");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveChatToStorage = (userId, messages) => {
    const key = getChatKey(userId);
    const existing = localStorage.getItem(key);
    let expiry;
    if (existing) {
      const parsed = JSON.parse(existing);
      // keep expiry ONLY if still valid
      expiry = Date.now() > parsed.expiry
        ? Date.now() + CACHE_TTL
        : parsed.expiry;
    } else {
      expiry = Date.now() + CACHE_TTL; // only set once
    }

    localStorage.setItem(
      key,
      JSON.stringify({ messages, expiry })
    );
  };

  const loadChatFromStorage = (userId) => {
    const raw = localStorage.getItem(getChatKey(userId));
    if (!raw) return null;
    const data = JSON.parse(raw);
    // expired → delete
    if (Date.now() > data.expiry) {
      localStorage.removeItem(getChatKey(userId));
      return null;
    }
    return data.messages;
  };

  //load chat from local storage
  useEffect(() => {
    if (!userId) return;
    const cached = loadChatFromStorage(userId);
    if (cached) {
      const normalized = cached.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
      setMessages(normalized);
    }
  }, []);

  //save chat when messages change
  useEffect(() => {
    if (!userId) return;

    if (userId && messages.length > 1) {
      saveChatToStorage(userId, messages);
    }
  }, [messages, userId]);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;

    const userMessage = {
      id: Date.now(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await chatbotAPI.sendMessage(userText);

      const replyText = response?.data?.reply || '';

      // ===============================
      // DETECT "UNKNOWN / FAIL ANSWER"
      // ===============================
      const isUnknown =
        replyText.toLowerCase().includes("contact a real agent") ||
        replyText.toLowerCase().includes("hubungi ejen sebenar") ||
        replyText.trim() === '';

      const botMessage = {
        id: Date.now() + 1,
        text: replyText || "I'm not sure about that.",
        sender: 'bot',
        timestamp: new Date(),
        showAgentButton: isUnknown,
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      // ===============================
      // API ERROR CASE
      // ===============================
      const errorMessage = {
        id: Date.now() + 1,
        text: t("api-error", "Sorry, I'm unable to process your request right now."),
        sender: 'bot',
        timestamp: new Date(),
        showAgentButton: true,
      };

      setMessages((prev) => [...prev, errorMessage]);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-76px)] flex flex-col overflow-hidden bg-gray-50">

      {/* HEADER */}
      {<div className="bg-white border-b border-gray-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("ai-chatbots-assistants", "AI-Chatbots & Assistants")}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {t("smart-customer-service", "Smart customer service available 24/7")}
        </p>
      </div> }

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg message-bubble ${
                message.sender === 'user'
                  ? 'message-user-bubble'
                  : 'message-bot-bubble'
              }`}
            >
              <div className='chat-bubble-content-container'>
              {message.text}
              {message.showAgentButton && (
                <button
                  onClick={() => navigate('/real-agent')}
                  className="flex mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  {t("contact-live-agent", "Contact Live Agent")}
                </button>
              )}
               </div>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="message-bubble message-bot-bubble">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="bg-white border-t border-gray-200 p-2 sticky bottom-0">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t("type-your-message", "Type your message here...")}
            className="form-input flex-1"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : t('send', 'Send')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatbotPage;