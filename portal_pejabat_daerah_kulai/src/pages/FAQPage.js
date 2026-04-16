import React, { useState, useEffect } from 'react';
import { faqAPI } from '../services/api';

function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await faqAPI.getAllFAQs();
      setFaqs(response.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.trim()) {
      try {
        const response = await faqAPI.searchFAQs(query);
        setFaqs(response.data);
      } catch (error) {
        console.error('Error searching FAQs:', error);
      }
    } else {
      fetchFAQs();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">❓ Frequently Asked Question</h1>
          <p className="text-lg text-gray-600">Find answers to your common questions below</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search questions..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-input w-full pl-10"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Showing {faqs.length} results for "{searchTerm}"
            </p>
          )}
        </div>

        {/* FAQs List */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.length === 0 ? (
            <div className="empty-state py-12">
              <div className="empty-state-icon">🤔</div>
              <p className="empty-state-text">No matching FAQs</p>
              <p className="text-gray-500 text-sm mt-2">Try with different keywords</p>
            </div>
          ) : (
            faqs.map((faq) => (
              <button
                key={faq.id}
                onClick={() => toggleExpand(faq.id)}
                className={`card-hover w-full text-left transition-all duration-200 ${
                  expandedId === faq.id ? 'ring-2 ring-blue-500 ring-opacity-30' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 text-left">
                      {faq.question}
                    </h3>
                  </div>
                  <span className={`text-2xl text-blue-600 flex-shrink-0 transition-transform duration-300 ${expandedId === faq.id ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>

                {/* Expanded Answer */}
                {expandedId === faq.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Contact Support */}
        {faqs.length > 0 && (
          <div className="max-w-3xl mx-auto mt-12 card bg-blue-50 border border-blue-200 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Didn't find the answer?</h3>
            <p className="text-gray-600 mb-4">Contact our support team for further assistance</p>
            <a href="mailto:support@kulai.gov.my" className="btn btn-primary inline-block">
              📧 Contact Support
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default FAQPage;
