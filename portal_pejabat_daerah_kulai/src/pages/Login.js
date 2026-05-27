import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

function Login({ setUser }) {
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(phoneNo, password);
      const user = response.data.user;

      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);

      // Redirect admin users to the admin dashboard
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/chatbot');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8 slide-in-left">
          <div className="text-4xl mb-4">🏛️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p className="text-gray-600">Sign in to the Official Portal of Kulai District Office</p>
        </div>

        {/* Form Card */}
        <div className="card fade-in">
          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label">Your Phone Number</label>
              <input
                type="text"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                className="form-input"
                placeholder="0123456789"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-gray-300"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="ml-2 text-sm text-blue-600 hover:underline"
                >
                  Forgot Password?
                  </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Processing...</span>
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Admin hint */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
            <strong>Admin login:</strong> admin@kulai.gov.my &nbsp;/&nbsp; admin123
          </div>

          <div className="divider"></div>

          {/* Register link */}
          <p className="text-center text-gray-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">
              Register Here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Need help?{' '}
          <a href="mailto:support@kulai.gov.my" className="text-blue-600 hover:text-blue-700 font-medium">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
