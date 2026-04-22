import React, { useState, useEffect, useRef } from 'react';
import { chatbotAPI } from '../services/api';

function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! 👋 How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await chatbotAPI.sendMessage(inputValue);
      const botMessage = {
        id: messages.length + 2,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: 'Sorry, an error occurred. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">💬 AI-Chatbots & Assistants</h1>
        <p className="text-sm text-gray-600 mt-1">Smart customer service available 24/7</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg message-bubble ${
                message.sender === 'user'
                  ? 'message-user-bubble'
                  : 'message-bot-bubble'
              }`}
            >
              <p>{message.text}</p>
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
          <div className="flex justify-start fade-in">
            <div className="message-bubble message-bot-bubble">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot" style={{ animationDelay: '0.1s' }}></div>
                <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 p-6">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your question..."
            className="form-input flex-1"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? '⏳' : '📤 Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatbotPage;
