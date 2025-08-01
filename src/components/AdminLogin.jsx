import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';

function AdminLogin({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleLogin = async (retries = 2) => {
  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  setIsLoading(true);
  try {
    console.log('Admin login request:', { email, attempt: 3 - retries });
    const res = await api.post('/api/admin/login', { email: email.trim(), password: password.trim() });
    console.log('API Response:', res.data);
    const { token, userId, isAdmin, profile } = res.data;
    const isNewUser = !profile || !profile.phone;
    console.log('isNewUser:', isNewUser, 'Profile:', profile);
    setToken(token, userId, isAdmin, 'admin');
    localStorage.setItem('isNewUser', isNewUser.toString());
    localStorage.setItem('loginType', 'admin');
    setErrors({});
    setApiError('');
    setForgotPasswordMessage('');
    setForgotPasswordError('');
    const redirectRoute = isNewUser ? '/admin/profile' : '/admin/profile/preview';
    console.log('Redirecting to:', redirectRoute);
    navigate(redirectRoute, { replace: true });
    console.log('Navigation triggered to:', redirectRoute);
  } catch (err) {
    if (retries > 0 && !err.response) {
      console.warn('Retrying login due to network error:', { retriesLeft: retries - 1 });
      return setTimeout(() => handleLogin(retries - 1), 1000);
    }
    const errorMsg = err.response?.data?.message || err.message || 'Failed to log in due to server error';
    console.error('Admin login error:', { status: err.response?.status, message: errorMsg });
    setApiError(errorMsg);
  } finally {
    setIsLoading(false);
  }
};

  const handleForgotPassword = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setForgotPasswordError('Please enter a valid email in the login form');
      setErrors({ ...errors, email: 'Please enter a valid email' });
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/api/admin/forgot-password', { email: email.trim() });
      setForgotPasswordMessage('Password reset email sent. Please check your inbox.');
      setForgotPasswordError('');
      setErrors({});
      setApiError('');
    } catch (err) {
      const errorMsg = err.response?.data.message || 'Failed to send reset email';
      console.error('Forgot password error:', err.response?.status, errorMsg);
      setForgotPasswordError(errorMsg);
      setForgotPasswordMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full min-w-[30vw] min-h-[65vh] sm:max-w-md lg:max-w-[1000px] bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-8">
        <div className="max-w-md lg:max-w-lg mx-auto">
          <div className="flex flex-col items-center mb-6">
            <div className="w-full flex justify-center mb-3">
              <img
                src="/logo.webp"
                alt="Centennial Infotech Logo"
                className="h-14 sm:h-16 lg:h-20 w-auto max-w-[80%] object-contain"
              />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Centennial Infotech</h1>
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 mb-6 text-center">Admin Login</h2>
          {apiError && <p className="text-red-500 text-sm text-center mb-4">{apiError}</p>}
          {forgotPasswordMessage && <p className="text-green-500 text-sm text-center mb-4">{forgotPasswordMessage}</p>}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <div className="text-right mb-4">
            <button
              onClick={handleForgotPassword}
              className="text-blue-600 text-sm font-semibold hover:underline"
              disabled={isLoading}
            >
              Forgot Password?
            </button>
          </div>
          {forgotPasswordError && (
            <p className="text-red-500 text-sm mb-4">{forgotPasswordError}</p>
          )}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <ClipLoader size={18} color="#fff" />
                <span className="ml-2">Logging in...</span>
              </div>
            ) : (
              'Login'
            )}
          </button>
          <p className="text-center mt-4 text-sm text-gray-600">
            Don’t have an account?{' '}
            <Link to="/admin/signup" className="text-blue-600 font-semibold hover:underline">
              Admin Signup
            </Link>
          </p>
          {apiError === 'Email not verified' && (
            <p className="text-center mt-2 text-sm text-gray-600">
              <Link to="/verify-otp" className="text-blue-600 font-semibold hover:underline">
                Verify OTP
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
