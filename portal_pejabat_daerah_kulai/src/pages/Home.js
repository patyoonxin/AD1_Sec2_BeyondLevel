import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="hero">
        <div className="container-custom text-center fade-in">
          <h1 className="hero-title text-gradient">
            Portal Rasmi Pejabat Daerah Kulai
          </h1>
          <p className="hero-subtitle text-gray-600 max-w-2xl mx-auto">
            Modern, responsive and easily accessible district government service
          </p>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto text-sm">
            Get information, submit complaints and monitor status easily through our portal
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link to="/chatbot" className="btn btn-primary btn-lg">
              💬 Start Using Chatbot
            </Link>
            <Link to="/faq" className="btn btn-secondary btn-lg">
              ❓ Explore FAQ
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16 slide-in-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Features
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need in one platform
            </p>
          </div>

          <div className="feature-grid">
            {/* Feature 1 */}
            <div className="feature-card slide-in-left">
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">Smart AI Chatbot</h3>
              <p className="feature-description">
                Get instant answers from an AI-powered chatbot. Available 24/7 to answer your questions
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card slide-in-right">
              <div className="feature-icon">📝</div>
              <h3 className="feature-title">Complaint Management</h3>
              <p className="feature-description">
                Submit complaints easily and monitor their status in real-time without queuing
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card slide-in-left">
              <div className="feature-icon">❓</div>
              <h3 className="feature-title">Knowledge Base</h3>
              <p className="feature-description">
                Find answers to common questions and complete service guides easily
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card slide-in-right">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure & Trusted</h3>
              <p className="feature-description">
                Your information is protected with enterprise-level security standards
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Nonstop Service</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">&lt;1min</div>
              <div className="text-blue-100">Fast Response</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">+1000</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">99%</div>
              <div className="text-blue-100">User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            How the System Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="card text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Register</h3>
                <p className="text-sm text-gray-600">Create account with your email</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-8 w-8 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
            </div>

            <div className="relative">
              <div className="card text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Ask</h3>
                <p className="text-sm text-gray-600">Use chatbot or search FAQ</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-8 w-8 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
            </div>

            <div className="relative">
              <div className="card text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Submit</h3>
                <p className="text-sm text-gray-600">Create or track complaints</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-8 w-8 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
            </div>

            <div className="card text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full text-xl font-bold mb-4">
                ✓
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Done</h3>
              <p className="text-sm text-gray-600">Receive maximum support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of users who already enjoy the convenience of our service
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            ✨ Register Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Official Portal</h3>
              <p className="text-sm">Serving wholeheartedly for your convenience</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/chatbot" className="hover:text-white transition-colors">Chatbot</Link></li>
                <li><Link to="/complaints" className="hover:text-white transition-colors">Complaints</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>📧 support@kulai.gov.my</li>
                <li>📞 +60-7-1234-5678</li>
                <li>🕐 Monday - Friday, 08:00 - 17:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Kulai District Office. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
