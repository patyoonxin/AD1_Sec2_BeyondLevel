import React, { useState, useEffect } from "react";
import { faqAPI } from "../services/api";

function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [noResult, setNoResult] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError("");
      setNoResult(false);
      const response = await faqAPI.getAllFAQs();
      setFaqs(response.data || []);
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      setError("Unable to retrieve FAQ list. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = async () => {
    // A2: Empty Search Input
    if (!searchTerm.trim()) {
      setSearchError("Search field cannot be empty");
      return;
    }

    setSearchError("");
    setNoResult(false);
    setSearching(true);

    try {
      const response = await faqAPI.searchFAQs(searchTerm);
      const results = response.data || [];

      // A1: No Matching Results
      if (results.length === 0) {
        setNoResult(true);
        setFaqs([]);
      } else {
        setFaqs(results);
      }
    } catch (err) {
      console.error("Error searching FAQs:", err);
      setSearchError("Unable to process search request. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setSearchError("");
    setNoResult(false);
    fetchFAQs();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-xl text-gray-600">Loading FAQ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button onClick={fetchFAQs} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ❓ Frequently Asked Question
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to your common questions below
          </p>
        </div>

        {/* Search Bar with Button */}
        <div className="mb-2 max-w-2xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="🔍 Search questions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchError("");
                }}
                onKeyDown={handleKeyDown}
                className="form-input w-full"
                style={{
                  borderColor: searchError ? "#ef4444" : "",
                }}
              />
              {searchTerm && (
                <button
                  onClick={handleClear}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    fontSize: 18,
                  }}
                >
                  ×
                </button>
              )}
            </div>

            <button
              onClick={handleSearchClick}
              disabled={searching}
              className="btn btn-primary"
              style={{ whiteSpace: "nowrap", opacity: searching ? 0.7 : 1 }}
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {/* A2: Empty Search Error */}
          {searchError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
                padding: "8px 12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                fontSize: 13,
                color: "#dc2626",
              }}
            >
              ⚠️ {searchError}
            </div>
          )}

          {/* Result count */}
          {searchTerm && !searchError && !noResult && faqs.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Showing {faqs.length} result{faqs.length !== 1 ? "s" : ""} for "
              {searchTerm}"
            </p>
          )}
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-3 mt-6">
          {/* A1: No Matching Results */}
          {noResult ? (
            <div className="empty-state py-12">
              <div className="empty-state-icon">🤔</div>
              <p className="empty-state-text">No matching FAQ found</p>
              <p className="text-gray-500 text-sm mt-2">
                Try with different keywords
              </p>
              <button
                onClick={handleClear}
                className="btn btn-primary mt-4"
                style={{ fontSize: 13 }}
              >
                Show all FAQs
              </button>
            </div>
          ) : faqs.length === 0 ? (
            <div className="empty-state py-12">
              <div className="empty-state-icon">📭</div>
              <p className="empty-state-text">No FAQ available</p>
            </div>
          ) : (
            faqs.map((faq) => (
              <button
                key={faq.faq_id}
                onClick={() => toggleExpand(faq.faq_id)}
                className={`card-hover w-full text-left transition-all duration-200 ${
                  expandedId === faq.faq_id
                    ? "ring-2 ring-blue-500 ring-opacity-30"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    {faq.category && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          background: "#e8f0fb",
                          color: "#1a4fa0",
                          padding: "2px 8px",
                          borderRadius: 10,
                          display: "inline-block",
                          marginBottom: 6,
                        }}
                      >
                        {faq.category}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 text-left">
                      {faq.question_eng}
                    </h3>
                    {faq.question_malay && (
                      <p className="text-sm text-gray-500 mt-1 text-left">
                        {faq.question_malay}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-2xl text-blue-600 flex-shrink-0 transition-transform duration-300 ${
                      expandedId === faq.faq_id ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>

                {expandedId === faq.faq_id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed text-left">
                      {faq.answer_eng}
                    </p>
                    {faq.answer_malay && (
                      <p className="text-gray-500 leading-relaxed text-left mt-3 pt-3 border-t border-gray-100 text-sm italic">
                        {faq.answer_malay}
                      </p>
                    )}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Contact Support */}
        {faqs.length > 0 && !noResult && (
          <div className="max-w-3xl mx-auto mt-12 card bg-blue-50 border border-blue-200 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Didn't find the answer?
            </h3>
            <p className="text-gray-600 mb-4">
              Contact our support team for further assistance
            </p>
            <a
              href="mailto:support@kulai.gov.my"
              className="btn btn-primary inline-block"
            >
              📧 Contact Support
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default FAQPage;
