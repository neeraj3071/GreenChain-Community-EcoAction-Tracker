import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Lock, AlertCircle } from 'lucide-react';
import { authService } from '../services/auth';
import OTPVerification from '../components/OTPVerification';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [useOTPLogin, setUseOTPLogin] = useState(true); // 2FA compulsory by default

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First validate user credentials exist
      if (!formData.email || !formData.password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      // Show OTP verification screen; the OTP component sends the code once on mount.
      setShowOTP(true);
      setLoading(false);
      
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to send verification code. Please check your email.');
      setLoading(false);
    }
  };

  const handleOTPVerifySuccess = async (otp) => {
    setLoading(true);
    setError('');

    try {
      // Verify OTP and automatically login
      await authService.verifyLoginOTP(formData.email, otp);
      
      // Get user data and immediately redirect
      const userData = await authService.getCurrentUser();
      console.log('Login successful, redirecting...', userData);
      
      // Immediate redirect - no delay
      onLogin(userData);
      
    } catch (error) {
      console.error('Login with OTP failed:', error);
      
      // Enhanced error handling
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = '❌ Invalid verification code. Please check your email and try again.';
      } else if (error.response?.status === 404) {
        errorMessage = '❌ Account not found. Please check your email address.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleCancelOTP = () => {
    setShowOTP(false);
    setError('');
  };

  // Show OTP verification if needed
  if (showOTP) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <OTPVerification
          email={formData.email}
          purpose="login"
          onVerifySuccess={handleOTPVerifySuccess}
          onCancel={handleCancelOTP}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <Leaf className="h-12 w-12 text-green-primary" />
              <h2 className="text-3xl font-bold text-green-secondary">EcoStreak</h2>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Track your eco-actions and make a difference
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-primary focus:border-green-primary focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-primary focus:border-green-primary focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* 2FA Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🔐</span>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Two-Factor Authentication Required
                </p>
                <p className="text-xs text-blue-600">
                  We'll send a verification code to your email for security
                </p>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-primary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending code...' : 'Send Verification Code'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-green-primary hover:text-green-600"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;