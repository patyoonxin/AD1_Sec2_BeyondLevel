import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

function Login({ setUser }) {
  const [isAdmin, setIsAdmin]   = useState(false);
  const [identifier, setIdentifier] = useState(''); // phone or email
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = isAdmin
        ? { email: identifier, password }
        : { phone_number: identifier, password };

      const response = await authAPI.login(payload);
      const user = response.data.user;

      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      if (user.role?.toLowerCase() === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8 slide-in-left">
          <div className="text-4xl mb-4">🏛️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p className="text-gray-600">Sign in to the Official Portal of Kulai District Office</p>
        </div>

        <div className="card fade-in">
          {error && (
            <div className="alert alert-error mb-6"><span>{error}</span></div>
          )}

          {/* Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => { setIsAdmin(false); setIdentifier(''); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                !isAdmin ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => { setIsAdmin(true); setIdentifier(''); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                isAdmin ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Dynamic field */}
            <div className="form-group">
              <label className="form-label">
                {isAdmin ? 'Email Address' : 'Your Phone Number'}
              </label>
              <input
                type={isAdmin ? 'email' : 'text'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="form-input"
                placeholder={isAdmin ? 'admin@example.com' : '+60123456789'}
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

            <div className="flex items-center">
              <input type="checkbox" id="remember" className="rounded border-gray-300" />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer">
                Remember me
              </label>
            </div>

            <div>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

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
              ) : 'Sign In'}
            </button>
          </form>

          {/* Show admin hint only on admin tab */}
          {isAdmin && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
              <strong>Admin login:</strong> pejabatdaerahkulaiwebsite@gmail.com &nbsp;/&nbsp; admin123
            </div>
          )}

          <div className="divider"></div>

          <p className="text-center text-gray-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">
              Register Here
            </Link>
          </p>
        </div>

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